import test from "node:test";
import assert from "node:assert";
import { visitAllIdentifiers } from "../local-llm-rename/visit-all-identifiers.js";

/**
 * FUNCTIONAL TEST: Validates Bug #2 fix (Promise object sent to OpenAI in turbo mode)
 *
 * This test cannot be gamed because:
 * 1. Uses a real visitor function that inspects the surroundingCode parameter
 * 2. Validates the TYPE of surroundingCode (must be string, not Promise)
 * 3. Checks for serialized Promise artifacts that would be sent to API
 * 4. Tests the exact failure mode that occurred in production (turbo mode with OpenAI)
 *
 * BUG VALIDATION:
 * - BEFORE FIX: Test will FAIL (surroundingCode is Promise<string>, not string)
 * - AFTER FIX: Test will PASS (await properly resolves context to string)
 *
 * PRODUCTION SCENARIO:
 * When running: humanify openai input.js --turbo
 * The visitAllIdentifiersTurbo function extracts contexts without await,
 * causing job.context to be a Promise. When passed to OpenAI API, it serializes
 * to an object with "then" and "catch" properties, triggering a 400 error:
 * "Invalid type for 'messages[1].content': expected string, got object"
 */

test("turbo mode should pass string context (not Promise) to visitor function (Bug #2)", async () => {
  const code = `
    function example() {
      const first = 1;
      const second = 2;
      return first + second;
    }
  `.trim();

  let contextTypes: string[] = [];
  let contextValues: any[] = [];

  // Create a visitor that INSPECTS the surroundingCode parameter
  // This is what real providers (OpenAI/Gemini) do - they use the context
  const inspectingVisitor = async (
    name: string,
    surroundingCode: any
  ): Promise<string> => {
    // Record the actual type received
    contextTypes.push(typeof surroundingCode);

    // Store the actual value for inspection
    contextValues.push(surroundingCode);

    // CRITICAL ASSERTION: Context must be a string
    assert.strictEqual(
      typeof surroundingCode,
      "string",
      `Expected surroundingCode to be string, got ${typeof surroundingCode} for identifier '${name}'`
    );

    // Verify it's not a Promise object
    assert.ok(
      !surroundingCode?.then,
      `surroundingCode should not be a Promise (has .then method) for identifier '${name}'`
    );

    // Verify it's not a serialized Promise
    const asString = String(surroundingCode);
    assert.ok(
      !asString.includes("[object Promise]"),
      `surroundingCode contains serialized Promise for identifier '${name}'`
    );

    // Return a renamed identifier
    return `${name}_renamed`;
  };

  // EXECUTE: Run visitAllIdentifiers in TURBO mode
  const result = await visitAllIdentifiers(
    code,
    inspectingVisitor,
    1000, // contextWindowSize
    undefined, // onProgress
    {
      turbo: true, // CRITICAL: Enable turbo mode (where bug occurs)
      maxConcurrent: 2
    }
  );

  // Extract code from VisitResult when turbo is enabled
  const resultCode = typeof result === 'string' ? result : result.code;

  // VERIFY: All identifiers were processed
  assert.ok(resultCode.includes("example_renamed"), "Should rename function");
  assert.ok(resultCode.includes("first_renamed"), "Should rename first variable");
  assert.ok(resultCode.includes("second_renamed"), "Should rename second variable");

  // VERIFY: All contexts were strings (not Promises)
  assert.ok(
    contextTypes.every((type) => type === "string"),
    `All contexts should be strings, got: ${JSON.stringify(contextTypes)}`
  );

  // VERIFY: We actually received multiple contexts (batch processing worked)
  assert.ok(
    contextValues.length >= 3,
    `Expected at least 3 identifiers, got ${contextValues.length}`
  );

  // VERIFY: Each context contains actual code (not Promise representation)
  for (let i = 0; i < contextValues.length; i++) {
    const context = contextValues[i];
    assert.strictEqual(
      typeof context,
      "string",
      `Context ${i} should be string`
    );
    assert.ok(
      context.length > 0,
      `Context ${i} should not be empty`
    );
    // Should contain actual code keywords
    assert.ok(
      context.includes("function") ||
        context.includes("const") ||
        context.includes("return"),
      `Context ${i} should contain JavaScript code, got: ${context.substring(0, 50)}`
    );
  }
});

