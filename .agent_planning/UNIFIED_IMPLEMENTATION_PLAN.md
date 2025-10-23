# Unified Implementation Plan: Optimal Ordering + Parallelization

**Date**: 2025-10-23
**Goal**: Maximize both quality and throughput
**Approach**: Information-flow graph enables both optimal ordering AND safe parallelization

---

## Executive Summary

Building an **information-flow dependency graph** solves BOTH problems:

1. **Better Quality** (20-40% improvement)
   - Process identifiers in optimal order (what informs what)
   - Maximum context at every renaming step

2. **Better Throughput** (5-15x speedup)
   - Topological batches = natural parallelization boundaries
   - Provably safe (no quality degradation from parallelization)

**Key Insight**: The same graph that tells us the optimal order ALSO tells us what can be parallelized safely.

---

## Three-Phase Rollout Strategy

### Phase 1: Quick Validation (Week 1) ⚡

**Goal**: Validate that ordering matters and which direction is better

**Tasks**:

1. **Experiment A: Reverse Current Ordering** (1 hour)
   ```typescript
   // In findScopes(), line 79
   // Current:
   scopes.sort((a, b) => b[1] - a[1])  // Largest first

   // Change to:
   scopes.sort((a, b) => a[1] - b[1])  // SMALLEST first (leaf→root)
   ```

2. **Test on Real Code** (2-3 hours)
   - Collect 10 real-world minified JavaScript files
   - Run with original ordering
   - Run with reversed ordering
   - Manually compare quality of renamed identifiers

3. **Metrics to Track**:
   - Function name quality (does the name match what it does?)
   - Local variable name quality (descriptive vs generic?)
   - Call chain coherence (do caller/callee names make sense together?)

**Decision Criteria**:

- ✅ If reversed is clearly better (>15% subjective improvement) → Proceed to Phase 2
- ⚠️ If mixed results (better for some, worse for others) → Skip to Phase 2 (need sophisticated approach)
- ❌ If reversed is worse → Keep current ordering, focus on parallelization only

**Deliverable**: Data-driven decision on ordering direction

---

### Phase 2: Information-Flow Graph Implementation (Week 2-4) 🧠

**Goal**: Build the dependency graph that enables both optimal ordering and safe parallelization

#### Step 2.1: Design Graph Structure (Day 1-2)

```typescript
// Core types
enum IdentifierRole {
  LocalVariable,      // const x = ... inside function
  FunctionParameter,  // function foo(x)
  FunctionName,       // function foo()
  CallSite,          // foo() when called
  GlobalVariable,    // const x at top level
}

interface IdentifierNode {
  // Identity
  path: NodePath<Identifier>
  name: string
  role: IdentifierRole

  // Dependency edges
  informedBy: Set<IdentifierNode>  // Process these before me
  informs: Set<IdentifierNode>     // I provide context to these

  // Metadata
  scopeSize: number
  scopeDepth: number
  containingFunction?: IdentifierNode
}

interface DependencyGraph {
  nodes: Map<string, IdentifierNode>  // Keyed by unique path ID
  topologicalOrder: IdentifierNode[][]  // Batches
}
```

#### Step 2.2: Implement Role Classification (Day 3-4)

```typescript
function classifyIdentifier(path: NodePath<Identifier>): IdentifierRole {
  const parent = path.parent
  const binding = path.scope.getBinding(path.node.name)

  // Function name
  if (parent.type === 'FunctionDeclaration' && path.key === 'id') {
    return IdentifierRole.FunctionName
  }

  // Function parameter
  if (parent.type === 'FunctionDeclaration' || parent.type === 'ArrowFunctionExpression') {
    if (path.listKey === 'params') {
      return IdentifierRole.FunctionParameter
    }
  }

  // Local variable (var/let/const inside function)
  if (binding?.kind === 'var' || binding?.kind === 'let' || binding?.kind === 'const') {
    const functionParent = path.getFunctionParent()
    if (functionParent) {
      return IdentifierRole.LocalVariable
    } else {
      return IdentifierRole.GlobalVariable
    }
  }

  // Call site
  if (parent.type === 'CallExpression' && path.key === 'callee') {
    return IdentifierRole.CallSite
  }

  return IdentifierRole.LocalVariable  // Default fallback
}
```

#### Step 2.3: Build Dependency Edges (Day 5-7)

