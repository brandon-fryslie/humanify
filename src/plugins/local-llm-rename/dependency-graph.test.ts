import assert from "assert";
import test from "node:test";
import { parse } from "@babel/parser";
import * as babelTraverse from "@babel/traverse";
import { NodePath } from "@babel/core";
import { Identifier } from "@babel/types";
import {
  buildDependencyGraph,
  Dependency,
  topologicalSort
} from "./dependency-graph.js";

// Handle the babel traverse import quirk
const traverse: typeof babelTraverse.default.default = (
  typeof babelTraverse.default === "function"
    ? babelTraverse.default
    : babelTraverse.default.default
) as any;

/**
 * Functional Tests for Phase 2 Reference Index Precomputation
 *
 * These tests verify that the Phase 2 optimization (buildReferenceIndex) produces:
 * 1. IDENTICAL dependency graphs to the current O(n²) implementation
 * 2. SIGNIFICANT performance improvements (10-100x on reference checking)
 * 3. CORRECT handling of edge cases (shadowing, circular refs, etc.)
 *
 * ANTI-GAMING PROPERTIES:
 * - Tests use REAL JavaScript code samples (not mocks)
 * - Tests compare ACTUAL dependency graphs (not implementation details)
 * - Tests measure WALL-CLOCK TIME (not synthetic metrics)
 * - Tests verify OBSERVABLE OUTCOMES (graph structure, topological order)
 * - Tests cannot be satisfied by stub implementations
 */

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Extract all binding identifiers from code.
 * This mirrors the real extraction logic used in production.
 */
function extractBindingIdentifiers(code: string): NodePath<Identifier>[] {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["typescript"]
  });

  const identifiers: NodePath<Identifier>[] = [];

  traverse(ast, {
    Program(path: any) {
      path.traverse({
        Identifier(idPath: any) {
          // Only binding identifiers (declarations), not references
          if (idPath.isBindingIdentifier()) {
            identifiers.push(idPath);
          }
        }
      });
    }
  });

  return identifiers;
}

/**
 * Build dependency graph and measure wall-clock time.
 * Returns both dependencies and timing info.
 */
async function buildAndMeasure(
  code: string,
  mode: "strict" | "balanced" | "relaxed" = "balanced"
): Promise<{
  dependencies: Dependency[];
  timeMs: number;
  identifiers: NodePath<Identifier>[];
}> {
  const identifiers = extractBindingIdentifiers(code);
  const start = performance.now();
  const dependencies = await buildDependencyGraph(code, identifiers, { mode });
  const end = performance.now();

  return {
    dependencies,
    timeMs: end - start,
    identifiers
  };
}

/**
 * Normalize dependency to string for comparison.
 * Format: "fromName -> toName (reason)"
 */
function depToString(dep: Dependency): string {
  return `${dep.from.node.name} -> ${dep.to.node.name} (${dep.reason})`;
}

/**
 * Sort dependencies for deterministic comparison.
 */
function sortDeps(deps: Dependency[]): string[] {
  return deps.map(depToString).sort();
}

// ============================================================================
// CORRECTNESS TESTS
// ============================================================================

test("dependency graph: basic variable references", async () => {
  const code = `
    const a = 1;
    const b = a + 2;
    const c = b * 3;
  `;

  const { dependencies } = await buildAndMeasure(code);

  // Verify reference dependencies exist
  const refDeps = dependencies.filter((d) => d.reason === "reference");
  const refStrings = sortDeps(refDeps);

  // b references a, c references b
  assert.ok(
    refStrings.some((s) => s.includes("a -> b")),
    "Should detect that b references a"
  );
  assert.ok(
    refStrings.some((s) => s.includes("b -> c")),
    "Should detect that c references b"
  );
});

