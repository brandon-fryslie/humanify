# Visit-All-Identifiers Throughput Improvement Plan

**Date**: 2025-10-23
**Objective**: Improve throughput of identifier renaming without compromising effectiveness
**Primary Target**: OpenAI API calls (extensible to Gemini and local LLM)

## Executive Summary

The current `visitAllIdentifiers` implementation processes identifiers **sequentially**, making one LLM API call at a time. For a file with N identifiers, this results in N sequential round-trips to the LLM provider. This plan proposes a phased approach to parallelize API calls while maintaining correctness guarantees.

**Key Insight**: The constraint that forces sequential processing is NOT the API calls themselves, but the AST mutation via `scope.rename()`. We can parallelize API calls while keeping AST mutations sequential.

---

## Current State Analysis

### Bottleneck Identification

**File**: `src/plugins/local-llm-rename/visit-all-identifiers.ts:30-58`

Current flow (per identifier):
1. Line 38-41: Extract surrounding code (FAST - string operations)
2. Line 42: **Call visitor (LLM API) - SLOW - blocks here**
3. Line 43-54: Collision detection & AST mutation (FAST - in-memory)
4. Line 55: Mark visited (FAST - Set operation)
5. Line 57: Progress update (FAST)

**Critical observation**: Only step 3 requires sequential execution due to shared mutable state (AST + collision tracking). Steps 1, 2, 4, 5 could theoretically be parallelized or batched.

### Current Performance Characteristics

For a typical minified file with 100 identifiers:
- **Sequential**: 100 × (API_LATENCY + API_PROCESSING)
- **Parallel (theoretical)**: MAX(all API calls) + 100 × (MUTATION_TIME)

Assuming:
- API latency: 200ms
- API processing: 50ms
- Mutation time: 1ms

**Current**: 100 × 250ms = 25 seconds
**Theoretical best**: ~250ms (if all parallel) + 100ms (mutations) = 350ms
**Realistic improvement**: 5-10x speedup with batching

### Constraints That Must Be Preserved

1. **Scope ordering**: Larger scopes renamed before smaller scopes (line 79: sorted by size)
2. **Collision avoidance**: Can't have two identifiers with same name in same scope
3. **Visited tracking**: Each identifier renamed exactly once
4. **AST consistency**: Babel's `scope.rename()` mutations must be atomic
5. **Progress reporting**: User feedback throughout process
6. **Test compatibility**: All 18 existing tests must pass unchanged

---

## CRITICAL FINDING: Context Dependencies

**Discovery**: Context extraction (`scopeToString`) reads the CURRENT state of the AST, which includes all previous renames. This is INTENTIONAL for quality.

**Example** (from test at line 105-145):
```javascript
// Original:
function foo() { const b = 2; }

// When renaming 'foo' → 'foo_changed', the AST is mutated
// Then when extracting context for 'b', it shows:
"function foo_changed() { const b = 2; }"  // ← sees the renamed version!
```

**Why this matters**:
- LLMs get better context when they see already-renamed identifiers
- If `getUserData` calls `fetchFromAPI`, renaming the caller first helps the LLM name the callee
- Sequential processing is NOT a bug - it's a feature for quality

**Impact**: We CANNOT simply parallelize all API calls upfront without losing quality.

---

## Proposed Solutions

### Strategy 1: Scope-Level Batching ⭐ RECOMMENDED (UPDATED)

**Key Insight**: The current code sorts by scope size (largest→smallest). This creates natural "levels" where identifiers at the same level can potentially be parallelized.

**Approach**: Group identifiers by scope size, parallelize within each level.

**Algorithm**:
```typescript
// Phase 1: Group by scope size
const scopeLevels = groupByScopeSize(scopes)

// Phase 2: Process each level
for (const level of scopeLevels) {
  // Within a level, extract contexts in current AST state
  const jobs = level.map(scope => ({
    scope,
    name: scope.node.name,
    context: scopeToString(scope, contextWindowSize)
  }))

  // Parallel API calls for this level
  const newNames = await Promise.all(
    jobs.map(job => visitor(job.name, job.context))
  )

  // Sequential AST mutations (so next level sees these renames)
  for (let i = 0; i < jobs.length; i++) {
    applyRename(jobs[i].scope, newNames[i])
  }
}
```

