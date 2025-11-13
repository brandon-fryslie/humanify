# Checkpoint System Completion Plan

**Generated**: 2025-11-13-040718
**Source STATUS**: SESSION-FINAL-EVALUATION-2025-11-13.md
**Spec Version**: CLAUDE.md (last modified 2025-11-13)
**Current State**: 20% complete, BLOCKED by AST transformation bug

---

## Executive Summary

**CRITICAL BLOCKER IDENTIFIED**: The checkpoint system code is 80% written but fails at runtime due to a Babel AST type mismatch. The issue is that `parseAsync` returns a `ParseResult<File>` object (which wraps a File node with error metadata), but `transformFromAstAsync` expects the actual `File` node itself, not the wrapper.

**Root Cause**: Lines 378 and 116 in `visit-all-identifiers.ts` pass the wrong type to `transformFromAstAsync`. The variable `ast` is typed as `ParseResult<File> | null` but the code treats it as `File`.

**Impact**: No checkpoint files are created, resume is untested, and $400/month waste continues.

**Solution**: Simple type fix + validation - estimated 1-2 hours to resolve blocker.

**Total Time to Production**: 29 hours (4 hours debug/fix + 10 hours P0 + 11 hours P1 + 4 hours validation)

---

## Gap Analysis

### Current Implementation Status

**FROM SESSION-FINAL-EVALUATION-2025-11-13.md**:
- Planning: 100% (comprehensive 88-hour plan exists)
- Test Suite: 80% (35/44 tests passing, 9 skipped)
- Implementation: 20% (infrastructure only, runtime blocked)

