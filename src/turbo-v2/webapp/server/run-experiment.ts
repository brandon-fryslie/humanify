/**
 * Execute turbo-v2 experiment with direct TypeScript integration
 *
 * This module calls executeTurboV2() directly instead of using shell commands,
 * tracks job directories for SSE progress, and extracts metrics from the Ledger.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { executeTurboV2, TurboV2Options, TurboV2Result } from "../../../turbo-v2/cli/turbo-v2-command.js";
import { isValidPreset } from "../../../turbo-v2/cli/presets.js";
import { storage, runStorage } from "./storage.js";
import { SampleResult, SampleName, TokenUsage, CostBreakdown, PassConfig, Run } from "../shared/types.js";
import { extractMetrics } from "./lib/metrics-extractor.js";
import { calculateCost } from "./lib/cost-calculator.js";
import { scoreSemantic, ScoringResult } from "../../scorers/semantic.js";

// Get __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root (for resolving paths)
// __dirname is src/turbo-v2/webapp/server, so go up 4 levels to project root
const PROJECT_ROOT = resolve(__dirname, "../../../..");

// Sample files location
const SAMPLES_DIR = join(PROJECT_ROOT, "test-samples/canonical");

// Output base for experiment results
const OUTPUT_BASE = join(PROJECT_ROOT, ".humanify-experiments");

// Checkpoints directory
const CHECKPOINT_DIR = join(PROJECT_ROOT, ".humanify-checkpoints");

/**
 * Get sample input file path
 */
function getSamplePath(sample: SampleName): string {
  return join(SAMPLES_DIR, sample, "minified.js");
}

/**
 * Get experiment output directory for a sample
 */
function getOutputDir(experimentId: string, sample: SampleName): string {
  return join(OUTPUT_BASE, experimentId, sample);
}

/**
 * Score output against original using semantic scorer
 * Returns empty result with 0 score on failure
 */
async function scoreOutput(
  sample: SampleName,
  outputPath: string
): Promise<ScoringResult> {
  const originalPath = join(SAMPLES_DIR, sample, "original.js");

  if (!existsSync(originalPath)) {
    console.warn(`[runner] Original file not found: ${originalPath}`);
    return {
      score: 0,
      explanation: "Original file not found",
      tokensUsed: 0,
      cost: 0,
      originalIdentifierCount: 0,
      unminifiedIdentifierCount: 0
    };
  }

  if (!existsSync(outputPath)) {
    console.warn(`[runner] Output file not found: ${outputPath}`);
    return {
      score: 0,
      explanation: "Output file not found",
      tokensUsed: 0,
      cost: 0,
      originalIdentifierCount: 0,
      unminifiedIdentifierCount: 0
    };
  }

  console.log(`[runner] Scoring with semantic scorer: ${outputPath} vs ${originalPath}`);

  try {
    return await scoreSemantic(originalPath, outputPath);
  } catch (error: any) {
    console.error(`[runner] Scoring failed:`, error);
    return {
      score: 0,
      explanation: `Scoring failed: ${error.message}`,
      tokensUsed: 0,
      cost: 0,
      originalIdentifierCount: 0,
      unminifiedIdentifierCount: 0
    };
  }
}

/**
 * Find the most recent job directory that has an events.jsonl file
 * Jobs are created with hash-based names, so we need to find the most recently modified one
 */
function findMostRecentJobDir(): string | null {
  if (!existsSync(CHECKPOINT_DIR)) {
    return null;
  }

  try {
    const entries = readdirSync(CHECKPOINT_DIR, { withFileTypes: true });
    const jobDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: entry.name,
        path: join(CHECKPOINT_DIR, entry.name),
        mtime: statSync(join(CHECKPOINT_DIR, entry.name)).mtime.getTime(),
      }))
      .filter((dir) => existsSync(join(dir.path, "events.jsonl")))
      .sort((a, b) => b.mtime - a.mtime);

    return jobDirs.length > 0 ? jobDirs[0].path : null;
  } catch (error) {
    console.error("[runner] Error finding job directory:", error);
    return null;
  }
}

/**
 * Find the most recent job directory for an experiment/sample
 */
function findJobDir(experimentId: string, sample: string): string | null {
  // First check if we have an active job tracked
  const activeJob = storage.getActiveJob(experimentId, sample);
  if (activeJob?.jobDir && existsSync(join(activeJob.jobDir, "events.jsonl"))) {
    return activeJob.jobDir;
  }

  // Otherwise, find the most recent job directory
  return findMostRecentJobDir();
}

/**
 * Watch for new job directory and update active job tracking
 * Returns a cleanup function to stop watching
 */
