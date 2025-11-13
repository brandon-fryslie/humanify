# Scope Hierarchy Analysis: Critical Examination

**Date**: 2025-11-12
**Status**: Critical review of `buildScopeHierarchy()` performance and value
**Files**: `src/plugins/local-llm-rename/dependency-graph.ts` (lines 463-508)

---

## Executive Summary

The scope hierarchy building (`buildScopeHierarchy()`) is **resource-intensive but necessary** for quality results in turbo mode. This analysis examines its performance characteristics, actual value, shortcomings, and optimization opportunities.

**Key Findings:**
- **Complexity**: O(n²) where n = number of identifiers
- **Cost**: On 500 identifiers, Phase 1 takes several seconds
- **Value**: Essential for correct dependency ordering (20-40% quality improvement)
- **Optimization potential**: Significant - can be reduced to O(n × d) where d = average scope depth

---

## What buildScopeHierarchy Does

### Purpose
Precomputes which identifiers contain which other identifiers (scope containment relationships).

### Algorithm (Current Implementation)
```typescript
function buildScopeHierarchy(
  identifiers: NodePath<Identifier>[],
  onProgress?: (processed: number) => void
): Map<NodePath<Identifier>, Set<NodePath<Identifier>>> {
  const hierarchy = new Map();

  // For each identifier (outer loop: n iterations)
  for (const outer of identifiers) {
    const contained = new Set();
    const outerScope = getScopeForContainment(outer);

    // Check every other identifier (inner loop: n iterations)
    for (const inner of identifiers) {
      if (outer === inner) continue;

      const innerScope = getScopeForContainment(inner);

      // Walk up scope chain (depth iterations)
      let current = innerScope.parent;
      while (current) {
        if (current === outerScope) {
          contained.add(inner);
          break;
        }
        current = current.parent;
      }
    }

    if (contained.size > 0) {
      hierarchy.set(outer, contained);
    }
  }

  return hierarchy;
}
```

**Complexity Analysis:**
- Outer loop: n identifiers
- Inner loop: n identifiers
- Scope walk: d depth (typically 3-10)
- **Total: O(n² × d)**

### Performance Characteristics

| Identifiers | Operations | Est. Time (d=5) | Est. Time (d=10) |
|-------------|-----------|-----------------|------------------|
| 100 | 10,000 | ~20ms | ~40ms |
| 500 | 250,000 | ~500ms | ~1s |
| 1,000 | 1,000,000 | ~2s | ~4s |
| 5,000 | 25,000,000 | ~50s | ~100s |

**Reality check**: On the 3784-line `claude-code-cli.js` test file with likely 1000+ identifiers, this could take **minutes** just for Phase 1.

---

## Actual Value Assessment

### Where It's Used

**1. Dependency Graph Construction** (`dependency-graph.ts` lines 109-147)
```typescript
for (const idA of identifiers) {
  const contained = scopeHierarchy.get(idA);
  if (contained) {
    for (const idB of contained) {
      // Add scope containment dependency
      deps.push({ from: idA, to: idB, reason: 'scope-containment' });
    }
  }
}
```

**Purpose**: Determine which identifiers must be renamed before others to provide better context to the LLM.

### Impact on Quality

**From `ordering-vs-parallelization.md`:**
- Information-flow ordering (enabled by scope hierarchy): **+20-40% quality improvement**
- Without it: LLMs see less semantic context, produce worse names

**Example**:
```javascript
// WITHOUT proper ordering:
function outer() {
  const x = 10;  // Renamed first → no context about usage
  function inner() {
    return x * 2;  // LLM doesn't see 'x' has better name
  }
}

// WITH proper ordering (outer → inner):
function processUserData() {  // Renamed first
  const userData = getUserData();  // Better context available
  function validateUser() {  // Can see it's in processUserData context
    return userData.isValid;
  }
}
```

**Verdict**: **High value** for quality - the scope hierarchy enables optimal ordering which dramatically improves naming quality.

---

## Shortcomings and Tradeoffs

### 1. **Quadratic Complexity**

**Problem**: Every identifier is compared against every other identifier.

**Impact**:
- Small files (< 100 identifiers): Negligible (~20ms)
- Medium files (500 identifiers): Noticeable (~500ms-1s)
- Large files (1000+ identifiers): Painful (2-10s+)
- Very large files (5000+ identifiers): Prohibitive (minutes)

**Tradeoff**: Quality vs. runtime - we pay O(n²) cost for better naming quality.

### 2. **Unnecessary Comparisons**

