#!/usr/bin/env npx tsx

/**
 * Unified Experiment Runner CLI
 * 
 * Runs experiments using the shared logic that powers the Webapp.
 * Ensures all results are stored in the central .humanify-experiments database
 * and scored with the real semantic scorer.
 * 
 * Usage:
 *   npx tsx scripts/run-experiment-unified.ts <variant> [sample] [preset]
 * 
 * Examples:
 *   npx tsx scripts/run-experiment-unified.ts baseline
 *   npx tsx scripts/run-experiment-unified.ts test-run tiny-qs thorough
 */

import 'dotenv/config';
import { runExperiment } from '../src/turbo-v2/webapp/server/run-experiment.js';
import { storage } from '../src/turbo-v2/webapp/server/storage.js';
import { SampleName } from '../src/turbo-v2/webapp/shared/types.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: npx tsx scripts/run-experiment-unified.ts <variant> [sample] [preset]');
    console.error('');
    console.error('Arguments:');
    console.error('  variant  - Name for this experiment (e.g., "baseline", "experiment-1")');
    console.error('  sample   - Sample to run: tiny-qs, small-axios, medium-chart, or "all" (default: all)');
    console.error('  preset   - Preset to use: fast, balanced, thorough, quality, anchor (default: fast)');
    process.exit(1);
  }

  const variant = args[0];
  const sampleArg = args[1] || 'all';
  const preset = args[2] || 'fast';

  // Resolve samples
  let samples: SampleName[] = [];
  if (sampleArg === 'all') {
    samples = ['tiny-qs', 'small-axios', 'medium-chart'];
  } else {
    // Validate sample
    const validSamples = ['tiny-qs', 'small-axios', 'medium-chart'];
    if (!validSamples.includes(sampleArg)) {
      console.error(`Invalid sample: ${sampleArg}. Must be one of: ${validSamples.join(', ')} or "all"`);
      process.exit(1);
    }
    samples = [sampleArg as SampleName];
  }

  console.log('==============================================');
  console.log(`UNIFIED EXPERIMENT RUNNER`);
  console.log('==============================================');
  console.log(`Variant: ${variant}`);
  console.log(`Samples: ${samples.join(', ')}`);
  console.log(`Preset:  ${preset}`);
  console.log('----------------------------------------------');

  // Create or retrieve experiment
  // We use the variant name as the experiment name
  const { experiment, existing } = storage.createExperiment(
    preset,
    samples,
    {
      name: variant,
      mode: 'turbo-v2',
      tags: ['cli'],
      notes: `Created via CLI runner`
    }
  );

  if (existing) {
    console.log(`Found existing experiment: ${experiment.id} (${experiment.name})`);
  } else {
    console.log(`Created new experiment: ${experiment.id}`);
  }

  // Run the experiment
  try {
    const run = await runExperiment(experiment.id);
    
    console.log('==============================================');
    console.log(`RUN COMPLETE`);
    console.log('==============================================');
    console.log(`Run ID: ${run.id}`);
    console.log(`Status: ${run.status}`);
    console.log(`Average Score: ${run.averageScore?.toFixed(1) || 'N/A'}`);
    
    if (run.status === 'failed') {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('Experiment failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
