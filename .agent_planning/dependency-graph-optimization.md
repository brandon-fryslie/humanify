# Dependency Graph Optimization Plan

## Executive Summary

The dependency graph construction in `src/plugins/local-llm-rename/dependency-graph.ts` has O(n² × m × k) complexity, causing severe performance degradation on files with many identifiers. This document outlines a three-phase optimization plan targeting 10-100x performance improvements through caching, algorithmic improvements, and optional native code.

**Target Files:**
- `src/plugins/local-llm-rename/dependency-graph.ts` (primary)
- `src/plugins/local-llm-rename/visit-all-identifiers.ts` (integration)

**Expected Outcomes:**
- Phase 1: 10-50x improvement (caching + precomputation)
- Phase 2: Additional 2-10x improvement (sparse graphs, better algorithms)
- Phase 3: Additional 5-20x improvement (parallelization or native code)

---

## Problem Analysis

### Current Implementation Issues

**Location:** `buildDependencyGraph()` lines 23-47

```typescript
for (const idA of identifiers) {           // O(n)
  for (const idB of identifiers) {         // O(n)
    if (scopeContains(idA, idB)) {         // O(scope_depth)
      deps.push(...);
    }
    if (references(idB, idA)) {            // O(refs × AST_nodes) 💥
      deps.push(...);
    }
  }
}
```

**Complexity Breakdown:**
- Outer loop: n iterations
- Inner loop: n iterations
- `scopeContains()`: walks scope tree (O(depth), typically 5-20)
- `references()`:
  - Gets bindings: O(1)
  - Iterates reference paths: O(m) where m = avg refs per identifier
  - **CRITICAL:** Each refPath does `traverse()` - full AST walk! O(k) where k = AST nodes in expression

**Total:** O(n² × m × k)

**Example Scaling:**
- 100 identifiers: ~10,000 comparisons × ref checks = seconds
- 500 identifiers: ~250,000 comparisons × ref checks = minutes
- 1,000 identifiers: ~1,000,000 comparisons × ref checks = hours

### Bottleneck: `references()` Function

The `references()` function (lines 78-111) is the primary bottleneck:

```typescript
for (const refPath of binding.referencePaths) {
  let found = false;
  refPath.traverse({                    // 💥 EXPENSIVE!
    Identifier(path) {
      // Check every identifier in the reference expression
    }
  });
}
```

This traverse happens **for every pair** of identifiers being checked!

---

## Phase 1: Quick Wins (Estimated: 1-2 hours)

**Goal:** 10-50x improvement with minimal risk
**Effort:** Low
**Impact:** High

### 1.1 File-Based Caching

**Concept:** Cache dependency graph based on source code hash. Zero cost on cache hit.

**Implementation:**

```typescript
// src/plugins/local-llm-rename/dependency-cache.ts
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { NodePath } from '@babel/core';
import { Identifier } from '@babel/types';
import { Dependency } from './dependency-graph.js';

const CACHE_DIR = '.humanify-cache/dependencies';

interface CacheEntry {
  fileHash: string;
  identifierCount: number;
  identifierNames: string[];
  dependencies: SerializedDependency[];
  timestamp: number;
  version: string; // Cache format version
}

interface SerializedDependency {
  fromIndex: number;
  toIndex: number;
  reason: 'scope-containment' | 'reference';
}

export async function getCachedDependencies(
  code: string,
  identifiers: NodePath<Identifier>[]
): Promise<Dependency[] | null> {
  const hash = hashCode(code);
  const cachePath = getCachePath(hash);

  try {
    const cached: CacheEntry = JSON.parse(await fs.readFile(cachePath, 'utf-8'));

    // Validate cache
    if (cached.identifierCount !== identifiers.length) {
      console.log(`    → Cache invalid: identifier count mismatch`);
      return null;
    }

    // Verify identifier names match (structural validation)
    const currentNames = identifiers.map(id => id.node.name);
    if (!arraysEqual(cached.identifierNames, currentNames)) {
      console.log(`    → Cache invalid: identifier names changed`);
      return null;
    }

    console.log(`    → Cache HIT! Loaded ${cached.dependencies.length} dependencies`);

    // Deserialize: map indices back to NodePath objects
    return cached.dependencies.map(dep => ({
      from: identifiers[dep.fromIndex],
      to: identifiers[dep.toIndex],
      reason: dep.reason
    }));
  } catch (err) {
    // Cache miss or read error
    return null;
  }
}

export async function saveDependencyCache(
  code: string,
  identifiers: NodePath<Identifier>[],
  dependencies: Dependency[]
): Promise<void> {
  const hash = hashCode(code);
  const cachePath = getCachePath(hash);

  // Create cache directory
  await fs.mkdir(path.dirname(cachePath), { recursive: true });

  // Build index map
  const indexMap = new Map<NodePath<Identifier>, number>();
  identifiers.forEach((id, idx) => indexMap.set(id, idx));

  const cache: CacheEntry = {
    fileHash: hash,
    identifierCount: identifiers.length,
    identifierNames: identifiers.map(id => id.node.name),
    dependencies: dependencies.map(dep => ({
      fromIndex: indexMap.get(dep.from)!,
      toIndex: indexMap.get(dep.to)!,
      reason: dep.reason
    })),
    timestamp: Date.now(),
    version: '1.0'
  };

  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2));
  console.log(`    → Cached ${dependencies.length} dependencies`);
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function getCachePath(hash: string): string {
  return path.join(CACHE_DIR, `${hash}.json`);
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((val, idx) => val === b[idx]);
}
```

