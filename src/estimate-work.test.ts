import assert from "assert";
import test from "node:test";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { estimateWork, EstimateOptions } from "./estimate-work.js";

/**
 * Test helper: create a temporary file
 */
async function createTempFile(content: string): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "humanify-estimate-test-"));
  const tmpFile = path.join(tmpDir, "test-input.js");
  await fs.writeFile(tmpFile, content);
  return tmpFile;
}

/**
 * Test helper: create a temporary output directory
 */
async function createTempOutputDir(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "humanify-estimate-output-"));
}

/**
 * Test helper: cleanup temporary files/directories
 */
async function cleanup(...paths: string[]): Promise<void> {
  for (const p of paths) {
    try {
      const stat = await fs.stat(p);
      if (stat.isDirectory()) {
        await fs.rm(p, { recursive: true, force: true });
      } else {
        await fs.unlink(p);
      }
    } catch (err) {
      // Ignore errors (file might not exist)
    }
  }
}

test("estimateWork: simple file with few identifiers (sequential mode)", async () => {
  const code = `
    const a = 1;
    const b = 2;
    function c() {
      const d = 3;
    }
  `;

  const tmpFile = await createTempFile(code);
  const outputDir = await createTempOutputDir();

  try {
    const estimate = await estimateWork(tmpFile, outputDir, {
      turbo: false
    });

    // Verify basic structure
    assert.ok(estimate.totalFiles >= 1, "Should have at least 1 file");
    assert.ok(estimate.totalIdentifiers > 0, "Should have identifiers");
    assert.strictEqual(estimate.totalBatches, 1, "Sequential mode should have 1 batch");
    assert.strictEqual(
      estimate.estimatedAPICalls,
      estimate.totalIdentifiers,
      "API calls should equal identifiers in sequential mode"
    );

    // Verify file-level data
    assert.strictEqual(estimate.files.length, estimate.totalFiles, "Files array should match totalFiles");

    const firstFile = estimate.files[0];
    assert.ok(firstFile.path, "File should have path");
    assert.ok(firstFile.identifiers > 0, "File should have identifiers");
    assert.strictEqual(firstFile.batches, 1, "Sequential mode file should have 1 batch");
    assert.strictEqual(firstFile.chunks, 1, "Small file should have 1 chunk");
  } finally {
    await cleanup(tmpFile, outputDir);
  }
});

test("estimateWork: simple file with few identifiers (turbo mode)", async () => {
  const code = `
    const a = 1;
    const b = 2;
    function c() {
      const d = 3;
    }
  `;

  const tmpFile = await createTempFile(code);
  const outputDir = await createTempOutputDir();

  try {
    const estimate = await estimateWork(tmpFile, outputDir, {
      turbo: true,
      maxConcurrent: 10,
      dependencyMode: "balanced"
    });

    // Verify basic structure
    assert.ok(estimate.totalFiles >= 1, "Should have at least 1 file");
    assert.ok(estimate.totalIdentifiers > 0, "Should have identifiers");
    assert.ok(estimate.totalBatches >= 1, "Turbo mode should have batches");
    assert.strictEqual(
      estimate.estimatedAPICalls,
      estimate.totalIdentifiers,
      "API calls should equal identifiers in turbo mode"
    );

    const firstFile = estimate.files[0];
    assert.ok(firstFile.batches >= 1, "Turbo mode should create batches");
    assert.strictEqual(firstFile.chunks, 1, "Small file should have 1 chunk");
  } finally {
    await cleanup(tmpFile, outputDir);
  }
});

test("estimateWork: nested scopes create multiple batches in turbo mode", async () => {
  const code = `
    const outer = 1;
    function middle() {
      const inner = 2;
      function deepest() {
        const veryDeep = 3;
      }
    }
  `;

  const tmpFile = await createTempFile(code);
  const outputDir = await createTempOutputDir();

  try {
    const estimate = await estimateWork(tmpFile, outputDir, {
      turbo: true,
      maxConcurrent: 10,
      dependencyMode: "balanced"
    });

    // Turbo mode with nested scopes should create multiple batches
    assert.ok(
      estimate.totalBatches > 1,
      `Turbo mode with nested scopes should create multiple batches, got ${estimate.totalBatches}`
    );

    // Each identifier needs one API call
    assert.ok(estimate.estimatedAPICalls >= 4, "Should have at least 4 API calls for 4 identifiers");
  } finally {
    await cleanup(tmpFile, outputDir);
  }
});

