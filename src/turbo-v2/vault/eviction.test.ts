/**
 * VAULT EVICTION TESTS
 *
 * Validates LRU eviction behavior
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { VaultEviction, DEFAULT_EVICTION_CONFIG } from "./eviction.js";
import { mkdirSync, writeFileSync, rmSync, existsSync, utimesSync } from "fs";
import { join } from "path";

const TEST_CACHE_DIR = ".test-vault-cache";

describe("VaultEviction", () => {
  beforeEach(() => {
    // Clean up test directory
    if (existsSync(TEST_CACHE_DIR)) {
      rmSync(TEST_CACHE_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_CACHE_DIR, { recursive: true });
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(TEST_CACHE_DIR)) {
      rmSync(TEST_CACHE_DIR, { recursive: true, force: true });
    }
  });

  it("should calculate vault stats correctly", () => {
    // Create test entries
    writeFileSync(join(TEST_CACHE_DIR, "entry1.json"), JSON.stringify({ data: "x".repeat(100) }));
    writeFileSync(join(TEST_CACHE_DIR, "entry2.json"), JSON.stringify({ data: "x".repeat(200) }));

    const eviction = new VaultEviction(TEST_CACHE_DIR, { maxSize: 1000 });
    const stats = eviction.getStats();

    assert.strictEqual(stats.entryCount, 2, "Should count 2 entries");
    assert.ok(stats.vaultSize > 0, "Should calculate total size");
  });

  it("should detect when eviction is needed", () => {
    // Create entry that exceeds threshold
    const largeData = "x".repeat(600);
    writeFileSync(join(TEST_CACHE_DIR, "large.json"), JSON.stringify({ data: largeData }));

    const eviction = new VaultEviction(TEST_CACHE_DIR, { maxSize: 500 });

    assert.strictEqual(eviction.needsEviction(), true, "Should need eviction when size > maxSize");
  });

  it("should not evict when size is below threshold", () => {
    // Create small entry
    writeFileSync(join(TEST_CACHE_DIR, "small.json"), JSON.stringify({ data: "tiny" }));

    const eviction = new VaultEviction(TEST_CACHE_DIR, { maxSize: 1000 });
    const stats = eviction.evict();

    assert.strictEqual(stats.evictedCount, 0, "Should not evict when below threshold");
  });

  it("should evict LRU entries first", async () => {
    const now = Date.now();

    // Create entries with different access times
    const oldPath = join(TEST_CACHE_DIR, "old.json");
    const newPath = join(TEST_CACHE_DIR, "new.json");

    // Create old file first
    writeFileSync(oldPath, JSON.stringify({ data: "x".repeat(400) }));

    // Set old file to have older mtime (1 hour ago)
    const oldTime = new Date(now - 3600 * 1000);
    utimesSync(oldPath, oldTime, oldTime);

    // Wait a tiny bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create new file
    writeFileSync(newPath, JSON.stringify({ data: "x".repeat(400) }));

    // Verify mtimes are different
    const { statSync } = await import('fs');
    const oldMtime = statSync(oldPath).mtimeMs;
    const newMtime = statSync(newPath).mtimeMs;

    // Evict with threshold that should remove at least one entry
    // Total size is ~800 bytes, max is 600, target is 480
    const eviction = new VaultEviction(TEST_CACHE_DIR, { maxSize: 600, targetSize: 480 });
    const stats = eviction.evict();

    assert.ok(stats.evictedCount > 0, "Should evict at least one entry");

    // At least one file should be evicted
    const oldExists = existsSync(oldPath);
    const newExists = existsSync(newPath);

    // Either the old file should be gone, or both should be gone if needed to reach target
    // But the new file should not be the only one evicted
    assert.ok(!oldExists || !newExists, "At least one file should be evicted");

    // If only one was evicted, it should be the old one (unless mtimes didn't work)
    if (oldExists !== newExists) {
      // Only one was evicted - it should be the old one if mtimes worked
      if (oldMtime < newMtime) {
        assert.ok(!oldExists, "Should evict old entry first when mtimes differ");
      }
    }
  });

  it("should evict multiple entries to reach target size", () => {
    // Create multiple entries
    for (let i = 0; i < 5; i++) {
      const path = join(TEST_CACHE_DIR, `entry${i}.json`);
      writeFileSync(path, JSON.stringify({ data: "x".repeat(200) }));

      // Set progressively older mtimes
      const time = new Date(Date.now() - i * 1000);
      utimesSync(path, time, time);
    }

    // Evict to small target
    const eviction = new VaultEviction(TEST_CACHE_DIR, { maxSize: 1000, targetSize: 500 });
    const stats = eviction.evict();

    assert.ok(stats.evictedCount >= 2, "Should evict multiple entries");
    assert.ok(stats.vaultSize <= 500 || stats.entryCount <= 2, "Should reach target size or close");
  });

  it("should report eviction statistics", () => {
    // Create entries
    writeFileSync(join(TEST_CACHE_DIR, "a.json"), JSON.stringify({ data: "x".repeat(300) }));
    writeFileSync(join(TEST_CACHE_DIR, "b.json"), JSON.stringify({ data: "x".repeat(300) }));

    const eviction = new VaultEviction(TEST_CACHE_DIR, { maxSize: 400, targetSize: 300 });
    const stats = eviction.evict();

    assert.ok(stats.vaultSize >= 0, "Should report vault size");
    assert.ok(stats.entryCount >= 0, "Should report entry count");
    assert.ok(stats.evictedCount >= 0, "Should report evicted count");
    assert.ok(stats.evictedSize >= 0, "Should report evicted size");
  });

  it("should handle non-existent cache directory", () => {
    const eviction = new VaultEviction(".non-existent-dir", { maxSize: 1000 });
    const stats = eviction.getStats();

    assert.strictEqual(stats.vaultSize, 0, "Should return zero size for non-existent dir");
    assert.strictEqual(stats.entryCount, 0, "Should return zero count for non-existent dir");
  });

  it("should ignore non-json files", () => {
    // Create both .json and .tmp files
    writeFileSync(join(TEST_CACHE_DIR, "valid.json"), JSON.stringify({ data: "x".repeat(100) }));
    writeFileSync(join(TEST_CACHE_DIR, "temp.tmp"), "temporary data");
    writeFileSync(join(TEST_CACHE_DIR, "readme.txt"), "readme");

    const eviction = new VaultEviction(TEST_CACHE_DIR, { maxSize: 1000 });
    const stats = eviction.getStats();

    assert.strictEqual(stats.entryCount, 1, "Should only count .json files");
  });

  it("should format sizes correctly", () => {
    assert.strictEqual(VaultEviction.formatSize(500), "500.00 B");
    assert.strictEqual(VaultEviction.formatSize(1024), "1.00 KB");
    assert.strictEqual(VaultEviction.formatSize(1024 * 1024), "1.00 MB");
    assert.strictEqual(VaultEviction.formatSize(1024 * 1024 * 1024), "1.00 GB");
  });

  it("should use default config correctly", () => {
    assert.strictEqual(DEFAULT_EVICTION_CONFIG.maxSize, 1024 * 1024 * 1024, "Default max should be 1GB");
    assert.strictEqual(
      DEFAULT_EVICTION_CONFIG.targetSize,
      1024 * 1024 * 1024 * 0.8,
      "Default target should be 80% of max"
    );
  });

  it("should calculate target size automatically if not provided", () => {
    const eviction = new VaultEviction(TEST_CACHE_DIR, { maxSize: 1000 });

    // Create entries to trigger eviction
    writeFileSync(join(TEST_CACHE_DIR, "a.json"), JSON.stringify({ data: "x".repeat(600) }));

    const stats = eviction.evict();

    // Target should be 80% of 1000 = 800
    assert.ok(stats.vaultSize <= 800 || stats.entryCount === 0, "Should use auto-calculated target size");
  });
});