**Pros**:
- ✅ Preserves outer→inner ordering (quality maintained)
- ✅ Parallelizes independent identifiers at same nesting level
- ✅ Simple implementation (just group by scope size)
- ✅ Lower risk than full parallelization

**Cons**:
- ⚠️ Less parallelism than Strategy 1 (limited by scope depth)
- ⚠️ Assumes same-level identifiers are independent (mostly true)

**Expected Speedup**:
- Typical file (5-10 scope levels): 3-5x
- Flat code (many functions at same level): 10-20x
- Deeply nested code: 1-2x

**Implementation complexity**: LOW-MEDIUM (2-3 days)

---

### Strategy 2: Dependency Graph Parallelization 🔬 ADVANCED

**Approach**: Build explicit dependency graph to find truly independent identifiers that can be parallelized even across different scope levels.

**Key Insight**: Two identifiers can be renamed in parallel if:
1. Neither references the other
2. Neither's context includes the other

**Algorithm**:
```typescript
// Build dependency graph
const graph = buildDependencyGraph(scopes) // See parallelization-analysis.md

// Topological sort into batches
const batches = topologicalBatching(graph)

for (const batch of batches) {
  // All identifiers in batch are independent
  const contexts = batch.map(node => scopeToString(node.path, contextWindowSize))
  const newNames = await Promise.all(
    batch.map((node, i) => visitor(node.name, contexts[i]))
  )

  // Apply all renames in batch
  for (let i = 0; i < batch.length; i++) {
    applyRename(batch[i], newNames[i])
  }
}
```

**Pros**:
- ✅ Maximum safe parallelism (optimal batching)
- ✅ Preserves quality (respects dependencies)
- ✅ Works for complex dependency graphs

**Cons**:
- ⚠️ High implementation complexity (graph algorithms)
- ⚠️ Risk of bugs in dependency detection
- ⚠️ Overhead of graph building
- ⚠️ May not provide much benefit over Strategy 1 in practice

**Expected Speedup**:
- Best case: 10-20x (many independent identifiers)
- Average case: 5-8x (better than scope-level batching)
- Worst case: 1x (highly interdependent code)

**Implementation complexity**: HIGH (1-2 weeks)

**Recommendation**: Only implement if Strategy 1 proves insufficient.

---

### Strategy 3: OpenAI Batch API Integration

**Approach**: Use OpenAI's Batch API for asynchronous processing.

**Note**: This is a different kind of optimization - optimized for cost/rate limits, not latency.

**Pros**:
- ✅ 50% cost reduction (OpenAI Batch API pricing)
- ✅ No rate limit concerns
- ✅ Good for very large files

**Cons**:
- ❌ Much higher latency (24h max turnaround)
- ❌ Only works with OpenAI (not Gemini/local)
- ❌ Requires polling/webhook infrastructure
- ❌ Poor UX for interactive use

**Recommendation**: NOT SUITABLE for this use case (interactive CLI tool).

---

### Strategy 4: Hybrid Approach (Future Enhancement)

Combine Strategy 1 (batch parallel) with smart batching:

1. **For OpenAI**: Explore using a single API call with multiple identifiers in the prompt
   - Use JSON array response format
   - Include all identifier contexts in one prompt
   - Trade-off: Less context per identifier, but only 1 round-trip

2. **Adaptive concurrency**: Start with high concurrency, back off on rate limit errors

**Implementation complexity**: HIGH (1-2 weeks)

---

## Recommended Implementation Plan (UPDATED)

### Phase 1: Scope-Level Batching (Strategy 1) - Week 1

#### Step 1.1: Add grouping by scope size

