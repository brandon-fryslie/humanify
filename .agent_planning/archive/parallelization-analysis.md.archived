# Parallelization Analysis: Context Dependencies

## Current Ordering Strategy

**Line 79**: `scopes.sort((a, b) => b[1] - a[1])`

Sorts by **scope size descending** (largest → smallest):
- Outer scopes before inner scopes
- Parent functions before child functions
- Global variables before function-local variables

### Example Order:
```javascript
const global = 1;           // 1. Renamed first (largest scope - whole program)
function outer() {          // 2. Renamed second (medium scope)
  const local = 2;          // 3. Renamed third (small scope)
  function inner() {        // 4. Renamed fourth (smallest scope)
    const x = local;
  }
}
```

## Dependency Graph Analysis

### Question: Can we parallelize identifiers at the same scope level?

Let's analyze different scenarios:

### Scenario 1: Independent Functions (Siblings)
```javascript
function foo() {          // Scope size: 50 chars
  const a = 1;
}

function bar() {          // Scope size: 50 chars
  const b = 2;
}
```

**Can parallelize?** ✅ YES
- Same scope size → processed in same "batch"
- No references to each other
- Context extraction shows neither function in the other's context

### Scenario 2: Function Calls Another Function
```javascript
function callee() {       // Scope size: 30 chars
  return 42;
}

function caller() {       // Scope size: 50 chars
  const x = callee();     // References callee!
}
```

**Current order**: `caller` → `callee` (larger scope first)

**Context for callee**:
- When we extract context for `callee`, it will show whatever `caller` was renamed to
- This HELPS the LLM: if `caller` is now `fetchUserData`, the LLM can see that `callee` is used in `fetchUserData()` context

**Can parallelize?** ❌ NO - quality would degrade
- If we rename them in parallel, `callee` wouldn't see `caller`'s new name
- LLM would have less context

### Scenario 3: Variables Referencing Each Other
```javascript
const firstName = "John";     // Scope size: program-wide
const lastName = "Doe";       // Scope size: program-wide
const fullName = firstName + " " + lastName;  // Scope size: program-wide
```

**Current order**: Processed sequentially (all same scope size, but ordered by position in AST traversal)

**Context for `lastName`**:
- Might see `firstName` already renamed to something like `userFirstName`
- Context for `fullName` might see both already renamed

**Can parallelize?** 🤔 MAYBE
- Same scope level
- But renaming quality MIGHT improve with sequential processing

### Scenario 4: Nested Scopes (Parent/Child)
```javascript
function parent(x) {          // Scope size: 100 chars
  const helper = (y) => {     // Scope size: 30 chars
    return x + y;
  };
  return helper(10);
}
```

**Current order**: `parent` → `x` (parent's param) → `helper` → `y` (helper's param)

**Can parallelize?** ❌ NO
- `helper` needs to see `parent`'s new name for context
- `y` needs to see `helper`'s new name

## Key Insight: Scope Levels Form Natural Batches

The current sorting creates "levels" based on scope size. We can:

1. Group identifiers by scope size
2. Within each level, further group by independence
3. Parallelize within independent groups

## Proposed: Topological Sorting by Reference Graph

### Algorithm:

```typescript
interface IdentifierNode {
  path: NodePath<Identifier>
  name: string
  scopeSize: number
  references: Set<string>  // Names this identifier references
  referencedBy: Set<string> // Names that reference this identifier
}

function buildDependencyGraph(scopes: NodePath<Identifier>[]): IdentifierNode[] {
  const nodes = scopes.map(scope => ({
    path: scope,
    name: scope.node.name,
    scopeSize: calculateScopeSize(scope),
    references: new Set<string>(),
    referencedBy: new Set<string>()
  }))

  // For each identifier, find what it references
  for (const node of nodes) {
    const binding = node.path.scope.getBinding(node.name)
    if (binding) {
      for (const refPath of binding.referencePaths) {
        // Check if this reference is inside another identifier's scope
        for (const otherNode of nodes) {
          if (isInside(refPath, otherNode.path)) {
            otherNode.references.add(node.name)
            node.referencedBy.add(otherNode.name)
          }
        }
      }
    }
  }

  return nodes
}

function findIndependentGroups(nodes: IdentifierNode[]): IdentifierNode[][] {
  // Group by scope size first (preserve outer→inner ordering)
  const levels = groupBy(nodes, n => n.scopeSize)

  const batches: IdentifierNode[][] = []

  for (const level of levels) {
    // Within a level, find independent sets
    const independent: IdentifierNode[][] = []
    const remaining = new Set(level)

    while (remaining.size > 0) {
      const batch: IdentifierNode[] = []
      const batchNames = new Set<string>()

      for (const node of remaining) {
        // Can add to batch if:
        // 1. Doesn't reference anything in batch
        // 2. Not referenced by anything in batch
        const hasConflict = Array.from(batchNames).some(name =>
          node.references.has(name) ||
          node.referencedBy.has(name)
        )

        if (!hasConflict) {
          batch.push(node)
          batchNames.add(node.name)
          remaining.delete(node)
        }
      }

      independent.push(batch)
    }

    batches.push(...independent)
  }

  return batches
}
```

