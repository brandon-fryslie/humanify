/**
 * Diagnostic Test: LLM Semantic Naming Quality
 *
 * This test verifies that the LLM (OpenAI) actually provides semantic variable names.
 * It answers the critical question: "Does the LLM provide semantic names?"
 *
 * Run with: OPENAI_API_KEY=xxx npm run test:openai -- src/diagnostic-llm-quality.openaitest.ts
 *
 * @see beads issue brandon-fryslie_humanify-ui2
 */

import test from "node:test";
import assert from "node:assert";
import { readFile, writeFile, rm } from "node:fs/promises";
import * as babel from "@babel/core";
import { humanify } from "./test-utils.js";
import {
  analyzeIdentifiers,
  calculateImprovement,
  generateReport,
  isSingleLetter,
  isSemantic
} from "./utils/identifier-analyzer.js";

const TEST_OUTPUT_DIR = "test-output-diagnostic";

interface DiagnosticResult {
  testName: string;
  passed: boolean;
  input: {
    code: string;
    identifiers: string[];
  };
  output: {
    code: string;
    identifiers: string[];
  };
  analysis: {
    beforeSingleLetterPercent: number;
    afterSingleLetterPercent: number;
    semanticPercent: number;
    improvement: number;
  };
  verdict: string;
}

const diagnosticResults: DiagnosticResult[] = [];

/**
 * Extract all identifier names from JavaScript code using Babel
 */
async function extractIdentifiers(code: string): Promise<string[]> {
  const identifiers = new Set<string>();

  const result = await babel.parseAsync(code, {
    sourceType: "unambiguous",
    plugins: ["@babel/plugin-syntax-jsx"]
  });

  if (!result) {
    throw new Error("Failed to parse code");
  }

  // Walk the AST and collect all Identifier nodes
  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;

    if (node.type === "Identifier" && node.name) {
      identifiers.add(node.name);
    }

    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "range" || key === "start" || key === "end") continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(walk);
      } else if (child && typeof child === "object") {
        walk(child);
      }
    }
  };

  walk(result.program);

  return Array.from(identifiers);
}

// Clean up test output after each test
test.afterEach(async () => {
  await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
});

