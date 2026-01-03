#!/usr/bin/env npx tsx

/**
 * Experiment Details CLI
 * 
 * Shows detailed results for a specific experiment, including per-sample scores and explanations.
 * 
 * Usage:
 *   npx tsx scripts/experiment-details.ts <experiment-id-or-name>
 */

import { storage, runStorage } from '../src/turbo-v2/webapp/server.js';
import { ExperimentConfig, Run, SampleResult } from '../src/turbo-v2/webapp/shared/types.js';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: npx tsx scripts/experiment-details.ts <experiment-id-or-name>');
    process.exit(1);
  }

  const query = args[0];
  const experiments = storage.listExperiments();
  
  // Find experiment by ID or name
  const experiment = experiments.find(e => e.id === query || e.name === query);
  
  if (!experiment) {
    console.error(`Experiment not found: ${query}`);
    process.exit(1);
  }

  console.log('==============================================');
  console.log(`EXPERIMENT DETAILS`);
  console.log('==============================================');
  console.log(`ID:        ${experiment.id}`);
  console.log(`Name:      ${experiment.name}`);
  console.log(`Preset:    ${experiment.preset}`);
  console.log(`Mode:      ${experiment.mode}`);
  console.log(`Created:   ${experiment.createdAt}`);
  console.log(`Run Count: ${experiment.runCount}`);
  
  if (!experiment.lastRunId) {
    console.log('\nNo runs found.');
    return;
  }

  const run = runStorage.getRun(experiment.lastRunId);
  if (!run) {
    console.log(`\nLast run ${experiment.lastRunId} not found.`);
    return;
  }

  console.log(`\nLATEST RUN (${run.id})`);
  console.log(`Status:    ${run.status}`);
  console.log(`Date:      ${run.completedAt || run.startedAt}`);
  console.log(`Avg Score: ${run.averageScore?.toFixed(1) || 'N/A'}`);
  console.log(`Total Cost: $${run.totalCost?.totalCost.toFixed(4) || 'N/A'}`);

  console.log('\nSAMPLE RESULTS');
  console.log('----------------------------------------------');

  for (const result of run.results) {
    console.log(`\nSample: ${result.sample}`);
    console.log(`Score:  ${result.score}/100`);
    if (result.identifiersProcessed) {
      console.log(`Identifiers: ${result.identifiersProcessed} processed, ${result.identifiersRenamed} renamed`);
    }
    console.log(`Cost:   $${result.cost?.totalCost.toFixed(4) || '0.0000'}`);
    
    if (result.explanation) {
      console.log('\nExplanation:');
      // Word wrap explanation
      const words = result.explanation.split(' ');
      let line = '  ';
      for (const word of words) {
        if (line.length + word.length > 80) {
          console.log(line);
          line = '  ';
        }
        line += word + ' ';
      }
      console.log(line);
    } else {
      console.log('\nExplanation: (none)');
    }
    console.log('----------------------------------------------');
  }
}

main().catch(console.error);