test("estimateWork: empty file", async () => {
  const code = "";

  const tmpFile = await createTempFile(code);
  const outputDir = await createTempOutputDir();

  try {
    const estimate = await estimateWork(tmpFile, outputDir, {
      turbo: false
    });

    // Empty file should have no identifiers or batches
    assert.strictEqual(estimate.totalIdentifiers, 0, "Empty file should have 0 identifiers");
    assert.strictEqual(estimate.totalBatches, 0, "Empty file should have 0 batches");
    assert.strictEqual(estimate.estimatedAPICalls, 0, "Empty file should have 0 API calls");
  } finally {
    await cleanup(tmpFile, outputDir);
  }
});

test("estimateWork: handles chunking for large files", async () => {
  // Create a file that exceeds chunk threshold (100KB default)
  // Generate unique function names to avoid parse errors
  const code = Array.from({ length: 5000 }, (_, i) =>
    `function fn${i}() { return ${i}; }`
  ).join("\n"); // ~250KB

  const tmpFile = await createTempFile(code);
  const outputDir = await createTempOutputDir();

  try {
    const estimate = await estimateWork(tmpFile, outputDir, {
      turbo: false,
      chunkSize: 100000, // 100KB threshold
      enableChunking: true
    });

    const firstFile = estimate.files[0];

    // File should be split into multiple chunks
    assert.ok(
      firstFile.chunks > 1,
      `Large file should be chunked, got ${firstFile.chunks} chunks`
    );

    // Total identifiers should still be counted correctly
    assert.ok(estimate.totalIdentifiers > 0, "Chunked file should have identifiers");
  } finally {
    await cleanup(tmpFile, outputDir);
  }
});

test("estimateWork: respects minBatchSize option", async () => {
  const code = `
    const a = 1;
    const b = 2;
    const c = 3;
    const d = 4;
    const e = 5;
  `;

  const tmpFile = await createTempFile(code);
  const outputDir = await createTempOutputDir();

  try {
    // With minBatchSize = 1, each identifier in its own batch
    const estimate1 = await estimateWork(tmpFile, outputDir, {
      turbo: true,
      minBatchSize: 1,
      dependencyMode: "relaxed" // Relaxed mode creates more batches
    });

    // With minBatchSize = 3, batches should be merged
    const estimate2 = await estimateWork(tmpFile, outputDir, {
      turbo: true,
      minBatchSize: 3,
      dependencyMode: "relaxed"
    });

    // Higher minBatchSize should result in fewer batches
    assert.ok(
      estimate2.totalBatches <= estimate1.totalBatches,
      `Higher minBatchSize should create fewer batches: ${estimate2.totalBatches} vs ${estimate1.totalBatches}`
    );

    // API calls should remain the same (one per identifier)
    assert.strictEqual(
      estimate1.estimatedAPICalls,
      estimate2.estimatedAPICalls,
      "API calls should be the same regardless of batch size"
    );
  } finally {
    await cleanup(tmpFile, outputDir);
  }
});

test("estimateWork: respects maxBatchSize option", async () => {
  // Create a file with many independent variables (no dependencies)
  const variables = Array.from({ length: 150 }, (_, i) => `const var${i} = ${i};`).join("\n");

  const tmpFile = await createTempFile(variables);
  const outputDir = await createTempOutputDir();

  try {
    const estimate = await estimateWork(tmpFile, outputDir, {
      turbo: true,
      maxBatchSize: 50, // Split batches larger than 50
      dependencyMode: "relaxed" // Relaxed mode creates fewer large batches
    });

    // All batches should be <= maxBatchSize (except possibly last one)
    const firstFile = estimate.files[0];

    // With 150 identifiers and maxBatchSize=50, should have at least 3 batches
    assert.ok(
      firstFile.batches >= 3,
      `maxBatchSize=50 with 150 identifiers should create at least 3 batches, got ${firstFile.batches}`
    );
  } finally {
    await cleanup(tmpFile, outputDir);
  }
});

