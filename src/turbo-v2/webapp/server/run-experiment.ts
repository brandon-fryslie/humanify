/**
 * Execute turbo-v2 experiment and score results
 */

import { execSync } from "child_process";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { storage } from "./storage.js";
import { SampleResult, SampleName } from "../shared/types.js";

const SAMPLES_DIR = "test-samples/canonical";
const OUTPUT_BASE = ".humanify-experiments/outputs";

interface ScoreResult {
  score: number;
  timestamp: string;
}

/**
 * Get sample input file path
 */
function getSamplePath(sample: SampleName): string {
  return join(SAMPLES_DIR, sample, "minified.js");
}

/**
 * Get experiment output directory
 */
function getOutputDir(experimentId: string, sample: SampleName): string {
  return join(OUTPUT_BASE, experimentId, sample);
}

/**
 * Run turbo-v2 on a sample
 */
async function runTurboV2(
  inputPath: string,
  outputDir: string,
  preset: string
): Promise<void> {
  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, "output.js");

  console.log(`[runner] Running turbo-v2: ${inputPath} -> ${outputPath}`);
  console.log(`[runner] Preset: ${preset}`);

  // Build command
  // Note: Using tsx to run the CLI directly
  const cmd = `npx tsx src/cli.ts unminify "${inputPath}" --turbo-v2 --preset ${preset} --output "${outputPath}" --provider openai`;

  try {
    execSync(cmd, {
      stdio: "inherit",
      cwd: process.cwd(),
      env: {
        ...process.env,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      },
    });

    console.log(`[runner] Turbo-v2 complete: ${outputPath}`);
  } catch (error: any) {
    console.error(`[runner] Turbo-v2 failed:`, error.message);
    throw new Error(`Turbo-v2 execution failed: ${error.message}`);
  }
}

/**
 * Score output against original
 */
async function scoreOutput(
  sample: SampleName,
  outputPath: string
): Promise<number> {
  const originalPath = join(SAMPLES_DIR, sample, "original.js");

  if (!existsSync(originalPath)) {
    throw new Error(`Original file not found: ${originalPath}`);
  }

  if (!existsSync(outputPath)) {
    throw new Error(`Output file not found: ${outputPath}`);
  }

  console.log(`[runner] Scoring: ${outputPath} vs ${originalPath}`);

  // Run semantic scoring
  const cmd = `npx tsx scripts/score-semantic.ts "${originalPath}" "${outputPath}"`;

  try {
    const output = execSync(cmd, {
      cwd: process.cwd(),
      encoding: "utf-8",
      env: {
        ...process.env,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      },
    });

    // Parse score from output
    // The scorer outputs JSON with format: { score: number, ... }
    const scoreMatch = output.match(/"score":\s*(\d+)/);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1], 10);
      console.log(`[runner] Score: ${score}/100`);
      return score;
    }

    // Fallback: try to read from semantic-score.json if it was written
    const scoreFilePath = join(outputPath, "../semantic-score.json");
    if (existsSync(scoreFilePath)) {
      const scoreData = JSON.parse(readFileSync(scoreFilePath, "utf-8"));
      return scoreData.score || 0;
    }

    throw new Error("Could not parse score from output");
  } catch (error: any) {
    console.error(`[runner] Scoring failed:`, error.message);
    // Return 0 if scoring fails
    return 0;
  }
}

/**
 * Run experiment for single sample
 */
async function runSample(
  experimentId: string,
  sample: SampleName,
  preset: string
): Promise<SampleResult> {
  const startTime = performance.now();

  try {
    // Get sample input path
    const inputPath = getSamplePath(sample);
    if (!existsSync(inputPath)) {
      throw new Error(`Sample file not found: ${inputPath}`);
    }

    // Get output directory
    const outputDir = getOutputDir(experimentId, sample);
    const outputPath = join(outputDir, "output.js");

    // Run turbo-v2
    await runTurboV2(inputPath, outputDir, preset);

    // Score output
    const score = await scoreOutput(sample, outputPath);

    const duration = (performance.now() - startTime) / 1000; // seconds

    return {
      sample,
      score,
      duration,
      outputPath,
    };
  } catch (error: any) {
    const duration = (performance.now() - startTime) / 1000;

    return {
      sample,
      score: 0,
      duration,
      error: error.message,
    };
  }
}

/**
 * Run full experiment
 */
export async function runExperiment(experimentId: string): Promise<void> {
  console.log(`\n[runner] Starting experiment: ${experimentId}`);

  const experiment = storage.getExperiment(experimentId);
  if (!experiment) {
    throw new Error(`Experiment ${experimentId} not found`);
  }

  console.log(`[runner] Preset: ${experiment.preset}`);
  console.log(`[runner] Samples: ${experiment.samples.join(", ")}`);

  // Run each sample sequentially
  for (const sample of experiment.samples) {
    console.log(`\n[runner] === Running sample: ${sample} ===`);

    const result = await runSample(experimentId, sample, experiment.preset);

    // Store result
    storage.addSampleResult(experimentId, result);

    console.log(`[runner] Sample complete: ${sample}`);
    console.log(`[runner]   Score: ${result.score}/100`);
    console.log(`[runner]   Duration: ${result.duration.toFixed(1)}s`);

    if (result.error) {
      console.error(`[runner]   Error: ${result.error}`);
    }
  }

  console.log(`\n[runner] Experiment complete: ${experimentId}`);
}
