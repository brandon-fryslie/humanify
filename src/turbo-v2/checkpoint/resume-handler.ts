/**
 * Resume Handler
 *
 * Implements full resume logic with config-diff handling.
 *
 * Features:
 * - Detects existing checkpoints by input hash
 * - Loads snapshot and restores queue on resume
 * - Handles config diff: continue / replay / restart
 * - Force flag: `--fresh` ignores existing checkpoint
 * - User prompt for ambiguous cases
 *
 * Resume Rules:
 * | Scenario | Behavior |
 * |----------|----------|
 * | Input hash matches | Resume from checkpoint |
 * | Input hash differs | Error unless `--force` |
 * | Config differs | Prompt: continue / replay from pass K / restart |
 * | Mid-pass checkpoint | Restore queue, load snapshot, continue |
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import * as readline from 'readline';
import { Ledger, LedgerState } from '../ledger/ledger.js';
import { JobConfig } from '../ledger/events.js';
import { CheckpointManager, Checkpoint } from './checkpoint-manager.js';
import { SnapshotManager } from './snapshot-manager.js';

export interface ResumeDecision {
  action: 'resume' | 'replay' | 'restart' | 'prompt-user';
  fromPass?: number;
  reason: string;
}

export interface ResumeOptions {
  /** Ignore existing checkpoint and start fresh */
  fresh?: boolean;
  /** Force resume even if input hash differs */
  force?: boolean;
  /** Force specific action (for non-interactive mode) */
  forceAction?: 'continue' | 'replay' | 'restart';
  /** Replay from specific pass number */
  replayFromPass?: number;
  /** Non-interactive mode (no user prompts) */
  nonInteractive?: boolean;
}

export interface JobMetadata {
  jobId: string;
  inputHash: string;
  config: JobConfig;
  createdAt: string;
  lastUpdatedAt: string;
  status: 'in-progress' | 'completed' | 'failed';
}

export interface ResumeHandlerInterface {
  /**
   * Detect if checkpoint exists for given input
   */
  detectCheckpoint(inputPath: string): Promise<JobMetadata | null>;

  /**
   * Decide whether to resume, replay, or restart
   */
  decideResumeAction(
    existing: JobMetadata,
    newConfig: JobConfig,
    options: ResumeOptions
  ): Promise<ResumeDecision>;

  /**
   * Resume from checkpoint
   */
  resumeFromCheckpoint(
    jobId: string,
    fromPass?: number
  ): Promise<{
    state: LedgerState;
    checkpoint: Checkpoint | null;
    snapshotContent: string | null;
  }>;

  /**
   * Delete checkpoint (for fresh start)
   */
  deleteCheckpoint(jobId: string): Promise<void>;

  /**
   * List all checkpoints
   */
  listCheckpoints(): Promise<JobMetadata[]>;
}

export class ResumeHandler implements ResumeHandlerInterface {
  private checkpointBaseDir: string;

  constructor(checkpointBaseDir: string = '.humanify-checkpoints') {
    this.checkpointBaseDir = checkpointBaseDir;
  }

  /**
   * Detect if checkpoint exists for given input
   */
  async detectCheckpoint(inputPath: string): Promise<JobMetadata | null> {
    const inputHash = await this.computeInputHash(inputPath);

    // List all job directories
    const jobs = await this.listCheckpoints();

    // Find job with matching input hash
    for (const job of jobs) {
      if (job.inputHash === inputHash) {
        return job;
      }
    }

    return null;
  }

  /**
   * Decide whether to resume, replay, or restart
   */
  async decideResumeAction(
    existing: JobMetadata,
    newConfig: JobConfig,
    options: ResumeOptions
  ): Promise<ResumeDecision> {
    // If fresh flag set, always restart
    if (options.fresh) {
      return {
        action: 'restart',
        reason: '--fresh flag specified',
      };
    }

    // If force action specified (non-interactive mode)
    if (options.forceAction) {
      const actionMap: Record<string, ResumeDecision['action']> = {
        continue: 'resume',
        replay: 'replay',
        restart: 'restart',
      };

      return {
        action: actionMap[options.forceAction],
        fromPass: options.replayFromPass,
        reason: `--force-action ${options.forceAction} specified`,
      };
    }

    // Compute config hash to detect changes
    const existingConfigHash = this.computeConfigHash(existing.config);
    const newConfigHash = this.computeConfigHash(newConfig);

    // If config matches, resume
    if (existingConfigHash === newConfigHash) {
      return {
        action: 'resume',
        reason: 'Config matches existing checkpoint',
      };
    }

    // Config differs - need to decide
    const configDiff = this.computeConfigDiff(existing.config, newConfig);

    // If non-interactive, error
    if (options.nonInteractive) {
      throw new Error(
        `Config mismatch detected. Use --force-action to specify behavior.\n` +
          `Differences:\n${this.formatConfigDiff(configDiff)}\n` +
          `Options:\n` +
          `  --force-action continue   Continue with existing config\n` +
          `  --force-action replay     Replay from pass N with new config\n` +
          `  --force-action restart    Start fresh with new config`
      );
    }

    // Prompt user for action
    return {
      action: 'prompt-user',
      reason: `Config differs:\n${this.formatConfigDiff(configDiff)}`,
    };
  }

