/**
 * TURBO V2 CHECKPOINT MANAGEMENT
 *
 * Enhanced checkpoint commands for turbo-v2
 * Supports both V1 (legacy) and V2 (ledger-based) checkpoints
 */

import { Command } from "commander";
import { listCheckpoints, deleteCheckpoint as deleteV1Checkpoint } from "../checkpoint.js";
import prompts from "prompts";
import { readdir, readFile, stat, rm } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * V2 Checkpoint metadata from job.json
 */
interface V2JobMetadata {
  jobId: string;
  inputPath: string;
  outputPath: string;
  passes: number;
  provider: string;
  model?: string;
  timestamp: string;
  status: "in_progress" | "completed" | "failed";
}

/**
 * V2 Checkpoint info (combines metadata + progress)
 */
interface V2CheckpointInfo {
  jobId: string;
  inputPath: string;
  passes: number;
  provider: string;
  model?: string;
  timestamp: number;
  status: string;
  currentPass?: number;
  progressPercent?: number;
}

/**
 * List all V2 checkpoints in the checkpoints directory
 */
async function listV2Checkpoints(checkpointDir: string = ".humanify-checkpoints"): Promise<V2CheckpointInfo[]> {
  if (!existsSync(checkpointDir)) {
    return [];
  }

  const checkpoints: V2CheckpointInfo[] = [];
  const entries = await readdir(checkpointDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const jobDir = join(checkpointDir, entry.name);
    const jobJsonPath = join(jobDir, "job.json");

    // Check if this is a V2 checkpoint (has job.json)
    if (!existsSync(jobJsonPath)) continue;

    try {
      const jobData = JSON.parse(await readFile(jobJsonPath, "utf-8"));
      const metadata: V2JobMetadata = jobData;

      // Try to get progress from latest checkpoint
      let currentPass: number | undefined;
      let progressPercent: number | undefined;

      const passesDir = join(jobDir, "passes");
      if (existsSync(passesDir)) {
        const passFiles = await readdir(passesDir);
        const progressFiles = passFiles.filter((f) => f.endsWith("-progress.json"));

        if (progressFiles.length > 0) {
          // Get the latest progress file
          const latest = progressFiles.sort().pop()!;
          const progressPath = join(passesDir, latest);
          const progressData = JSON.parse(await readFile(progressPath, "utf-8"));

          currentPass = progressData.passNumber;
          if (progressData.completedIds && progressData.pendingIds) {
            const total = progressData.completedIds.length + progressData.pendingIds.length;
            progressPercent = total > 0 ? Math.round((progressData.completedIds.length / total) * 100) : 0;
          }
        }
      }

      checkpoints.push({
        jobId: metadata.jobId,
        inputPath: metadata.inputPath,
        passes: metadata.passes,
        provider: metadata.provider,
        model: metadata.model,
        timestamp: new Date(metadata.timestamp).getTime(),
        status: metadata.status,
        currentPass,
        progressPercent,
      });
    } catch (error) {
      // Skip corrupted checkpoints
      console.warn(`Warning: Skipping corrupted V2 checkpoint: ${entry.name}`);
    }
  }

  return checkpoints;
}

/**
 * Show detailed info for a specific V2 checkpoint
 */
