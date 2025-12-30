/**
 * Tests for MetricsCollector
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import * as fs from "fs/promises";
import * as path from "path";
import { MetricsCollector } from "./metrics-collector.js";
import { PassStats } from "../ledger/events.js";

const TEST_OUTPUT_DIR = ".test-metrics-output";

describe("MetricsCollector", () => {
  beforeEach(async () => {
    // Clean up test directory
    await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  });

  it("should create metrics collector", () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    assert.ok(collector);
  });

  it("should initialize and create output directory", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    await collector.initialize();

    // Directory should exist
    const stats = await fs.stat(TEST_OUTPUT_DIR);
    assert.ok(stats.isDirectory());
  });

  it("should record job started event", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    await collector.initialize();
    await collector.recordJobStarted("job-123", "input.js", 1000, 2);

    // Check that metrics.jsonl was created
    const metricsPath = path.join(TEST_OUTPUT_DIR, "metrics.jsonl");
    const content = await fs.readFile(metricsPath, "utf-8");

    const lines = content.trim().split("\n");
    assert.strictEqual(lines.length, 1);

    const event = JSON.parse(lines[0]);
    assert.strictEqual(event.type, "job_started");
    assert.strictEqual(event.jobId, "job-123");
    assert.strictEqual(event.inputFile, "input.js");
    assert.strictEqual(event.totalIdentifiers, 1000);
    assert.strictEqual(event.totalPasses, 2);
  });

  it("should record pass completed event", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    await collector.initialize();

    const stats: PassStats = {
      identifiersProcessed: 1000,
      identifiersRenamed: 850,
      identifiersUnchanged: 150,
      identifiersSkipped: 0,
      tokensUsed: { prompt: 40000, completion: 8000, total: 48000 },
      durationMs: 82100,
      errors: 0,
      batchCount: 20,
    };

    await collector.recordPassCompleted("job-123", 1, stats);

    // Check that event was written
    const metricsPath = path.join(TEST_OUTPUT_DIR, "metrics.jsonl");
    const content = await fs.readFile(metricsPath, "utf-8");

    const lines = content.trim().split("\n");
    assert.strictEqual(lines.length, 1);

    const event = JSON.parse(lines[0]);
    assert.strictEqual(event.type, "pass_completed");
    assert.strictEqual(event.passNumber, 1);
    assert.deepStrictEqual(event.stats, stats);
  });

  it("should track vault hits and misses", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
      verbose: true, // Enable verbose to record vault events
    });

    await collector.initialize();

    await collector.recordVaultHit("job-123", "cache-key-1");
    await collector.recordVaultHit("job-123", "cache-key-2");
    await collector.recordVaultMiss("job-123", "cache-key-3");

    const hitRate = collector.getVaultHitRate();
    assert.strictEqual(hitRate, 2 / 3); // 2 hits, 1 miss
  });

  it("should record errors", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    await collector.initialize();

    await collector.recordError(
      "job-123",
      "API_ERROR",
      "Rate limit exceeded",
      "Processing batch 5"
    );

    // Check that event was written
    const metricsPath = path.join(TEST_OUTPUT_DIR, "metrics.jsonl");
    const content = await fs.readFile(metricsPath, "utf-8");

    const lines = content.trim().split("\n");
    assert.strictEqual(lines.length, 1);

    const event = JSON.parse(lines[0]);
    assert.strictEqual(event.type, "error");
    assert.strictEqual(event.errorType, "API_ERROR");
    assert.strictEqual(event.message, "Rate limit exceeded");
    assert.strictEqual(event.context, "Processing batch 5");
  });

  it("should record job completed event", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    await collector.initialize();

    // Record some vault activity first
    await collector.recordVaultHit("job-123", "key-1");
    await collector.recordVaultHit("job-123", "key-2");
    await collector.recordVaultMiss("job-123", "key-3");

    await collector.recordJobCompleted("job-123", 150000, 90000, 2);

    // Check that event was written
    const metricsPath = path.join(TEST_OUTPUT_DIR, "metrics.jsonl");
    const content = await fs.readFile(metricsPath, "utf-8");

    const lines = content.trim().split("\n");
    const lastEvent = JSON.parse(lines[lines.length - 1]);

    assert.strictEqual(lastEvent.type, "job_completed");
    assert.strictEqual(lastEvent.totalDurationMs, 150000);
    assert.strictEqual(lastEvent.totalTokens, 90000);
    assert.strictEqual(lastEvent.totalErrors, 2);
    assert.strictEqual(lastEvent.vaultHitRate, 2 / 3); // Matches vault stats
  });

  it("should generate metrics summary", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    await collector.initialize();

    // Record complete job flow
    await collector.recordJobStarted("job-123", "input.js", 1000, 2);

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

    await collector.recordPassCompleted("job-123", 1, pass1Stats);
    await collector.recordPassCompleted("job-123", 2, pass2Stats);

    await collector.recordVaultHit("job-123", "key-1");
    await collector.recordVaultMiss("job-123", "key-2");

    await collector.recordJobCompleted("job-123", 155000, 90000, 2);

    // Get summary
    const summary = collector.getSummary("job-123");

    assert.ok(summary);
    assert.strictEqual(summary.jobId, "job-123");
    assert.strictEqual(summary.passes, 2);
    assert.strictEqual(summary.identifiers, 1000);
    assert.strictEqual(summary.tokensUsed.total, 90000);
    assert.strictEqual(summary.errors, 2);
    assert.strictEqual(summary.vaultStats.hits, 1);
    assert.strictEqual(summary.vaultStats.misses, 1);
    assert.strictEqual(summary.vaultStats.hitRate, 0.5);
  });

  it("should return null summary for non-existent job", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    await collector.initialize();

    const summary = collector.getSummary("non-existent-job");
    assert.strictEqual(summary, null);
  });

  it("should support verbose logging", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: false,
      verbose: true,
    });

    await collector.initialize();

    const stats: PassStats = {
      identifiersProcessed: 100,
      identifiersRenamed: 85,
      identifiersUnchanged: 15,
      identifiersSkipped: 0,
      tokensUsed: { prompt: 4000, completion: 800, total: 4800 },
      durationMs: 8000,
      errors: 0,
      batchCount: 2,
    };

    // Should log detailed info (no assertion, just checking it doesn't crash)
    await collector.recordPassCompleted("job-123", 1, stats);
  });

  it("should support quiet mode", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    await collector.initialize();

    // Should not log anything (no assertion, just checking it doesn't crash)
    await collector.recordJobStarted("job-123", "input.js", 100, 1);
    await collector.recordJobCompleted("job-123", 10000, 5000, 0);
  });

  it("should append events to existing file", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    await collector.initialize();

    await collector.recordJobStarted("job-1", "input1.js", 100, 1);
    await collector.recordJobStarted("job-2", "input2.js", 200, 2);

    const metricsPath = path.join(TEST_OUTPUT_DIR, "metrics.jsonl");
    const content = await fs.readFile(metricsPath, "utf-8");

    const lines = content.trim().split("\n");
    assert.strictEqual(lines.length, 2);

    const event1 = JSON.parse(lines[0]);
    const event2 = JSON.parse(lines[1]);

    assert.strictEqual(event1.jobId, "job-1");
    assert.strictEqual(event2.jobId, "job-2");
  });

  it("should clear metrics", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    await collector.initialize();

    await collector.recordVaultHit("job-123", "key-1");
    await collector.recordVaultMiss("job-123", "key-2");

    assert.strictEqual(collector.getVaultHitRate(), 0.5);

    // Clear metrics
    collector.clear();

    assert.strictEqual(collector.getVaultHitRate(), 0);
  });

  it("should handle zero vault activity", async () => {
    const collector = new MetricsCollector({
      outputDir: TEST_OUTPUT_DIR,
      quiet: true,
    });

    await collector.initialize();

    // No vault activity recorded
    assert.strictEqual(collector.getVaultHitRate(), 0);

    await collector.recordJobCompleted("job-123", 10000, 5000, 0);

    const metricsPath = path.join(TEST_OUTPUT_DIR, "metrics.jsonl");
    const content = await fs.readFile(metricsPath, "utf-8");

    const event = JSON.parse(content.trim());
    assert.strictEqual(event.vaultHitRate, 0);
  });
});
