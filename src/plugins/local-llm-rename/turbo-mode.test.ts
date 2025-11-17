import assert from "assert";
import test from "node:test";
import { visitAllIdentifiers } from "./visit-all-identifiers.js";

test("turbo mode: basic functionality works", async () => {
  const code = `const a = 1;`;

  const result = await visitAllIdentifiers(
    code,
    async (name) => name + "_renamed",
    200,
    undefined,
    { turbo: true }
  );

  // Extract code from VisitResult when turbo is enabled
  const resultCode = typeof result === 'string' ? result : result.code;
  assert.ok(resultCode.includes("a_renamed"), "Should rename with turbo mode");
});

test("turbo mode: produces valid output for complex code", async () => {
  const code = `
function outer() {
  const inner = 1;
  return inner;
}
  `.trim();

  const result = await visitAllIdentifiers(
    code,
    async (name) => name + "_renamed",
    200,
    undefined,
    { turbo: true }
  );

  // Extract code from VisitResult when turbo is enabled
  const resultCode = typeof result === 'string' ? result : result.code;

  // Should contain renamed identifiers
  assert.ok(resultCode.includes("outer_renamed"), "Should rename function");
  assert.ok(resultCode.includes("inner_renamed"), "Should rename variable");
});

test("turbo mode: respects maxConcurrent setting", async () => {
  const code = `
const a = 1;
const b = 2;
const c = 3;
  `.trim();

  let concurrent = 0;
  let maxConcurrent = 0;

  const visitor = async (name: string) => {
    concurrent++;
    maxConcurrent = Math.max(maxConcurrent, concurrent);
    await new Promise((resolve) => setTimeout(resolve, 5));
    concurrent--;
    return name + "_renamed";
  };

  await visitAllIdentifiers(code, visitor, 200, undefined, {
    turbo: true,
    maxConcurrent: 2
  });

  // Should respect concurrency limit
  assert.ok(maxConcurrent <= 2, `Max concurrent was ${maxConcurrent}, expected <= 2`);
});

test("sequential mode still works (regression test)", async () => {
  const code = `const a = 1;`;

  const result = await visitAllIdentifiers(
    code,
    async (name) => name + "_renamed",
    200
  );

  // Sequential mode always returns string
  assert.ok(result.includes("a_renamed"), "Sequential mode should still work");
});
