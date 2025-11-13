import { cli } from "../cli.js";
import { llama } from "../plugins/local-llm-rename/llama.js";
import { DEFAULT_MODEL } from "../local-models.js";
import { unminify } from "../unminify.js";
import prettier from "../plugins/prettier.js";
import babel from "../plugins/babel/babel.js";
import { localReanme } from "../plugins/local-llm-rename/local-llm-rename.js";
import { verbose } from "../verbose.js";
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

export const local = cli()
  .name("local")
  .description("Use a local LLM to unminify code")
  .showHelpAfterError(true)
  .option("-m, --model <model>", "The model to use", DEFAULT_MODEL)
  .option("-o, --outputDir <output>", "The output directory", "output")
  .option(
    "-s, --seed <seed>",
    "Seed for the model to get reproduceable results (leave out for random seed)"
  )
  .option("--disableGpu", "Disable GPU acceleration")
  .option("--verbose", "Show verbose output")
  .option(
    "--context-size <contextSize>",
    "The context size to use for the LLM",
    `${DEFAULT_CONTEXT_WINDOW_SIZE}`
  )
  .option(
    "--turbo",
    "Enable turbo mode: optimal ordering via information-flow graph + parallel batch processing"
  )
  .option(
    "--max-concurrent <count>",
    "Maximum concurrent inference tasks in turbo mode",
    "4"
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

    verbose.log("Starting local inference with options: ", opts);

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
          provider: "local",
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
          provider: "local",
          model: opts.model,
          batchSize: maxConcurrent,
          contextWindowSize,
          turbo: opts.turbo ?? false
        });

        printDryRunResults(filename, {
          provider: "local",
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

      const prompt = await llama({
        model: opts.model,
        disableGpu: opts.disableGpu,
        seed: opts.seed ? parseInt(opts.seed) : undefined
      });
      await unminify(filename, opts.outputDir, [
        babel,
        localReanme(
          prompt,
          contextWindowSize,
          opts.turbo,
          maxConcurrent,
          dependencyMode,
          {
            originalFile: filename,
            originalProvider: "local",
            originalModel: opts.model,
            originalArgs: opts
          }
        ),
        prettier
      ], {
        chunkSize: parseInt(opts.chunkSize, 10),
        enableChunking: opts.chunking !== false,
        debugChunks: opts.debugChunks
      });

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
      instrumentation.reset();
      memoryMonitor.reset();
    }
  });
