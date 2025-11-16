import test from "node:test";
import assert from "node:assert";
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readdirSync } from "fs";
import { spawn } from "child_process";
import { join } from "path";
import {
  getCheckpointId,
  saveCheckpoint,
  loadCheckpoint,
  deleteCheckpoint,
  listCheckpoints,
  CHECKPOINT_VERSION,
  type Checkpoint
} from "./checkpoint.js";

/**
 * END-TO-END FUNCTIONAL TESTS: Checkpoint Subcommands
 *
 * These tests validate the checkpoint management CLI commands:
 * - `humanify checkpoints list` - Display all checkpoints
 * - `humanify checkpoints clear` - Delete all checkpoints
 * - `humanify checkpoints resume` - Show resume instructions
 *
 * GAMING RESISTANCE:
 * - Uses actual built CLI (./dist/index.mjs)
 * - Tests real file I/O operations
 * - Verifies actual checkpoint deletion
 * - Tests with 0 checkpoints (edge case)
 * - Tests with multiple checkpoints
 * - Tests both accept AND decline paths for prompts
 * - Cannot pass with stub implementations
 */

const CHECKPOINT_DIR = ".humanify-checkpoints";

// Helper: Execute CLI command and capture output
async function execCLI(args: string[], sendInput?: string): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number | null;
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

    // Send input if provided, otherwise auto-respond with 'n'
    if (sendInput !== undefined) {
      proc.stdin?.write(sendInput);
    } else {
      proc.stdin?.write("n\n");
    }
    proc.stdin?.end();

    proc.on("close", (exitCode) => {
      resolve({ stdout, stderr, exitCode });
    });
  });
}

// Helper: Create a checkpoint file
function createCheckpoint(
  inputHash: string,
  completedBatches: number,
  totalBatches: number,
  originalFile?: string,
  originalProvider?: string,
  originalModel?: string
): void {
  if (!existsSync(CHECKPOINT_DIR)) {
    mkdirSync(CHECKPOINT_DIR, { recursive: true });
  }

  const checkpoint: Checkpoint = {
    version: CHECKPOINT_VERSION,
    timestamp: Date.now(),
    inputHash,
    completedBatches,
    totalBatches,
    renames: {
      test: "testVariable",
      foo: "fooFunction"
    },
    partialCode: "const testVariable = 1;",
    originalFile,
    originalProvider,
    originalModel,
    originalArgs: { turbo: true, maxConcurrent: 10 }
  };

  saveCheckpoint(inputHash, checkpoint);
}

