/**
 * Checkpoint Manager
 *
 * Implements mid-pass checkpointing to survive crashes without losing progress.
 *
 * Triggers:
 * - Every N identifiers (default: 100)
 * - Every M seconds (default: 60)
 * - On SIGINT/SIGTERM
 *
 * Checkpoint contains:
 * - Completed identifier IDs
 * - Pending identifier IDs
 * - Partial rename map
 * - Stats (tokens, duration, errors)
 * - Snapshot hash for integrity
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

export interface CheckpointStats {
  tokens: number;
  duration: number;
  errors: number;
}

export interface Checkpoint {
  passNumber: number;
  completedIds: string[];
  pendingIds: string[];
  renameMap: Record<string, string>;
  stats: CheckpointStats;
  snapshotHash: string;
  timestamp: string;
}

export interface CheckpointManagerConfig {
  /** Trigger checkpoint every N identifiers (default: 100) */
  identifierInterval: number;
  /** Trigger checkpoint every N seconds (default: 60) */
  timeInterval: number;
  /** Job directory where checkpoints are stored */
  jobDir: string;
}

export interface CheckpointManagerInterface {
  /**
   * Check if checkpoint should be triggered
   */
  shouldCheckpoint(identifiersProcessed: number): boolean;

  /**
   * Save checkpoint atomically
   */
  saveCheckpoint(checkpoint: Checkpoint): Promise<void>;

  /**
   * Load checkpoint if exists
   */
  loadCheckpoint(passNumber: number): Promise<Checkpoint | null>;

  /**
   * Check if checkpoint exists
   */
  hasCheckpoint(passNumber: number): Promise<boolean>;

  /**
   * Delete checkpoint
   */
  deleteCheckpoint(passNumber: number): Promise<void>;

  /**
   * Get path to checkpoint file
   */
  getCheckpointPath(passNumber: number): string;
}

export class CheckpointManager implements CheckpointManagerInterface {
  private config: CheckpointManagerConfig;
  private lastCheckpointTime: number;
  private lastCheckpointCount: number;

  constructor(config: Partial<CheckpointManagerConfig> = {}) {
    this.config = {
      identifierInterval: config.identifierInterval ?? 100,
      timeInterval: config.timeInterval ?? 60,
      jobDir: config.jobDir ?? '.humanify-checkpoints/default',
    };
    this.lastCheckpointTime = Date.now();
    this.lastCheckpointCount = 0;
  }

  /**
   * Check if checkpoint should be triggered based on identifier count or time
   */
  shouldCheckpoint(identifiersProcessed: number): boolean {
    const now = Date.now();
    const timeSinceLastCheckpoint = (now - this.lastCheckpointTime) / 1000; // seconds
    const identifiersSinceLastCheckpoint =
      identifiersProcessed - this.lastCheckpointCount;

    // Trigger on identifier interval
    if (identifiersSinceLastCheckpoint >= this.config.identifierInterval) {
      return true;
    }

    // Trigger on time interval
    if (timeSinceLastCheckpoint >= this.config.timeInterval) {
      return true;
    }

    return false;
  }

  /**
   * Save checkpoint atomically using temp file + rename pattern
   */
  async saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
    const checkpointPath = this.getCheckpointPath(checkpoint.passNumber);
    const tempPath = `${checkpointPath}.tmp`;

    // Ensure passes directory exists
    const passesDir = path.dirname(checkpointPath);
    await fs.mkdir(passesDir, { recursive: true });

    // Write to temp file
    const content = JSON.stringify(checkpoint, null, 2);
    await fs.writeFile(tempPath, content, 'utf-8');

    // Atomic rename
    await fs.rename(tempPath, checkpointPath);

    // Update tracking
    this.lastCheckpointTime = Date.now();
    this.lastCheckpointCount = checkpoint.completedIds.length;
  }

  /**
   * Load checkpoint if exists
   */
  async loadCheckpoint(passNumber: number): Promise<Checkpoint | null> {
    const checkpointPath = this.getCheckpointPath(passNumber);

    try {
      const content = await fs.readFile(checkpointPath, 'utf-8');
      const checkpoint = JSON.parse(content) as Checkpoint;

      // Validate checkpoint structure
      if (!this.isValidCheckpoint(checkpoint)) {
        throw new Error('Invalid checkpoint structure');
      }

      return checkpoint;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null; // Checkpoint doesn't exist
      }
      throw error; // Other errors (parse error, validation error, etc.)
    }
  }

  /**
   * Check if checkpoint exists
   */
  async hasCheckpoint(passNumber: number): Promise<boolean> {
    const checkpointPath = this.getCheckpointPath(passNumber);
    try {
      await fs.access(checkpointPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete checkpoint
   */
  async deleteCheckpoint(passNumber: number): Promise<void> {
    const checkpointPath = this.getCheckpointPath(passNumber);
    try {
      await fs.unlink(checkpointPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      // Ignore if file doesn't exist
    }
  }

  /**
   * Get path to checkpoint file
   */
  getCheckpointPath(passNumber: number): string {
    const filename = `pass-${String(passNumber).padStart(3, '0')}-progress.json`;
    return path.join(this.config.jobDir, 'passes', filename);
  }

  /**
   * Validate checkpoint structure
   */
  private isValidCheckpoint(checkpoint: unknown): checkpoint is Checkpoint {
    if (typeof checkpoint !== 'object' || checkpoint === null) {
      return false;
    }

    const c = checkpoint as Partial<Checkpoint>;

    return (
      typeof c.passNumber === 'number' &&
      Array.isArray(c.completedIds) &&
      Array.isArray(c.pendingIds) &&
      typeof c.renameMap === 'object' &&
      c.renameMap !== null &&
      typeof c.stats === 'object' &&
      c.stats !== null &&
      typeof c.stats.tokens === 'number' &&
      typeof c.stats.duration === 'number' &&
      typeof c.stats.errors === 'number' &&
      typeof c.snapshotHash === 'string' &&
      typeof c.timestamp === 'string'
    );
  }

  /**
   * Compute hash for snapshot integrity checking
   */
  static computeSnapshotHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Update checkpoint tracking after successful save
   * (called internally by saveCheckpoint)
   */
  private updateTracking(identifierCount: number): void {
    this.lastCheckpointTime = Date.now();
    this.lastCheckpointCount = identifierCount;
  }

  /**
   * Reset tracking (for new pass)
   */
  resetTracking(): void {
    this.lastCheckpointTime = Date.now();
    this.lastCheckpointCount = 0;
  }
}