**Observation**: Most identifier pairs have NO scope relationship.

**Example inefficiency**:
```javascript
const a = 1;  // Top-level
const b = 2;  // Top-level

function foo() {
  const x = 10;  // Inside foo
}

function bar() {
  const y = 20;  // Inside bar
}
```

**Current behavior**: Checks all pairs:
- a vs b: No relationship (both top-level) ❌
- a vs x: No relationship (different scopes) ❌
- a vs y: No relationship (different scopes) ❌
- b vs x: No relationship ❌
- b vs y: No relationship ❌
- x vs y: No relationship ❌
- foo vs x: YES - foo contains x ✅
- bar vs y: YES - bar contains y ✅

**Only 2 out of 28 comparisons are useful!**

### 3. **Redundant Scope Walks**

**Problem**: Same scope chains walked repeatedly.

```typescript
// If we have 10 identifiers in the same function,
// we walk from that function to the root 10 times
// when we could cache the result
```

### 4. **Cache Format Bloat**

**From `dependency-cache.ts`:**
```typescript
scopeHierarchy: [number, number[]][]  // Serialized hierarchy
```

**For large files**:
- 1000 identifiers × avg 10 contained = 10,000 entries
- Each entry: `[outerIdx, [innerIdx1, innerIdx2, ...]]`
- JSON size: ~200-500KB for large files

**Impact**: Slower cache writes/reads, more disk space.

### 5. **Mode-Specific Waste**

**From `dependency-graph.ts` lines 79-96:**
```typescript
if (mode === "relaxed") {
  scopeHierarchy = new Map();  // Empty - scope hierarchy not used!
  console.log("Skipping scope hierarchy (relaxed mode)");
}
```

**Issue**: In "relaxed" mode (no scope containment dependencies), we skip building the hierarchy entirely. This suggests the hierarchy is **not always necessary**.

---

## Critical Questions

### Q1: Is the scope hierarchy actually USED effectively?

**Analysis of usage** (`dependency-graph.ts` lines 109-147):

```typescript
// Phase 2: Add scope containment dependencies
for (const idA of identifiers) {
  const contained = scopeHierarchy.get(idA);
  if (contained) {
    for (const idB of contained) {
      // In balanced mode: filter to direct children only
      if (mode === "balanced") {
        const isDirectChild = /* complex check */;
        if (isDirectChild) {
          deps.push({ from: idA, to: idB, reason: 'scope-containment' });
        }
      } else {
        // Strict mode: use ALL containment
        deps.push({ from: idA, to: idB, reason: 'scope-containment' });
      }
    }
  }
}
```

**Finding**: In "balanced" mode (the default), we compute the FULL containment hierarchy but then **filter it down to just direct parent-child relationships**!

**Implication**: We're doing O(n²) work to compute transitive containment, then throwing most of it away.

### Q2: Can we build a sparser hierarchy?

**YES.** For "balanced" mode, we only need direct parent-child relationships, not full transitive closure.

**Current approach**:
```
function outer() {
  function middle() {
    function inner() { ... }
  }
}

Hierarchy computed:
- outer contains: [middle, inner]  ← includes transitive (outer→inner)
- middle contains: [inner]

Balanced mode filters:
- outer → middle (direct) ✅
- outer → inner (transitive) ❌ FILTERED OUT
- middle → inner (direct) ✅
```

**Optimized approach**: Build only direct relationships from the start.

### Q3: How often does caching help?

**From code**:
- Cache key: `${code}-${mode}` (includes dependency mode)
- Cache stores precomputed hierarchy
- Cache hit = zero cost

**Reality check**:
- **Development**: High cache hit rate (same file processed multiple times)
- **CI/Production**: Low cache hit rate (different files each time)
- **Team sharing**: Possible if cache committed to git

**Verdict**: Caching helps significantly in development, less so in production.

---

## Optimization Opportunities

### Optimization 1: Build Only Direct Relationships (Balanced Mode)

**Idea**: Don't compute transitive containment if we're just going to filter it out.

**Implementation**:
```typescript
function buildDirectScopeHierarchy(identifiers: NodePath<Identifier>[]) {
  const hierarchy = new Map();

  for (const id of identifiers) {
    const idScope = getScopeForContainment(id);
    const contained = new Set();

    // Only check identifiers whose PARENT scope is this identifier's scope
    for (const other of identifiers) {
      if (id === other) continue;

      const otherScope = getScopeForContainment(other);

      // Direct child if parent scope matches
      if (otherScope.parent === idScope) {
        contained.add(other);
      }
    }

    if (contained.size > 0) {
      hierarchy.set(id, contained);
    }
  }

  return hierarchy;
}
```

