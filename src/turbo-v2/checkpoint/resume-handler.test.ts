/**
 * Tests for ResumeHandler
 *
 * Covers:
 * - D8.1: Resume logic with checkpoint detection
 * - Config diff handling (continue / replay / restart)
 * - Force flags and non-interactive mode
 * - Lock file management
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ResumeHandler, JobMetadata, ResumeOptions } from './resume-handler.js';
import { JobConfig } from '../ledger/events.js';
import { Ledger } from '../ledger/ledger.js';
import { CheckpointManager } from './checkpoint-manager.js';
import { SnapshotManager } from './snapshot-manager.js';

const TEST_DIR = '/tmp/turbo-v2-resume-handler-test';
const CHECKPOINT_DIR = path.join(TEST_DIR, 'checkpoints');

describe('ResumeHandler', () => {
  let resumeHandler: ResumeHandler;
  let testInputPath: string;

  beforeEach(async () => {
    // Clean up test directory
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });

    // Create test input file
    testInputPath = path.join(TEST_DIR, 'input.js');
    await fs.writeFile(testInputPath, 'const x = 1;', 'utf-8');

    resumeHandler = new ResumeHandler(CHECKPOINT_DIR);
  });

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('Checkpoint Detection', () => {
    it('should detect existing checkpoint by input hash', async () => {
      // Create a checkpoint
      const config: JobConfig = {
        inputPath: testInputPath,
        outputPath: '/tmp/output.js',
        passes: 2,
        provider: 'openai',
      };

      const inputContent = await fs.readFile(testInputPath, 'utf-8');
      const inputHash = await hashString(inputContent);
      const jobId = resumeHandler.generateJobId(inputHash, config);

      const metadata: JobMetadata = {
        jobId,
        inputHash,
        config,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        status: 'in-progress',
      };

      await resumeHandler.saveJobMetadata(metadata);

      // Detect checkpoint
      const detected = await resumeHandler.detectCheckpoint(testInputPath);

      assert.ok(detected, 'Should detect checkpoint');
      assert.strictEqual(detected.inputHash, inputHash);
      assert.strictEqual(detected.config.passes, 2);
    });

    it('should return null when no checkpoint exists', async () => {
      const detected = await resumeHandler.detectCheckpoint(testInputPath);
      assert.strictEqual(detected, null);
    });

    it('should not detect checkpoint for different input', async () => {
      // Create checkpoint for one input
      const config: JobConfig = {
        inputPath: testInputPath,
        outputPath: '/tmp/output.js',
        passes: 2,
        provider: 'openai',
      };

      const inputContent = await fs.readFile(testInputPath, 'utf-8');
      const inputHash = await hashString(inputContent);
      const jobId = resumeHandler.generateJobId(inputHash, config);

      const metadata: JobMetadata = {
        jobId,
        inputHash,
        config,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        status: 'in-progress',
      };

      await resumeHandler.saveJobMetadata(metadata);

      // Create different input file
      const otherInput = path.join(TEST_DIR, 'other.js');
      await fs.writeFile(otherInput, 'const y = 2;', 'utf-8');

      // Should not detect
      const detected = await resumeHandler.detectCheckpoint(otherInput);
      assert.strictEqual(detected, null);
    });
  });

  describe('Resume Decision', () => {
    let existingMetadata: JobMetadata;
    let existingConfig: JobConfig;

    beforeEach(async () => {
      existingConfig = {
        inputPath: testInputPath,
        outputPath: '/tmp/output.js',
        passes: 2,
        provider: 'openai',
        model: 'gpt-4o-mini',
      };

      const inputContent = await fs.readFile(testInputPath, 'utf-8');
      const inputHash = await hashString(inputContent);
      const jobId = resumeHandler.generateJobId(inputHash, existingConfig);

      existingMetadata = {
        jobId,
        inputHash,
        config: existingConfig,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        status: 'in-progress',
      };
    });

    it('should resume when config matches', async () => {
      const decision = await resumeHandler.decideResumeAction(
        existingMetadata,
        existingConfig,
        {}
      );

      assert.strictEqual(decision.action, 'resume');
      assert.ok(decision.reason.includes('matches'));
    });

    it('should restart when --fresh flag set', async () => {
      const decision = await resumeHandler.decideResumeAction(
        existingMetadata,
        existingConfig,
        { fresh: true }
      );

      assert.strictEqual(decision.action, 'restart');
      assert.ok(decision.reason.includes('fresh'));
    });

    it('should prompt user when config differs', async () => {
      const newConfig: JobConfig = {
        ...existingConfig,
        passes: 3, // Different number of passes
      };

      const decision = await resumeHandler.decideResumeAction(
        existingMetadata,
        newConfig,
        {}
      );

      assert.strictEqual(decision.action, 'prompt-user');
      assert.ok(decision.reason.includes('differs'));
    });

    it('should use force action in non-interactive mode', async () => {
      const newConfig: JobConfig = {
        ...existingConfig,
        model: 'gpt-4o', // Different model
      };

      const decision = await resumeHandler.decideResumeAction(
        existingMetadata,
        newConfig,
        { forceAction: 'continue', nonInteractive: true }
      );

      assert.strictEqual(decision.action, 'resume');
      assert.ok(decision.reason.includes('force-action'));
    });

    it('should error in non-interactive mode without force action', async () => {
      const newConfig: JobConfig = {
        ...existingConfig,
        concurrency: 100, // Different concurrency
      };

      await assert.rejects(
        async () => {
          await resumeHandler.decideResumeAction(
            existingMetadata,
            newConfig,
            { nonInteractive: true }
          );
        },
        /Config mismatch/
      );
    });

    it('should support replay from specific pass', async () => {
      const newConfig: JobConfig = {
        ...existingConfig,
        passes: 3,
      };

      const decision = await resumeHandler.decideResumeAction(
        existingMetadata,
        newConfig,
        { forceAction: 'replay', replayFromPass: 2 }
      );

      assert.strictEqual(decision.action, 'replay');
      assert.strictEqual(decision.fromPass, 2);
    });
  });

  describe('Resume from Checkpoint', () => {
    it('should load ledger state and checkpoint', async () => {
      const config: JobConfig = {
        inputPath: testInputPath,
        outputPath: '/tmp/output.js',
        passes: 2,
        provider: 'openai',
      };

      const inputContent = await fs.readFile(testInputPath, 'utf-8');
      const inputHash = await hashString(inputContent);
      const jobId = resumeHandler.generateJobId(inputHash, config);
      const jobDir = path.join(CHECKPOINT_DIR, jobId);

      // Create ledger with events
      const ledger = new Ledger(jobDir);
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: new Date().toISOString(),
        jobId,
        config,
        inputHash,
      });
      await ledger.append({
        type: 'PASS_STARTED',
        timestamp: new Date().toISOString(),
        jobId,
        passNumber: 1,
        passConfig: {
          processor: 'rename',
          mode: 'parallel',
          concurrency: 50,
        },
        identifierCount: 100,
      });

      // Create checkpoint
      const checkpointManager = new CheckpointManager({ jobDir });
      await checkpointManager.saveCheckpoint({
        passNumber: 1,
        completedIds: ['id1', 'id2'],
        pendingIds: ['id3', 'id4'],
        renameMap: { id1: 'renamed1', id2: 'renamed2' },
        stats: { tokens: 100, duration: 1000, errors: 0 },
        snapshotHash: 'abc123',
        timestamp: new Date().toISOString(),
      });

      // Resume
      const result = await resumeHandler.resumeFromCheckpoint(jobId);

      assert.strictEqual(result.state.jobId, jobId);
      assert.strictEqual(result.state.currentPass, 1);
      assert.ok(result.checkpoint, 'Should have checkpoint');
      assert.strictEqual(result.checkpoint.completedIds.length, 2);
      assert.strictEqual(result.checkpoint.pendingIds.length, 2);
    });

    it('should resume from specific pass', async () => {
      const config: JobConfig = {
        inputPath: testInputPath,
        outputPath: '/tmp/output.js',
        passes: 3,
        provider: 'openai',
      };

      const inputContent = await fs.readFile(testInputPath, 'utf-8');
      const inputHash = await hashString(inputContent);
      const jobId = resumeHandler.generateJobId(inputHash, config);
      const jobDir = path.join(CHECKPOINT_DIR, jobId);

      // Create ledger with multiple passes
      const ledger = new Ledger(jobDir);
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: new Date().toISOString(),
        jobId,
        config,
        inputHash,
      });

      for (let pass = 1; pass <= 2; pass++) {
        await ledger.append({
          type: 'PASS_STARTED',
          timestamp: new Date().toISOString(),
          jobId,
          passNumber: pass,
          passConfig: {
            processor: 'rename',
            mode: 'parallel',
            concurrency: 50,
          },
          identifierCount: 100,
        });
        await ledger.append({
          type: 'PASS_COMPLETED',
          timestamp: new Date().toISOString(),
          jobId,
          passNumber: pass,
          stats: {
            identifiersProcessed: 100,
            identifiersRenamed: 80,
            identifiersUnchanged: 20,
            identifiersSkipped: 0,
            tokensUsed: { prompt: 1000, completion: 500, total: 1500 },
            durationMs: 5000,
            errors: 0,
            batchCount: 2,
          },
        });
      }

      // Resume from pass 2
      const result = await resumeHandler.resumeFromCheckpoint(jobId, 2);

      assert.strictEqual(result.state.completedPasses, 2);
    });
  });

  describe('Lock Management', () => {
    it('should acquire lock successfully', async () => {
      const jobId = 'test-job-123';

      await resumeHandler.acquireLock(jobId);

      const locked = await resumeHandler.isLocked(jobId);
      assert.strictEqual(locked, true);

      await resumeHandler.releaseLock(jobId);
    });

    it('should fail to acquire lock when already locked', async () => {
      const jobId = 'test-job-456';

      await resumeHandler.acquireLock(jobId);

      await assert.rejects(
        async () => {
          await resumeHandler.acquireLock(jobId);
        },
        /Checkpoint locked by another process/
      );

      await resumeHandler.releaseLock(jobId);
    });

    it('should release lock successfully', async () => {
      const jobId = 'test-job-789';

      await resumeHandler.acquireLock(jobId);
      await resumeHandler.releaseLock(jobId);

      const locked = await resumeHandler.isLocked(jobId);
      assert.strictEqual(locked, false);
    });

    it('should not error when releasing non-existent lock', async () => {
      const jobId = 'test-job-nonexistent';

      // Should not throw
      await resumeHandler.releaseLock(jobId);
    });
  });

  describe('Checkpoint Management', () => {
    it('should list all checkpoints', async () => {
      // Create multiple checkpoints
      const configs: JobConfig[] = [
        {
          inputPath: testInputPath,
          outputPath: '/tmp/out1.js',
          passes: 2,
          provider: 'openai',
        },
        {
          inputPath: testInputPath,
          outputPath: '/tmp/out2.js',
          passes: 3,
          provider: 'gemini',
        },
      ];

      for (const config of configs) {
        const inputContent = await fs.readFile(testInputPath, 'utf-8');
        const inputHash = await hashString(inputContent);
        const jobId = resumeHandler.generateJobId(inputHash, config);

        const metadata: JobMetadata = {
          jobId,
          inputHash,
          config,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          status: 'in-progress',
        };

        await resumeHandler.saveJobMetadata(metadata);
      }

      const checkpoints = await resumeHandler.listCheckpoints();
      assert.strictEqual(checkpoints.length, 2);
    });

    it('should delete checkpoint', async () => {
      const config: JobConfig = {
        inputPath: testInputPath,
        outputPath: '/tmp/output.js',
        passes: 2,
        provider: 'openai',
      };

      const inputContent = await fs.readFile(testInputPath, 'utf-8');
      const inputHash = await hashString(inputContent);
      const jobId = resumeHandler.generateJobId(inputHash, config);

      const metadata: JobMetadata = {
        jobId,
        inputHash,
        config,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        status: 'in-progress',
      };

      await resumeHandler.saveJobMetadata(metadata);

      // Delete
      await resumeHandler.deleteCheckpoint(jobId);

      // Verify deleted
      const loaded = await resumeHandler.loadJobMetadata(jobId);
      assert.strictEqual(loaded, null);
    });

    it('should return empty list when no checkpoints exist', async () => {
      const checkpoints = await resumeHandler.listCheckpoints();
      assert.strictEqual(checkpoints.length, 0);
    });
  });
});

// Helper function to hash strings
async function hashString(content: string): Promise<string> {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
}