**Integration:**

```typescript
// src/plugins/local-llm-rename/dependency-graph.ts
import { getCachedDependencies, saveDependencyCache } from './dependency-cache.js';

export async function buildDependencyGraph(
  code: string, // NEW: pass original code for caching
  identifiers: NodePath<Identifier>[]
): Promise<Dependency[]> {
  // Try cache first
  const cached = await getCachedDependencies(code, identifiers);
  if (cached) return cached;

  console.log(`    → Cache MISS: building dependency graph...`);
  const startTime = Date.now();

  const deps: Dependency[] = [];
  // ... existing logic ...

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`    → Graph built in ${elapsed}s`);

  // Save to cache
  await saveDependencyCache(code, identifiers, deps);

  return deps;
}
```

**Benefits:**
- ✅ 100% speedup on cache hit (most development scenarios)
- ✅ Minimal code changes
- ✅ No algorithm changes - zero risk
- ✅ Can commit cache to repo for team sharing
- ✅ Auto-invalidates on code changes

**Gitignore Update:**

```gitignore
# Add to .gitignore (or commit for team caching)
.humanify-cache/
```

### 1.2 Add Timing Instrumentation

**Purpose:** Measure before/after improvements

```typescript
// src/plugins/local-llm-rename/dependency-graph.ts

export function buildDependencyGraph(
  identifiers: NodePath<Identifier>[]
): Dependency[] {
  const startTime = performance.now();
  console.log(`    → Building dependency graph for ${identifiers.length} identifiers...`);

  const deps: Dependency[] = [];

  // Scope containment phase
  const scopeStart = performance.now();
  let scopeChecks = 0;

  for (const idA of identifiers) {
    for (const idB of identifiers) {
      if (idA === idB) continue;
      scopeChecks++;
      if (scopeContains(idA, idB)) {
        deps.push({ from: idA, to: idB, reason: 'scope-containment' });
      }
    }
  }

  const scopeElapsed = ((performance.now() - scopeStart) / 1000).toFixed(2);
  console.log(`    → Scope containment: ${scopeChecks} checks in ${scopeElapsed}s`);

  // Reference phase
  const refStart = performance.now();
  let refChecks = 0;

  for (const idA of identifiers) {
    for (const idB of identifiers) {
      if (idA === idB) continue;
      refChecks++;
      if (references(idB, idA)) {
        deps.push({ from: idA, to: idB, reason: 'reference' });
      }
    }
  }

  const refElapsed = ((performance.now() - refStart) / 1000).toFixed(2);
  console.log(`    → References: ${refChecks} checks in ${refElapsed}s`);

  const totalElapsed = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`    → Total: ${deps.length} dependencies in ${totalElapsed}s`);

  return deps;
}
```

### 1.3 Precompute Scope Hierarchy

**Problem:** `scopeContains()` walks scope tree for every pair
**Solution:** Build scope hierarchy once, O(1) lookup

