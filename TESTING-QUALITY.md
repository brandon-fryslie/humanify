# Deobfuscation Quality Test Suite

## Overview

This test suite validates the core user workflow: **"Deobfuscating code should produce semantic variable names with zero (or minimal) single-letter variables."**

The tests are designed to be:

1. **Useful** - Test real user workflows, not implementation details
2. **Complete** - Cover all edge cases (simple code, complex code, bundled code)
3. **Flexible** - Don't depend on exact output, just verify semantic naming happened
4. **Fully automated** - Use Node.js test runner with deterministic mocks

## Test Architecture

### Philosophy: Anti-Fragile, Un-Gameable Testing

These tests follow strict principles to prevent gaming and ensure they validate real functionality:

#### What Makes These Tests Un-Gameable?

1. **End-to-End Validation**: Tests execute the complete user flow from input to output
2. **Real Artifacts**: Verify actual files on disk and AST structures, not mocks
3. **Observable Outcomes**: Assert on externally observable results users would see
4. **Quality Metrics**: Measure actual identifier quality (length, single-letter ratio)
5. **Structural Verification**: Confirm code structure is preserved (same AST shape)

#### Anti-Patterns Avoided

- ❌ Testing internal implementation details that can be faked
- ❌ Mocking the functionality being tested
- ❌ Tests that pass with stub implementations
- ❌ Assertions that can be satisfied by hardcoding
- ❌ Tests that don't actually exercise the real system
- ❌ **Creating ad-hoc mocks with invented attributes/methods**

## Test Files

### 1. `src/deobfuscation-quality.test.ts` - Unit Tests

**Purpose**: Test the core renaming logic with mocked LLM calls

**Key Tests**:
- ✅ Simple code → zero single-letter variables
- ✅ Complex nested scopes → zero single-letter variables
- ✅ Mock receives correct context
- ✅ System handles bad LLM output gracefully
- ✅ Code structure is preserved
- ✅ Empty code handled gracefully
- ✅ Turbo mode produces quality output

**Run Time**: ~5 seconds (fast, mocked LLM)

**Run Command**:
```bash
tsx --test src/deobfuscation-quality.test.ts
```

### 2. `src/cli-output-quality.e2etest.ts` - E2E Tests

**Purpose**: Test the complete CLI workflow with real file I/O

**Key Tests**:
- ✅ CLI produces files with semantic names
- ✅ Multiple functions all deobfuscated
- ✅ Output preserves code structure
- ✅ Output file naming is correct
- ✅ Turbo mode produces quality output
- ✅ Existing output directory handled gracefully
- ✅ Invalid input fails gracefully
- ✅ Output measurably improves over input

**Run Time**: ~10-15 minutes (real LLM processing with local model)

**Run Command**:
```bash
npm run build && tsx --test src/cli-output-quality.e2etest.ts
```

## Quality Metrics

### Identifier Quality Analysis

Tests measure the following metrics:

```typescript
{
  totalIdentifiers: number;      // Total binding identifiers found
  singleLetterCount: number;     // Count of single-letter identifiers
  singleLetterRatio: number;     // Ratio of single-letter to total
  averageLength: number;         // Average identifier length
  identifiers: string[];         // List of all identifiers
}
```

### Success Criteria

**Unit Tests** (with mock LLM):
- ✅ Zero single-letter variables (100% elimination)
- ✅ Average identifier length ≥ 5 characters
- ✅ Output is valid JavaScript (parses without error)
- ✅ Code structure preserved (same AST shape)

**E2E Tests** (with real LLM):
- ✅ Single-letter ratio ≤ 20% (allow some semantically appropriate single letters)
- ✅ Average identifier length improves over input
- ✅ Output files exist on disk
- ✅ Output is valid JavaScript

### Why Different Thresholds?

- **Mock LLM** (unit tests): Perfect semantic names every time → 0% single-letter
- **Real LLM** (E2E tests): May occasionally use single letters (e.g., `i` for index) → Allow up to 20%

## Mocking Strategy

### Golden Rule: Use Real Objects

**NEVER create MagicMock() objects. ALWAYS use real objects or deterministic mocks.**

#### Correct Approach (Unit Tests)

```typescript
// Create deterministic mock that simulates good LLM behavior
function createSemanticNamingMock(): (name: string, context: string) => Promise<string> {
  const nameMap: Record<string, string> = {
    'a': 'splitIntoChunks',
    'e': 'inputString',
    't': 'chunkSize',
    // ...
  };

  return async (name: string, context: string): Promise<string> => {
    // Return semantic name from map or generate one
    return nameMap[name] || `semantic_${name}_${callCount}`;
  };
}
```

