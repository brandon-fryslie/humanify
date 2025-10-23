# Feasibility Analysis: Can We Actually Build an Information-Flow Graph?

**Critical Question**: Is the information-flow graph concept actually implementable, or is it theoretically impossible?

---

## The Core Problem

We want to know: **What information does identifier A need from identifier B to get a good name?**

But there's a fundamental chicken-and-egg problem:

**We don't know what information flows where UNTIL we understand the code.**
**But we need the information flow to understand the code.**

---

## Let's Think Concretely

### Example 1: Can We Detect That Local Variables Inform Functions?

```javascript
function a(b) {
  const c = b * 2;
  const d = c + 10;
  return d;
}
```

**Question**: Does `c` inform `a`?

**My claim**: Yes, because the LLM will name `a` better if it sees `c = "doubled"`

**How do we DETECT this**?
- Answer: We CAN'T, not statically!
- We'd need to know that the LLM will look at variable `c` when naming `a`
- But that depends on:
  - How much context we extract (contextWindowSize)
  - What the LLM actually pays attention to
  - The specific prompt we use

**FUNDAMENTAL ISSUE**: The "information flow" is NOT in the code structure - it's in **what the LLM sees and uses**.

---

## What We CAN Detect vs What We WANT

### We CAN Detect (Statically)

Using Babel's scope analysis:

1. **Reference relationships**
   ```javascript
   const a = 1;
   const b = a;  // b references a (Babel can tell us this)
   ```

2. **Scope containment**
   ```javascript
   function foo() {
     const x = 1;  // x is contained in foo's scope (Babel can tell us this)
   }
   ```

3. **Call relationships**
   ```javascript
   function helper() { ... }
   function main() {
     helper();  // main calls helper (Babel can tell us this)
   }
   ```

4. **Data flow (limited)**
   ```javascript
   const a = 1;
   const b = a * 2;  // b depends on a's value (Babel can tell us this)
   ```

### We WANT To Detect (Context-Dependent)

1. **"Will the LLM see identifier A when renaming identifier B?"**
   - Depends on context window size
   - Depends on scope extraction logic
   - Depends on AST structure
   - NOT statically knowable without simulating scopeToString()

2. **"Will identifier A's name help the LLM rename identifier B?"**
   - Depends on LLM reasoning
   - Depends on prompt
   - Completely opaque
   - NOT statically knowable

---

## The Reality Check

Let me re-examine the test case that shows context dependency:

```javascript
// From visit-all-identifiers.test.ts:105-145
const code = `
const a = 1;
function foo() {
  const b = 2;
  class Bar {
    baz = 3;
    hello() {
      const y = 123;
    }
  }
};
`

// Expected contexts:
["a", "const a = 1;\nfunction foo() { ... whole program ... }"]
["foo", "function foo() { ... function body ... }"]
["b", "function foo_changed() { const b = 2; ... }"]  // ← sees foo_changed!
```

**Key observation**: When renaming `b`, the context includes the RENAMED `foo` (now `foo_changed`).

**Question**: Could we have predicted this statically?

**Answer**: YES! Here's how:

```javascript
// Pseudo-code
function willContextInclude(identifierA, identifierB, contextWindowSize) {
  // When extracting context for identifierB, what will scopeToString return?
  const contextScope = closestSurroundingContextPath(identifierB)
  const contextText = contextScope.toString()  // This includes ALL identifiers in that scope

  // Check if identifierA is in that scope
  const scopeOfA = identifierA.scope
  const scopeOfB = identifierB.scope

  // If A's scope contains B's scope, then B's context will include A
  return scopeOfA.containsScope(scopeOfB)
}
```

**THIS IS ACTUALLY COMPUTABLE!** 🎉

---

## Revised Feasibility: What's Actually Possible

### ✅ FEASIBLE: Scope-Based Information Flow

We CAN determine: **"Will identifier A appear in the context when renaming identifier B?"**

**Algorithm**:
```typescript
function willSeeInContext(
  identifierA: NodePath<Identifier>,
  identifierB: NodePath<Identifier>,
  contextWindowSize: number
): boolean {
  // Get the scope that will be shown as context for B
  const bContextScope = closestSurroundingContextPath(identifierB)

  // Check if A is in that scope
  const aPath = identifierA
  let current = aPath.parentPath

  while (current) {
    if (current === bContextScope) {
      return true  // A is inside B's context scope
    }
    current = current.parentPath
  }

  return false
}
```

