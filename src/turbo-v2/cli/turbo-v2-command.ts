/**
 * TURBO V2 CLI INTEGRATION
 *
 * Entry point for --turbo-v2 mode
 * Integrates multi-pass orchestrator with Commander.js CLI
 */

import { MultiPass } from "../orchestrator/multi-pass.js";
import { Vault } from "../vault/vault.js";
import { VaultEviction, DEFAULT_EVICTION_CONFIG } from "../vault/eviction.js";
import { Ledger } from "../ledger/ledger.js";
import { PassConfig, JobConfig } from "../ledger/events.js";
import { ProgressRenderer } from "../ui/progress-renderer.js";
import { MetricsCollector } from "../metrics/metrics-collector.js";
import { ProcessorFunction } from "../orchestrator/pass-engine.js";
import { parsePassArgs, validatePassFlags } from "./pass-parser.js";
import { getPreset, isValidPreset } from "./presets.js";
import { createHash } from "crypto";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

/**
 * Options for turbo-v2 execution
 */
export interface TurboV2Options {
  inputPath: string;
  outputDir: string;
  provider: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;

  // Pass configuration
  passes?: number;
  pass?: string[];
  preset?: string;

  // Checkpointing
  checkpointDir?: string;
  fresh?: boolean;

  // Vault
  vaultMaxSize?: number; // Max vault size in bytes (default: 1GB)

  // UI
  quiet?: boolean;
  verbose?: boolean;
  noColor?: boolean;

  // Advanced
  contextSize?: number;
  maxConcurrent?: number;
}

/**
 * Create a processor function for the given provider
 *
 * Note: This is a simplified stub for Sprint 10 CLI integration.
 * Full processor implementations (Gap 6) are deferred to later sprints.
 * For now, this delegates to existing OpenAI rename logic.
 */