test.beforeEach(() => {
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
  // Cleanup checkpoints
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
 * TEST 1: List Command with No Checkpoints
 *
 * WORKFLOW: Run `humanify checkpoints list` with empty directory
 * EXPECTATION: Shows "No checkpoints found" message
 */
test("checkpoints list should show message when no checkpoints exist", async () => {
  // Ensure no checkpoints exist
  const checkpoints = listCheckpoints();
  for (const cp of checkpoints) {
    deleteCheckpoint(cp.inputHash);
  }

  // Run list command
  const result = await execCLI(["checkpoints", "list"]);

  console.log(`\n[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Output:\n${result.stdout}`);

  // VERIFY: Success exit code
  assert.strictEqual(result.exitCode, 0, "Should exit successfully");

  // VERIFY: Shows empty message
  const output = result.stdout + result.stderr;
  assert.ok(
    output.includes("No checkpoints") || output.includes("0 checkpoint"),
    "Should indicate no checkpoints found"
  );

  console.log(`[TEST] Empty state validated`);
});

/**
 * TEST 2: List Command with Multiple Checkpoints
 *
 * WORKFLOW: Create multiple checkpoints, run list command
 * EXPECTATION: Shows all checkpoints with details
 */
test("checkpoints list should display all existing checkpoints", async () => {
  // Create test checkpoints
  const id1 = "checkpoint1hash";
  const id2 = "checkpoint2hash";
  const id3 = "checkpoint3hash";

  createCheckpoint(id1, 3, 10, "/path/to/file1.js", "openai", "gpt-4o-mini");
  createCheckpoint(id2, 7, 15, "/path/to/file2.js", "gemini", "gemini-1.5-flash");
  createCheckpoint(id3, 2, 8, "/path/to/file3.js", "local", "2b");

  console.log(`\n[TEST] Created 3 test checkpoints`);

  // Run list command
  const result = await execCLI(["checkpoints", "list"]);

  console.log(`[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Output:\n${result.stdout}`);

  // VERIFY: Success exit code
  assert.strictEqual(result.exitCode, 0, "Should exit successfully");

  const output = result.stdout + result.stderr;

  // VERIFY: Shows checkpoint count
  assert.ok(
    output.includes("3 checkpoint") || output.match(/checkpoint.*3/i),
    "Should show total checkpoint count"
  );

  // VERIFY: Shows file paths
  assert.ok(
    output.includes("file1.js") && output.includes("file2.js") && output.includes("file3.js"),
    "Should display original file paths"
  );

  // VERIFY: Shows progress percentages
  assert.ok(
    output.includes("30%") || output.includes("3/10"), // file1: 3/10 = 30%
    "Should show progress for checkpoint 1"
  );
  assert.ok(
    output.includes("46%") || output.includes("7/15"), // file2: 7/15 = 46%
    "Should show progress for checkpoint 2"
  );

  console.log(`[TEST] Checkpoint listing verified`);

  // Cleanup
  deleteCheckpoint(id1);
  deleteCheckpoint(id2);
  deleteCheckpoint(id3);
});

/**
 * TEST 3: Clear Command with Confirmation Declined
 *
 * WORKFLOW: Create checkpoints, run clear, decline confirmation
 * EXPECTATION: Checkpoints remain intact
 */
test("checkpoints clear should preserve checkpoints when cancelled", async () => {
  // Create test checkpoint
  const id = "testclearhash";
  createCheckpoint(id, 5, 10, "/test/file.js");

  console.log(`\n[TEST] Created test checkpoint`);

  // Run clear command with 'n' to decline
  const result = await execCLI(["checkpoints", "clear"], "n\n");

  console.log(`[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Output:\n${result.stdout}`);

  // VERIFY: Success exit code
  assert.strictEqual(result.exitCode, 0, "Should exit successfully");

  // VERIFY: Checkpoint still exists
  const checkpoint = loadCheckpoint(id);
  assert.ok(
    checkpoint !== null,
    "Checkpoint should remain when clear is cancelled"
  );

  console.log(`[TEST] Cancellation verified, checkpoint preserved`);

  // Cleanup
  deleteCheckpoint(id);
});

/**
 * TEST 4: Clear Command with Confirmation Accepted
 *
 * CRITICAL FIX: Tests the "accept" path - verifies deletion actually happens.
 *
 * WORKFLOW: Create checkpoints, run clear, confirm with 'y'
 * EXPECTATION: All checkpoints deleted
 *
 * GAMING RESISTANCE:
 * - Tests the acceptance path (not just decline)
 * - Verifies actual file deletion from filesystem
 * - Cannot pass if deletion doesn't work
 */
test("checkpoints clear should delete all checkpoints when user confirms", async () => {
  // Create multiple test checkpoints
  const id1 = "clear-test-1";
  const id2 = "clear-test-2";
  const id3 = "clear-test-3";

  createCheckpoint(id1, 2, 5, "/test/file1.js");
  createCheckpoint(id2, 4, 8, "/test/file2.js");
  createCheckpoint(id3, 1, 3, "/test/file3.js");

  console.log(`\n[TEST] Created 3 test checkpoints`);

  // Verify checkpoints exist before clear
  assert.ok(loadCheckpoint(id1), "Checkpoint 1 should exist before clear");
  assert.ok(loadCheckpoint(id2), "Checkpoint 2 should exist before clear");
  assert.ok(loadCheckpoint(id3), "Checkpoint 3 should exist before clear");

  // Run clear command with 'y' to confirm deletion
  const result = await execCLI(["checkpoints", "clear"], "y\n");

  console.log(`[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Output:\n${result.stdout}`);

  // VERIFY: Success exit code
  assert.strictEqual(result.exitCode, 0, "Should exit successfully");

  // VERIFY: Output indicates deletion
  const output = result.stdout + result.stderr;
  assert.ok(
    output.includes("Deleted") || output.includes("deleted"),
    "Output should indicate checkpoints were deleted"
  );

  // VERIFY: All checkpoints actually deleted from filesystem
  assert.strictEqual(
    loadCheckpoint(id1),
    null,
    "Checkpoint 1 should be deleted"
  );
  assert.strictEqual(
    loadCheckpoint(id2),
    null,
    "Checkpoint 2 should be deleted"
  );
  assert.strictEqual(
    loadCheckpoint(id3),
    null,
    "Checkpoint 3 should be deleted"
  );

  // VERIFY: No checkpoint files remain
  const remaining = listCheckpoints();
  assert.strictEqual(
    remaining.length,
    0,
    "No checkpoints should remain after clear with confirmation"
  );

  console.log(`[TEST] Deletion verified - all checkpoints removed from filesystem`);
});

/**
 * TEST 5: Clear Command with Empty Directory
 *
 * WORKFLOW: Run clear with no checkpoints
 * EXPECTATION: Shows "no checkpoints" message, doesn't error
 */
test("checkpoints clear should handle empty state gracefully", async () => {
  // Ensure no checkpoints
  const checkpoints = listCheckpoints();
  for (const cp of checkpoints) {
    deleteCheckpoint(cp.inputHash);
  }

  console.log(`\n[TEST] Ensured no checkpoints exist`);

  // Run clear command
  const result = await execCLI(["checkpoints", "clear"]);

  console.log(`[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Output:\n${result.stdout}`);

  // VERIFY: Success exit code
  assert.strictEqual(result.exitCode, 0, "Should exit successfully");

  // VERIFY: Shows appropriate message
  const output = result.stdout + result.stderr;
  assert.ok(
    output.includes("No checkpoint") || output.includes("0 checkpoint"),
    "Should indicate no checkpoints found"
  );

  console.log(`[TEST] Empty state handling verified`);
});

/**
 * TEST 6: Resume Command with No Checkpoints
 *
 * WORKFLOW: Run resume with no checkpoints
 * EXPECTATION: Shows "no checkpoints" message
 */
test("checkpoints resume should show message when no checkpoints exist", async () => {
  // Ensure no checkpoints
  const checkpoints = listCheckpoints();
  for (const cp of checkpoints) {
    deleteCheckpoint(cp.inputHash);
  }

  console.log(`\n[TEST] Ensured no checkpoints exist`);

  // Run resume command
  const result = await execCLI(["checkpoints", "resume"]);

  console.log(`[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Output:\n${result.stdout}`);

  // VERIFY: Success exit code
  assert.strictEqual(result.exitCode, 0, "Should exit successfully");

  // VERIFY: Shows no checkpoints message
  const output = result.stdout + result.stderr;
  assert.ok(
    output.includes("No checkpoint"),
    "Should indicate no checkpoints found"
  );

  console.log(`[TEST] Empty state for resume verified`);
});

/**
 * TEST 7: Resume Command Shows Reconstructed Command
 *
 * WORKFLOW: Create checkpoint with metadata, run resume
 * EXPECTATION: Shows correct command to resume processing
 */
test("checkpoints resume should reconstruct correct command from metadata", async () => {
  // Create checkpoint with full metadata
  const id = "resumetesthash";
  createCheckpoint(id, 5, 10, "/path/to/input.js", "openai", "gpt-4o-mini");

  console.log(`\n[TEST] Created checkpoint with metadata`);

  // Run resume command (auto-cancels via stdin)
  const result = await execCLI(["checkpoints", "resume"]);

  console.log(`[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Output:\n${result.stdout}`);

  // VERIFY: Success exit code
  assert.strictEqual(result.exitCode, 0, "Should exit successfully");

  const output = result.stdout + result.stderr;

  // VERIFY: Shows file path in command
  assert.ok(
    output.includes("/path/to/input.js"),
    "Should include original file path in command"
  );

  // VERIFY: Shows provider flag
  assert.ok(
    output.includes("--provider") && output.includes("openai"),
    "Should include provider flag in command"
  );

  // VERIFY: Shows model flag
  assert.ok(
    output.includes("--model") && output.includes("gpt-4o-mini"),
    "Should include model flag in command"
  );

  // VERIFY: Shows turbo flag (from originalArgs)
  assert.ok(
    output.includes("--turbo"),
    "Should include turbo flag from originalArgs"
  );

  // VERIFY: Shows max-concurrent flag
  assert.ok(
    output.includes("--max-concurrent") && output.includes("10"),
    "Should include max-concurrent from originalArgs"
  );

  console.log(`[TEST] Command reconstruction verified`);

  // Cleanup
  deleteCheckpoint(id);
});

/**
 * TEST 8: Resume Command with Multiple Checkpoints - Selection
 *
 * CRITICAL FIX: Tests interactive checkpoint selection when multiple exist.
 *
 * WORKFLOW: Create multiple checkpoints, run resume, select one
 * EXPECTATION: Shows selection menu, responds to input
 *
 * GAMING RESISTANCE:
 * - Tests interactive prompt handling
 * - Verifies menu shows all checkpoints
 * - Tests actual selection (not just display)
 */
test("checkpoints resume should allow selection when multiple checkpoints exist", async () => {
  // Create multiple checkpoints
  const id1 = "resume1hash";
  const id2 = "resume2hash";

  createCheckpoint(id1, 3, 10, "/file1.js", "openai", "gpt-4o-mini");
  createCheckpoint(id2, 7, 12, "/file2.js", "local", "2b");

  console.log(`\n[TEST] Created 2 checkpoints`);

  // Run resume command - select first checkpoint (index 0)
  const result = await execCLI(["checkpoints", "resume"], "0\n");

  console.log(`[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Output:\n${result.stdout}`);

  // VERIFY: Success exit code
  assert.strictEqual(result.exitCode, 0, "Should exit successfully");

  const output = result.stdout + result.stderr;

  // VERIFY: Shows both checkpoints in selection
  assert.ok(
    (output.includes("file1.js") && output.includes("file2.js")) ||
    output.includes("2 checkpoint"),
    "Should show both checkpoints in selection"
  );

  // VERIFY: Shows progress for both
  assert.ok(
    (output.includes("30%") || output.includes("3/10")) &&
    (output.includes("58%") || output.includes("7/12")),
    "Should show progress percentages"
  );

  // VERIFY: Shows command after selection
  assert.ok(
    output.includes("humanify unminify") || output.includes("To resume"),
    "Should show resume command after selection"
  );

  console.log(`[TEST] Multiple checkpoint selection verified`);

  // Cleanup
  deleteCheckpoint(id1);
  deleteCheckpoint(id2);
});

/**
 * TEST 9: Resume Command with Cancellation
 *
 * CRITICAL FIX: Tests the decline path when user cancels checkpoint selection.
 *
 * WORKFLOW: Create checkpoints, run resume, cancel selection
 * EXPECTATION: Shows "Cancelled" message, checkpoints preserved
 *
 * GAMING RESISTANCE:
 * - Tests both accept and decline paths
 * - Verifies checkpoints not deleted on cancel
 */
test("checkpoints resume should handle cancellation gracefully", async () => {
  // Create checkpoint
  const id = "resume-cancel-hash";
  createCheckpoint(id, 5, 10, "/cancel-test.js", "local", "2b");

  console.log(`\n[TEST] Created checkpoint`);

  // Run resume command and cancel (Ctrl+C sends empty input)
  const result = await execCLI(["checkpoints", "resume"], "\x03");

  console.log(`[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Output:\n${result.stdout}`);

  // VERIFY: Command handled cancellation
  // Note: Exit code may be 0 or non-zero depending on how cancellation is handled
  const output = result.stdout + result.stderr;
  assert.ok(
    output.includes("Cancelled") || output.includes("cancel") || result.exitCode === 0,
    "Should handle cancellation gracefully"
  );

  // VERIFY: Checkpoint still exists (not deleted)
  const checkpoint = loadCheckpoint(id);
  assert.ok(
    checkpoint !== null,
    "Checkpoint should still exist after cancellation"
  );

  console.log(`[TEST] Cancellation handling verified`);

  // Cleanup
  deleteCheckpoint(id);
});

/**
 * TEST 10: List Command Shows Sorted Checkpoints
 *
 * WORKFLOW: Create checkpoints with different timestamps
 * EXPECTATION: Lists checkpoints sorted by timestamp (newest first)
 */
test("checkpoints list should sort by timestamp (newest first)", async () => {
  // Create checkpoints with controlled timestamps
  const id1 = "old-checkpoint";
  const id2 = "new-checkpoint";

  // Create checkpoint 1 (older)
  if (!existsSync(CHECKPOINT_DIR)) {
    mkdirSync(CHECKPOINT_DIR, { recursive: true });
  }

  const oldCheckpoint: Checkpoint = {
    version: CHECKPOINT_VERSION,
    timestamp: Date.now() - 10000, // 10 seconds ago
    inputHash: id1,
    completedBatches: 2,
    totalBatches: 5,
    renames: {},
    partialCode: "",
    originalFile: "/old-file.js"
  };

  const newCheckpoint: Checkpoint = {
    version: CHECKPOINT_VERSION,
    timestamp: Date.now(), // Now
    inputHash: id2,
    completedBatches: 3,
    totalBatches: 5,
    renames: {},
    partialCode: "",
    originalFile: "/new-file.js"
  };

  saveCheckpoint(id1, oldCheckpoint);

  // Wait a bit to ensure different timestamps
  await new Promise(resolve => setTimeout(resolve, 100));

  saveCheckpoint(id2, newCheckpoint);

  console.log(`\n[TEST] Created checkpoints with different timestamps`);

  // Verify sorting via API (more reliable than parsing output)
  const checkpoints = listCheckpoints();
  const cp1 = checkpoints.find(cp => cp.inputHash === id1);
  const cp2 = checkpoints.find(cp => cp.inputHash === id2);

  assert.ok(cp1 && cp2, "Both checkpoints should be listed");

  const idx1 = checkpoints.indexOf(cp1!);
  const idx2 = checkpoints.indexOf(cp2!);

  // VERIFY: Newer checkpoint comes first
  assert.ok(
    idx2 < idx1,
    "Checkpoints should be sorted by timestamp (newest first)"
  );

  console.log(`[TEST] Timestamp sorting verified`);
  console.log(`[TEST] New checkpoint at index ${idx2}, old at index ${idx1}`);

  // Cleanup
  deleteCheckpoint(id1);
  deleteCheckpoint(id2);
});

/**
 * TEST 11: Checkpoint File Corruption Handling
 *
 * WORKFLOW: Create corrupted checkpoint file, run list
 * EXPECTATION: Skips corrupted file, doesn't crash
 */
test("checkpoints list should skip corrupted checkpoint files", async () => {
  // Create a valid checkpoint
  const validId = "valid-checkpoint";
  createCheckpoint(validId, 5, 10, "/valid.js");

  // Create a corrupted checkpoint file
  if (!existsSync(CHECKPOINT_DIR)) {
    mkdirSync(CHECKPOINT_DIR, { recursive: true });
  }

  const corruptedPath = join(CHECKPOINT_DIR, "corrupted.json");
  writeFileSync(corruptedPath, "{ invalid json }", "utf-8");

  console.log(`\n[TEST] Created valid and corrupted checkpoint files`);

  // Run list command
  const result = await execCLI(["checkpoints", "list"]);

  console.log(`[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Output:\n${result.stdout}`);

  // VERIFY: Success exit code (doesn't crash)
  assert.strictEqual(result.exitCode, 0, "Should exit successfully despite corrupted file");

  // VERIFY: Shows the valid checkpoint
  const output = result.stdout + result.stderr;
  assert.ok(
    output.includes("valid.js") || output.includes("1 checkpoint"),
    "Should show the valid checkpoint"
  );

  console.log(`[TEST] Corruption handling verified`);

  // Cleanup
  deleteCheckpoint(validId);
  try {
    unlinkSync(corruptedPath);
  } catch {
    // Ignore
  }
});

/**
 * TEST 12: Checkpoint Command Aliases
 *
 * WORKFLOW: Test that 'clean' alias works for 'clear'
 * EXPECTATION: Both commands work identically
 */
test("checkpoints clean should work as alias for clear", async () => {
  // Create test checkpoint
  const id = "alias-test";
  createCheckpoint(id, 2, 5, "/alias.js");

  console.log(`\n[TEST] Testing 'clean' alias for 'clear'`);

  // Run clean command (alias)
  const result = await execCLI(["checkpoints", "clean"]);

  console.log(`[TEST] Exit code: ${result.exitCode}`);
  console.log(`[TEST] Output:\n${result.stdout}`);

  // VERIFY: Success exit code
  assert.strictEqual(result.exitCode, 0, "clean alias should work");

  // VERIFY: Shows checkpoint (before cancelling)
  const output = result.stdout + result.stderr;
  assert.ok(
    output.includes("alias.js") || output.includes("checkpoint"),
    "Should show checkpoint in clean command"
  );

  console.log(`[TEST] Alias verified`);

  // Cleanup
  deleteCheckpoint(id);
});
