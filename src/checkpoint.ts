import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";

export interface Checkpoint {
  version: string;
  timestamp: number;
  inputHash: string;
  completedBatches: number;
  totalBatches: number;
  renames: Record<string, string>; // old name -> new name
  partialCode: string; // AST transformed to code with renames applied so far
}

const CHECKPOINT_DIR = ".humanify-checkpoints";

/**
 * Generate a unique checkpoint ID based on input file content
 */
export function getCheckpointId(code: string): string {
  return createHash("sha256").update(code).digest("hex").substring(0, 16);
}

/**
 * Get checkpoint file path
 */
function getCheckpointPath(checkpointId: string): string {
  if (!existsSync(CHECKPOINT_DIR)) {
    mkdirSync(CHECKPOINT_DIR, { recursive: true });
  }
  return join(CHECKPOINT_DIR, `${checkpointId}.json`);
}

/**
 * Save checkpoint
 */
export function saveCheckpoint(
  checkpointId: string,
  checkpoint: Checkpoint
): void {
  const path = getCheckpointPath(checkpointId);
  writeFileSync(path, JSON.stringify(checkpoint, null, 2));
  console.log(`\n💾 Checkpoint saved: ${checkpoint.completedBatches}/${checkpoint.totalBatches} batches complete`);
}

/**
 * Load checkpoint if it exists
 */
export function loadCheckpoint(checkpointId: string): Checkpoint | null {
  const path = getCheckpointPath(checkpointId);
  if (!existsSync(path)) {
    return null;
  }

  try {
    const data = readFileSync(path, "utf-8");
    const checkpoint = JSON.parse(data) as Checkpoint;

    console.log(`\n📂 Found checkpoint: ${checkpoint.completedBatches}/${checkpoint.totalBatches} batches already completed`);
    console.log(`   Timestamp: ${new Date(checkpoint.timestamp).toLocaleString()}`);

    return checkpoint;
  } catch (error) {
    console.warn(`⚠️  Failed to load checkpoint: ${error}`);
    return null;
  }
}

/**
 * Delete checkpoint (called on successful completion)
 */
export function deleteCheckpoint(checkpointId: string): void {
  const path = getCheckpointPath(checkpointId);
  if (existsSync(path)) {
    unlinkSync(path);
    console.log(`\n✅ Checkpoint deleted (processing complete)`);
  }
}

/**
 * List all checkpoints
 */
export function listCheckpoints(): Checkpoint[] {
  if (!existsSync(CHECKPOINT_DIR)) {
    return [];
  }

  const files = require("fs").readdirSync(CHECKPOINT_DIR);
  const checkpoints: Checkpoint[] = [];

  for (const file of files) {
    if (file.endsWith(".json")) {
      try {
        const data = readFileSync(join(CHECKPOINT_DIR, file), "utf-8");
        checkpoints.push(JSON.parse(data));
      } catch {
        // Skip invalid checkpoints
      }
    }
  }

  return checkpoints.sort((a, b) => b.timestamp - a.timestamp);
}
