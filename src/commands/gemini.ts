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

      await unminify(filename, opts.outputDir, [
        babel,
        geminiRename({
          apiKey,
          model: opts.model,
          contextWindowSize,
          turbo: opts.turbo,
          maxConcurrent,
          dependencyMode
        }),
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