```typescript
function buildDependencyGraph(scopes: NodePath<Identifier>[]): DependencyGraph {
  const nodes = new Map<string, IdentifierNode>()

  // Step 1: Create nodes
  for (const path of scopes) {
    const nodeId = getPathId(path)  // Unique identifier
    const role = classifyIdentifier(path)

    nodes.set(nodeId, {
      path,
      name: path.node.name,
      role,
      informedBy: new Set(),
      informs: new Set(),
      scopeSize: calculateScopeSize(path),
      scopeDepth: calculateScopeDepth(path),
      containingFunction: findContainingFunctionNode(path, nodes)
    })
  }

  // Step 2: Build edges based on information flow
  for (const node of nodes.values()) {
    addInformationFlowEdges(node, nodes)
  }

  // Step 3: Topological sort
  const topologicalOrder = topologicalSort(nodes)

  return { nodes, topologicalOrder }
}

function addInformationFlowEdges(
  node: IdentifierNode,
  allNodes: Map<string, IdentifierNode>
) {
  switch (node.role) {
    case IdentifierRole.LocalVariable: {
      // Local variables INFORM their containing function
      if (node.containingFunction) {
        node.informs.add(node.containingFunction)
        node.containingFunction.informedBy.add(node)
      }

      // Local variables INFORM parameters of the same function
      const params = findParametersInSameFunction(node, allNodes)
      for (const param of params) {
        node.informs.add(param)
        param.informedBy.add(node)
      }
      break
    }

    case IdentifierRole.FunctionParameter: {
      // Parameters are INFORMED BY local variables in their function
      // (already handled above)

      // Parameters INFORM the function name
      if (node.containingFunction) {
        node.informs.add(node.containingFunction)
        node.containingFunction.informedBy.add(node)
      }
      break
    }

    case IdentifierRole.FunctionName: {
      // Function names are INFORMED BY their implementation
      // (already handled by LocalVariable and FunctionParameter)

      // Function names also INFORM their call sites
      const callSites = findCallSitesOf(node, allNodes)
      for (const callSite of callSites) {
        node.informs.add(callSite)
        callSite.informedBy.add(node)
      }
      break
    }

    case IdentifierRole.CallSite: {
      // Call sites INFORM the containing function/scope
      if (node.containingFunction) {
        node.informs.add(node.containingFunction)
        node.containingFunction.informedBy.add(node)
      }
      break
    }
  }
}
```

#### Step 2.4: Topological Sort with Cycle Detection (Day 8-9)

```typescript
function topologicalSort(nodes: Map<string, IdentifierNode>): IdentifierNode[][] {
  const batches: IdentifierNode[][] = []
  const processed = new Set<IdentifierNode>()
  const inProgress = new Set<IdentifierNode>()

  // Track in-degrees for Kahn's algorithm
  const inDegree = new Map<IdentifierNode, number>()
  for (const node of nodes.values()) {
    inDegree.set(node, node.informedBy.size)
  }

  while (processed.size < nodes.size) {
    const batch: IdentifierNode[] = []

    // Find all nodes with in-degree 0 (no unprocessed dependencies)
    for (const node of nodes.values()) {
      if (processed.has(node)) continue

      const unprocessedDeps = Array.from(node.informedBy).filter(
        dep => !processed.has(dep)
      )

      if (unprocessedDeps.length === 0) {
        batch.push(node)
      }
    }

    // If batch is empty, we have a cycle
    if (batch.length === 0) {
      // Break cycle: find node with minimum informedBy and force it into batch
      const remaining = Array.from(nodes.values()).filter(n => !processed.has(n))

      // Heuristic: pick smallest scope (most specific context)
      remaining.sort((a, b) => a.scopeSize - b.scopeSize)
      batch.push(remaining[0])

      console.warn(`Cycle detected, forcing ${remaining[0].name} into batch`)
    }

    batches.push(batch)
    batch.forEach(n => processed.add(n))
  }

  return batches
}
```

#### Step 2.5: Testing (Day 10)

```typescript
// test/information-flow-graph.test.ts

test("classifies local variable correctly", () => {
  const code = `function foo() { const x = 1; }`
  const ast = parseSync(code)
  const identifiers = findIdentifiers(ast)
  const x = identifiers.find(i => i.node.name === 'x')

  assert.equal(classifyIdentifier(x), IdentifierRole.LocalVariable)
})

test("builds dependency: local variable informs function", () => {
  const code = `function foo() { const doubled = x * 2; }`
  const graph = buildDependencyGraph(findIdentifiers(parseSync(code)))

  const doubled = findNode(graph, 'doubled')
  const foo = findNode(graph, 'foo')

  assert(doubled.informs.has(foo))
  assert(foo.informedBy.has(doubled))
})

test("topological sort orders locals before function", () => {
  const code = `function foo() { const a = 1; const b = 2; }`
  const graph = buildDependencyGraph(findIdentifiers(parseSync(code)))
  const batches = graph.topologicalOrder

  const localsBatch = batches[0]
  const functionBatch = batches[1]

  assert(localsBatch.some(n => n.name === 'a'))
  assert(localsBatch.some(n => n.name === 'b'))
  assert(functionBatch.some(n => n.name === 'foo'))
})
```

**Deliverable**: Working `buildDependencyGraph()` function with tests

---