  /**
   * Resume from checkpoint
   */
  async resumeFromCheckpoint(
    jobId: string,
    fromPass?: number
  ): Promise<{
    state: LedgerState;
    checkpoint: Checkpoint | null;
    snapshotContent: string | null;
  }> {
    const jobDir = path.join(this.checkpointBaseDir, jobId);

    // Load ledger state
    const ledger = new Ledger(jobDir);
    const state = await ledger.getState();

    // Determine which pass to resume from
    const resumePass = fromPass ?? state.currentPass;

    // Load checkpoint for that pass (if exists)
    const checkpointManager = new CheckpointManager({ jobDir });
    const checkpoint = await checkpointManager.loadCheckpoint(resumePass);

    // Load snapshot
    const snapshotManager = new SnapshotManager(jobDir);
    let snapshotContent: string | null = null;

    if (checkpoint) {
      // Resume from mid-pass checkpoint
      snapshotContent = await snapshotManager.loadSnapshot(resumePass - 1);
    } else {
      // Resume from last completed pass
      const completedPass = state.completedPasses;
      snapshotContent = await snapshotManager.loadSnapshot(completedPass);
    }

    return {
      state,
      checkpoint,
      snapshotContent,
    };
  }

  /**
   * Delete checkpoint
   */
  async deleteCheckpoint(jobId: string): Promise<void> {
    const jobDir = path.join(this.checkpointBaseDir, jobId);

    try {
      await fs.rm(jobDir, { recursive: true, force: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      // Ignore if directory doesn't exist
    }
  }

  /**
   * List all checkpoints
   */
  async listCheckpoints(): Promise<JobMetadata[]> {
    try {
      const entries = await fs.readdir(this.checkpointBaseDir, {
        withFileTypes: true,
      });

      const jobs: JobMetadata[] = [];

      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const jobId = entry.name;
        const jobDir = path.join(this.checkpointBaseDir, jobId);
        const metadataPath = path.join(jobDir, 'job.json');

        try {
          const content = await fs.readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(content) as JobMetadata;
          jobs.push(metadata);
        } catch {
          // Skip invalid or incomplete checkpoints
          continue;
        }
      }

      return jobs.sort(
        (a, b) =>
          new Date(b.lastUpdatedAt).getTime() -
          new Date(a.lastUpdatedAt).getTime()
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return []; // Checkpoint directory doesn't exist
      }
      throw error;
    }
  }

  /**
   * Prompt user for resume action (interactive mode)
   */
  async promptUserAction(
    existing: JobMetadata,
    configDiff: Record<string, { old: any; new: any }>
  ): Promise<ResumeDecision> {
    console.log('\n[turbo-v2] Existing checkpoint found\n');
    console.log(`Job ID: ${existing.jobId}`);
    console.log(`Status: ${existing.status}`);
    console.log(`Last updated: ${existing.lastUpdatedAt}\n`);
    console.log('Config differences:');
    console.log(this.formatConfigDiff(configDiff));
    console.log('\nOptions:');
    console.log('  1. Continue with existing config (resume)');
    console.log('  2. Replay from specific pass with new config');
    console.log('  3. Start fresh (discard checkpoint)');
    console.log('  4. Cancel\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('Choose option (1-4): ', resolve);
    });

    rl.close();

    switch (answer.trim()) {
      case '1':
        return { action: 'resume', reason: 'User chose to continue' };

      case '2': {
        const rl2 = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const passAnswer = await new Promise<string>((resolve) => {
          rl2.question('Replay from pass number: ', resolve);
        });

        rl2.close();

        const fromPass = parseInt(passAnswer.trim(), 10);
        if (isNaN(fromPass) || fromPass < 1) {
          throw new Error('Invalid pass number');
        }

        return {
          action: 'replay',
          fromPass,
          reason: `User chose to replay from pass ${fromPass}`,
        };
      }

      case '3':
        return { action: 'restart', reason: 'User chose to start fresh' };

      case '4':
        throw new Error('Cancelled by user');

      default:
        throw new Error('Invalid option');
    }
  }