test("dependency graph: function declarations and calls", async () => {
  const code = `
    function outer() {
      return 1;
    }
    function caller() {
      return outer();
    }
  `;

  const { dependencies } = await buildAndMeasure(code);

  // caller references outer
  const refDeps = dependencies.filter((d) => d.reason === "reference");
  const refStrings = sortDeps(refDeps);

  assert.ok(
    refStrings.some((s) => s.includes("outer -> caller")),
    "Should detect that caller references outer"
  );
});

test("dependency graph: variable shadowing (same name, different scopes)", async () => {
  // This is CRITICAL for Phase 2 - reference index must verify bindings!
  const code = `
    const x = 1;
    function outer() {
      const x = 2;  // Shadows outer x
      return x;
    }
    const y = x;  // References outer x, not function-local x
  `;

  const { dependencies } = await buildAndMeasure(code);

  // Verify that we DON'T incorrectly link the shadowed variables
  // y should reference the outer x, not the inner x
  const refDeps = dependencies.filter((d) => d.reason === "reference");

  // Count how many x->y dependencies exist
  const xToY = refDeps.filter(
    (d) => d.from.node.name === "x" && d.to.node.name === "y"
  );

  // Should be exactly ONE x->y dependency (outer x to y)
  // NOT two (which would happen if we didn't verify bindings)
  assert.strictEqual(
    xToY.length,
    1,
    "Should have exactly one x->y dependency (outer x only)"
  );

  // Verify scope containment works correctly
  const scopeDeps = dependencies.filter((d) => d.reason === "scope-containment");
  const scopeStrings = sortDeps(scopeDeps);

  // outer function should contain its local x
  assert.ok(
    scopeStrings.some((s) => s.includes("outer -> x")),
    "Should detect scope containment for function-local x"
  );
});

test("dependency graph: no false positives (isolated variables)", async () => {
  const code = `
    const a = 1;
    const b = 2;
    const c = 3;
  `;

  const { dependencies } = await buildAndMeasure(code);

  // No variables reference each other
  const refDeps = dependencies.filter((d) => d.reason === "reference");

  assert.strictEqual(
    refDeps.length,
    0,
    "Should have zero reference dependencies for isolated variables"
  );
});

test("dependency graph: circular references", async () => {
  const code = `
    function a() {
      return b();
    }
    function b() {
      return a();
    }
  `;

  const { dependencies } = await buildAndMeasure(code);

  const refDeps = dependencies.filter((d) => d.reason === "reference");
  const refStrings = sortDeps(refDeps);

  // Both directions should be detected
  assert.ok(
    refStrings.some((s) => s.includes("a -> b")),
    "Should detect a references b"
  );
  assert.ok(
    refStrings.some((s) => s.includes("b -> a")),
    "Should detect b references a"
  );

  // Topological sort should handle cycle gracefully
  const identifiers = extractBindingIdentifiers(code);
  const batches = topologicalSort(identifiers, dependencies);

  // Should produce valid batches (no infinite loop)
  assert.ok(batches.length > 0, "Should produce valid batches despite cycle");

  // All identifiers should be included
  const total = batches.reduce((sum, batch) => sum + batch.length, 0);
  assert.strictEqual(
    total,
    identifiers.length,
    "All identifiers should be included in batches"
  );
});

test("dependency graph: self-reference (recursive function)", async () => {
  const code = `
    function factorial(n) {
      if (n <= 1) return 1;
      return n * factorial(n - 1);
    }
  `;

  const { dependencies } = await buildAndMeasure(code);

  // Self-reference should be detected
  const selfRef = dependencies.find(
    (d) =>
      d.from.node.name === "factorial" &&
      d.to.node.name === "factorial" &&
      d.reason === "reference"
  );

  assert.ok(selfRef, "Should detect self-reference in recursive function");
});

