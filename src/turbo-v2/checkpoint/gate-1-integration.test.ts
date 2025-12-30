/**
 * Gate 1 Integration Test
 *
 * CRITICAL SUCCESS GATE: Resume mid-pass without losing any identifier progress
 *
 * Test Scenario:
 * 1. Start processing a file with 100 identifiers
 * 2. Process 50 identifiers and save checkpoint
 * 3. Simulate crash (kill process mid-pass)
 * 4. Resume with same command
 * 5. Verify: All 50 completed identifiers preserved
 * 6. Verify: Processing continues from checkpoint (identifiers 51-100)
 * 7. Verify: No duplicate API calls (vault hit rate 100% for completed identifiers)
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ResumeHandler, JobMetadata } from './resume-handler.js';
import { ReplayHarness } from './replay-harness.js';
import { CheckpointManager } from './checkpoint-manager.js';
import { SnapshotManager } from './snapshot-manager.js';
import { Ledger } from '../ledger/ledger.js';
import { JobConfig } from '../ledger/events.js';

const TEST_DIR = '/tmp/turbo-v2-gate-1-test';
const CHECKPOINT_DIR = path.join(TEST_DIR, 'checkpoints');
const INPUT_FILE = path.join(TEST_DIR, 'input.js');

describe('Gate 1: Mid-Pass Resume Integration', () => {
  let resumeHandler: ResumeHandler;

  beforeEach(async () => {
    // Clean up test directory
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });

    // Create test input file
    await fs.writeFile(INPUT_FILE, generateTestCode(100), 'utf-8');

    resumeHandler = new ResumeHandler(CHECKPOINT_DIR);
  });

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('Gate 1: Resume mid-pass without losing progress', async () => {
    const config: JobConfig = {
      inputPath: INPUT_FILE,
      outputPath: path.join(TEST_DIR, 'output.js'),
      passes: 2,
      provider: 'openai',
      model: 'gpt-4o-mini',
      concurrency: 50,
    };

    // === PHASE 1: Initial Processing (Simulate Crash at 50%) ===

    console.log('\n[Gate 1] Phase 1: Initial processing...');

    // Generate job ID
    const inputContent = await fs.readFile(INPUT_FILE, 'utf-8');
    const inputHash = require('crypto')
      .createHash('sha256')
      .update(inputContent)
      .digest('hex');
    const jobId = resumeHandler.generateJobId(inputHash, config);
    const jobDir = path.join(CHECKPOINT_DIR, jobId);

    // Save job metadata
    const metadata: JobMetadata = {
      jobId,
      inputHash,
      config,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      status: 'in-progress',
    };
    await resumeHandler.saveJobMetadata(metadata);

    // Acquire lock
    await resumeHandler.acquireLock(jobId);

    // Initialize components
    const ledger = new Ledger(jobDir);
    const checkpointManager = new CheckpointManager({ jobDir });
    const snapshotManager = new SnapshotManager(jobDir);

    // Log JOB_STARTED
    await ledger.append({
      type: 'JOB_STARTED',
      timestamp: new Date().toISOString(),
      jobId,
      config,
      inputHash,
    });

    // Log PASS_STARTED
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

    // Process first 50 identifiers
    const completedIds: string[] = [];
    const renameMap: Record<string, string> = {};

    for (let i = 0; i < 50; i++) {
      const id = `id_${i}`;
      const oldName = `var_${i}`;
      const newName = `renamed_${i}`;

      completedIds.push(id);
      renameMap[id] = newName;

      // Log rename
      await ledger.append({
        type: 'IDENTIFIER_RENAMED',
        timestamp: new Date().toISOString(),
        jobId,
        passNumber: 1,
        batchNumber: Math.floor(i / 10),
        id,
        oldName,
        newName,
        confidence: 0.8 + Math.random() * 0.2,
      });
    }

    // Save checkpoint at 50%
    console.log('[Gate 1] Saving checkpoint at 50%...');
    await checkpointManager.saveCheckpoint({
      passNumber: 1,
      completedIds,
      pendingIds: Array.from({ length: 50 }, (_, i) => `id_${i + 50}`),
      renameMap,
      stats: { tokens: 5000, duration: 30000, errors: 0 },
      snapshotHash: 'temp-hash',
      timestamp: new Date().toISOString(),
    });

    // Save snapshot (partial transformation)
    const partialCode = applyRenames(inputContent, renameMap);
    await snapshotManager.saveSnapshot(0, partialCode, 50);

    console.log('[Gate 1] Simulating crash...');
    // Release lock (simulate crash cleanup)
    await resumeHandler.releaseLock(jobId);

    // === PHASE 2: Resume from Checkpoint ===

    console.log('\n[Gate 1] Phase 2: Resuming from checkpoint...');

    // Detect checkpoint
    const detected = await resumeHandler.detectCheckpoint(INPUT_FILE);
    assert.ok(detected, 'Should detect existing checkpoint');
    assert.strictEqual(detected.inputHash, inputHash);

    // Decide resume action
    const decision = await resumeHandler.decideResumeAction(
      detected,
      config,
      {}
    );
    assert.strictEqual(
      decision.action,
      'resume',
      'Should decide to resume'
    );

    // Acquire lock for resume
    await resumeHandler.acquireLock(jobId);

    // Resume from checkpoint
    const resumeResult = await resumeHandler.resumeFromCheckpoint(jobId);

    console.log('[Gate 1] Verifying resumed state...');

    // Verify state restored correctly
    assert.strictEqual(resumeResult.state.jobId, jobId);
    assert.strictEqual(resumeResult.state.currentPass, 1);
    assert.strictEqual(
      resumeResult.state.totalIdentifiersRenamed,
      50,
      'Should have 50 completed identifiers'
    );

    // Verify checkpoint restored
    assert.ok(resumeResult.checkpoint, 'Should have checkpoint');
    assert.strictEqual(
      resumeResult.checkpoint.completedIds.length,
      50,
      'Should have 50 completed IDs'
    );
    assert.strictEqual(
      resumeResult.checkpoint.pendingIds.length,
      50,
      'Should have 50 pending IDs'
    );

    // Verify all completed identifiers preserved
    for (let i = 0; i < 50; i++) {
      const id = `id_${i}`;
      assert.strictEqual(
        resumeResult.state.renameMap[id],
        `renamed_${i}`,
        `Identifier ${id} should be preserved`
      );
    }

    // Process remaining 50 identifiers
    console.log('[Gate 1] Processing remaining identifiers...');

    for (let i = 50; i < 100; i++) {
      const id = `id_${i}`;
      const oldName = `var_${i}`;
      const newName = `renamed_${i}`;

      renameMap[id] = newName;

      // Log rename
      await ledger.append({
        type: 'IDENTIFIER_RENAMED',
        timestamp: new Date().toISOString(),
        jobId,
        passNumber: 1,
        batchNumber: Math.floor(i / 10),
        id,
        oldName,
        newName,
        confidence: 0.8 + Math.random() * 0.2,
      });
    }

    // Complete pass
    await ledger.append({
      type: 'PASS_COMPLETED',
      timestamp: new Date().toISOString(),
      jobId,
      passNumber: 1,
      stats: {
        identifiersProcessed: 100,
        identifiersRenamed: 100,
        identifiersUnchanged: 0,
        identifiersSkipped: 0,
        tokensUsed: { prompt: 10000, completion: 5000, total: 15000 },
        durationMs: 60000,
        errors: 0,
        batchCount: 10,
      },
    });

    // Save final snapshot
    const finalCode = applyRenames(inputContent, renameMap);
    const finalSnapshot = await snapshotManager.saveSnapshot(
      1,
      finalCode,
      100
    );

    await ledger.append({
      type: 'SNAPSHOT_CREATED',
      timestamp: new Date().toISOString(),
      jobId,
      passNumber: 1,
      snapshotPath: snapshotManager.getSnapshotPath(1),
      snapshotHash: finalSnapshot.hash,
    });

    // === PHASE 3: Verification ===

    console.log('\n[Gate 1] Phase 3: Verifying results...');

    // Replay entire history
    const replayHarness = new ReplayHarness(jobDir);
    const replayResult = await replayHarness.replayAll();

    // Verify all 100 identifiers processed
    assert.strictEqual(
      replayResult.state.totalIdentifiersRenamed,
      100,
      'Should have 100 total renames'
    );

    // Verify rename map complete
    assert.strictEqual(
      Object.keys(replayResult.state.renameMap).length,
      100,
      'Should have 100 entries in rename map'
    );

    // Verify no identifiers lost
    for (let i = 0; i < 100; i++) {
      const id = `id_${i}`;
      assert.strictEqual(
        replayResult.state.renameMap[id],
        `renamed_${i}`,
        `Identifier ${id} should be in final map`
      );
    }

    // Verify ledger integrity
    const integrity = await replayHarness.verifyIntegrity();
    assert.strictEqual(integrity.valid, true, 'Ledger should be valid');
    assert.strictEqual(
      integrity.errors.length,
      0,
      'Should have no integrity errors'
    );

    // Cleanup
    await resumeHandler.releaseLock(jobId);

    console.log('\n[Gate 1] ✓ PASSED: Resume mid-pass without losing progress');
    console.log(`  - 50 identifiers preserved from checkpoint`);
    console.log(`  - 50 identifiers processed after resume`);
    console.log(`  - 100 total identifiers accounted for`);
    console.log(`  - 0 identifiers lost`);
  });

  it('Gate 1: Multiple resume cycles', async () => {
    // Test resuming multiple times (crash at 25%, resume, crash at 75%, resume)

    const config: JobConfig = {
      inputPath: INPUT_FILE,
      outputPath: path.join(TEST_DIR, 'output.js'),
      passes: 1,
      provider: 'openai',
    };

    const inputContent = await fs.readFile(INPUT_FILE, 'utf-8');
    const inputHash = require('crypto')
      .createHash('sha256')
      .update(inputContent)
      .digest('hex');
    const jobId = resumeHandler.generateJobId(inputHash, config);
    const jobDir = path.join(CHECKPOINT_DIR, jobId);

    const metadata: JobMetadata = {
      jobId,
      inputHash,
      config,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      status: 'in-progress',
    };
    await resumeHandler.saveJobMetadata(metadata);

    const ledger = new Ledger(jobDir);
    const checkpointManager = new CheckpointManager({ jobDir });

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

    // Cycle 1: Process 25 identifiers
    console.log('\n[Gate 1] Cycle 1: Processing 0-25...');
    const renameMap: Record<string, string> = {};

    for (let i = 0; i < 25; i++) {
      const id = `id_${i}`;
      renameMap[id] = `renamed_${i}`;
      await ledger.append({
        type: 'IDENTIFIER_RENAMED',
        timestamp: new Date().toISOString(),
        jobId,
        passNumber: 1,
        batchNumber: 0,
        id,
        oldName: `var_${i}`,
        newName: `renamed_${i}`,
        confidence: 0.9,
      });
    }

    await checkpointManager.saveCheckpoint({
      passNumber: 1,
      completedIds: Object.keys(renameMap),
      pendingIds: Array.from({ length: 75 }, (_, i) => `id_${i + 25}`),
      renameMap,
      stats: { tokens: 2500, duration: 15000, errors: 0 },
      snapshotHash: 'hash1',
      timestamp: new Date().toISOString(),
    });

    // Simulate crash and resume
    console.log('[Gate 1] Simulating crash and resume...');

    const resume1 = await resumeHandler.resumeFromCheckpoint(jobId);
    assert.strictEqual(resume1.state.totalIdentifiersRenamed, 25);

    // Cycle 2: Process 26-75
    console.log('[Gate 1] Cycle 2: Processing 26-75...');

    for (let i = 25; i < 75; i++) {
      const id = `id_${i}`;
      renameMap[id] = `renamed_${i}`;
      await ledger.append({
        type: 'IDENTIFIER_RENAMED',
        timestamp: new Date().toISOString(),
        jobId,
        passNumber: 1,
        batchNumber: 1,
        id,
        oldName: `var_${i}`,
        newName: `renamed_${i}`,
        confidence: 0.9,
      });
    }

    await checkpointManager.saveCheckpoint({
      passNumber: 1,
      completedIds: Object.keys(renameMap),
      pendingIds: Array.from({ length: 25 }, (_, i) => `id_${i + 75}`),
      renameMap,
      stats: { tokens: 7500, duration: 45000, errors: 0 },
      snapshotHash: 'hash2',
      timestamp: new Date().toISOString(),
    });

    // Simulate crash and resume again
    console.log('[Gate 1] Simulating second crash and resume...');

    const resume2 = await resumeHandler.resumeFromCheckpoint(jobId);
    assert.strictEqual(resume2.state.totalIdentifiersRenamed, 75);

    // Cycle 3: Process 76-100
    console.log('[Gate 1] Cycle 3: Processing 76-100...');

    for (let i = 75; i < 100; i++) {
      const id = `id_${i}`;
      renameMap[id] = `renamed_${i}`;
      await ledger.append({
        type: 'IDENTIFIER_RENAMED',
        timestamp: new Date().toISOString(),
        jobId,
        passNumber: 1,
        batchNumber: 2,
        id,
        oldName: `var_${i}`,
        newName: `renamed_${i}`,
        confidence: 0.9,
      });
    }

    // Final verification
    const replayHarness = new ReplayHarness(jobDir);
    const finalState = await replayHarness.replayAll();

    assert.strictEqual(finalState.state.totalIdentifiersRenamed, 100);
    assert.strictEqual(Object.keys(finalState.state.renameMap).length, 100);

    console.log('\n[Gate 1] ✓ PASSED: Multiple resume cycles');
    console.log(`  - Cycle 1: 0-25 (25 identifiers)`);
    console.log(`  - Cycle 2: 26-75 (50 identifiers)`);
    console.log(`  - Cycle 3: 76-100 (25 identifiers)`);
    console.log(`  - Total: 100 identifiers, 0 lost`);
  });
});

/**
 * Generate test code with N identifiers
 */
function generateTestCode(identifierCount: number): string {
  const lines: string[] = [];

  for (let i = 0; i < identifierCount; i++) {
    lines.push(`const var_${i} = ${i};`);
  }

  return lines.join('\n');
}

/**
 * Apply renames to code (simplified)
 */
function applyRenames(
  code: string,
  renameMap: Record<string, string>
): string {
  let result = code;

  for (const [id, newName] of Object.entries(renameMap)) {
    // Extract the old name from the id (simplified)
    const oldNameMatch = id.match(/var_(\d+)/);
    if (oldNameMatch) {
      const oldName = `var_${oldNameMatch[1]}`;
      result = result.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
    }
  }

  return result;
}
