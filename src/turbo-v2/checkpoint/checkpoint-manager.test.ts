/**
 * Unit tests for CheckpointManager
 *
 * Tests:
 * - Checkpoint saved after N identifiers
 * - Checkpoint restored correctly
 * - No progress lost on crash mid-batch
 * - Atomic write survives SIGKILL
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CheckpointManager, type Checkpoint } from './checkpoint-manager.js';

const TEST_JOB_DIR = '.test-checkpoints';

describe('CheckpointManager', () => {
  let manager: CheckpointManager;

  beforeEach(async () => {
    // Clean up test directory
    await fs.rm(TEST_JOB_DIR, { recursive: true, force: true });

    manager = new CheckpointManager({
      identifierInterval: 100,
      timeInterval: 60,
      jobDir: TEST_JOB_DIR,
    });
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(TEST_JOB_DIR, { recursive: true, force: true });
  });

  describe('shouldCheckpoint', () => {
    it('should trigger on identifier interval', () => {
      // Process 50 identifiers - should not trigger
      assert.equal(manager.shouldCheckpoint(50), false);

      // Process 100 identifiers - should trigger
      assert.equal(manager.shouldCheckpoint(100), true);
    });

    it('should trigger on time interval', async () => {
      // Create manager with short time interval for testing
      const shortIntervalManager = new CheckpointManager({
        identifierInterval: 1000,
        timeInterval: 0.1, // 100ms
        jobDir: TEST_JOB_DIR,
      });

      // Should not trigger immediately
      assert.equal(shortIntervalManager.shouldCheckpoint(1), false);

      // Wait for time interval
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should trigger now
      assert.equal(shortIntervalManager.shouldCheckpoint(1), true);
    });

    it('should not trigger before intervals', () => {
      // Process 50 identifiers - should not trigger
      assert.equal(manager.shouldCheckpoint(50), false);
    });
  });

  describe('saveCheckpoint and loadCheckpoint', () => {
    it('should save and load checkpoint correctly', async () => {
      const checkpoint: Checkpoint = {
        passNumber: 1,
        completedIds: ['id1', 'id2', 'id3'],
        pendingIds: ['id4', 'id5'],
        renameMap: { a: 'foo', b: 'bar' },
        stats: { tokens: 1000, duration: 5000, errors: 0 },
        snapshotHash: 'abc123',
        timestamp: new Date().toISOString(),
      };

      await manager.saveCheckpoint(checkpoint);

      const loaded = await manager.loadCheckpoint(1);
      assert.notEqual(loaded, null);
      assert.deepEqual(loaded, checkpoint);
    });

    it('should return null for non-existent checkpoint', async () => {
      const loaded = await manager.loadCheckpoint(999);
      assert.equal(loaded, null);
    });

    it('should handle multiple passes', async () => {
      const checkpoint1: Checkpoint = {
        passNumber: 1,
        completedIds: ['id1'],
        pendingIds: ['id2'],
        renameMap: { a: 'foo' },
        stats: { tokens: 500, duration: 2000, errors: 0 },
        snapshotHash: 'hash1',
        timestamp: new Date().toISOString(),
      };

      const checkpoint2: Checkpoint = {
        passNumber: 2,
        completedIds: ['id1', 'id2'],
        pendingIds: ['id3'],
        renameMap: { a: 'foo', b: 'bar' },
        stats: { tokens: 1000, duration: 4000, errors: 0 },
        snapshotHash: 'hash2',
        timestamp: new Date().toISOString(),
      };

      await manager.saveCheckpoint(checkpoint1);
      await manager.saveCheckpoint(checkpoint2);

      const loaded1 = await manager.loadCheckpoint(1);
      const loaded2 = await manager.loadCheckpoint(2);

      assert.deepEqual(loaded1, checkpoint1);
      assert.deepEqual(loaded2, checkpoint2);
    });

    it('should validate checkpoint structure', async () => {
      const checkpointPath = manager.getCheckpointPath(1);
      const passesDir = path.dirname(checkpointPath);
      await fs.mkdir(passesDir, { recursive: true });

      // Write invalid checkpoint
      await fs.writeFile(
        checkpointPath,
        JSON.stringify({ invalid: 'checkpoint' }),
        'utf-8'
      );

      await assert.rejects(async () => {
        await manager.loadCheckpoint(1);
      }, /Invalid checkpoint structure/);
    });
  });

  describe('hasCheckpoint', () => {
    it('should return true for existing checkpoint', async () => {
      const checkpoint: Checkpoint = {
        passNumber: 1,
        completedIds: ['id1'],
        pendingIds: [],
        renameMap: { a: 'foo' },
        stats: { tokens: 100, duration: 1000, errors: 0 },
        snapshotHash: 'hash',
        timestamp: new Date().toISOString(),
      };

      await manager.saveCheckpoint(checkpoint);

      const exists = await manager.hasCheckpoint(1);
      assert.equal(exists, true);
    });

    it('should return false for non-existent checkpoint', async () => {
      const exists = await manager.hasCheckpoint(999);
      assert.equal(exists, false);
    });
  });

  describe('deleteCheckpoint', () => {
    it('should delete existing checkpoint', async () => {
      const checkpoint: Checkpoint = {
        passNumber: 1,
        completedIds: ['id1'],
        pendingIds: [],
        renameMap: { a: 'foo' },
        stats: { tokens: 100, duration: 1000, errors: 0 },
        snapshotHash: 'hash',
        timestamp: new Date().toISOString(),
      };

      await manager.saveCheckpoint(checkpoint);
      assert.equal(await manager.hasCheckpoint(1), true);

      await manager.deleteCheckpoint(1);
      assert.equal(await manager.hasCheckpoint(1), false);
    });

    it('should not throw when deleting non-existent checkpoint', async () => {
      await assert.doesNotReject(async () => {
        await manager.deleteCheckpoint(999);
      });
    });
  });

  describe('getCheckpointPath', () => {
    it('should return correct path with zero-padded pass number', () => {
      const path1 = manager.getCheckpointPath(1);
      assert.match(path1, /pass-001-progress\.json$/);

      const path99 = manager.getCheckpointPath(99);
      assert.match(path99, /pass-099-progress\.json$/);

      const path123 = manager.getCheckpointPath(123);
      assert.match(path123, /pass-123-progress\.json$/);
    });
  });

  describe('atomic writes', () => {
    it('should use atomic write pattern (temp + rename)', async () => {
      const checkpoint: Checkpoint = {
        passNumber: 1,
        completedIds: ['id1'],
        pendingIds: [],
        renameMap: { a: 'foo' },
        stats: { tokens: 100, duration: 1000, errors: 0 },
        snapshotHash: 'hash',
        timestamp: new Date().toISOString(),
      };

      const checkpointPath = manager.getCheckpointPath(1);
      const tempPath = `${checkpointPath}.tmp`;

      await manager.saveCheckpoint(checkpoint);

      // Temp file should be cleaned up
      await assert.rejects(async () => {
        await fs.access(tempPath);
      });

      // Final file should exist
      await assert.doesNotReject(async () => {
        await fs.access(checkpointPath);
      });
    });

    it('should survive interrupted write (simulated)', async () => {
      const checkpoint: Checkpoint = {
        passNumber: 1,
        completedIds: ['id1'],
        pendingIds: [],
        renameMap: { a: 'foo' },
        stats: { tokens: 100, duration: 1000, errors: 0 },
        snapshotHash: 'hash',
        timestamp: new Date().toISOString(),
      };

      // Write checkpoint successfully
      await manager.saveCheckpoint(checkpoint);

      // Simulate interrupted write by leaving temp file
      const checkpointPath = manager.getCheckpointPath(1);
      const tempPath = `${checkpointPath}.tmp`;
      await fs.writeFile(tempPath, 'corrupted partial data', 'utf-8');

      // Loading should still work (reads final file, not temp)
      const loaded = await manager.loadCheckpoint(1);
      assert.deepEqual(loaded, checkpoint);
    });
  });

  describe('progress tracking', () => {
    it('should save checkpoint after N identifiers processed', async () => {
      const checkpoint: Checkpoint = {
        passNumber: 1,
        completedIds: Array.from({ length: 100 }, (_, i) => `id${i}`),
        pendingIds: ['id100', 'id101'],
        renameMap: {},
        stats: { tokens: 1000, duration: 5000, errors: 0 },
        snapshotHash: 'hash',
        timestamp: new Date().toISOString(),
      };

      await manager.saveCheckpoint(checkpoint);

      // Verify all completed IDs are saved
      const loaded = await manager.loadCheckpoint(1);
      assert.equal(loaded!.completedIds.length, 100);
      assert.deepEqual(loaded!.completedIds, checkpoint.completedIds);
    });

    it('should not lose progress on crash mid-batch', async () => {
      // Simulate processing batch of 50 identifiers
      const batch1: Checkpoint = {
        passNumber: 1,
        completedIds: Array.from({ length: 50 }, (_, i) => `id${i}`),
        pendingIds: Array.from({ length: 50 }, (_, i) => `id${i + 50}`),
        renameMap: {},
        stats: { tokens: 500, duration: 2000, errors: 0 },
        snapshotHash: 'hash1',
        timestamp: new Date().toISOString(),
      };

      await manager.saveCheckpoint(batch1);

      // Simulate crash - next batch not saved
      // But we can still recover from batch1 checkpoint

      const recovered = await manager.loadCheckpoint(1);
      assert.equal(recovered!.completedIds.length, 50);
      assert.equal(recovered!.pendingIds.length, 50);

      // Resume processing from where we left off
      const batch2: Checkpoint = {
        passNumber: 1,
        completedIds: Array.from({ length: 100 }, (_, i) => `id${i}`),
        pendingIds: [],
        renameMap: {},
        stats: { tokens: 1000, duration: 4000, errors: 0 },
        snapshotHash: 'hash2',
        timestamp: new Date().toISOString(),
      };

      await manager.saveCheckpoint(batch2);

      const final = await manager.loadCheckpoint(1);
      assert.equal(final!.completedIds.length, 100);
      assert.equal(final!.pendingIds.length, 0);
    });
  });

  describe('resetTracking', () => {
    it('should reset tracking for new pass', () => {
      // Process some identifiers
      manager.shouldCheckpoint(100);

      // Reset tracking
      manager.resetTracking();

      // Should not trigger immediately after reset
      assert.equal(manager.shouldCheckpoint(50), false);
    });
  });

  describe('computeSnapshotHash', () => {
    it('should compute consistent hash', () => {
      const content = 'function foo() { return 42; }';
      const hash1 = CheckpointManager.computeSnapshotHash(content);
      const hash2 = CheckpointManager.computeSnapshotHash(content);

      assert.equal(hash1, hash2);
      assert.equal(hash1.length, 64); // SHA-256 produces 64 hex characters
    });

    it('should produce different hash for different content', () => {
      const content1 = 'function foo() { return 42; }';
      const content2 = 'function bar() { return 43; }';

      const hash1 = CheckpointManager.computeSnapshotHash(content1);
      const hash2 = CheckpointManager.computeSnapshotHash(content2);

      assert.notEqual(hash1, hash2);
    });
  });
});