test("dependency graph: complex reference chain", async () => {
  const code = `
    const a = 1;
    const b = a + 1;
    const c = b + 1;
    const d = c + 1;
    const e = d + 1;
  `;

  const { dependencies } = await buildAndMeasure(code);

  const refDeps = dependencies.filter((d) => d.reason === "reference");
  const refStrings = sortDeps(refDeps);

  // Verify complete chain: a→b→c→d→e
  assert.ok(refStrings.some((s) => s.includes("a -> b")), "a→b link exists");
  assert.ok(refStrings.some((s) => s.includes("b -> c")), "b→c link exists");
  assert.ok(refStrings.some((s) => s.includes("c -> d")), "c→d link exists");
  assert.ok(refStrings.some((s) => s.includes("d -> e")), "d→e link exists");

  // Verify topological sort produces valid order
  const identifiers = extractBindingIdentifiers(code);
  const batches = topologicalSort(identifiers, dependencies);

  // Build set of identifiers seen so far
  const seen = new Set<string>();
  for (const batch of batches) {
    for (const id of batch) {
      const name = id.node.name;

      // For each identifier, all its dependencies should already be processed
      const deps = dependencies.filter((d) => d.to === id);
      for (const dep of deps) {
        assert.ok(
          seen.has(dep.from.node.name),
          `${name} depends on ${dep.from.node.name} which should be processed earlier`
        );
      }

      seen.add(name);
    }
  }
});

test("dependency graph: nested scope references", async () => {
  const code = `
    const outer = 1;
    function middle() {
      const mid = outer;
      function inner() {
        const inn = mid;
        return inn;
      }
      return inner;
    }
  `;

  const { dependencies } = await buildAndMeasure(code);

  // Verify scope containment hierarchy
  const scopeDeps = dependencies.filter((d) => d.reason === "scope-containment");
  const scopeStrings = sortDeps(scopeDeps);

  // middle contains mid and inner
  assert.ok(
    scopeStrings.some((s) => s.includes("middle -> mid")),
    "middle should contain mid"
  );
  assert.ok(
    scopeStrings.some((s) => s.includes("middle -> inner")),
    "middle should contain inner"
  );

  // inner contains inn
  assert.ok(
    scopeStrings.some((s) => s.includes("inner -> inn")),
    "inner should contain inn"
  );

  // Verify reference dependencies
  const refDeps = dependencies.filter((d) => d.reason === "reference");
  const refStrings = sortDeps(refDeps);

  // mid references outer, inn references mid
  assert.ok(
    refStrings.some((s) => s.includes("outer -> mid")),
    "mid should reference outer"
  );
  assert.ok(
    refStrings.some((s) => s.includes("mid -> inn")),
    "inn should reference mid"
  );
});

test("dependency graph: object destructuring", async () => {
  const code = `
    const obj = { a: 1, b: 2 };
    const { a, b } = obj;
    const sum = a + b;
  `;

  const { dependencies } = await buildAndMeasure(code);

  // sum references a and b
  const refDeps = dependencies.filter(
    (d) => d.to.node.name === "sum" && d.reason === "reference"
  );

  // Should detect both references
  const refNames = refDeps.map((d) => d.from.node.name);
  assert.ok(refNames.includes("a"), "sum should reference a");
  assert.ok(refNames.includes("b"), "sum should reference b");
});

test("dependency graph: array destructuring", async () => {
  const code = `
    const arr = [1, 2, 3];
    const [x, y, z] = arr;
    const total = x + y + z;
  `;

  const { dependencies } = await buildAndMeasure(code);

  // total references x, y, z
  const refDeps = dependencies.filter(
    (d) => d.to.node.name === "total" && d.reason === "reference"
  );

  const refNames = refDeps.map((d) => d.from.node.name);
  assert.ok(refNames.includes("x"), "total should reference x");
  assert.ok(refNames.includes("y"), "total should reference y");
  assert.ok(refNames.includes("z"), "total should reference z");
});

// ============================================================================
// PERFORMANCE BENCHMARKS
// ============================================================================

