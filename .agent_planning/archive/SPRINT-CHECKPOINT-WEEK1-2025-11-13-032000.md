# Sprint Plan: Checkpoint Redesign Week 1 - Stop the Bleeding

**Sprint Duration**: Week 1 (5 days)
**Sprint Goal**: Make checkpoints safe to use - fix critical bugs causing incorrect output
**Total Effort**: 16 hours
**Status Reference**: STATUS-CHECKPOINT-EVALUATION-2025-11-13-030745.md
**Plan Reference**: PLAN-CHECKPOINT-REDESIGN-2025-11-13-032000.md

---

## Sprint Objectives

By end of Week 1, checkpoints should:
1. ✅ Not produce incorrect output (AST state preserved)
2. ✅ Actually save progress (renames map populated)
3. ✅ Require user consent (interactive prompt)
4. ✅ Be safe to enable (behind flag with warning)

**Success Criteria**: User can enable checkpoints, get interrupted, and resume with CORRECT output.

---

## Sprint Backlog

### Day 1-2: Foundation (6 hours)

#### Task 1: Add Safety Flag and Warning (2 hours)

**Priority**: P0 (Blocker)
**Description**: Disable checkpoints by default, add explicit enable flag

**Implementation Steps**:
1. Add `--enable-checkpoints` boolean flag to CLI parser
   - File: `src/cli.ts` (add to commonOptions)
   - Default: `false`
2. Add `--disable-checkpoints` flag (explicit disable)
3. Modify all command files to check flag before using checkpoints
   - Files: `src/commands/openai.ts`, `src/commands/gemini.ts`, `src/commands/local.ts`
   - Change: `const checkpointId = getCheckpointId(inputCode)` → `const checkpointId = opts.enableCheckpoints ? getCheckpointId(inputCode) : undefined`
4. Add warning when enabled
   - Print: "⚠️  Checkpoints enabled (experimental). May produce incorrect output if system is interrupted."
5. Update help text to explain experimental status

**Acceptance Criteria**:
- [ ] Checkpoints disabled by default
- [ ] `--enable-checkpoints` flag works for all providers
- [ ] Warning printed when enabled
- [ ] All tests pass with default (disabled) checkpoints
- [ ] Manual test: run with `--enable-checkpoints`, verify checkpoint saved

**Files Modified**:
- `src/cli.ts`
- `src/commands/openai.ts`
- `src/commands/gemini.ts`
- `src/commands/local.ts`

---

#### Task 2: Fix Renames History Persistence (4 hours)

**Priority**: P0 (Critical)
**Description**: Fix bug where renamesHistory is always empty in checkpoints

**Problem Analysis**:
```typescript
// Current code (BROKEN):
const renamesHistory: Array<...> = []; // Line 183 - Fresh array every time!

// Checkpoint save:
for (const rename of renamesHistory) {
  renamesMap[rename.oldName] = rename.newName;
}
// renamesHistory is empty → renamesMap is empty → checkpoint.renames is {}
```

**Root Cause**: `renamesHistory` is local to function, initialized empty, never loaded from checkpoint.

**Implementation Steps**:
1. Modify `renamesHistory` initialization to load from checkpoint
   - File: `src/plugins/local-llm-rename/visit-all-identifiers.ts` (line 183)
   - Logic:
     ```typescript
     const renamesHistory: Array<{ oldName: string; newName: string; scopePath: string }> = [];

     // After checkpoint is loaded (line 240-271 section)
     if (checkpoint) {
       // Restore renames history from checkpoint
       for (const [oldName, newName] of Object.entries(checkpoint.renames)) {
         renamesHistory.push({
           oldName,
           newName,
           scopePath: '' // scopePath not needed for resume, only for tracking
         });
       }
       console.log(`   Loaded ${renamesHistory.length} previous renames from checkpoint`);
     }
     ```

2. Verify checkpoint contains renames after first batch
   - Add debug log after checkpoint save (line 360-368)
   - Log: `console.log('DEBUG: Saved checkpoint with ${Object.keys(renamesMap).length} renames')`