async function showV2Checkpoint(jobId: string, checkpointDir: string = ".humanify-checkpoints"): Promise<void> {
  const jobDir = join(checkpointDir, jobId);

  if (!existsSync(jobDir)) {
    console.error(`Checkpoint not found: ${jobId}`);
    return;
  }

  const jobJsonPath = join(jobDir, "job.json");
  if (!existsSync(jobJsonPath)) {
    console.error(`Not a V2 checkpoint: ${jobId}`);
    return;
  }

  const jobData = JSON.parse(await readFile(jobJsonPath, "utf-8"));
  const metadata: V2JobMetadata = jobData;

  console.log(`\n[turbo-v2] Checkpoint: ${jobId}`);
  console.log(`\nJob Info:`);
  console.log(`  Input: ${metadata.inputPath}`);
  console.log(`  Output: ${metadata.outputPath}`);
  console.log(`  Passes: ${metadata.passes}`);
  console.log(`  Provider: ${metadata.provider}`);
  if (metadata.model) {
    console.log(`  Model: ${metadata.model}`);
  }
  console.log(`  Created: ${new Date(metadata.timestamp).toLocaleString()}`);
  console.log(`  Status: ${metadata.status}`);

  // Show ledger stats
  const eventsPath = join(jobDir, "events.jsonl");
  if (existsSync(eventsPath)) {
    const eventsContent = await readFile(eventsPath, "utf-8");
    const eventLines = eventsContent.trim().split("\n");
    console.log(`\nLedger:`);
    console.log(`  Events: ${eventLines.length}`);

    // Count event types
    const eventTypes: Record<string, number> = {};
    for (const line of eventLines) {
      try {
        const event = JSON.parse(line);
        eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
      } catch {
        // Skip invalid lines
      }
    }

    for (const [type, count] of Object.entries(eventTypes)) {
      console.log(`    ${type}: ${count}`);
    }
  }

  // Show snapshots
  const snapshotsDir = join(jobDir, "snapshots");
  if (existsSync(snapshotsDir)) {
    const snapshots = await readdir(snapshotsDir);
    console.log(`\nSnapshots:`);
    for (const snapshot of snapshots.sort()) {
      const snapshotPath = join(snapshotsDir, snapshot);
      const stats = await stat(snapshotPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`  ${snapshot} (${sizeMB}MB)`);
    }
  }

  // Show current progress
  const passesDir = join(jobDir, "passes");
  if (existsSync(passesDir)) {
    const passFiles = await readdir(passesDir);
    const progressFiles = passFiles.filter((f) => f.endsWith("-progress.json"));

    if (progressFiles.length > 0) {
      const latest = progressFiles.sort().pop()!;
      const progressPath = join(passesDir, latest);
      const progressData = JSON.parse(await readFile(progressPath, "utf-8"));

      console.log(`\nCurrent Progress:`);
      console.log(`  Pass: ${progressData.passNumber}/${metadata.passes}`);
      if (progressData.completedIds && progressData.pendingIds) {
        const total = progressData.completedIds.length + progressData.pendingIds.length;
        const percent = total > 0 ? Math.round((progressData.completedIds.length / total) * 100) : 0;
        console.log(`  Identifiers: ${progressData.completedIds.length}/${total} (${percent}%)`);
      }
      if (progressData.stats) {
        console.log(`  Tokens: ${progressData.stats.tokens || 0}`);
        console.log(`  Errors: ${progressData.stats.errors || 0}`);
      }
    }
  }

  console.log();
}

/**
 * Clear V2 checkpoints
 */
async function clearV2Checkpoints(
  olderThanDays?: number,
  checkpointDir: string = ".humanify-checkpoints"
): Promise<number> {
  const checkpoints = await listV2Checkpoints(checkpointDir);

  let deleted = 0;
  const now = Date.now();
  const cutoffMs = olderThanDays ? olderThanDays * 24 * 60 * 60 * 1000 : 0;

  for (const checkpoint of checkpoints) {
    // Skip if olderThanDays is specified and checkpoint is too recent
    if (olderThanDays && now - checkpoint.timestamp < cutoffMs) {
      continue;
    }

    const jobDir = join(checkpointDir, checkpoint.jobId);
    await rm(jobDir, { recursive: true, force: true });
    deleted++;
  }

  return deleted;
}

/**
 * Enhanced checkpoints command with V2 support
 */
export const checkpointsV2Command = new Command("checkpoints")
  .description("Manage checkpoint files (supports both V1 and V2 checkpoints)");

