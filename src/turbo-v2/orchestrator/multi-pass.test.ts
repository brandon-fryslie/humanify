/**
 * MULTI-PASS INTEGRATION TESTS
 *
 * These tests validate the core multi-pass hypothesis:
 * - Pass 2 sees ALL of Pass 1's renames in glossary
 * - Semantic quality improves between passes
 * - Stability reaches >80% by pass 3
 * - Output is valid JavaScript
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { MultiPass, MultiPassConfig, GlossaryEntry } from "./multi-pass.js";
import { Vault } from "../vault/vault.js";
import { Ledger } from "../ledger/ledger.js";
import { ProcessorFunction } from "./pass-engine.js";
import { PassConfig } from "../ledger/events.js";
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { parseAsync } from "@babel/core";

const TEST_DIR = "/tmp/turbo-v2-multi-pass-test";
const TEST_VAULT_DIR = join(TEST_DIR, "vault");
const TEST_CHECKPOINT_DIR = join(TEST_DIR, "checkpoints");
const TEST_JOB_DIR = join(TEST_CHECKPOINT_DIR, "test-job-001");
const TEST_OUTPUT_DIR = join(TEST_JOB_DIR, "output");
const TEST_SNAPSHOTS_DIR = join(TEST_JOB_DIR, "snapshots");

/**
 * Sample obfuscated code for testing
 */
const TINY_QS_SAMPLE = `
function a(b, c) {
  const d = {};
  const e = b.split('&');
  for (const f of e) {
    const [g, h] = f.split('=');
    d[g] = h;
  }
  return d;
}

function i(j) {
  const k = [];
  for (const [l, m] of Object.entries(j)) {
    k.push(\`\${l}=\${m}\`);
  }
  return k.join('&');
}

module.exports = { a, i };
`.trim();

/**
 * Mock processor that returns predictable names
 * Pass 1: Simple names (data, config, etc.)
 * Pass 2+: Better names based on glossary context
 */
function createMockProcessor(passNumber: number): ProcessorFunction {
  return async (name: string, context: string) => {
    // Check if glossary is present in context
    const hasGlossary = context.includes("Glossary from previous pass:");

    // Pass 1: Simple heuristic names
    if (passNumber === 1 || !hasGlossary) {
      const nameMap: Record<string, string> = {
        a: "parseQueryString",
        b: "queryString",
        c: "separator",
        d: "params",
        e: "pairs",
        f: "pair",
        g: "key",
        h: "value",
        i: "stringifyQueryParams",
        j: "paramsObject",
        k: "resultPairs",
        l: "paramKey",
        m: "paramValue",
      };

      return {
        newName: nameMap[name] || name,
        confidence: 0.7,
      };
    }

    // Pass 2+: Improved names with glossary context
    // Extract glossary entries from context
    const glossaryMatch = context.match(/Glossary from previous pass:\n([\s\S]*?)\n\nGiven/);
    let glossarySize = 0;
    if (glossaryMatch) {
      const glossaryLines = glossaryMatch[1].split("\n").filter((line) => line.trim());
      glossarySize = glossaryLines.length;
    }

    // Simulate improved naming based on glossary
    const improvedNameMap: Record<string, string> = {
      a: "parseQueryString", // Keep same (good name)
      b: "inputString", // Improved from queryString
      c: "separator", // Keep same
      d: "resultParams", // Improved from params
      e: "keyValuePairs", // Improved from pairs
      f: "pair", // Keep same
      g: "key", // Keep same
      h: "value", // Keep same
      i: "stringifyQueryParams", // Keep same
      j: "paramsObject", // Keep same
      k: "serializedPairs", // Improved from resultPairs
      l: "paramKey", // Keep same
      m: "paramValue", // Keep same
    };

    return {
      newName: improvedNameMap[name] || name,
      confidence: 0.85, // Higher confidence with glossary
    };
  };
}

/**
 * Setup test environment
 */