```typescript
// src/plugins/local-llm-rename/dependency-graph.ts

function buildScopeHierarchy(
  identifiers: NodePath<Identifier>[]
): Map<NodePath<Identifier>, Set<NodePath<Identifier>>> {
  const hierarchy = new Map<NodePath<Identifier>, Set<NodePath<Identifier>>>();

  console.log(`    → Precomputing scope hierarchy...`);
  const startTime = performance.now();

  // For each identifier, find all identifiers it contains
  for (const outer of identifiers) {
    const contained = new Set<NodePath<Identifier>>();
    const outerScope = closestSurroundingContextPath(outer).scope;

    for (const inner of identifiers) {
      if (outer === inner) continue;

      const innerScope = closestSurroundingContextPath(inner).scope;

      // Check if innerScope is descendant of outerScope
      let current = innerScope.parent;
      while (current) {
        if (current === outerScope) {
          contained.add(inner);
          break;
        }
        current = current.parent;
      }
    }

    hierarchy.set(outer, contained);
  }

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`    → Scope hierarchy built in ${elapsed}s`);

  return hierarchy;
}

export function buildDependencyGraph(
  identifiers: NodePath<Identifier>[]
): Dependency[] {
  const deps: Dependency[] = [];

  // Build scope hierarchy once
  const scopeHierarchy = buildScopeHierarchy(identifiers);

  // Scope containment: O(1) lookup instead of O(depth) walk
  for (const idA of identifiers) {
    const contained = scopeHierarchy.get(idA)!;
    for (const idB of contained) {
      deps.push({ from: idA, to: idB, reason: 'scope-containment' });
    }
  }

  // References (still slow, optimized in Phase 2)
  for (const idA of identifiers) {
    for (const idB of identifiers) {
      if (idA === idB) continue;
      if (references(idB, idA)) {
        deps.push({ from: idA, to: idB, reason: 'reference' });
      }
    }
  }

  return deps;
}
```

**Benefits:**
- ✅ Reduces scope checks from O(n² × depth) to O(n²)
- ✅ ~5-20x improvement on scope containment phase
- ✅ Low risk - same logic, just precomputed

---

## Phase 2: Major Optimizations (Estimated: 4-6 hours)

**Goal:** Additional 2-10x improvement
**Effort:** Medium
**Impact:** High

### 2.1 Precompute Reference Index

**Problem:** `references()` does expensive AST traversals for every pair
**Solution:** Build reference index once, O(1) lookup

```typescript
// src/plugins/local-llm-rename/dependency-graph.ts

interface ReferenceIndex {
  // For each identifier name, which other identifier names it references
  nameReferences: Map<string, Set<string>>;

  // For each identifier, its binding (for verification)
  bindings: Map<string, any>;
}

function buildReferenceIndex(
  identifiers: NodePath<Identifier>[]
): ReferenceIndex {
  console.log(`    → Precomputing reference index...`);
  const startTime = performance.now();

  const nameReferences = new Map<string, Set<string>>();
  const bindings = new Map<string, any>();

  for (const id of identifiers) {
    const binding = id.scope.getBinding(id.node.name);
    if (!binding) continue;

    bindings.set(id.node.name, binding);
    const referenced = new Set<string>();

    // Traverse ONCE per identifier (not per pair!)
    for (const refPath of binding.referencePaths) {
      refPath.traverse({
        Identifier(path) {
          const refBinding = path.scope.getBinding(path.node.name);
          if (refBinding) {
            referenced.add(path.node.name);
          }
        }
      });
    }

    nameReferences.set(id.node.name, referenced);
  }

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`    → Reference index built in ${elapsed}s`);

  return { nameReferences, bindings };
}

export function buildDependencyGraph(
  identifiers: NodePath<Identifier>[]
): Dependency[] {
  const deps: Dependency[] = [];

  // Precompute both hierarchies
  const scopeHierarchy = buildScopeHierarchy(identifiers);
  const refIndex = buildReferenceIndex(identifiers);

  // Scope containment: O(1) lookup
  for (const idA of identifiers) {
    const contained = scopeHierarchy.get(idA)!;
    for (const idB of contained) {
      deps.push({ from: idA, to: idB, reason: 'scope-containment' });
    }
  }

  // References: O(1) lookup instead of O(refs × AST_nodes)!
  for (const idA of identifiers) {
    for (const idB of identifiers) {
      if (idA === idB) continue;

      // Check if idB references idA
      const idBRefs = refIndex.nameReferences.get(idB.node.name);
      if (idBRefs?.has(idA.node.name)) {
        // Verify bindings match (same identifier, not just same name)
        const idABinding = refIndex.bindings.get(idA.node.name);
        const idBBinding = refIndex.bindings.get(idB.node.name);

        if (idABinding && idBBinding) {
          deps.push({ from: idA, to: idB, reason: 'reference' });
        }
      }
    }
  }

  return deps;
}
```

