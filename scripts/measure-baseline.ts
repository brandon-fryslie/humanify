#!/usr/bin/env tsx

/**
 * Measure baseline quality for canonical samples.
 *
 * Runs existing humanify (sequential mode, no --turbo) on minified samples
 * and records baseline scores.
 *
 * Usage:
 *   npm run measure-baseline [sample-name]
 *   tsx scripts/measure-baseline.ts [tiny-qs|small-axios|medium-chart]
 *
 * If no sample name provided, runs all samples.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { compareFiles } from './compare-unminified.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CANONICAL_DIR = join(__dirname, '../test-samples/canonical');
const HUMANIFY = join(__dirname, '../dist/index.mjs');

const SAMPLES = {
  'tiny-qs': {
    name: 'tiny-qs',
    description: 'QS stringify module (~350 lines)',
  },
  'small-axios': {
    name: 'small-axios',
    description: 'Axios HTTP client (~3000 lines)',
  },
  'medium-chart': {
    name: 'medium-chart',
    description: 'Chart.js library (~11,000 lines)',
  },
};

interface BaselineResult {
  sampleName: string;
  description: string;
  timestamp: string;
  humanifyVersion: string;
  mode: 'sequential';
  metrics: {
    originalIdentifierCount: number;
    unminifiedIdentifierCount: number;
    exactMatches: number;
    matchPercentage: number;
    structurallyValid: boolean;
  };
  processingTime?: number; // in seconds
  error?: string;
}

function runHumanify(
  sampleName: string,
  minifiedPath: string,
  outputDir: string
): { success: boolean; timeSeconds: number; error?: string } {
  const startTime = Date.now();

  try {
    console.log(`  Running humanify (sequential mode)...`);

    // Run humanify without --turbo flag (sequential mode)
    // Use OpenAI provider
    // Output goes to outputDir/deobfuscated.js
    execSync(
      `node ${HUMANIFY} unminify --provider openai --no-chunking -o ${outputDir} ${minifiedPath}`,
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          // Ensure we have the API key
        },
      }
    );

    const endTime = Date.now();
    const timeSeconds = (endTime - startTime) / 1000;

    return { success: true, timeSeconds };
  } catch (error) {
    const endTime = Date.now();
    const timeSeconds = (endTime - startTime) / 1000;

    return {
      success: false,
      timeSeconds,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function measureBaseline(sampleName: string): Promise<BaselineResult> {
  const sample = SAMPLES[sampleName as keyof typeof SAMPLES];
  if (!sample) {
    throw new Error(`Unknown sample: ${sampleName}`);
  }

  console.log(`\nMeasuring baseline for ${sampleName}`);
  console.log(`Description: ${sample.description}`);

  const sampleDir = join(CANONICAL_DIR, sampleName);
  const originalPath = join(sampleDir, 'original.js');
  const minifiedPath = join(sampleDir, 'minified.js');
  const outputDir = join(sampleDir, 'unminified.js');
  const unminifiedPath = join(outputDir, 'deobfuscated.js');
  const scoresPath = join(sampleDir, 'baseline-scores.json');

  // Verify files exist
  if (!existsSync(originalPath)) {
    throw new Error(`Original file not found: ${originalPath}`);
  }
  if (!existsSync(minifiedPath)) {
    throw new Error(`Minified file not found: ${minifiedPath}`);
  }

  // Run humanify
  const result = runHumanify(sampleName, minifiedPath, outputDir);

  if (!result.success) {
    const errorResult: BaselineResult = {
      sampleName,
      description: sample.description,
      timestamp: new Date().toISOString(),
      humanifyVersion: '2.2.2', // TODO: read from package.json
      mode: 'sequential',
      metrics: {
        originalIdentifierCount: 0,
        unminifiedIdentifierCount: 0,
        exactMatches: 0,
        matchPercentage: 0,
        structurallyValid: false,
      },
      processingTime: result.timeSeconds,
      error: result.error,
    };

    // Save error result
    writeFileSync(scoresPath, JSON.stringify(errorResult, null, 2));
    console.log(`  Error saved to: ${scoresPath}`);

    return errorResult;
  }

  console.log(`  Processing time: ${result.timeSeconds.toFixed(2)}s`);

  // Compare results
  console.log(`  Comparing output to original...`);
  const metrics = compareFiles(originalPath, unminifiedPath);

  const baselineResult: BaselineResult = {
    sampleName,
    description: sample.description,
    timestamp: new Date().toISOString(),
    humanifyVersion: '2.2.2',
    mode: 'sequential',
    metrics: {
      originalIdentifierCount: metrics.originalIdentifierCount,
      unminifiedIdentifierCount: metrics.unminifiedIdentifierCount,
      exactMatches: metrics.exactMatches,
      matchPercentage: Number(metrics.matchPercentage.toFixed(2)),
      structurallyValid: metrics.structurallyValid,
    },
    processingTime: result.timeSeconds,
  };

  // Save scores
  writeFileSync(scoresPath, JSON.stringify(baselineResult, null, 2));
  console.log(`  Scores saved to: ${scoresPath}`);

  // Print summary
  console.log(`\n  Summary:`);
  console.log(`    Identifiers (original): ${metrics.originalIdentifierCount}`);
  console.log(
    `    Identifiers (unminified): ${metrics.unminifiedIdentifierCount}`
  );
  console.log(`    Exact matches: ${metrics.exactMatches}`);
  console.log(`    Match rate: ${metrics.matchPercentage.toFixed(2)}%`);
  console.log(`    Structurally valid: ${metrics.structurallyValid ? 'YES' : 'NO'}`);

  return baselineResult;
}

async function main() {
  const args = process.argv.slice(2);

  // Check if humanify is built
  if (!existsSync(HUMANIFY)) {
    console.error('Error: humanify not built. Run: npm run build');
    process.exit(1);
  }

  // Determine which samples to run
  let samplesToRun: string[];
  if (args.length === 0) {
    // Run all samples
    samplesToRun = Object.keys(SAMPLES);
  } else {
    // Run specified sample
    const sampleName = args[0];
    if (!SAMPLES[sampleName as keyof typeof SAMPLES]) {
      console.error(`Error: Unknown sample "${sampleName}"`);
      console.error(`Available samples: ${Object.keys(SAMPLES).join(', ')}`);
      process.exit(1);
    }
    samplesToRun = [sampleName];
  }

  console.log('Baseline Measurement');
  console.log('===================\n');
  console.log(`Samples to measure: ${samplesToRun.join(', ')}`);
  console.log('Mode: sequential (no --turbo)');
  console.log('Provider: openai\n');

  const results: BaselineResult[] = [];

  for (const sampleName of samplesToRun) {
    try {
      const result = await measureBaseline(sampleName);
      results.push(result);
    } catch (error) {
      console.error(`\nError measuring ${sampleName}:`, error);
      process.exit(1);
    }
  }

  console.log('\n\nAll Baselines Complete');
  console.log('======================\n');

  for (const result of results) {
    console.log(`${result.sampleName}:`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    } else {
      console.log(`  Match rate: ${result.metrics.matchPercentage}%`);
      console.log(`  Time: ${result.processingTime?.toFixed(2)}s`);
    }
  }
}

main();
