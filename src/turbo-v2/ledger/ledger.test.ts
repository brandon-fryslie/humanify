import test from "node:test";
import assert from "node:assert";
import { existsSync, mkdirSync, rmdirSync, unlinkSync, writeFileSync, readdirSync, appendFileSync } from "fs";
import { Ledger } from "./ledger.js";
import {
  LedgerEvent,
  JobStartedEvent,
  PassStartedEvent,
  IdentifierRenamedEvent,
  PassCompletedEvent,
  JobCompletedEvent,
  serializeEvent,
} from "./events.js";

/**
 * LEDGER UNIT TESTS
 *
 * These tests validate the Ledger implementation for Sprint 3:
 * - D3.1: Ledger Core (append, replay, getState, fsync, recovery)
 * - D3.2: Event Types and Schemas (all 8 event types)
 * - D3.3: Ledger Unit Tests (all acceptance criteria)
 *
 * Test Coverage:
 * 1. Append and replay preserves order
 * 2. Partial EOF line discarded
 * 3. State correctly reconstructed
 * 4. 10,000 events replay in < 1 second
 * 5. Event type validation
 * 6. Crash recovery scenarios
 */

const TEST_JOB_DIR = ".humanify-checkpoints-test/test-job";

test.beforeEach(() => {
  // Create test job directory
  if (!existsSync(TEST_JOB_DIR)) {
    mkdirSync(TEST_JOB_DIR, { recursive: true });
  }

  // Clean existing test files
  cleanTestJobDir();
});

test.afterEach(() => {
  // Cleanup test directory
  cleanTestJobDir();
  try {
    rmdirSync(TEST_JOB_DIR);
    rmdirSync(".humanify-checkpoints-test");
  } catch {
    // Ignore errors during cleanup
  }
});

function cleanTestJobDir() {
  if (existsSync(TEST_JOB_DIR)) {
    const files = readdirSync(TEST_JOB_DIR);
    for (const file of files) {
      try {
        unlinkSync(`${TEST_JOB_DIR}/${file}`);
      } catch {
        // Ignore errors
      }
    }
  }
}

/**
 * TEST 1: Append and Replay Preserves Order
 * Validates that events are replayed in the same order they were appended
 */
test("Ledger should append and replay events in order", async () => {
  const ledger = new Ledger(TEST_JOB_DIR);

  const events: LedgerEvent[] = [
    {
      type: "JOB_STARTED",
      timestamp: new Date().toISOString(),
      jobId: "test-job-1",
      config: { inputPath: "input.js", outputPath: "output.js", passes: 2, provider: "openai" },
      inputHash: "abc123",
    },
    {
      type: "PASS_STARTED",
      timestamp: new Date().toISOString(),
      jobId: "test-job-1",
      passNumber: 1,
      passConfig: { processor: "rename", mode: "parallel", concurrency: 50 },
      identifierCount: 100,
    },
    {
      type: "IDENTIFIER_RENAMED",
      timestamp: new Date().toISOString(),
      jobId: "test-job-1",
      passNumber: 1,
      batchNumber: 0,
      id: "binding_1_loc_10",
      oldName: "a",
      newName: "config",
      confidence: 0.85,
    },
    {
      type: "PASS_COMPLETED",
      timestamp: new Date().toISOString(),
      jobId: "test-job-1",
      passNumber: 1,
      stats: {
        identifiersProcessed: 100,
        identifiersRenamed: 90,
        identifiersUnchanged: 10,
        identifiersSkipped: 0,
        tokensUsed: { prompt: 1000, completion: 500, total: 1500 },
        durationMs: 5000,
        errors: 0,
        batchCount: 5,
      },
    },
  ];

  // Append events
  for (const event of events) {
    await ledger.append(event);
  }

  // Replay and verify order
  const replayed: LedgerEvent[] = [];
  for await (const event of ledger.replay()) {
    replayed.push(event);
  }

  assert.strictEqual(replayed.length, events.length, "Should replay all events");

  for (let i = 0; i < events.length; i++) {
    assert.deepStrictEqual(replayed[i], events[i], `Event ${i} should match`);
  }
});

/**
 * TEST 2: Partial EOF Line Discarded
 * Validates that incomplete lines at end of file are ignored
 */
