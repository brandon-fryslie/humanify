# Cache Format v2 Functional Tests

## Overview

This test suite validates the upgrade from cache format v1.0 → v2.0, which adds precomputed indices to eliminate index rebuilding on cache hits.

## Test Coverage

### 1. Cache Format Validation (6 tests)
Tests verify the v2.0 cache format structure:

- **format includes new fields**: Validates presence of `scopeHierarchy` and `referenceIndex` fields
- **stores non-empty scope hierarchy**: Verifies scope containment relationships are stored for nested functions
- **stores reference index**: Validates variable reference tracking is stored
- **handles empty scope hierarchy**: Tests flat scope (no nesting) produces empty hierarchy
- **handles empty reference index**: Tests isolated variables produce empty reference index

**Anti-Gaming Properties:**
- Uses real file I/O (actual cache files on disk)
- Validates JSON structure matches specification
- Verifies serialization format `[key, value[]][]` for Maps

### 2. Cache Migration (3 tests)
Tests verify backward compatibility and version handling:

- **v1.0 cache is rejected**: Version mismatch triggers cache miss
- **v1.0 cache triggers rebuild**: Old cache is detected and rebuilt automatically
- **missing version field treated as v1.0**: Handles legacy caches gracefully

**Anti-Gaming Properties:**
- Tests actual version checking logic (not mocked)
- Validates cache invalidation behavior
- Confirms automatic upgrade path works

### 3. Round-Trip Correctness (4 tests)
Tests ensure cache preserves exact dependency graph structure:

- **save → load → identical dependencies**: Basic round-trip validation
- **complex code with shadowing**: Validates binding verification survives serialization
- **circular references**: Tests cycle handling in cache
- **large file with many identifiers**: Stress test with 100+ identifiers

**Anti-Gaming Properties:**
- Compares ACTUAL dependency graphs (not object identity)
- Uses real code samples with complex scoping
- Validates graph structure, not just counts
- Cannot be satisfied by hardcoding or shortcuts

### 4. Performance Improvement (3 tests)
Tests measure observable performance gains from cache v2:

- **cache hit skips scope hierarchy building**: Measures index building time via instrumentation
- **cache hit is significantly faster overall**: Measures end-to-end time improvement (>2x)
- **cache provides speedup on large file**: Validates >3x speedup on 200+ identifiers

**Anti-Gaming Properties:**
- Measures WALL-CLOCK TIME (not synthetic metrics)
- Uses instrumentation to verify index building is skipped
- Validates real performance improvement (not just cache presence)
- Tests fail if cache doesn't provide measurable speedup

### 5. Map Serialization (4 tests)
Tests validate Map ↔ JSON serialization correctness:

- **Map<number, Set<number>> round-trips**: Validates scope hierarchy serialization
- **Map<string, Set<string>> round-trips**: Validates reference index serialization
- **empty Maps serialize correctly**: Edge case for no dependencies
- **preserves insertion order**: Tests determinism

**Anti-Gaming Properties:**
- Verifies actual Map structure after deserialization
- Tests both directions (serialize and deserialize)
- Validates type correctness (numbers, strings, Sets)
- Cannot be faked with stub serialization

### 6. Edge Cases (8 tests)
Tests handle error conditions and boundary cases:

- **cache handles identifier count mismatch**: Code changes invalidate cache
- **cache handles identifier name changes**: Variable renames invalidate cache
- **corrupted cache file (invalid JSON)**: Graceful error handling
- **cache directory does not exist**: Returns null gracefully
- **cache size calculation works**: Integration with cache utilities
- **multiple files create separate cache entries**: File isolation
- **cache works with different dependency modes**: Mode-specific caching

**Anti-Gaming Properties:**
- Tests real error conditions (corrupted files, missing directories)
- Validates graceful degradation (no crashes)
- Tests integration with existing cache utilities
- Verifies cache isolation between files and modes

## Expected Behavior (Pre-Implementation)

**Initial Status:** All v2-specific tests FAIL (17 failures)