function watchForNewJobDir(
  experimentId: string,
  sample: string,
  beforeDirs: Set<string>
): { stop: () => void } {
  let stopped = false;

  const check = () => {
    if (stopped || !existsSync(CHECKPOINT_DIR)) return;

    try {
      const entries = readdirSync(CHECKPOINT_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (beforeDirs.has(entry.name)) continue;

        const jobDir = join(CHECKPOINT_DIR, entry.name);
        const eventsPath = join(jobDir, "events.jsonl");

        if (existsSync(eventsPath)) {
          // Found a new job directory with events.jsonl
          console.log(`[runner] Detected new job directory: ${entry.name}`);
          storage.setActiveJob(experimentId, sample, jobDir);
          stopped = true;
          return;
        }
      }
    } catch (err) {
      // Ignore errors
    }

    if (!stopped) {
      setTimeout(check, 200);
    }
  };

  // Start checking after a short delay (to let turbo-v2 create the dir)
  setTimeout(check, 100);

  return {
    stop: () => { stopped = true; }
  };
}

/**
 * Get current job directories in checkpoint dir
 */
function getCurrentJobDirs(): Set<string> {
  if (!existsSync(CHECKPOINT_DIR)) return new Set();

  try {
    const entries = readdirSync(CHECKPOINT_DIR, { withFileTypes: true });
    return new Set(entries.filter(e => e.isDirectory()).map(e => e.name));
  } catch {
    return new Set();
  }
}

/**
 * Convert PassConfig to pass argument string
 * Format: processor:mode:concurrency[:filter][:options]
 *
 * Note: Model is passed separately via TurboV2Options.model, not in pass strings.
 * The pass parser treats everything after concurrency as filter:options.
 */
function passConfigToString(config: PassConfig): string {
  let str = `${config.processor}:${config.mode}:${config.concurrency}`;
  if (config.filter) {
    str += `:${config.filter}`;
  }
  // Note: Model option is not included here as it's set globally via options.model
  return str;
}

/**
 * Run turbo-v2 on a single sample
 */