3. Write unit test verifying renames persistence
   - File: `src/checkpoint.test.ts` (new file)
   - Test: Create checkpoint with renames → save → load → verify renames present

4. Manual test: Run with `--enable-checkpoints`, kill after batch 1, inspect checkpoint JSON
   - Checkpoint should have `"renames": { "oldName1": "newName1", ... }`

**Acceptance Criteria**:
- [ ] After batch 1 completes, checkpoint contains renames in JSON file
- [ ] On resume, `renamesHistory` is populated from checkpoint
- [ ] Unit test passes: checkpoint save/load preserves renames
- [ ] Manual test: checkpoint JSON has non-empty renames object

**Files Modified**:
- `src/plugins/local-llm-rename/visit-all-identifiers.ts` (lines 183, 240-271)

**Files Created**:
- `src/checkpoint.test.ts`

---

### Day 3-4: Interactive Resume (9 hours)

#### Task 3: Add Interactive Resume Prompt (5 hours)

**Priority**: P0 (Critical)
**Description**: Replace silent auto-resume with user prompt and consent

**Implementation Steps**:

1. Create prompt utility function
   - File: `src/checkpoint-prompt.ts` (new file)
   - Function: `promptResumeCheckpoint(checkpoint: Checkpoint): Promise<'resume' | 'delete' | 'skip'>`
   - Display:
     ```
     📂 Found checkpoint from [timestamp]
        Progress: X/Y batches (Z%)
        Renames: N identifiers processed
        Estimated savings: ~$M

     Resume from checkpoint? [Y/n/inspect/delete]:
     ```
   - Handle responses:
     - `Y` or Enter → return 'resume'
     - `n` → return 'skip'
     - `inspect` → print full checkpoint JSON, then exit
     - `delete` → return 'delete'
   - Use Node.js `readline` module for input

2. Add prompt to checkpoint loading flow
   - File: `src/plugins/local-llm-rename/visit-all-identifiers.ts` (line 240)
   - After checkpoint is loaded, before checking batch count:
     ```typescript
     if (checkpoint && !opts.noInteractive) {
       const action = await promptResumeCheckpoint(checkpoint);

       if (action === 'delete') {
         deleteCheckpoint(checkpointId);
         checkpoint = null;
         console.log('✅ Checkpoint deleted. Starting fresh.\n');
       } else if (action === 'skip') {
         // Rename checkpoint to .backup so it's not loaded next time
         const backupPath = getCheckpointPath(checkpointId + '.backup');
         fs.renameSync(getCheckpointPath(checkpointId), backupPath);
         checkpoint = null;
         console.log('💾 Checkpoint saved as backup. Starting fresh.\n');
       } else {
         // action === 'resume', continue with existing logic
         console.log('▶️  Resuming from checkpoint...\n');
       }
     }
     ```

3. Add `--no-interactive` flag for CI environments
   - File: `src/cli.ts`
   - Add boolean flag `noInteractive` (default: false)
   - When true, always resume without prompt

