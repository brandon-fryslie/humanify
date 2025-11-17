import { cli } from "../cli.js";
import prettier from "../plugins/prettier.js";
import { unminify } from "../unminify.js";
import babel from "../plugins/babel/babel.js";
import { openaiRename } from "../plugins/openai/openai-rename.js";
import { verbose } from "../verbose.js";
import { env } from "../env.js";
import { parseNumber } from "../number-utils.js";
import { DEFAULT_CONTEXT_WINDOW_SIZE } from "./default-args.js";
import { instrumentation } from "../instrumentation.js";
import { getCacheSize } from "../plugins/local-llm-rename/dependency-cache.js";
import { dryRun, printDryRunResults } from "../dry-run.js";
import { memoryMonitor } from "../memory-monitor.js";
import { validateOutput, printValidationResults } from "../output-validator.js";
import * as fs from "fs/promises";
import { getCheckpointId, loadCheckpoint, deleteCheckpoint } from "../checkpoint.js";
import prompts from "prompts";
import { estimateWork } from "../estimate-work.js";
import { getGlobalProgressManager, resetGlobalProgressManager } from "../global-progress.js";
import { getDisplayManager, resetDisplayManager } from "../display-manager.js";
import path from "path";

/**
 * Discover all .js files in output directory (excluding sourcemaps).
 * Used for refinement passes to find files produced by previous pass.
 *
 * @param outputDir - Directory to search for .js files
 * @returns Array of absolute paths to .js files, sorted alphabetically
 * @throws Error if directory cannot be read
 */
export async function discoverOutputFiles(outputDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(outputDir, { withFileTypes: true });
    const jsFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.map'))
      .map(entry => path.join(outputDir, entry.name))
      .sort(); // Deterministic ordering

    return jsFiles;
  } catch (error) {
    throw new Error(`Failed to discover output files in ${outputDir}: ${error}`);
  }
}