async function runSample(
  experimentId: string,
  sample: SampleName,
  preset: string,
  model: string = "gpt-4o-mini",
  passConfigs?: PassConfig[]
): Promise<SampleResult> {
  const startTime = performance.now();

  // Get sample input path
  const inputPath = getSamplePath(sample);
  if (!existsSync(inputPath)) {
    return {
      sample,
      score: 0,
      duration: 0,
      error: `Sample file not found: ${inputPath}`,
    };
  }

  // Get output directory
  const outputDir = getOutputDir(experimentId, sample);

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`[runner] Running turbo-v2: ${inputPath} -> ${outputDir}`);
  console.log(`[runner] Preset: ${preset}, Model: ${model}`);

  // Detect provider from base URL
  const baseURL = process.env.OPENAI_BASE_URL;
  const provider = baseURL?.includes('z.ai') ? 'zai' : 'openai';

  // z.ai has strict rate limits, reduce concurrency significantly
  const maxConcurrent = provider === 'zai' ? 2 : 50;

  console.log(`[runner] Provider: ${provider}, Base URL: ${baseURL || '(default)'}, Concurrency: ${maxConcurrent}`);

  // Build turbo-v2 options
  const options: TurboV2Options = {
    inputPath,
    outputDir,
    provider,
    model: provider === 'zai' ? 'GLM-4.7' : model, // Use GLM-4.7 for z.ai
    apiKey: process.env.OPENAI_API_KEY,
    baseURL,
    checkpointDir: CHECKPOINT_DIR,
    maxConcurrent,
    quiet: false,
  };

  // Get pass configs - from custom preset or from built-in preset config
  let finalPassConfigs = passConfigs;
  if (!finalPassConfigs || finalPassConfigs.length === 0) {
    // Fetch built-in preset config
    const presetConfig = storage.getExperiment(experimentId)?.presetConfig;
    finalPassConfigs = presetConfig?.passes;
  }

  // For z.ai, always use explicit pass configs with reduced concurrency
  if (provider === 'zai' && finalPassConfigs && finalPassConfigs.length > 0) {
    console.log(`[runner] Reducing concurrency for z.ai: ${maxConcurrent}`);
    options.pass = finalPassConfigs.map((config) => {
      // Override concurrency to the max allowed for z.ai
      return passConfigToString({
        ...config,
        concurrency: Math.min(config.concurrency, maxConcurrent),
      });
    });
  } else if (finalPassConfigs && finalPassConfigs.length > 0) {
    console.log(`[runner] Using pass configs (${finalPassConfigs.length} passes)`);
    options.pass = finalPassConfigs.map(passConfigToString);
  } else {
    options.preset = preset;
  }

  // Track existing job directories before starting
  const beforeDirs = getCurrentJobDirs();

  // Start watching for new job directory (for SSE progress tracking)
  const watcher = watchForNewJobDir(experimentId, sample, beforeDirs);

  try {
    // Execute turbo-v2 directly - now returns result with jobDir
    const turboResult = await executeTurboV2(options);

    // Stop watching
    watcher.stop();

    const duration = (performance.now() - startTime) / 1000;

    // Use the returned job directory
    const jobDir = turboResult.jobDir;
    console.log(`[runner] Found job directory: ${jobDir}`);

    // Find output file
    const outputPath = join(outputDir, "output.js");
    let finalOutputPath = turboResult.outputPath || outputPath;

    if (jobDir && existsSync(join(jobDir, "events.jsonl"))) {
      // Extract metrics from ledger
      const metrics = await extractMetrics(jobDir);

      if (metrics) {
        // Calculate cost
        const cost = calculateCost(
          {
            promptTokens: metrics.tokens.promptTokens,
            completionTokens: metrics.tokens.completionTokens,
            totalTokens: metrics.tokens.totalTokens,
          },
          model
        );

        // Use the final snapshot path if available
        if (metrics.outputPath && existsSync(metrics.outputPath)) {
          finalOutputPath = metrics.outputPath;
        }

        // Score the output
        const scoringResult = await scoreOutput(sample, finalOutputPath);

        // Merge scoring costs with execution costs
        // Note: scoringResult.cost is just the LLM cost for scoring
        const totalCost = {
            inputCost: cost.inputCost, // + scoring cost? We'll keep them separate for now or add them up
            outputCost: cost.outputCost,
            totalCost: cost.totalCost + (scoringResult.cost || 0)
        };
        
        // Add scoring tokens to total tokens if needed, but metrics are usually just execution

        return {
          sample,
          score: scoringResult.score,
          explanation: scoringResult.explanation,
          duration,
          outputPath: finalOutputPath,
          tokens: metrics.tokens,
          cost: totalCost,
          identifiersProcessed: metrics.identifiersProcessed,
          identifiersRenamed: metrics.identifiersRenamed,
        };
      }
    }

    // Fallback if no job dir or metrics
    const scoringResult = await scoreOutput(sample, finalOutputPath);

    return {
      sample,
      score: scoringResult.score,
      explanation: scoringResult.explanation,
      duration,
      outputPath: finalOutputPath,
    };
  } catch (error: any) {
    watcher.stop();
    const duration = (performance.now() - startTime) / 1000;

    console.error(`[runner] Turbo-v2 failed:`, error.message);

    return {
      sample,
      score: 0,
      duration,
      error: error.message,
    };
  } finally {
    // Clear active job tracking
    storage.clearActiveJob(experimentId, sample);
  }
}

/**
 * Run full experiment - creates a new Run (or uses existing) and stores results there
 * Returns the created/updated Run
 *
 * @param experimentId The experiment to run
 * @param existingRunId Optional: Use an existing Run instead of creating a new one
 */
