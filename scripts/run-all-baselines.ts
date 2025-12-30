#!/usr/bin/env tsx

/**
 * Run baseline comparisons for all canonical samples.
 * Tests both sequential and turbo v1 modes.
 *
 * Usage:
 *   OPENAI_API_KEY=... tsx scripts/run-all-baselines.ts
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { compareFiles } from './compare-unminified.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CANONICAL_DIR = join(__dirname, '../test-samples/canonical');
const HUMANIFY = join(__dirname, '../dist/index.mjs');

const SAMPLES = [
  { name: 'tiny-qs', description: 'QS stringify (~350 lines)' },
  { name: 'small-axios', description: 'Axios HTTP (~3000 lines)' },
  { name: 'medium-chart', description: 'Chart.js (~11,000 lines)' },
];

interface RunResult {
  sample: string;
  mode: string;
  success: boolean;
  timeSeconds: number;
  metrics?: {
    originalIdentifierCount: number;
    unminifiedIdentifierCount: number;
    exactMatches: number;
    matchPercentage: number;
    structurallyValid: boolean;
  };
  error?: string;
}

async function runHumanify(
  minifiedPath: string,
  outputDir: string,
  turbo: boolean
): Promise<{ success: boolean; timeSeconds: number; error?: string }> {
  // Clean output directory if exists
  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true });
  }
  mkdirSync(outputDir, { recursive: true });

  const startTime = Date.now();
  const turboFlag = turbo ? '--turbo --max-concurrent 10' : '';

  return new Promise((resolve) => {
    const cmd = `node ${HUMANIFY} unminify --provider openai --no-chunking ${turboFlag} -o ${outputDir} ${minifiedPath}`;
    console.log(`    Command: ${cmd.replace(HUMANIFY, 'humanify')}`);

    const proc = spawn('sh', ['-c', cmd], {
      stdio: 'inherit',
      env: process.env,
    });

    proc.on('close', (code) => {
      const endTime = Date.now();
      const timeSeconds = (endTime - startTime) / 1000;

      if (code === 0) {
        resolve({ success: true, timeSeconds });
      } else {
        resolve({
          success: false,
          timeSeconds,
          error: `Exit code: ${code}`,
        });
      }
    });

    proc.on('error', (err) => {
      const endTime = Date.now();
      const timeSeconds = (endTime - startTime) / 1000;
      resolve({
        success: false,
        timeSeconds,
        error: err.message,
      });
    });
  });
}

async function runBaseline(
  sampleName: string,
  turbo: boolean
): Promise<RunResult> {
  const mode = turbo ? 'turbo-v1' : 'sequential';
  console.log(`\n  [${sampleName}] Mode: ${mode}`);

  const sampleDir = join(CANONICAL_DIR, sampleName);
  const originalPath = join(sampleDir, 'original.js');
  const minifiedPath = join(sampleDir, 'minified.js');
  const outputDir = join(sampleDir, `output-${mode}`);
  const unminifiedPath = join(outputDir, 'deobfuscated.js');

  // Verify files exist
  if (!existsSync(originalPath) || !existsSync(minifiedPath)) {
    return {
      sample: sampleName,
      mode,
      success: false,
      timeSeconds: 0,
      error: 'Source files not found',
    };
  }

  // Run humanify
  const result = await runHumanify(minifiedPath, outputDir, turbo);

  if (!result.success) {
    return {
      sample: sampleName,
      mode,
      success: false,
      timeSeconds: result.timeSeconds,
      error: result.error,
    };
  }

  // Find the output file (humanify creates a subdirectory)
  let actualUnminifiedPath = unminifiedPath;
  if (!existsSync(unminifiedPath)) {
    // Check for nested structure
    const nestedPath = join(outputDir, 'minified.js', 'deobfuscated.js');
    if (existsSync(nestedPath)) {
      actualUnminifiedPath = nestedPath;
    } else {
      return {
        sample: sampleName,
        mode,
        success: false,
        timeSeconds: result.timeSeconds,
        error: 'Output file not found',
      };
    }
  }

  // Compare results
  console.log(`    Comparing output to original...`);
  const metrics = compareFiles(originalPath, actualUnminifiedPath);

  return {
    sample: sampleName,
    mode,
    success: true,
    timeSeconds: result.timeSeconds,
    metrics: {
      originalIdentifierCount: metrics.originalIdentifierCount,
      unminifiedIdentifierCount: metrics.unminifiedIdentifierCount,
      exactMatches: metrics.exactMatches,
      matchPercentage: Number(metrics.matchPercentage.toFixed(2)),
      structurallyValid: metrics.structurallyValid,
    },
  };
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          Baseline Comparison: Sequential vs Turbo V1         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();

  // Check if humanify is built
  if (!existsSync(HUMANIFY)) {
    console.error('Error: humanify not built. Run: npm run build');
    process.exit(1);
  }

  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY not set');
    process.exit(1);
  }

  const allResults: RunResult[] = [];

  // Run each sample with both modes
  for (const sample of SAMPLES) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Sample: ${sample.name} (${sample.description})`);
    console.log('═'.repeat(60));

    // Sequential mode
    const seqResult = await runBaseline(sample.name, false);
    allResults.push(seqResult);

    if (seqResult.success && seqResult.metrics) {
      console.log(`    ✓ Sequential: ${seqResult.metrics.matchPercentage}% match in ${seqResult.timeSeconds.toFixed(1)}s`);
    } else {
      console.log(`    ✗ Sequential: ${seqResult.error}`);
    }

    // Turbo mode
    const turboResult = await runBaseline(sample.name, true);
    allResults.push(turboResult);

    if (turboResult.success && turboResult.metrics) {
      console.log(`    ✓ Turbo v1: ${turboResult.metrics.matchPercentage}% match in ${turboResult.timeSeconds.toFixed(1)}s`);
    } else {
      console.log(`    ✗ Turbo v1: ${turboResult.error}`);
    }
  }

  // Print summary table
  console.log('\n\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              RESULTS SUMMARY                                 ║');
  console.log('╠═══════════════╦═════════════╦═══════════╦══════════╦═════════════╦══════════╣');
  console.log('║ Sample        ║ Mode        ║ Match %   ║ Matches  ║ Identifiers ║ Time (s) ║');
  console.log('╠═══════════════╬═════════════╬═══════════╬══════════╬═════════════╬══════════╣');

  for (const r of allResults) {
    if (r.success && r.metrics) {
      const sample = r.sample.padEnd(13);
      const mode = r.mode.padEnd(11);
      const match = `${r.metrics.matchPercentage}%`.padStart(9);
      const matches = String(r.metrics.exactMatches).padStart(8);
      const ids = String(r.metrics.originalIdentifierCount).padStart(11);
      const time = r.timeSeconds.toFixed(1).padStart(8);
      console.log(`║ ${sample} ║ ${mode} ║ ${match} ║ ${matches} ║ ${ids} ║ ${time} ║`);
    } else {
      const sample = r.sample.padEnd(13);
      const mode = r.mode.padEnd(11);
      console.log(`║ ${sample} ║ ${mode} ║   ERROR   ║          ║             ║          ║`);
    }
  }

  console.log('╚═══════════════╩═════════════╩═══════════╩══════════╩═════════════╩══════════╝');

  // Save results
  const resultsPath = join(CANONICAL_DIR, 'baseline-comparison.json');
  writeFileSync(
    resultsPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        results: allResults,
      },
      null,
      2
    )
  );
  console.log(`\nResults saved to: ${resultsPath}`);
}

main().catch(console.error);