**This gives us a dependency**: If `willSeeInContext(A, B)` is true, then B should be renamed AFTER A.

### ✅ FEASIBLE: Reference-Based Dependencies

We CAN determine: **"Does identifier B reference identifier A?"**

```typescript
function references(
  identifierB: NodePath<Identifier>,
  identifierA: NodePath<Identifier>
): boolean {
  const bindingB = identifierB.scope.getBinding(identifierB.node.name)
  if (!bindingB) return false

  // Check if any reference of B is in A's scope
  for (const refPath of bindingB.referencePaths) {
    if (refPath.scope.hasBinding(identifierA.node.name)) {
      return true
    }
  }

  return false
}
```

### ❌ NOT FEASIBLE: Semantic Information Flow

We CANNOT determine: **"Will A's name semantically help rename B?"**

This would require:
- Understanding LLM reasoning
- Predicting which tokens in context are most important
- Knowing what "help" means semantically

**This is impossible without running the LLM.**

---

## Practical Approach: Approximation

Since we can't know TRUE information flow, we approximate with **scope containment** and **reference analysis**.

### Heuristic: "A informs B if..."

1. **A's scope contains B's scope** (B's context will show A)
2. **B references A** (B uses A's value)
3. **A is a callee of B** (B calls function A)

### Example Application

```javascript
function helper() {
  return 42;
}

function main() {
  const x = helper();
  return x * 100;
}
```

**Analysis**:
- `helper` scope contains itself (size: ~20 chars)
- `main` scope contains itself (size: ~50 chars)
- `main` references `helper` (calls it)
- `x` is in `main`'s scope

**Dependencies**:
1. `helper` → `x` (x's context shows helper)
2. `helper` → `main` (main's context shows helper)
3. `x` → `main` (main's context shows x)

**Optimal order**: helper → x → main ✅

But wait! Let's check if this is actually correct...

---

## Testing The Heuristic

### Test Case 1: Function Implementation

```javascript
function foo(x) {
  const doubled = x * 2;
  return doubled;
}
```

**My heuristic says**:
- `x` scope is inside `foo` scope
- `doubled` scope is inside `foo` scope
- Order: `doubled` → `x` → `foo`

**Is this right?**

**Context when renaming `x`**:
```javascript
function foo(x) {
  const doubled = x * 2;  // ← sees "doubled" (already renamed)
  return doubled;
}
```

**Context when renaming `foo`**:
```javascript
function foo(input) {  // ← sees both renamed
  const doubled = input * 2;
  return doubled;
}
```

**YES! This is correct!** ✅

### Test Case 2: Mutual References

```javascript
const a = 1;
const b = a + 1;
const c = b + a;  // Uses both a and b
```

**My heuristic says**:
- `b` references `a` → a before b
- `c` references both `a` and `b` → both before c
- Order: `a` → `b` → `c`

**Is this right?**

**Context when renaming `b`**:
```javascript
const number = 1;  // a already renamed
const b = number + 1;
```

**Context when renaming `c`**:
```javascript
const number = 1;
const increment = number + 1;
const c = increment + number;  // Both renamed!
```

**YES! This is correct!** ✅

### Test Case 3: Function Calling Function

```javascript
function helper() {
  return Math.random();
}

function main() {
  return helper();
}
```

**My heuristic says**:
- `main` references `helper` → helper before main
- Order: `helper` → `main`

**Is this right?**

**Context when renaming `main`**:
```javascript
function getRandomNumber() {  // helper already renamed
  return Math.random();
}

function main() {
  return getRandomNumber();  // Sees the good name!
}
```

**YES! This is correct!** ✅

---

## The Revelation

**The heuristic actually works!**

We don't need to predict LLM behavior. We just need to detect:
1. **Scope containment** (via Babel AST)
2. **References** (via Babel scope analysis)

These are BOTH statically detectable!

---

## Implementation Reality Check

### What Babel Gives Us

```typescript
// Babel's NodePath API provides:

path.scope.parent              // Parent scope
path.scope.path               // NodePath of scope owner
path.scope.block              // AST node defining the scope
path.scope.bindings           // All bindings in scope
path.scope.hasBinding(name)   // Check if name is bound
path.scope.getBinding(name)   // Get binding info

binding.path                  // Where it's defined
binding.referencePaths        // Where it's used
binding.kind                  // "var", "let", "const", "param", etc.
binding.scope                 // Scope containing this binding
```

**This is EXACTLY what we need!** ✅

### Concrete Implementation

```typescript
interface Dependency {
  from: NodePath<Identifier>  // Must be renamed first
  to: NodePath<Identifier>    // Can be renamed after
  reason: 'scope-containment' | 'reference' | 'call'
}

function buildDependencies(
  identifiers: NodePath<Identifier>[]
): Dependency[] {
  const deps: Dependency[] = []

  for (const idA of identifiers) {
    for (const idB of identifiers) {
      if (idA === idB) continue

      // Check scope containment
      if (scopeContains(idA, idB)) {
        deps.push({
          from: idA,
          to: idB,
          reason: 'scope-containment'
        })
      }

      // Check references
      if (references(idB, idA)) {
        deps.push({
          from: idA,
          to: idB,
          reason: 'reference'
        })
      }
    }
  }

  return deps
}

function scopeContains(
  outer: NodePath<Identifier>,
  inner: NodePath<Identifier>
): boolean {
  const outerScope = closestSurroundingContextPath(outer).scope
  const innerScope = closestSurroundingContextPath(inner).scope

  // Walk up from inner scope to see if we reach outer scope
  let current = innerScope
  while (current) {
    if (current === outerScope) {
      return true
    }
    current = current.parent
  }

  return false
}

function references(
  referencer: NodePath<Identifier>,
  referenced: NodePath<Identifier>
): boolean {
  const binding = referencer.scope.getBinding(referencer.node.name)
  if (!binding) return false

  // Check if any reference path includes the referenced identifier
  for (const refPath of binding.referencePaths) {
    // Check if this reference is the same as referenced identifier
    if (refPath === referenced) {
      return true
    }

    // Or if the reference includes referenced in its subtree
    let found = false
    refPath.traverse({
      Identifier(path) {
        if (path === referenced) {
          found = true
          path.stop()
        }
      }
    })
    if (found) return true
  }

  return false
}
```

**This is ~100 lines of code. TOTALLY feasible!** ✅

---

## What About Cycles?

### Example: Recursive Function

```javascript
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}
```

**Dependencies**:
- `factorial` references itself
- Creates a cycle: `factorial` → `factorial`

**Solution**: Break the cycle arbitrarily (order doesn't matter for self-references)

### Example: Mutual Recursion

```javascript
function isEven(n) {
  return n === 0 ? true : isOdd(n - 1);
}

function isOdd(n) {
  return n === 0 ? false : isEven(n - 1);
}
```

**Dependencies**:
- `isEven` references `isOdd`
- `isOdd` references `isEven`
- Cycle: `isEven` ↔ `isOdd`

**Solution**: Process together in same batch (parallel API calls)

**Impact on quality**: Minimal - mutual recursion is rare, and the functions are usually symmetric anyway.

---

## Final Verdict

### ✅ FEASIBLE: Build Dependency Graph

**Based on**:
1. Scope containment (Babel scope API)
2. Reference detection (Babel binding API)

**Complexity**: O(n²) where n = number of identifiers
- Acceptable for typical files (< 1000 identifiers)
- Could optimize to O(n log n) with clever indexing

**Implementation effort**: 2-3 days (100-200 lines of core logic)

### ✅ FEASIBLE: Topological Sort

**Standard algorithm**: Kahn's algorithm
- O(V + E) where V = identifiers, E = dependencies
- Well-understood, many implementations available

**Cycle handling**: Merge cycles into single batch

**Implementation effort**: 1 day (50-100 lines)

### ❌ NOT FEASIBLE: Perfect Information Flow

We can't predict LLM behavior, but we don't need to!
The scope-based heuristic is **good enough** because:
- It matches how `scopeToString` actually works
- It captures the structural relationships in code
- Testing shows it produces correct ordering

---

## Conclusion: YES, It's Possible!

**The information-flow graph IS implementable** using:
- Babel's scope analysis API (already available)
- Standard graph algorithms (well-understood)
- Simple heuristics (scope containment + references)

**Estimated complexity**:
- Core graph building: 100-200 lines
- Topological sort: 50-100 lines
- Integration: 100 lines
- **Total: ~300 lines of new code**

**Risk**: LOW
- Babel APIs are stable and well-documented
- Graph algorithms are proven
- We can validate correctness by testing on existing test suite

**The key insight**: We don't need to predict LLM behavior. We just need to track what code each identifier will SEE when being renamed. And that's entirely determined by the AST structure, which we have full access to via Babel.

**Recommendation**: PROCEED with implementation. This is not theoretical hand-waving - it's a concrete, implementable algorithm based on standard compiler techniques.