  /**
   * Save job metadata
   */
  async saveJobMetadata(metadata: JobMetadata): Promise<void> {
    const jobDir = path.join(this.checkpointBaseDir, metadata.jobId);
    const metadataPath = path.join(jobDir, 'job.json');

    await fs.mkdir(jobDir, { recursive: true });

    const content = JSON.stringify(metadata, null, 2);
    await fs.writeFile(metadataPath, content, 'utf-8');
  }

  /**
   * Load job metadata
   */
  async loadJobMetadata(jobId: string): Promise<JobMetadata | null> {
    const jobDir = path.join(this.checkpointBaseDir, jobId);
    const metadataPath = path.join(jobDir, 'job.json');

    try {
      const content = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(content) as JobMetadata;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Compute input file hash for checkpoint detection
   */
  private async computeInputHash(inputPath: string): Promise<string> {
    const content = await fs.readFile(inputPath, 'utf-8');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Compute config hash for change detection
   */
  private computeConfigHash(config: JobConfig): string {
    // Only hash relevant fields (not timestamps, etc.)
    const relevantConfig = {
      passes: config.passes,
      provider: config.provider,
      model: config.model,
      concurrency: config.concurrency,
    };

    const configString = JSON.stringify(relevantConfig, Object.keys(relevantConfig).sort());
    return crypto.createHash('sha256').update(configString).digest('hex');
  }

  /**
   * Compute diff between two configs
   */
  private computeConfigDiff(
    oldConfig: JobConfig,
    newConfig: JobConfig
  ): Record<string, { old: any; new: any }> {
    const diff: Record<string, { old: any; new: any }> = {};

    const keys = new Set([
      ...Object.keys(oldConfig),
      ...Object.keys(newConfig),
    ]);

    for (const key of keys) {
      const oldValue = oldConfig[key as keyof JobConfig];
      const newValue = newConfig[key as keyof JobConfig];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diff[key] = { old: oldValue, new: newValue };
      }
    }

    return diff;
  }

  /**
   * Format config diff for display
   */
  private formatConfigDiff(
    diff: Record<string, { old: any; new: any }>
  ): string {
    const lines: string[] = [];

    for (const [key, { old: oldValue, new: newValue }] of Object.entries(
      diff
    )) {
      lines.push(`  ${key}:`);
      lines.push(`    old: ${JSON.stringify(oldValue)}`);
      lines.push(`    new: ${JSON.stringify(newValue)}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate job ID from input hash and config
   */
  generateJobId(inputHash: string, config: JobConfig): string {
    const configHash = this.computeConfigHash(config);
    const timestamp = Date.now();
    return `${inputHash.substring(0, 8)}-${configHash.substring(0, 8)}-${timestamp}`;
  }

  /**
   * Check if checkpoint is locked by another process
   */
  async isLocked(jobId: string): Promise<boolean> {
    const lockPath = path.join(
      this.checkpointBaseDir,
      jobId,
      'lock'
    );

    try {
      await fs.access(lockPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Acquire lock on checkpoint
   */
  async acquireLock(jobId: string): Promise<void> {
    const lockPath = path.join(
      this.checkpointBaseDir,
      jobId,
      'lock'
    );

    const lockData = {
      pid: process.pid,
      timestamp: new Date().toISOString(),
    };

    try {
      // Ensure job directory exists
      const jobDir = path.dirname(lockPath);
      await fs.mkdir(jobDir, { recursive: true });

      // Use 'wx' flag for atomic create-or-fail
      const fd = await fs.open(lockPath, 'wx');
      await fd.writeFile(JSON.stringify(lockData), 'utf-8');
      await fd.close();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        // Lock already exists
        const existingLock = await fs.readFile(lockPath, 'utf-8');
        const lockInfo = JSON.parse(existingLock);
        throw new Error(
          `Checkpoint locked by another process (PID: ${lockInfo.pid}). ` +
            `Wait or use --force to override.`
        );
      }
      throw error;
    }
  }

  /**
   * Release lock on checkpoint
   */
  async releaseLock(jobId: string): Promise<void> {
    const lockPath = path.join(
      this.checkpointBaseDir,
      jobId,
      'lock'
    );

    try {
      await fs.unlink(lockPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      // Ignore if lock file doesn't exist
    }
  }
}