test("turbo mode should handle async context extraction correctly", async () => {
  const code = `
    function outer() {
      function inner() {
        const variable = 42;
        return variable;
      }
      return inner();
    }
  `.trim();

  // Track the order contexts are received
  const receivedContexts: Array<{ name: string; contextPreview: string }> = [];

  const trackingVisitor = async (
    name: string,
    surroundingCode: string
  ): Promise<string> => {
    // Verify it's a string BEFORE we do anything else
    if (typeof surroundingCode !== "string") {
      throw new Error(
        `BUG DETECTED: surroundingCode is ${typeof surroundingCode}, not string! ` +
          `This would cause OpenAI API to fail with 400 error.`
      );
    }

    // Record what we received
    receivedContexts.push({
      name,
      contextPreview: surroundingCode.substring(0, 50)
    });

    return `${name}_turbo`;
  };

  // EXECUTE: Run in turbo mode with concurrency
  const result = await visitAllIdentifiers(
    code,
    trackingVisitor,
    500,
    undefined,
    { turbo: true, maxConcurrent: 3 }
  );

  // Extract code from VisitResult when turbo is enabled
  const resultCode = typeof result === 'string' ? result : result.code;

  // VERIFY: All renames applied
  assert.ok(resultCode.includes("outer_turbo"), "Should rename outer function");
  assert.ok(resultCode.includes("inner_turbo"), "Should rename inner function");
  assert.ok(resultCode.includes("variable_turbo"), "Should rename variable");

  // VERIFY: We processed all identifiers
  assert.strictEqual(
    receivedContexts.length,
    3,
    `Expected 3 identifiers, got ${receivedContexts.length}`
  );

  // VERIFY: All contexts were valid strings
  for (const record of receivedContexts) {
    assert.ok(
      record.contextPreview.length > 0,
      `Context for '${record.name}' should not be empty`
    );
  }
});

/**
 * REGRESSION TEST: Compare sequential vs turbo mode behavior
 *
 * Both modes should receive the same type of context (string)
 * This ensures turbo mode doesn't introduce type inconsistencies
 */
test("turbo and sequential modes should both pass string contexts", async () => {
  const code = `const testVar = 123;`;

  let sequentialContextType: string | undefined;
  let turboContextType: string | undefined;

  // Test sequential mode
  await visitAllIdentifiers(
    code,
    async (_name: string, context: string) => {
      sequentialContextType = typeof context;
      return "renamed";
    },
    1000
  );

  // Test turbo mode
  await visitAllIdentifiers(
    code,
    async (_name: string, context: string) => {
      turboContextType = typeof context;
      return "renamed";
    },
    1000,
    undefined,
    { turbo: true }
  );

  // VERIFY: Both modes pass strings
  assert.strictEqual(sequentialContextType, "string", "Sequential mode should pass string context");
  assert.strictEqual(turboContextType, "string", "Turbo mode should pass string context");
});

/**
 * DOCUMENTATION TEST: Explain WHY Promise objects break OpenAI API
 *
 * This is not a functional test - it's documentation about the production bug
 */
test("documentation: Promise serialization would fail OpenAI API validation", async () => {
  // Simulate what happens when a Promise is serialized to JSON (as OpenAI SDK does)
  const promiseObject = Promise.resolve("some context");
  const serialized = JSON.stringify({ content: promiseObject });

  // Result: '{"content":{}}'
  // The Promise serializes to an empty object, losing all data
  assert.ok(
    serialized.includes("{}"),
    "Promise serialization loses data - this is why OpenAI rejects it"
  );

  // OpenAI expects: { role: "user", content: "string here" }
  // With unresolved Promise: { role: "user", content: {} }
  // Result: 400 error - "expected string, got object"
});

/**
 * PERFORMANCE TEST: Verify turbo mode actually runs in parallel
 *
 * This test ensures maxConcurrent is respected and parallel execution occurs
 */
test("turbo mode should process contexts in parallel (performance characteristic)", async () => {
  const code = `
    const a = 1;
    const b = 2;
    const c = 3;
    const d = 4;
    const e = 5;
  `.trim();

  let concurrentCount = 0;
  let maxObservedConcurrent = 0;

  const slowVisitor = async (name: string, _context: string) => {
    concurrentCount++;
    maxObservedConcurrent = Math.max(maxObservedConcurrent, concurrentCount);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 10));

    concurrentCount--;
    return `${name}_parallel`;
  };

  await visitAllIdentifiers(code, slowVisitor, 1000, undefined, {
    turbo: true,
    maxConcurrent: 3
  });

  // VERIFY: We observed parallel execution (more than 1 concurrent call)
  assert.ok(
    maxObservedConcurrent > 1,
    `Expected parallel execution (maxConcurrent > 1), but maxObservedConcurrent was ${maxObservedConcurrent}`
  );

  // VERIFY: Concurrency limit was respected
  assert.ok(
    maxObservedConcurrent <= 3,
    `Expected maxConcurrent <= 3, but observed ${maxObservedConcurrent}`
  );
});