**Benefit**: Still O(n²), but inner loop is much faster (no scope walk, just equality check).
**Expected improvement**: 2-5x faster (eliminates scope walks).

### Optimization 2: Group by Scope, Only Check Within Groups

**Idea**: Most identifiers can't possibly contain each other (different scopes).

**Implementation**:
```typescript
function buildScopeHierarchyGrouped(identifiers: NodePath<Identifier>[]) {
  // Step 1: Group identifiers by their scope
  const bySco pe = new Map<any, NodePath<Identifier>[]>();
  for (const id of identifiers) {
    const scope = getScopeForContainment(id);
    if (!byScope.has(scope)) byScope.set(scope, []);
    byScope.get(scope).push(id);
  }

  // Step 2: For each scope, find parent scope
  const scopeParents = new Map<any, any>();
  for (const [scope, ids] of byScope) {
    scopeParents.set(scope, scope.parent);
  }

  // Step 3: Build hierarchy by checking parent-child scope pairs only
  const hierarchy = new Map();
  for (const [parentScope, parentIds] of byScope) {
    for (const [childScope, childIds] of byScope) {
      if (childScope.parent === parentScope) {
        // All childIds are children of all parentIds that are functions/classes
        for (const parent of parentIds) {
          if (isFunctionOrClass(parent)) {
            for (const child of childIds) {
              if (!hierarchy.has(parent)) hierarchy.set(parent, new Set());
              hierarchy.get(parent).add(child);
            }
          }
        }
      }
    }
  }

  return hierarchy;
}
```

**Benefit**: Reduces comparisons from O(n²) to O(scopes² × avg_identifiers_per_scope²).
**Expected improvement**: 5-20x faster for deeply nested code.

### Optimization 3: Incremental Updates (Future)

**Idea**: When reprocessing a file with small changes, only rebuild affected parts.

**Challenge**: Requires tracking which parts of AST changed.
**Benefit**: Near-zero cost for incremental processing.
**Effort**: High - requires change tracking infrastructure.

### Optimization 4: Lazy Evaluation

**Idea**: Don't build full hierarchy upfront - compute on demand.

**Implementation**:
```typescript
class LazyHierarchy {
  private cache = new Map();

  getContained(outer: NodePath<Identifier>): Set<NodePath<Identifier>> {
    if (this.cache.has(outer)) return this.cache.get(outer);

    // Compute only when needed
    const contained = this.computeContained(outer);
    this.cache.set(outer, contained);
    return contained;
  }
}
```

**Benefit**: Only compute for identifiers that actually need it.
**Risk**: Might not help if most identifiers are checked anyway.

### Optimization 5: Native Implementation (Maximum Performance)

**Idea**: Implement in Rust/C++ for memory locality and SIMD optimizations.

**From `dependency-graph-optimization.md`:**
- Expected: 10-100x improvement
- Requires: napi-rs setup, cross-platform builds
- Fallback: JavaScript implementation

**Verdict**: Overkill unless processing huge files (10K+ identifiers).

---

## Recommended Optimizations (Priority Order)

### Priority 1: Build Only Direct Relationships (Balanced Mode) ✅

**Effort**: Low (1-2 hours)
**Impact**: High (2-5x improvement)
**Risk**: Low (simple logic change)

**Implementation**:
```typescript
function buildScopeHierarchy(identifiers, options) {
  if (options.mode === 'balanced') {
    return buildDirectScopeHierarchy(identifiers);  // New optimized version
  } else {
    return buildFullScopeHierarchy(identifiers);  // Current implementation
  }
}
```

### Priority 2: Scope Grouping Optimization ✅

**Effort**: Medium (4-6 hours)
**Impact**: High (5-20x improvement for nested code)
**Risk**: Medium (more complex logic, needs thorough testing)

**Value**: Especially beneficial for:
- Large files with many nested functions
- Codebases with deep class hierarchies
- Files generated by bundlers (e.g., webpack)

### Priority 3: Progress Reporting Improvements ✅

**Current**: Progress logged every 10K identifiers
**Issue**: For 500 identifiers, no progress shown (looks frozen)

**Fix**:
```typescript
buildScopeHierarchy(identifiers, (progress) => {
  // Log every 5% instead of every 10K identifiers
  const pct = (progress / identifiers.length) * 100;
  if (pct % 5 === 0) {
    console.log(`    →   ${pct}% (${progress}/${identifiers.length})`);
  }
});
```