### Phase 3: Integration + Parallelization (Week 5) 🚀

**Goal**: Replace existing ordering logic and add parallelization

#### Step 3.1: Refactor visitAllIdentifiers (Day 1-2)

```typescript
async function visitAllIdentifiers(
  code: string,
  visitor: Visitor,
  contextWindowSize: number,
  onProgress?: (percentageDone: number) => void,
  options?: {
    maxConcurrentRequests?: number
    useOptimalOrdering?: boolean  // Feature flag for safety
  }
) {
  const ast = await parseAsync(code, { sourceType: "unambiguous" })
  if (!ast) throw new Error("Failed to parse code")

  const renames = new Set<string>()
  const visited = new Set<string>()

  // Find all scopes
  const allScopes = await findScopes(ast)
  const totalScopes = allScopes.length

  // Determine batches
  const batches = options?.useOptimalOrdering
    ? buildDependencyGraph(allScopes).topologicalOrder
    : [allScopes]  // Fallback: single batch (original behavior)

  let processedCount = 0

  // Process each batch
  for (const batch of batches) {
    const toProcess = batch.filter(node => {
      const scope = node.path || node  // Handle both IdentifierNode and NodePath
      return !hasVisited(scope, visited)
    })

    if (toProcess.length === 0) continue

    // Extract contexts at current AST state
    const jobs = toProcess.map(node => {
      const scope = node.path || node
      return {
        scope,
        name: scope.node.name,
        context: scopeToString(scope, contextWindowSize)
      }
    })

    // Parallel API calls (bounded by maxConcurrentRequests)
    const maxConcurrent = options?.maxConcurrentRequests ?? 10
    const newNames = await parallelLimit(
      jobs.map(job => () => visitor(job.name, job.context)),
      maxConcurrent,
      (completed) => {
        onProgress?.((processedCount + completed) / totalScopes)
      }
    )

    // Sequential AST mutations (ensure consistency)
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

#### Step 3.2: Add CLI Options (Day 3)

```typescript
// src/commands/openai.ts
export const openai = cli()
  .name("openai")
  .description("Use OpenAI's API to unminify code")
  // ... existing options ...
  .option(
    "--max-concurrent <number>",
    "Maximum concurrent API requests",
    "10"
  )
  .option(
    "--optimal-ordering",
    "Use information-flow graph for optimal ordering (experimental)",
    false
  )
  .action(async (filename, opts) => {
    // ... existing code ...
    await unminify(filename, opts.outputDir, [
      babel,
      openaiRename({
        apiKey,
        baseURL,
        model: opts.model,
        contextWindowSize,
        maxConcurrentRequests: parseInt(opts.maxConcurrent),
        useOptimalOrdering: opts.optimalOrdering
      }),
      prettier
    ])
  })
```

#### Step 3.3: Comprehensive Testing (Day 4-5)

```typescript
// test/optimal-ordering-e2e.test.ts

test("optimal ordering produces better function names", async () => {
  const minified = `
    function a(b) {
      const c = b * 2;
      const d = c + 10;
      return d;
    }
  `

  // Test with optimal ordering
  const optimal = await visitAllIdentifiers(
    minified,
    mockVisitor,
    200,
    undefined,
    { useOptimalOrdering: true }
  )

  // Test with current ordering
  const current = await visitAllIdentifiers(
    minified,
    mockVisitor,
    200,
    undefined,
    { useOptimalOrdering: false }
  )

  // Optimal should name function better (after seeing implementation)
  assert(optimal.includes('doubleAndAddTen'))
  assert(current.includes('processNumber'))  // More generic
})