4. Add `--fresh-start` flag to force fresh run
   - File: `src/cli.ts`
   - Add boolean flag `freshStart` (default: false)
   - When true, skip checkpoint loading entirely (don't even look for checkpoint)

5. Estimate remaining cost calculation
   - Function: `estimateRemainingCost(checkpoint: Checkpoint, provider: string): number`
   - Rough costs per batch:
     - OpenAI gpt-4o-mini: ~$0.01/batch
     - Gemini: ~$0.005/batch
     - Local: $0
   - Formula: `(totalBatches - completedBatches) × costPerBatch`

**Acceptance Criteria**:
- [ ] Prompt displays on resume with checkpoint info
- [ ] "Y" or Enter resumes from checkpoint
- [ ] "n" skips checkpoint and starts fresh (keeps backup)
- [ ] "delete" deletes checkpoint and starts fresh
- [ ] "inspect" shows full checkpoint JSON and exits
- [ ] `--no-interactive` flag auto-resumes without prompt
- [ ] `--fresh-start` flag bypasses checkpoint loading
- [ ] Manual test: Run, kill, restart, verify prompt appears

**Files Modified**:
- `src/plugins/local-llm-rename/visit-all-identifiers.ts`
- `src/cli.ts`

**Files Created**:
- `src/checkpoint-prompt.ts`

---

#### Task 4: Store Transformed Code in Checkpoint (4 hours)

**Priority**: P0 (Critical)
**Description**: Store AST-transformed code so resume operates on correct state

**Problem Analysis**:
Current: Resume parses ORIGINAL code → fresh AST → skip batches 1-N → LLM sees minified names
Needed: Resume parses TRANSFORMED code → correct AST → continue from batch N+1 → LLM sees semantic names

**Implementation Steps**:

1. Add transformed code generation after each batch
   - File: `src/plugins/local-llm-rename/visit-all-identifiers.ts` (line 360)
   - After batch completes, transform AST back to code:
     ```typescript
     import { transformFromAstSync } from '@babel/core';

     // After batch completes, before saving checkpoint
     const transformedCode = transformFromAstSync(ast, code, {
       retainLines: false,
       compact: false,
       comments: true
     })?.code || code;
     ```

2. Store in checkpoint
   - Modify `saveCheckpoint()` call (line 360-368):
     ```typescript
     saveCheckpoint(checkpointId, {
       version: "1.0.0",
       timestamp: Date.now(),
       inputHash: checkpointId,
       completedBatches: batchIdx + 1,
       totalBatches: batches.length,
       renames: renamesMap,
       partialCode: transformedCode // Store transformed code
     });
     ```

3. Load transformed code on resume
   - File: `src/plugins/local-llm-rename/visit-all-identifiers.ts` (line 240-271)
   - After checkpoint loaded and user confirmed resume:
     ```typescript
     if (checkpoint && checkpoint.partialCode) {
       console.log('📂 Resuming from transformed code state...');
       code = checkpoint.partialCode; // Override original code
     }

     // Now parse this code (which has renames applied)
     const ast = await parseAsync(code);
     ```

4. Update Checkpoint interface
   - File: `src/checkpoint.ts` (line 12)
   - Change comment from `// AST transformed to code with renames applied so far`
   - To: `// Transformed code with all renames from completed batches applied`

5. Write e2e test verifying correctness
   - File: `src/checkpoint-resume.e2etest.ts` (new file)
   - Test: Run to batch 5 → save checkpoint → kill → resume → verify output matches continuous run
   - Use small test file (50 identifiers, 10 batches)
   - Mock visitor to return deterministic names

**Acceptance Criteria**:
- [ ] Checkpoint contains `partialCode` field with transformed code
- [ ] On resume, code is loaded from `partialCode`
- [ ] Resume output matches continuous run output (correctness test)
- [ ] E2E test passes: resume from 50% produces correct output
- [ ] Manual test: Run, kill after batch 5, inspect checkpoint, verify `partialCode` is populated

**Files Modified**:
- `src/plugins/local-llm-rename/visit-all-identifiers.ts`
- `src/checkpoint.ts` (interface comment)

**Files Created**:
- `src/checkpoint-resume.e2etest.ts`

---

### Day 5: Integration and Testing (1 hour buffer)

#### Task 5: Integration Testing and Bug Fixes

**Priority**: P0
**Description**: End-to-end testing of Week 1 changes

**Test Scenarios**:

1. **Happy path: Resume from 50%**
   - Run with `--enable-checkpoints`
   - Kill after batch 5 of 10
   - Restart, respond "Y" to prompt
   - Verify output matches continuous run

2. **User declines resume**
   - Run with `--enable-checkpoints`
   - Kill after batch 5
   - Restart, respond "n" to prompt
   - Verify starts fresh (checkpoint moved to backup)

3. **User deletes checkpoint**
   - Run with `--enable-checkpoints`
   - Kill after batch 5
   - Restart, respond "delete" to prompt
   - Verify checkpoint deleted, starts fresh

4. **CI mode (no interactive)**
   - Run with `--enable-checkpoints --no-interactive`
   - Kill after batch 5
   - Restart (with same flags)
   - Verify auto-resumes without prompt

5. **Fresh start flag**
   - Run with `--enable-checkpoints`
   - Kill after batch 5
   - Restart with `--fresh-start`
   - Verify no prompt, starts fresh

6. **Checkpoints disabled (default)**
   - Run without `--enable-checkpoints`
   - Kill after processing some identifiers
   - Restart
   - Verify no checkpoint, no prompt, starts fresh

**Bug Fixes**:
- Address any issues found during testing
- Refine error messages
- Improve user experience based on manual testing

**Acceptance Criteria**:
- [ ] All 6 test scenarios pass
- [ ] No regressions in existing tests
- [ ] Error messages are clear and helpful
- [ ] Week 1 sprint goal achieved: Checkpoints produce correct output

---

## Testing Strategy for Week 1

### Unit Tests
- `src/checkpoint.test.ts`: Test checkpoint I/O and renames persistence
- Run with: `npm run test:unit -- src/checkpoint.test.ts`

### E2E Tests
- `src/checkpoint-resume.e2etest.ts`: Test resume correctness
- Run with: `npm run test:e2e -- src/checkpoint-resume.e2etest.ts`

### Manual Tests
- Use small test file (~50 identifiers) for quick iteration
- Test with OpenAI provider (fastest for testing)
- Use `just test-small` recipe if available

### Regression Tests
- Run full test suite: `npm test`
- Ensure no existing functionality broken

---

## Risk Management

### Risks Identified

1. **Risk**: Transformed code storage makes checkpoints too large
   - **Mitigation**: Measure checkpoint size, add compression if needed (defer to Week 4)
   - **Threshold**: If checkpoint >1MB for typical file, add compression

2. **Risk**: Prompt UX is confusing
   - **Mitigation**: Test with real users, iterate on messaging
   - **Fallback**: Add `--auto-resume` flag to skip prompt

3. **Risk**: Resume output doesn't match continuous run
   - **Mitigation**: E2E test must verify byte-for-byte match
   - **Debug**: Add `--debug-checkpoint` flag to log AST state before/after resume

4. **Risk**: CI mode breaks existing workflows
   - **Mitigation**: `--no-interactive` is opt-in, default behavior unchanged
   - **Test**: Run in GitHub Actions to verify no interactive prompts

---

## Definition of Done

Week 1 is complete when:
- [ ] All 5 tasks completed (18 checkboxes total)
- [ ] Unit tests pass (checkpoint persistence test)
- [ ] E2E tests pass (resume correctness test)
- [ ] Manual testing scenarios all pass (6 scenarios)
- [ ] No regressions in existing test suite
- [ ] Code reviewed and cleaned up
- [ ] Documentation updated (CLAUDE.md, inline comments)

---

## Deliverables

1. **Code Changes**:
   - Modified files: 5
   - New files: 3
   - Total lines changed: ~300-400

2. **Tests**:
   - Unit tests: 1 file
   - E2E tests: 1 file
   - Test coverage: Checkpoint I/O, resume correctness, prompt UX

3. **Documentation**:
   - Inline code comments explaining checkpoint flow
   - Updated CLAUDE.md with checkpoint status
   - CLI help text for new flags

4. **User-Facing Changes**:
   - `--enable-checkpoints` flag (default: disabled)
   - Interactive resume prompt (Y/n/inspect/delete)
   - `--no-interactive` and `--fresh-start` flags
   - Improved checkpoint reliability (correct output on resume)

---

## Success Metrics

At end of Week 1, measure:
- ✅ Resume correctness: 100% (output matches continuous run)
- ✅ Checkpoint data: Renames map populated (not empty)
- ✅ User control: Prompt shown, user can decline
- ✅ Safety: Checkpoints disabled by default

**Goal**: Demonstrate that checkpoints CAN work correctly, laying foundation for Week 2+ improvements.

---

## Next Steps (Week 2 Preview)

After Week 1, focus shifts to reliability:
- Make batching deterministic (no more rejected checkpoints)
- Add refine iteration tracking
- Add comprehensive validation

But that's Week 2. For now: **Make checkpoints safe and correct**.

