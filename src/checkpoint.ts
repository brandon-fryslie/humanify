import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";

export interface Checkpoint {
  version: string;
  timestamp: number;
  inputHash: string;
  completedBatches: number;
  totalBatches: number;
  renames: Record<string, string>; // old name -> new name
  partialCode: string; // Transformed code with all renames from completed batches applied

  // Metadata for resume command (optional for backwards compatibility)
  originalFile?: string;           // Path to input file
  originalProvider?: string;       // Provider used (openai, gemini, local)
  originalModel?: string;          // Model used
  originalArgs?: Record<string, any>; // CLI args used
}

const CHECKPOINT_DIR = ".humanify-checkpoints";
export const CHECKPOINT_VERSION = "2.0.0"; // Version with transformed code support

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

    // Version validation
    if (checkpoint.version !== CHECKPOINT_VERSION) {
      console.warn(`\n⚠️  Checkpoint version mismatch:`);
      console.warn(`   Checkpoint: ${checkpoint.version}`);
      console.warn(`   Current:    ${CHECKPOINT_VERSION}`);
      console.warn(`   This checkpoint cannot be loaded. Deleting stale checkpoint.`);

      // Delete incompatible checkpoint
      try {
        unlinkSync(path);
      } catch {
        // Ignore deletion errors
      }

      return null;
    }

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

  const files = readdirSync(CHECKPOINT_DIR);
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