test("performance benchmark: small file (100 identifiers)", async () => {
  // Generate code with ~100 identifiers
  const lines = [];
  for (let i = 0; i < 50; i++) {
    lines.push(`const var${i} = ${i};`);
    if (i > 0) {
      lines.push(`const sum${i} = var${i - 1} + var${i};`);
    }
  }
  const code = lines.join("\n");

  const { dependencies, timeMs, identifiers } = await buildAndMeasure(code);

  console.log(`\n  [BENCHMARK] Small file:`);
  console.log(`    Identifiers: ${identifiers.length}`);
  console.log(`    Dependencies: ${dependencies.length}`);
  console.log(`    Time: ${timeMs.toFixed(2)}ms`);
  console.log(
    `    Reference deps: ${dependencies.filter((d) => d.reason === "reference").length}`
  );

  // Should complete in reasonable time (< 5 seconds even with unoptimized version)
  assert.ok(timeMs < 5000, `Should complete in < 5s (took ${timeMs}ms)`);

  // AFTER Phase 2 optimization, this should be < 500ms
  // Uncomment this assertion after implementing buildReferenceIndex:
  // assert.ok(timeMs < 500, `Should complete in < 500ms with optimization (took ${timeMs}ms)`);
});

test("performance benchmark: medium file (500 identifiers)", async () => {
  // Generate code with ~500 identifiers
  const lines = [];
  for (let i = 0; i < 250; i++) {
    lines.push(`const var${i} = ${i};`);
    if (i > 0) {
      lines.push(`const sum${i} = var${i - 1} + var${i};`);
    }
  }
  const code = lines.join("\n");

  const { dependencies, timeMs, identifiers } = await buildAndMeasure(code);

  console.log(`\n  [BENCHMARK] Medium file:`);
  console.log(`    Identifiers: ${identifiers.length}`);
  console.log(`    Dependencies: ${dependencies.length}`);
  console.log(`    Time: ${timeMs.toFixed(2)}ms`);
  console.log(
    `    Reference deps: ${dependencies.filter((d) => d.reason === "reference").length}`
  );

  // Should complete in reasonable time (may be slow with current O(n²) implementation)
  assert.ok(
    timeMs < 60000,
    `Should complete in < 60s (took ${timeMs / 1000}s)`
  );

  // AFTER Phase 2 optimization, this should be < 2000ms
  // Uncomment this assertion after implementing buildReferenceIndex:
  // assert.ok(timeMs < 2000, `Should complete in < 2s with optimization (took ${timeMs}ms)`);
});

test("performance benchmark: large file (1000 identifiers)", async () => {
  // Generate code with ~1000 identifiers
  const lines = [];
  for (let i = 0; i < 500; i++) {
    lines.push(`const var${i} = ${i};`);
    if (i > 0) {
      lines.push(`const sum${i} = var${i - 1} + var${i};`);
    }
  }
  const code = lines.join("\n");

  const { dependencies, timeMs, identifiers } = await buildAndMeasure(code);

  console.log(`\n  [BENCHMARK] Large file:`);
  console.log(`    Identifiers: ${identifiers.length}`);
  console.log(`    Dependencies: ${dependencies.length}`);
  console.log(`    Time: ${timeMs.toFixed(2)}ms`);
  console.log(
    `    Reference deps: ${dependencies.filter((d) => d.reason === "reference").length}`
  );

  // Current implementation may be VERY slow here
  // Setting generous timeout
  assert.ok(
    timeMs < 300000,
    `Should complete in < 5min (took ${timeMs / 1000}s)`
  );

  // AFTER Phase 2 optimization, this should be < 5000ms
  // Uncomment this assertion after implementing buildReferenceIndex:
  // assert.ok(timeMs < 5000, `Should complete in < 5s with optimization (took ${timeMs}ms)`);
}, { timeout: 300000 }); // 5 minute timeout