// List subcommand
checkpointsV2Command
  .command("list")
  .description("List all checkpoint files")
  .option("--v1-only", "Show only V1 checkpoints")
  .option("--v2-only", "Show only V2 (turbo-v2) checkpoints")
  .action(async (opts) => {
    let hasAny = false;

    // Show V1 checkpoints unless --v2-only is specified
    if (!opts.v2Only) {
      const v1Checkpoints = listCheckpoints();

      if (v1Checkpoints.length > 0) {
        console.log(`\n=== V1 Checkpoints (${v1Checkpoints.length}) ===\n`);
        hasAny = true;

        for (const cp of v1Checkpoints) {
          try {
            const percent = Math.round((cp.completedBatches / cp.totalBatches) * 100);
            console.log(`  ${cp.originalFile || cp.inputHash}`);
            console.log(`    Progress: ${cp.completedBatches}/${cp.totalBatches} batches (${percent}%)`);
            console.log(`    Provider: ${cp.originalProvider || "unknown"}`);
            console.log(`    Model: ${cp.originalModel || "unknown"}`);
            console.log(`    Created: ${new Date(cp.timestamp).toLocaleString()}\n`);
          } catch (error) {
            console.warn(`  Warning: Skipping corrupted checkpoint`);
          }
        }
      }
    }

    // Show V2 checkpoints unless --v1-only is specified
    if (!opts.v1Only) {
      const v2Checkpoints = await listV2Checkpoints();

      if (v2Checkpoints.length > 0) {
        console.log(`\n=== V2 Checkpoints (${v2Checkpoints.length}) ===\n`);
        hasAny = true;

        for (const cp of v2Checkpoints) {
          console.log(`  ${cp.inputPath}`);
          console.log(`    Job ID: ${cp.jobId}`);
          console.log(`    Passes: ${cp.passes} (${cp.currentPass ? `on pass ${cp.currentPass}` : "not started"})`);
          if (cp.progressPercent !== undefined) {
            console.log(`    Progress: ${cp.progressPercent}%`);
          }
          console.log(`    Provider: ${cp.provider} (${cp.model || "default"})`);
          console.log(`    Status: ${cp.status}`);
          console.log(`    Created: ${new Date(cp.timestamp).toLocaleString()}\n`);
        }
      }
    }

    if (!hasAny) {
      console.log("No checkpoints found");
    }
  });

// Show subcommand (V2 only)
checkpointsV2Command
  .command("show <jobId>")
  .description("Show detailed information for a V2 checkpoint")
  .action(async (jobId: string) => {
    await showV2Checkpoint(jobId);
  });

// Clear subcommand
checkpointsV2Command
  .command("clear")
  .alias("clean")
  .description("Delete checkpoint files")
  .option("--older-than <days>", "Only delete checkpoints older than N days")
  .option("--v1-only", "Clear only V1 checkpoints")
  .option("--v2-only", "Clear only V2 (turbo-v2) checkpoints")
  .action(async (opts) => {
    const olderThanDays = opts.olderThan ? parseInt(opts.olderThan, 10) : undefined;

    let v1Count = 0;
    let v2Count = 0;

    // Count checkpoints
    if (!opts.v2Only) {
      const v1Checkpoints = listCheckpoints();
      v1Count = v1Checkpoints.length;
    }

    if (!opts.v1Only) {
      const v2Checkpoints = await listV2Checkpoints();
      v2Count = v2Checkpoints.length;
    }

    if (v1Count === 0 && v2Count === 0) {
      console.log("No checkpoints found");
      return;
    }

    // Show summary
    console.log(`\nFound checkpoints:`);
    if (v1Count > 0) {
      console.log(`  V1: ${v1Count}`);
    }
    if (v2Count > 0) {
      console.log(`  V2: ${v2Count}`);
    }
    if (olderThanDays) {
      console.log(`  Filter: older than ${olderThanDays} days`);
    }

    const answer = await prompts({
      type: "confirm",
      name: "confirmed",
      message: `Delete these checkpoint(s)?`,
      initial: false,
    });

    if (!answer.confirmed) {
      console.log("Cancelled");
      return;
    }

    let deleted = 0;

    // Delete V1 checkpoints
    if (!opts.v2Only && v1Count > 0) {
      const v1Checkpoints = listCheckpoints();
      for (const cp of v1Checkpoints) {
        // V1 doesn't support --older-than filtering easily, so skip if specified
        if (!olderThanDays) {
          deleteV1Checkpoint(cp.inputHash);
          deleted++;
        }
      }
    }

    // Delete V2 checkpoints
    if (!opts.v1Only && v2Count > 0) {
      const v2Deleted = await clearV2Checkpoints(olderThanDays);
      deleted += v2Deleted;
    }

    console.log(`\nDeleted ${deleted} checkpoint(s)`);
  });

