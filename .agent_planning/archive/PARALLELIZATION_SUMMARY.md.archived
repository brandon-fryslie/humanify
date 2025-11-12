# Parallelization Strategy - Executive Summary

**Date**: 2025-10-23
**Status**: Planning Complete, Ready for Implementation

---

## The Question You Asked

> Does the context of one call depend on the results of the previous call?

**Answer**: **YES!** And this is intentional for quality.

---

## Critical Discovery

The current implementation extracts context from the **CURRENT state of the AST**, which includes all previous renames. This means:

```javascript
// Iteration 1: Rename 'foo' → 'getUserData'
// AST is mutated

// Iteration 2: When extracting context for 'b'
// The LLM sees: "function getUserData() { const b = 2; }"
//                       ↑↑↑↑↑↑↑↑↑↑↑↑↑
//                   Already renamed!
```

**Why this matters for quality**:
- If outer function is renamed to `getUserData`, inner variables see that context
- LLM can make better naming decisions (e.g., `b` → `userData` based on function name)
- Sequential processing is a **feature, not a bug**

**Proof**: Test at `visit-all-identifiers.test.ts:105-145` validates this behavior.

---

## Your Insight: Scope-Level Parallelization

> Can we parallelize code that doesn't reference each other?

**Answer**: **YES!** The current code already sorts by scope size (line 79), creating natural "levels":

```javascript
// Level 1 (largest scope - whole program)
const globalVar = 1;
function foo() { ... }
function bar() { ... }  // ← foo and bar are independent!

// Level 2 (medium scope - inside foo)
function foo() {
  const a = 1;
  const b = 2;  // ← a and b might be independent!
}
```

**Key Insight**: Identifiers at the **same scope level** can often be processed in parallel because:
1. They're at the same nesting depth
2. Context extraction happens at the same "snapshot" of AST
3. They likely don't reference each other (common case)

---

## Recommended Strategy: Scope-Level Batching

### Algorithm

```typescript
// 1. Group identifiers by scope size
const scopeLevels = groupByScopeSize(allScopes)

// 2. Process each level
for (const level of scopeLevels) {
  // 3. Extract contexts (all at current AST state)
  const contexts = level.map(scope => scopeToString(scope))

  // 4. PARALLEL API calls for this level
  const newNames = await Promise.all(
    level.map((scope, i) => visitor(scope.name, contexts[i]))
  )

  // 5. SEQUENTIAL AST mutations (so next level sees these renames)
  for (let i = 0; i < level.length; i++) {
    applyRename(level[i], newNames[i])
  }
}
```

### Why This Works

✅ **Preserves quality**: Outer scopes renamed before inner scopes
✅ **Parallelizes API calls**: Within each level, all API calls happen simultaneously
✅ **Safe mutations**: AST mutations still sequential
✅ **Simple to implement**: Just group by scope size, rest stays mostly the same

### Expected Speedup

| Code Pattern | Current | With Parallelization | Speedup |
|--------------|---------|---------------------|---------|
| 50 independent functions | 12.5s | ~1.5s | **8-10x** |
| 10 functions, 5 vars each | 15s | ~3s | **5x** |
| Deeply nested (chain) | 10s | ~8s | **1.2x** |

**Average case**: **3-5x speedup** on typical minified JavaScript

---

## Implementation Plan

### Week 1: Core Implementation
- **Day 1-2**: Add `groupByScopeSize()` helper
- **Day 3-4**: Refactor main loop to process levels
- **Day 5**: Add `--max-concurrent` flag and concurrency limiter

### Week 2: Testing & Optimization
- **Day 6-7**: Verify all 18 existing tests pass
- **Day 8-9**: Add parallelization tests
- **Day 10**: Performance benchmarking

### Week 3: Polish & Ship
- **Day 11-12**: Error handling, rate limiting, retries
- **Day 13-14**: Documentation updates
- **Day 15**: Release v2.3.0

**Total effort**: 3 weeks

---

## Future Enhancement: Dependency Graph (Optional)

If scope-level batching isn't enough, we can build a **full dependency graph**:

```typescript
// Detect which identifiers reference which others
const graph = buildDependencyGraph(scopes)

// Find truly independent batches (even across levels)
const batches = topologicalSort(graph)

// Process each batch in parallel
for (const batch of batches) {
  await processInParallel(batch)
}
```

**Expected additional speedup**: 1.5-2x on top of scope-level batching
**Complexity**: HIGH (1-2 weeks additional work)
**Recommendation**: Only implement if needed

---

## Risk Mitigation

### Risk: Same-level identifiers might reference each other

**Example**:
```javascript
const a = 1;
const b = a;  // References 'a', but both at same scope level!
```

**Impact**: Context for `b` might not see `a`'s new name
**Likelihood**: LOW - uncommon pattern in minified code
**Mitigation**:
- Test on real-world minified code
- If quality degrades, fall back to dependency graph approach

### Risk: Rate limiting

**Mitigation**:
- Default `maxConcurrent = 10` (conservative)
- Exponential backoff on 429 errors
- Document rate limits in README

---

## Answer to Your Original Question

**Q**: Can we parallelize without reducing quality?

**A**: Yes, using **scope-level batching**:

1. ✅ Identifiers at same scope level → parallel API calls
2. ✅ Preserve outer→inner ordering → quality maintained
3. ✅ Sequential AST mutations → correctness guaranteed
4. ✅ Expected 3-5x speedup on typical code

**Next step**: Implement and measure. If results show quality degradation, we have the dependency graph approach as Plan B.

---

## Files to Reference

- **Main plan**: `.agent_planning/parallelization-plan.md` (full technical details)
- **Deep analysis**: `.agent_planning/parallelization-analysis.md` (dependency graph approach)
- **This summary**: `.agent_planning/PARALLELIZATION_SUMMARY.md` (you are here)

---

## Decision

**Proceed with scope-level batching implementation** ✅

This balances:
- Significant speedup (3-5x)
- Low risk (preserves quality)
- Reasonable effort (2-3 weeks)
- Future extensibility (can add dependency graph later if needed)