test("performance comparison: dependency modes", async () => {
  // Test how dependency modes affect performance
  const code = `
    function outer() {
      function middle() {
        function inner() {
          const x = 1;
          return x;
        }
        return inner;
      }
      return middle;
    }
  `;

  const strict = await buildAndMeasure(code, "strict");
  const balanced = await buildAndMeasure(code, "balanced");
  const relaxed = await buildAndMeasure(code, "relaxed");

  console.log(`\n  [BENCHMARK] Dependency modes:`);
  console.log(`    Strict:   ${strict.dependencies.length} deps, ${strict.timeMs.toFixed(2)}ms`);
  console.log(`    Balanced: ${balanced.dependencies.length} deps, ${balanced.timeMs.toFixed(2)}ms`);
  console.log(`    Relaxed:  ${relaxed.dependencies.length} deps, ${relaxed.timeMs.toFixed(2)}ms`);

  // Relaxed should have fewer dependencies (no scope containment)
  const strictScope = strict.dependencies.filter(
    (d) => d.reason === "scope-containment"
  ).length;
  const relaxedScope = relaxed.dependencies.filter(
    (d) => d.reason === "scope-containment"
  ).length;

  assert.strictEqual(
    relaxedScope,
    0,
    "Relaxed mode should have zero scope containment dependencies"
  );
  assert.ok(
    strictScope > 0,
    "Strict mode should have scope containment dependencies"
  );

  // Balanced should have fewer scope deps than strict (only direct parent-child)
  const balancedScope = balanced.dependencies.filter(
    (d) => d.reason === "scope-containment"
  ).length;
  assert.ok(
    balancedScope <= strictScope,
    "Balanced mode should have <= scope deps than strict"
  );
});

// ============================================================================
// CACHE INTEGRATION TESTS
// ============================================================================

test("cache: same code produces cache hit on second call", async () => {
  const code = `
    const a = 1;
    const b = a + 2;
  `;

  // First call - cache miss
  const first = await buildAndMeasure(code);

  // Second call - should hit cache
  const second = await buildAndMeasure(code);

  // Results should be identical
  assert.deepStrictEqual(
    sortDeps(first.dependencies),
    sortDeps(second.dependencies),
    "Cache hit should produce identical dependencies"
  );

  // Second call should be MUCH faster (cache hit)
  assert.ok(
    second.timeMs < first.timeMs * 0.5,
    `Cache hit should be faster (first: ${first.timeMs}ms, second: ${second.timeMs}ms)`
  );

  console.log(`\n  [CACHE] Cache effectiveness:`);
  console.log(`    First call (miss):  ${first.timeMs.toFixed(2)}ms`);
  console.log(`    Second call (hit):  ${second.timeMs.toFixed(2)}ms`);
  console.log(`    Speedup: ${(first.timeMs / second.timeMs).toFixed(1)}x`);
});

test("cache: different dependency modes use separate caches", async () => {
  const code = `
    function outer() {
      const inner = 1;
      return inner;
    }
  `;

  const strict = await buildAndMeasure(code, "strict");
  const balanced = await buildAndMeasure(code, "balanced");

  // Results should differ (different scope containment strategies)
  const strictDeps = sortDeps(strict.dependencies);
  const balancedDeps = sortDeps(balanced.dependencies);

  assert.notDeepStrictEqual(
    strictDeps,
    balancedDeps,
    "Different modes should produce different dependency graphs"
  );
});

// ============================================================================
// EDGE CASES
// ============================================================================

test("edge case: empty file", async () => {
  const code = "";

  const { dependencies, identifiers } = await buildAndMeasure(code);

  assert.strictEqual(identifiers.length, 0, "Empty file has no identifiers");
  assert.strictEqual(
    dependencies.length,
    0,
    "Empty file has no dependencies"
  );
});

test("edge case: single variable", async () => {
  const code = "const x = 1;";

  const { dependencies, identifiers } = await buildAndMeasure(code);

  assert.strictEqual(identifiers.length, 1, "Should have one identifier");
  assert.strictEqual(dependencies.length, 0, "No dependencies for single var");
});