**Benefits:**
- ✅ Reduces from O(n² × m × k) to O(n × m × k + n²)
- ✅ ~10-100x improvement on reference phase
- ✅ Eliminates the primary bottleneck

### 2.2 Sparse Graph Construction

**Problem:** Many identifier pairs have no relationship
**Solution:** Only check likely dependencies

```typescript
function groupByScopeDepth(
  identifiers: NodePath<Identifier>[]
): Map<number, NodePath<Identifier>[]> {
  const groups = new Map<number, NodePath<Identifier>[]>();

  for (const id of identifiers) {
    let depth = 0;
    let scope = closestSurroundingContextPath(id).scope;

    while (scope.parent) {
      depth++;
      scope = scope.parent;
    }

    if (!groups.has(depth)) {
      groups.set(depth, []);
    }
    groups.get(depth)!.push(id);
  }

  return groups;
}

function buildDependencyGraphSparse(
  identifiers: NodePath<Identifier>[]
): Dependency[] {
  const deps: Dependency[] = [];
  const byDepth = groupByScopeDepth(identifiers);
  const maxDepth = Math.max(...byDepth.keys());

  console.log(`    → Using sparse graph (${byDepth.size} scope levels)`);

  // Only check scope containment between adjacent levels
  for (let depth = 0; depth < maxDepth; depth++) {
    const parents = byDepth.get(depth) || [];
    const children = byDepth.get(depth + 1) || [];

    // Much smaller search space!
    for (const parent of parents) {
      for (const child of children) {
        if (scopeContains(parent, child)) {
          deps.push({ from: parent, to: child, reason: 'scope-containment' });
        }
      }
    }
  }

  // References still need full check (but with index, it's fast)
  const refIndex = buildReferenceIndex(identifiers);
  for (const idA of identifiers) {
    for (const idB of identifiers) {
      if (idA === idB) continue;
      const idBRefs = refIndex.nameReferences.get(idB.node.name);
      if (idBRefs?.has(idA.node.name)) {
        deps.push({ from: idA, to: idB, reason: 'reference' });
      }
    }
  }

  return deps;
}
```

**Benefits:**
- ✅ Reduces scope checks from O(n²) to O(n × avg_children)
- ✅ 2-10x improvement for deeply nested code
- ✅ Optional - use heuristic to decide

### 2.3 Cache Serialization Format v2

**Enhancement:** Include precomputed indices in cache

```typescript
interface CacheEntryV2 {
  fileHash: string;
  identifierCount: number;
  identifierNames: string[];
  dependencies: SerializedDependency[];

  // NEW: Precomputed indices
  scopeHierarchy: [number, number[]][]; // [outerIdx, [innerIdx...]]
  referenceIndex: [number, number[]][]; // [fromIdx, [toIdx...]]

  timestamp: number;
  version: string;
}
```

**Benefit:** Even cache misses become faster (skip index building)

---

## Phase 3: Advanced Optimizations (Estimated: 8-16 hours)

**Goal:** Additional 5-20x improvement
**Effort:** High
**Impact:** Medium (diminishing returns)

**When to use:** Only if Phase 1+2 still shows >5 second build times

### Option A: Worker Thread Parallelization

**Challenge:** NodePath objects can't be serialized across workers
**Solution:** Serialize positions, reconstruct in worker