```typescript
// New helper function
function groupByScopeSize(scopes: NodePath<Identifier>[]): NodePath<Identifier>[][] {
  const groups = new Map<number, NodePath<Identifier>[]>()

  for (const scope of scopes) {
    const bindingBlock = closestSurroundingContextPath(scope).scope.block
    const size = bindingBlock.end! - bindingBlock.start!

    if (!groups.has(size)) {
      groups.set(size, [])
    }
    groups.get(size)!.push(scope)
  }

  // Return groups sorted by size (descending)
  return Array.from(groups.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([_, scopes]) => scopes)
}
```

#### Step 1.2: Implement level-by-level processing

```typescript
async function visitAllIdentifiers(
  code: string,
  visitor: Visitor,
  contextWindowSize: number,
  onProgress?: (percentageDone: number) => void,
  options?: {
    maxConcurrentRequests?: number  // NEW
  }
) {
  const ast = await parseAsync(code, { sourceType: "unambiguous" })
  if (!ast) throw new Error("Failed to parse code")

  const renames = new Set<string>()
  const visited = new Set<string>()

  // Group scopes by size
  const allScopes = await findScopes(ast)
  const scopeLevels = groupByScopeSize(allScopes)
  const totalScopes = allScopes.length

  let processedCount = 0

  // Process each level
  for (const level of scopeLevels) {
    // Filter already visited
    const toProcess = level.filter(scope => !hasVisited(scope, visited))

    if (toProcess.length === 0) continue

    // Extract contexts (AST in current state)
    const jobs = toProcess.map(scope => ({
      scope,
      name: scope.node.name,
      context: scopeToString(scope, contextWindowSize)
    }))

    // Parallel API calls with concurrency limit
    const maxConcurrent = options?.maxConcurrentRequests ?? 10
    const newNames = await parallelLimit(
      jobs.map(job => () => visitor(job.name, job.context)),
      maxConcurrent,
      (completed) => {
        onProgress?.((processedCount + completed) / totalScopes)
      }
    )

    // Sequential AST mutations
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]
      const newName = newNames[i]

      if (newName !== job.name) {
        let safeRenamed = toIdentifier(newName)
        while (renames.has(safeRenamed) || job.scope.scope.hasBinding(safeRenamed)) {
          safeRenamed = `_${safeRenamed}`
        }
        renames.add(safeRenamed)
        job.scope.scope.rename(job.name, safeRenamed)
      }

      markVisited(job.scope, newName, visited)
      processedCount++
    }
  }

  onProgress?.(1)

  const stringified = await transformFromAstAsync(ast)
  if (stringified?.code == null) throw new Error("Failed to stringify code")
  return stringified.code
}
```

#### Step 1.3: Implement concurrency limiter
Create utility function (or use library like `p-limit`):

```typescript
async function parallelLimit<T, R>(
  tasks: (() => Promise<R>)[],
  limit: number,
  onProgress?: (completed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = []
  let completed = 0

  const executeTask = async (task: () => Promise<R>, index: number) => {
    const result = await task()
    results[index] = result
    completed++
    onProgress?.(completed, tasks.length)
    return result
  }

  // Process in chunks of 'limit'
  for (let i = 0; i < tasks.length; i += limit) {
    const chunk = tasks.slice(i, i + limit)
    await Promise.all(chunk.map((task, idx) => executeTask(task, i + idx)))
  }

  return results
}
```

#### Step 1.4: Add configuration options
Update command files to expose concurrency option:

```typescript
// src/commands/openai.ts
.option(
  '--max-concurrent <number>',
  'Maximum concurrent API requests',
  '10'
)
```

#### Step 1.5: Update tests
All existing tests should pass without modification. Add new tests:

```typescript
// test/parallel-rename.test.ts
test("parallel renaming produces same results as sequential", async () => {
  const code = /* sample code with 20 identifiers */

  const sequential = await visitAllIdentifiers(code, visitor, 200, undefined, {
    maxConcurrentRequests: 1
  })

  const parallel = await visitAllIdentifiers(code, visitor, 200, undefined, {
    maxConcurrentRequests: 10
  })

  assert.equal(sequential, parallel)
})
```