async function createProcessor(options: TurboV2Options): Promise<ProcessorFunction> {
  const { provider, model, apiKey, baseURL, contextSize } = options;

  if (provider === "openai") {
    // Import OpenAI SDK
    const { default: OpenAI } = await import("openai");

    const openai = new OpenAI({
      apiKey: apiKey!,
      baseURL: baseURL,
    });

    const modelName = model ?? "gpt-4o-mini";

    // Return processor function
    return async (name: string, context: string): Promise<{ newName: string; confidence: number }> => {
      try {
        // Build prompt
        const prompt = `You are renaming a JavaScript identifier in deobfuscated code.

Current name: ${name}
Surrounding code:
${context}

Provide a semantic variable name that describes what this represents.
Respond with JSON: { "name": "<new_name>", "confidence": <0-1> }`;

        // Call OpenAI
        const response = await openai.chat.completions.create({
          model: modelName,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 100,
          response_format: { type: "json_object" },
        });

        // Parse response
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response from OpenAI");
        }

        const parsed = JSON.parse(content);
        return {
          newName: parsed.name || name, // Fall back to original if missing
          confidence: parsed.confidence ?? 0.5,
        };
      } catch (error: any) {
        console.warn(`Failed to rename ${name}: ${error.message}`);
        // Return unchanged on error
        return {
          newName: name,
          confidence: 0,
        };
      }
    };
  } else if (provider === "gemini") {
    throw new Error("Gemini provider not yet supported in turbo-v2 mode. Use --provider openai for now.");
  } else if (provider === "local") {
    throw new Error("Local provider not yet supported in turbo-v2 mode. Use --provider openai for now.");
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Execute turbo-v2 pipeline
 */
export async function executeTurboV2(options: TurboV2Options): Promise<void> {
  // Validate flag combinations
  validatePassFlags({
    passes: options.passes,
    pass: options.pass,
    preset: options.preset,
  });

  // Determine pass configuration
  const passConfigs = determinePassConfigs(options);

  // Setup infrastructure
  const checkpointDir = options.checkpointDir ?? ".humanify-checkpoints";
  const vaultDir = ".humanify-cache/vault";
  const jobId = generateJobId(options.inputPath, passConfigs);
  const jobDir = join(checkpointDir, jobId);

  // Create job directory if it doesn't exist
  if (!existsSync(jobDir)) {
    mkdirSync(jobDir, { recursive: true });
  }

  // Initialize vault and eviction
  const vault = new Vault(vaultDir);
  const eviction = new VaultEviction(vaultDir, {
    maxSize: options.vaultMaxSize ?? DEFAULT_EVICTION_CONFIG.maxSize,
  });

  // Check vault size and evict if needed
  if (eviction.needsEviction()) {
    if (!options.quiet) {
      console.log("[turbo-v2] Vault size exceeded threshold, running eviction...");
    }
    const evictionStats = eviction.evict();
    if (!options.quiet) {
      console.log(`[turbo-v2] ${VaultEviction.formatStats(evictionStats)}`);
    }
  }

  // Display vault stats if verbose
  if (options.verbose) {
    const stats = eviction.getStats();
    console.log(`[turbo-v2] Vault: ${VaultEviction.formatSize(stats.vaultSize)} / ${stats.entryCount} entries`);
  }

  // Initialize other components
  const ledger = new Ledger(join(jobDir, "events.jsonl"));
  const metrics = new MetricsCollector();
  const renderer = new ProgressRenderer({
    quiet: options.quiet ?? false,
    noColor: options.noColor ?? false,
  });

  // Build job config
  const jobConfig: JobConfig = {
    inputPath: options.inputPath,
    outputPath: options.outputDir,
    passes: passConfigs.length,
    provider: options.provider,
    model: options.model,
    concurrency: options.maxConcurrent,
    checkpointDir,
  };

  // Create processor function
  const processor = await createProcessor(options);

  // Create multi-pass orchestrator
  const multiPass = new MultiPass(vault, ledger, {
    passes: passConfigs,
    jobId,
    inputPath: options.inputPath,
    outputDir: options.outputDir,
    snapshotsDir: join(jobDir, "snapshots"),
    maxGlossarySize: 100,
    onProgress: (passNumber, processed, total) => {
      renderer.updatePass(passNumber, processed, total);
    },
  });

  try {
    // Display initial info
    if (!options.quiet) {
      console.log(`\n[turbo-v2] Starting job: ${jobId}`);
      console.log(`  Input: ${options.inputPath}`);
      console.log(`  Passes: ${passConfigs.length}`);
      console.log(`  Provider: ${options.provider} (${options.model ?? "default"})`);
      console.log();
    }

    // Execute pipeline
    renderer.start();
    const result = await multiPass.execute(processor);
    renderer.complete();

    // Display summary
    if (!options.quiet) {
      console.log(`\n[turbo-v2] Job complete`);
      console.log(`  Output: ${result.finalSnapshotPath}`);
      console.log(`  Duration: ${(result.totalDurationMs / 1000).toFixed(1)}s`);
      console.log(`  Success: ${result.success}`);
    }

    // Export metrics if verbose
    if (options.verbose) {
      const metricsPath = join(jobDir, "logs", "metrics.jsonl");
      metrics.export(metricsPath);
      console.log(`\n  Metrics exported to: ${metricsPath}`);
    }

    if (!result.success) {
      process.exit(1);
    }
  } catch (error: any) {
    renderer.error(error.message);

    if (options.verbose && error.stack) {
      console.error(`\nStack trace:\n${error.stack}`);
    }

    throw error;
  }
}

/**
 * Determine pass configuration from CLI options
 */
function determinePassConfigs(options: TurboV2Options): PassConfig[] {
  // Priority: --pass > --preset > --passes > default

  // Case 1: Explicit --pass arguments
  if (options.pass && options.pass.length > 0) {
    return parsePassArgs(options.pass);
  }

  // Case 2: Preset
  if (options.preset) {
    const preset = getPreset(options.preset);
    if (!preset) {
      throw new Error(
        `Unknown preset: "${options.preset}". Use --help to see available presets.`
      );
    }
    return preset;
  }

  // Case 3: --passes N (generate N identical rename passes)
  if (options.passes && options.passes > 0) {
    const passes: PassConfig[] = [];
    for (let i = 0; i < options.passes; i++) {
      passes.push({
        processor: "rename",
        mode: "parallel",
        concurrency: options.maxConcurrent ?? 50,
      });
    }
    return passes;
  }

  // Case 4: Default (fast preset = 2-pass parallel)
  return getPreset("fast")!;
}

/**
 * Generate unique job ID from input and configuration
 */
function generateJobId(inputPath: string, passConfigs: PassConfig[]): string {
  // Read input file to get content hash
  const inputContent = readFileSync(inputPath, "utf-8");
  const inputHash = createHash("sha256")
    .update(inputContent)
    .digest("hex")
    .substring(0, 12);

  // Hash pass configuration
  const configStr = JSON.stringify(passConfigs);
  const configHash = createHash("sha256")
    .update(configStr)
    .digest("hex")
    .substring(0, 8);

  // Timestamp for uniqueness
  const timestamp = Date.now().toString(36);

  return `${inputHash}-${configHash}-${timestamp}`;
}