test("Ledger should discard partial line at EOF", async () => {
  const ledger = new Ledger(TEST_JOB_DIR);

  // Append valid event
  const validEvent: JobStartedEvent = {
    type: "JOB_STARTED",
    timestamp: new Date().toISOString(),
    jobId: "test-job-2",
    config: { inputPath: "input.js", outputPath: "output.js", passes: 2, provider: "openai" },
    inputHash: "abc123",
  };

  await ledger.append(validEvent);

  // Manually append incomplete line (simulates crash during write)
  const eventsPath = ledger.getEventsPath();
  appendFileSync(eventsPath, '{"type":"PASS_STARTED","timestamp":"2025-', "utf-8");

  // Replay should only return valid event, skip partial line
  const replayed: LedgerEvent[] = [];
  for await (const event of ledger.replay()) {
    replayed.push(event);
  }

  assert.strictEqual(replayed.length, 1, "Should only replay complete events");
  assert.deepStrictEqual(replayed[0], validEvent);
});

/**
 * TEST 3: State Correctly Reconstructed
 * Validates that getState() rebuilds state from events
 */
test("Ledger should correctly reconstruct state from events", async () => {
  const ledger = new Ledger(TEST_JOB_DIR);

  const jobId = "test-job-3";

  // Append sequence of events simulating a job
  await ledger.append({
    type: "JOB_STARTED",
    timestamp: new Date().toISOString(),
    jobId,
    config: { inputPath: "input.js", outputPath: "output.js", passes: 2, provider: "openai" },
    inputHash: "abc123",
  });

  await ledger.append({
    type: "PASS_STARTED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 1,
    passConfig: { processor: "rename", mode: "parallel", concurrency: 50 },
    identifierCount: 3,
  });

  await ledger.append({
    type: "IDENTIFIER_RENAMED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 1,
    batchNumber: 0,
    id: "id_1",
    oldName: "a",
    newName: "config",
    confidence: 0.85,
  });

  await ledger.append({
    type: "IDENTIFIER_RENAMED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 1,
    batchNumber: 0,
    id: "id_2",
    oldName: "b",
    newName: "handler",
    confidence: 0.90,
  });

  await ledger.append({
    type: "IDENTIFIER_RENAMED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 1,
    batchNumber: 0,
    id: "id_3",
    oldName: "c",
    newName: "data",
    confidence: 0.75,
  });

  await ledger.append({
    type: "PASS_COMPLETED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 1,
    stats: {
      identifiersProcessed: 3,
      identifiersRenamed: 3,
      identifiersUnchanged: 0,
      identifiersSkipped: 0,
      tokensUsed: { prompt: 300, completion: 150, total: 450 },
      durationMs: 2000,
      errors: 0,
      batchCount: 1,
    },
  });

  // Start pass 2
  await ledger.append({
    type: "PASS_STARTED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 2,
    passConfig: { processor: "refine", mode: "parallel", concurrency: 50 },
    identifierCount: 3,
  });

  await ledger.append({
    type: "IDENTIFIER_RENAMED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 2,
    batchNumber: 0,
    id: "id_1",
    oldName: "config",
    newName: "configuration",
    confidence: 0.95,
  });

  await ledger.append({
    type: "PASS_COMPLETED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 2,
    stats: {
      identifiersProcessed: 3,
      identifiersRenamed: 1,
      identifiersUnchanged: 2,
      identifiersSkipped: 0,
      tokensUsed: { prompt: 300, completion: 150, total: 450 },
      durationMs: 1500,
      errors: 0,
      batchCount: 1,
    },
  });

  await ledger.append({
    type: "JOB_COMPLETED",
    timestamp: new Date().toISOString(),
    jobId,
    totalPasses: 2,
    totalDurationMs: 3500,
    finalSnapshotPath: "snapshots/after-pass-2.js",
    success: true,
  });

  // Reconstruct state
  const state = await ledger.getState();

  assert.strictEqual(state.jobId, jobId);
  assert.strictEqual(state.currentPass, 2);
  assert.strictEqual(state.completedPasses, 2);
  assert.strictEqual(state.jobComplete, true);
  assert.strictEqual(state.totalIdentifiersRenamed, 4); // 3 in pass 1, 1 in pass 2

  // Verify rename map (pass 2 overwrites pass 1 for id_1)
  assert.strictEqual(state.renameMap["id_1"], "configuration");
  assert.strictEqual(state.renameMap["id_2"], "handler");
  assert.strictEqual(state.renameMap["id_3"], "data");

  // Verify token count
  assert.strictEqual(state.totalTokensUsed, 900); // 450 + 450
});