### Example Application:

```javascript
// Input code
const PI = 3.14;              // A: refs=[], referencedBy=[B, C]
const radius = 5;             // B: refs=[], referencedBy=[C]
const area = PI * radius ** 2; // C: refs=[A, B], referencedBy=[]

function draw() {             // D: refs=[], referencedBy=[]
  console.log(area);
}

function animate() {          // E: refs=[], referencedBy=[]
  draw();
}
```

**Dependency Graph**:
```
A (PI) ────────┐
               ├──> C (area)
B (radius) ────┘

D (draw) ──> E (animate)
```

**Batches**:
1. **Batch 1** (scope size: program-wide): [A, B, D, E] - all independent
2. **Batch 2** (scope size: program-wide): [C] - depends on A, B

**Parallelization**:
- API calls for A, B, D, E → parallel (4x speedup)
- Apply renames sequentially: A → B → D → E
- Then API call for C
- Apply rename for C

## Refined Strategy: Hybrid Approach

### Phase 1: Build Dependency Graph
```typescript
const graph = buildDependencyGraph(scopes)
const batches = topologicalSort(graph) // Returns batches in dependency order
```

### Phase 2: Process Each Batch
```typescript
for (const batch of batches) {
  // Step 1: Parallel context extraction
  const contexts = await Promise.all(
    batch.map(node => scopeToString(node.path, contextWindowSize))
  )

  // Step 2: Parallel API calls
  const newNames = await Promise.all(
    batch.map((node, i) => visitor(node.name, contexts[i]))
  )

  // Step 3: Sequential AST mutations (within batch)
  for (let i = 0; i < batch.length; i++) {
    applyRename(batch[i], newNames[i])
  }
}
```

### Why This Works:

1. **Preserves dependency order**: Dependencies are in earlier batches
2. **Maximizes parallelism**: Independent identifiers processed together
3. **Maintains quality**: Context includes previously renamed identifiers
4. **Safe mutations**: AST mutations still sequential within and across batches

## Expected Speedup

For typical code:

### Pessimistic Case (Highly Interdependent):
```javascript
const a = 1;
const b = a;
const c = b;
const d = c;
// ... chain of dependencies
```

**Speedup**: ~1x (no parallelism possible)

### Average Case (Some Independence):
```javascript
// 10 independent functions, each with 5 local variables
function foo1() { const a=1, b=2, c=3, d=4, e=5; }
function foo2() { const a=1, b=2, c=3, d=4, e=5; }
// ... 8 more functions
```

**Without optimization**: 60 sequential API calls
**With optimization**:
- Batch 1: 10 functions in parallel
- Batch 2-6: 10 parallel batches of 5 variables each

**Speedup**: ~3-5x

### Best Case (Mostly Independent):
```javascript
// 50 utility functions that don't call each other
function util1() { ... }
function util2() { ... }
// ...
```

**Speedup**: ~10-50x (limited by concurrency cap)

## Implementation Complexity

### Complexity vs Current Plan:
- **Previous plan** (batch all, apply all): LOW complexity
- **This plan** (dependency graph): MEDIUM-HIGH complexity

### Additional Code Required:
1. Dependency graph builder (~100 lines)
2. Topological sort algorithm (~50 lines)
3. Reference tracking via Babel scope APIs (~50 lines)
4. Testing for correctness (~200 lines of tests)

### Risk:
- **High**: Bugs in dependency detection could cause incorrect renames
- **Medium**: Graph building adds overhead (but parallelism should offset)

## Decision Matrix

| Approach | Speedup | Complexity | Risk | Quality |
|----------|---------|------------|------|---------|
| Current (sequential) | 1x | - | None | ✅ |
| Batch all (naive) | 10-50x | Low | Medium | ⚠️ Context loss |
| Dependency graph | 3-10x | High | High | ✅ Preserved |

## Recommendation

**Two-phase rollout**:

### Phase 1: Same-Scope-Level Parallelization (Week 1-2)
- Group by scope size
- Parallelize within levels (simpler heuristic)
- Assume identifiers at same level are independent
- Test and measure quality impact

### Phase 2: Full Dependency Graph (Week 3-4)
- Build proper reference graph
- Topological batching
- Only if Phase 1 shows quality degradation

### Why Start Simple:
1. **Validate hypothesis**: Maybe same-level parallelism is "good enough"
2. **Faster to market**: Get 3-5x speedup quickly
3. **Learn from data**: Measure actual quality impact before investing in complex solution
4. **Lower risk**: Simpler code = fewer bugs

## Next Steps

1. ✅ Validate that scope-level batching is feasible
2. ⏳ Implement minimal viable parallelization (group by scope size)
3. ⏳ Run quality tests on real-world minified code
4. ⏳ Measure: speedup vs quality trade-off
5. ⏳ Decide: ship simple version or build dependency graph