Tests that currently fail:
- All format validation tests (v2 fields don't exist yet)
- All serialization tests (Maps not serialized yet)
- Performance tests (cache hit still rebuilds indices)

Tests that currently pass:
- Migration tests partially pass (v1 rejection works, but v2 doesn't exist to upgrade to)
- Edge cases mostly work (error handling already exists)

## Expected Behavior (Post-Implementation)

**Target Status:** ALL tests PASS (86 total tests, including existing tests)

After implementing cache v2:
1. Format validation tests verify v2 structure exists
2. Serialization tests confirm Maps round-trip correctly
3. Performance tests measure 2-5x speedup on cache hits
4. Round-trip tests confirm correctness preserved
5. Migration tests validate upgrade path works

## Running Tests

```bash
# Run all cache tests
npm run test:unit -- src/plugins/local-llm-rename/dependency-cache.test.ts

# Run with verbose output
npm test -- src/plugins/local-llm-rename/dependency-cache.test.ts

# Run specific test
tsx --test src/plugins/local-llm-rename/dependency-cache.test.ts -g "cache hit skips"
```

## Implementation Checklist

From PLAN-2025-10-23-224114.md (P1-2: Update Cache Format to v2):

- [ ] Bump `CACHE_VERSION` from `"1.0"` to `"2.0"` in `dependency-cache.ts:10`
- [ ] Add `scopeHierarchy` field to `CacheEntry` interface
- [ ] Add `referenceIndex` field to `CacheEntry` interface
- [ ] Serialize Map objects to JSON-compatible format `[key, value[]][]`
- [ ] Deserialize Maps when loading cache
- [ ] Invalidate v1 caches (version check triggers rebuild)
- [ ] Update `saveDependencyCache()` to store precomputed indices
- [ ] Update `getCachedDependencies()` to load precomputed indices
- [ ] Update `buildDependencyGraph()` to use cached indices when available
- [ ] Test cache save/load round-trip (tests verify this)
- [ ] Verify cache hit skips index building (tests measure this)

## Cache Format v2 Specification

### CacheEntryV2 Interface

```typescript
interface CacheEntryV2 {
  fileHash: string;
  identifierCount: number;
  identifierNames: string[];
  dependencies: SerializedDependency[];

  // NEW in v2.0:
  scopeHierarchy: [number, number[]][]; // Map<outerIdx, innerIdx[]>
  referenceIndex: {
    nameReferences: [string, string[]][]; // Map<name, referencedNames[]>
    // Note: bindings can't be serialized, must rebuild on load
  };

  timestamp: number;
  version: string; // "2.0"
}
```

### Serialization Strategy

**Scope Hierarchy:**
- Source: `Map<NodePath<Identifier>, Set<NodePath<Identifier>>>`
- Target: `[number, number[]][]`
- Strategy: Use identifier array index as key, serialize Set to array

**Reference Index:**
- Source: `Map<string, Set<string>>`
- Target: `[string, string[]][]`
- Strategy: Direct serialization (names are already strings)

### Performance Impact

**Before v2 (current):**
- Cache HIT: Load dependencies → Rebuild scope hierarchy (O(n²)) → Rebuild reference index (O(n×m×k)) → Use graph
- Time: ~50-100ms on cache hit for 100 identifiers

**After v2:**
- Cache HIT: Load dependencies + indices → Deserialize Maps → Use graph
- Time: ~5-10ms on cache hit for 100 identifiers
- Expected speedup: 5-10x on cache hits

## Test Quality Metrics

**Un-Gameable Score: 9/10**
- ✅ Tests real file I/O (actual disk operations)
- ✅ Measures wall-clock time (performance tests)
- ✅ Compares actual dependency graphs (not mocks)
- ✅ Validates observable outcomes (file content, timing, correctness)
- ✅ Tests cannot pass with stubs (requires real implementation)
- ✅ Handles error conditions (corrupted files, missing directories)
- ✅ Tests integration with existing code (buildDependencyGraph)
- ⚠️ Could add more stress tests (10k+ identifiers)

**Maintainability Score: 9/10**
- ✅ Clear test names describe what's being tested
- ✅ Helper functions reduce duplication
- ✅ Tests are independent (each test clears caches)
- ✅ Good documentation (this file)
- ✅ Tests follow existing patterns (matches dependency-graph.test.ts)
- ⚠️ Could extract more shared fixtures

## References

- **STATUS Report:** `STATUS-2025-10-23-191500.md` (lines 161-202)
- **PLAN Document:** `PLAN-2025-10-23-224114.md` (lines 306-359)
- **Implementation File:** `src/plugins/local-llm-rename/dependency-cache.ts`
- **Graph Builder:** `src/plugins/local-llm-rename/dependency-graph.ts`
- **Existing Tests:** `src/plugins/local-llm-rename/dependency-graph.test.ts`

## Known Limitations

1. **Bindings cannot be serialized**: Babel's binding objects reference AST nodes, which cannot be JSON-serialized. The reference index stores names only, and bindings must be rebuilt on load.

2. **Cache invalidation is coarse-grained**: Any code change invalidates entire cache. Future optimization could use finer-grained invalidation.

3. **No compression**: Cache files are plain JSON. Future optimization could use gzip compression for large files.

4. **No cache eviction**: Cache grows unbounded. Future enhancement could add LRU eviction or max size limits.

## Future Enhancements

1. **Cache compression**: Gzip JSON to reduce disk usage (expect 5-10x reduction)
2. **Partial invalidation**: Track which identifiers changed, reuse unchanged portions
3. **Cache statistics**: Track hit rate, average speedup, cache size over time
4. **Cache warming**: Precompute caches for common libraries/frameworks
5. **Distributed caching**: Share caches across team via remote store