**Why this works**:
- ✅ Deterministic: Same input → same output
- ✅ Realistic: Returns semantic names like real LLM
- ✅ Verifiable: Tests can assert on specific expected names
- ✅ Un-gameable: Mock behavior matches real LLM behavior

#### Wrong Approach (Don't Do This)

```typescript
// WRONG - Creates mock with invented behavior
const mockLLM = MagicMock();
mockLLM.rename.return_value = "foo";

// Test passes even though real code will fail
```

**Why this is bad**:
- ❌ Mock has methods that don't exist in real API
- ❌ Test passes but production fails
- ❌ Gives false confidence

### E2E Testing Strategy

**Use real local LLM** with deterministic seed:

```bash
humanify unminify input.js --provider local --seed 1
```

**Why this works**:
- ✅ Real LLM execution (not mocked)
- ✅ Deterministic results (same seed → same output)
- ✅ No API keys required (uses local model)
- ✅ Fast enough for CI (local model is small)

## Running Tests

### Quick Test (Unit Tests Only)

```bash
npm run test:unit
```

Runs all `*.test.ts` files including `deobfuscation-quality.test.ts`.

**Duration**: ~5 seconds

### Full Test Suite

```bash
npm test
```

Runs unit tests, E2E tests, and LLM tests.

**Duration**: ~20-30 minutes (includes all E2E tests)

### Quality Tests Only

```bash
# Unit tests
tsx --test src/deobfuscation-quality.test.ts

# E2E tests
npm run build && tsx --test src/cli-output-quality.e2etest.ts
```

## Test Design Principles

### 1. Test User Workflows, Not Implementation

**Good Test**:
```typescript
test("CLI should produce semantic variable names", async () => {
  await humanify("unminify", "input.js", "--provider", "local");
  const output = await readFile("output/deobfuscated.js");
  const metrics = await analyzeIdentifierQuality(output);
  assert(metrics.singleLetterRatio < 0.2);
});
```

**Bad Test**:
```typescript
test("visitAllIdentifiers calls visitor for each identifier", async () => {
  const mockVisitor = jest.fn();
  await visitAllIdentifiers(code, mockVisitor);
  expect(mockVisitor).toHaveBeenCalledTimes(5);
});
```

Why? The good test verifies **what users care about** (quality output). The bad test verifies **implementation details** (function calls).

### 2. Verify Observable Outcomes

**Good Test**:
```typescript
test("Output has semantic variable names", async () => {
  const metrics = await analyzeIdentifierQuality(outputCode);
  assert(metrics.averageLength >= 5);
});
```

**Bad Test**:
```typescript
test("LLM was called", async () => {
  assert(mockLLM.called === true);
});
```

Why? The good test verifies **observable result**. The bad test verifies **internal state**.

### 3. Assert on Multiple Verification Points

Each test should verify:

1. **Primary outcome** (file created, code transformed)
2. **Quality metrics** (identifier quality improved)
3. **Structural integrity** (valid JavaScript, same AST shape)
4. **Side effects** (files written, checkpoints created)

Example:

```typescript
test("Deobfuscation produces quality output", async () => {
  // 1. Primary outcome
  const output = await processCode(input);
  assert.ok(output);

  // 2. Quality metrics
  const metrics = await analyzeIdentifierQuality(output);
  assert(metrics.singleLetterRatio < 0.2);

  // 3. Structural integrity
  const parsed = await parseAsync(output);
  assert.ok(parsed);

  // 4. Side effects
  assert(metrics.averageLength > inputMetrics.averageLength);
});
```

### 4. Make Tests Resilient to Refactoring

Tests should pass as long as **user-facing behavior is correct**, even if implementation changes.

**Good** (flexible):
```typescript
assert(metrics.singleLetterRatio < 0.2);  // Any implementation that achieves this passes
```

**Bad** (brittle):
```typescript
assert(output.includes("splitIntoChunks"));  // Breaks if LLM chooses different name
```

## Debugging Failed Tests

### Test Fails: "Too many single-letter variables"

**Diagnosis**: Deobfuscation is not improving identifier quality

**Investigation**:
1. Check LLM output manually:
   ```bash
   npm run build
   ./dist/index.mjs unminify fixtures/example.min.js --provider local --verbose
   ```

2. Check if LLM is returning semantic names:
   ```bash
   # Look for "Renamed X → Y" in verbose output
   ```