/**
 * TEST 4: Performance - 10,000 Events Replay < 1 Second
 * Validates that ledger can handle large event volumes efficiently
 */
test("Ledger should replay 10,000 events in < 1 second", async () => {
  const ledger = new Ledger(TEST_JOB_DIR);

  const jobId = "test-job-4";
  const eventCount = 10000;

  // Append JOB_STARTED
  await ledger.append({
    type: "JOB_STARTED",
    timestamp: new Date().toISOString(),
    jobId,
    config: { inputPath: "input.js", outputPath: "output.js", passes: 1, provider: "openai" },
    inputHash: "abc123",
  });

  // Append PASS_STARTED
  await ledger.append({
    type: "PASS_STARTED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 1,
    passConfig: { processor: "rename", mode: "parallel", concurrency: 50 },
    identifierCount: eventCount - 2,
  });

  // Append many IDENTIFIER_RENAMED events
  for (let i = 0; i < eventCount - 2; i++) {
    await ledger.append({
      type: "IDENTIFIER_RENAMED",
      timestamp: new Date().toISOString(),
      jobId,
      passNumber: 1,
      batchNumber: Math.floor(i / 100),
      id: `id_${i}`,
      oldName: `var${i}`,
      newName: `renamed${i}`,
      confidence: 0.8,
    });
  }

  // Measure replay time
  const startTime = Date.now();
  let count = 0;
  for await (const event of ledger.replay()) {
    count++;
  }
  const duration = Date.now() - startTime;

  assert.strictEqual(count, eventCount, `Should replay all ${eventCount} events`);
  assert.ok(duration < 1000, `Replay should take < 1 second, took ${duration}ms`);

  console.log(`[ledger-test] Replayed ${eventCount} events in ${duration}ms`);
});

/**
 * TEST 5: Event Type Validation
 * Validates all 8 event types can be serialized and deserialized
 */
test("Ledger should handle all 8 event types", async () => {
  const ledger = new Ledger(TEST_JOB_DIR);

  const jobId = "test-job-5";
  const timestamp = new Date().toISOString();

  const events: LedgerEvent[] = [
    {
      type: "JOB_STARTED",
      timestamp,
      jobId,
      config: { inputPath: "input.js", outputPath: "output.js", passes: 2, provider: "openai" },
      inputHash: "abc123",
    },
    {
      type: "PASS_STARTED",
      timestamp,
      jobId,
      passNumber: 1,
      passConfig: { processor: "rename", mode: "parallel", concurrency: 50 },
      identifierCount: 100,
    },
    {
      type: "BATCH_STARTED",
      timestamp,
      jobId,
      passNumber: 1,
      batchNumber: 0,
      identifierIds: ["id_1", "id_2", "id_3"],
    },
    {
      type: "IDENTIFIER_RENAMED",
      timestamp,
      jobId,
      passNumber: 1,
      batchNumber: 0,
      id: "id_1",
      oldName: "a",
      newName: "config",
      confidence: 0.85,
    },
    {
      type: "BATCH_COMPLETED",
      timestamp,
      jobId,
      passNumber: 1,
      batchNumber: 0,
      stats: {
        identifiersProcessed: 3,
        identifiersRenamed: 3,
        identifiersUnchanged: 0,
        identifiersSkipped: 0,
        tokensUsed: { prompt: 100, completion: 50, total: 150 },
        durationMs: 500,
        errors: 0,
      },
    },
    {
      type: "PASS_COMPLETED",
      timestamp,
      jobId,
      passNumber: 1,
      stats: {
        identifiersProcessed: 100,
        identifiersRenamed: 90,
        identifiersUnchanged: 10,
        identifiersSkipped: 0,
        tokensUsed: { prompt: 1000, completion: 500, total: 1500 },
        durationMs: 5000,
        errors: 0,
        batchCount: 5,
      },
    },
    {
      type: "SNAPSHOT_CREATED",
      timestamp,
      jobId,
      passNumber: 1,
      snapshotPath: "snapshots/after-pass-1.js",
      snapshotHash: "sha256hash",
    },
    {
      type: "JOB_COMPLETED",
      timestamp,
      jobId,
      totalPasses: 2,
      totalDurationMs: 10000,
      finalSnapshotPath: "snapshots/after-pass-2.js",
      success: true,
    },
  ];

  // Append all events
  for (const event of events) {
    await ledger.append(event);
  }

  // Replay and verify all types
  const replayed: LedgerEvent[] = [];
  for await (const event of ledger.replay()) {
    replayed.push(event);
  }

  assert.strictEqual(replayed.length, 8, "Should replay all 8 event types");

  const eventTypes = replayed.map((e) => e.type);
  assert.deepStrictEqual(eventTypes, [
    "JOB_STARTED",
    "PASS_STARTED",
    "BATCH_STARTED",
    "IDENTIFIER_RENAMED",
    "BATCH_COMPLETED",
    "PASS_COMPLETED",
    "SNAPSHOT_CREATED",
    "JOB_COMPLETED",
  ]);
});

