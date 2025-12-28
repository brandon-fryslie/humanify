# IMPLEMENTATION PLAN: Fix Refinement Chaining Bug

**Date**: 2025-11-17 08:23:24
**Project**: HumanifyJS Deobfuscation Tool
**Focus**: Fix Refinement Pass to Use Pass 1 Output
**Priority**: P0 - CRITICAL BUG

---

## SOURCE DOCUMENTS

**Status Report**: `STATUS-2025-11-17-115400.md` (Section: Root Cause Analysis)
**Specification**: `PROJECT_SPEC.md` (Issue #3, line 8-10)
**Code Reference**: `src/commands/openai.ts` line 278
**Generation Time**: 2025-11-17 08:23:24

---

## EXECUTIVE SUMMARY

### Problem Statement

The refinement feature (`--refine` flag) is broken because it attempts to read from a hardcoded file path `${opts.outputDir}/deobfuscated.js` (line 278) that **does not exist**. Webcrack produces files with various names based on bundle structure:
- `bundle_1.js`, `bundle_2.js`, ... (webpack bundles)
- `index.js` (single entry point)
- Various other names depending on bundle structure

**Result**: Pass 2 (refinement) fails to find input file, cannot use Pass 1 output for iterative improvement.

### Root Cause

**File**: `src/commands/openai.ts`
**Line**: 278

```typescript
// ❌ WRONG: This file doesn't exist!
const pass1OutputFile = `${opts.outputDir}/deobfuscated.js`;
```

**Why this happens**:
1. Pass 1 runs `unminify()` which calls `webcrack()` (line 68 in `unminify.ts`)
2. Webcrack extracts bundles to various `.js` files in outputDir
3. `unminify()` processes each extracted file **in-place** (overwrites them)
4. No file named `deobfuscated.js` is ever created
5. Pass 2 tries to read non-existent `deobfuscated.js` → **FAILS**

### Success Criteria

- ✅ Refinement pass processes ALL files output by Pass 1
- ✅ Pass 2 skips webcrack (already unbundled)
- ✅ Console output clearly shows "Pass 2: Refining N files"
- ✅ Each file is processed independently in Pass 2
- ✅ Test coverage for refinement with multiple output files
- ✅ Backward compatibility maintained for single-file inputs

---

## IMPLEMENTATION PHASES

### PHASE 1: Add `skipWebcrack` Parameter to `unminify()`

**Goal**: Allow refinement pass to skip webcrack extraction

**Changes Required**:

#### 1.1 Update `UnminifyOptions` Interface

**File**: `src/unminify.ts`
**Lines**: 16-22

```typescript
export interface UnminifyOptions {
  chunkSize?: number;
  enableChunking?: boolean;  // Default: true
  debugChunks?: boolean;     // Default: false
  progressManager?: GlobalProgressManager;
  displayManager?: DisplayManager;
  skipWebcrack?: boolean;    // NEW: Skip webcrack extraction (default: false)
}
```

#### 1.2 Implement Skip Logic in `unminify()`

**File**: `src/unminify.ts`
**Lines**: 67-73 (current webcrack invocation)

**Current Code**:
```typescript
console.log(`[1/3] Running webcrack to extract bundles...`);
const extractedFiles = await instrumentation.measure(
  "webcrack",
  () => webcrack(bundledCode, outputDir),
  { inputSize: bundledCode.length }
);
console.log(`  → Extracted ${extractedFiles.length} file(s)\n`);
```

**New Code**:
```typescript
let extractedFiles: { path: string }[];

if (options.skipWebcrack) {
  // Refinement pass: file is already extracted, use as-is
  console.log(`[1/3] Skipping webcrack (already unbundled)...`);
  extractedFiles = [{ path: filename }];
  console.log(`  → Using 1 file directly\n`);
} else {
  // Initial pass: extract bundles with webcrack
  console.log(`[1/3] Running webcrack to extract bundles...`);
  extractedFiles = await instrumentation.measure(
    "webcrack",
    () => webcrack(bundledCode, outputDir),
    { inputSize: bundledCode.length }
  );
  console.log(`  → Extracted ${extractedFiles.length} file(s)\n`);
}
```

**Rationale**: This approach maintains backward compatibility. Default behavior unchanged (`skipWebcrack: false`). Refinement pass explicitly sets `skipWebcrack: true`.

---

### PHASE 2: Discover Actual Output Files from Pass 1

**Goal**: Identify all `.js` files in output directory after Pass 1 completes

**Changes Required**:

#### 2.1 Add File Discovery Helper

**File**: `src/commands/openai.ts`
**Location**: Add new function after imports (around line 40)

```typescript
import fs from "fs/promises";
import path from "path";

/**
 * Discover all .js files in output directory (excluding sourcemaps).
 * Used for refinement passes to find files produced by previous pass.
 */
async function discoverOutputFiles(outputDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(outputDir, { withFileTypes: true });
    const jsFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.map'))
      .map(entry => path.join(outputDir, entry.name))
      .sort(); // Deterministic ordering

    return jsFiles;
  } catch (error) {
    throw new Error(`Failed to discover output files in ${outputDir}: ${error}`);
  }
}
```

**Rationale**:
- Returns absolute paths for easy consumption
- Filters out `.js.map` sourcemap files
- Sorts for deterministic processing order
- Clear error message if directory doesn't exist

---

### PHASE 3: Process Each Discovered File in Refinement Pass

**Goal**: Replace hardcoded filename with actual file discovery

**Changes Required**:

#### 3.1 Replace Hardcoded Path with Discovery

**File**: `src/commands/openai.ts`
**Lines**: 272-309 (refinement block)

**Current Code** (line 278):
```typescript
// ❌ WRONG
const pass1OutputFile = `${opts.outputDir}/deobfuscated.js`;

await unminify(pass1OutputFile, opts.outputDir, [...plugins], {...options});
```

**New Code**:
```typescript
// Pass 2: Refinement (if enabled)
if (opts.refine) {
  displayManager.showIterationHeader(2, iterations);
  progressManager.startIteration(2);

  // Discover all files produced by Pass 1
  const pass1OutputFiles = await discoverOutputFiles(opts.outputDir);

  if (pass1OutputFiles.length === 0) {
    throw new Error(`No output files found in ${opts.outputDir} for refinement pass`);
  }

  console.log(`\n=== Pass 2: Refining ${pass1OutputFiles.length} file(s) ===\n`);

  // Process each file independently
  for (let i = 0; i < pass1OutputFiles.length; i++) {
    const file = pass1OutputFiles[i];
    const filename = path.basename(file);

    console.log(`[${i + 1}/${pass1OutputFiles.length}] Refining: ${filename}`);

    await unminify(file, opts.outputDir, [
      babel, // Re-run babel with better names from Pass 1
      openaiRename({
        apiKey,
        baseURL,
        model: opts.model,
        contextWindowSize,
        turbo: opts.turbo,
        maxConcurrent: maxConcurrent * 2, // 2x parallelism for Pass 2
        minBatchSize: parseInt(opts.minBatchSize, 10),
        maxBatchSize: parseInt(opts.maxBatchSize, 10),
        dependencyMode: "relaxed", // More aggressive parallelism in Pass 2
        checkpointMetadata: {
          originalFile: filename,
          originalProvider: "openai",
          originalModel: opts.model,
          originalArgs: opts,
          refinementPass: 2
        },
        progressManager,
        displayManager
      }),
      prettier
    ], {
      chunkSize: parseInt(opts.chunkSize, 10),
      enableChunking: opts.chunking !== false,
      debugChunks: opts.debugChunks,
      skipWebcrack: true, // ✅ CRITICAL: Skip webcrack in refinement!
      progressManager,
      displayManager
    });
  }

  console.log(`\n=== Pass 2 Complete ===\n`);
}
```

**Rationale**:
- Each file processed independently (no cross-file dependencies in current architecture)
- Clear progress indication: `[1/3] Refining: bundle_1.js`
- Explicit `skipWebcrack: true` prevents re-extracting already processed files
- Metadata includes `refinementPass: 2` for checkpoint tracking

---

### PHASE 4: Add Console Output for Refinement Progress

**Goal**: Clear visual distinction between Pass 1 and Pass 2

**Changes Required**:

#### 4.1 Enhance Display Output

**File**: `src/commands/openai.ts`
**Lines**: Throughout refinement block

**New Output Format**:

```
=== Pass 1: Initial Deobfuscation ===

[1/3] Running webcrack to extract bundles...
  ✓ Extraction complete [2.3s]
  → Extracted 3 file(s)

[2/3] Processing file 1/3: bundle_1.js
  → Processing 150 identifiers...
  ✓ Complete [45.2s]

[2/3] Processing file 2/3: bundle_2.js
  → Processing 87 identifiers...
  ✓ Complete [28.7s]

[2/3] Processing file 3/3: index.js
  → Processing 12 identifiers...
  ✓ Complete [5.1s]

=== Pass 1 Complete ===

=== Pass 2: Refining 3 file(s) ===

[1/3] Refining: bundle_1.js
  → Processing 150 identifiers...
  ✓ Complete [42.8s]

[2/3] Refining: bundle_2.js
  → Processing 87 identifiers...
  ✓ Complete [26.3s]

[3/3] Refining: index.js
  → Processing 12 identifiers...
  ✓ Complete [4.9s]

=== Pass 2 Complete ===

=== All Processing Complete ===
Total time: 154.3s
```

**Implementation**: Use existing `displayManager` and `progressManager`. Add pass headers with `console.log()` calls (already present at line 274).

---

### PHASE 5: Test with Real Webpack Bundle

**Goal**: Verify fix works with actual multi-file bundles

**Test Files Needed**:

#### 5.1 Create Test Input

**File**: `src/test/fixtures/webpack-multi-bundle.js`

Create a minimal webpack bundle that webcrack will split into 2+ files:

```javascript
// Simple webpack bundle structure
(function(modules) {
  function __webpack_require__(moduleId) {
    return modules[moduleId]();
  }
  return __webpack_require__(0);
})([
  function() { const x = 1; return x + 1; },
  function() { const y = 2; return y * 2; }
]);
```

**Expected webcrack output**:
- `bundle_0.js` - First module
- `bundle_1.js` - Second module

#### 5.2 Create E2E Test

**File**: `src/commands/openai-refinement.e2etest.ts` (NEW)

```typescript
import assert from "node:assert";
import test from "node:test";
import { humanify } from "../test-utils.js";
import fs from "fs/promises";
import path from "path";

test("refinement processes all webcrack output files", async () => {
  // Arrange: Create test bundle
  const fixture = path.join(__dirname, "test/fixtures/webpack-multi-bundle.js");
  const outputDir = "./test-output-refinement";

  // Act: Run with refinement
  await humanify("openai", "unminify", fixture,
    "--output-dir", outputDir,
    "--refine",
    "--turbo"
  );

  // Assert: Check both bundles were processed
  const outputFiles = await fs.readdir(outputDir);
  const jsFiles = outputFiles.filter(f => f.endsWith('.js'));

  assert.ok(jsFiles.length >= 2, `Expected 2+ output files, got ${jsFiles.length}`);

  // Verify files were actually modified (not empty)
  for (const file of jsFiles) {
    const content = await fs.readFile(path.join(outputDir, file), 'utf-8');
    assert.ok(content.length > 0, `Output file ${file} should not be empty`);
    // Optionally: Check for semantic variable names
    assert.ok(!content.includes('const x ='), `Should rename generic variable 'x'`);
  }

  // Cleanup
  await fs.rm(outputDir, { recursive: true, force: true });
});

test("refinement skips webcrack in pass 2", async () => {
  // This test verifies unminify() is called with skipWebcrack: true
  // Requires instrumentation/spy to verify option is passed
  // TODO: Implement once instrumentation is in place
});
```

#### 5.3 Create Unit Test for File Discovery

**File**: `src/commands/openai-helpers.test.ts` (NEW)

```typescript
import assert from "node:assert";
import test from "node:test";
import fs from "fs/promises";
import path from "path";
import { discoverOutputFiles } from "./openai.js"; // Export helper for testing

test("discoverOutputFiles: finds all .js files", async () => {
  const testDir = "./test-discovery";
  await fs.mkdir(testDir, { recursive: true });

  // Create test files
  await fs.writeFile(path.join(testDir, "bundle_1.js"), "code1");
  await fs.writeFile(path.join(testDir, "bundle_2.js"), "code2");
  await fs.writeFile(path.join(testDir, "index.js"), "code3");
  await fs.writeFile(path.join(testDir, "bundle_1.js.map"), "sourcemap"); // Should be excluded
  await fs.writeFile(path.join(testDir, "readme.txt"), "docs"); // Should be excluded

  const files = await discoverOutputFiles(testDir);

  assert.strictEqual(files.length, 3, "Should find exactly 3 .js files");
  assert.ok(files.every(f => f.endsWith('.js')), "All files should end with .js");
  assert.ok(files.every(f => !f.includes('.map')), "Should exclude sourcemap files");
  assert.ok(files.every(f => path.isAbsolute(f)), "Should return absolute paths");

  // Cleanup
  await fs.rm(testDir, { recursive: true });
});

test("discoverOutputFiles: throws on non-existent directory", async () => {
  await assert.rejects(
    discoverOutputFiles("./does-not-exist"),
    /Failed to discover output files/
  );
});

test("discoverOutputFiles: returns empty array for empty directory", async () => {
  const testDir = "./test-empty";
  await fs.mkdir(testDir, { recursive: true });

  const files = await discoverOutputFiles(testDir);

  assert.strictEqual(files.length, 0, "Should return empty array");

  await fs.rm(testDir, { recursive: true });
});
```

---

## TESTING STRATEGY

### Unit Tests (NEW)

**File**: `src/commands/openai-helpers.test.ts`
**Coverage**:
- ✅ File discovery with multiple .js files
- ✅ Sourcemap exclusion (`.js.map`)
- ✅ Non-existent directory error handling
- ✅ Empty directory handling
- ✅ Absolute path validation

**Estimated Time**: 30 minutes to write, 5 seconds to run

---

### E2E Tests (NEW)

**File**: `src/commands/openai-refinement.e2etest.ts`
**Coverage**:
- ✅ Refinement processes all webcrack output files
- ✅ Output files contain transformed code
- ✅ No empty output files
- ✅ Generic variable names are replaced

**Requirements**:
- Requires built package (`npm run build`)
- Requires OpenAI API key (can mock for CI)
- Runs sequentially (not parallel)

**Estimated Time**: 1 hour to write, 30-60 seconds to run (with real API)

---

### Manual Testing Steps

#### Step 1: Test with Simple Webpack Bundle

```bash
# Create test bundle (or use existing fixture)
echo '(function(modules){return modules[0]()})([function(){const x=1;return x+1}])' > test-bundle.js

# Run with refinement
humanify unminify --provider openai test-bundle.js --output-dir ./test-output --refine --verbose

# Expected output:
# === Pass 1: Initial Deobfuscation ===
# [1/3] Running webcrack...
#   → Extracted N file(s)
# [2/3] Processing file 1/N: bundle_X.js
# ...
# === Pass 1 Complete ===
#
# === Pass 2: Refining N file(s) ===
# [1/N] Refining: bundle_X.js
# ...
# === Pass 2 Complete ===

# Verify:
ls ./test-output  # Should show bundle_*.js files
cat ./test-output/bundle_0.js  # Should show deobfuscated code with semantic names
```

#### Step 2: Test with Real-World Bundle

```bash
# Use existing justfile recipe
just download-tensorflow
just test-tensorflow --refine

# Verify:
# - Pass 1 completes successfully
# - Pass 2 discovers correct number of files
# - No "file not found" errors
# - Output files exist and are non-empty
```

#### Step 3: Test Edge Cases

```bash
# Single file (no webcrack splitting)
echo 'const x = 1;' > single.js
humanify unminify --provider openai single.js --output-dir ./test-single --refine

# Verify:
# - Pass 1 processes single file
# - Pass 2 refines single file
# - No errors

# Empty output directory (error case)
mkdir empty-dir
humanify unminify --provider openai non-existent.js --output-dir ./empty-dir --refine

# Expected: Clear error message about no files found
```

---

## ACCEPTANCE CRITERIA

### Functional Requirements

- ✅ **FR1**: Refinement pass discovers ALL output files from Pass 1
- ✅ **FR2**: Refinement pass processes each file independently
- ✅ **FR3**: Refinement pass skips webcrack extraction
- ✅ **FR4**: Console output clearly shows Pass 2 progress
- ✅ **FR5**: Works with single-file outputs (no webcrack splitting)
- ✅ **FR6**: Works with multi-file outputs (webcrack produces 2+ bundles)
- ✅ **FR7**: Error message if output directory has no .js files

### Code Quality

- ✅ **CQ1**: No hardcoded filenames
- ✅ **CQ2**: Backward compatibility maintained (default behavior unchanged)
- ✅ **CQ3**: Clear error messages for failure cases
- ✅ **CQ4**: JSDoc comments on new functions
- ✅ **CQ5**: TypeScript types for all parameters
- ✅ **CQ6**: Existing tests continue to pass (223/232 current)

### Testing

- ✅ **T1**: Unit tests for file discovery helper
- ✅ **T2**: E2E test for refinement with multi-file bundle
- ✅ **T3**: Manual testing with real-world bundle (TensorFlow.js or Babylon.js)
- ✅ **T4**: Edge case testing (empty dir, single file, 10+ files)

### Performance

- ✅ **P1**: No performance regression in Pass 1 (skipWebcrack default = false)
- ✅ **P2**: Pass 2 file discovery < 100ms for typical output dirs (< 100 files)
- ✅ **P3**: Memory usage unchanged (no large arrays held in memory)

### Documentation

- ✅ **D1**: Update CLAUDE.md with refinement example
- ✅ **D2**: JSDoc on `discoverOutputFiles()` function
- ✅ **D3**: Comment explaining `skipWebcrack` option in UnminifyOptions
- ✅ **D4**: Update this PLAN document status to completed

---

## RISK MITIGATION

### Risk #1: Breaking Existing Behavior

**Severity**: HIGH
**Probability**: LOW

**Mitigation**:
- Default `skipWebcrack: false` maintains existing behavior
- All existing tests must pass before merging
- Manual testing on TensorFlow.js and Babylon.js samples

**Rollback Plan**: Revert commit, release patch with fix reverted

---

### Risk #2: File Discovery Finds Wrong Files

**Severity**: MEDIUM
**Probability**: MEDIUM

**Scenario**: Output directory contains other `.js` files from previous runs

**Mitigation**:
- Sort files deterministically (alphabetical)
- Exclude sourcemaps (`.js.map`)
- Document that output directory should be clean
- Consider adding `--clean-output` flag to wipe directory first

**Detection**: E2E test with pre-populated output directory

---

### Risk #3: Large Output Directories (1000+ files)

**Severity**: LOW
**Probability**: LOW

**Scenario**: Massive webpack bundle produces 1000+ files, `fs.readdir()` is slow

**Mitigation**:
- Current approach: Read directory once, sort in memory
- If needed: Use streaming readdir with async iteration
- Real-world bundles rarely exceed 100 files

**Performance Target**: < 100ms for 100 files, < 1s for 1000 files

---

### Risk #4: Cross-File Dependencies in Refinement

**Severity**: MEDIUM
**Probability**: MEDIUM

**Scenario**: Variable in `bundle_1.js` references function in `bundle_2.js`

**Current Limitation**: Each file processed independently, no cross-file symbol resolution

**Mitigation**:
- Document limitation in CLAUDE.md
- Future work: Add cross-file dependency tracking
- In practice: Most webpack bundles have self-contained modules

**Workaround**: Run refinement multiple times (3+ passes) to iteratively improve names

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Add `skipWebcrack` Parameter
- [ ] Update `UnminifyOptions` interface (line 16-22 in unminify.ts)
- [ ] Add conditional webcrack logic (line 67-73 in unminify.ts)
- [ ] Add JSDoc comment explaining `skipWebcrack` option
- [ ] Verify existing tests still pass

### Phase 2: File Discovery
- [ ] Create `discoverOutputFiles()` helper function
- [ ] Add JSDoc comments
- [ ] Export function for testing
- [ ] Add error handling for non-existent directory

### Phase 3: Refinement Loop
- [ ] Replace hardcoded `deobfuscated.js` with `discoverOutputFiles()`
- [ ] Add loop to process each discovered file
- [ ] Pass `skipWebcrack: true` in options
- [ ] Add console output for progress

### Phase 4: Console Output
- [ ] Add pass headers ("=== Pass 2: Refining N files ===")
- [ ] Add per-file progress indicators
- [ ] Add completion message
- [ ] Verify no output overlap/flicker

### Phase 5: Testing
- [ ] Create `openai-helpers.test.ts` with unit tests
- [ ] Create `openai-refinement.e2etest.ts` with E2E tests
- [ ] Create test fixture `webpack-multi-bundle.js`
- [ ] Run manual tests with TensorFlow.js sample
- [ ] Verify all 232 tests pass

### Phase 6: Documentation
- [ ] Update CLAUDE.md with refinement example
- [ ] Add comments to new code
- [ ] Update this PLAN document with results
- [ ] Move PLAN to archive/ when complete

---

## ESTIMATED EFFORT

### Development Time

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1 | Add skipWebcrack parameter | 30 minutes |
| 2 | File discovery helper | 45 minutes |
| 3 | Refinement loop refactor | 1 hour |
| 4 | Console output improvements | 30 minutes |
| 5 | Unit + E2E tests | 2 hours |
| 6 | Documentation | 30 minutes |
| **TOTAL** | | **5 hours 15 minutes** |

### Testing Time

| Type | Estimated Time |
|------|----------------|
| Unit tests | 10 seconds |
| E2E tests | 1-2 minutes (with real API) |
| Manual testing | 15 minutes |
| **TOTAL** | **~17 minutes** |

### Grand Total: ~5.5 hours (including breaks)

---

## DEPENDENCIES

### Code Dependencies
- `fs/promises` (Node.js built-in)
- `path` (Node.js built-in)
- Existing `unminify()` function
- Existing `webcrack()` plugin

### External Dependencies
- OpenAI API key (for testing)
- Built package (`npm run build`)
- Test fixtures (webpack bundle samples)

### Prerequisite Work
- None! This is self-contained fix.

---

## SUCCESS METRICS

### Quantitative

- ✅ 100% of tests passing (232/232)
- ✅ New tests: 8+ unit tests, 2+ E2E tests
- ✅ 0 console errors during refinement
- ✅ File discovery < 100ms for 100 files
- ✅ Memory usage unchanged (within 5%)

### Qualitative

- ✅ Console output is clear and easy to read
- ✅ Error messages are actionable
- ✅ Code is self-documenting with good comments
- ✅ Refinement workflow is intuitive

### User Validation

Test with user's original command:
```bash
humanify unminify --provider openai large-bundle.js --output-dir ./output --refine --turbo
```

**Expected user feedback**:
- "Pass 2 now works!"
- "I can see both passes completing"
- "Output files contain refined code"

---

## BACKWARD COMPATIBILITY

### Breaking Changes: NONE

All changes are additive:
- New `skipWebcrack` option (defaults to false)
- New `discoverOutputFiles()` helper (not exported publicly)
- Refinement behavior fixed (was broken, now works)

### API Stability

**`unminify()` signature**: UNCHANGED (optional parameter added to options object)

**Before**:
```typescript
unminify(filename, outputDir, plugins, { chunkSize: 100000 })
```

**After**:
```typescript
unminify(filename, outputDir, plugins, { chunkSize: 100000, skipWebcrack: true })
```

Existing code continues to work without modification.

---

## FUTURE ENHANCEMENTS (Out of Scope)

### Enhancement #1: Multi-Pass Refinement

**Description**: Support 3+ refinement passes (`--refine=3`)

**Effort**: 2-3 hours

**Benefits**: Iterative improvement for deeply obfuscated code

---

### Enhancement #2: Cross-File Symbol Resolution

**Description**: Track symbols across bundle files for better context

**Effort**: 2-3 weeks

**Benefits**: Improved naming quality for split bundles

---

### Enhancement #3: Output Directory Validation

**Description**: Add `--clean-output` flag to wipe directory before processing

**Effort**: 1 hour

**Benefits**: Prevent confusion from stale files

---

## COMPLETION CRITERIA

This PLAN is considered complete when:

1. ✅ All code changes committed and pushed
2. ✅ All tests passing (232/232 + new tests)
3. ✅ Manual testing completed successfully
4. ✅ Documentation updated
5. ✅ User validates fix works with their bundle
6. ✅ This PLAN moved to `.agent_planning/archive/`

---

## NOTES FOR IMPLEMENTER

### Key Files to Modify

1. **src/unminify.ts** (lines 16-22, 67-73) - Add skipWebcrack option
2. **src/commands/openai.ts** (lines 40, 272-309) - File discovery + refinement loop
3. **src/commands/openai-helpers.test.ts** (NEW) - Unit tests
4. **src/commands/openai-refinement.e2etest.ts** (NEW) - E2E tests

### Development Tips

- Start with Phase 1 (skipWebcrack) and verify tests pass before continuing
- Export `discoverOutputFiles()` for testing, but don't add to public API
- Use existing `displayManager` for console output (don't reinvent)
- Test with small fixtures first, then real bundles
- Check memory usage with `--perf` flag

### Testing Tips

- Mock OpenAI API in CI (use `nock` or similar)
- Create minimal webpack bundle fixture (< 1KB)
- Use `just test-tensorflow --refine` for manual validation
- Check for "file not found" errors in console

### Common Pitfalls

- ❌ Don't forget to set `skipWebcrack: true` in Phase 3!
- ❌ Don't use `fs.readdirSync()` (async is better)
- ❌ Don't filter files by checking content (too slow)
- ❌ Don't mutate `extractedFiles` array in unminify()

---

**END OF PLAN**

**Status**: READY FOR IMPLEMENTATION
**Next Step**: Begin Phase 1 (Add skipWebcrack parameter)
**Assigned To**: Development Team
**Reviewer**: Technical Lead

---

**Generated**: 2025-11-17 08:23:24
**Source**: STATUS-2025-11-17-115400.md
**Spec Version**: PROJECT_SPEC.md (Issue #3)