// Resume subcommand
checkpointsV2Command
  .command("resume [jobId]")
  .description("Resume from an existing checkpoint")
  .action(async (jobId?: string) => {
    const v1Checkpoints = listCheckpoints();
    const v2Checkpoints = await listV2Checkpoints();

    if (v1Checkpoints.length === 0 && v2Checkpoints.length === 0) {
      console.log("No checkpoints found");
      return;
    }

    // If jobId provided, show resume command for that specific checkpoint
    if (jobId) {
      const v2Checkpoint = v2Checkpoints.find((cp) => cp.jobId === jobId);

      if (v2Checkpoint) {
        console.log(`\nTo resume this V2 checkpoint, run:\n`);
        const cmd = [
          "humanify",
          "unminify",
          v2Checkpoint.inputPath,
          "--turbo-v2",
          "--provider",
          v2Checkpoint.provider,
        ];

        if (v2Checkpoint.model) {
          cmd.push("--model", v2Checkpoint.model);
        }

        console.log(`  ${cmd.join(" ")}\n`);
        console.log("The checkpoint will be automatically detected and resumed.");
      } else {
        console.error(`Checkpoint not found: ${jobId}`);
        return;
      }
    } else {
      // Interactive selection
      const choices: Array<{ title: string; description: string; value: { type: string; data: any } }> = [];

      // Add V1 checkpoints
      for (const cp of v1Checkpoints) {
        const percent = Math.round((cp.completedBatches / cp.totalBatches) * 100);
        const file = cp.originalFile || cp.inputHash;
        const provider = cp.originalProvider || "unknown";
        const model = cp.originalModel || "unknown";

        choices.push({
          title: `[V1] ${file} (${percent}% complete)`,
          description: `Provider: ${provider}, Model: ${model}`,
          value: { type: "v1", data: cp },
        });
      }

      // Add V2 checkpoints
      for (const cp of v2Checkpoints) {
        const progress = cp.progressPercent !== undefined ? `${cp.progressPercent}%` : "starting";
        choices.push({
          title: `[V2] ${cp.inputPath} (${progress})`,
          description: `Job: ${cp.jobId}, ${cp.provider}/${cp.model || "default"}`,
          value: { type: "v2", data: cp },
        });
      }

      const answer = await prompts({
        type: "select",
        name: "checkpoint",
        message: "Select checkpoint to resume:",
        choices,
        hint: "Use arrow keys to navigate",
      });

      if (!answer.checkpoint) {
        console.log("Cancelled");
        return;
      }

      const selected = answer.checkpoint;

      if (selected.type === "v1") {
        const cp = selected.data;
        console.log(`\nTo resume this V1 checkpoint, run:\n`);

        const cmd = ["humanify", "unminify", cp.originalFile || "<file>"];

        if (cp.originalProvider) {
          cmd.push("--provider", cp.originalProvider);
        }

        if (cp.originalModel) {
          cmd.push("--model", cp.originalModel);
        }

        if (cp.originalArgs) {
          const args = cp.originalArgs;
          if (args.turbo) cmd.push("--turbo");
          if (args.maxConcurrent) cmd.push("--max-concurrent", String(args.maxConcurrent));
          if (args.contextSize) cmd.push("--context-size", String(args.contextSize));
          if (args.dependencyMode) cmd.push("--dependency-mode", args.dependencyMode);
        }

        console.log(`  ${cmd.join(" ")}\n`);
        console.log("The checkpoint will be automatically detected and you can choose to resume.");
      } else {
        const cp = selected.data;
        console.log(`\nTo resume this V2 checkpoint, run:\n`);

        const cmd = [
          "humanify",
          "unminify",
          cp.inputPath,
          "--turbo-v2",
          "--provider",
          cp.provider,
        ];

        if (cp.model) {
          cmd.push("--model", cp.model);
        }

        console.log(`  ${cmd.join(" ")}\n`);
        console.log("The checkpoint will be automatically detected and resumed.");
      }
    }
  });
