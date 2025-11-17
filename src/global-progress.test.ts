import assert from "assert";
import test from "node:test";
import {
  GlobalProgressManager,
  getGlobalProgressManager,
  resetGlobalProgressManager,
  formatETA,
} from "./global-progress.js";
import { WorkEstimate } from "./estimate-work.js";

test("GlobalProgressManager: initialization", () => {
  const manager = new GlobalProgressManager();

  assert.strictEqual(
    manager.isInitialized(),
    false,
    "Should not be initialized by default"
  );

  const estimate: WorkEstimate = {
    totalFiles: 2,
    totalIdentifiers: 100,
    totalBatches: 10,
    estimatedAPICalls: 100,
    files: [],
  };

  manager.initialize(estimate, 1);

  assert.strictEqual(
    manager.isInitialized(),
    true,
    "Should be initialized after initialize()"
  );

  const progress = manager.getProgress();
  assert.strictEqual(progress.state.totalIterations, 1);
  assert.strictEqual(progress.state.totalIdentifiers, 100);
  assert.strictEqual(progress.state.totalBatches, 10);
  assert.strictEqual(progress.state.completedBatches, 0);
  assert.strictEqual(progress.state.completedIdentifiers, 0);
  assert.strictEqual(progress.percentComplete, 0);
});

test("GlobalProgressManager: multi-iteration initialization", () => {
  const manager = new GlobalProgressManager();

  const estimate: WorkEstimate = {
    totalFiles: 1,
    totalIdentifiers: 50,
    totalBatches: 5,
    estimatedAPICalls: 50,
    files: [],
  };

  // Initialize with 2 iterations (e.g., initial + refinement)
  manager.initialize(estimate, 2);

  const progress = manager.getProgress();
  assert.strictEqual(progress.state.totalIterations, 2);
  assert.strictEqual(
    progress.state.totalIdentifiers,
    100,
    "Total identifiers should be doubled for 2 iterations"
  );
  assert.strictEqual(
    progress.state.totalBatches,
    10,
    "Total batches should be doubled for 2 iterations"
  );
});

test("GlobalProgressManager: updateProgress updates state", () => {
  const manager = new GlobalProgressManager();

  const estimate: WorkEstimate = {
    totalFiles: 1,
    totalIdentifiers: 100,
    totalBatches: 10,
    estimatedAPICalls: 100,
    files: [],
  };

  manager.initialize(estimate, 1);

  // Update with some progress
  manager.updateProgress(3, 30);

  const progress = manager.getProgress();
  assert.strictEqual(progress.state.completedBatches, 3);
  assert.strictEqual(progress.state.completedIdentifiers, 30);
  assert.strictEqual(progress.percentComplete, 30);
});

test("GlobalProgressManager: incremental progress updates", () => {
  const manager = new GlobalProgressManager();

  const estimate: WorkEstimate = {
    totalFiles: 1,
    totalIdentifiers: 100,
    totalBatches: 10,
    estimatedAPICalls: 100,
    files: [],
  };

  manager.initialize(estimate, 1);

  // Simulate incremental updates
  manager.updateProgress(1, 10);
  let progress = manager.getProgress();
  assert.strictEqual(progress.state.completedBatches, 1);
  assert.strictEqual(progress.state.completedIdentifiers, 10);
  assert.strictEqual(progress.percentComplete, 10);

  manager.updateProgress(2, 20);
  progress = manager.getProgress();
  assert.strictEqual(progress.state.completedBatches, 3);
  assert.strictEqual(progress.state.completedIdentifiers, 30);
  assert.strictEqual(progress.percentComplete, 30);

  manager.updateProgress(3, 30);
  progress = manager.getProgress();
  assert.strictEqual(progress.state.completedBatches, 6);
  assert.strictEqual(progress.state.completedIdentifiers, 60);
  assert.strictEqual(progress.percentComplete, 60);
});

test("GlobalProgressManager: ETA calculation", async () => {
  const manager = new GlobalProgressManager();

  const estimate: WorkEstimate = {
    totalFiles: 1,
    totalIdentifiers: 100,
    totalBatches: 10,
    estimatedAPICalls: 100,
    files: [],
  };

  manager.initialize(estimate, 1);

  // Wait a bit to ensure elapsed time > 0
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Update with 50% progress
  manager.updateProgress(5, 50);

  const progress = manager.getProgress();

  // ETA should be calculated
  assert.ok(progress.etaSeconds !== null, "ETA should be calculated");
  assert.ok(progress.etaSeconds! > 0, "ETA should be positive");

  // Identifiers per second should be calculated
  assert.ok(
    progress.identifiersPerSecond > 0,
    "Identifiers per second should be positive"
  );

  // Elapsed time should be > 0
  assert.ok(progress.elapsedSeconds > 0, "Elapsed time should be positive");
});

test("GlobalProgressManager: ETA is null before any progress", () => {
  const manager = new GlobalProgressManager();

  const estimate: WorkEstimate = {
    totalFiles: 1,
    totalIdentifiers: 100,
    totalBatches: 10,
    estimatedAPICalls: 100,
    files: [],
  };

  manager.initialize(estimate, 1);

  const progress = manager.getProgress();

  // No progress yet, so ETA should be null
  assert.strictEqual(progress.etaSeconds, null, "ETA should be null before any progress");
  assert.strictEqual(
    progress.identifiersPerSecond,
    0,
    "Identifiers per second should be 0 before any progress"
  );
});

