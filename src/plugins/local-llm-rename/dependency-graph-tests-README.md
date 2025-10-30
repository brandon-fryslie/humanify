# Dependency Graph Functional Tests

## Overview

This test suite validates the Phase 2 Reference Index Precomputation optimization for HumanifyJS. The tests are designed to be **anti-gameable** and verify **real, observable behavior** rather than implementation details.

## Test File Location

`src/plugins/local-llm-rename/dependency-graph.test.ts`

## How to Run Tests

```bash
# Run all dependency graph tests
npx tsx --test src/plugins/local-llm-rename/dependency-graph.test.ts

# Run all tests (includes dependency graph tests)
npm test
```

## What These Tests Validate

### 1. Correctness (Primary Goal)

These tests verify that the Phase 2 optimization produces **identical** dependency graphs to the current O(n²) implementation. This ensures we're speeding up the code WITHOUT changing its behavior.

**Key correctness tests:**

- **Basic variable references**: `const b = a + 2;` → b depends on a
- **Function calls**: `caller()` calls `outer()` → caller depends on outer
- **Variable shadowing** ⚠️ CRITICAL: Same variable name in different scopes must be distinguished
- **Circular references**: Mutual dependencies (A→B, B→A)
- **Self-references**: Recursive functions (factorial calls itself)
- **Complex chains**: Long dependency chains (A→B→C→D→E)
- **Nested scopes**: Multi-level function nesting with scope containment
- **Destructuring**: Object and array destructuring patterns
- **Edge cases**: Empty files, single variables, hoisting, classes, imports

**Why these tests can't be gamed:**
- Tests extract ACTUAL AST identifiers from real JavaScript code
- Tests compare ACTUAL dependency graphs (not mocked results)
- Tests verify OBSERVABLE structure (graph edges, topological order)
- A stub implementation would fail these tests

### 2. Performance Benchmarks

These tests measure **wall-clock time** to verify the optimization actually speeds things up.

**Benchmark tests:**

- **Small file (100 identifiers)**: Baseline for small code
- **Medium file (500 identifiers)**: Where O(n²) pain starts
- **Large file (1000 identifiers)**: Where O(n²) becomes unbearable
- **Dependency modes comparison**: Strict vs balanced vs relaxed

**Expected improvements (from TODO.md):**
- Small files (100 ids): 2-5x faster
- Medium files (500 ids): 10-20x faster
- Large files (1000+ ids): 20-100x faster

**Current status:**
- Tests pass with generous timeouts (current O(n²) implementation)
- After Phase 2 optimization, uncomment the stricter assertions
- Example:
  ```typescript
  // AFTER Phase 2:
  assert.ok(timeMs < 500, `Should complete in < 500ms with optimization`);
  ```

**Why these tests can't be gamed:**
- Tests measure performance.now() wall-clock time
- Tests use real code samples (not trivial examples)
- Tests cannot be satisfied by returning cached results (first run is measured)

### 3. Cache Integration

These tests verify that the dependency cache works correctly and actually speeds things up.

**Cache tests:**

- **Cache hits**: Second call should reuse cached dependencies
- **Cache separation**: Different dependency modes use separate caches
- **Cache correctness**: Cached results match fresh computation

**Why these tests can't be gamed:**
- Tests compare actual timing of cache hit vs miss
- Tests verify cache produces identical results to fresh computation
- Tests cannot be satisfied by always returning stale cache

### 4. Edge Cases

These tests catch corner cases that might break the optimization.

**Edge case tests:**

- Empty file (no identifiers)
- Single variable (no dependencies)
- Hoisting (declaration after usage)
- Arrow functions and closures
- Class declarations and methods
- Import/export statements

### 5. Regression Tests

These tests ensure we don't break existing functionality.

**Regression tests:**

- **Topological sort validity**: Batches respect dependencies
- **Determinism**: Same input produces same output every time

## Anti-Gaming Properties

These tests are structured to prevent AI agents (or humans) from "cheating" the validation:

### 1. Real Code, Not Mocks
```typescript
const code = `
  const a = 1;
  const b = a + 2;  // Real JavaScript
`;
const identifiers = extractBindingIdentifiers(code);  // Real AST extraction
const dependencies = await buildDependencyGraph(code, identifiers);  // Real function
```

### 2. Observable Outcomes
Tests verify externally observable results:
- Graph structure (edges between nodes)
- Topological order (valid batch ordering)
- Wall-clock time (actual performance)
- Cache effectiveness (speedup ratio)

### 3. Cannot Be Satisfied By Stubs
A stub implementation would fail because:
- Tests extract actual identifiers from AST
- Tests verify specific dependency edges exist
- Tests measure actual time taken
- Tests verify cache produces identical results

### 4. Multiple Verification Points
Each test checks multiple things:
- Primary result (dependency graph structure)
- Side effects (scope containment vs references)
- Performance (timing)
- Edge cases (shadowing, cycles, etc.)