/**
 * TEST 6: Crash Recovery - Empty Ledger
 * Validates that new ledger starts cleanly
 */
test("Ledger should handle empty ledger gracefully", async () => {
  const ledger = new Ledger(TEST_JOB_DIR);

  // Replay empty ledger
  const events: LedgerEvent[] = [];
  for await (const event of ledger.replay()) {
    events.push(event);
  }

  assert.strictEqual(events.length, 0, "Empty ledger should yield no events");

  // Get state from empty ledger
  const state = await ledger.getState();
  assert.strictEqual(state.jobId, "");
  assert.strictEqual(state.currentPass, 0);
  assert.strictEqual(state.completedPasses, 0);
  assert.strictEqual(state.totalIdentifiersRenamed, 0);
  assert.strictEqual(state.jobComplete, false);
});

/**
 * TEST 7: Crash Recovery - Invalid JSON Lines
 * Validates that invalid lines are skipped with warnings
 */
test("Ledger should skip invalid JSON lines", async () => {
  const ledger = new Ledger(TEST_JOB_DIR);

  // Append valid event
  await ledger.append({
    type: "JOB_STARTED",
    timestamp: new Date().toISOString(),
    jobId: "test-job-7",
    config: { inputPath: "input.js", outputPath: "output.js", passes: 2, provider: "openai" },
    inputHash: "abc123",
  });

  // Manually append invalid JSON
  const eventsPath = ledger.getEventsPath();
  appendFileSync(eventsPath, "{invalid json}\n", "utf-8");

  // Append another valid event
  await ledger.append({
    type: "PASS_STARTED",
    timestamp: new Date().toISOString(),
    jobId: "test-job-7",
    passNumber: 1,
    passConfig: { processor: "rename", mode: "parallel", concurrency: 50 },
    identifierCount: 100,
  });

  // Replay should skip invalid line
  const events: LedgerEvent[] = [];
  for await (const event of ledger.replay()) {
    events.push(event);
  }

  assert.strictEqual(events.length, 2, "Should replay only valid events");
  assert.strictEqual(events[0].type, "JOB_STARTED");
  assert.strictEqual(events[1].type, "PASS_STARTED");
});

/**
 * TEST 8: Ledger Validation
 * Validates that validate() checks ledger integrity
 */
test("Ledger.validate should return true for valid ledger", async () => {
  const ledger = new Ledger(TEST_JOB_DIR);

  await ledger.append({
    type: "JOB_STARTED",
    timestamp: new Date().toISOString(),
    jobId: "test-job-8",
    config: { inputPath: "input.js", outputPath: "output.js", passes: 2, provider: "openai" },
    inputHash: "abc123",
  });

  const isValid = await ledger.validate();
  assert.strictEqual(isValid, true, "Valid ledger should pass validation");
});

/**
 * TEST 9: Count Events
 * Validates countEvents() utility method
 */