### Phase 2: Optimization & Monitoring - Week 2

#### Step 2.1: Add telemetry
Track and log performance metrics:
- Total time
- Time spent in API calls
- Time spent in AST mutations
- Number of collisions
- Effective parallelism achieved

#### Step 2.2: Error handling improvements
- Retry failed API calls with exponential backoff
- Graceful degradation if rate limited (reduce concurrency)
- Detailed error messages with context

#### Step 2.3: Memory optimization
For very large files, consider streaming approach:
- Process in scope-level chunks
- Release contexts after API calls complete

#### Step 2.4: Progress reporting refinement
- Show concurrent requests in flight
- Estimate time remaining based on actual API latency
- Verbose mode: show which identifiers being processed

### Phase 3: Advanced Features - Week 3

#### Step 3.1: Provider-specific optimizations

**OpenAI**:
- Investigate multi-turn conversations (send multiple renames in one chat)
- Use `n` parameter to get multiple suggestions, pick best
- Cache frequently-seen patterns (e.g., common loop variables)

**Gemini**:
- Similar optimizations as OpenAI
- Tune `generationConfig` for speed

**Local LLM**:
- Multi-threaded inference (if node-llama-cpp supports)
- Batch processing at the model level

#### Step 3.2: Smart caching
```typescript
interface CacheEntry {
  context: string
  newName: string
  confidence: number
}

// Cache renames for identical contexts
const renameCache = new Map<string, CacheEntry>()

// Before API call:
const cacheKey = hash(name, context)
if (renameCache.has(cacheKey)) {
  return renameCache.get(cacheKey).newName
}
```

---

## Testing Strategy

### Unit Tests
1. ✅ All existing tests must pass (18 tests in visit-all-identifiers.test.ts)
2. New test: Parallel vs sequential equivalence
3. New test: Concurrency limiting works correctly
4. New test: Progress reporting accuracy
5. New test: Error handling (API failures, rate limits)

### Integration Tests
1. E2E test with real OpenAI API (small file, verify correctness)
2. E2E test with mock that simulates latency (verify speedup)
3. E2E test with large file (100+ identifiers, verify memory usage)

### Performance Benchmarks
Create benchmark suite:
```bash
npm run benchmark:sequential  # Baseline
npm run benchmark:parallel-5  # 5 concurrent
npm run benchmark:parallel-10 # 10 concurrent
npm run benchmark:parallel-20 # 20 concurrent
```

Track metrics:
- Total time
- Tokens used (should be identical)
- Memory peak
- API cost (should be identical)

---

## Risk Analysis & Mitigation

### Risk 1: API Rate Limits
**Impact**: HIGH - Could cause failures in production
**Probability**: MEDIUM - Depends on user's OpenAI tier

**Mitigation**:
- Default conservative concurrency (10)
- Automatic backoff on 429 errors
- Document rate limit tiers in README
- Add `--rate-limit <requests-per-minute>` flag

### Risk 2: Increased Memory Usage
**Impact**: MEDIUM - Could cause OOM on very large files
**Probability**: LOW - Most JS files < 1MB

**Mitigation**:
- Monitor memory in tests
- Add streaming mode for files > 10k identifiers
- Document memory requirements

### Risk 3: Harder to Debug
**Impact**: MEDIUM - Parallel execution harder to trace
**Probability**: HIGH - Inevitable with async code

**Mitigation**:
- Enhanced verbose logging (request ID tracking)
- Deterministic ordering in test mode
- Replay capability (save API requests/responses)

### Risk 4: Breaking Changes
**Impact**: HIGH - Could break existing workflows
**Probability**: LOW - With proper testing

**Mitigation**:
- Feature flag: `--experimental-parallel` initially
- Extensive testing before making default
- Semantic versioning (minor bump, not patch)