test("GlobalProgressManager: finish sets progress to 100%", () => {
  const manager = new GlobalProgressManager();

  const estimate: WorkEstimate = {
    totalFiles: 1,
    totalIdentifiers: 100,
    totalBatches: 10,
    estimatedAPICalls: 100,
    files: [],
  };

  manager.initialize(estimate, 1);

  // Simulate partial progress
  manager.updateProgress(5, 50);

  let progress = manager.getProgress();
  assert.strictEqual(progress.percentComplete, 50);

  // Finish
  manager.finish();

  progress = manager.getProgress();
  assert.strictEqual(progress.state.completedBatches, 10);
  assert.strictEqual(progress.state.completedIdentifiers, 100);
  assert.strictEqual(progress.percentComplete, 100);
});

test("GlobalProgressManager: startIteration updates current iteration", () => {
  const manager = new GlobalProgressManager();

  const estimate: WorkEstimate = {
    totalFiles: 1,
    totalIdentifiers: 50,
    totalBatches: 5,
    estimatedAPICalls: 50,
    files: [],
  };

  manager.initialize(estimate, 2);

  let progress = manager.getProgress();
  assert.strictEqual(progress.state.currentIteration, 1);

  manager.startIteration(2);

  progress = manager.getProgress();
  assert.strictEqual(progress.state.currentIteration, 2);
});

test("GlobalProgressManager: throws error if not initialized", () => {
  const manager = new GlobalProgressManager();

  assert.throws(() => {
    manager.updateProgress(1, 10);
  }, /not initialized/);

  assert.throws(() => {
    manager.getProgress();
  }, /not initialized/);

  assert.throws(() => {
    manager.startIteration(2);
  }, /not initialized/);
});

test("GlobalProgressManager: reset clears state", () => {
  const manager = new GlobalProgressManager();

  const estimate: WorkEstimate = {
    totalFiles: 1,
    totalIdentifiers: 100,
    totalBatches: 10,
    estimatedAPICalls: 100,
    files: [],
  };

  manager.initialize(estimate, 1);
  assert.strictEqual(manager.isInitialized(), true);

  manager.reset();
  assert.strictEqual(manager.isInitialized(), false);
});

test("GlobalProgressManager: singleton getGlobalProgressManager", () => {
  // Reset singleton
  resetGlobalProgressManager();

  const manager1 = getGlobalProgressManager();
  const manager2 = getGlobalProgressManager();

  assert.strictEqual(
    manager1,
    manager2,
    "Should return same instance (singleton)"
  );

  // Cleanup
  resetGlobalProgressManager();
});

test("GlobalProgressManager: percent complete calculation edge cases", () => {
  const manager = new GlobalProgressManager();

  // Empty estimate (0 identifiers)
  const emptyEstimate: WorkEstimate = {
    totalFiles: 0,
    totalIdentifiers: 0,
    totalBatches: 0,
    estimatedAPICalls: 0,
    files: [],
  };

  manager.initialize(emptyEstimate, 1);

  const progress = manager.getProgress();
  assert.strictEqual(
    progress.percentComplete,
    0,
    "Percent complete should be 0 when total is 0"
  );
});

test("GlobalProgressManager: multi-iteration progress tracking", () => {
  const manager = new GlobalProgressManager();

  const estimate: WorkEstimate = {
    totalFiles: 1,
    totalIdentifiers: 50,
    totalBatches: 5,
    estimatedAPICalls: 50,
    files: [],
  };

  // 2 iterations (initial + refinement)
  manager.initialize(estimate, 2);

  // Complete first iteration
  manager.updateProgress(5, 50);
  let progress = manager.getProgress();
  assert.strictEqual(progress.percentComplete, 50);

  // Start second iteration
  manager.startIteration(2);
  progress = manager.getProgress();
  assert.strictEqual(progress.state.currentIteration, 2);
  assert.strictEqual(progress.percentComplete, 50); // Still 50% overall

  // Complete second iteration
  manager.updateProgress(5, 50);
  progress = manager.getProgress();
  assert.strictEqual(progress.percentComplete, 100);
});

test("formatETA: handles null (no data yet)", () => {
  assert.strictEqual(formatETA(null), "calculating...");
});

test("formatETA: formats seconds", () => {
  assert.strictEqual(formatETA(5), "5s");
  assert.strictEqual(formatETA(30), "30s");
  assert.strictEqual(formatETA(59), "59s");
});

test("formatETA: formats minutes and seconds", () => {
  assert.strictEqual(formatETA(60), "1m");
  assert.strictEqual(formatETA(90), "1m 30s");
  assert.strictEqual(formatETA(125), "2m 5s");
  assert.strictEqual(formatETA(3599), "59m 59s");
});

test("formatETA: formats hours and minutes", () => {
  assert.strictEqual(formatETA(3600), "1h");
  assert.strictEqual(formatETA(3660), "1h 1m");
  assert.strictEqual(formatETA(5400), "1h 30m");
  assert.strictEqual(formatETA(7200), "2h");
  assert.strictEqual(formatETA(10800), "3h");
});

test("formatETA: rounds up fractional values", () => {
  assert.strictEqual(formatETA(1.5), "2s");
  assert.strictEqual(formatETA(61.9), "1m 2s");
});