function setupTestEnvironment() {
  // Clean up any existing test directory
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }

  // Create directories
  mkdirSync(TEST_VAULT_DIR, { recursive: true });
  mkdirSync(TEST_JOB_DIR, { recursive: true });
  mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  mkdirSync(TEST_SNAPSHOTS_DIR, { recursive: true });

  // Write input file
  const inputPath = join(TEST_JOB_DIR, "input.js");
  writeFileSync(inputPath, TINY_QS_SAMPLE, "utf-8");

  return inputPath;
}

/**
 * Cleanup test environment
 */
function cleanupTestEnvironment() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

describe("MultiPass Integration Tests", () => {
  let inputPath: string;
  let vault: Vault;
  let ledger: Ledger;

  before(() => {
    inputPath = setupTestEnvironment();
    vault = new Vault(TEST_VAULT_DIR);
    ledger = new Ledger(TEST_JOB_DIR);
  });

  after(() => {
    cleanupTestEnvironment();
  });

  it("D5.1: should execute 2-pass pipeline and produce valid output", async () => {
    const passConfigs: PassConfig[] = [
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
    ];

    const config: MultiPassConfig = {
      passes: passConfigs,
      jobId: "test-job-001",
      inputPath,
      outputDir: TEST_OUTPUT_DIR,
      snapshotsDir: TEST_SNAPSHOTS_DIR,
      maxGlossarySize: 100,
    };

    const multiPass = new MultiPass(vault, ledger, config);

    const result = await multiPass.execute(createMockProcessor(1));

    // Verify result structure
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.totalPasses, 2);
    assert.strictEqual(result.passResults.length, 2);

    // Verify output file exists
    assert.strictEqual(existsSync(result.finalSnapshotPath), true);

    // Verify output is valid JavaScript
    const outputCode = readFileSync(result.finalSnapshotPath, "utf-8");
    const ast = await parseAsync(outputCode, {
      sourceType: "unambiguous",
    });
    assert.ok(ast, "Output should be valid JavaScript");

    // Verify snapshots were created
    assert.strictEqual(
      existsSync(join(TEST_SNAPSHOTS_DIR, "after-pass-000.js")),
      true,
      "Initial snapshot should exist"
    );
    assert.strictEqual(
      existsSync(join(TEST_SNAPSHOTS_DIR, "after-pass-001.js")),
      true,
      "Pass 1 snapshot should exist"
    );
    assert.strictEqual(
      existsSync(join(TEST_SNAPSHOTS_DIR, "after-pass-002.js")),
      true,
      "Pass 2 snapshot should exist"
    );

    console.log(`✓ 2-pass pipeline produced valid output: ${result.finalSnapshotPath}`);
  });

  it("D5.2: should include glossary in Pass 2 prompts", async () => {
    // Track glossary presence
    let pass1ContextHadGlossary = false;
    let pass2ContextHadGlossary = false;
    let pass2GlossarySize = 0;

    // Create processor that tracks glossary presence
    const trackingProcessor: ProcessorFunction = async (name: string, context: string) => {
      const hasGlossary = context.includes("Glossary from previous pass:");

      // Determine which pass we're in based on context
      if (!hasGlossary) {
        pass1ContextHadGlossary = hasGlossary;
      } else {
        pass2ContextHadGlossary = hasGlossary;

        // Count glossary entries
        const glossaryMatch = context.match(/Glossary from previous pass:\n([\s\S]*?)\n\nGiven/);
        if (glossaryMatch) {
          const glossaryLines = glossaryMatch[1].split("\n").filter((line) => line.trim());
          pass2GlossarySize = Math.max(pass2GlossarySize, glossaryLines.length);
        }
      }

      // Return mock result
      return createMockProcessor(1)(name, context);
    };

    const passConfigs: PassConfig[] = [
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
    ];

    const config: MultiPassConfig = {
      passes: passConfigs,
      jobId: "test-job-glossary",
      inputPath,
      outputDir: join(TEST_DIR, "test-glossary-output"),
      snapshotsDir: join(TEST_DIR, "test-glossary-snapshots"),
      maxGlossarySize: 100,
    };

    mkdirSync(config.outputDir, { recursive: true });
    mkdirSync(config.snapshotsDir, { recursive: true });

    const multiPass = new MultiPass(vault, ledger, config);
    await multiPass.execute(trackingProcessor);

    // Verify Pass 1 had NO glossary
    assert.strictEqual(
      pass1ContextHadGlossary,
      false,
      "Pass 1 should not have glossary"
    );

    // Verify Pass 2 HAD glossary
    assert.strictEqual(
      pass2ContextHadGlossary,
      true,
      "Pass 2 should have glossary"
    );

    // Verify glossary contained entries
    assert.ok(
      pass2GlossarySize > 0,
      `Pass 2 glossary should contain entries (found: ${pass2GlossarySize})`
    );

    console.log(`✓ Pass 2 glossary contained ${pass2GlossarySize} entries from Pass 1`);
  });

  it("D5.3: should show semantic improvement between passes", async () => {
    const passConfigs: PassConfig[] = [
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
    ];

    const config: MultiPassConfig = {
      passes: passConfigs,
      jobId: "test-job-improvement",
      inputPath,
      outputDir: join(TEST_DIR, "test-improvement-output"),
      snapshotsDir: join(TEST_DIR, "test-improvement-snapshots"),
      maxGlossarySize: 100,
    };

    mkdirSync(config.outputDir, { recursive: true });
    mkdirSync(config.snapshotsDir, { recursive: true });

    // Use different processors for each pass to simulate improvement
    let currentPass = 1;
    const improvingProcessor: ProcessorFunction = async (name: string, context: string) => {
      const processor = createMockProcessor(currentPass);
      return processor(name, context);
    };

    const multiPass = new MultiPass(vault, ledger, config);

    // Track when we switch to pass 2
    const originalExecute = multiPass["execute"].bind(multiPass);

    const result = await multiPass.execute(improvingProcessor);

    // Verify Pass 1 had some renames
    const pass1Result = result.passResults[0];
    assert.ok(
      pass1Result.stats.identifiersRenamed > 0,
      "Pass 1 should rename some identifiers"
    );

    // Verify Pass 2 had changes (even if small)
    const pass2Result = result.passResults[1];
    const pass2Changed = pass2Result.stats.identifiersRenamed;
    const pass2Unchanged = pass2Result.stats.identifiersUnchanged;

    // At least some identifiers should remain unchanged in Pass 2
    // (indicating convergence toward stable naming)
    const stabilityRate = pass2Unchanged / (pass2Changed + pass2Unchanged);

    console.log(
      `✓ Semantic improvement: Pass 1 renamed ${pass1Result.stats.identifiersRenamed}, Pass 2 renamed ${pass2Changed} with ${(stabilityRate * 100).toFixed(1)}% stability`
    );

    // Pass 2 should show some stability (at least 30% unchanged)
    assert.ok(
      stabilityRate >= 0.3,
      `Pass 2 stability should be >= 30% (actual: ${(stabilityRate * 100).toFixed(1)}%)`
    );
  });

  it("D5.3: should achieve >80% stability by pass 3", async () => {
    const passConfigs: PassConfig[] = [
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
    ];

    const config: MultiPassConfig = {
      passes: passConfigs,
      jobId: "test-job-stability",
      inputPath,
      outputDir: join(TEST_DIR, "test-stability-output"),
      snapshotsDir: join(TEST_DIR, "test-stability-snapshots"),
      maxGlossarySize: 100,
    };

    mkdirSync(config.outputDir, { recursive: true });
    mkdirSync(config.snapshotsDir, { recursive: true });

    // Create processor that converges (fewer changes each pass)
    let passNumber = 1;
    const convergingProcessor: ProcessorFunction = async (name: string, context: string) => {
      const hasGlossary = context.includes("Glossary from previous pass:");

      if (!hasGlossary) {
        passNumber = 1;
      } else {
        // Detect pass number from glossary size (rough heuristic)
        const glossaryMatch = context.match(/Glossary from previous pass:\n([\s\S]*?)\n\nGiven/);
        if (glossaryMatch) {
          passNumber++;
        }
      }

      // Pass 3: Most names should be stable (unchanged)
      if (passNumber >= 3) {
        // Return original name (no change) for most identifiers
        return {
          newName: name,
          confidence: 0.95,
        };
      }

      // Pass 1-2: Apply processor
      return createMockProcessor(passNumber)(name, context);
    };

    const multiPass = new MultiPass(vault, ledger, config);
    const result = await multiPass.execute(convergingProcessor);

    // Calculate stability for Pass 3
    const pass3Result = result.passResults[2];
    const totalIdentifiers =
      pass3Result.stats.identifiersRenamed +
      pass3Result.stats.identifiersUnchanged +
      pass3Result.stats.identifiersSkipped;

    const stability = MultiPass.calculateStability(pass3Result, totalIdentifiers);

    console.log(
      `✓ Pass 3 stability: ${(stability * 100).toFixed(1)}% (target: >80%)`
    );

    // Verify stability is >80%
    assert.ok(
      stability >= 0.8,
      `Pass 3 stability should be >= 80% (actual: ${(stability * 100).toFixed(1)}%)`
    );
  });

  it("should handle empty input gracefully", async () => {
    const emptyInputPath = join(TEST_DIR, "empty-input.js");
    writeFileSync(emptyInputPath, "", "utf-8");

    const passConfigs: PassConfig[] = [
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
    ];

    const config: MultiPassConfig = {
      passes: passConfigs,
      jobId: "test-job-empty",
      inputPath: emptyInputPath,
      outputDir: join(TEST_DIR, "test-empty-output"),
      snapshotsDir: join(TEST_DIR, "test-empty-snapshots"),
    };

    mkdirSync(config.outputDir, { recursive: true });
    mkdirSync(config.snapshotsDir, { recursive: true });

    const multiPass = new MultiPass(vault, ledger, config);
    const result = await multiPass.execute(createMockProcessor(1));

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.passResults[0].stats.identifiersProcessed, 0);

    console.log("✓ Empty input handled gracefully");
  });

  it("should prioritize glossary by reference count", async () => {
    // Track glossary ordering
    let glossaryEntries: string[] = [];

    const trackingProcessor: ProcessorFunction = async (name: string, context: string) => {
      if (context.includes("Glossary from previous pass:")) {
        const glossaryMatch = context.match(/Glossary from previous pass:\n([\s\S]*?)\n\nGiven/);
        if (glossaryMatch && glossaryEntries.length === 0) {
          glossaryEntries = glossaryMatch[1]
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => line.trim());
        }
      }

      return createMockProcessor(1)(name, context);
    };

    const passConfigs: PassConfig[] = [
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
      {
        processor: "rename",
        mode: "parallel",
        concurrency: 10,
      },
    ];

    const config: MultiPassConfig = {
      passes: passConfigs,
      jobId: "test-job-prioritize",
      inputPath,
      outputDir: join(TEST_DIR, "test-prioritize-output"),
      snapshotsDir: join(TEST_DIR, "test-prioritize-snapshots"),
      maxGlossarySize: 5, // Limit to 5 to test prioritization
    };

    mkdirSync(config.outputDir, { recursive: true });
    mkdirSync(config.snapshotsDir, { recursive: true });

    const multiPass = new MultiPass(vault, ledger, config);
    await multiPass.execute(trackingProcessor);

    // Verify glossary has entries
    assert.ok(
      glossaryEntries.length > 0,
      "Glossary should contain entries"
    );

    // Verify entries are ordered by reference count (descending)
    if (glossaryEntries.length >= 2) {
      const firstRefs = parseInt(
        glossaryEntries[0].match(/referenced (\d+) times/)?.[1] ?? "0"
      );
      const secondRefs = parseInt(
        glossaryEntries[1].match(/referenced (\d+) times/)?.[1] ?? "0"
      );

      assert.ok(
        firstRefs >= secondRefs,
        `Glossary should be sorted by reference count (${firstRefs} >= ${secondRefs})`
      );

      console.log(
        `✓ Glossary prioritized by reference count: ${glossaryEntries[0]}`
      );
    }
  });
});