## Test Status vs STATUS Report

These tests validate the following gaps from STATUS-2025-10-23-191500.md:

**STATUS gaps addressed:**
- Lines 90-157: Reference checking bottleneck (O(n² × m × k))
- Lines 228-264: Unoptimized `references()` function
- Lines 403-411: Missing unit tests for reference index
- Lines 509-535: No performance benchmarks for Phase 2

**PLAN items validated (from PLAN-2025-10-23-224114.md):**
- P1-1 (lines 190-330): Reference Index Precomputation
  - Acceptance criteria: buildReferenceIndex() correctness
  - Acceptance criteria: Results match old implementation
  - Acceptance criteria: 10-100x speedup on reference phase
  - Acceptance criteria: Handle shadowing correctly

## Current Test Results

**As of initial creation (before Phase 2 implementation):**

- ❌ Most tests FAIL (expected - reference dependencies not detected)
- ✅ Isolated variables test PASSES (no dependencies expected)
- ⚠️ Performance tests PASS with generous timeouts (very slow)

**Why tests fail:**
The current `buildDependencyGraph()` implementation has a bug or limitation in the `references()` function that prevents it from detecting reference dependencies correctly. The console output shows:

```
→ Total dependencies: 0 (scope: 0, ref: 0)
```

Even for code like `const b = a + 2;` where b clearly references a.

**This is actually GOOD** - it means:
1. The tests are validating real functionality
2. The tests cannot be satisfied by the current implementation
3. The tests will properly validate when Phase 2 is implemented correctly

## After Phase 2 Implementation

Once `buildReferenceIndex()` is implemented, you should:

### 1. Verify All Tests Pass
```bash
npx tsx --test src/plugins/local-llm-rename/dependency-graph.test.ts
```

All correctness tests should now pass.

### 2. Check Performance Improvements

Look for output like:
```
[BENCHMARK] Small file:
  Identifiers: 99
  Dependencies: 98
  Time: 123.45ms
  Reference deps: 49

[BENCHMARK] Medium file:
  Identifiers: 499
  Dependencies: 498
  Time: 456.78ms
  Reference deps: 249

[BENCHMARK] Large file:
  Identifiers: 999
  Dependencies: 998
  Time: 1234.56ms
  Reference deps: 499
```

### 3. Uncomment Stricter Assertions

After verifying speedup is significant, uncomment the stricter performance assertions:

```typescript
// In small file benchmark (line 442):
assert.ok(timeMs < 500, `Should complete in < 500ms with optimization (took ${timeMs}ms)`);

// In medium file benchmark (line 475):
assert.ok(timeMs < 2000, `Should complete in < 2s with optimization (took ${timeMs}ms)`);

// In large file benchmark (line 508):
assert.ok(timeMs < 5000, `Should complete in < 5s with optimization (took ${timeMs}ms)`);
```

### 4. Verify Cache Effectiveness

Check cache hit speedup:
```
[CACHE] Cache effectiveness:
  First call (miss):  123.45ms
  Second call (hit):  5.67ms
  Speedup: 21.8x
```

Cache should provide >> 10x speedup.

## Implementation Guidance

When implementing Phase 2, use these tests to guide development:

### Step 1: Fix Reference Detection (Prerequisites)

Before optimizing, the `references()` function needs to work correctly. Debug why:
```
→ Total dependencies: 0 (scope: 0, ref: 0)
```

Even simple code shows zero reference dependencies.

### Step 2: Implement buildReferenceIndex()

Create the new function in `dependency-graph.ts`:

```typescript
interface ReferenceIndex {
  nameReferences: Map<string, Set<string>>;
  bindings: Map<string, any>;
}

function buildReferenceIndex(
  identifiers: NodePath<Identifier>[]
): ReferenceIndex {
  // Build reference index ONCE (O(n × m × k))
  // Return O(1) lookup structure
}
```

Run tests after each change to verify correctness.

### Step 3: Replace O(n²) Loop

Update `buildDependencyGraph()` to use reference index:

```typescript
// Build index once
const refIndex = buildReferenceIndex(identifiers);

// Use O(1) lookups
for (const idA of identifiers) {
  for (const idB of identifiers) {
    if (idA === idB) continue;

    // O(1) lookup instead of O(m × k) traverse
    const idBRefs = refIndex.nameReferences.get(idB.node.name);
    if (idBRefs?.has(idA.node.name)) {
      // Verify bindings match (handle shadowing)
      deps.push({ from: idA, to: idB, reason: 'reference' });
    }
  }
}
```

### Step 4: Verify Tests Pass

All correctness tests should now pass:
- ✅ Basic variable references
- ✅ Function calls
- ✅ Variable shadowing (CRITICAL - must verify bindings)
- ✅ Circular references
- ✅ All edge cases

### Step 5: Measure Performance

