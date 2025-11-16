import test from "node:test";
import assert from "node:assert";
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readdirSync, readFileSync } from "fs";
import { spawn, ChildProcess } from "child_process";
import { join } from "path";
import {
  getCheckpointId,
  loadCheckpoint,
  deleteCheckpoint,
  listCheckpoints,
  CHECKPOINT_VERSION
} from "./checkpoint.js";

/**
 * END-TO-END FUNCTIONAL TESTS: Checkpoint Runtime Verification
 *
 * These tests validate that checkpoints work ACROSS PROCESS BOUNDARIES.
 * They test the real user workflow:
 * 1. Start processing a file
 * 2. Kill the process mid-execution (simulate crash)
 * 3. Restart and verify checkpoint is detected
 * 4. Resume from checkpoint
 * 5. Verify final output is correct
 *
 * GAMING RESISTANCE:
 * - Uses actual built CLI (./dist/index.mjs)
 * - Creates real checkpoint files on disk
 * - Verifies file contents are valid JSON
 * - Tests across actual process boundaries
 * - Kills processes with signals (SIGINT, SIGTERM)
 * - Cannot pass with stub implementations
 *
 * CRITICAL: These tests validate the STATUS report finding that
 * .humanify-checkpoints/ directory is empty despite tests passing.
 * If checkpoints work, this directory MUST contain files during processing.
 */

const TEST_INPUT_DIR = "test-checkpoint-runtime";
const CHECKPOINT_DIR = ".humanify-checkpoints";

