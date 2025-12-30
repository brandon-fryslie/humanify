/**
 * Integration tests for PassEngine
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { PassEngine, ProcessorFunction } from "./pass-engine.js";
import { Vault } from "../vault/vault.js";
import { Ledger } from "../ledger/ledger.js";
import { PassConfig } from "../ledger/events.js";
import { existsSync, rmdirSync, mkdirSync } from "fs";

describe("PassEngine Integration", () => {
  const testCacheDir = ".test-cache";
  const testJobDir = ".test-jobs/job-001";

  let vault: Vault;
  let ledger: Ledger;
  let passEngine: PassEngine;

  before(() => {
    // Create test directories
    if (!existsSync(testCacheDir)) {
      mkdirSync(testCacheDir, { recursive: true });
    }
    if (!existsSync(testJobDir)) {
      mkdirSync(testJobDir, { recursive: true });
    }

    vault = new Vault(testCacheDir);
    ledger = new Ledger(testJobDir);
    passEngine = new PassEngine(vault, ledger, {
      concurrency: 5,
      batchSize: 3,
    });
  });

  after(() => {
    // Cleanup test directories
    try {
      if (existsSync(testCacheDir)) {
        rmdirSync(testCacheDir, { recursive: true });
      }
      if (existsSync(".test-jobs")) {
        rmdirSync(".test-jobs", { recursive: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should execute a simple pass", async () => {
    const code = `
      const a = 1;
      const b = 2;
      const c = 3;
    `;

    // Mock processor: adds "renamed_" prefix
    const processor: ProcessorFunction = async (name, context) => {
      return {
        newName: `renamed_${name}`,
        confidence: 0.9,
      };
    };

    const passConfig: PassConfig = {
      processor: "rename",
      mode: "parallel",
      concurrency: 5,
    };

    const result = await passEngine.executePass(
      code,
      processor,
      1, // pass number
      "test-job-001",
      passConfig
    );

    assert.ok(result.renameMap, "Should return rename map");
    assert.ok(result.stats, "Should return stats");
    assert.ok(result.stats.identifiersProcessed > 0, "Should process identifiers");
    assert.ok(result.stats.identifiersRenamed > 0, "Should rename identifiers");
  });

  it("should log events to ledger", async () => {
    const code = `
      const x = 1;
    `;

    const processor: ProcessorFunction = async (name, context) => {
      return { newName: `new_${name}`, confidence: 0.8 };
    };

    const passConfig: PassConfig = {
      processor: "rename",
      mode: "parallel",
      concurrency: 5,
    };

    await passEngine.executePass(
      code,
      processor,
      2, // pass number
      "test-job-002",
      passConfig
    );

    // Check ledger has events
    const eventCount = await ledger.countEvents();
    assert.ok(eventCount > 0, "Should write events to ledger");

    // Verify event types
    const events = await ledger.getAllEvents();
    const passStartedEvents = events.filter((e) => e.type === "PASS_STARTED");
    const passCompletedEvents = events.filter((e) => e.type === "PASS_COMPLETED");

    assert.ok(passStartedEvents.length > 0, "Should have PASS_STARTED event");
    assert.ok(passCompletedEvents.length > 0, "Should have PASS_COMPLETED event");
  });

  it("should handle errors gracefully", async () => {
    const code = `
      const a = 1;
      const b = 2;
    `;

    let callCount = 0;

    // Processor that fails on first identifier
    const processor: ProcessorFunction = async (name, context) => {
      callCount++;
      if (name === "a") {
        throw new Error("Simulated error");
      }
      return { newName: `ok_${name}`, confidence: 0.7 };
    };

    const passConfig: PassConfig = {
      processor: "rename",
      mode: "parallel",
      concurrency: 5,
    };

    const result = await passEngine.executePass(
      code,
      processor,
      3, // pass number
      "test-job-003",
      passConfig
    );

    // Should complete despite error
    assert.ok(result.stats, "Should complete with stats");
    assert.ok(result.stats.errors > 0, "Should report errors");
    assert.ok(result.stats.identifiersSkipped > 0, "Should skip failed identifiers");
  });

  it("should process identifiers in batches", async () => {
    const code = `
      const a = 1;
      const b = 2;
      const c = 3;
      const d = 4;
      const e = 5;
      const f = 6;
      const g = 7;
    `;

    const processedBatches: number[] = [];

    const processor: ProcessorFunction = async (name, context) => {
      // Track which batch we're in by name
      return { newName: `batch_${name}`, confidence: 0.8 };
    };

    const passConfig: PassConfig = {
      processor: "rename",
      mode: "parallel",
      concurrency: 5,
    };

    const result = await passEngine.executePass(
      code,
      processor,
      4, // pass number
      "test-job-004",
      passConfig
    );

    // With batch size 3 and 7 identifiers, should have 3 batches
    // (3 + 3 + 1)
    assert.strictEqual(result.stats.batchCount, 3, "Should process in 3 batches");
  });

  it("should track progress via callback", async () => {
    const code = `
      const a = 1;
      const b = 2;
      const c = 3;
    `;

    const progressUpdates: Array<{ processed: number; total: number; errors: number }> =
      [];

    const processor: ProcessorFunction = async (name, context) => {
      return { newName: `tracked_${name}`, confidence: 0.85 };
    };

    const passConfig: PassConfig = {
      processor: "rename",
      mode: "parallel",
      concurrency: 5,
    };

    const engineWithProgress = new PassEngine(vault, ledger, {
      concurrency: 5,
      batchSize: 3,
      onProgress: (processed, total, errors) => {
        progressUpdates.push({ processed, total, errors });
      },
    });

    await engineWithProgress.executePass(
      code,
      processor,
      5, // pass number
      "test-job-005",
      passConfig
    );

    assert.ok(progressUpdates.length > 0, "Should call progress callback");

    // Last update should have all identifiers processed
    const lastUpdate = progressUpdates[progressUpdates.length - 1];
    assert.strictEqual(lastUpdate.processed, lastUpdate.total, "Should process all identifiers");
  });

  it("should retry failed identifiers", async () => {
    const code = `
      const x = 1;
    `;

    let attemptCount = 0;

    // Processor that fails first 2 times, succeeds on 3rd
    const processor: ProcessorFunction = async (name, context) => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error("Temporary failure");
      }
      return { newName: `retried_${name}`, confidence: 0.9 };
    };

    const passConfig: PassConfig = {
      processor: "rename",
      mode: "parallel",
      concurrency: 5,
    };

    const engineWithRetries = new PassEngine(vault, ledger, {
      concurrency: 5,
      batchSize: 3,
      retryCount: 3,
      retryDelayMs: 10,
    });

    const result = await engineWithRetries.executePass(
      code,
      processor,
      6, // pass number
      "test-job-006",
      passConfig
    );

    // Should succeed after retries
    assert.strictEqual(result.stats.errors, 0, "Should succeed after retries");
    assert.ok(result.stats.identifiersRenamed > 0, "Should rename identifiers");
  });

  it("should respect concurrency limit", async () => {
    const code = `
      const a = 1;
      const b = 2;
      const c = 3;
      const d = 4;
      const e = 5;
    `;

    let currentConcurrent = 0;
    let maxConcurrent = 0;

    const processor: ProcessorFunction = async (name, context) => {
      currentConcurrent++;
      maxConcurrent = Math.max(maxConcurrent, currentConcurrent);

      // Simulate async work
      await new Promise((resolve) => setTimeout(resolve, 10));

      currentConcurrent--;
      return { newName: `concurrent_${name}`, confidence: 0.8 };
    };

    const passConfig: PassConfig = {
      processor: "rename",
      mode: "parallel",
      concurrency: 2, // Low concurrency limit
    };

    const engineWithLowConcurrency = new PassEngine(vault, ledger, {
      concurrency: 2, // Max 2 concurrent
      batchSize: 10,
    });

    await engineWithLowConcurrency.executePass(
      code,
      processor,
      7, // pass number
      "test-job-007",
      passConfig
    );

    // Max concurrent should not exceed limit
    assert.ok(maxConcurrent <= 2, `Max concurrent (${maxConcurrent}) should not exceed limit (2)`);
  });
});
