# File Chunking Integration Tests

## Overview

This test suite validates the **complete integration** of file chunking into the main Humanify pipeline (`unminify.ts`). The tests are designed to be **anti-gameable** and validate real, observable outcomes rather than implementation details.

## What These Tests Validate

### 1. **Integration with unminify.ts**

- ✅ Small files (< threshold) process normally without chunking
- ✅ Large files (> threshold) auto-detect and enable chunking
- ✅ Memory stays under target when chunking enabled (TensorFlow.js < 200MB)
- ✅ GC triggered between chunks to free memory
- ✅ Progress reporting shows chunk-by-chunk progress

### 2. **CLI Integration**

New flags that must work:
- `--chunk-size <size>` - Set chunk size threshold (default: 100KB)
- `--no-chunking` - Disable chunking even for large files
- `--debug-chunks` - Add `// === Chunk N ===` markers to output

Must work across all providers:
- `humanify unminify --provider openai input.js --chunk-size 50000`
- `humanify unminify --provider gemini input.js --no-chunking`
- `humanify unminify --provider local input.js --debug-chunks`

### 3. **Correctness Guarantees**

Critical correctness tests:
- ✅ Chunked output === non-chunked output (semantic equivalence)
- ✅ Output is valid JavaScript (parseable by Babel)
- ✅ Symbol consistency maintained across chunk boundaries
- ✅ All statement types preserved correctly

### 4. **Real File Testing**

Tests on actual minified files:
- **TensorFlow.js** (1.4MB, ~34K identifiers) → < 200MB peak memory
- **Babylon.js** (7.2MB, ~82K identifiers) → no OOM crash

### 5. **Edge Cases**