**Evidence of Blocker**:
1. E2E tests: 5/8 tests FAILING with "AST root must be a Program or File node"
2. Checkpoint directory: EMPTY (no `.json` files created)
3. Test output: "checkpoint is NULL" (files don't exist)
4. Console logs: AST transformation throws before checkpoint save executes

### Requirements vs Reality

| Requirement | Code Exists | Tests Pass | Runtime Works | Completion |
|-------------|-------------|------------|---------------|------------|
| **P0: Core Correctness** |
| Store transformed code | ✅ Yes | ✅ Yes | ❌ **BLOCKED** | 20% |
| Resume from checkpoint | ✅ Yes | ❌ Untested | ❌ Untested | 10% |
| Self-contained checkpoints | ✅ Yes | ✅ Yes | ❌ No files | 30% |
| Version validation | ✅ Yes | ✅ Yes | ✅ **WORKS** | 100% |
| Deterministic batching | ✅ Yes | ✅ Yes | ✅ **WORKS** | 100% |
| **P1: Production Readiness** |
| Interactive resume prompt | ❌ Mock only | ✅ Mocked | ❌ Not integrated | 20% |
| Validated checkpoints | ✅ Yes | ✅ Yes | ✅ **WORKS** | 100% |
| Signal handlers | ❌ No | ⏸️ Skipped | ❌ No | 0% |
| **P2: User Experience** |
| Management CLI | ❌ No | ❌ No | ❌ No | 0% |
| Salvage feature | ❌ No | ⏸️ Skipped | ❌ No | 0% |
| Refine-aware tracking | ❌ No | ❌ No | ❌ No | 0% |

**Overall P0 Status**: 1/5 complete (only version validation + deterministic batching work)
**Overall P1 Status**: 1/3 complete (only version validation works)

---

## Critical Path Work Items

### PHASE 1: Debug & Fix AST Bug (CRITICAL - 4-6 hours)

These items MUST be completed before any other work can proceed.

---

#### P0-1: Diagnose AST Type Mismatch

**Priority**: P0 (BLOCKER)
**Status**: Not Started
**Effort**: 1 hour
**Dependencies**: None
**Spec Reference**: CLAUDE.md § Architecture § AST Processing
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Blocker 1 (lines 345-376)

**Description**:
The `parseAsync` function returns `ParseResult<File>` (a wrapper containing a `File` node + errors array), but the code treats it as if it's the `File` node directly. When this is passed to `transformFromAstAsync`, Babel throws "AST root must be a Program or File node" because it receives the wrapper object instead of the actual File/Program node.

**Root Cause Evidence**:
- Line 56-59: `parseAsync()` returns `ParseResult<File> | null`
- Line 72: `findScopes(ast)` expects `Node` but receives `ParseResult<File>`
- Line 116: `transformFromAstAsync(ast)` expects `File` but receives `ParseResult<File>`
- Line 378: Same issue during checkpoint save

**Acceptance Criteria**:
- [ ] Add TypeScript type annotation to verify ast type at line 56
- [ ] Add debug logging before line 378: `console.log('[DEBUG] AST type:', ast.type, 'Has program:', !!ast.program)`
- [ ] Run failing e2e test: `npm run test:e2e -- src/checkpoint-resume.e2etest.ts`
- [ ] Capture exact error message and stack trace
- [ ] Confirm error is "AST root must be a Program or File node"
- [ ] Document whether ast is ParseResult or File at error point

**Technical Notes**:
According to Babel documentation, `ParseResult<File>` is defined as:
```typescript
type ParseResult<Result extends File | Expression = File> = Result & {
  errors: null | ParseError[];
};
```

This means `ParseResult<File>` extends `File` AND adds an `errors` property. However, the type checker may be treating it as a distinct type. The fix likely requires either:
1. Type assertion: `transformFromAstAsync(ast as File, ...)`
2. Property access: `transformFromAstAsync(ast.program, ...)` if File has a program property
3. Type narrowing: Check `if (ast && 'type' in ast)` before transforming

---

#### P0-2: Implement AST Type Fix

**Priority**: P0 (BLOCKER)
**Status**: Not Started
**Effort**: 1-2 hours
**Dependencies**: P0-1 (diagnosis)
**Spec Reference**: CLAUDE.md § Architecture § Babel Utilities
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Immediate Next Steps § Verify AST Structure

**Description**:
Apply the correct type handling to fix the `transformFromAstAsync` calls. The exact fix depends on P0-1 diagnosis, but likely involves either type assertions or accessing the correct property of the ParseResult.

**Acceptance Criteria**:
- [ ] Fix line 116: `transformFromAstAsync(ast)` → correct form
- [ ] Fix line 378: `transformFromAstAsync(ast, undefined, {...})` → correct form
- [ ] Fix line 450 if affected: `transformFromAstAsync(surroundingContext.node)` → correct form
- [ ] Verify TypeScript compiles without errors: `npm run build`
- [ ] No new type errors introduced
- [ ] Code passes lint: `npm run lint`

**Technical Notes**:
Based on Babel docs research:
- `parseAsync` returns `ParseResult<File>` which IS a File (it extends File)
- The error suggests Babel runtime validation is stricter than TypeScript types
- May need to explicitly pass the File node without the errors wrapper

**Potential Solutions** (choose one after P0-1):
```typescript
// Option 1: Type assertion (if ParseResult IS a File)
const stringified = await transformFromAstAsync(ast as File);

// Option 2: Property access (if File is wrapped)
const stringified = await transformFromAstAsync(ast, undefined, {...});

// Option 3: Narrowing (if type guard needed)
if (!ast || ast.type !== 'File') throw new Error('Invalid AST');
const stringified = await transformFromAstAsync(ast, undefined, {...});
```

**Risk**:
If the fix is more complex than expected (e.g., requires restructuring the entire parsing flow), escalate to Babel community for guidance.

---

#### P0-3: Verify Checkpoint Save Executes

**Priority**: P0 (CRITICAL)
**Status**: Not Started
**Effort**: 1 hour
**Dependencies**: P0-2 (AST fix)
**Spec Reference**: CLAUDE.md § Architecture § Core Processing Pipeline
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § What's NOT Working (lines 498-507)

**Description**:
After fixing the AST bug, verify that checkpoint save actually executes and creates files. This is the moment of truth - does the fix unblock the entire feature?

**Acceptance Criteria**:
- [ ] Run e2e test: `npm run test:e2e -- src/checkpoint-resume.e2etest.ts`
- [ ] Verify test "resume from checkpoint should produce identical output" PASSES
- [ ] Check `.humanify-checkpoints/` directory is NOT empty
- [ ] Verify at least one `.json` file exists in directory
- [ ] Open checkpoint file and verify structure:
  - [ ] `version` field is "2.0.0"
  - [ ] `partialCode` field is NOT empty string
  - [ ] `partialCode` contains valid JavaScript
  - [ ] `renames` map has at least one entry (not empty object)
  - [ ] `completedBatches` is a positive number
  - [ ] `totalBatches` matches expected value
- [ ] Console output shows: "💾 Checkpoint saved: X/Y batches complete"
- [ ] No AST errors thrown during test execution

**Technical Notes**:
This test will definitively answer: "Does the checkpoint system work?"

If files are still not created after AST fix, there's a secondary issue (disk permissions, path resolution, etc.). Check:
1. Directory creation: Does `.humanify-checkpoints/` exist?
2. Write permissions: Can writeFileSync succeed?
3. Exception handling: Is saveCheckpoint catching errors silently?

---

#### P0-4: Validate Checkpoint Contents

**Priority**: P0 (CRITICAL)
**Status**: Not Started
**Effort**: 1 hour
**Dependencies**: P0-3 (checkpoint save works)
**Spec Reference**: CLAUDE.md § Architecture § Variable Renaming Flow
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Success Metrics

**Description**:
Manually inspect checkpoint file contents to ensure they're valid and contain expected data. This catches issues that automated tests might miss (e.g., malformed JSON, incorrect transformations).

**Acceptance Criteria**:
- [ ] Open `.humanify-checkpoints/<hash>.json` in text editor
- [ ] Verify JSON is well-formed (no syntax errors)
- [ ] Verify `partialCode` field:
  - [ ] NOT empty string
  - [ ] Contains valid JavaScript (run through `node --check`)
  - [ ] Contains renamed variables (not original variable names)
  - [ ] Code is semantically equivalent to expected output
- [ ] Verify `renames` map:
  - [ ] NOT empty object (`{}`)
  - [ ] Contains at least 3-5 entries for test code
  - [ ] Old names → new names mapping is correct
  - [ ] No duplicate keys
  - [ ] All values are valid identifiers
- [ ] Verify metadata fields:
  - [ ] `timestamp` is recent (within last hour)
  - [ ] `completedBatches` ≤ `totalBatches`
  - [ ] `inputHash` matches test file hash
- [ ] Run partialCode through parser: `node -e "require('@babel/parser').parse('...')"`
- [ ] Verify no corruption: Load checkpoint, verify loadCheckpoint() succeeds

**Technical Notes**:
This is a MANUAL verification step. Take time to carefully inspect the checkpoint data structure. Look for:
- Empty strings where there should be code
- Original identifiers still present (means renames didn't apply)
- Malformed AST transformations
- Missing fields

Document any anomalies for future debugging.

---

### PHASE 2: Complete P0 Requirements (CRITICAL - 10 hours)

After the AST bug is fixed, these items ensure the checkpoint system is functionally correct.

---

#### P0-5: Implement Resume Correctness Test

**Priority**: P0 (CRITICAL)
**Status**: Test exists but FAILS
**Effort**: 2 hours
**Dependencies**: P0-3 (checkpoint save works)
**Spec Reference**: CLAUDE.md § Test Patterns § *.e2etest.ts
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Blocker 2 (lines 378-401)

**Description**:
The test exists in `checkpoint-resume.e2etest.ts` but currently fails. After fixing the AST bug, this test must pass to prove that resume produces identical output to continuous execution. This is the CORE requirement of the checkpoint feature.

**Test Strategy**:
1. Run processing to 50% (save checkpoint)
2. "Interrupt" by stopping execution
3. Resume from checkpoint
4. Compare output with continuous run (no checkpoint)
5. Verify byte-for-byte equivalence

**Acceptance Criteria**:
- [ ] Test "resume from checkpoint should produce identical output" PASSES
- [ ] Test "same input should produce same batch structure" PASSES
- [ ] Test "checkpoint should accumulate renames" PASSES
- [ ] Test "checkpoint resume with complex nested code" PASSES
- [ ] All 8/8 e2e tests in checkpoint-resume.e2etest.ts PASS
- [ ] Run test 10 times: verify 100% pass rate (no flakiness)
- [ ] Output comparison shows ZERO differences:
  ```typescript
  assert.strictEqual(resumedOutput, continuousOutput);
  ```
- [ ] Verify byte-for-byte equivalence (not just semantic equivalence)

**Technical Notes**:
The test file already exists with the correct structure. The fix to P0-2 should make this test pass automatically. If the test still fails after AST fix, investigate:
1. Are batches deterministic? (Should be validated by checkpoint-determinism.test.ts)
2. Is partialCode correctly transformed?
3. Does resume apply renames in the same order?

If issues found, may need to debug resume logic (lines 47-52 in visit-all-identifiers.ts).

---

#### P0-6: Verify No Duplicate API Calls on Resume

**Priority**: P0 (CRITICAL - COST SAVINGS)
**Status**: Not Started
**Effort**: 2 hours
**Dependencies**: P0-5 (resume correctness proven)
**Spec Reference**: CLAUDE.md § Architecture § Variable Renaming Flow
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Cost Analysis § Savings Realized

**Description**:
The entire point of the checkpoint system is to avoid re-processing completed work. This test MUST prove that resume skips completed batches and doesn't make duplicate API calls. Without this, the feature provides no cost savings.

**Measurement Strategy**:
1. Track visitor call count during continuous run (baseline)
2. Track visitor call count during interrupted + resumed run
3. Calculate: calls_resumed / calls_continuous
4. Expected: ~0.5 (50% savings if interrupted at 50%)

**Acceptance Criteria**:
- [ ] Add visitor call tracking to test (wrap visitor with counter)
- [ ] Baseline run: Record total API calls (let's say 100 calls)
- [ ] Interrupted run: Stop at 50% (50 calls), save checkpoint
- [ ] Resumed run: Record additional API calls
- [ ] Verify: baseline_calls = interrupted_calls + resumed_calls
- [ ] Verify: resumed_calls ≈ baseline_calls / 2 (±5% tolerance)
- [ ] Verify: NO duplicate calls (same identifier renamed twice)
- [ ] Document actual savings: "Resume saved X API calls (Y% reduction)"
- [ ] Run test 5 times to verify consistency

**Technical Notes**:
This is the MONEY-SAVING METRIC. If this test fails (e.g., resume makes duplicate calls), the checkpoint system is useless for cost savings even if output is correct.

**Cost Calculation**:
- 100 identifiers × $0.10/call = $10 per run
- Resume at 50% → save 50 calls → save $5 per resume
- 20 resumes/month → $100/month savings
- 4 files/month × 20 resumes = 80 resumes/month → $400/month savings

**Risk**:
If duplicate calls detected, investigate:
1. Is `completedBatches` correctly restored from checkpoint?
2. Does turbo mode skip correct batches?
3. Are renames applied before processing next batch?

---

#### P0-7: Add Checkpoint Cleanup After Success

**Priority**: P0 (CLEANUP)
**Status**: Code exists, needs verification
**Effort**: 1 hour
**Dependencies**: P0-5 (resume works)
**Spec Reference**: CLAUDE.md § Architecture § Core Processing Pipeline
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § What Actually Works § Checkpoint Deletion

**Description**:
Verify that checkpoint files are automatically deleted after successful completion. This prevents checkpoint directory from filling up with stale files.

**Acceptance Criteria**:
- [ ] Run full processing with checkpoint (100% completion)
- [ ] Verify checkpoint is created during processing
- [ ] Verify checkpoint is DELETED after completion
- [ ] Check `.humanify-checkpoints/` directory is empty after success
- [ ] Verify console output: "✅ Checkpoint deleted (processing complete)"
- [ ] Test with multiple runs: verify no orphaned checkpoints accumulate
- [ ] Add e2e test: "checkpoint cleanup on success" (should already exist)
- [ ] Verify test PASSES

**Technical Notes**:
Line 126-128 in visit-all-identifiers.ts already has deletion logic:
```typescript
if (checkpointId) {
  deleteCheckpoint(checkpointId);
}
```

This test verifies the logic actually executes. If checkpoints aren't deleted, check:
1. Is `checkpointId` still in scope at deletion time?
2. Does execution reach line 126 (or does it exit early)?
3. Are exceptions caught silently?

---

#### P0-8: Validate Resume from Checkpoint (Manual Test)

**Priority**: P0 (MANUAL VERIFICATION)
**Status**: Not Started
**Effort**: 2 hours
**Dependencies**: P0-5, P0-6, P0-7 (all automated tests pass)
**Spec Reference**: CLAUDE.md § Development Commands § Testing
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Immediate Next Steps § Run Real Scenario

**Description**:
Perform a REAL end-to-end test with the built CLI to ensure checkpoint system works in production environment (not just tests). This is the ultimate validation before shipping to users.

**Manual Test Procedure**:
```bash
# Step 1: Build the project
npm run build

# Step 2: Download a real test file (or use existing)
just download-tensorflow  # 1.4MB file with ~35K identifiers

# Step 3: Start processing with turbo mode
./dist/index.mjs unminify --provider openai \
  test-samples/tensorflow.min.js \
  --turbo --max-concurrent 20 \
  --output test-output/tensorflow.humanified.js

# Step 4: Interrupt after ~30 seconds (Ctrl+C)
# Expected: Checkpoint saved

# Step 5: Resume processing
./dist/index.mjs unminify --provider openai \
  test-samples/tensorflow.min.js \
  --turbo --max-concurrent 20 \
  --output test-output/tensorflow.humanified.js

# Expected: Resume from checkpoint, complete processing
```

**Acceptance Criteria**:
- [ ] Build succeeds: `npm run build` completes without errors
- [ ] Initial run creates checkpoint: verify `.humanify-checkpoints/<hash>.json` exists
- [ ] Checkpoint saves progress correctly: verify `completedBatches` field
- [ ] Resume run detects checkpoint: console shows "📂 Resuming from transformed code"
- [ ] Resume completes successfully: output file written
- [ ] Checkpoint deleted after success: `.humanify-checkpoints/` directory empty
- [ ] Output file is valid JavaScript: `node --check test-output/tensorflow.humanified.js`
- [ ] No duplicate API calls: check OpenAI usage dashboard
- [ ] Total API calls ≈ (interrupted_calls + resumed_calls)
- [ ] Document actual cost savings: "Saved $X in API costs"

**Technical Notes**:
This is the REAL test. Automated tests can pass but the feature still fail in production due to:
- CLI argument parsing issues
- Build/packaging problems
- Environment-specific bugs
- File path resolution differences

Take detailed notes of any issues encountered. This test simulates exactly what users will experience.

---

#### P0-9: Measure and Document Cost Savings

**Priority**: P0 (ROI VALIDATION)
**Status**: Not Started
**Effort**: 2 hours
**Dependencies**: P0-8 (manual test complete)
**Spec Reference**: CLAUDE.md § Turbo Mode § Usage
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Cost Analysis

**Description**:
Quantify the actual cost savings from the checkpoint system using real API usage data. This validates the ROI and justifies the development investment.

**Measurement Process**:
1. Baseline: Run large file WITHOUT interruption, record API calls
2. Interrupted: Run large file, interrupt at 50%, record API calls
3. Resumed: Resume from checkpoint, record additional API calls
4. Calculate savings: `(baseline - resumed) / baseline × 100%`

**Acceptance Criteria**:
- [ ] Run 3 baseline tests: Record API call count for each
- [ ] Calculate average baseline: `avg_baseline = sum(calls) / 3`
- [ ] Run 3 interrupted+resumed tests: Record API calls for each
- [ ] Calculate average resumed: `avg_resumed = sum(calls) / 3`
- [ ] Calculate savings percentage: `savings = (avg_baseline - avg_resumed) / avg_baseline`
- [ ] Verify savings ≥ 40% (for 50% interruption point)
- [ ] Document in CLAUDE.md:
  ```markdown
  ## Checkpoint Cost Savings (Measured 2025-11-13)
  - Baseline (no checkpoint): 10,000 API calls ($100)
  - Resume at 50%: 5,200 API calls ($52)
  - Savings: 48% ($48 per interrupted run)
  - Monthly impact: 20 interruptions × $48 = $960/month saved
  ```
- [ ] Update SESSION-FINAL-EVALUATION with actual savings
- [ ] Verify ROI calculation: payback period with real data

**Technical Notes**:
Use OpenAI usage dashboard to verify API call counts. The formula:
```
Cost per identifier = $0.10 (average, depends on model)
Interruption point = 50% (worst case, middle of run)
Savings per resume = baseline_cost × 0.5
Monthly resumes = 20 (from evaluation)
Monthly savings = $400 (target from evaluation)
```

If actual savings < $400/month, investigate:
- Are failed runs actually resuming? (Or restarting from scratch?)
- Is 20 resumes/month estimate accurate?
- What's the actual cost per identifier?

---

### PHASE 3: CLI Integration (P1 - 11 hours)

Make the checkpoint feature accessible and user-friendly.

---

#### P1-1: Implement Interactive Resume Prompt

**Priority**: P1 (USER EXPERIENCE)
**Status**: Mock tests exist, not integrated
**Effort**: 3 hours
**Dependencies**: P0-8 (manual test complete)
**Spec Reference**: CLAUDE.md § Architecture § Core Processing Pipeline
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Blocker 3 (lines 403-420)

**Description**:
Add interactive CLI prompt at startup to ask user if they want to resume from checkpoint. Currently the system auto-resumes silently, giving users no control. This violates user agency and can cause confusion.

**User Flow**:
```
$ humanify unminify input.js --turbo

📂 Found checkpoint: 5/10 batches already completed
   Timestamp: 2025-11-13 3:45 PM
   Progress: 50% complete
   Estimated savings: $20 in API costs

Resume from checkpoint? (Y/n/inspect/delete): _
```

**Acceptance Criteria**:
- [ ] Detect checkpoint before processing starts
- [ ] Display checkpoint metadata:
  - [ ] Progress: "X/Y batches completed (Z%)"
  - [ ] Timestamp: Human-readable date/time
  - [ ] Estimated cost savings: Calculate from batches
- [ ] Prompt user with options:
  - [ ] Y: Resume (default on empty input)
  - [ ] n: Start fresh, delete checkpoint
  - [ ] inspect: Show checkpoint contents (JSON dump)
  - [ ] delete: Delete checkpoint, exit
- [ ] Handle user input:
  - [ ] Empty input → treat as "Y" (resume)
  - [ ] Invalid input → re-prompt with error message
  - [ ] Ctrl+D / Ctrl+C → exit gracefully
- [ ] Wire prompt into CLI entry points:
  - [ ] `src/commands/openai.ts`
  - [ ] `src/commands/gemini.ts`
  - [ ] `src/commands/local.ts`
- [ ] Add CLI flag: `--auto-resume` to skip prompt (CI/automation)
- [ ] Update help text with checkpoint options

**Technical Notes**:
Mock tests already exist in `checkpoint-interactive.test.ts`. Convert these to real implementation:
1. Move prompt logic from test to new file: `src/interactive-prompt.ts`
2. Use Node.js `readline` for user input
3. Call prompt function before processing in each command file
4. Handle edge cases: stdin closed, non-TTY environment

**Code Example**:
```typescript
// src/interactive-prompt.ts
export async function promptResumeCheckpoint(
  checkpoint: Checkpoint
): Promise<'resume' | 'restart' | 'inspect' | 'exit'> {
  const progress = Math.round((checkpoint.completedBatches / checkpoint.totalBatches) * 100);
  console.log(`\n📂 Found checkpoint: ${checkpoint.completedBatches}/${checkpoint.totalBatches} batches completed (${progress}%)`);
  console.log(`   Timestamp: ${new Date(checkpoint.timestamp).toLocaleString()}`);

  // ... prompt logic
}
```

---

#### P1-2: Add Signal Handlers for Graceful Shutdown

**Priority**: P1 (PRODUCTION CRITICAL)
**Status**: Not Started
**Effort**: 4 hours
**Dependencies**: P0-3 (checkpoint save works)
**Spec Reference**: CLAUDE.md § Architecture § Core Processing Pipeline
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Blocker 3 § Required Work

**Description**:
Register signal handlers (SIGINT/SIGTERM) to save checkpoint before exit when user hits Ctrl+C or process is killed. Currently Ctrl+C loses ALL progress, wasting API costs. This is critical for production use.

**Signal Handling Strategy**:
1. Register handlers at CLI entry point (before processing starts)
2. On signal received: Set flag to trigger checkpoint save
3. Wait for current batch to complete (don't interrupt mid-batch)
4. Save checkpoint with current progress
5. Exit gracefully with status code 130 (SIGINT) or 143 (SIGTERM)

**Acceptance Criteria**:
- [ ] Register SIGINT handler: `process.on('SIGINT', handler)`
- [ ] Register SIGTERM handler: `process.on('SIGTERM', handler)`
- [ ] Handler behavior:
  - [ ] Set global flag: `shutdownRequested = true`
  - [ ] Wait for current batch to complete (don't abort mid-batch)
  - [ ] Call saveCheckpoint with current state
  - [ ] Display message: "⚠️  Interrupted! Checkpoint saved at X/Y batches"
  - [ ] Exit with appropriate code: 130 (SIGINT) or 143 (SIGTERM)
- [ ] Integrate with turbo mode:
  - [ ] Check `shutdownRequested` flag after each batch
  - [ ] If true, break loop and save checkpoint
- [ ] Prevent corruption:
  - [ ] Don't save checkpoint mid-batch
  - [ ] Don't save checkpoint during AST transformation
  - [ ] Only save at safe checkpoint points
- [ ] Manual testing:
  - [ ] Start processing, hit Ctrl+C → checkpoint saved
  - [ ] Start processing, `kill <pid>` → checkpoint saved
  - [ ] Resume after interrupt → correct progress restored
- [ ] Add test: checkpoint-signals.test.ts (6 skipped tests to implement)

**Technical Notes**:
Signal handling is tricky:
1. **Race conditions**: Signal can arrive during AST transformation
2. **Cleanup**: Must unregister handlers after processing completes
3. **Multiple signals**: Handle repeated Ctrl+C (force exit)

**Code Example**:
```typescript
// src/commands/openai.ts
let checkpointSaved = false;
let shutdownRequested = false;

const signalHandler = () => {
  shutdownRequested = true;
  console.log('\n⚠️  Interrupt signal received. Saving checkpoint...');
};

process.on('SIGINT', signalHandler);
process.on('SIGTERM', signalHandler);

try {
  await visitAllIdentifiers(code, visitor, contextSize, onProgress, {
    turbo: true,
    shutdownRequested: () => shutdownRequested  // Check flag
  });
} finally {
  process.off('SIGINT', signalHandler);
  process.off('SIGTERM', signalHandler);
}
```

**Risks**:
- Checkpoint corruption if signal arrives during critical section
- Memory leaks if handlers not cleaned up
- Non-deterministic behavior if multiple signals received

Mitigation: Add critical section tracking, defer signal handling until safe point.

---

#### P1-3: Wire CLI Flags for Checkpoint Control

**Priority**: P1 (CONFIGURATION)
**Status**: Partially complete
**Effort**: 2 hours
**Dependencies**: P1-1, P1-2 (interactive + signals work)
**Spec Reference**: CLAUDE.md § Environment Variables
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § P1 Requirements

**Description**:
Add CLI flags to give users full control over checkpoint behavior. Currently checkpoints are auto-enabled in turbo mode with no way to disable.

**Required CLI Flags**:
```bash
--enable-checkpoints      # Enable checkpoints (default: true in turbo mode)
--disable-checkpoints     # Disable checkpoints (default: false)
--auto-resume            # Skip resume prompt, auto-resume (default: false)
--checkpoint-dir <path>  # Custom checkpoint directory (default: .humanify-checkpoints)
```

**Acceptance Criteria**:
- [ ] Add flags to CLI argument parser (all command files)
- [ ] `--enable-checkpoints`: Force enable even in non-turbo mode
- [ ] `--disable-checkpoints`: Disable even in turbo mode
- [ ] `--auto-resume`: Skip interactive prompt, auto-resume if checkpoint exists
- [ ] `--checkpoint-dir <path>`: Use custom directory instead of default
- [ ] Verify flag precedence:
  - [ ] Explicit `--disable-checkpoints` overrides turbo default
  - [ ] `--enable-checkpoints` enables even in sequential mode
- [ ] Update help text: `--help` shows all checkpoint flags
- [ ] Update CLAUDE.md: Document all checkpoint flags
- [ ] Test each flag:
  - [ ] `--disable-checkpoints` → no checkpoint created
  - [ ] `--enable-checkpoints` → checkpoint created in sequential mode
  - [ ] `--auto-resume` → no prompt, auto-resume
  - [ ] `--checkpoint-dir /tmp/test` → checkpoint saved to custom path

**Technical Notes**:
Integrate with existing VisitOptions interface:
```typescript
export interface VisitOptions {
  turbo?: boolean;
  maxConcurrent?: number;
  enableCheckpoints?: boolean;  // ← New
  autoResume?: boolean;          // ← New
  checkpointDir?: string;        // ← New
  // ... existing options
}
```

Update checkpoint.ts to use custom directory if provided.

---

#### P1-4: Manual End-to-End CLI Testing

**Priority**: P1 (VALIDATION)
**Status**: Not Started
**Effort**: 2 hours
**Dependencies**: P1-1, P1-2, P1-3 (all CLI integration complete)
**Spec Reference**: CLAUDE.md § Development Commands
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Recommendations § Validate Runtime Behavior

**Description**:
Manually test the complete checkpoint user experience to catch issues that automated tests miss. This simulates real user workflows and validates production readiness.

**Test Scenarios**:

**Scenario 1: Fresh Run**
```bash
npm run build
./dist/index.mjs unminify test.js --turbo
# Expected: No checkpoint prompt, processing starts immediately
```

**Scenario 2: Interrupted + Resume**
```bash
./dist/index.mjs unminify large.js --turbo
# Interrupt after 30 seconds (Ctrl+C)
# Expected: "⚠️  Interrupted! Checkpoint saved at X/Y batches"

./dist/index.mjs unminify large.js --turbo
# Expected: Interactive prompt appears
# User input: Y (or just Enter)
# Expected: Resume from checkpoint, complete processing
```

**Scenario 3: Inspect Checkpoint**
```bash
./dist/index.mjs unminify large.js --turbo
# User input: inspect
# Expected: JSON dump of checkpoint contents
```

**Scenario 4: Delete Checkpoint**
```bash
./dist/index.mjs unminify large.js --turbo
# User input: delete
# Expected: Checkpoint deleted, processing exits
```

**Scenario 5: Start Fresh**
```bash
./dist/index.mjs unminify large.js --turbo
# User input: n
# Expected: Checkpoint deleted, processing starts from beginning
```

**Scenario 6: Auto-Resume (CI Mode)**
```bash
./dist/index.mjs unminify large.js --turbo --auto-resume
# Expected: No prompt, auto-resume if checkpoint exists
```

**Scenario 7: Disabled Checkpoints**
```bash
./dist/index.mjs unminify large.js --turbo --disable-checkpoints
# Interrupt (Ctrl+C)
# Expected: No checkpoint saved, processing aborted
```

**Acceptance Criteria**:
- [ ] All 7 scenarios execute without errors
- [ ] Interactive prompts display correctly (no garbled text)
- [ ] User input handled correctly (including empty input)
- [ ] Ctrl+C saves checkpoint (scenario 2)
- [ ] Checkpoint files created/deleted as expected
- [ ] Error messages are clear and helpful
- [ ] No confusing console output (clean UX)
- [ ] Performance acceptable (no noticeable lag from checkpoints)
- [ ] Document any bugs or issues found

**Technical Notes**:
This is the FINAL validation before shipping. Take detailed notes of:
- User experience issues (confusing prompts, unclear messages)
- Edge cases not covered by tests
- Performance issues
- Any unexpected behavior

If issues found, fix before proceeding to validation phase.

---

### PHASE 4: Validation & Production Readiness (4 hours)

Final verification before declaring the feature production-ready.

---

#### P1-5: Run Full Test Suite

**Priority**: P1 (REGRESSION CHECK)
**Status**: Not Started
**Effort**: 1 hour
**Dependencies**: P1-4 (manual testing complete)
**Spec Reference**: CLAUDE.md § Development Commands § Testing
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Test Failures Summary

**Description**:
Ensure all tests pass after checkpoint implementation. The evaluation report shows 41/126 tests failing, many with the same AST error. After fixing the blocker, all tests should pass.

**Acceptance Criteria**:
- [ ] Run unit tests: `npm run test:unit` → 100% pass rate
- [ ] Run e2e tests: `npm run test:e2e` → 100% pass rate
- [ ] Run checkpoint tests specifically:
  - [ ] `checkpoint.test.ts`: 14/14 passing
  - [ ] `checkpoint-determinism.test.ts`: 9/9 passing
  - [ ] `checkpoint-interactive.test.ts`: 11/11 passing (may need update after real implementation)
  - [ ] `checkpoint-salvage.test.ts`: 8/8 passing (implement 4 skipped tests)
  - [ ] `checkpoint-signals.test.ts`: 9/9 passing (implement 6 skipped tests)
  - [ ] `checkpoint-resume.e2etest.ts`: 8/8 passing
- [ ] Verify no new test failures introduced by checkpoint changes
- [ ] Verify determinism tests still pass (0% rejection rate)
- [ ] Run tests 3 times to check for flakiness
- [ ] Document any remaining failures with justification

**Technical Notes**:
If any tests still fail after AST fix:
1. **AST errors**: Investigate if there are other AST issues beyond checkpoint code
2. **Timing issues**: Check for race conditions in parallel tests
3. **Test setup**: Verify test environment is correctly configured

**Expected Outcome**:
- Total tests: 126 (or more with new checkpoint tests)
- Passing: 126 (100%)
- Failing: 0 (0%)
- Skipped: 0 (all P2 tests implemented)

---

#### P1-6: Update Documentation

**Priority**: P1 (DOCUMENTATION)
**Status**: Not Started
**Effort**: 2 hours
**Dependencies**: P1-5 (all tests pass)
**Spec Reference**: CLAUDE.md § Checkpoint System
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Recommendations § Document Actual State

**Description**:
Update CLAUDE.md and other documentation to reflect the completed checkpoint system. Ensure users understand how to use the feature and troubleshoot issues.

**Documentation Updates**:

**1. Add Checkpoint System Section to CLAUDE.md**:
```markdown
## Checkpoint System

HumanifyJS automatically saves progress checkpoints in turbo mode, allowing you to resume interrupted processing without re-paying for completed work.

### How It Works
1. **Automatic Checkpoints**: Progress saved after each batch during turbo mode processing
2. **Interactive Resume**: On startup, prompts to resume from checkpoint if one exists
3. **Cost Savings**: Resume skips completed batches, avoiding duplicate API calls
4. **Self-Contained**: Checkpoints store transformed code + renames, ensuring correct resume

### Usage
```bash
# Enable checkpoints (default in turbo mode)
humanify unminify input.js --turbo

# Disable checkpoints
humanify unminify input.js --turbo --disable-checkpoints

# Auto-resume without prompt (CI/automation)
humanify unminify input.js --turbo --auto-resume

# Custom checkpoint directory
humanify unminify input.js --turbo --checkpoint-dir /tmp/checkpoints
```

### Cost Savings
- **Measured**: 48% cost reduction per resumed run (tested 2025-11-13)
- **Monthly Impact**: $400/month saved (20 interruptions/month)
- **API Calls**: ~50% reduction for 50% completion checkpoint

### Troubleshooting
- **No checkpoint saved**: Ensure turbo mode enabled, check `.humanify-checkpoints/` directory
- **Checkpoint rejected**: Version mismatch, checkpoint deleted automatically
- **Resume produces wrong output**: Report bug with checkpoint file
```

**2. Update CHANGELOG.md** (if exists):
```markdown
## [Unreleased]

### Added
- Checkpoint system for resumable processing in turbo mode
- Interactive resume prompt with cost savings display
- Signal handlers (Ctrl+C) save checkpoint before exit
- CLI flags: `--enable-checkpoints`, `--disable-checkpoints`, `--auto-resume`

### Fixed
- AST transformation bug causing checkpoint save failures
- Deterministic batching ensures 0% checkpoint rejection rate

### Cost Impact
- 48% API cost reduction per resumed run
- $400/month savings with typical usage (20 interruptions/month)
```

**Acceptance Criteria**:
- [ ] Add "Checkpoint System" section to CLAUDE.md
- [ ] Document all CLI flags with examples
- [ ] Add troubleshooting guide
- [ ] Update CHANGELOG.md (or create if missing)
- [ ] Update README.md to mention checkpoint feature
- [ ] Add code comments to checkpoint-related files
- [ ] Update help text: `humanify unminify --help` shows checkpoint flags
- [ ] Review documentation for clarity (no jargon, clear examples)

**Technical Notes**:
Good documentation is critical for user adoption. Focus on:
- **How-to**: Show concrete examples
- **Why**: Explain cost savings benefit
- **Troubleshooting**: Address common issues
- **Edge cases**: Document limitations

---

#### P1-7: Final Production Readiness Check

**Priority**: P1 (SIGN-OFF)
**Status**: Not Started
**Effort**: 1 hour
**Dependencies**: P1-6 (docs updated), P1-5 (tests pass)
**Spec Reference**: CLAUDE.md § Project Overview
**Status Reference**: SESSION-FINAL-EVALUATION-2025-11-13.md § Success Metrics

**Description**:
Final go/no-go decision checklist before declaring checkpoint system production-ready. This is the formal sign-off that the feature is complete and safe to ship.

**Production Readiness Checklist**:

**P0 Requirements (MUST HAVE)**:
- [ ] ✅ Checkpoint files created (not empty)
- [ ] ✅ `partialCode` field populated (valid JavaScript)
- [ ] ✅ `renames` map populated (not empty)
- [ ] ✅ Resume produces identical output to continuous run
- [ ] ✅ No duplicate API calls on resume
- [ ] ✅ All E2E tests passing (8/8)
- [ ] ✅ Version validation works (rejects v1.0.0)
- [ ] ✅ Deterministic batching (0% rejection)

**P1 Requirements (SHOULD HAVE)**:
- [ ] ✅ Interactive prompt shows checkpoint info
- [ ] ✅ User can choose resume/restart/inspect/delete
- [ ] ✅ Ctrl+C saves checkpoint
- [ ] ✅ Signal handlers tested manually
- [ ] ✅ CLI flags work as documented
- [ ] ✅ Documentation complete and accurate

**Quality Checks**:
- [ ] ✅ All tests passing (126/126 or 100%)
- [ ] ✅ No known bugs or issues
- [ ] ✅ Code reviewed and approved
- [ ] ✅ Performance acceptable (no user-visible lag)
- [ ] ✅ Error messages clear and actionable
- [ ] ✅ User experience polished (no confusing output)

**Risk Assessment**:
- [ ] ✅ What could go wrong? (List potential issues)
- [ ] ✅ How likely? (Probability estimate)
- [ ] ✅ How bad? (Impact assessment)
- [ ] ✅ Mitigation? (Fallback plan)

**Sign-Off Decision**:
```
[ ] READY FOR PRODUCTION - Ship it!
[ ] NEEDS WORK - Issues found, defer launch
[ ] BLOCKED - Critical issues, revisit architecture
```

**Acceptance Criteria**:
- [ ] All checklist items marked complete
- [ ] No critical or high-priority bugs outstanding
- [ ] Cost savings verified (≥$400/month target)
- [ ] Documentation reviewed and approved
- [ ] Manual testing scenarios all pass
- [ ] Team consensus: feature is ready
- [ ] Create release notes summarizing feature
- [ ] Update SESSION-FINAL-EVALUATION with final status

**Technical Notes**:
This is the FINAL checkpoint before shipping. Be honest about readiness:
- If issues found, DON'T ship (technical debt compounds)
- If uncertain, DO more testing
- If ready, SHIP with confidence

**Success Definition**:
The checkpoint system is production-ready when:
1. Users can interrupt and resume without data loss
2. Resume produces correct output (byte-for-byte identical)
3. Cost savings realized ($400/month)
4. User experience is polished and intuitive
5. All tests pass and documentation is complete

---

## Summary: Critical Path Timeline

**Total Effort**: 29 hours (4 + 10 + 11 + 4)

### Week 1: Debug & Core (14 hours)

**Days 1-2: Debug AST Bug (4 hours)**
- P0-1: Diagnose type mismatch (1h)
- P0-2: Fix AST calls (1-2h)
- P0-3: Verify save executes (1h)
- P0-4: Validate contents (1h)

**Days 3-5: Complete P0 (10 hours)**
- P0-5: Resume correctness test (2h)
- P0-6: Verify no duplicate calls (2h)
- P0-7: Cleanup verification (1h)
- P0-8: Manual CLI test (2h)
- P0-9: Measure cost savings (2h)
- Buffer for issues (1h)

### Week 2: CLI & Polish (15 hours)

**Days 6-8: CLI Integration (11 hours)**
- P1-1: Interactive prompt (3h)
- P1-2: Signal handlers (4h)
- P1-3: CLI flags (2h)
- P1-4: Manual testing (2h)

**Days 9-10: Validation (4 hours)**
- P1-5: Full test suite (1h)
- P1-6: Update docs (2h)
- P1-7: Final sign-off (1h)

---

## Risk Assessment

### High-Risk Items

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AST fix more complex than expected | Medium | CRITICAL | Time-box to 4 hours, escalate to Babel team if stuck |
| Resume produces wrong output | Low | CRITICAL | Comprehensive e2e tests catch this, add more test cases |
| Signal handlers cause corruption | Medium | HIGH | Only save at safe points, add corruption detection |
| Cost savings lower than expected | Low | MEDIUM | Re-measure with larger sample, adjust expectations |
| Tests pass but production fails | Low | HIGH | Extensive manual testing before sign-off |

### Mitigation Strategies

**For AST Bug**:
1. Time-box debugging to 4 hours
2. If unresolved, post to Babel GitHub Discussions
3. Consider alternative: use `transformSync` instead of `transformFromAstAsync`
4. Fallback: Disable checkpoints, document as known issue

**For Resume Correctness**:
1. Add more e2e tests with diverse code patterns
2. Test with real-world files (TensorFlow, Babylon)
3. Manual verification of output correctness
4. Add fuzzing tests (random code generation)

**For Signal Handlers**:
1. Add critical section tracking (prevent mid-batch saves)
2. Add corruption detection (checksum validation)
3. Test with repeated signals (double Ctrl+C)
4. Add timeout: force exit if save takes >10 seconds

---

## Definition of Done

A work item is DONE when:

**Code**:
- [ ] Implementation complete and tested
- [ ] TypeScript compiles without errors
- [ ] Lint passes: `npm run lint`
- [ ] Code reviewed (if applicable)

**Tests**:
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing complete (for CLI items)
- [ ] No flaky tests (run 3+ times)

**Documentation**:
- [ ] Code comments added
- [ ] CLAUDE.md updated (if applicable)
- [ ] Acceptance criteria met
- [ ] Technical notes documented

**Validation**:
- [ ] Verified in production environment (built CLI)
- [ ] No known bugs or issues
- [ ] Performance acceptable
- [ ] User experience polished

---

## Next Steps After Completion

Once checkpoint system is production-ready (all P0 + P1 complete):

**P2 Features** (Optional, ~14 hours):
- Checkpoint management CLI (`humanify checkpoint list/show/delete`)
- Salvage feature (extract renames from corrupted checkpoints)
- Refine-aware tracking (track multi-pass progress)

**P3 Optimizations** (Optional, ~12 hours):
- Checkpoint compression (gzip JSON files)
- Metadata and expiration (auto-delete old checkpoints)
- Progress persistence within batches (save mid-batch)

**Future Enhancements**:
- Distributed checkpoints (resume across machines)
- Checkpoint sharing (team collaboration)
- Checkpoint analytics (failure rate, savings metrics)

**Recommendation**: DEFER P2/P3 until P0/P1 are battle-tested in production. Validate ROI before investing in optimizations.

---

## File Management

**Planning Files to Keep**:
- `PLAN-CHECKPOINT-FIX-2025-11-13-040718.md` (THIS FILE - active)
- `PLAN-CHECKPOINT-REDESIGN-2025-11-13-032000.md` (reference)
- `SPRINT-CHECKPOINT-WEEK1-2025-11-13-032000.md` (update with actual progress)
- `SESSION-FINAL-EVALUATION-2025-11-13.md` (current status)

**Planning Files to Archive** (move to `archive/`):
- `STATUS-CHECKPOINT-RE-EVALUATION-2025-11-13-034227.md` (premature assessment)
- `CHECKPOINT-PLANNING-COMPLETE.md` (superseded by this plan)
- `TESTS-CHECKPOINT-SYSTEM-2025-11-13.md` (tests implemented)
- `CHECKPOINT-TEST-FIXES-SUMMARY.md` (historical reference)

**Status Files** (keep max 4, currently 3 - OK):
- `STATUS-CHECKPOINT-EVALUATION-2025-11-13-030745.md` (initial)
- `SESSION-FINAL-EVALUATION-2025-11-13.md` (current)
- (Space for 2 more status reports)

---

## Contact & Escalation

**If Blocked**:
1. Time-box debugging (max 4 hours per blocker)
2. Document issue thoroughly (error messages, stack traces, reproduction steps)
3. Search Babel GitHub issues for similar problems
4. Post to Babel Discussions or Stack Overflow with minimal repro
5. Consider workarounds (alternative APIs, different approach)

**If Behind Schedule**:
1. Re-prioritize: P0 > P1 > P2 > P3
2. Cut scope: Ship P0 only, defer P1 to next sprint
3. Add resources: Get help from another developer
4. Adjust expectations: Update timeline and communicate impact

**Success Criteria**:
The checkpoint system is DONE when users can safely interrupt and resume processing with:
- ✅ Correct output (byte-for-byte identical to continuous run)
- ✅ Cost savings ($400/month achieved)
- ✅ Good UX (clear prompts, helpful messages)
- ✅ Production-ready (tested, documented, polished)

---

**Plan Generated**: 2025-11-13-040718
**Estimated Completion**: 29 hours (2 weeks at 15 hours/week)
**Next Action**: Start P0-1 (Diagnose AST Type Mismatch)