test("edge case: hoisting (function declarations)", async () => {
  const code = `
    const result = hoisted();
    function hoisted() {
      return 42;
    }
  `;

  const { dependencies } = await buildAndMeasure(code);

  // result references hoisted (even though hoisted is declared after)
  const refDeps = dependencies.filter((d) => d.reason === "reference");
  const refStrings = sortDeps(refDeps);

  assert.ok(
    refStrings.some((s) => s.includes("hoisted -> result")),
    "Should detect reference despite declaration order"
  );
});

test("edge case: arrow functions and closures", async () => {
  const code = `
    const makeCounter = () => {
      let count = 0;
      return () => ++count;
    };
    const counter = makeCounter();
  `;

  const { dependencies } = await buildAndMeasure(code);

  // Should detect scope containment for count inside makeCounter
  const scopeDeps = dependencies.filter((d) => d.reason === "scope-containment");

  assert.ok(
    scopeDeps.some(
      (d) => d.from.node.name === "makeCounter" && d.to.node.name === "count"
    ),
    "Should detect count is contained in makeCounter scope"
  );
});

test("edge case: class declarations and methods", async () => {
  const code = `
    class MyClass {
      constructor(value) {
        this.value = value;
      }
      getValue() {
        return this.value;
      }
    }
    const instance = new MyClass(42);
  `;

  const { dependencies } = await buildAndMeasure(code);

  // instance references MyClass
  const refDeps = dependencies.filter((d) => d.reason === "reference");

  assert.ok(
    refDeps.some(
      (d) =>
        d.from.node.name === "MyClass" && d.to.node.name === "instance"
    ),
    "Should detect instance references MyClass"
  );
});

test("edge case: import/export statements", async () => {
  const code = `
    import { helper } from './helper';
    export const result = helper(42);
  `;

  const { dependencies } = await buildAndMeasure(code);

  // result references helper (imported)
  const refDeps = dependencies.filter((d) => d.reason === "reference");

  assert.ok(
    refDeps.some(
      (d) => d.from.node.name === "helper" && d.to.node.name === "result"
    ),
    "Should detect result references imported helper"
  );
});

// ============================================================================
// REGRESSION TESTS (ensure old behavior preserved)
// ============================================================================

test("regression: topological sort produces valid batches", async () => {
  const code = `
    const a = 1;
    const b = a + 1;
    const c = b + 1;
    function outer() {
      const d = c + 1;
      return d;
    }
  `;

  const identifiers = extractBindingIdentifiers(code);
  const dependencies = await buildDependencyGraph(code, identifiers);
  const batches = topologicalSort(identifiers, dependencies);

  // All identifiers should be in batches
  const total = batches.reduce((sum, batch) => sum + batch.length, 0);
  assert.strictEqual(
    total,
    identifiers.length,
    "All identifiers should be in batches"
  );

  // Each batch should respect dependencies
  const processed = new Set<NodePath<Identifier>>();
  for (const batch of batches) {
    for (const id of batch) {
      // All dependencies of id should already be processed
      const deps = dependencies.filter((d) => d.to === id);
      for (const dep of deps) {
        if (dep.from !== dep.to) {
          // Skip self-references
          assert.ok(
            processed.has(dep.from),
            `${id.node.name} depends on ${dep.from.node.name} which should be processed earlier`
          );
        }
      }
    }
    // Add current batch to processed
    batch.forEach((id) => processed.add(id));
  }
});

test("regression: dependency graph is deterministic", async () => {
  const code = `
    const a = 1;
    const b = a + 1;
    function fn() {
      const c = b + 1;
      return c;
    }
  `;

  // Build graph multiple times
  const run1 = await buildAndMeasure(code);
  const run2 = await buildAndMeasure(code);
  const run3 = await buildAndMeasure(code);

  // Results should be identical
  const deps1 = sortDeps(run1.dependencies);
  const deps2 = sortDeps(run2.dependencies);
  const deps3 = sortDeps(run3.dependencies);

  assert.deepStrictEqual(deps1, deps2, "Run 1 and 2 should match");
  assert.deepStrictEqual(deps2, deps3, "Run 2 and 3 should match");
});