export async function runExperiment(experimentId: string, existingRunId?: string): Promise<Run> {
  console.log(`\n[runner] Starting experiment: ${experimentId}`);

  const experiment = storage.getExperiment(experimentId);
  if (!experiment) {
    throw new Error(`Experiment ${experimentId} not found`);
  }

  // Use existing Run or create a new one
  let run: Run;
  if (existingRunId) {
    const existingRun = runStorage.getRun(existingRunId);
    if (!existingRun) {
      throw new Error(`Run ${existingRunId} not found`);
    }
    run = existingRun;
    console.log(`\n[runner] Using existing run #${run.runNumber}: ${run.id}`);
  } else {
    run = runStorage.createRun(experimentId);
    console.log(`\n[runner] Created run #${run.runNumber}: ${run.id}`);
  }

  const preset = experiment.preset;
  const samples = experiment.samples;

  console.log(`[runner] Preset: ${preset}`);
  console.log(`[runner] Samples: ${samples.join(", ")}`);
  console.log(`[runner] Mode: ${experiment.mode}`);

  // Update run status to running
  runStorage.updateRun(run.id, {
    status: "running",
    startedAt: new Date().toISOString(),
  });

  // Also update experiment status (for backward compatibility)
  storage.updateExperiment(experimentId, {
    status: "running",
    startedAt: new Date().toISOString(),
  });

  // Initialize progress
  storage.updateProgress(experimentId, {
    completedSamples: 0,
    totalSamples: samples.length,
    progress: 0,
  });

  // Determine model based on preset (or use default)
  const model = experiment.presetConfig?.passes?.[0]?.model || "gpt-4o-mini";

  // Determine if we're using a custom preset (not a built-in one)
  const isCustomPreset = !isValidPreset(preset);
  const passConfigs = isCustomPreset ? experiment.presetConfig?.passes : undefined;

  if (isCustomPreset) {
    console.log(`[runner] Using custom preset with ${passConfigs?.length || 0} passes`);
  } else {
    console.log(`[runner] Using built-in preset: ${preset}`);
  }

  // Run each sample sequentially
  let hasErrors = false;
  let completedCount = 0;
  let lastJobDir: string | undefined;

  for (const sample of samples) {
    console.log(`\n[runner] === Running sample: ${sample} ===`);

    // Update progress
    storage.updateProgress(experimentId, {
      currentSample: sample,
      completedSamples: completedCount,
      progress: Math.round((completedCount / samples.length) * 100),
    });

    // Note: Active job tracking is now handled inside runSample
    // which detects the actual job directory as it's created

    // Run the sample
    const result = await runSampleForRun(experimentId, run.id, sample, preset, model, passConfigs);

    // Store result on the Run
    runStorage.addSampleResult(run.id, result.sampleResult);

    // Also store on experiment for backward compatibility
    storage.addSampleResult(experimentId, result.sampleResult);

    // Track the job directory
    if (result.jobDir) {
      lastJobDir = result.jobDir;
    }

    // Log result
    console.log(`[runner] Sample complete: ${sample}`);
    console.log(`[runner]   Score: ${result.sampleResult.score}/100`);
    if (result.sampleResult.explanation) {
        console.log(`[runner]   Explanation: ${result.sampleResult.explanation}`);
    }
    console.log(`[runner]   Duration: ${result.sampleResult.duration.toFixed(1)}s`);

    if (result.sampleResult.tokens) {
      console.log(`[runner]   Tokens: ${result.sampleResult.tokens.totalTokens} (prompt: ${result.sampleResult.tokens.promptTokens}, completion: ${result.sampleResult.tokens.completionTokens})`);
    }

    if (result.sampleResult.cost) {
      console.log(`[runner]   Cost: $${result.sampleResult.cost.totalCost.toFixed(4)}`);
    }

    if (result.sampleResult.identifiersProcessed) {
      console.log(`[runner]   Identifiers: ${result.sampleResult.identifiersProcessed} processed, ${result.sampleResult.identifiersRenamed} renamed`);
    }

    if (result.sampleResult.error) {
      console.error(`[runner]   Error: ${result.sampleResult.error}`);
      hasErrors = true;
    }

    completedCount++;
  }

  // Update run final status
  runStorage.updateRun(run.id, {
    status: hasErrors ? "failed" : "completed",
    completedAt: new Date().toISOString(),
    jobDir: lastJobDir,
  });

  // Update experiment status (for backward compatibility)
  storage.updateExperiment(experimentId, {
    status: hasErrors ? "failed" : "completed",
    completedAt: new Date().toISOString(),
  });

  // Update final progress
  storage.updateProgress(experimentId, {
    currentSample: undefined,
    completedSamples: completedCount,
    progress: 100,
  });

  // Clear all active jobs
  storage.clearAllActiveJobs(experimentId);

  console.log(`\n[runner] Run #${run.runNumber} ${hasErrors ? "completed with errors" : "completed successfully"}: ${run.id}`);

  // Return the updated run
  return runStorage.getRun(run.id)!;
}

/**
 * Run a single sample and return result with jobDir
 */
async function runSampleForRun(
  experimentId: string,
  runId: string,
  sample: SampleName,
  preset: string,
  model: string = "gpt-4o-mini",
  passConfigs?: PassConfig[]
): Promise<{ sampleResult: SampleResult; jobDir?: string }> {
  const result = await runSample(experimentId, sample, preset, model, passConfigs);

  // Try to find the job directory for this sample
  const activeJob = storage.getActiveJob(experimentId, sample);

  return {
    sampleResult: result,
    jobDir: activeJob?.jobDir,
  };
}

/**
 * Check if OPENAI_API_KEY is available
 */
export function checkApiKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get available samples
 */
export function getAvailableSamples(): SampleName[] {
  const samples: SampleName[] = ["tiny-qs", "small-axios", "medium-chart"];
  return samples.filter((sample) => existsSync(getSamplePath(sample)));
}