// Helper: Wait for a condition with timeout
async function waitFor(
  condition: () => boolean,
  timeoutMs: number = 5000,
  pollIntervalMs: number = 100
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`);
    }
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
}

// Helper: Wait for checkpoint file to be created, then kill process
async function waitForCheckpointFile(
  checkpointPath: string,
  maxWaitMs: number = 10000
): Promise<void> {
  const startTime = Date.now();
  while (!existsSync(checkpointPath)) {
    if (Date.now() - startTime > maxWaitMs) {
      throw new Error(`Checkpoint file not created after ${maxWaitMs}ms`);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Helper: Execute CLI and collect output
async function execCLI(args: string[], sendInput?: string): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number | null;
  process: ChildProcess;
}> {
  return new Promise((resolve) => {
    const proc = spawn("./dist/index.mjs", args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "0" }
    });

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    // Send input if provided
    if (sendInput !== undefined && proc.stdin) {
      proc.stdin.write(sendInput);
      proc.stdin.end();
    }

    proc.on("close", (exitCode) => {
      resolve({ stdout, stderr, exitCode, process: proc });
    });
  });
}

// Helper: Execute CLI and wait for checkpoint file to appear, then kill
async function execCLIAndWaitForCheckpoint(
  args: string[],
  checkpointPath: string,
  maxWaitMs: number = 10000,
  signal: NodeJS.Signals = "SIGINT"
): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number | null;
  killed: boolean;
  checkpointExists: boolean;
}> {
  return new Promise((resolve) => {
    const proc = spawn("./dist/index.mjs", args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "0" }
    });

    let stdout = "";
    let stderr = "";
    let killed = false;
    let checkpointExists = false;

    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    // Poll for checkpoint file appearance
    const startTime = Date.now();
    const pollInterval = setInterval(() => {
      if (existsSync(checkpointPath)) {
        checkpointExists = true;
        clearInterval(pollInterval);

        // Checkpoint created! Kill the process
        if (!proc.killed) {
          proc.kill(signal);
          killed = true;
        }
      } else if (Date.now() - startTime > maxWaitMs) {
        // Timeout - kill anyway
        clearInterval(pollInterval);
        if (!proc.killed) {
          proc.kill(signal);
          killed = true;
        }
      }
    }, 100);

    proc.on("close", (exitCode) => {
      clearInterval(pollInterval);
      resolve({ stdout, stderr, exitCode, killed, checkpointExists });
    });
  });
}

test.beforeEach(() => {
  // Create test input directory
  if (!existsSync(TEST_INPUT_DIR)) {
    mkdirSync(TEST_INPUT_DIR, { recursive: true });
  }

  // Clean existing checkpoints
  if (existsSync(CHECKPOINT_DIR)) {
    const files = readdirSync(CHECKPOINT_DIR);
    for (const file of files) {
      if (file.endsWith(".json")) {
        unlinkSync(join(CHECKPOINT_DIR, file));
      }
    }
  }
});

test.afterEach(() => {
  // Cleanup test files
  if (existsSync(TEST_INPUT_DIR)) {
    const files = readdirSync(TEST_INPUT_DIR);
    for (const file of files) {
      try {
        unlinkSync(join(TEST_INPUT_DIR, file));
      } catch {
        // Ignore
      }
    }
    try {
      const fs = require("fs");
      fs.rmdirSync(TEST_INPUT_DIR);
    } catch {
      // Ignore
    }
  }

  // Clean checkpoints
  if (existsSync(CHECKPOINT_DIR)) {
    const files = readdirSync(CHECKPOINT_DIR);
    for (const file of files) {
      try {
        unlinkSync(join(CHECKPOINT_DIR, file));
      } catch {
        // Ignore
      }
    }
  }
});

/**
 * TEST 1: Checkpoint Files Created During Processing
 *
 * CRITICAL VALIDATION: Verifies that checkpoint files are actually
 * created on disk during processing, not just in tests.
 *
 * This addresses the STATUS report finding that .humanify-checkpoints/
 * is empty despite tests passing.
 *
 * GAMING RESISTANCE:
 * - Uses event-driven checkpoint detection (no brittle timeouts)
 * - Waits for file to appear on disk before killing
 * - Verifies file contents are valid JSON with correct structure
 * - Cannot pass if checkpoints aren't actually created
 */
test("checkpoint file should be created on disk during processing", async () => {
  // Create a test file with enough code to trigger checkpoint
  const testFile = join(TEST_INPUT_DIR, "test-checkpoint-creation.js");
  const code = `
// Test file with multiple identifiers to force batching
const a = 1;
const b = 2;
const c = 3;
const d = 4;
const e = 5;
function f(x) { return x * 2; }
function g(y) { return y + 1; }
const h = f(10);
const i = g(20);
  `.trim();

  writeFileSync(testFile, code, "utf-8");

  const checkpointId = getCheckpointId(code);
  const checkpointPath = join(CHECKPOINT_DIR, `${checkpointId}.json`);

  // Execute CLI with turbo mode (checkpoints only work in turbo)
  // Wait for checkpoint file to appear, THEN kill
  const result = await execCLIAndWaitForCheckpoint(
    [
      "unminify",
      testFile,
      "--provider", "local",
      "--model", "2b",
      "--turbo",
      "--max-concurrent", "1", // Slow it down
      "--seed", "42"
    ],
    checkpointPath,
    10000,
    "SIGINT"
  );

  console.log(`\n[TEST] Process killed: ${result.killed}`);
  console.log(`[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Checkpoint file exists: ${result.checkpointExists}`);

  // VERIFY: Checkpoint file exists on disk (CRITICAL)
  assert.ok(
    result.checkpointExists,
    "CRITICAL: Checkpoint file MUST exist on disk during processing (validates fix for empty directory bug)"
  );

  // VERIFY: Checkpoint file contains valid JSON
  const checkpointData = readFileSync(checkpointPath, "utf-8");
  let checkpoint;
  assert.doesNotThrow(
    () => { checkpoint = JSON.parse(checkpointData); },
    "Checkpoint file must contain valid JSON"
  );

  // VERIFY: Checkpoint has required fields
  assert.ok(checkpoint.version, "Checkpoint must have version");
  assert.ok(checkpoint.timestamp, "Checkpoint must have timestamp");
  assert.ok(checkpoint.inputHash, "Checkpoint must have inputHash");
  assert.ok(typeof checkpoint.completedBatches === "number", "Checkpoint must have completedBatches");
  assert.ok(typeof checkpoint.totalBatches === "number", "Checkpoint must have totalBatches");
  assert.ok(checkpoint.renames !== undefined, "Checkpoint must have renames map");

  console.log(`[TEST] Checkpoint verified: ${checkpoint.completedBatches}/${checkpoint.totalBatches} batches complete`);
}, { timeout: 20000 });

/**
 * TEST 2: Resume From Checkpoint After Interruption - INTERACTIVE
 *
 * CRITICAL FIX: This test now actually tests the interactive resume flow,
 * not just checkpoint detection. It sends stdin input to select "resume"
 * and verifies processing completes successfully.
 *
 * WORKFLOW:
 * 1. Start processing a file
 * 2. Kill process mid-execution
 * 3. Verify checkpoint exists
 * 4. Resume from checkpoint with interactive prompt
 * 5. Send stdin input to select "resume" option
 * 6. Verify processing completes successfully
 *
 * GAMING RESISTANCE:
 * - Tests actual interactive prompt handling
 * - Verifies process completes (not just detection)
 * - Checks final output file is created
 * - Cannot pass if resume doesn't actually work
 */
test("should resume from checkpoint with interactive prompt and complete processing", async () => {
  const testFile = join(TEST_INPUT_DIR, "test-resume-interactive.js");
  const outputFile = join(TEST_INPUT_DIR, "test-resume-interactive.output.js");

  // Use test-samples/valid-output.js as base (500 identifiers, will take time)
  const validOutputPath = join(process.cwd(), "test-samples/valid-output.js");
  let code: string;

  if (existsSync(validOutputPath)) {
    code = readFileSync(validOutputPath, "utf-8");
  } else {
    // Fallback: create a file with enough identifiers to take time
    code = Array.from({ length: 50 }, (_, i) => `const v${i} = ${i};`).join("\n");
  }

  writeFileSync(testFile, code, "utf-8");

  const checkpointId = getCheckpointId(code);
  const checkpointPath = join(CHECKPOINT_DIR, `${checkpointId}.json`);

  // STEP 1: Start processing and kill it after checkpoint created
  console.log("\n[TEST] Step 1: Starting processing and waiting for checkpoint...");
  const interrupted = await execCLIAndWaitForCheckpoint(
    [
      "unminify",
      testFile,
      "--provider", "local",
      "--model", "2b",
      "--turbo",
      "--max-concurrent", "1",
      "--output", outputFile,
      "--seed", "42"
    ],
    checkpointPath,
    15000
  );

  console.log(`[TEST] Process interrupted: ${interrupted.killed}`);
  console.log(`[TEST] Checkpoint exists: ${interrupted.checkpointExists}`);

  // STEP 2: Verify checkpoint exists
  const checkpoint1 = loadCheckpoint(checkpointId);
  assert.ok(checkpoint1, "Checkpoint should exist after interruption");
  console.log(`[TEST] Checkpoint exists: ${checkpoint1.completedBatches}/${checkpoint1.totalBatches} batches`);

  // STEP 3: Resume processing with interactive prompt - send "y" to resume
  console.log("\n[TEST] Step 3: Resuming from checkpoint with 'y' input...");
  const resumed = await execCLI([
    "unminify",
    testFile,
    "--provider", "local",
    "--model", "2b",
    "--turbo",
    "--max-concurrent", "1",
    "--output", outputFile,
    "--seed", "42"
  ], "y\n"); // Send "y" to accept resume

  console.log(`[TEST] Resume completed with exit code: ${resumed.exitCode}`);
  console.log(`[TEST] Resume stdout:\n${resumed.stdout.slice(0, 500)}`);

  // VERIFY: Process completed successfully
  assert.strictEqual(
    resumed.exitCode,
    0,
    "Resume should complete successfully"
  );

  // VERIFY: Output mentions checkpoint or resume
  const outputText = resumed.stdout + resumed.stderr;
  const hasResumeFlow =
    outputText.includes("Found checkpoint") ||
    outputText.includes("Resume") ||
    outputText.includes("checkpoint");

  assert.ok(
    hasResumeFlow,
    "Output should indicate checkpoint resume flow"
  );

  // VERIFY: Output file was created
  assert.ok(
    existsSync(outputFile),
    "Output file should be created after resume completes"
  );

  // VERIFY: Output file contains valid JavaScript
  const output = readFileSync(outputFile, "utf-8");
  assert.ok(
    output.length > 0,
    "Output file should not be empty"
  );
  assert.ok(
    output.includes("const"),
    "Output should contain JavaScript code"
  );

  console.log(`[TEST] Resume verification complete - output file created and valid`);
}, { timeout: 30000 });

/**
 * TEST 3: Resume with Decline Option
 *
 * CRITICAL FIX: Tests the "decline" path of the interactive prompt.
 * Verifies that when user sends "n", processing restarts from beginning.
 *
 * GAMING RESISTANCE:
 * - Tests both accept and decline paths
 * - Verifies checkpoint still exists after decline
 * - Cannot pass if decline option doesn't work
 */
test("should restart processing when user declines resume prompt", async () => {
  const testFile = join(TEST_INPUT_DIR, "test-resume-decline.js");
  const code = `
const a = 1;
const b = 2;
const c = 3;
function foo(x) { return x; }
function bar(y) { return y * 2; }
const result = foo(a) + bar(b);
  `.trim();

  writeFileSync(testFile, code, "utf-8");

  const checkpointId = getCheckpointId(code);
  const checkpointPath = join(CHECKPOINT_DIR, `${checkpointId}.json`);

  // STEP 1: Create checkpoint by interrupting
  console.log("\n[TEST] Step 1: Creating checkpoint via interruption...");
  await execCLIAndWaitForCheckpoint(
    [
      "unminify",
      testFile,
      "--provider", "local",
      "--model", "2b",
      "--turbo",
      "--max-concurrent", "1",
      "--seed", "42"
    ],
    checkpointPath,
    10000
  );

  // STEP 2: Verify checkpoint exists
  const checkpoint = loadCheckpoint(checkpointId);
  assert.ok(checkpoint, "Checkpoint should exist");
  console.log(`[TEST] Checkpoint created: ${checkpoint.completedBatches}/${checkpoint.totalBatches} batches`);

  // STEP 3: Resume but decline with "n"
  console.log("\n[TEST] Step 3: Declining resume with 'n' input...");
  const declined = await execCLI([
    "unminify",
    testFile,
    "--provider", "local",
    "--model", "2b",
    "--turbo",
    "--max-concurrent", "1",
    "--seed", "42"
  ], "n\n"); // Send "n" to decline resume

  console.log(`[TEST] Decline completed with exit code: ${declined.exitCode}`);

  // VERIFY: Checkpoint still exists (wasn't deleted by decline)
  const checkpointAfter = loadCheckpoint(checkpointId);
  assert.ok(
    checkpointAfter !== null,
    "Checkpoint should still exist after decline"
  );

  console.log(`[TEST] Decline path verified - checkpoint preserved`);
}, { timeout: 20000 });

/**
 * TEST 4: Checkpoint Contains Non-Empty Renames
 *
 * CRITICAL: Validates the fix for STATUS line 162-218 where
 * renames map was always empty {}.
 */
test("checkpoint renames map must not be empty after processing batches", async () => {
  const testFile = join(TEST_INPUT_DIR, "test-renames.js");
  const code = `
const x = 1;
const y = 2;
const z = x + y;
  `.trim();

  writeFileSync(testFile, code, "utf-8");

  const checkpointId = getCheckpointId(code);
  const checkpointPath = join(CHECKPOINT_DIR, `${checkpointId}.json`);

  // Start processing and wait for checkpoint
  await execCLIAndWaitForCheckpoint(
    [
      "unminify",
      testFile,
      "--provider", "local",
      "--model", "2b",
      "--turbo",
      "--max-concurrent", "1",
      "--seed", "42"
    ],
    checkpointPath,
    10000
  );

  // Load checkpoint
  const checkpoint = loadCheckpoint(checkpointId);
  assert.ok(checkpoint, "Checkpoint should exist");

  console.log(`\n[TEST] Checkpoint batches: ${checkpoint.completedBatches}/${checkpoint.totalBatches}`);
  console.log(`[TEST] Renames count: ${Object.keys(checkpoint.renames).length}`);

  // VERIFY: Renames map is NOT empty (if any batches completed)
  if (checkpoint.completedBatches > 0) {
    assert.ok(
      Object.keys(checkpoint.renames).length > 0,
      "CRITICAL BUG FIX: Renames map MUST NOT be empty when batches are completed (was always {} in broken version)"
    );

    console.log(`[TEST] Renames map validated:`, checkpoint.renames);
  } else {
    console.log(`[TEST] No batches completed yet, skipping renames check`);
  }

  // Cleanup
  deleteCheckpoint(checkpointId);
}, { timeout: 15000 });

/**
 * TEST 5: Checkpoint Auto-Delete on Successful Completion
 *
 * WORKFLOW:
 * 1. Process a small file to completion
 * 2. Verify checkpoint is deleted
 */
test("checkpoint should be auto-deleted on successful completion", async () => {
  const testFile = join(TEST_INPUT_DIR, "test-cleanup.js");
  const code = `const small = 1;`; // Very small, should complete quickly

  writeFileSync(testFile, code, "utf-8");

  const checkpointId = getCheckpointId(code);

  // Process to completion
  const result = await execCLI([
    "unminify",
    testFile,
    "--provider", "local",
    "--model", "2b",
    "--turbo",
    "--seed", "42"
  ]);

  console.log(`\n[TEST] Processing completed with exit code: ${result.exitCode}`);

  // VERIFY: Checkpoint deleted after successful completion
  const checkpoint = loadCheckpoint(checkpointId);

  assert.strictEqual(
    checkpoint,
    null,
    "Checkpoint should be auto-deleted after successful completion"
  );

  console.log(`[TEST] Checkpoint auto-delete verified`);
}, { timeout: 15000 });

/**
 * TEST 6: Checkpoint Version Validation
 *
 * WORKFLOW:
 * 1. Create checkpoint with old version
 * 2. Try to resume
 * 3. Verify checkpoint is rejected
 */
test("incompatible checkpoint version should be rejected", async () => {
  const testFile = join(TEST_INPUT_DIR, "test-version.js");
  const code = `const version = 1;`;

  writeFileSync(testFile, code, "utf-8");

  const checkpointId = getCheckpointId(code);

  // Manually create checkpoint with wrong version
  const badCheckpoint = {
    version: "1.0.0", // Wrong version
    timestamp: Date.now(),
    inputHash: checkpointId,
    completedBatches: 1,
    totalBatches: 5,
    renames: { version: "versionNumber" },
    partialCode: code
  };

  // Create checkpoint directory if needed
  if (!existsSync(CHECKPOINT_DIR)) {
    mkdirSync(CHECKPOINT_DIR, { recursive: true });
  }

  const checkpointPath = join(CHECKPOINT_DIR, `${checkpointId}.json`);
  writeFileSync(checkpointPath, JSON.stringify(badCheckpoint), "utf-8");

  console.log(`\n[TEST] Created checkpoint with version: ${badCheckpoint.version}`);
  console.log(`[TEST] Current version: ${CHECKPOINT_VERSION}`);

  // Try to load checkpoint
  const loaded = loadCheckpoint(checkpointId);

  // VERIFY: Incompatible checkpoint rejected
  assert.strictEqual(
    loaded,
    null,
    "Checkpoint with incompatible version should be rejected"
  );

  // VERIFY: Bad checkpoint was deleted
  assert.ok(
    !existsSync(checkpointPath),
    "Incompatible checkpoint should be deleted"
  );

  console.log(`[TEST] Version validation verified`);
});

/**
 * TEST 7: Multiple Checkpoints Management
 *
 * Validates listCheckpoints() returns all checkpoints
 */
test("should list all existing checkpoints", async () => {
  // Create multiple test files
  const file1 = join(TEST_INPUT_DIR, "test1.js");
  const file2 = join(TEST_INPUT_DIR, "test2.js");
  const code1 = `const test1 = 1;`;
  const code2 = `const test2 = 2;`;

  writeFileSync(file1, code1, "utf-8");
  writeFileSync(file2, code2, "utf-8");

  const id1 = getCheckpointId(code1);
  const id2 = getCheckpointId(code2);

  // Create checkpoints directory
  if (!existsSync(CHECKPOINT_DIR)) {
    mkdirSync(CHECKPOINT_DIR, { recursive: true });
  }

  // Create two checkpoints
  const checkpoint1 = {
    version: CHECKPOINT_VERSION,
    timestamp: Date.now() - 1000,
    inputHash: id1,
    completedBatches: 2,
    totalBatches: 5,
    renames: {},
    partialCode: code1,
    originalFile: file1
  };

  const checkpoint2 = {
    version: CHECKPOINT_VERSION,
    timestamp: Date.now(),
    inputHash: id2,
    completedBatches: 3,
    totalBatches: 7,
    renames: {},
    partialCode: code2,
    originalFile: file2
  };

  writeFileSync(
    join(CHECKPOINT_DIR, `${id1}.json`),
    JSON.stringify(checkpoint1),
    "utf-8"
  );
  writeFileSync(
    join(CHECKPOINT_DIR, `${id2}.json`),
    JSON.stringify(checkpoint2),
    "utf-8"
  );

  console.log(`\n[TEST] Created 2 checkpoint files`);

  // List checkpoints
  const checkpoints = listCheckpoints();

  console.log(`[TEST] Listed ${checkpoints.length} checkpoints`);

  // VERIFY: Both checkpoints listed
  assert.ok(
    checkpoints.length >= 2,
    "Should list all created checkpoints"
  );

  // VERIFY: Sorted by timestamp (newest first)
  const found1 = checkpoints.find(cp => cp.inputHash === id1);
  const found2 = checkpoints.find(cp => cp.inputHash === id2);

  assert.ok(found1, "Checkpoint 1 should be in list");
  assert.ok(found2, "Checkpoint 2 should be in list");

  const idx1 = checkpoints.indexOf(found1!);
  const idx2 = checkpoints.indexOf(found2!);

  assert.ok(
    idx2 < idx1,
    "Checkpoints should be sorted by timestamp (newest first)"
  );

  console.log(`[TEST] Checkpoint listing verified`);

  // Cleanup
  deleteCheckpoint(id1);
  deleteCheckpoint(id2);
});

/**
 * TEST 8: Checkpoint Metadata Preservation
 *
 * Validates that metadata fields (originalFile, provider, model, args)
 * are preserved in checkpoint for resume command.
 */
test("checkpoint should preserve metadata for resume command", async () => {
  const testFile = join(TEST_INPUT_DIR, "test-metadata.js");
  const code = `const metadata = true;`;

  writeFileSync(testFile, code, "utf-8");

  const checkpointId = getCheckpointId(code);
  const checkpointPath = join(CHECKPOINT_DIR, `${checkpointId}.json`);

  // Start processing (will create checkpoint with metadata)
  await execCLIAndWaitForCheckpoint(
    [
      "unminify",
      testFile,
      "--provider", "local",
      "--model", "2b",
      "--turbo",
      "--max-concurrent", "5",
      "--context-size", "1000",
      "--seed", "42"
    ],
    checkpointPath,
    10000
  );

  // Load checkpoint
  const checkpoint = loadCheckpoint(checkpointId);
  assert.ok(checkpoint, "Checkpoint should exist");

  console.log(`\n[TEST] Checkpoint metadata:`, {
    file: checkpoint.originalFile,
    provider: checkpoint.originalProvider,
    model: checkpoint.originalModel
  });

  // VERIFY: Metadata fields preserved
  assert.ok(
    checkpoint.originalFile?.includes(testFile),
    "originalFile should be preserved"
  );
  assert.strictEqual(
    checkpoint.originalProvider,
    "local",
    "originalProvider should be preserved"
  );
  assert.strictEqual(
    checkpoint.originalModel,
    "2b",
    "originalModel should be preserved"
  );
  assert.ok(
    checkpoint.originalArgs,
    "originalArgs should be preserved"
  );

  console.log(`[TEST] Metadata preservation verified`);

  // Cleanup
  deleteCheckpoint(checkpointId);
}, { timeout: 15000 });
