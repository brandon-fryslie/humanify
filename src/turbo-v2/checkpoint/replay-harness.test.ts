/**
 * Tests for ReplayHarness
 *
 * Covers:
 * - D8.2: Replay logic for state regeneration
 * - Replay to any point in history
 * - Validation and verification
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ReplayHarness } from './replay-harness.js';
import { Ledger } from '../ledger/ledger.js';
import { SnapshotManager } from './snapshot-manager.js';

const TEST_DIR = '/tmp/turbo-v2-replay-harness-test';
const JOB_DIR = path.join(TEST_DIR, 'job-123');

describe('ReplayHarness', () => {
  let replayHarness: ReplayHarness;
  let ledger: Ledger;
  let snapshotManager: SnapshotManager;

  beforeEach(async () => {
    // Clean up test directory
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });

    ledger = new Ledger(JOB_DIR);
    snapshotManager = new SnapshotManager(JOB_DIR);
    replayHarness = new ReplayHarness(JOB_DIR);
  });

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('Replay All Events', () => {
    it('should replay all events and reconstruct state', async () => {
      // Create event sequence
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: '2025-12-30T00:00:00.000Z',
        jobId: 'job-123',
        config: {
          inputPath: '/tmp/input.js',
          outputPath: '/tmp/output.js',
          passes: 2,
          provider: 'openai',
        },
        inputHash: 'abc123',
      });

      await ledger.append({
        type: 'PASS_STARTED',
        timestamp: '2025-12-30T00:00:01.000Z',
        jobId: 'job-123',
        passNumber: 1,
        passConfig: {
          processor: 'rename',
          mode: 'parallel',
          concurrency: 50,
        },
        identifierCount: 10,
      });

      await ledger.append({
        type: 'IDENTIFIER_RENAMED',
        timestamp: '2025-12-30T00:00:02.000Z',
        jobId: 'job-123',
        passNumber: 1,
        batchNumber: 0,
        id: 'id1',
        oldName: 'a',
        newName: 'config',
        confidence: 0.9,
      });

      await ledger.append({
        type: 'IDENTIFIER_RENAMED',
        timestamp: '2025-12-30T00:00:03.000Z',
        jobId: 'job-123',
        passNumber: 1,
        batchNumber: 0,
        id: 'id2',
        oldName: 'b',
        newName: 'handler',
        confidence: 0.85,
      });

      await ledger.append({
        type: 'PASS_COMPLETED',
        timestamp: '2025-12-30T00:00:10.000Z',
        jobId: 'job-123',
        passNumber: 1,
        stats: {
          identifiersProcessed: 10,
          identifiersRenamed: 2,
          identifiersUnchanged: 8,
          identifiersSkipped: 0,
          tokensUsed: { prompt: 1000, completion: 500, total: 1500 },
          durationMs: 9000,
          errors: 0,
          batchCount: 1,
        },
      });

      // Replay
      const result = await replayHarness.replayAll();

      assert.strictEqual(result.state.jobId, 'job-123');
      assert.strictEqual(result.state.currentPass, 1);
      assert.strictEqual(result.state.completedPasses, 1);
      assert.strictEqual(result.state.totalIdentifiersRenamed, 2);
      assert.strictEqual(result.state.renameMap['id1'], 'config');
      assert.strictEqual(result.state.renameMap['id2'], 'handler');
      assert.strictEqual(result.eventsReplayed, 5);
    });

    it('should track pass stats during replay', async () => {
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: '2025-12-30T00:00:00.000Z',
        jobId: 'job-123',
        config: {
          inputPath: '/tmp/input.js',
          outputPath: '/tmp/output.js',
          passes: 1,
          provider: 'openai',
        },
        inputHash: 'abc123',
      });

      await ledger.append({
        type: 'PASS_STARTED',
        timestamp: '2025-12-30T00:00:01.000Z',
        jobId: 'job-123',
        passNumber: 1,
        passConfig: {
          processor: 'rename',
          mode: 'parallel',
          concurrency: 50,
        },
        identifierCount: 100,
      });

      await ledger.append({
        type: 'PASS_COMPLETED',
        timestamp: '2025-12-30T00:00:10.000Z',
        jobId: 'job-123',
        passNumber: 1,
        stats: {
          identifiersProcessed: 100,
          identifiersRenamed: 80,
          identifiersUnchanged: 20,
          identifiersSkipped: 0,
          tokensUsed: { prompt: 5000, completion: 2000, total: 7000 },
          durationMs: 9000,
          errors: 0,
          batchCount: 5,
        },
      });

      const result = await replayHarness.replayAll();

      const passStats = result.passStats.get(1);
      assert.ok(passStats, 'Should have pass 1 stats');
      assert.strictEqual(passStats.identifiersProcessed, 100);
      assert.strictEqual(passStats.identifiersRenamed, 80);
      assert.strictEqual(passStats.tokensUsed.total, 7000);
    });
  });

  describe('Replay to Specific Point', () => {
    beforeEach(async () => {
      // Create a sequence of events
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: '2025-12-30T00:00:00.000Z',
        jobId: 'job-123',
        config: {
          inputPath: '/tmp/input.js',
          outputPath: '/tmp/output.js',
          passes: 3,
          provider: 'openai',
        },
        inputHash: 'abc123',
      });

      for (let pass = 1; pass <= 3; pass++) {
        await ledger.append({
          type: 'PASS_STARTED',
          timestamp: `2025-12-30T00:0${pass}:00.000Z`,
          jobId: 'job-123',
          passNumber: pass,
          passConfig: {
            processor: 'rename',
            mode: 'parallel',
            concurrency: 50,
          },
          identifierCount: 10,
        });

        await ledger.append({
          type: 'IDENTIFIER_RENAMED',
          timestamp: `2025-12-30T00:0${pass}:01.000Z`,
          jobId: 'job-123',
          passNumber: pass,
          batchNumber: 0,
          id: `id${pass}`,
          oldName: `old${pass}`,
          newName: `new${pass}`,
          confidence: 0.8,
        });

        await ledger.append({
          type: 'PASS_COMPLETED',
          timestamp: `2025-12-30T00:0${pass}:59.000Z`,
          jobId: 'job-123',
          passNumber: pass,
          stats: {
            identifiersProcessed: 10,
            identifiersRenamed: 1,
            identifiersUnchanged: 9,
            identifiersSkipped: 0,
            tokensUsed: { prompt: 1000, completion: 500, total: 1500 },
            durationMs: 59000,
            errors: 0,
            batchCount: 1,
          },
        });
      }
    });

    it('should stop replay after N events', async () => {
      const result = await replayHarness.replayTo({ maxEvents: 5 });

      // Should have: JOB_STARTED + PASS_STARTED + IDENTIFIER_RENAMED + PASS_COMPLETED + PASS_STARTED
      assert.strictEqual(result.eventsReplayed, 5);
      assert.strictEqual(result.state.completedPasses, 1);
    });

    it('should stop replay at specific timestamp', async () => {
      const result = await replayHarness.replayTo({
        stopAtTimestamp: '2025-12-30T00:02:30.000Z',
      });

      // Should include pass 1 and pass 2, but not pass 3
      assert.strictEqual(result.state.completedPasses, 2);
      assert.strictEqual(result.state.totalIdentifiersRenamed, 2);
    });

    it('should stop replay after specific pass', async () => {
      const result = await replayHarness.replayTo({ stopAfterPass: 2 });

      assert.strictEqual(result.state.completedPasses, 2);
      assert.strictEqual(result.state.totalIdentifiersRenamed, 2);
      assert.strictEqual(result.state.renameMap['id1'], 'new1');
      assert.strictEqual(result.state.renameMap['id2'], 'new2');
      assert.strictEqual(result.state.renameMap['id3'], undefined);
    });
  });

  describe('State Validation', () => {
    it('should detect timestamp ordering issues', async () => {
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: '2025-12-30T00:00:00.000Z',
        jobId: 'job-123',
        config: {
          inputPath: '/tmp/input.js',
          outputPath: '/tmp/output.js',
          passes: 1,
          provider: 'openai',
        },
        inputHash: 'abc123',
      });

      // Add event with earlier timestamp (invalid)
      await ledger.append({
        type: 'PASS_STARTED',
        timestamp: '2025-12-29T23:59:59.000Z', // Before JOB_STARTED
        jobId: 'job-123',
        passNumber: 1,
        passConfig: {
          processor: 'rename',
          mode: 'parallel',
          concurrency: 50,
        },
        identifierCount: 10,
      });

      const result = await replayHarness.replayTo({ validateState: true });

      assert.ok(result.validationErrors.length > 0);
      assert.ok(
        result.validationErrors.some((e) => e.includes('out of order'))
      );
    });

    it('should detect identifier renamed without pass started', async () => {
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: '2025-12-30T00:00:00.000Z',
        jobId: 'job-123',
        config: {
          inputPath: '/tmp/input.js',
          outputPath: '/tmp/output.js',
          passes: 1,
          provider: 'openai',
        },
        inputHash: 'abc123',
      });

      // Rename without PASS_STARTED
      await ledger.append({
        type: 'IDENTIFIER_RENAMED',
        timestamp: '2025-12-30T00:00:01.000Z',
        jobId: 'job-123',
        passNumber: 1,
        batchNumber: 0,
        id: 'id1',
        oldName: 'a',
        newName: 'config',
        confidence: 0.9,
      });

      const result = await replayHarness.replayTo({ validateState: true });

      assert.ok(result.validationErrors.length > 0);
      assert.ok(
        result.validationErrors.some((e) => e.includes('no pass started'))
      );
    });
  });

  describe('Integrity Verification', () => {
    it('should verify ledger integrity', async () => {
      // Create valid event sequence
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: '2025-12-30T00:00:00.000Z',
        jobId: 'job-123',
        config: {
          inputPath: '/tmp/input.js',
          outputPath: '/tmp/output.js',
          passes: 1,
          provider: 'openai',
        },
        inputHash: 'abc123',
      });

      await ledger.append({
        type: 'PASS_STARTED',
        timestamp: '2025-12-30T00:00:01.000Z',
        jobId: 'job-123',
        passNumber: 1,
        passConfig: {
          processor: 'rename',
          mode: 'parallel',
          concurrency: 50,
        },
        identifierCount: 10,
      });

      await ledger.append({
        type: 'PASS_COMPLETED',
        timestamp: '2025-12-30T00:00:10.000Z',
        jobId: 'job-123',
        passNumber: 1,
        stats: {
          identifiersProcessed: 10,
          identifiersRenamed: 0,
          identifiersUnchanged: 10,
          identifiersSkipped: 0,
          tokensUsed: { prompt: 1000, completion: 500, total: 1500 },
          durationMs: 9000,
          errors: 0,
          batchCount: 1,
        },
      });

      const integrity = await replayHarness.verifyIntegrity();

      assert.strictEqual(integrity.valid, true);
      assert.strictEqual(integrity.errors.length, 0);
    });

    it('should warn about incomplete job', async () => {
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: '2025-12-30T00:00:00.000Z',
        jobId: 'job-123',
        config: {
          inputPath: '/tmp/input.js',
          outputPath: '/tmp/output.js',
          passes: 1,
          provider: 'openai',
        },
        inputHash: 'abc123',
      });

      // No JOB_COMPLETED event

      const integrity = await replayHarness.verifyIntegrity();

      assert.ok(integrity.warnings.length > 0);
      assert.ok(
        integrity.warnings.some((w) => w.includes('not marked complete'))
      );
    });
  });

  describe('Snapshot Validation', () => {
    it('should validate snapshot hash matches ledger', async () => {
      const snapshotContent = 'const renamed = 1;';
      const snapshotHash = require('crypto')
        .createHash('sha256')
        .update(snapshotContent)
        .digest('hex');

      // Create snapshot
      await snapshotManager.saveSnapshot(1, snapshotContent, 1);

      // Create ledger events
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: '2025-12-30T00:00:00.000Z',
        jobId: 'job-123',
        config: {
          inputPath: '/tmp/input.js',
          outputPath: '/tmp/output.js',
          passes: 1,
          provider: 'openai',
        },
        inputHash: 'abc123',
      });

      await ledger.append({
        type: 'PASS_STARTED',
        timestamp: '2025-12-30T00:00:01.000Z',
        jobId: 'job-123',
        passNumber: 1,
        passConfig: {
          processor: 'rename',
          mode: 'parallel',
          concurrency: 50,
        },
        identifierCount: 1,
      });

      await ledger.append({
        type: 'IDENTIFIER_RENAMED',
        timestamp: '2025-12-30T00:00:02.000Z',
        jobId: 'job-123',
        passNumber: 1,
        batchNumber: 0,
        id: 'id1',
        oldName: 'x',
        newName: 'renamed',
        confidence: 0.9,
      });

      await ledger.append({
        type: 'PASS_COMPLETED',
        timestamp: '2025-12-30T00:00:10.000Z',
        jobId: 'job-123',
        passNumber: 1,
        stats: {
          identifiersProcessed: 1,
          identifiersRenamed: 1,
          identifiersUnchanged: 0,
          identifiersSkipped: 0,
          tokensUsed: { prompt: 100, completion: 50, total: 150 },
          durationMs: 9000,
          errors: 0,
          batchCount: 1,
        },
      });

      await ledger.append({
        type: 'SNAPSHOT_CREATED',
        timestamp: '2025-12-30T00:00:11.000Z',
        jobId: 'job-123',
        passNumber: 1,
        snapshotPath: '/path/to/snapshot',
        snapshotHash,
      });

      const validation = await replayHarness.replayAndValidate(1);

      assert.strictEqual(validation.match, true);
      assert.strictEqual(validation.differences.length, 0);
    });
  });

  describe('History Export', () => {
    it('should export full event history', async () => {
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: '2025-12-30T00:00:00.000Z',
        jobId: 'job-123',
        config: {
          inputPath: '/tmp/input.js',
          outputPath: '/tmp/output.js',
          passes: 1,
          provider: 'openai',
        },
        inputHash: 'abc123',
      });

      await ledger.append({
        type: 'PASS_STARTED',
        timestamp: '2025-12-30T00:00:01.000Z',
        jobId: 'job-123',
        passNumber: 1,
        passConfig: {
          processor: 'rename',
          mode: 'parallel',
          concurrency: 50,
        },
        identifierCount: 10,
      });

      const history = await replayHarness.exportHistory();

      assert.strictEqual(history.length, 2);
      assert.strictEqual(history[0].type, 'JOB_STARTED');
      assert.strictEqual(history[1].type, 'PASS_STARTED');
    });

    it('should generate summary statistics', async () => {
      await ledger.append({
        type: 'JOB_STARTED',
        timestamp: '2025-12-30T00:00:00.000Z',
        jobId: 'job-123',
        config: {
          inputPath: '/tmp/input.js',
          outputPath: '/tmp/output.js',
          passes: 1,
          provider: 'openai',
        },
        inputHash: 'abc123',
      });

      await ledger.append({
        type: 'PASS_STARTED',
        timestamp: '2025-12-30T00:00:01.000Z',
        jobId: 'job-123',
        passNumber: 1,
        passConfig: {
          processor: 'rename',
          mode: 'parallel',
          concurrency: 50,
        },
        identifierCount: 10,
      });

      await ledger.append({
        type: 'IDENTIFIER_RENAMED',
        timestamp: '2025-12-30T00:00:02.000Z',
        jobId: 'job-123',
        passNumber: 1,
        batchNumber: 0,
        id: 'id1',
        oldName: 'a',
        newName: 'config',
        confidence: 0.9,
      });

      await ledger.append({
        type: 'PASS_COMPLETED',
        timestamp: '2025-12-30T00:01:00.000Z',
        jobId: 'job-123',
        passNumber: 1,
        stats: {
          identifiersProcessed: 10,
          identifiersRenamed: 1,
          identifiersUnchanged: 9,
          identifiersSkipped: 0,
          tokensUsed: { prompt: 1000, completion: 500, total: 1500 },
          durationMs: 58000,
          errors: 0,
          batchCount: 1,
        },
      });

      const summary = await replayHarness.getSummary();

      assert.strictEqual(summary.totalEvents, 4);
      assert.strictEqual(summary.passes, 1);
      assert.strictEqual(summary.identifiersRenamed, 1);
      assert.strictEqual(summary.totalTokens, 1500);
      assert.strictEqual(summary.eventTypes['JOB_STARTED'], 1);
      assert.strictEqual(summary.eventTypes['PASS_STARTED'], 1);
      assert.strictEqual(summary.eventTypes['IDENTIFIER_RENAMED'], 1);
      assert.strictEqual(summary.eventTypes['PASS_COMPLETED'], 1);
    });
  });
});