### Risk 5: Non-deterministic Output
**Impact**: MEDIUM - Could confuse users if results vary
**Probability**: LOW - LLMs already non-deterministic

**Mitigation**:
- Document that parallelization doesn't affect determinism
- Collision resolution still deterministic
- Add test that verifies collision handling is stable

---

## Success Metrics

### Performance Targets
- ✅ 5-10x speedup on files with 50+ identifiers
- ✅ Linear scaling with concurrency (up to limit)
- ✅ No regression for small files (< 10 identifiers)

### Quality Targets
- ✅ 100% test pass rate
- ✅ Zero increase in rename quality issues
- ✅ Same token usage as sequential (no waste)

### Operational Targets
- ✅ No new user-facing errors (beyond existing API errors)
- ✅ Memory usage < 2x sequential baseline
- ✅ Clear documentation of new flags

---

## Implementation Timeline

### Week 1: Core Implementation
- Day 1-2: Refactor visitAllIdentifiers (Steps 1.1-1.3)
- Day 3: Add configuration options (Step 1.4)
- Day 4-5: Testing and bug fixes (Step 1.5)

### Week 2: Optimization
- Day 6-7: Telemetry and monitoring (Steps 2.1-2.2)
- Day 8: Memory optimization (Step 2.3)
- Day 9-10: Progress reporting and polish (Step 2.4)

### Week 3: Advanced Features
- Day 11-12: Provider-specific optimizations (Step 3.1)
- Day 13-14: Smart caching (Step 3.2)
- Day 15: Documentation and release prep

**Total Effort**: 15 days (~3 weeks) for complete implementation

---

## Alternative Considered: Do Nothing

**Argument**: Current implementation works, why change?

**Counter-argument**:
- User explicitly requested parallelization
- Real-world pain point (25s → 2.5s is meaningful)
- Technical debt: sequential processing is suboptimal design
- Competitive advantage: Faster tool = better UX

**Decision**: Proceed with implementation.

---

## Appendix A: Code Locations

Files to modify:
1. `src/plugins/local-llm-rename/visit-all-identifiers.ts` (core changes)
2. `src/commands/openai.ts` (add concurrency option)
3. `src/commands/gemini.ts` (add concurrency option)
4. `src/commands/local.ts` (add concurrency option)
5. `src/commands/default-args.ts` (new default constant)

Files to create:
1. `src/parallel-utils.ts` (concurrency limiter)
2. `src/plugins/local-llm-rename/visit-all-identifiers.parallel.test.ts` (new tests)

Documentation to update:
1. `README.md` (new flags, performance notes)
2. `CLAUDE.md` (architecture update)
3. `package.json` (new version)

---

## Appendix B: API Compatibility Matrix

| Provider | Supports Parallel Requests | Rate Limit Tier | Recommended Concurrency |
|----------|----------------------------|-----------------|-------------------------|
| OpenAI Free | ✅ Yes | 3 req/min | 1-2 |
| OpenAI Tier 1 | ✅ Yes | 500 req/min | 10 |
| OpenAI Tier 2+ | ✅ Yes | 5000+ req/min | 20 |
| Gemini Free | ✅ Yes | 15 req/min | 5 |
| Gemini Paid | ✅ Yes | 1500 req/min | 20 |
| Local LLM | ⚠️ Depends | N/A (local) | 1 (CPU) / 4 (GPU) |

---

## Conclusion

**Recommendation**: Implement Strategy 1 (Batch-Fetch Parallel) in Phase 1.

This approach provides:
- **Maximum benefit** (5-10x speedup)
- **Minimum risk** (preserves all correctness guarantees)
- **Reasonable effort** (1-2 weeks for production-ready implementation)
- **Future extensibility** (foundation for Strategy 4 enhancements)

The key insight is recognizing that API calls are independent and can be parallelized, while AST mutations must remain sequential. This separation of concerns allows us to achieve significant performance gains without compromising the correctness that the extensive test suite validates.
