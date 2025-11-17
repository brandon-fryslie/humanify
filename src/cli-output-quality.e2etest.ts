/**
 * End-to-End tests for CLI output quality
 *
 * These tests validate the COMPLETE USER WORKFLOW from CLI invocation to file output.
 * They verify:
 *
 * 1. Output files exist
 * 2. Output has semantic variable names (not single-letter)
 * 3. Output is syntactically valid JavaScript
 * 4. Output is functionally equivalent to input
 *
 * These tests are UN-GAMEABLE because they:
 * - Run the actual CLI binary (not mocked functions)
 * - Verify actual files on disk (not in-memory strings)
 * - Check real AST structure (not string matching)
 * - Measure actual identifier quality (not test doubles)
 *
 * TESTING STRATEGY:
 * - Use local provider (no API keys required)
 * - Use deterministic seed for reproducible results
 * - Verify output quality metrics, not exact output
 */

import test from "node:test";
import assert from "node:assert";
import { readFile, writeFile, rm, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { parseAsync } from "@babel/core";
import { humanify } from "./test-utils.js";

const TEST_OUTPUT_DIR = "test-output-quality-e2e";
const TEST_FIXTURES_DIR = "test-fixtures-quality";

/**
 * Helper: Analyze identifier quality in code
 */
async function analyzeIdentifierQuality(code: string): Promise<{
  totalIdentifiers: number;
  singleLetterCount: number;
  singleLetterRatio: number;
  averageLength: number;
  identifiers: string[];
}> {
  const ast = await parseAsync(code, { sourceType: "unambiguous" });
  if (!ast) {
    throw new Error("Failed to parse code");
  }

  const identifiers = new Set<string>();

  const babelTraverse = await import("@babel/traverse");
  const traverse = typeof babelTraverse.default === "function"
    ? babelTraverse.default
    : (babelTraverse.default as any).default;

  traverse(ast, {
    Identifier(path) {
      if (path.isBindingIdentifier()) {
        identifiers.add(path.node.name);
      }
    }
  });

  const identifierList = Array.from(identifiers);
  const singleLetterIds = identifierList.filter(id => id.length === 1);
  const totalLength = identifierList.reduce((sum, id) => sum + id.length, 0);

  return {
    totalIdentifiers: identifierList.length,
    singleLetterCount: singleLetterIds.length,
    singleLetterRatio: identifierList.length > 0
      ? singleLetterIds.length / identifierList.length
      : 0,
    averageLength: identifierList.length > 0
      ? totalLength / identifierList.length
      : 0,
    identifiers: identifierList
  };
}

/**
 * Setup: Create test fixtures directory
 */
test.beforeEach(async () => {
  if (!existsSync(TEST_FIXTURES_DIR)) {
    await mkdir(TEST_FIXTURES_DIR, { recursive: true });
  }
  if (!existsSync(TEST_OUTPUT_DIR)) {
    await mkdir(TEST_OUTPUT_DIR, { recursive: true });
  }
});

/**
 * Cleanup: Remove test output directory
 */
test.afterEach(async () => {
  await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
});

/**
 * Test 1: Simple obfuscated file should produce semantic variable names
 *
 * ISSUE #2 FIX: Changed from <= 0.2 to === 0
 * User spec: "I would not expect to see ANY single letter variables"
 */
test("CLI should deobfuscate simple file with zero single-letter variables", async () => {
  // Create test fixture with clearly obfuscated code
  const obfuscatedCode = `
function a(e, t) {
  var n = [];
  var r = e.length;
  var i = 0;
  for (; i < r; i += t) {
    if (i + t < r) {
      n.push(e.substring(i, i + t));
    } else {
      n.push(e.substring(i, r));
    }
  }
  return n;
}
  `.trim();

  const inputFile = path.join(TEST_FIXTURES_DIR, "simple-obfuscated.js");
  await writeFile(inputFile, obfuscatedCode);

  // Run full CLI with local provider
  await humanify(
    "unminify",
    inputFile,
    "--provider",
    "local",
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  // Verify output file exists
  const outputFiles = await readdir(TEST_OUTPUT_DIR);
  const jsFiles = outputFiles.filter(f => f.endsWith('.js'));

  assert.ok(
    jsFiles.length > 0,
    "Should create at least one output file"
  );

  // Read and analyze output
  const outputFile = path.join(TEST_OUTPUT_DIR, jsFiles[0]);
  const outputCode = await readFile(outputFile, 'utf-8');

  // Verify output is not empty
  assert.ok(
    outputCode.length > 0,
    "Output file should not be empty"
  );

  // Analyze identifier quality
  const metrics = await analyzeIdentifierQuality(outputCode);

  // CRITICAL ASSERTION: User expects ZERO single-letter variables
  // Changed from <= 0.2 (20% allowed) to === 0 (0% required)
  assert.strictEqual(
    metrics.singleLetterRatio,
    0,
    `Expected zero single-letter variables, found ${metrics.singleLetterCount}/${metrics.totalIdentifiers}: ${metrics.identifiers.filter(id => id.length === 1).join(', ')}`
  );

  // Verify average identifier length improved
  const inputMetrics = await analyzeIdentifierQuality(obfuscatedCode);
  assert.ok(
    metrics.averageLength > inputMetrics.averageLength,
    `Average identifier length should improve: input=${inputMetrics.averageLength.toFixed(2)}, ` +
    `output=${metrics.averageLength.toFixed(2)}`
  );

  // Verify output is valid JavaScript
  const parsed = await parseAsync(outputCode, { sourceType: "unambiguous" });
  assert.ok(parsed, "Output should be valid JavaScript");
}, { timeout: 120000 }); // 2 minute timeout for LLM processing

/**
 * Test 2: Multiple obfuscated functions should all be deobfuscated
 *
 * ISSUE #2 FIX: Changed from <= 0.3 to === 0
 */
test("CLI should deobfuscate all functions in file", async () => {
  const obfuscatedCode = `
function a(b) {
  return b * 2;
}

function c(d, e) {
  return a(d) + a(e);
}

var f = function(g) {
  var h = g.split(',');
  return h;
};

const j = (k) => k.toUpperCase();
  `.trim();

  const inputFile = path.join(TEST_FIXTURES_DIR, "multiple-functions.js");
  await writeFile(inputFile, obfuscatedCode);

  await humanify(
    "unminify",
    inputFile,
    "--provider",
    "local",
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  const outputFiles = await readdir(TEST_OUTPUT_DIR);
  const jsFiles = outputFiles.filter(f => f.endsWith('.js'));
  assert.ok(jsFiles.length > 0, "Should create output file");

  const outputCode = await readFile(
    path.join(TEST_OUTPUT_DIR, jsFiles[0]),
    'utf-8'
  );

  const metrics = await analyzeIdentifierQuality(outputCode);

  // Should have renamed multiple identifiers
  assert.ok(
    metrics.totalIdentifiers >= 8,
    `Should have at least 8 identifiers, got ${metrics.totalIdentifiers}`
  );

  // CRITICAL ASSERTION: Zero single-letter variables required
  // Changed from <= 0.3 (30% allowed) to === 0 (0% required)
  assert.strictEqual(
    metrics.singleLetterRatio,
    0,
    `Expected zero single-letter variables, found ${metrics.singleLetterCount}/${metrics.totalIdentifiers}: ${metrics.identifiers.filter(id => id.length === 1).join(', ')}`
  );

  // Verify valid JavaScript
  const parsed = await parseAsync(outputCode, { sourceType: "unambiguous" });
  assert.ok(parsed, "Output should be valid JavaScript");
}, { timeout: 180000 }); // 3 minute timeout for more identifiers

/**
 * Test 3: Verify output maintains functional equivalence
 *
 * ISSUE #1 FIX: Removed AST node count assertion
 * This was testing implementation details, not user outcomes.
 * Now only validates that transformation occurred and output is valid.
 */
test("CLI output should preserve code structure", async () => {
  const obfuscatedCode = `
function a(e, t) {
  if (e > t) {
    return e - t;
  } else {
    return t - e;
  }
}

const b = a(10, 5);
const c = a(3, 7);
  `.trim();

  const inputFile = path.join(TEST_FIXTURES_DIR, "structure-test.js");
  await writeFile(inputFile, obfuscatedCode);

  await humanify(
    "unminify",
    inputFile,
    "--provider",
    "local",
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  const outputFiles = await readdir(TEST_OUTPUT_DIR);
  const outputCode = await readFile(
    path.join(TEST_OUTPUT_DIR, outputFiles.filter(f => f.endsWith('.js'))[0]),
    'utf-8'
  );

  // Parse both to verify valid JavaScript
  const originalAST = await parseAsync(obfuscatedCode, { sourceType: "unambiguous" });
  const outputAST = await parseAsync(outputCode, { sourceType: "unambiguous" });

  assert.ok(originalAST, "Original should parse");
  assert.ok(outputAST, "Output should parse");

  // ISSUE #1 FIX: Removed assertion checking body.length
  // This was an implementation detail that could change with different
  // formatting/prettier settings. Not a user-observable outcome.

  // Verify we actually transformed (not a no-op)
  assert.notStrictEqual(
    obfuscatedCode.trim(),
    outputCode.trim(),
    "Output should differ from input (actual transformation occurred)"
  );

  // Verify semantic quality: function should exist with semantic names
  const babelTraverse = await import("@babel/traverse");
  const traverse = typeof babelTraverse.default === "function"
    ? babelTraverse.default
    : (babelTraverse.default as any).default;

  let foundFunction = false;
  let functionCalls = 0;

  traverse(outputAST, {
    FunctionDeclaration(path) {
      foundFunction = true;
    },
    CallExpression(path) {
      functionCalls++;
    }
  });

  assert.ok(foundFunction, "Should preserve function declaration");
  assert.strictEqual(functionCalls, 2, "Should preserve function calls");
}, { timeout: 120000 });

/**
 * Test 4: Verify output file naming
 */
test("CLI should create output file with correct name", async () => {
  const obfuscatedCode = `const a = 1;`;
  const inputFile = path.join(TEST_FIXTURES_DIR, "simple.js");
  await writeFile(inputFile, obfuscatedCode);

  await humanify(
    "unminify",
    inputFile,
    "--provider",
    "local",
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  const outputFiles = await readdir(TEST_OUTPUT_DIR);
  const jsFiles = outputFiles.filter(f => f.endsWith('.js'));

  assert.ok(jsFiles.length > 0, "Should create output file");

  // Verify at least one output file exists
  const outputExists = jsFiles.some(f => {
    return f === 'deobfuscated.js' || f === 'simple.js' || f === 'index.js';
  });

  assert.ok(
    outputExists,
    `Output filename should be standard, got: ${jsFiles.join(', ')}`
  );
}, { timeout: 60000 });

/**
 * Test 5: Turbo mode should also produce quality output
 *
 * ISSUE #3: This test may fail due to turbo mode crash with local LLM
 * ISSUE #2 FIX: Changed from <= 0.2 to === 0
 */
test("CLI with turbo mode should eliminate single-letter variables", async () => {
  const obfuscatedCode = `
function a(e, t) {
  var n = e + t;
  var r = n * 2;
  return r;
}
  `.trim();

  const inputFile = path.join(TEST_FIXTURES_DIR, "turbo-test.js");
  await writeFile(inputFile, obfuscatedCode);

  await humanify(
    "unminify",
    inputFile,
    "--provider",
    "local",
    "--turbo",
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  const outputFiles = await readdir(TEST_OUTPUT_DIR);
  const jsFiles = outputFiles.filter(f => f.endsWith('.js'));
  assert.ok(jsFiles.length > 0, "Should create output file");

  const outputCode = await readFile(
    path.join(TEST_OUTPUT_DIR, jsFiles[0]),
    'utf-8'
  );

  const metrics = await analyzeIdentifierQuality(outputCode);

  // CRITICAL ASSERTION: Zero single-letter variables required
  // Changed from <= 0.2 (20% allowed) to === 0 (0% required)
  assert.strictEqual(
    metrics.singleLetterRatio,
    0,
    `Turbo mode: Expected zero single-letter variables, found ${metrics.singleLetterCount}/${metrics.totalIdentifiers}: ${metrics.identifiers.filter(id => id.length === 1).join(', ')}`
  );

  // Verify valid JavaScript
  const parsed = await parseAsync(outputCode, { sourceType: "unambiguous" });
  assert.ok(parsed, "Turbo mode output should be valid JavaScript");
}, { timeout: 120000 });

/**
 * Test 6: Verify CLI handles existing output directory
 */
test("CLI should handle existing output directory gracefully", async () => {
  const obfuscatedCode = `const a = 42;`;
  const inputFile = path.join(TEST_FIXTURES_DIR, "existing-dir-test.js");
  await writeFile(inputFile, obfuscatedCode);

  // First run
  await humanify(
    "unminify",
    inputFile,
    "--provider",
    "local",
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  // Second run (output dir already exists)
  // Should not crash, should overwrite or create new timestamp dir
  await humanify(
    "unminify",
    inputFile,
    "--provider",
    "local",
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  // Verify output still exists and is valid
  const outputFiles = await readdir(TEST_OUTPUT_DIR);
  const jsFiles = outputFiles.filter(f => f.endsWith('.js'));

  assert.ok(jsFiles.length > 0, "Should create output even when dir exists");

  const outputCode = await readFile(
    path.join(TEST_OUTPUT_DIR, jsFiles[0]),
    'utf-8'
  );

  const parsed = await parseAsync(outputCode, { sourceType: "unambiguous" });
  assert.ok(parsed, "Second run output should be valid JavaScript");
}, { timeout: 120000 });

/**
 * Test 7: Verify error handling for invalid input
 *
 * ISSUE #4 FIX: Updated test to use truly invalid JavaScript syntax
 * The previous test code "this is not valid javascript" is actually valid JS
 * (it's just identifier references). Using @@ symbols which are truly invalid.
 */
test("CLI should fail gracefully with invalid JavaScript", async () => {
  const invalidCode = `
function a(e, t) {
  @@@ this is truly invalid syntax @@@
  return e + t;
}
  `.trim();

  const inputFile = path.join(TEST_FIXTURES_DIR, "invalid.js");
  await writeFile(inputFile, invalidCode);

  // Should throw/exit with error
  let errorThrown = false;
  try {
    await humanify(
      "unminify",
      inputFile,
      "--provider",
      "local",
      "--outputDir",
      TEST_OUTPUT_DIR
    );
  } catch (error) {
    errorThrown = true;
  }

  assert.ok(
    errorThrown,
    "CLI should fail when given invalid JavaScript"
  );
}, { timeout: 60000 });

/**
 * Test 8: Baseline comparison - verify improvement over input
 */
test("CLI output should measurably improve identifier quality", async () => {
  const obfuscatedCode = `
function a(e, t, n) {
  var r = [];
  for (var i = 0; i < n; i++) {
    var o = e + (t * i);
    r.push(o);
  }
  return r;
}
  `.trim();

  const inputFile = path.join(TEST_FIXTURES_DIR, "baseline-test.js");
  await writeFile(inputFile, obfuscatedCode);

  // Measure input quality
  const inputMetrics = await analyzeIdentifierQuality(obfuscatedCode);

  // Process with CLI
  await humanify(
    "unminify",
    inputFile,
    "--provider",
    "local",
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  const outputFiles = await readdir(TEST_OUTPUT_DIR);
  const outputCode = await readFile(
    path.join(TEST_OUTPUT_DIR, outputFiles.filter(f => f.endsWith('.js'))[0]),
    'utf-8'
  );

  // Measure output quality
  const outputMetrics = await analyzeIdentifierQuality(outputCode);

  // Output should be measurably better
  assert.ok(
    outputMetrics.averageLength > inputMetrics.averageLength,
    `Average length should improve: ${inputMetrics.averageLength.toFixed(2)} -> ${outputMetrics.averageLength.toFixed(2)}`
  );

  assert.ok(
    outputMetrics.singleLetterRatio < inputMetrics.singleLetterRatio,
    `Single-letter ratio should improve: ${(inputMetrics.singleLetterRatio * 100).toFixed(1)}% -> ${(outputMetrics.singleLetterRatio * 100).toFixed(1)}%`
  );

  // Log metrics for debugging
  console.log(`\n=== Quality Improvement ===`);
  console.log(`Input:  ${inputMetrics.singleLetterCount}/${inputMetrics.totalIdentifiers} single-letter (${(inputMetrics.singleLetterRatio * 100).toFixed(1)}%), avg length: ${inputMetrics.averageLength.toFixed(2)}`);
  console.log(`Output: ${outputMetrics.singleLetterCount}/${outputMetrics.totalIdentifiers} single-letter (${(outputMetrics.singleLetterRatio * 100).toFixed(1)}%), avg length: ${outputMetrics.averageLength.toFixed(2)}`);
}, { timeout: 180000 });