// Write diagnostic results at the end
test.after(async () => {
  if (diagnosticResults.length > 0) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: diagnosticResults.length,
        passed: diagnosticResults.filter(r => r.passed).length,
        failed: diagnosticResults.filter(r => !r.passed).length
      },
      results: diagnosticResults
    };

    await writeFile(
      "diagnostic-llm-responses.json",
      JSON.stringify(report, null, 2)
    );

    console.log("\n=== DIAGNOSTIC SUMMARY ===");
    console.log(`Total tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log("\nDetailed results written to: diagnostic-llm-responses.json");
  }
});

/**
 * Test 1: Simple semantic naming
 * Input: function a(b,c){const d=b+c;return d;}
 * Verify LLM suggests semantic names (e.g., "add", "num1", "num2", "sum")
 */
test("Test 1: Simple semantic naming verification", async () => {
  const input = `function a(b,c){const d=b+c;return d;}`;
  const inputFile = `${TEST_OUTPUT_DIR}/simple-input.js`;

  // Create test input
  await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  await writeFile(inputFile, input, { recursive: true } as any);

  // Run humanify with OpenAI
  const { stdout, stderr } = await humanify(
    "openai",
    inputFile,
    "--verbose",
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  console.log("\n=== Test 1: Simple Semantic Naming ===");
  console.log("Input:", input);
  console.log("Verbose output:", stdout.slice(0, 500));

  // Read output
  const outputPath = `${TEST_OUTPUT_DIR}/deobfuscated.js`;
  const output = await readFile(outputPath, "utf-8");
  console.log("Output:", output);

  // Extract identifiers
  const inputIds = await extractIdentifiers(input);
  const outputIds = await extractIdentifiers(output);

  console.log("Input identifiers:", inputIds);
  console.log("Output identifiers:", outputIds);

  // Analyze
  const beforeAnalysis = analyzeIdentifiers(inputIds);
  const afterAnalysis = analyzeIdentifiers(outputIds);

  console.log("\nBefore analysis:");
  console.log(`  Single-letter: ${beforeAnalysis.singleLetterPercent.toFixed(1)}%`);
  console.log(`  Semantic: ${beforeAnalysis.semanticPercent.toFixed(1)}%`);

  console.log("\nAfter analysis:");
  console.log(`  Single-letter: ${afterAnalysis.singleLetterPercent.toFixed(1)}%`);
  console.log(`  Semantic: ${afterAnalysis.semanticPercent.toFixed(1)}%`);

  // Record result
  const result: DiagnosticResult = {
    testName: "Simple semantic naming",
    passed: afterAnalysis.singleLetterPercent < 10,
    input: { code: input, identifiers: inputIds },
    output: { code: output, identifiers: outputIds },
    analysis: {
      beforeSingleLetterPercent: beforeAnalysis.singleLetterPercent,
      afterSingleLetterPercent: afterAnalysis.singleLetterPercent,
      semanticPercent: afterAnalysis.semanticPercent,
      improvement: beforeAnalysis.singleLetterPercent - afterAnalysis.singleLetterPercent
    },
    verdict: afterAnalysis.singleLetterPercent < 10
      ? "PASS: LLM provides semantic names"
      : "FAIL: Too many single-letter variables remain"
  };

  diagnosticResults.push(result);
  console.log("\nVerdict:", result.verdict);

  // PASS if: <10% single-letter variables remain
  assert(
    afterAnalysis.singleLetterPercent < 10,
    `Expected <10% single-letter variables, got ${afterAnalysis.singleLetterPercent.toFixed(1)}%`
  );
});

/**
 * Test 2: Variable quality improvement on fixtures/example.min.js
 * Measure: single-letter → semantic conversion rate
 */
test("Test 2: Variable quality improvement on example.min.js", async () => {
  const inputFile = "fixtures/example.min.js";

  // Check if fixture exists
  let inputCode: string;
  try {
    inputCode = await readFile(inputFile, "utf-8");
  } catch {
    console.log("Skipping test: fixtures/example.min.js not found");
    return;
  }

  console.log("\n=== Test 2: Quality Improvement ===");
  console.log(`Input file: ${inputFile}`);
  console.log(`Input size: ${inputCode.length} chars`);

  // Run humanify
  await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  await humanify(
    "openai",
    inputFile,
    "--verbose",
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  // Read output
  const outputPath = `${TEST_OUTPUT_DIR}/deobfuscated.js`;
  const outputCode = await readFile(outputPath, "utf-8");

  // Extract and analyze identifiers
  const inputIds = await extractIdentifiers(inputCode);
  const outputIds = await extractIdentifiers(outputCode);

  const beforeAnalysis = analyzeIdentifiers(inputIds);
  const afterAnalysis = analyzeIdentifiers(outputIds);
  const improvement = calculateImprovement(beforeAnalysis, afterAnalysis);

  console.log(generateReport(beforeAnalysis, afterAnalysis, true));

  // Record result
  const result: DiagnosticResult = {
    testName: "Quality improvement on example.min.js",
    passed: afterAnalysis.semanticPercent > 80,
    input: { code: inputCode.slice(0, 200) + "...", identifiers: inputIds.slice(0, 20) },
    output: { code: outputCode.slice(0, 200) + "...", identifiers: outputIds.slice(0, 20) },
    analysis: {
      beforeSingleLetterPercent: beforeAnalysis.singleLetterPercent,
      afterSingleLetterPercent: afterAnalysis.singleLetterPercent,
      semanticPercent: afterAnalysis.semanticPercent,
      improvement: improvement.overallImprovement
    },
    verdict: afterAnalysis.semanticPercent > 80
      ? "PASS: >80% semantic variables"
      : `FAIL: Only ${afterAnalysis.semanticPercent.toFixed(1)}% semantic variables`
  };

  diagnosticResults.push(result);
  console.log("\nVerdict:", result.verdict);

  // PASS if: >80% of variables are semantic
  assert(
    afterAnalysis.semanticPercent > 80,
    `Expected >80% semantic variables, got ${afterAnalysis.semanticPercent.toFixed(1)}%`
  );
});

/**
 * Test 3: Count single-letter variables in real output
 * FAIL if: >30% single-letter variables remain
 */
test("Test 3: Single-letter threshold check on real file", async () => {
  const inputFile = "fixtures/example.min.js";

  // Check if fixture exists
  let inputCode: string;
  try {
    inputCode = await readFile(inputFile, "utf-8");
  } catch {
    console.log("Skipping test: fixtures/example.min.js not found");
    return;
  }

  console.log("\n=== Test 3: Single-Letter Threshold ===");

  // Run humanify
  await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  await humanify(
    "openai",
    inputFile,
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  // Read and analyze output
  const outputPath = `${TEST_OUTPUT_DIR}/deobfuscated.js`;
  const outputCode = await readFile(outputPath, "utf-8");
  const outputIds = await extractIdentifiers(outputCode);
  const analysis = analyzeIdentifiers(outputIds);

  console.log(`Total identifiers: ${analysis.total}`);
  console.log(`Single-letter: ${analysis.singleLetterCount} (${analysis.singleLetterPercent.toFixed(1)}%)`);
  console.log(`Threshold: <30%`);

  // Record result
  const result: DiagnosticResult = {
    testName: "Single-letter threshold check",
    passed: analysis.singleLetterPercent < 30,
    input: { code: inputCode.slice(0, 100) + "...", identifiers: [] },
    output: { code: outputCode.slice(0, 100) + "...", identifiers: outputIds.slice(0, 30) },
    analysis: {
      beforeSingleLetterPercent: 0,
      afterSingleLetterPercent: analysis.singleLetterPercent,
      semanticPercent: analysis.semanticPercent,
      improvement: 0
    },
    verdict: analysis.singleLetterPercent < 30
      ? "PASS: <30% single-letter variables"
      : `FAIL: ${analysis.singleLetterPercent.toFixed(1)}% single-letter variables (threshold: 30%)`
  };

  diagnosticResults.push(result);
  console.log("\nVerdict:", result.verdict);

  // FAIL if: >30% single-letter variables remain
  assert(
    analysis.singleLetterPercent < 30,
    `Expected <30% single-letter variables, got ${analysis.singleLetterPercent.toFixed(1)}%`
  );
});

/**
 * Test 4: Definitive answer to "Does LLM provide semantic names?"
 * This is the ultimate diagnostic test
 */
test("Test 4: Definitive semantic naming answer", async () => {
  console.log("\n" + "=".repeat(60));
  console.log("   CRITICAL DIAGNOSTIC: Does the LLM provide semantic names?");
  console.log("=".repeat(60));

  // Test with a known simple case
  const testCode = `
    function a(b, c) {
      var d = b + c;
      var e = b * c;
      var f = d / e;
      return f;
    }
  `;

  const inputFile = `${TEST_OUTPUT_DIR}/diagnostic-input.js`;
  await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  const { mkdir } = await import("node:fs/promises");
  await mkdir(TEST_OUTPUT_DIR, { recursive: true });
  await writeFile(inputFile, testCode);

  console.log("\nInput code:");
  console.log(testCode);

  // Run with verbose to see LLM responses
  const { stdout } = await humanify(
    "openai",
    inputFile,
    "--verbose",
    "--outputDir",
    TEST_OUTPUT_DIR
  );

  // Read output
  const outputPath = `${TEST_OUTPUT_DIR}/deobfuscated.js`;
  const outputCode = await readFile(outputPath, "utf-8");

  console.log("\nOutput code:");
  console.log(outputCode);

  // Extract identifiers
  const inputIds = await extractIdentifiers(testCode);
  const outputIds = await extractIdentifiers(outputCode);

  console.log("\nIdentifier mapping:");
  console.log("  Input:  ", inputIds.filter(isSingleLetter).join(", "));
  console.log("  Output: ", outputIds.filter(isSemantic).join(", "));

  // Count how many single-letter variables got semantic names
  const inputSingleLetters = inputIds.filter(isSingleLetter);
  const outputSemantic = outputIds.filter(isSemantic);

  // Check if the output has MORE semantic names than input
  const improvement = outputSemantic.length > inputSingleLetters.length - 2;

  console.log("\n" + "-".repeat(60));
  if (improvement) {
    console.log("   ANSWER: YES - The LLM provides semantic variable names");
    console.log("   The tool is working as intended.");
  } else {
    console.log("   ANSWER: NO - The LLM is NOT providing semantic names");
    console.log("   CRITICAL BUG: The core functionality is broken!");
  }
  console.log("-".repeat(60) + "\n");

  // Record result
  const result: DiagnosticResult = {
    testName: "Definitive semantic naming answer",
    passed: improvement,
    input: { code: testCode, identifiers: inputIds },
    output: { code: outputCode, identifiers: outputIds },
    analysis: {
      beforeSingleLetterPercent: (inputSingleLetters.length / inputIds.length) * 100,
      afterSingleLetterPercent: (outputIds.filter(isSingleLetter).length / outputIds.length) * 100,
      semanticPercent: (outputSemantic.length / outputIds.length) * 100,
      improvement: outputSemantic.length - inputSingleLetters.length
    },
    verdict: improvement
      ? "YES - LLM provides semantic names"
      : "NO - LLM is NOT providing semantic names"
  };

  diagnosticResults.push(result);

  assert(
    improvement,
    "CRITICAL: LLM is not providing semantic variable names!"
  );
});