test("Ledger.countEvents should return correct count", async () => {
  const ledger = new Ledger(TEST_JOB_DIR);

  assert.strictEqual(await ledger.countEvents(), 0, "Empty ledger should have 0 events");

  await ledger.append({
    type: "JOB_STARTED",
    timestamp: new Date().toISOString(),
    jobId: "test-job-9",
    config: { inputPath: "input.js", outputPath: "output.js", passes: 2, provider: "openai" },
    inputHash: "abc123",
  });

  assert.strictEqual(await ledger.countEvents(), 1, "Should count 1 event");

  await ledger.append({
    type: "PASS_STARTED",
    timestamp: new Date().toISOString(),
    jobId: "test-job-9",
    passNumber: 1,
    passConfig: { processor: "rename", mode: "parallel", concurrency: 50 },
    identifierCount: 100,
  });

  assert.strictEqual(await ledger.countEvents(), 2, "Should count 2 events");
});

/**
 * TEST 10: Multi-Pass Rename Overwrites
 * Validates that later passes overwrite earlier renames in state
 */
test("Ledger state should reflect latest rename for each identifier", async () => {
  const ledger = new Ledger(TEST_JOB_DIR);

  const jobId = "test-job-10";

  await ledger.append({
    type: "JOB_STARTED",
    timestamp: new Date().toISOString(),
    jobId,
    config: { inputPath: "input.js", outputPath: "output.js", passes: 3, provider: "openai" },
    inputHash: "abc123",
  });

  // Pass 1: Rename id_1 to "config"
  await ledger.append({
    type: "PASS_STARTED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 1,
    passConfig: { processor: "rename", mode: "parallel", concurrency: 50 },
    identifierCount: 1,
  });

  await ledger.append({
    type: "IDENTIFIER_RENAMED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 1,
    batchNumber: 0,
    id: "id_1",
    oldName: "a",
    newName: "config",
    confidence: 0.7,
  });

  await ledger.append({
    type: "PASS_COMPLETED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 1,
    stats: {
      identifiersProcessed: 1,
      identifiersRenamed: 1,
      identifiersUnchanged: 0,
      identifiersSkipped: 0,
      tokensUsed: { prompt: 100, completion: 50, total: 150 },
      durationMs: 500,
      errors: 0,
      batchCount: 1,
    },
  });

  // Pass 2: Rename id_1 to "configuration"
  await ledger.append({
    type: "PASS_STARTED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 2,
    passConfig: { processor: "refine", mode: "parallel", concurrency: 50 },
    identifierCount: 1,
  });

  await ledger.append({
    type: "IDENTIFIER_RENAMED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 2,
    batchNumber: 0,
    id: "id_1",
    oldName: "config",
    newName: "configuration",
    confidence: 0.9,
  });

  await ledger.append({
    type: "PASS_COMPLETED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 2,
    stats: {
      identifiersProcessed: 1,
      identifiersRenamed: 1,
      identifiersUnchanged: 0,
      identifiersSkipped: 0,
      tokensUsed: { prompt: 100, completion: 50, total: 150 },
      durationMs: 500,
      errors: 0,
      batchCount: 1,
    },
  });

  // Pass 3: Rename id_1 to "appConfiguration"
  await ledger.append({
    type: "PASS_STARTED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 3,
    passConfig: { processor: "refine", mode: "parallel", concurrency: 50 },
    identifierCount: 1,
  });

  await ledger.append({
    type: "IDENTIFIER_RENAMED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 3,
    batchNumber: 0,
    id: "id_1",
    oldName: "configuration",
    newName: "appConfiguration",
    confidence: 0.95,
  });

  await ledger.append({
    type: "PASS_COMPLETED",
    timestamp: new Date().toISOString(),
    jobId,
    passNumber: 3,
    stats: {
      identifiersProcessed: 1,
      identifiersRenamed: 1,
      identifiersUnchanged: 0,
      identifiersSkipped: 0,
      tokensUsed: { prompt: 100, completion: 50, total: 150 },
      durationMs: 500,
      errors: 0,
      batchCount: 1,
    },
  });

  const state = await ledger.getState();

  // State should reflect latest rename
  assert.strictEqual(state.renameMap["id_1"], "appConfiguration");
  assert.strictEqual(state.totalIdentifiersRenamed, 3); // Counts all renames, not unique IDs
  assert.strictEqual(state.completedPasses, 3);
});