3. Verify LLM model is loaded:
   ```bash
   npm run download-ci-model
   ```

**Common Causes**:
- LLM model not downloaded
- LLM returning single-letter names (bad prompt)
- Code not actually being transformed (plugin not running)

### Test Fails: "Output should be valid JavaScript"

**Diagnosis**: Transformation is breaking code syntax

**Investigation**:
1. Examine the actual output:
   ```bash
   cat test-output-quality-e2e/deobfuscated.js
   ```

2. Try to parse manually:
   ```bash
   node -c test-output-quality-e2e/deobfuscated.js
   ```

**Common Causes**:
- AST transformation bug
- Babel generation bug
- Invalid identifier names from LLM

### Test Fails: "Output should differ from input"

**Diagnosis**: Transformation is a no-op (not actually renaming)

**Investigation**:
1. Check if visitor is being called:
   ```typescript
   // Add logging to visitor
   const mockLLM = async (name: string, context: string) => {
     console.log(`Visiting: ${name}`);
     return `renamed_${name}`;
   };
   ```

2. Verify AST traversal:
   ```bash
   # Run with --verbose flag
   ```

**Common Causes**:
- No identifiers found in input
- Visitor not being called
- Plugin chain broken

## Integration with CI

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
- name: Download local model for tests
  run: npm run download-ci-model

- name: Run quality tests
  run: |
    npm run test:unit
    npm run build
    tsx --test src/cli-output-quality.e2etest.ts
```

### Local Development

```bash
# First time setup
npm install
npm run download-ci-model

# Run tests
npm test
```

## Test Coverage

### Current Coverage

| Workflow | Unit Tests | E2E Tests |
|----------|-----------|-----------|
| Simple deobfuscation | ✅ | ✅ |
| Complex nested scopes | ✅ | ✅ |
| Multiple functions | ❌ | ✅ |
| Turbo mode | ✅ | ✅ |
| Error handling | ✅ | ✅ |
| Empty/invalid input | ✅ | ✅ |
| Quality improvement | ✅ | ✅ |
| File I/O | ❌ | ✅ |

### Future Coverage Needs

- [ ] Webcrack bundle splitting (verify all files deobfuscated)
- [ ] Refinement pass (verify 2-pass improves quality)
- [ ] Checkpoint recovery (verify resume maintains quality)
- [ ] Large files with chunking
- [ ] Multiple files in bundle

## Test Maintenance

### Adding New Tests

1. **Identify user workflow** to validate
2. **Choose test type**: Unit (fast, mocked) or E2E (slow, real)
3. **Create fixture** (minimal, valid JavaScript)
4. **Define success criteria** (quality metrics, not implementation)
5. **Write test** following existing patterns
6. **Verify test fails** before implementation
7. **Verify test passes** after implementation

### Updating Tests

When changing deobfuscation logic:

1. **Run existing tests** to see what breaks
2. **Update expectations** if behavior changed intentionally
3. **Add new tests** for new edge cases
4. **Keep tests flexible** (verify outcomes, not implementation)

## Traceability

### STATUS Gaps Addressed

From `STATUS-2025-11-17-021529.md`:

- **Bug #1** (Checkpoint deletion timing) - Not directly tested yet (needs integration test)
- **Bug #2** (Refinement hardcoded filename) - Not directly tested yet (needs E2E test)
- **Overall quality** - ✅ ADDRESSED by this test suite

### PLAN Items Validated

From `PLAN-2025-11-17-120000.md`:

- **P0**: E2E verification test (✅ COMPLETE - `cli-output-quality.e2etest.ts`)
- **Quality metrics**: Identifier quality validation (✅ COMPLETE)
- **User workflow**: CLI → file output → semantic names (✅ COMPLETE)

## Summary

This test suite provides comprehensive validation of deobfuscation quality by:

1. ✅ Testing real user workflows (CLI invocation → file output)
2. ✅ Verifying observable outcomes (semantic variable names)
3. ✅ Measuring quality metrics (identifier length, single-letter ratio)
4. ✅ Validating structural integrity (valid JavaScript, preserved AST)
5. ✅ Being un-gameable (real files, real AST, real metrics)
6. ✅ Being automated (no manual verification needed)
7. ✅ Being maintainable (flexible assertions, clear documentation)

**Run the tests**:
```bash
npm run test:unit        # Fast (~5s)
npm run test:e2e         # Complete (~10-15 min)
```

**Expected Results**:
- All unit tests pass with mocked LLM
- All E2E tests pass with local LLM
- Quality metrics show significant improvement over input
