import test from "node:test";
import assert from "node:assert";
import { existsSync, mkdirSync, rmdirSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { Vault, VaultEntry } from "./vault.js";
import { LLMGateway, LLMRequest, LLMResponse } from "../llm-gateway.js";

/**
 * VAULT UNIT TESTS
 *
 * These tests validate the Vault implementation for Sprint 2:
 * - D2.1: Vault Core (computeKey, get, set, has, atomic writes)
 * - D2.2: LLM Gateway Integration (cache hits, misses, metrics)
 * - D2.3: Vault Unit Tests (all acceptance criteria)
 *
 * Test Coverage:
 * 1. Cache key computation (SHA-256 hash)
 * 2. Cache operations (get, set, has)
 * 3. Cache hit/miss behavior
 * 4. 100% hit rate on retry
 * 5. Atomic writes (crash safety)
 * 6. LLM Gateway integration
 * 7. Metrics tracking
 */

const TEST_CACHE_DIR = ".humanify-cache-test/vault";

test.beforeEach(() => {
  // Create test cache directory
  if (!existsSync(TEST_CACHE_DIR)) {
    mkdirSync(TEST_CACHE_DIR, { recursive: true });
  }

  // Clean existing test cache files
  cleanTestCache();
});

test.afterEach(() => {
  // Cleanup test directory
  cleanTestCache();
  try {
    rmdirSync(".humanify-cache-test/vault");
    rmdirSync(".humanify-cache-test");
  } catch {
    // Ignore errors during cleanup
  }
});

function cleanTestCache() {
  if (existsSync(TEST_CACHE_DIR)) {
    const files = readdirSync(TEST_CACHE_DIR);
    for (const file of files) {
      try {
        unlinkSync(join(TEST_CACHE_DIR, file));
      } catch {
        // Ignore errors
      }
    }
  }
}

/**
 * TEST 1: Cache Key Computation
 * Validates that computeKey produces deterministic SHA-256 hashes
 */
test("Vault.computeKey should produce deterministic hash for same input", () => {
  const vault = new Vault(TEST_CACHE_DIR);

  const model = "gpt-4o-mini";
  const prompt = "Rename this variable: x";
  const options = { temperature: 0.3, maxTokens: 100 };

  const key1 = vault.computeKey(model, prompt, options);
  const key2 = vault.computeKey(model, prompt, options);

  assert.strictEqual(key1, key2, "Same input should produce same key");
  assert.strictEqual(typeof key1, "string", "Key should be a string");
  assert.strictEqual(key1.length, 64, "SHA-256 hash should be 64 hex chars");
});

test("Vault.computeKey should produce different hash for different inputs", () => {
  const vault = new Vault(TEST_CACHE_DIR);

  const key1 = vault.computeKey("gpt-4o-mini", "prompt1", {});
  const key2 = vault.computeKey("gpt-4o-mini", "prompt2", {});
  const key3 = vault.computeKey("gpt-4o", "prompt1", {});
  const key4 = vault.computeKey("gpt-4o-mini", "prompt1", { temp: 0.5 });

  assert.notStrictEqual(key1, key2, "Different prompts should produce different keys");
  assert.notStrictEqual(key1, key3, "Different models should produce different keys");
  assert.notStrictEqual(key1, key4, "Different options should produce different keys");
});

test("Vault.computeKey should handle option key ordering", () => {
  const vault = new Vault(TEST_CACHE_DIR);

  const options1 = { temperature: 0.3, maxTokens: 100 };
  const options2 = { maxTokens: 100, temperature: 0.3 }; // Different order

  const key1 = vault.computeKey("gpt-4o-mini", "prompt", options1);
  const key2 = vault.computeKey("gpt-4o-mini", "prompt", options2);

  assert.strictEqual(key1, key2, "Option key order should not affect hash");
});

/**
 * TEST 2: Cache Operations (get, set, has)
 */
test("Vault.set should write entry to disk", async () => {
  const vault = new Vault(TEST_CACHE_DIR);

  const key = vault.computeKey("gpt-4o-mini", "test prompt", {});
  const entry: VaultEntry = {
    request: {
      model: "gpt-4o-mini",
      prompt: "test prompt",
      options: {},
    },
    response: {
      content: "testVariable",
      tokens: { prompt: 10, completion: 5, total: 15 },
      timestamp: new Date().toISOString(),
    },
    hash: key,
  };

  await vault.set(key, entry);

  const path = join(TEST_CACHE_DIR, `${key}.json`);
  assert.ok(existsSync(path), "Vault entry file should exist on disk");
});

test("Vault.get should return cached entry", async () => {
  const vault = new Vault(TEST_CACHE_DIR);

  const key = vault.computeKey("gpt-4o-mini", "test prompt", {});
  const entry: VaultEntry = {
    request: {
      model: "gpt-4o-mini",
      prompt: "test prompt",
      options: {},
    },
    response: {
      content: "testVariable",
      tokens: { prompt: 10, completion: 5, total: 15 },
      timestamp: new Date().toISOString(),
    },
    hash: key,
  };

  await vault.set(key, entry);
  const retrieved = await vault.get(key);

  assert.ok(retrieved !== null, "Should retrieve cached entry");
  assert.strictEqual(retrieved.response.content, "testVariable");
  assert.strictEqual(retrieved.request.model, "gpt-4o-mini");
  assert.strictEqual(retrieved.request.prompt, "test prompt");
  assert.deepStrictEqual(retrieved.response.tokens, { prompt: 10, completion: 5, total: 15 });
});

test("Vault.get should return null for missing entry", async () => {
  const vault = new Vault(TEST_CACHE_DIR);

  const key = "nonexistent-key-hash";
  const retrieved = await vault.get(key);

  assert.strictEqual(retrieved, null, "Should return null for missing entry");
});

test("Vault.has should return true for existing entry", async () => {
  const vault = new Vault(TEST_CACHE_DIR);

  const key = vault.computeKey("gpt-4o-mini", "test prompt", {});
  const entry: VaultEntry = {
    request: {
      model: "gpt-4o-mini",
      prompt: "test prompt",
      options: {},
    },
    response: {
      content: "testVariable",
      tokens: { prompt: 10, completion: 5, total: 15 },
      timestamp: new Date().toISOString(),
    },
    hash: key,
  };

  await vault.set(key, entry);
  const exists = await vault.has(key);

  assert.strictEqual(exists, true, "Should return true for existing entry");
});

test("Vault.has should return false for missing entry", async () => {
  const vault = new Vault(TEST_CACHE_DIR);

  const key = "nonexistent-key-hash";
  const exists = await vault.has(key);

  assert.strictEqual(exists, false, "Should return false for missing entry");
});

/**
 * TEST 3: Atomic Writes
 * Validates that temp + rename pattern prevents corruption
 */
test("Vault.set should use atomic write pattern", async () => {
  const vault = new Vault(TEST_CACHE_DIR);

  const key = vault.computeKey("gpt-4o-mini", "test prompt", {});
  const entry: VaultEntry = {
    request: {
      model: "gpt-4o-mini",
      prompt: "test prompt",
      options: {},
    },
    response: {
      content: "testVariable",
      tokens: { prompt: 10, completion: 5, total: 15 },
      timestamp: new Date().toISOString(),
    },
    hash: key,
  };

  await vault.set(key, entry);

  // Verify temp file was cleaned up
  const tempPath = join(TEST_CACHE_DIR, `${key}.json.tmp`);
  assert.strictEqual(existsSync(tempPath), false, "Temp file should be cleaned up after write");

  // Verify final file exists
  const finalPath = join(TEST_CACHE_DIR, `${key}.json`);
  assert.ok(existsSync(finalPath), "Final file should exist");
});

test("Vault.set should handle invalid entry gracefully", async () => {
  const vault = new Vault(TEST_CACHE_DIR);

  const key = "test-key";
  const invalidEntry = {
    // Missing required fields
    response: { content: "test" },
  } as any;

  await assert.rejects(
    async () => await vault.set(key, invalidEntry),
    /Invalid vault entry structure/,
    "Should reject invalid entry structure"
  );
});

/**
 * TEST 4: LLM Gateway Integration - Cache Miss
 * Validates that cache miss triggers API call and stores result
 */
test("LLMGateway should call provider on cache miss", async () => {
  let providerCalled = false;
  const mockProvider = async (request: LLMRequest): Promise<LLMResponse> => {
    providerCalled = true;
    return {
      content: "renamedVariable",
      tokens: { prompt: 10, completion: 5, total: 15 },
    };
  };

  const gateway = new LLMGateway(mockProvider, TEST_CACHE_DIR);

  const request: LLMRequest = {
    model: "gpt-4o-mini",
    prompt: "Rename this: x",
    options: { temperature: 0.3 },
  };

  const response = await gateway.request(request);

  assert.ok(providerCalled, "Provider should be called on cache miss");
  assert.strictEqual(response.content, "renamedVariable");
  assert.deepStrictEqual(response.tokens, { prompt: 10, completion: 5, total: 15 });
});

test("LLMGateway should store response in vault after API call", async () => {
  const mockProvider = async (request: LLMRequest): Promise<LLMResponse> => {
    return {
      content: "renamedVariable",
      tokens: { prompt: 10, completion: 5, total: 15 },
    };
  };

  const gateway = new LLMGateway(mockProvider, TEST_CACHE_DIR);
  const vault = new Vault(TEST_CACHE_DIR);

  const request: LLMRequest = {
    model: "gpt-4o-mini",
    prompt: "Rename this: x",
    options: { temperature: 0.3 },
  };

  await gateway.request(request);

  const key = vault.computeKey(request.model, request.prompt, request.options || {});
  const cached = await vault.get(key);

  assert.ok(cached !== null, "Response should be stored in vault");
  assert.strictEqual(cached.response.content, "renamedVariable");
});

/**
 * TEST 5: LLM Gateway Integration - Cache Hit
 * Validates that cache hit skips API call
 */
test("LLMGateway should skip provider on cache hit", async () => {
  let providerCallCount = 0;
  const mockProvider = async (request: LLMRequest): Promise<LLMResponse> => {
    providerCallCount++;
    return {
      content: "renamedVariable",
      tokens: { prompt: 10, completion: 5, total: 15 },
    };
  };

  const gateway = new LLMGateway(mockProvider, TEST_CACHE_DIR);

  const request: LLMRequest = {
    model: "gpt-4o-mini",
    prompt: "Rename this: x",
    options: { temperature: 0.3 },
  };

  // First call - cache miss
  await gateway.request(request);
  assert.strictEqual(providerCallCount, 1, "Provider should be called once on first request");

  // Second call - cache hit
  await gateway.request(request);
  assert.strictEqual(providerCallCount, 1, "Provider should not be called again on cache hit");
});

test("LLMGateway should return cached response on cache hit", async () => {
  const mockProvider = async (request: LLMRequest): Promise<LLMResponse> => {
    return {
      content: "renamedVariable",
      tokens: { prompt: 10, completion: 5, total: 15 },
    };
  };

  const gateway = new LLMGateway(mockProvider, TEST_CACHE_DIR);

  const request: LLMRequest = {
    model: "gpt-4o-mini",
    prompt: "Rename this: x",
    options: { temperature: 0.3 },
  };

  const response1 = await gateway.request(request);
  const response2 = await gateway.request(request);

  assert.deepStrictEqual(response1, response2, "Cached response should match original");
});

/**
 * TEST 6: 100% Hit Rate on Retry
 * Validates Gate 2 acceptance criteria
 */
test("LLMGateway should achieve 100% hit rate on identical requests", async () => {
  let providerCallCount = 0;
  const mockProvider = async (request: LLMRequest): Promise<LLMResponse> => {
    providerCallCount++;
    return {
      content: `variable${providerCallCount}`,
      tokens: { prompt: 10, completion: 5, total: 15 },
    };
  };

  const gateway = new LLMGateway(mockProvider, TEST_CACHE_DIR);

  const request: LLMRequest = {
    model: "gpt-4o-mini",
    prompt: "Rename this: x",
    options: { temperature: 0.3 },
  };

  // Make 10 identical requests
  for (let i = 0; i < 10; i++) {
    await gateway.request(request);
  }

  assert.strictEqual(providerCallCount, 1, "Provider should only be called once");

  const metrics = gateway.getMetrics();
  assert.strictEqual(metrics.totalRequests, 10);
  assert.strictEqual(metrics.hits, 9);
  assert.strictEqual(metrics.misses, 1);

  const hitRate = gateway.getHitRate();
  assert.strictEqual(hitRate, 90, "Hit rate should be 90% (9/10)");
});

/**
 * TEST 7: Metrics Tracking
 * Validates that LLM Gateway tracks hits, misses, errors
 */
test("LLMGateway should track metrics correctly", async () => {
  const mockProvider = async (request: LLMRequest): Promise<LLMResponse> => {
    return {
      content: "renamedVariable",
      tokens: { prompt: 10, completion: 5, total: 15 },
    };
  };

  const gateway = new LLMGateway(mockProvider, TEST_CACHE_DIR);

  const request1: LLMRequest = {
    model: "gpt-4o-mini",
    prompt: "Rename this: x",
    options: {},
  };

  const request2: LLMRequest = {
    model: "gpt-4o-mini",
    prompt: "Rename this: y",
    options: {},
  };

  // First request - miss
  await gateway.request(request1);
  let metrics = gateway.getMetrics();
  assert.strictEqual(metrics.totalRequests, 1);
  assert.strictEqual(metrics.misses, 1);
  assert.strictEqual(metrics.hits, 0);

  // Second request (same) - hit
  await gateway.request(request1);
  metrics = gateway.getMetrics();
  assert.strictEqual(metrics.totalRequests, 2);
  assert.strictEqual(metrics.misses, 1);
  assert.strictEqual(metrics.hits, 1);

  // Third request (different) - miss
  await gateway.request(request2);
  metrics = gateway.getMetrics();
  assert.strictEqual(metrics.totalRequests, 3);
  assert.strictEqual(metrics.misses, 2);
  assert.strictEqual(metrics.hits, 1);
});

test("LLMGateway should track errors correctly", async () => {
  const mockProvider = async (request: LLMRequest): Promise<LLMResponse> => {
    throw new Error("API error");
  };

  const gateway = new LLMGateway(mockProvider, TEST_CACHE_DIR);

  const request: LLMRequest = {
    model: "gpt-4o-mini",
    prompt: "Rename this: x",
    options: {},
  };

  await assert.rejects(
    async () => await gateway.request(request),
    /API error/,
    "Should propagate provider errors"
  );

  const metrics = gateway.getMetrics();
  assert.strictEqual(metrics.totalRequests, 1);
  assert.strictEqual(metrics.errors, 1);
});

/**
 * TEST 8: Crash Recovery Simulation
 * Validates that vault survives process interruption
 */
test("Vault should survive simulated crash during write", async () => {
  const vault = new Vault(TEST_CACHE_DIR);

  const key = vault.computeKey("gpt-4o-mini", "test prompt", {});
  const entry: VaultEntry = {
    request: {
      model: "gpt-4o-mini",
      prompt: "test prompt",
      options: {},
    },
    response: {
      content: "testVariable",
      tokens: { prompt: 10, completion: 5, total: 15 },
      timestamp: new Date().toISOString(),
    },
    hash: key,
  };

  // Write entry
  await vault.set(key, entry);

  // Simulate crash by creating a corrupt temp file
  const tempPath = join(TEST_CACHE_DIR, `${key}.json.tmp`);
  writeFileSync(tempPath, "{ incomplete json", "utf-8");

  // New vault instance (simulates restart)
  const vault2 = new Vault(TEST_CACHE_DIR);
  const retrieved = await vault2.get(key);

  assert.ok(retrieved !== null, "Should retrieve valid entry after restart");
  assert.strictEqual(retrieved.response.content, "testVariable");

  // Verify corrupt temp file doesn't affect operations
  const exists = await vault2.has(key);
  assert.strictEqual(exists, true, "Should still find valid entry");
});