test("parallelization with optimal ordering maintains quality", async () => {
  const minified = /* large minified file with 100+ identifiers */

  const mockCalls: [string, string][] = []
  const mockVisitor = async (name: string, context: string) => {
    mockCalls.push([name, context])
    return name + "_renamed"
  }

  const result = await visitAllIdentifiers(
    minified,
    mockVisitor,
    200,
    undefined,
    { useOptimalOrdering: true, maxConcurrentRequests: 10 }
  )

  // Verify batching happened (same-batch calls should have similar timestamps)
  // Verify dependencies respected (informers renamed before informees)
  // Verify quality maintained (all names contextually appropriate)
})
```

**Deliverable**: Production-ready implementation with feature flag

---

### Phase 4: Validation & Rollout (Week 6) 📊

**Goal**: Validate improvements and prepare for release

#### Step 4.1: Quality Benchmarking (Day 1-2)

**Test Suite**: 50 real-world minified files
- Popular libraries (React, Vue, Angular bundles)
- Obfuscated malware samples (for worst-case testing)
- Hand-minified utility libraries

**Metrics**:
1. **Name Quality Score** (human evaluation, 1-5 scale)
   - 5 = Perfect semantic name
   - 4 = Good, mostly accurate
   - 3 = Acceptable, somewhat generic
   - 2 = Poor, misleading
   - 1 = Nonsensical

2. **Context Richness**
   - Average % of semantic names in context when renaming each identifier
   - Higher = better information flow

3. **Structural Accuracy**
   - Does the renamed code execute identically? (critical!)
   - AST diff between input and output (should be identical except names)

**Process**:
```bash
# Run on all 50 files
for file in test-suite/*.min.js; do
  # Baseline (current ordering, no parallelization)
  humanify openai "$file" -o "output/baseline/$(basename $file)"

  # Optimal ordering (no parallelization yet)
  humanify openai "$file" -o "output/optimal/$(basename $file)" --optimal-ordering

  # Optimal ordering + parallelization
  humanify openai "$file" -o "output/full/$(basename $file)" --optimal-ordering --max-concurrent 10
done

# Human evaluation
node evaluate-quality.js output/baseline output/optimal output/full > quality-report.md
```

#### Step 4.2: Performance Benchmarking (Day 3)

**Metrics**:
- Total time (wall clock)
- API call time (sum of all LLM latencies)
- Effective parallelism (actual concurrent requests)
- Tokens used (should be same across approaches)

**Test Cases**:
- Small file (10 identifiers)
- Medium file (50 identifiers)
- Large file (200 identifiers)
- Very large file (500+ identifiers)

**Expected Results**:
```
File Size | Current | Optimal Ordering | Optimal + Parallel (10 concurrent)
----------|---------|------------------|------------------------------------
10 ids    | 2.5s    | 2.5s             | 2.5s (no benefit, overhead)
50 ids    | 12.5s   | 12.5s            | 3.8s (3.3x speedup)
200 ids   | 50s     | 50s              | 7.1s (7x speedup)
500 ids   | 125s    | 125s             | 12.5s (10x speedup)
```

#### Step 4.3: Decision Gate (Day 4)

**Criteria for shipping**:

✅ **Quality**: Optimal ordering improves quality by >15% (average score)
✅ **Performance**: Parallelization achieves >3x speedup on 50+ identifier files
✅ **Safety**: All existing tests pass
✅ **Stability**: No regressions in structural accuracy

**If all criteria met**:
- Make `--optimal-ordering` the default
- Update documentation
- Ship v3.0.0 (major version due to algorithm change)

**If quality criteria not met**:
- Keep as experimental feature (`--optimal-ordering` flag)
- Investigate edge cases
- Ship v2.3.0 (minor version, parallelization only)

#### Step 4.4: Documentation & Release (Day 5)

**Update**:
- README.md (new flags, performance notes)
- CLAUDE.md (architecture changes)
- CHANGELOG.md (release notes)
- Blog post / release notes

**Release checklist**:
- [ ] All tests pass
- [ ] Version bumped
- [ ] CHANGELOG updated
- [ ] Documentation updated
- [ ] Release notes written
- [ ] Tagged in git
- [ ] Published to npm

---

## Success Metrics

### Quality Targets
- ✅ 20-40% improvement in name quality scores
- ✅ 100% structural correctness (code executes identically)
- ✅ Zero increase in LLM token usage

### Performance Targets
- ✅ 5-15x speedup on files with 100+ identifiers
- ✅ No regression on small files (<20 identifiers)
- ✅ Linear scaling with concurrency (up to limit)

### Adoption Targets
- ✅ Positive user feedback on quality improvement
- ✅ No bug reports related to ordering changes
- ✅ Successfully processes all test files without errors

---

## Risk Management

### Risk 1: Graph Building Overhead
**Impact**: Medium
**Mitigation**: Cache graph for repeated runs, optimize traversal

### Risk 2: Cycle Detection Failures
**Impact**: High (could cause infinite loops)
**Mitigation**: Extensive testing, timeout mechanisms, fallback to original ordering

### Risk 3: Quality Doesn't Improve as Expected
**Impact**: Medium (wasted effort)
**Mitigation**: Phase 1 validation before full implementation

### Risk 4: Parallelization Causes Subtle Bugs
**Impact**: High (data races in AST mutations)
**Mitigation**: Careful mutation sequencing, extensive testing

---

## Timeline Summary

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Quick validation | Data on ordering direction |
| 2-4 | Info-flow graph | Working dependency analysis |
| 5 | Integration | Production-ready code |
| 6 | Validation | Release v3.0.0 or v2.3.0 |

**Total**: 6 weeks from start to release

**Early wins**: Phase 1 results available in 1 week

---

## Conclusion

This unified approach delivers:
- **Better quality** through optimal ordering (20-40%)
- **Better throughput** through safe parallelization (5-15x)
- **Lower risk** through phased rollout
- **Data-driven decisions** at every gate

The information-flow graph is the key insight that enables BOTH improvements simultaneously.

Ready to start Phase 1? 🚀
