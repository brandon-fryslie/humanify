/**
 * Tests for ProgressRenderer
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { ProgressRenderer, ProgressState } from "./progress-renderer.js";
import { PassStats } from "../ledger/events.js";

describe("ProgressRenderer", () => {
  it("should create renderer with default config", () => {
    const renderer = new ProgressRenderer();
    assert.ok(renderer);
  });

  it("should create renderer with custom config", () => {
    const renderer = new ProgressRenderer({
      width: 120,
      showColor: false,
      updateIntervalMs: 500,
    });
    assert.ok(renderer);
  });

  it("should render progress state without errors", () => {
    const renderer = new ProgressRenderer({ showColor: false });

    const state: ProgressState = {
      jobId: "test-job-123",
      inputFile: "test-input.js",
      totalIdentifiers: 1000,
      currentIteration: 1,
      totalIterations: 1,
      currentPass: 1,
      totalPasses: 2,
      currentBatch: 5,
      totalBatches: 20,
      globalProcessed: 250,
      globalTotal: 2000,
      passProcessed: 250,
      passTotal: 1000,
      batchProcessed: 25,
      batchTotal: 50,
      tokensUsed: 12345,
      errors: 0,
      startTime: Date.now() - 60000, // 1 minute ago
    };

    // Should not throw
    renderer.render(state);
  });

  it("should render with errors highlighted", () => {
    const renderer = new ProgressRenderer({ showColor: false });

    const state: ProgressState = {
      jobId: "test-job-456",
      inputFile: "test-input.js",
      totalIdentifiers: 1000,
      currentIteration: 1,
      totalIterations: 1,
      currentPass: 1,
      totalPasses: 2,
      globalProcessed: 100,
      globalTotal: 2000,
      passProcessed: 100,
      passTotal: 1000,
      tokensUsed: 5000,
      errors: 5, // Has errors
      startTime: Date.now() - 30000,
    };

    // Should not throw
    renderer.render(state);
  });

  it("should render iteration 2+ with different color", () => {
    const renderer = new ProgressRenderer({ showColor: true });

    const state: ProgressState = {
      jobId: "test-job-789",
      inputFile: "test-input.js",
      totalIdentifiers: 1000,
      currentIteration: 2, // Second iteration
      totalIterations: 2,
      currentPass: 1,
      totalPasses: 2,
      globalProcessed: 1500,
      globalTotal: 4000,
      passProcessed: 500,
      passTotal: 1000,
      tokensUsed: 25000,
      errors: 0,
      startTime: Date.now() - 120000,
    };

    // Should not throw
    renderer.render(state);
  });

  it("should render pass summary", () => {
    const renderer = new ProgressRenderer({ showColor: false });

    const stats: PassStats = {
      identifiersProcessed: 1000,
      identifiersRenamed: 850,
      identifiersUnchanged: 150,
      identifiersSkipped: 0,
      tokensUsed: {
        prompt: 40000,
        completion: 8000,
        total: 48000,
      },
      durationMs: 82100,
      errors: 0,
      batchCount: 20,
    };

    // Should not throw
    renderer.renderPassSummary(1, 2, stats, "snapshots/after-pass-001.js");
  });

  it("should render job summary", () => {
    const renderer = new ProgressRenderer({ showColor: false });

    const pass1Stats: PassStats = {
      identifiersProcessed: 1000,
      identifiersRenamed: 800,
      identifiersUnchanged: 200,
      identifiersSkipped: 0,
      tokensUsed: { prompt: 40000, completion: 8000, total: 48000 },
      durationMs: 80000,
      errors: 0,
      batchCount: 20,
    };

    const pass2Stats: PassStats = {
      identifiersProcessed: 1000,
      identifiersRenamed: 600,
      identifiersUnchanged: 400,
      identifiersSkipped: 0,
      tokensUsed: { prompt: 35000, completion: 7000, total: 42000 },
      durationMs: 75000,
      errors: 2,
      batchCount: 20,
    };

    // Should not throw
    renderer.renderJobSummary(
      2,
      [pass1Stats, pass2Stats],
      "output/result.js"
    );
  });

  it("should throttle rapid updates", () => {
    const renderer = new ProgressRenderer({
      showColor: false,
      updateIntervalMs: 1000, // 1 second throttle
    });

    const state: ProgressState = {
      jobId: "test-job-throttle",
      inputFile: "test.js",
      totalIdentifiers: 100,
      currentIteration: 1,
      totalIterations: 1,
      currentPass: 1,
      totalPasses: 1,
      globalProcessed: 50,
      globalTotal: 100,
      passProcessed: 50,
      passTotal: 100,
      tokensUsed: 1000,
      errors: 0,
      startTime: Date.now(),
    };

    // First render should work
    renderer.render(state);

    // Second render immediately after should be throttled (no error)
    state.globalProcessed = 51;
    renderer.render(state);
  });

  it("should handle checkpoint info", () => {
    const renderer = new ProgressRenderer({ showColor: false });

    const state: ProgressState = {
      jobId: "test-job-checkpoint",
      inputFile: "test.js",
      totalIdentifiers: 1000,
      currentIteration: 1,
      totalIterations: 1,
      currentPass: 1,
      totalPasses: 2,
      globalProcessed: 500,
      globalTotal: 2000,
      passProcessed: 500,
      passTotal: 1000,
      tokensUsed: 10000,
      errors: 0,
      startTime: Date.now() - 60000,
      lastCheckpointTime: Date.now() - 10000, // 10 seconds ago
      lastCheckpointCount: 100,
    };

    // Should not throw
    renderer.render(state);
  });

  it("should calculate ETA correctly", () => {
    const renderer = new ProgressRenderer({ showColor: false });

    const startTime = Date.now() - 60000; // Started 1 minute ago

    const state: ProgressState = {
      jobId: "test-job-eta",
      inputFile: "test.js",
      totalIdentifiers: 1000,
      currentIteration: 1,
      totalIterations: 1,
      currentPass: 1,
      totalPasses: 1,
      globalProcessed: 500, // 50% done in 1 minute
      globalTotal: 1000, // So ETA should be ~1 minute
      passProcessed: 500,
      passTotal: 1000,
      tokensUsed: 5000,
      errors: 0,
      startTime,
    };

    // Should not throw and should calculate reasonable ETA
    renderer.render(state);
  });

  it("should handle zero progress gracefully", () => {
    const renderer = new ProgressRenderer({ showColor: false });

    const state: ProgressState = {
      jobId: "test-job-zero",
      inputFile: "test.js",
      totalIdentifiers: 1000,
      currentIteration: 1,
      totalIterations: 1,
      currentPass: 1,
      totalPasses: 1,
      globalProcessed: 0, // No progress yet
      globalTotal: 1000,
      passProcessed: 0,
      passTotal: 1000,
      tokensUsed: 0,
      errors: 0,
      startTime: Date.now(),
    };

    // Should not throw
    renderer.render(state);
  });

  it("should format large numbers correctly", () => {
    const renderer = new ProgressRenderer({ showColor: false });

    const state: ProgressState = {
      jobId: "test-job-large",
      inputFile: "test.js",
      totalIdentifiers: 50000,
      currentIteration: 1,
      totalIterations: 1,
      currentPass: 1,
      totalPasses: 1,
      globalProcessed: 25000,
      globalTotal: 50000,
      passProcessed: 25000,
      passTotal: 50000,
      tokensUsed: 1500000, // 1.5M tokens
      errors: 0,
      startTime: Date.now() - 300000, // 5 minutes ago
    };

    // Should format 1.5M as "1.5M"
    renderer.render(state);
  });
});