### Priority 4: Cache Format Optimization ⚠️

**Effort**: Medium (6-8 hours)
**Impact**: Medium (faster cache reads, less disk space)
**Risk**: Medium (cache invalidation, breaking changes)

**Ideas**:
- Use binary format instead of JSON (msgpack, protobuf)
- Compress hierarchy (gzip)
- Store only non-empty entries

**Verdict**: Wait for Priority 1 & 2 results first. If still seeing slowness, revisit.

### Priority 5: Native Implementation ⚠️⚠️⚠️

**Effort**: High (2-3 weeks)
**Impact**: Very High (10-100x improvement)
**Risk**: High (build complexity, platform support)

**Verdict**: **Only if** processing files with 5K+ identifiers regularly. Not needed for typical use cases.

---

## Tradeoff Matrix

| Optimization | Speedup | Effort | Risk | Recommended |
|-------------|---------|--------|------|-------------|
| Direct-only hierarchy | 2-5x | Low | Low | ✅ Yes - do first |
| Scope grouping | 5-20x | Med | Med | ✅ Yes - do second |
| Progress reporting | N/A | Low | Low | ✅ Yes - quality of life |
| Cache optimization | 1.5-2x | Med | Med | ⚠️ Maybe - wait and see |
| Lazy evaluation | 1-3x | Med | Med | ⚠️ Maybe - if needed |
| Native impl | 10-100x | High | High | ❌ Not unless desperate |

---

## Measurement Plan

### Before Optimization
```bash
# Test with various file sizes
npm test -- src/plugins/local-llm-rename/dependency-graph.test.ts

# Profile large file
NODE_ENV=development npm start -- openai test-samples/deobf-500.js --turbo --verbose 2>&1 | grep "Phase 1"
```

**Record**:
- Phase 1 time (ms)
- Total identifiers
- Cache hit rate

### After Each Optimization
```bash
# Same tests
npm test -- src/plugins/local-llm-rename/dependency-graph.test.ts
npm start -- openai test-samples/deobf-500.js --turbo --verbose 2>&1 | grep "Phase 1"
```

**Compare**:
- Phase 1 time improvement (%)
- Quality impact (manual inspection of renames)
- Test pass rate (ensure no regressions)

---

## Answers to Original Questions

### How valuable is the scope hierarchy?

**VERY VALUABLE** for quality:
- Enables optimal dependency ordering
- Leads to 20-40% better naming quality
- Essential for turbo mode to work correctly

**BUT**: Current implementation is inefficient.

### How can we improve its effectiveness?

1. **Build only what we need** (direct relationships in balanced mode)
2. **Group by scope** (avoid O(n²) comparisons)
3. **Better progress reporting** (user experience)

### What are the shortcomings and tradeoffs?

**Shortcomings**:
- O(n²) complexity (slow for large files)
- Wasteful comparisons (most pairs unrelated)
- Mode-specific inefficiency (computing more than needed)
- Cache size (100s of KB for large files)

**Tradeoffs**:
- Quality vs. Performance (we choose quality, but can be smarter about it)
- Completeness vs. Speed (balanced mode doesn't need full transitive closure)
- Memory vs. Computation (caching helps, but uses disk space)

### What optimizations should we pursue?

**Tier 1** (do now):
1. Build direct-only hierarchy for balanced mode
2. Improve scope grouping to reduce comparisons
3. Better progress reporting

**Tier 2** (consider later):
4. Cache format optimization
5. Lazy evaluation

**Tier 3** (only if desperate):
6. Native implementation

---

## Conclusion

The scope hierarchy is **essential for quality** but **expensive to compute**. The current O(n²) implementation is acceptable for small-medium files (< 500 identifiers) but becomes prohibitive for large files.

**Recommended immediate actions**:
1. Implement direct-only hierarchy for balanced mode (2-5x faster, low risk)
2. Add scope grouping optimization (5-20x faster, medium risk)
3. Improve progress reporting (better UX, zero risk)

**Expected outcome**: Phase 1 time reduced from seconds to milliseconds for typical files, making turbo mode practical for a wider range of file sizes.

**Long-term strategy**: Monitor performance with optimizations in place. If still seeing issues with very large files (5K+ identifiers), consider more aggressive optimizations (cache format, native impl).

---

## Next Steps

1. Create feature branch: `optimize/scope-hierarchy`
2. Implement Priority 1 optimization (direct-only hierarchy)
3. Add comprehensive tests
4. Measure improvement
5. If successful, implement Priority 2 (scope grouping)
6. Update documentation with new performance characteristics