```typescript
// src/plugins/local-llm-rename/dependency-worker.ts
import { Worker } from 'worker_threads';
import { NodePath } from '@babel/core';
import { Identifier } from '@babel/types';

interface SerializedIdentifier {
  name: string;
  start: number;
  end: number;
  scopePath: number[]; // Path to scope in AST
}

async function buildDependencyGraphParallel(
  ast: any, // Full AST for reconstruction
  identifiers: NodePath<Identifier>[]
): Promise<Dependency[]> {
  const numWorkers = Math.min(8, os.cpus().length);
  const chunkSize = Math.ceil(identifiers.length / numWorkers);

  console.log(`    → Parallelizing across ${numWorkers} workers...`);

  // Serialize identifiers
  const serialized = identifiers.map(serializeIdentifier);

  const workers: Worker[] = [];
  const promises: Promise<Dependency[]>[] = [];

  for (let i = 0; i < numWorkers; i++) {
    const chunk = serialized.slice(i * chunkSize, (i + 1) * chunkSize);

    const worker = new Worker('./dependency-worker.js', {
      workerData: {
        ast,
        chunk,
        allIdentifiers: serialized
      }
    });

    workers.push(worker);
    promises.push(new Promise((resolve, reject) => {
      worker.on('message', resolve);
      worker.on('error', reject);
    }));
  }

  const results = await Promise.all(promises);
  workers.forEach(w => w.terminate());

  return results.flat();
}

function serializeIdentifier(id: NodePath<Identifier>): SerializedIdentifier {
  return {
    name: id.node.name,
    start: id.node.start!,
    end: id.node.end!,
    scopePath: getScopePath(id)
  };
}

function getScopePath(id: NodePath<Identifier>): number[] {
  const path: number[] = [];
  let scope = id.scope;

  while (scope) {
    // Encode scope position in AST
    path.push(scope.block.start!);
    scope = scope.parent;
  }

  return path;
}
```

**Benefits:**
- ✅ ~2-8x improvement (limited by serialization overhead)
- ✅ Scales with CPU cores
- ❌ Complex implementation
- ❌ Adds dependency on worker_threads

### Option B: Rust Native Module (Maximum Performance)

**Setup:**

```bash
npm install -D @napi-rs/cli
npm install @napi-rs/triples

# Initialize Rust module
npx napi new dependency-graph-native
```

**Implementation:**

```rust
// dependency-graph-native/src/lib.rs
#![deny(clippy::all)]

use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::collections::{HashMap, HashSet};

#[napi(object)]
pub struct ScopeInfo {
  pub id: u32,
  pub name: String,
  pub start: u32,
  pub end: u32,
  pub parent_id: Option<u32>,
}

#[napi(object)]
pub struct ReferenceInfo {
  pub from_id: u32,
  pub to_id: u32,
}

#[napi(object)]
pub struct Dependency {
  pub from_index: u32,
  pub to_index: u32,
  pub reason: String,
}

#[napi]
pub fn build_dependency_graph_native(
  scopes: Vec<ScopeInfo>,
  references: Vec<ReferenceInfo>,
) -> Vec<Dependency> {
  let mut deps = Vec::new();

  // Build scope hierarchy (ultra-fast with Rust)
  let hierarchy = build_scope_hierarchy(&scopes);

  // Add scope containment dependencies
  for (parent_id, children) in hierarchy {
    for child_id in children {
      deps.push(Dependency {
        from_index: parent_id,
        to_index: child_id,
        reason: "scope-containment".to_string(),
      });
    }
  }

  // Add reference dependencies
  for ref_info in references {
    deps.push(Dependency {
      from_index: ref_info.from_id,
      to_index: ref_info.to_id,
      reason: "reference".to_string(),
    });
  }

  deps
}

fn build_scope_hierarchy(scopes: &[ScopeInfo]) -> HashMap<u32, HashSet<u32>> {
  let mut hierarchy: HashMap<u32, HashSet<u32>> = HashMap::new();

  // Build parent-child map
  let mut parent_map: HashMap<u32, u32> = HashMap::new();
  for scope in scopes {
    if let Some(parent_id) = scope.parent_id {
      parent_map.insert(scope.id, parent_id);
    }
  }

  // For each scope, find all descendants
  for outer in scopes {
    let mut descendants = HashSet::new();

    for inner in scopes {
      if outer.id == inner.id {
        continue;
      }

      // Walk up from inner to see if we reach outer
      let mut current_id = inner.id;
      while let Some(parent_id) = parent_map.get(&current_id) {
        if *parent_id == outer.id {
          descendants.insert(inner.id);
          break;
        }
        current_id = *parent_id;
      }
    }

    if !descendants.is_empty() {
      hierarchy.insert(outer.id, descendants);
    }
  }

  hierarchy
}
```

