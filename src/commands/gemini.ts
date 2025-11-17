import { cli } from "../cli.js";
import prettier from "../plugins/prettier.js";
import { unminify } from "../unminify.js";
import babel from "../plugins/babel/babel.js";
import { verbose } from "../verbose.js";
import { geminiRename } from "../plugins/gemini-rename.js";
import { env } from "../env.js";
import { DEFAULT_CONTEXT_WINDOW_SIZE } from "./default-args.js";
import { parseNumber } from "../number-utils.js";
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

export const azure = cli()
  .name("gemini")
  .description("Use Google Gemini/AIStudio API to unminify code")
  .option("-m, --model <model>", "The model to use", "gemini-1.5-flash")
  .option("-o, --outputDir <output>", "The output directory", "output")
  .option(
    "--context-size <contextSize>",
    "The context size to use for the LLM",
    `${DEFAULT_CONTEXT_WINDOW_SIZE}`
  )
  .option(
    "-k, --apiKey <apiKey>",
    "The Google Gemini/AIStudio API key. Alternatively use GEMINI_API_KEY environment variable"
  )
  .option("--verbose", "Show verbose output")
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

    const apiKey = opts.apiKey ?? env("GEMINI_API_KEY");
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
          provider: "gemini",
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
          provider: "gemini",
          model: opts.model,
          batchSize: maxConcurrent,
          contextWindowSize,
          turbo: opts.turbo ?? false
        });

        printDryRunResults(filename, {
          provider: "gemini",
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
      const iterations = 1; // Gemini doesn't support refine mode yet
      const progressManager = getGlobalProgressManager();
      const displayManager = getDisplayManager();

      progressManager.initialize(estimate, iterations);

      // Show iteration header
      displayManager.showIterationHeader(1, iterations);
      progressManager.startIteration(1);

      await unminify(filename, opts.outputDir, [
        babel,
        geminiRename({
          apiKey,
          model: opts.model,
          contextWindowSize,
          turbo: opts.turbo,
          maxConcurrent,
          minBatchSize: parseInt(opts.minBatchSize, 10),
          maxBatchSize: parseInt(opts.maxBatchSize, 10),
          dependencyMode,
          checkpointMetadata: {
            originalFile: filename,
            originalProvider: "gemini",
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