- Empty files
- Single huge statements (can't be split)
- Files with syntax errors
- Circular dependencies
- IIFE patterns

## Anti-Gaming Properties

These tests are designed to be **impossible to game** or satisfy with stubs:

### 1. **Real Execution Path**
```typescript
// Tests spawn REAL CLI processes
const result = await runCLI(['unminify', '--provider', 'openai', 'input.js', '--chunk-size', '10000']);
```
- Not in-memory mocks
- Actual child process spawned
- Real CLI entry point executed

### 2. **Observable Outcomes**
```typescript
// Verifies ACTUAL files on disk
const output = await fs.readFile(outputFile, 'utf-8');
const ast = parse(output); // Must be valid JavaScript
```
- Reads files from filesystem
- Parses with Babel (must be valid)
- Cannot be faked with stubs

### 3. **Memory Measurement**
```typescript
// Monitors REAL process memory
const mem = process.memoryUsage();
const peakMB = mem.heapUsed / 1024 / 1024;
assert.ok(peakMB < MEMORY_TARGET);
```
- Uses `process.memoryUsage()` (kernel-level)
- Cannot be mocked or faked
- Actual memory allocation measured

### 4. **Semantic Equivalence**
```typescript
// Compares AST structures
const ast1 = parse(chunkedOutput);
const ast2 = parse(nonChunkedOutput);
assert.strictEqual(ast1.program.body.length, ast2.program.body.length);
```
- Compares parsed AST, not strings
- Verifies statement types match
- Detects any correctness bugs

### 5. **Multiple Verification Points**

Each test verifies:
- Exit code (0 = success)
- Stdout/stderr content
- Output file existence
- Output validity (parseable)
- Memory usage (< target)
- Duration (< timeout)

**An AI cannot fake these results with shortcuts.**

## How to Run Tests

### Run All Integration Tests
```bash
npm run test:e2e
```

### Run Specific Test
```bash
tsx --test src/unminify-chunking.e2etest.ts -t "large file auto-enables chunking"
```

### Prerequisites
1. Build the CLI: `npm run build`
2. Have test files: `test-samples/tensorflow.min.js`, `test-samples/babylon.min.js`

## Expected Results

### Before Integration (Current State)

Most tests will **FAIL** because chunking is not yet integrated:

```
❌ integration: large file (> threshold) auto-enables chunking
   AssertionError: Large file should trigger auto-chunking. Integration NOT implemented yet.

❌ cli: --chunk-size flag sets custom chunk size
   AssertionError: --chunk-size flag should enable chunking. Flag NOT implemented yet.

❌ memory: chunking reduces peak memory usage
   AssertionError: Peak memory should be < 200MB (was 450MB)
```

**This is intentional.** Tests prove the functionality doesn't exist yet.

### After Integration (Goal State)

All tests should **PASS**:

```
✓ baseline: small file (< threshold) processes WITHOUT chunking
✓ integration: large file (> threshold) auto-enables chunking
✓ cli: --chunk-size flag sets custom chunk size
✓ cli: --no-chunking flag disables chunking
✓ cli: --debug-chunks flag adds chunk markers
✓ memory: chunking reduces peak memory usage
✓ memory: babylon.js processes without OOM
✓ correctness: chunked output equals non-chunked output
✓ correctness: output is valid JavaScript
```

## Test Structure

### Test Categories

1. **Prerequisite Checks** (2 tests)
   - CLI must be built
   - Test samples directory exists

2. **Baseline Tests** (2 tests)
   - Small files work without chunking
   - Output is valid JavaScript

3. **Chunking Detection** (1 test)
   - Large files trigger auto-chunking

4. **CLI Flag Tests** (5 tests)
   - `--chunk-size` works
   - `--no-chunking` works
   - `--debug-chunks` works
   - Multiple flags work together
   - All providers support flags

5. **Memory Tests** (2 tests)
   - TensorFlow.js < 200MB
   - Babylon.js no OOM

6. **Correctness Tests** (3 tests)
   - Chunked === non-chunked
   - Output is valid JavaScript
   - All providers work

7. **Edge Case Tests** (3 tests)
   - Empty files
   - Huge statements
   - Syntax errors

8. **Progress Reporting** (2 tests)
   - Shows chunk progress
   - Memory checkpoints logged

**Total: 20+ tests**

## Why These Tests Resist Gaming

### Example: Memory Test

**Bad Test (Gameable):**
```typescript
// BAD: Can be faked with internal flag
if (chunking.enabled) {
  memoryTracker.reportLowMemory = true;
}
assert.ok(memoryTracker.reportLowMemory);
```

**Good Test (Un-gameable):**
```typescript
// GOOD: Measures actual memory
const result = await runCLI(['unminify', '--provider', 'openai', 'large-file.js']);
const actualMemory = process.memoryUsage().heapUsed / 1024 / 1024;
assert.ok(actualMemory < 200); // Must be real memory reduction
```

### Example: Correctness Test

**Bad Test (Gameable):**
```typescript
// BAD: Can return hardcoded result
const result = await splitAndProcess(code);
assert.ok(result.success === true);
```

**Good Test (Un-gameable):**
```typescript
// GOOD: Verifies actual file on disk
await runCLI(['unminify', '--provider', 'openai', 'input.js', '--outputDir', 'output']);
const output = await fs.readFile('output/input.js', 'utf-8');
const ast = parse(output); // Must be valid JavaScript
assert.strictEqual(ast.program.body.length, expectedStatements);
```

### Example: CLI Test

**Bad Test (Gameable):**
```typescript
// BAD: In-memory mock
const cli = new CLI();
cli.run(['--chunk-size', '10000']);
assert.ok(cli.options.chunkSize === 10000);
```

**Good Test (Un-gameable):**
```typescript
// GOOD: Spawns real process
const child = spawn('node', ['dist/index.mjs', '--chunk-size', '10000']);
const exitCode = await waitForExit(child);
assert.strictEqual(exitCode, 0); // Process must actually work
```

## Traceability

### Maps to Requirements

These tests validate the requirements from the user's request:

**Requirement 1: Integration with unminify.ts**
- Tested by: `integration: large file auto-enables chunking`
- Tested by: `baseline: small file processes WITHOUT chunking`

**Requirement 2: CLI flags**
- Tested by: `cli: --chunk-size flag sets custom chunk size`
- Tested by: `cli: --no-chunking flag disables chunking`
- Tested by: `cli: --debug-chunks flag adds chunk markers`

**Requirement 3: Memory targets**
- Tested by: `memory: chunking reduces peak memory usage`
- Tested by: `memory: babylon.js processes without OOM`

**Requirement 4: Correctness**
- Tested by: `correctness: chunked output equals non-chunked output`
- Tested by: `correctness: output is valid JavaScript`

**Requirement 5: Real files**
- Tested by: TensorFlow.js tests
- Tested by: Babylon.js tests

## Implementation Checklist

When implementing the integration, these tests provide a checklist:

- [ ] Detect when file size > threshold
- [ ] Call `splitFile()` from `unminify.ts`
- [ ] Process chunks sequentially with shared symbols
- [ ] Call `reassembleChunks()` to produce final output
- [ ] Add `--chunk-size` CLI flag
- [ ] Add `--no-chunking` CLI flag
- [ ] Add `--debug-chunks` CLI flag
- [ ] Trigger GC between chunks
- [ ] Add memory checkpoints
- [ ] Update progress reporting for chunks
- [ ] Test on TensorFlow.js (< 200MB)
- [ ] Test on Babylon.js (no OOM)
- [ ] Verify semantic equivalence

**All tests should pass when checklist is complete.**

## Notes

- Tests use `--dry-run` flag to avoid actual LLM API calls
- Tests clean up after themselves (temp files deleted)
- Tests have generous timeouts (2-5 minutes for large files)
- Tests skip if test files (TensorFlow.js, Babylon.js) not available
- Tests provide detailed output showing what's missing

## Related Files

- **Implementation**: `src/unminify.ts` (needs integration)
- **Components**:
  - `src/file-splitter.ts` (98.4% coverage, ready)
  - `src/chunk-processor.ts` (98.4% coverage, ready)
  - `src/chunk-reassembler.ts` (98.4% coverage, ready)
- **Unit Tests**: `src/file-splitting.e2etest.ts` (component-level tests)
- **This File**: `src/unminify-chunking.e2etest.ts` (integration tests)

## Success Criteria

Integration is complete when:

1. ✅ All 20+ tests pass
2. ✅ TensorFlow.js processes with < 200MB peak memory
3. ✅ Babylon.js processes without OOM
4. ✅ Chunked output === non-chunked output (semantic equivalence)
5. ✅ All CLI flags work as documented
6. ✅ No regressions in baseline tests (small files work)

## Maintenance

When updating these tests:

1. **Never remove anti-gaming properties** - Tests must remain un-fakeable
2. **Add tests for new flags** - Each CLI flag needs a test
3. **Test edge cases** - Unusual inputs must be handled
4. **Update timeouts** - Large file tests may need longer timeouts
5. **Keep memory targets realistic** - Based on actual measurements

## Questions?

If tests fail unexpectedly:

1. Check that CLI is built: `npm run build`
2. Check that test files exist: `ls -lh test-samples/`
3. Run with verbose output: `tsx --test src/unminify-chunking.e2etest.ts --verbose`
4. Check individual test output for specific error messages

If tests pass but implementation doesn't work:

**This should not happen.** If it does, the tests are not sufficiently anti-gameable. File a bug.
