#!/usr/bin/env npx tsx

/**
 * List Experiments CLI
 * 
 * Lists experiments and their latest run results from the central database.
 * 
 * Usage:
 *   npx tsx scripts/experiment-list.ts [limit]
 */

import { storage, runStorage } from '../src/turbo-v2/webapp/server/storage.js';
import { ExperimentConfig, Run } from '../src/turbo-v2/webapp/shared/types.js';

function formatScore(score?: number) {
  if (score === undefined || score === null) return 'N/A';
  return score.toFixed(1);
}

function formatCost(cost?: number) {
  if (cost === undefined || cost === null) return 'N/A';
  return `$${cost.toFixed(4)}`;
}

async function main() {
  const args = process.argv.slice(2);
  const limit = parseInt(args[0]) || 10;

  console.log('Loading experiments...');
  const experiments = storage.listExperiments();
  
  if (experiments.length === 0) {
    console.log('No experiments found.');
    return;
  }

  console.log('========================================================================================================');
  console.log(`${'ID'.padEnd(20)} | ${'Name'.padEnd(25)} | ${'Preset'.padEnd(10)} | ${'Runs'.padEnd(4)} | ${'Last Run'.padEnd(16)} | ${'Score'.padEnd(6)} | ${'Cost'.padEnd(10)}`);
  console.log('--------------------------------------------------------------------------------------------------------');

  for (const exp of experiments.slice(0, limit)) {
    // Get latest run
    const latestRun = exp.lastRunId ? runStorage.getRun(exp.lastRunId) : null;
    
    // Get average score across all completed runs or just the latest
    const score = latestRun?.averageScore;
    const cost = latestRun?.totalCost?.totalCost;
    
    // Format date
    const date = exp.lastRunAt ? new Date(exp.lastRunAt).toISOString().slice(0, 16).replace('T', ' ') : 'Never';
    
    console.log(
      `${exp.id.padEnd(20)} | ` +
      `${exp.name.slice(0, 25).padEnd(25)} | ` +
      `${exp.preset.slice(0, 10).padEnd(10)} | ` +
      `${exp.runCount.toString().padEnd(4)} | ` +
      `${date.padEnd(16)} | ` +
      `${formatScore(score).padEnd(6)} | ` +
      `${formatCost(cost).padEnd(10)}`
    );
  }
  console.log('========================================================================================================');
  console.log(`Showing ${Math.min(limit, experiments.length)} of ${experiments.length} experiments.`);
}

main().catch(console.error);