**TypeScript Integration:**

```typescript
// src/plugins/local-llm-rename/dependency-graph.ts
import { buildDependencyGraphNative } from '../../dependency-graph-native';

export function buildDependencyGraph(
  identifiers: NodePath<Identifier>[]
): Dependency[] {
  // Try native implementation if available
  if (buildDependencyGraphNative) {
    console.log(`    → Using Rust native implementation`);
    return buildWithNative(identifiers);
  }

  // Fallback to JavaScript
  console.log(`    → Using JavaScript implementation`);
  return buildWithJavaScript(identifiers);
}

function buildWithNative(identifiers: NodePath<Identifier>[]): Dependency[] {
  // Prepare data for native module
  const scopes = identifiers.map((id, idx) => ({
    id: idx,
    name: id.node.name,
    start: id.node.start!,
    end: id.node.end!,
    parent_id: getScopeParentId(id, identifiers)
  }));

  const references = extractReferences(identifiers);

  // Call Rust
  const nativeDeps = buildDependencyGraphNative(scopes, references);

  // Convert back to Dependency objects
  return nativeDeps.map(dep => ({
    from: identifiers[dep.from_index],
    to: identifiers[dep.to_index],
    reason: dep.reason as 'scope-containment' | 'reference'
  }));
}
```

**Build Configuration:**

```json
{
  "scripts": {
    "build:native": "napi build --platform --release",
    "build:native:debug": "napi build --platform",
    "build": "npm run build:native && pkgroll",
    "build:js-only": "pkgroll"
  },
  "napi": {
    "name": "dependency-graph-native",
    "triples": {
      "defaults": true,
      "additional": [
        "x86_64-pc-windows-msvc",
        "x86_64-apple-darwin",
        "aarch64-apple-darwin",
        "x86_64-unknown-linux-gnu"
      ]
    }
  }
}
```

**Benefits:**
- ✅ 10-100x improvement on tight loops
- ✅ No GC pauses
- ✅ SIMD optimizations
- ✅ Better memory locality
- ✅ Graceful fallback to JS
- ❌ Complex build setup
- ❌ Need to maintain two implementations
- ❌ Cross-platform builds

---

## Implementation Checklist

### Phase 1 Tasks

- [ ] Create `.agent_planning/dependency-graph-optimization.md` (this document)
- [ ] Create `src/plugins/local-llm-rename/dependency-cache.ts`
  - [ ] Implement `getCachedDependencies()`
  - [ ] Implement `saveDependencyCache()`
  - [ ] Add cache directory handling
- [ ] Update `dependency-graph.ts`
  - [ ] Add timing instrumentation
  - [ ] Add cache integration
  - [ ] Implement `buildScopeHierarchy()`
  - [ ] Replace `scopeContains()` calls with hierarchy lookups
- [ ] Update `visit-all-identifiers.ts`
  - [ ] Pass original code to `buildDependencyGraph()`
- [ ] Add `.humanify-cache/` to `.gitignore`
- [ ] Test with small file (verify correctness)
- [ ] Test with large file (measure improvement)
- [ ] Write unit tests for cache serialization

### Phase 2 Tasks

- [ ] Implement `buildReferenceIndex()` in `dependency-graph.ts`
- [ ] Replace `references()` calls with index lookups
- [ ] Implement sparse graph option
  - [ ] Add `--dependency-mode sparse|full` flag
  - [ ] Implement `groupByScopeDepth()`
  - [ ] Implement `buildDependencyGraphSparse()`
- [ ] Update cache format to v2 (include indices)
- [ ] Add heuristic to auto-select sparse mode for large files
- [ ] Benchmark and compare sparse vs full
- [ ] Write tests for reference index

### Phase 3 Tasks (Optional)