export const openai = cli()
  .name("openai")
  .description("Use OpenAI's API to unminify code")
  .option("-m, --model <model>", "The model to use", "gpt-4o-mini")
  .option("-o, --outputDir <output>", "The output directory", "output")
  .option(
    "-k, --apiKey <apiKey>",
    "The OpenAI API key. Alternatively use OPENAI_API_KEY environment variable"
  )
  .option(
    "--baseURL <baseURL>",
    "The OpenAI base server URL.",
    env("OPENAI_BASE_URL") ?? "https://api.openai.com/v1"
  )
  .option("--verbose", "Show verbose output")
  .option(
    "--context-size <contextSize>",
    "The context size to use for the LLM",
    `${DEFAULT_CONTEXT_WINDOW_SIZE}`
  )
  .option(
    "--turbo",
    "Enable turbo mode: optimal ordering via information-flow graph + parallel API calls"
  )
  .option(
    "--max-concurrent <count>",
    "Maximum concurrent API requests in turbo mode",
    "10"
  )
  .option(
    "--min-batch-size <size>",
    "Minimum batch size for parallelization (merges small batches for better throughput)",
    "3"
  )
  .option(
    "--max-batch-size <size>",
    "Maximum batch size to prevent memory spikes (splits large batches)",
    "100"
  )
  .option(
    "--dependency-mode <mode>",
    "Dependency graph strictness: strict (all deps), balanced (direct only), relaxed (refs only)",
    "balanced"
  )
  .option(
    "--refine",
    "Run a second pass with 2x parallelism to refine names (doubles cost, improves quality)"
  )
  .option("--perf", "Enable detailed performance instrumentation and timing")
  .option("--perf-json <file>", "Export performance data to JSON file")
  .option("--dry-run", "Estimate cost and time without making API calls")
  .option(
    "--max-memory <mb>",
    "Maximum memory usage in MB (default: 4096)",
    "4096"
  )
  .option("--validate", "Validate output is syntactically correct (default: true)", true)
  .option("--no-validate", "Skip output validation")
  .option(
    "--chunk-size <size>",
    "Split files larger than this (chars). Set to 0 to disable chunking.",
    "100000"
  )
  .option(
    "--no-chunking",
    "Disable automatic file chunking"
  )
  .option(
    "--debug-chunks",
    "Add comment markers between chunks for debugging",
    false
  )
  .argument("input", "The input minified Javascript file")
  .action(async (filename, opts) => {
    // Setup memory monitoring
    const maxMemoryMB = parseNumber(opts.maxMemory);
    memoryMonitor.setLimit(maxMemoryMB);
    memoryMonitor.checkpoint("initial");

    // Setup instrumentation
    instrumentation.setEnabled(opts.perf ?? false);

    if (opts.verbose) {
      verbose.enabled = true;
    }

    const apiKey = opts.apiKey ?? env("OPENAI_API_KEY");
    const baseURL = opts.baseURL;
    const contextWindowSize = parseNumber(opts.contextSize);
    const maxConcurrent = parseNumber(opts.maxConcurrent);
    const dependencyMode = opts.dependencyMode as
      | "strict"
      | "balanced"
      | "relaxed";

    try {
      // Read input for validation later
      const inputCode = await fs.readFile(filename, "utf-8");

      // Check for existing checkpoint BEFORE dry-run check
      // This allows users to resume OR delete checkpoints even in dry-run mode
      const checkpointId = getCheckpointId(inputCode);
      const checkpoint = loadCheckpoint(checkpointId);

      if (checkpoint && checkpoint.originalFile) {
        console.log(`\nFound checkpoint for this file:`);
        console.log(`   Progress: ${checkpoint.completedBatches}/${checkpoint.totalBatches} batches (${Math.round(checkpoint.completedBatches / checkpoint.totalBatches * 100)}%)`);
        console.log(`   Created: ${new Date(checkpoint.timestamp).toLocaleString()}`);

        // Warn if args differ
        const currentArgs = {
          provider: "openai",
          model: opts.model,
          turbo: opts.turbo,
          maxConcurrent,
          dependencyMode
        };

        const checkpointArgs = checkpoint.originalArgs ? {
          provider: checkpoint.originalProvider,
          model: checkpoint.originalModel,
          turbo: checkpoint.originalArgs.turbo,
          maxConcurrent: checkpoint.originalArgs.maxConcurrent,
          dependencyMode: checkpoint.originalArgs.dependencyMode
        } : null;

        if (checkpointArgs && JSON.stringify(checkpointArgs) !== JSON.stringify(currentArgs)) {
          console.log(`\nCLI arguments differ from checkpoint:`);
          console.log(`   Checkpoint: provider=${checkpointArgs.provider}, model=${checkpointArgs.model}, turbo=${checkpointArgs.turbo}, maxConcurrent=${checkpointArgs.maxConcurrent}, dependencyMode=${checkpointArgs.dependencyMode}`);
          console.log(`   Current:    provider=${currentArgs.provider}, model=${currentArgs.model}, turbo=${currentArgs.turbo}, maxConcurrent=${currentArgs.maxConcurrent}, dependencyMode=${currentArgs.dependencyMode}`);
          console.log(`   Resume will use the checkpoint's transformed code but continue with current settings\n`);
        }

        const answer = await prompts({
          type: 'select',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { title: 'Resume from checkpoint', value: 'resume' },
            { title: 'Start fresh (delete checkpoint)', value: 'fresh' },
            { title: 'Cancel', value: 'cancel' }
          ]
        });

        if (answer.action === 'cancel') {
          console.log('Cancelled');
          process.exit(0);
        }

        if (answer.action === 'fresh') {
          deleteCheckpoint(checkpointId);
          console.log('Checkpoint deleted, starting fresh...\n');
        } else {
          console.log('Resuming from checkpoint...\n');
          // The checkpoint system will automatically resume
        }
      }

      // Handle dry-run mode AFTER reading the file (for analysis)
      if (opts.dryRun) {
        const result = await dryRun(filename, {
          provider: "openai",
          model: opts.model,
          batchSize: maxConcurrent,
          contextWindowSize,
          turbo: opts.turbo ?? false
        });

        printDryRunResults(filename, {
          provider: "openai",
          model: opts.model,
          batchSize: maxConcurrent,
          contextWindowSize,
          turbo: opts.turbo ?? false
        }, result);

        // In dry-run mode, still process the file but skip LLM rename
        // This allows tests to verify output structure without making API calls
        console.log("\n=== Dry-run: Processing without LLM calls ===\n");

        // Create a no-op rename plugin (passes through unchanged)
        const noopRename = async (code: string) => code;
        Object.defineProperty(noopRename, 'name', { value: 'noopRename' });

        await unminify(filename, opts.outputDir, [
          babel,
          noopRename,
          prettier
        ], {
          chunkSize: parseInt(opts.chunkSize, 10),
          enableChunking: opts.chunking !== false,
          debugChunks: opts.debugChunks
        });

        return;
      }

      // Estimate work BEFORE any API calls
      console.log("\n=== Estimating Work ===\n");
      const estimate = await estimateWork(filename, opts.outputDir, {
        turbo: opts.turbo,
        maxConcurrent,
        dependencyMode,
        minBatchSize: parseInt(opts.minBatchSize, 10),
        maxBatchSize: parseInt(opts.maxBatchSize, 10),
        chunkSize: parseInt(opts.chunkSize, 10),
        enableChunking: opts.chunking !== false
      });

      // Initialize progress tracking
      const iterations = opts.refine ? 2 : 1;
      const progressManager = getGlobalProgressManager();
      const displayManager = getDisplayManager();

      progressManager.initialize(estimate, iterations);

      // Pass 1: Initial rename
      console.log("\n=== Pass 1: Initial Deobfuscation ===\n");
      displayManager.showIterationHeader(1, iterations);
      progressManager.startIteration(1);

      await unminify(filename, opts.outputDir, [
        babel,
        openaiRename({
          apiKey,
          baseURL,
          model: opts.model,
          contextWindowSize,
          turbo: opts.turbo,
          maxConcurrent,
          minBatchSize: parseInt(opts.minBatchSize, 10),
          maxBatchSize: parseInt(opts.maxBatchSize, 10),
          dependencyMode,
          checkpointMetadata: {
            originalFile: filename,
            originalProvider: "openai",
            originalModel: opts.model,
            originalArgs: opts
          },
          progressManager,
          displayManager
        }),
        prettier
      ], {
        chunkSize: parseInt(opts.chunkSize, 10),
        enableChunking: opts.chunking !== false,
        debugChunks: opts.debugChunks,
        progressManager,
        displayManager
      });

      console.log("\n=== Pass 1 Complete ===\n");

      // Pass 2: Refinement (if enabled)
      if (opts.refine) {
        console.log("=== Pass 2: Refinement ===\n");
        displayManager.showIterationHeader(2, iterations);
        progressManager.startIteration(2);

        // Discover all files produced by Pass 1
        const pass1OutputFiles = await discoverOutputFiles(opts.outputDir);

        if (pass1OutputFiles.length === 0) {
          throw new Error(`No output files found in ${opts.outputDir} for refinement pass`);
        }

        console.log(`Refining ${pass1OutputFiles.length} file(s)...\n`);

        // Process each file independently
        for (let i = 0; i < pass1OutputFiles.length; i++) {
          const file = pass1OutputFiles[i];
          const filename = path.basename(file);

          console.log(`\n[File ${i + 1}/${pass1OutputFiles.length}] ${filename}`);

          await unminify(file, opts.outputDir, [
            babel, // Re-run babel with better names from Pass 1
            openaiRename({
              apiKey,
              baseURL,
              model: opts.model,
              contextWindowSize,
              turbo: opts.turbo,
              maxConcurrent: maxConcurrent * 2, // 2x parallelism for Pass 2
              minBatchSize: parseInt(opts.minBatchSize, 10),
              maxBatchSize: parseInt(opts.maxBatchSize, 10),
              dependencyMode: "relaxed", // More aggressive parallelism in Pass 2
              checkpointMetadata: {
                originalFile: filename,
                originalProvider: "openai",
                originalModel: opts.model,
                originalArgs: opts,
                refinementPass: 2
              },
              progressManager,
              displayManager
            }),
            prettier
          ], {
            chunkSize: parseInt(opts.chunkSize, 10),
            enableChunking: opts.chunking !== false,
            debugChunks: opts.debugChunks,
            skipWebcrack: true, // CRITICAL: Skip webcrack in refinement!
            progressManager,
            displayManager
          });
        }

        console.log("\n=== Pass 2 Complete ===\n");
      }

      console.log("=== All Processing Complete ===\n");

      // Stop display and cleanup
      progressManager.finish();
      displayManager.stop();

      // Print performance summary if enabled
      instrumentation.printSummary();

      // Show cache size if perf is enabled
      if (opts.perf) {
        const cacheSize = await getCacheSize();
        const cacheMB = (cacheSize / 1024 / 1024).toFixed(2);
        console.log(`Cache size: ${cacheMB}MB`);
      }

      // Export JSON if requested
      if (opts.perfJson) {
        const fs = await import("fs/promises");
        await fs.writeFile(opts.perfJson, instrumentation.exportJSON());
        console.log(`Performance data exported to ${opts.perfJson}`);
      }

      // Memory report
      memoryMonitor.checkpoint("complete");
      if (opts.perf) {
        memoryMonitor.report();
      }

      // Validate output if requested
      if (opts.validate) {
        // Find output file (should be in outputDir with same name structure)
        const path = await import("path");
        const basename = path.basename(filename);
        const outputPath = path.join(opts.outputDir, basename);

        try {
          const outputCode = await fs.readFile(outputPath, "utf-8");
          const validationResult = await validateOutput(inputCode, outputCode);
          printValidationResults(validationResult);

          if (validationResult.status === "FAIL") {
            console.error("❌ Output validation failed");
            process.exit(1);
          }
        } catch (error: any) {
          console.warn(`⚠️  Could not validate output: ${error.message}`);
        }
      }
    } finally {
      // Cleanup progress tracking
      resetGlobalProgressManager();
      resetDisplayManager();

      instrumentation.reset();
      memoryMonitor.reset();
    }
  });