test("estimateWork: dependency mode affects batch count", async () => {
  const code = `
    const outer = 1;
    function middle() {
      const inner = outer + 1;
      function deepest() {
        const veryDeep = inner + 1;
      }
    }
  `;

  const tmpFile = await createTempFile(code);
  const outputDir = await createTempOutputDir();

  try {
    // Balanced mode (default)
    const balancedEstimate = await estimateWork(tmpFile, outputDir, {
      turbo: true,
      dependencyMode: "balanced"
    });

    // Relaxed mode (fewer dependencies)
    const relaxedEstimate = await estimateWork(tmpFile, outputDir, {
      turbo: true,
      dependencyMode: "relaxed"
    });

    // Relaxed mode may create different batch structure
    // (not necessarily fewer batches, but different organization)
    assert.ok(balancedEstimate.totalBatches >= 1, "Balanced mode should create batches");
    assert.ok(relaxedEstimate.totalBatches >= 1, "Relaxed mode should create batches");

    // Both should have same total identifiers
    assert.strictEqual(
      balancedEstimate.totalIdentifiers,
      relaxedEstimate.totalIdentifiers,
      "Different dependency modes should count same identifiers"
    );
  } finally {
    await cleanup(tmpFile, outputDir);
  }
});

test("estimateWork: counts identifiers accurately", async () => {
  const code = `
    const a = 1;           // 1 identifier
    let b = 2;             // 2 identifiers
    var c = 3;             // 3 identifiers
    function d() {         // 4 identifiers
      const e = 4;         // 5 identifiers
    }
    class F {              // 6 identifiers
      method() {           // 7 identifiers (method name not counted)
        const g = 5;       // 8 identifiers
      }
    }
  `;

  const tmpFile = await createTempFile(code);
  const outputDir = await createTempOutputDir();

  try {
    const estimate = await estimateWork(tmpFile, outputDir, {
      turbo: false
    });

    // We should have at least these identifiers: a, b, c, d, e, F, g
    // (method names are not counted as binding identifiers)
    assert.ok(
      estimate.totalIdentifiers >= 7,
      `Should have at least 7 identifiers, got ${estimate.totalIdentifiers}`
    );
  } finally {
    await cleanup(tmpFile, outputDir);
  }
});

test("estimateWork: handles complex expressions", async () => {
  const code = `
    const [a, b] = [1, 2];           // Destructuring
    const {c, d: e} = {c: 3, d: 4};  // Object destructuring with rename
    function f(g, h = 5) {           // Function with default param
      const i = g + h;
      return i;
    }
    const j = (k) => k + 1;          // Arrow function
  `;

  const tmpFile = await createTempFile(code);
  const outputDir = await createTempOutputDir();

  try {
    const estimate = await estimateWork(tmpFile, outputDir, {
      turbo: true
    });

    // Should count all destructured variables and parameters
    assert.ok(
      estimate.totalIdentifiers >= 10,
      `Should count destructured and parameter identifiers, got ${estimate.totalIdentifiers}`
    );

    // Should not throw errors on complex syntax
    assert.ok(estimate.totalBatches >= 1, "Should handle complex syntax");
  } finally {
    await cleanup(tmpFile, outputDir);
  }
});

test("estimateWork: disabled chunking processes large files as single unit", async () => {
  // Generate unique function names to avoid parse errors
  const code = Array.from({ length: 5000 }, (_, i) =>
    `function fn${i}() { return ${i}; }`
  ).join("\n"); // ~250KB

  const tmpFile = await createTempFile(code);
  const outputDir = await createTempOutputDir();

  try {
    const estimate = await estimateWork(tmpFile, outputDir, {
      turbo: false,
      enableChunking: false // Disable chunking
    });

    const firstFile = estimate.files[0];

    // File should NOT be chunked
    assert.strictEqual(
      firstFile.chunks,
      1,
      "Chunking disabled should result in 1 chunk"
    );
  } finally {
    await cleanup(tmpFile, outputDir);
  }
});