#### If choosing Worker Threads:
- [ ] Create `dependency-worker.ts`
- [ ] Implement identifier serialization
- [ ] Implement AST reconstruction in worker
- [ ] Add worker pool management
- [ ] Handle worker errors/timeouts
- [ ] Add `--parallel` flag
- [ ] Test on multi-core systems
- [ ] Benchmark vs single-threaded

#### If choosing Rust:
- [ ] Initialize napi-rs project
- [ ] Implement Rust module
  - [ ] Scope hierarchy builder
  - [ ] Reference graph builder
  - [ ] Dependency merger
- [ ] Create TypeScript bindings
- [ ] Set up cross-platform builds
- [ ] Add fallback to JavaScript
- [ ] Test on all platforms
- [ ] Benchmark native vs JS

---

## Success Metrics

### Performance Targets

| Identifiers | Current Time | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|-------------|--------------|----------------|----------------|----------------|
| 100         | 2-5s         | 0.1-0.5s       | 0.05-0.2s      | 0.01-0.1s      |
| 500         | 30-120s      | 1-5s           | 0.5-2s         | 0.1-0.5s       |
| 1000        | 5-20min      | 5-20s          | 2-10s          | 0.5-2s         |

### Measurement Commands

```bash
# Before optimization
time npm start -- openai large-file.js --verbose

# After Phase 1
time npm start -- openai large-file.js --verbose
# Run again (cache hit)
time npm start -- openai large-file.js --verbose

# After Phase 2
time npm start -- openai large-file.js --verbose --dependency-mode sparse

# After Phase 3 (if implemented)
time npm start -- openai large-file.js --verbose --parallel
```

### Test Files

Create test files of various sizes:

```bash
# Generate test files
node scripts/generate-test-file.js 100   > test-samples/test-100.js
node scripts/generate-test-file.js 500   > test-samples/test-500.js
node scripts/generate-test-file.js 1000  > test-samples/test-1000.js
```

---

## Risks and Mitigation

### Risk: Cache Invalidation Bugs

**Mitigation:**
- Use structural validation (identifier names + count)
- Include version in cache format
- Add `--no-cache` flag for debugging
- Clear cache on version bumps

### Risk: Correctness Regression

**Mitigation:**
- Run full test suite after each phase
- Add dependency graph comparison tests
- Visual diff outputs before/after
- Test on multiple file types

### Risk: Platform-Specific Issues (Rust)

**Mitigation:**
- Maintain JavaScript fallback
- Test on CI for all platforms
- Use pre-built binaries for releases
- Optional dependency

### Risk: Memory Usage

**Mitigation:**
- Monitor with `--max-old-space-size`
- Add memory profiling
- Implement streaming for very large files
- Add `--low-memory` mode if needed

---

## Future Enhancements

### Incremental Updates

Instead of rebuilding entire graph, track changes:

```typescript
interface IncrementalCache {
  baseGraph: Dependency[];
  modifiedIdentifiers: Set<string>;

  // Only rebuild subgraph for modified identifiers
  incrementalUpdate(changes: IdentifierChange[]): Dependency[];
}
```

### Dependency Graph Visualization

Export graph for debugging:

```typescript
function exportGraphviz(deps: Dependency[]): string {
  let dot = 'digraph Dependencies {\n';
  for (const dep of deps) {
    const color = dep.reason === 'scope-containment' ? 'blue' : 'red';
    dot += `  "${dep.from.node.name}" -> "${dep.to.node.name}" [color=${color}];\n`;
  }
  dot += '}\n';
  return dot;
}
```

View with: `dot -Tpng graph.dot -o graph.png`

### Machine Learning Optimization

Learn which dependencies matter most for naming quality:

```typescript
// Train on high-quality renamed files
// Predict which dependencies to prioritize
// Skip low-value dependencies
```

---

## Conclusion

This three-phase plan provides a clear path from the current O(n² × m × k) complexity to near-linear performance:

1. **Phase 1** (Quick Wins): Caching + precomputation = 10-50x improvement
2. **Phase 2** (Major Opt): Index building = additional 2-10x improvement
3. **Phase 3** (Advanced): Parallelization or native code = additional 5-20x improvement

**Recommended approach:** Implement Phase 1 immediately, evaluate Phase 2 based on results, only pursue Phase 3 if still seeing multi-second builds after Phase 2.

Total expected improvement: **20-500x faster** depending on file size and phases implemented.