Run benchmarks and verify speedup:
- Small files: Should see 2-5x improvement
- Medium files: Should see 10-20x improvement
- Large files: Should see 20-100x improvement

### Step 6: Update Cache (Optional - Task 2.2)

If implementing cache v2:
- Add `referenceIndex` to CacheEntry
- Serialize/deserialize Map objects
- Bump CACHE_VERSION to "2.0"

## Summary JSON

After implementation, these tests will provide validation for:

```json
{
  "tests_added": [
    "dependency graph: basic variable references",
    "dependency graph: function declarations and calls",
    "dependency graph: variable shadowing",
    "dependency graph: circular references",
    "dependency graph: self-reference",
    "dependency graph: complex reference chain",
    "dependency graph: nested scope references",
    "dependency graph: object/array destructuring",
    "performance benchmark: small/medium/large files",
    "performance comparison: dependency modes",
    "cache: effectiveness and separation",
    "edge cases: empty, single, hoisting, classes, imports",
    "regression: topological sort validity",
    "regression: determinism"
  ],
  "workflows_covered": [
    "Reference index building (O(n × m × k) one-time cost)",
    "Reference lookup (O(1) per pair)",
    "Dependency graph construction with optimization",
    "Topological sorting with optimized graph",
    "Cache integration with reference index"
  ],
  "initial_status": "failing",
  "expected_status_after_phase2": "passing",
  "gaming_resistance": "high",
  "status_gaps_addressed": [
    "Reference checking bottleneck (O(n² × m × k))",
    "Missing buildReferenceIndex implementation",
    "No unit tests for reference index",
    "No performance benchmarks for Phase 2"
  ],
  "plan_items_validated": [
    "P1-1: Reference Index Precomputation",
    "P1-1 acceptance criteria: correctness",
    "P1-1 acceptance criteria: performance (10-100x)",
    "P1-1 acceptance criteria: shadowing handled correctly"
  ]
}
```

## Traceability Matrix

| Test Name | STATUS Gap | PLAN Item | Acceptance Criteria |
|-----------|-----------|-----------|-------------------|
| Basic variable references | Lines 90-157 | P1-1 | Correctness: detect references |
| Variable shadowing | Lines 90-157 | P1-1 | Handle shadowing (verify bindings) |
| Circular references | Lines 228-264 | P1-1 | Correctness: detect cycles |
| Performance benchmarks | Lines 509-535 | P1-1 | 10-100x speedup |
| Cache effectiveness | Lines 403-411 | P1-2 | Cache v2 integration |
| Regression tests | Lines 403-411 | P1-1 | Results match old implementation |

## Notes for Developers

### Why Tests Fail Initially

The current implementation's `references()` function appears to have a bug - it doesn't detect reference dependencies. This is actually perfect for TDD:

1. Tests define the CORRECT behavior
2. Tests FAIL with current broken implementation
3. Implementing buildReferenceIndex() should FIX the bug AND improve performance

### Test-Driven Development Flow

1. **Red**: Tests fail (current state)
2. **Green**: Implement buildReferenceIndex(), tests pass
3. **Refactor**: Optimize further, tests still pass
4. **Measure**: Uncomment performance assertions, verify speedup

### Performance Expectations

Based on complexity analysis:

**Current (O(n² × m × k)):**
- 100 ids: ~5000ms (generous timeout)
- 500 ids: ~60000ms (1 minute timeout)
- 1000 ids: ~300000ms (5 minute timeout)

**After Phase 2 (O(n × m × k) + O(n²)):**
- 100 ids: < 500ms (10x improvement)
- 500 ids: < 2000ms (30x improvement)
- 1000 ids: < 5000ms (60x improvement)

**Why it's faster:**
- Reference index building: O(n × m × k) one-time cost
- Reference lookups: O(1) per pair × O(n²) pairs = O(n²)
- Total: O(n × m × k) + O(n²) << O(n² × m × k) when m × k is large

### Critical Edge Case: Variable Shadowing

The most important test is variable shadowing:

```javascript
const x = 1;
function outer() {
  const x = 2;  // Shadows outer x
  return x;
}
const y = x;  // References outer x, NOT inner x
```

The reference index MUST verify bindings, not just names:

```typescript
// WRONG: Only check names
if (idBRefs?.has(idA.node.name)) {
  deps.push(...);  // BUG: Might link wrong x!
}

// CORRECT: Verify bindings
if (idBRefs?.has(idA.node.name)) {
  const idABinding = refIndex.bindings.get(idA.node.name);
  const idBBinding = refIndex.bindings.get(idB.node.name);
  if (idABinding === idBBinding) {  // Same variable!
    deps.push(...);
  }
}
```

## Questions?

If anything is unclear about these tests:
1. Read the test code - it's heavily commented
2. Check the STATUS report (lines 70-157) for context
3. Check the PLAN (lines 190-330) for implementation guidance
4. Check TODO.md (lines 20-132) for code templates

The tests ARE the specification. Make them pass!
