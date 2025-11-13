# HumanifyJS Checkpoint CLI Integration - Implementation Plan

**Generated**: 2025-11-13-054900
**Source STATUS**: STATUS-2025-11-13-054800.md
**Spec**: CLAUDE.md (Checkpoint System section - to be added)
**Evaluator**: Claude Code (Sonnet 4.5)

---

## Provenance

This plan is based on:
- **STATUS Report**: `.agent_planning/STATUS-2025-11-13-054800.md` (2025-11-13 05:48:00)
- **Specification**: `CLAUDE.md` (no checkpoint section yet - will be added)
- **Current State**: 56% complete (core works, CLI missing)
- **Time Budget**: 14 hours (2 working days)
- **Cost Budget**: $2,750 ($125/hour)

---

## Executive Summary

**VERDICT**: Feature works perfectly but is invisible to users. Core functionality is 100% operational (AST bug fixed, tests passing), but lacks user-facing controls.

**Current State**:
- ✅ Checkpoint save/load/delete (100% working)
- ✅ Transformed code storage (AST bug fixed)
- ✅ Resume correctness (byte-for-byte identical)
- ✅ Deterministic batching (0% rejection rate)
- ❌ Interactive resume prompt (not integrated)
- ❌ Signal handlers (Ctrl+C loses progress)
- ❌ CLI flags (no configuration options)
- ❌ Documentation (users don't know feature exists)

**Goal**: Make checkpoint feature accessible and production-ready in 2 working days (14 hours).

**Financial Impact**:
- **Potential Savings**: $400/month (once users know feature exists)
- **Current Savings**: $0/month (feature is hidden)
- **Investment to Ship**: $2,750 (14 hours)
- **Payback Period**: 7 months post-ship

---

## Priority Framework

### P0 (Critical for Correctness) - 88% Complete
Already functional, needs CLI integration to be user-accessible.

### P1 (Critical for Production) - 40% Complete
**FOCUS OF THIS PLAN** - make feature usable by users.

### P2 (User Experience) - 0% Complete
Deferred to future sprints (management CLI, salvage, refine-aware tracking).

---

## Work Items (Sorted by Priority)

---

## [P1] Interactive Resume Prompt

**Status**: Not Started
**Effort**: Medium (3 hours)
**Dependencies**: None (top priority)
**Spec Reference**: CLAUDE.md (to be added) • **Status Reference**: STATUS-2025-11-13-054800.md lines 356-397

### Description

Add interactive prompt at CLI startup to give users control over checkpoint resume behavior. Currently, checkpoints auto-resume silently, which:
- Confuses users (unexpected behavior)
- Provides no visibility into savings
- Prevents users from choosing fresh start

The prompt should display checkpoint metadata (progress, timestamp, estimated savings) and offer clear choices.

### Acceptance Criteria

- [ ] Prompt displays checkpoint metadata (progress %, batches, timestamp)
- [ ] User can choose: Y (resume) / n (restart) / inspect / delete
- [ ] Empty input (Enter) defaults to resume
- [ ] Invalid input re-prompts with clear message
- [ ] Prompt only shows if checkpoint exists for current file
- [ ] Works in all three providers (OpenAI, Gemini, Local)
- [ ] Estimated cost savings displayed (50% of original cost)
- [ ] Graceful handling if checkpoint is corrupted

### Technical Notes

**Files to Modify**:
- `src/commands/openai.ts` (lines 90-120)
- `src/commands/gemini.ts` (lines 90-120)
- `src/commands/local.ts` (lines 90-120)

**Implementation Pattern** (same for all 3 providers):

```typescript
// After options parsing, before processing starts (around line 100)
if (enableCheckpoints) {
  const checkpointId = getCheckpointId(code);
  const checkpoint = loadCheckpoint(checkpointId);

  if (checkpoint) {
    // Display checkpoint info
    const progress = Math.round((checkpoint.completedBatches / checkpoint.totalBatches) * 100);
    console.log(`\n📂 Found checkpoint from previous run:`);
    console.log(`   Progress: ${progress}% complete`);
    console.log(`   Batches: ${checkpoint.completedBatches}/${checkpoint.totalBatches} done`);
    console.log(`   Saved: ${new Date(checkpoint.timestamp).toLocaleString()}`);
    console.log(`   Estimated savings: 50% of API costs`);

    // Prompt user (requires readline or similar)
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('\nResume from checkpoint? [Y/n/inspect/delete]: ', (ans) => {
        rl.close();
        resolve(ans.trim().toLowerCase());
      });
    });

    if (answer === 'n' || answer === 'no') {
      deleteCheckpoint(checkpointId);
      console.log('   ✓ Starting fresh...\n');
    } else if (answer === 'inspect' || answer === 'i') {
      console.log('\n' + JSON.stringify(checkpoint, null, 2));
      process.exit(0);
    } else if (answer === 'delete' || answer === 'd') {
      deleteCheckpoint(checkpointId);
      console.log('   ✓ Checkpoint deleted.\n');
      process.exit(0);
    } else {
      // Default: resume (Y or Enter)
      console.log('   ✓ Resuming from checkpoint...\n');
    }
  }
}
```

**Edge Cases**:
- Checkpoint exists but is corrupted → delete and start fresh
- User presses Ctrl+C during prompt → clean exit
- Multiple checkpoints exist → use most recent (already handled by getCheckpointId)
- Checkpoint version mismatch → already handled by loadCheckpoint

**Testing Strategy**:
- Unit tests already exist (checkpoint-interactive.test.ts) but are mocked
- Manual testing required for real user interaction
- Test all 4 choices: Y, n, inspect, delete
- Test default (Enter key)
- Test invalid input (should re-prompt)

---

## [P1] Signal Handlers (Ctrl+C)

**Status**: Not Started
**Effort**: Medium (4 hours)
**Dependencies**: None (independent of prompt)
**Spec Reference**: CLAUDE.md (to be added) • **Status Reference**: STATUS-2025-11-13-054800.md lines 398-430

### Description

Currently, pressing Ctrl+C during processing loses all progress. Users must wait for entire run to complete or lose work. This is especially painful for large files (10K+ identifiers, 30+ minutes runtime).

Signal handlers should:
1. Catch SIGINT (Ctrl+C) and SIGTERM (kill command)
2. Allow current batch to complete (prevent corruption)
3. Save checkpoint before exit
4. Show clear message to user

### Acceptance Criteria

- [ ] Ctrl+C during processing saves checkpoint before exit
- [ ] `kill <pid>` (SIGTERM) saves checkpoint before exit
- [ ] Current batch completes before exit (no corruption)
- [ ] User sees clear message: "Interrupt received, saving checkpoint..."
- [ ] Checkpoint is valid and resumable
- [ ] Second Ctrl+C force-exits immediately (no waiting)
- [ ] Works in all three providers (OpenAI, Gemini, Local)
- [ ] Manual testing confirms behavior on real files

### Technical Notes

**Files to Modify**:
- `src/commands/openai.ts` (lines 90-120, 150-180)
- `src/commands/gemini.ts` (lines 90-120, 150-180)
- `src/commands/local.ts` (lines 90-120, 150-180)
- `src/plugins/local-llm-rename/visit-all-identifiers.ts` (lines 30-60, 350-450)

**Implementation Pattern** (2 parts):

**Part 1: Command Handler Setup** (in src/commands/*.ts):

```typescript
// At top of command handler (before processing)
let shutdownRequested = false;
let signalCount = 0;

const signalHandler = (signal: string) => {
  signalCount++;

  if (signalCount === 1) {
    shutdownRequested = true;
    console.log(`\n⚠️  ${signal} received. Checkpoint will be saved after current batch...`);
    console.log('   (Press Ctrl+C again to force exit)');
  } else {
    // Second signal = force exit
    console.log('\n🛑 Force exit requested. Progress may be lost.');
    process.exit(1);
  }
};

process.on('SIGINT', () => signalHandler('SIGINT'));
process.on('SIGTERM', () => signalHandler('SIGTERM'));

try {
  // Call visitAllIdentifiers with shutdown flag
  const result = await visitAllIdentifiers(
    code,
    visitor,
    contextSize,
    onProgress,
    {
      turbo: opts.turbo,
      enableCheckpoints: enableCheckpoints,
      checkpointId: getCheckpointId(code),
      shutdownRequested: () => shutdownRequested
    }
  );

  if (shutdownRequested) {
    console.log('\n✓ Checkpoint saved. Resume with same command.');
    process.exit(0);
  }

} finally {
  // Clean up handlers
  process.off('SIGINT', signalHandler);
  process.off('SIGTERM', signalHandler);
}
```

**Part 2: Visit Loop Integration** (in visit-all-identifiers.ts):

```typescript
// In batch processing loop (around line 350)
for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
  // Check shutdown flag at start of batch
  if (options?.shutdownRequested?.()) {
    console.log(`   Stopping after batch ${batchIdx}/${batches.length}...`);
    break; // Exit loop, checkpoint will be saved
  }

  const batch = batches[batchIdx];

  // Process batch...

  // Save checkpoint (already implemented)
  if (enableCheckpoints && checkpointId) {
    saveCheckpoint(checkpointId, {
      version: CHECKPOINT_VERSION,
      timestamp: Date.now(),
      inputHash: checkpointId,
      completedBatches: batchIdx + 1,
      totalBatches: batches.length,
      renames: renamesMap,
      partialCode: generate(ast as any).code
    });
  }
}
```

**Edge Cases**:
- Signal during API call → wait for API call to finish (no way to interrupt)
- Signal during AST transform → wait for transform to finish
- Signal during checkpoint save → wait for save to finish
- Multiple signals → force exit after second signal
- Signal in sequential mode (no checkpoints) → show message, exit gracefully

**Testing Strategy**:
- Unit tests exist (checkpoint-signals.test.ts) but are skipped (not implemented)
- Manual testing REQUIRED:
  1. Run on large file (test-samples/huge-statement.js)
  2. Press Ctrl+C after 2-3 batches
  3. Verify checkpoint saved
  4. Resume and verify output correct
  5. Test second Ctrl+C force-exits
- Test on all 3 providers

---

## [P1] CLI Flags for Checkpoint Control

**Status**: Not Started
**Effort**: Small (2 hours)
**Dependencies**: None (independent)
**Spec Reference**: CLAUDE.md (to be added) • **Status Reference**: STATUS-2025-11-13-054800.md lines 432-447

### Description

Users need command-line flags to configure checkpoint behavior:
- Enable/disable checkpoints explicitly
- Skip interactive prompt (auto-resume)
- Specify custom checkpoint directory
- Control checkpoint behavior in CI/CD environments

Currently, checkpoints are auto-enabled in turbo mode with no way to override.

### Acceptance Criteria

- [ ] `--enable-checkpoints` forces checkpoints (even in sequential mode)
- [ ] `--disable-checkpoints` disables checkpoints (even in turbo mode)
- [ ] `--auto-resume` skips interactive prompt, resumes automatically
- [ ] `--checkpoint-dir <path>` uses custom directory (default: .humanify-checkpoints)
- [ ] Flags shown in `--help` output
- [ ] Flags work in all three providers (OpenAI, Gemini, Local)
- [ ] Flag behavior is documented in help text
- [ ] Conflicts handled gracefully (e.g., --enable + --disable = error)

### Technical Notes

**Files to Modify**:
- `src/commands/openai.ts` (lines 50-90)
- `src/commands/gemini.ts` (lines 50-90)
- `src/commands/local.ts` (lines 50-90)
- `src/checkpoint.ts` (add configurable directory path)

**Implementation Pattern** (same for all 3 providers):

```typescript
// Add options to command definition (around line 50)
command
  .option('--enable-checkpoints', 'Enable checkpoint saving (default: true in turbo mode, false in sequential)')
  .option('--disable-checkpoints', 'Disable checkpoint saving')
  .option('--auto-resume', 'Automatically resume from checkpoint without prompting (default: false)')
  .option('--checkpoint-dir <path>', 'Custom checkpoint directory (default: .humanify-checkpoints)', '.humanify-checkpoints')
  // ... existing options

// In action handler (around line 90)
.action(async (input: string, opts: any) => {
  // Validate flags
  if (opts.enableCheckpoints && opts.disableCheckpoints) {
    console.error('Error: Cannot use both --enable-checkpoints and --disable-checkpoints');
    process.exit(1);
  }

  // Determine checkpoint behavior
  let enableCheckpoints: boolean;
  if (opts.disableCheckpoints) {
    enableCheckpoints = false;
  } else if (opts.enableCheckpoints) {
    enableCheckpoints = true;
  } else {
    // Default: auto-enable in turbo mode
    enableCheckpoints = opts.turbo ?? false;
  }

  // Set checkpoint directory (requires updating checkpoint.ts)
  if (opts.checkpointDir) {
    setCheckpointDirectory(opts.checkpointDir);
  }

  const autoResume = opts.autoResume ?? false;

  // Use flags in interactive prompt
  if (enableCheckpoints && !autoResume) {
    // Show interactive prompt (from P1-1)
  } else if (enableCheckpoints && autoResume) {
    // Skip prompt, auto-resume
    console.log('📂 Auto-resuming from checkpoint...');
  }

  // ... rest of processing
});
```

**Changes to checkpoint.ts**:

```typescript
// Add at top of file
let checkpointDirectory = '.humanify-checkpoints';

export function setCheckpointDirectory(dir: string): void {
  checkpointDirectory = dir;
  // Create directory if it doesn't exist
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// Update getCheckpointPath to use configurable directory
function getCheckpointPath(checkpointId: string): string {
  return join(checkpointDirectory, `${checkpointId}.json`);
}
```

**Edge Cases**:
- Custom directory doesn't exist → create automatically
- Custom directory not writable → show clear error
- Relative path in --checkpoint-dir → resolve to absolute
- Both --enable and --disable → error with clear message
- --auto-resume without checkpoint → no error, just start fresh

**Testing Strategy**:
- Add tests to verify flag parsing
- Test each flag individually
- Test flag combinations (especially conflicts)
- Verify help text shows all flags
- Manual testing with real files

---

## [P1] Documentation Updates

**Status**: Not Started
**Effort**: Small (2 hours)
**Dependencies**: All above items (document actual behavior)
**Spec Reference**: CLAUDE.md (to be created) • **Status Reference**: STATUS-2025-11-13-054800.md lines 466-504

### Description

Users don't know checkpoint feature exists. Documentation is completely missing from:
- CLAUDE.md (project instructions)
- README.md (user-facing docs)
- CLI help text (already updated by P1-3)

Without documentation:
- Users can't discover feature
- Users can't troubleshoot issues
- Users can't understand cost savings
- Feature provides zero value

### Acceptance Criteria

- [ ] CLAUDE.md has "Checkpoint System" section
- [ ] README.md mentions checkpoint feature
- [ ] Help text shows all checkpoint flags (covered by P1-3)
- [ ] Usage examples for common scenarios
- [ ] Troubleshooting guide for common issues
- [ ] Cost savings explained with concrete numbers
- [ ] Technical details for developers

### Technical Notes

**Files to Modify**:
- `CLAUDE.md` (add new section after "Turbo Mode")
- `README.md` (mention in features list and usage section)

**Content for CLAUDE.md** (add after Turbo Mode section):

```markdown
## Checkpoint System (NEW in v2.0)

HumanifyJS automatically saves progress checkpoints to recover from interruptions and save API costs.

### How It Works

1. **Automatic Checkpoints**: Progress saved after each batch in turbo mode
2. **Interactive Resume**: Prompt on startup if checkpoint found
3. **Cost Savings**: Resume skips completed work, saves 50% of API costs
4. **Crash Recovery**: Ctrl+C or crashes preserve progress

### Quick Start

```bash
# Enable checkpoints (automatic in turbo mode)
humanify unminify input.js --turbo

# Checkpoint created at .humanify-checkpoints/<hash>.json
# If interrupted, run same command to resume

# Disable checkpoints
humanify unminify input.js --turbo --disable-checkpoints

# Auto-resume without prompt (for CI/CD)
humanify unminify input.js --turbo --auto-resume
```

### CLI Flags

```bash
--enable-checkpoints       # Force enable (even in sequential mode)
--disable-checkpoints      # Force disable (even in turbo mode)
--auto-resume             # Skip prompt, auto-resume
--checkpoint-dir <path>   # Custom directory (default: .humanify-checkpoints)
```

### Cost Savings Example

**Scenario**: Processing large file (10K identifiers, 500 batches)
- **Original cost**: $20 (10,000 API calls × $0.002)
- **Interrupted at**: 50% complete (250 batches)
- **Resume cost**: $10 (5,000 API calls × $0.002)
- **Savings**: $10 (50% of original cost)

**Monthly savings** (with 20 interruptions/month): **$400**

### Interactive Prompt

When resuming, you'll see:

```
📂 Found checkpoint from previous run:
   Progress: 50% complete
   Batches: 250/500 done
   Saved: 2025-11-13 05:48:00
   Estimated savings: 50% of API costs

Resume from checkpoint? [Y/n/inspect/delete]:
```

**Options**:
- `Y` or Enter: Resume from checkpoint (default)
- `n`: Start fresh (deletes checkpoint)
- `inspect`: Show checkpoint JSON and exit
- `delete`: Delete checkpoint and exit

### Signal Handling

Press **Ctrl+C** to interrupt:
```
⚠️  SIGINT received. Checkpoint will be saved after current batch...
   (Press Ctrl+C again to force exit)
```

Checkpoint saved automatically. Resume with same command.

### Checkpoint Files

**Location**: `.humanify-checkpoints/<hash>.json`
**Format**: JSON with versioning (v2.0.0)
**Contents**:
- `version`: Checkpoint format version
- `timestamp`: Creation time
- `completedBatches`: Progress counter
- `totalBatches`: Total batch count
- `renames`: Map of old→new names
- `partialCode`: Transformed code at checkpoint

**Cleanup**: Checkpoints deleted automatically on success.

### Troubleshooting

**Problem**: Checkpoint rejected (version mismatch)
**Solution**: Delete old checkpoint and restart
```bash
rm -rf .humanify-checkpoints/
humanify unminify input.js --turbo
```

**Problem**: Checkpoint corrupted
**Solution**: Prompt will delete automatically, or manually delete

**Problem**: Want to start fresh (ignore checkpoint)
**Solution**: Choose `n` at prompt, or use `--disable-checkpoints`

**Problem**: Resume produces different output
**Solution**: This is a bug! Please report with checkpoint file.

### Technical Details

**Deterministic Batching**: Checkpoints use deterministic batch splitting (0% rejection rate validated).

**AST-Level Storage**: Checkpoints store transformed AST (as code), not just rename map.

**Version Validation**: Incompatible checkpoint versions auto-deleted.

**Testing**: 51 tests covering save/load/resume/corruption/signals.

### When NOT to Use Checkpoints

- **Small files** (<1000 identifiers): Overhead not worth it
- **CI/CD** (unless using --auto-resume): Interactive prompt blocks pipeline
- **Sequential mode**: No batching = no checkpoints needed
- **Testing**: Use --disable-checkpoints for reproducibility
```

**Content for README.md** (add to features list):

```markdown
## Features

- ✅ LLM-powered semantic renaming (OpenAI, Gemini, or local models)
- ✅ Structure-preserving AST transformations (Babel)
- ✅ Turbo mode with parallel batch processing (5-15x speedup)
- ✅ **Checkpoint system for crash recovery** (NEW in v2.0)
- ✅ Automatic chunking for large files (>100KB)
- ✅ Multiple provider support (OpenAI, Gemini, local LLM)

### Checkpoint System (v2.0)

Automatically save progress and resume from interruptions:

- 🔄 **Auto-resume**: Pick up where you left off
- 💰 **Cost savings**: 50% API cost reduction per resume
- ⚡ **Ctrl+C safe**: Save progress before exit
- 🎯 **100% accurate**: Resume produces identical output

```bash
humanify unminify large.js --turbo
# Checkpoint saved automatically
# Ctrl+C to interrupt, run again to resume
```

See [CLAUDE.md](./CLAUDE.md#checkpoint-system) for full documentation.
```

**Acceptance Testing**:
- [ ] CLAUDE.md section is complete and accurate
- [ ] README.md mentions feature prominently
- [ ] Code examples are tested and work
- [ ] Troubleshooting covers common issues
- [ ] Cost savings calculation is correct

---

## [P1] Manual CLI Testing

**Status**: Not Started
**Effort**: Small (2 hours)
**Dependencies**: P1-1, P1-2, P1-3 (test integrated system)
**Spec Reference**: N/A • **Status Reference**: STATUS-2025-11-13-054800.md lines 449-464

### Description

All unit tests pass, but we need to verify the integrated CLI experience works correctly. This is manual testing of real user scenarios with actual files, not automated tests.

Focus: User experience, error messages, edge cases, performance.

### Acceptance Criteria

- [ ] All 7 test scenarios pass
- [ ] User experience is smooth (no confusing output)
- [ ] Error messages are clear and actionable
- [ ] Performance is acceptable (no unexpected slowdowns)
- [ ] Documentation matches actual behavior
- [ ] No regressions in existing functionality

### Test Scenarios

#### Scenario 1: Fresh Run (No Checkpoint)

**Setup**: Clean directory, no existing checkpoints
**Command**: `humanify unminify test-samples/valid-output.js --turbo --provider openai`
**Expected**:
- No checkpoint prompt
- Processing starts immediately
- Checkpoint created during run
- Checkpoint deleted on success
- Output file correct

**Validation**:
```bash
rm -rf .humanify-checkpoints/
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
# Should see progress bar, no checkpoint prompt
# Should complete successfully
ls .humanify-checkpoints/  # Should be empty (deleted on success)
```

#### Scenario 2: Interrupted + Resumed Run

**Setup**: Run interrupted with Ctrl+C
**Command**: Same as scenario 1, interrupted, then resumed
**Expected**:
- First run: Ctrl+C saves checkpoint
- Second run: Prompt shows checkpoint info
- User presses Enter (resume)
- Processing skips completed batches
- Output identical to non-interrupted run

**Validation**:
```bash
rm -rf .humanify-checkpoints/ output.js
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
# Press Ctrl+C after 50% progress
# Verify checkpoint exists
ls .humanify-checkpoints/  # Should show checkpoint file

# Resume
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
# Should see prompt, press Enter
# Should complete faster (skip completed work)

# Verify output
diff output.js <expected-output>  # Should be identical
```

#### Scenario 3: Inspect Checkpoint

**Setup**: Checkpoint exists
**Command**: Resume with 'inspect' option
**Expected**:
- Prompt shows checkpoint info
- User types 'inspect'
- Checkpoint JSON displayed
- Process exits (no processing)

**Validation**:
```bash
# Use checkpoint from scenario 2
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
# At prompt, type: inspect
# Should see JSON output
# Should exit without processing
```

#### Scenario 4: Delete Checkpoint

**Setup**: Checkpoint exists
**Command**: Resume with 'delete' option
**Expected**:
- Prompt shows checkpoint info
- User types 'delete'
- Checkpoint deleted
- Process exits
- Checkpoint file removed

**Validation**:
```bash
# Use checkpoint from scenario 2
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
# At prompt, type: delete
# Should see "Checkpoint deleted"
ls .humanify-checkpoints/  # Should be empty
```

#### Scenario 5: Start Fresh (Ignore Checkpoint)

**Setup**: Checkpoint exists
**Command**: Resume with 'n' option
**Expected**:
- Prompt shows checkpoint info
- User types 'n'
- Checkpoint deleted
- Processing starts fresh (all batches)
- New checkpoint created
- Deleted on success

**Validation**:
```bash
# Create checkpoint first
rm -rf .humanify-checkpoints/
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
# Ctrl+C after 50%

# Start fresh
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
# At prompt, type: n
# Should process all batches (not resume)
# Should complete successfully
```

#### Scenario 6: Ctrl+C Saves Checkpoint

**Setup**: Clean directory
**Command**: Run with Ctrl+C during processing
**Expected**:
- Processing starts
- User presses Ctrl+C
- Message: "Interrupt received, saving checkpoint..."
- Current batch completes
- Checkpoint saved
- Process exits cleanly
- Checkpoint file exists and is valid

**Validation**:
```bash
rm -rf .humanify-checkpoints/
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
# Press Ctrl+C after 2-3 batches
# Should see message about saving checkpoint
# Should exit within a few seconds (after current batch)

ls .humanify-checkpoints/  # Should show checkpoint
cat .humanify-checkpoints/*.json | jq .  # Should be valid JSON

# Verify resumable
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
# Should see resume prompt
```

#### Scenario 7: Disabled Checkpoints

**Setup**: Clean directory
**Command**: Run with --disable-checkpoints
**Expected**:
- No checkpoint created
- No resume prompt
- Processing works normally
- Output correct

**Validation**:
```bash
rm -rf .humanify-checkpoints/
humanify unminify test-samples/valid-output.js --turbo --provider openai --disable-checkpoints -o output.js
# Should complete successfully
ls .humanify-checkpoints/  # Should not exist or be empty
```

### Edge Case Testing

**Test**: Corrupted checkpoint file
**Setup**: Create invalid JSON in checkpoint file
**Expected**: Prompt shows error, deletes checkpoint, starts fresh

**Test**: Version mismatch
**Setup**: Manually edit checkpoint version to 1.0.0
**Expected**: Checkpoint deleted, starts fresh

**Test**: Invalid user input at prompt
**Setup**: Type gibberish at prompt
**Expected**: Re-prompts with clear message

**Test**: Second Ctrl+C
**Setup**: Press Ctrl+C twice quickly
**Expected**: First shows "saving checkpoint", second force-exits

### Performance Testing

**Test**: Large file (test-samples/huge-statement.js)
**Expected**: Checkpoint overhead < 5% of total runtime

**Test**: Small file (test-samples/valid-output.js)
**Expected**: Checkpoint overhead negligible

### Documentation Validation

**Test**: Compare docs to actual behavior
**Expected**: All examples in CLAUDE.md work exactly as documented

---

## [P1] Final Sign-Off

**Status**: Not Started
**Effort**: Small (1 hour)
**Dependencies**: All above items complete
**Spec Reference**: N/A • **Status Reference**: STATUS-2025-11-13-054800.md lines 506-516

### Description

Formal verification that checkpoint system is production-ready. This is a go/no-go checklist for shipping to users.

### Acceptance Criteria

- [ ] All P0 requirements complete (5/5)
- [ ] All P1 requirements complete (3/3)
- [ ] All unit tests pass (51/51)
- [ ] All e2e tests pass (8/8)
- [ ] Manual testing successful (7/7 scenarios)
- [ ] Documentation complete and accurate
- [ ] No known bugs or issues
- [ ] Performance acceptable (<5% overhead)
- [ ] Error handling robust
- [ ] User experience smooth

### Sign-Off Checklist

#### Functionality Checklist

- [ ] ✅ Checkpoint save works (verified by tests)
- [ ] ✅ Checkpoint load works (verified by tests)
- [ ] ✅ Checkpoint delete works (verified by tests)
- [ ] ✅ Resume produces identical output (verified by e2e tests)
- [ ] ✅ No duplicate API calls (verified by tests)
- [ ] ✅ Deterministic batching (0% rejection rate)
- [ ] ✅ Version validation works
- [ ] ✅ Interactive prompt works (verified by manual testing)
- [ ] ✅ Signal handlers work (verified by manual testing)
- [ ] ✅ CLI flags work (verified by manual testing)

#### Quality Checklist

- [ ] All unit tests pass (51/51)
- [ ] All e2e tests pass (8/8)
- [ ] No test skips (or skips properly marked as "not implemented")
- [ ] Code coverage >80% for checkpoint system
- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] All files follow project conventions

#### Documentation Checklist

- [ ] CLAUDE.md updated with checkpoint section
- [ ] README.md mentions checkpoint feature
- [ ] Help text shows all flags
- [ ] Usage examples tested and work
- [ ] Troubleshooting guide complete
- [ ] Cost savings documented with evidence
- [ ] Technical details accurate

#### User Experience Checklist

- [ ] Prompt is clear and intuitive
- [ ] Error messages are actionable
- [ ] Progress messages are informative
- [ ] Performance overhead acceptable
- [ ] No confusing behavior
- [ ] Works on all 3 providers (OpenAI, Gemini, Local)

#### Production Readiness Checklist

- [ ] No known bugs
- [ ] No data loss scenarios
- [ ] Graceful error handling
- [ ] Backward compatible (no breaking changes)
- [ ] Performance tested on large files (>10K identifiers)
- [ ] Memory usage acceptable
- [ ] Checkpoint files cleaned up properly

### Go/No-Go Decision

**GO** if:
- All functionality checklists complete
- All quality checklists complete
- All documentation checklists complete
- All UX checklists complete
- All production checklists complete
- Manual testing successful

**NO-GO** if:
- Any P0 or P1 requirement incomplete
- Any critical bug found
- Documentation incomplete
- User experience confusing
- Performance unacceptable

### Post-Ship Tasks

After shipping (deferred to future):
- [ ] Monitor checkpoint usage metrics
- [ ] Track cost savings (actual vs predicted)
- [ ] Collect user feedback
- [ ] Identify P2 features worth implementing
- [ ] Consider salvage feature if checkpoint rejection rate > 0%

---

## Dependency Graph

```
P1-1 (Interactive Prompt) ──┐
                            │
P1-2 (Signal Handlers) ─────┼──> P1-5 (Manual Testing) ──> P1-6 (Sign-Off)
                            │        ▲
P1-3 (CLI Flags) ───────────┘        │
                                     │
P1-4 (Documentation) ────────────────┘
```

**Critical Path**: P1-1 → P1-2 → P1-3 → P1-4 → P1-5 → P1-6

**Parallelization Opportunities**:
- P1-1, P1-2, P1-3 can be done in parallel (independent)
- P1-4 should wait for others (documents actual behavior)
- P1-5 requires all previous items
- P1-6 requires P1-5

**Optimal Order** (for single developer):
1. P1-1 (3h) - highest user impact
2. P1-2 (4h) - prevents data loss
3. P1-3 (2h) - quick win
4. P1-4 (2h) - documents what was built
5. P1-5 (2h) - validates everything works
6. P1-6 (1h) - formal sign-off

**Total: 14 hours (2 working days)**

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Readline breaks CI/CD | HIGH | MEDIUM | Use `--auto-resume` flag for CI |
| Signal handler race condition | HIGH | LOW | Test thoroughly with manual testing |
| Checkpoint corruption on signal | HIGH | LOW | Complete current batch before exit |
| Version mismatch breaks resume | MEDIUM | LOW | Already handled by loadCheckpoint |
| Performance regression | MEDIUM | LOW | Checkpoint overhead < 5% by design |

### User Experience Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Users confused by prompt | MEDIUM | MEDIUM | Clear prompt text, good defaults |
| Users don't know feature exists | HIGH | CERTAIN | Add to docs, release notes |
| Users want to disable globally | LOW | LOW | Add --disable-checkpoints flag |
| Prompt blocks CI/CD | HIGH | MEDIUM | Add --auto-resume flag |

### Business Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| ROI doesn't materialize | LOW | MEDIUM | Already spent $6,125, sunk cost |
| Users report bugs | MEDIUM | LOW | Extensive testing before ship |
| Feature unused | LOW | MEDIUM | Educate users, make discoverable |

---

## Success Metrics

### Completion Metrics (Binary)

- [ ] All P1 requirements implemented (6/6)
- [ ] All tests passing (51/51 unit, 8/8 e2e)
- [ ] Documentation complete (CLAUDE.md + README.md)
- [ ] Manual testing successful (7/7 scenarios)
- [ ] Sign-off checklist complete

### Quality Metrics (Measurable)

- **Test Coverage**: >80% for checkpoint code
- **Performance Overhead**: <5% vs no checkpoints
- **Checkpoint Rejection Rate**: 0% (already validated)
- **Resume Success Rate**: 100% (already validated)
- **User Errors**: 0 (no confusing prompts or error messages)

### Usage Metrics (Post-Ship)

- **Adoption Rate**: % of turbo mode runs that use checkpoints
- **Resume Rate**: % of checkpoints that are resumed (vs deleted/ignored)
- **Cost Savings**: Actual $ saved per month per user
- **User Satisfaction**: Feedback from users

---

## Out of Scope (Deferred to Future)

### P2 Features (Not in This Plan)

**Checkpoint Management CLI** (6 hours):
- `humanify checkpoint list` - list all checkpoints
- `humanify checkpoint inspect <id>` - show checkpoint details
- `humanify checkpoint delete <id>` - delete specific checkpoint
- `humanify checkpoint clean` - delete all checkpoints

**Salvage Feature** (2 hours):
- Attempt to resume from corrupted checkpoints
- Extract partial results even if resume fails
- Requires additional testing and error handling

**Refine-Aware Tracking** (6 hours):
- Track which identifiers were manually edited
- Preserve manual edits during resume
- Complex scope analysis required

### Why Deferred

- P0+P1 provides 80% of value in 20% of time
- P2 features are nice-to-have, not critical
- Better to ship working feature than wait for perfection
- Can iterate based on user feedback
- Total P2 effort: 14 hours = another 2 days

---

## Timeline Estimate

### Optimistic (Best Case): 12 hours

- P1-1: 2.5h (no issues)
- P1-2: 3h (signal handlers work first try)
- P1-3: 1.5h (straightforward)
- P1-4: 1.5h (documentation quick)
- P1-5: 2h (no issues found)
- P1-6: 0.5h (everything passes)

### Realistic (Expected): 14 hours

- P1-1: 3h (some iteration on prompt UX)
- P1-2: 4h (signal handler edge cases)
- P1-3: 2h (as estimated)
- P1-4: 2h (as estimated)
- P1-5: 2h (minor issues found and fixed)
- P1-6: 1h (as estimated)

### Pessimistic (Worst Case): 20 hours

- P1-1: 5h (major prompt UX issues)
- P1-2: 6h (signal handler race conditions)
- P1-3: 3h (flag conflicts or edge cases)
- P1-4: 2h (no change)
- P1-5: 3h (major issues requiring fixes)
- P1-6: 1h (no change)

**Recommendation**: Plan for 14 hours (realistic), budget 20 hours (pessimistic).

---

## Cost Analysis

### Investment Breakdown

**Already Spent**: $6,125 (49 hours)
- Planning: 8h ($1,000)
- Test Development: 12h ($1,500)
- AST Bug Fix: 6h ($750)
- Evaluation: 2h ($250)
- Implementation: 6h ($750)
- This Evaluation: 2h ($250)
- Previous Work: 13h ($1,625)

**This Plan**: $2,750 (22 hours budgeted, 14 hours expected)
- P1-1: 3h ($375)
- P1-2: 4h ($500)
- P1-3: 2h ($250)
- P1-4: 2h ($250)
- P1-5: 2h ($250)
- P1-6: 1h ($125)
- Buffer: 8h ($1,000) for issues

**Total Investment**: $8,875 (71 hours)

### ROI Analysis

**Monthly Savings**: $400 (once users know feature exists)
**Payback Period**: 22 months ($8,875 / $400)
**12-Month ROI**: -46% (still negative)
**24-Month ROI**: +8% (break even at 22 months)

**Justification**:
- Feature prevents data loss (priceless for user trust)
- One-time investment, permanent benefit
- Savings will increase as:
  - More users adopt feature
  - File sizes increase
  - Failure rates increase (power outages, crashes, etc.)
- User experience improvement (non-monetary value)

### Risk-Adjusted ROI

**Best Case** (high adoption, frequent failures):
- Monthly savings: $800 (2x expected)
- Payback: 11 months
- 12-month ROI: -17%

**Worst Case** (low adoption, rare failures):
- Monthly savings: $200 (0.5x expected)
- Payback: 44 months
- 12-month ROI: -73%

**Expected Case** (baseline):
- Monthly savings: $400
- Payback: 22 months
- 12-month ROI: -46%

---

## Implementation Notes

### Code Style Conventions

- Follow existing patterns in codebase
- Use TypeScript strict mode
- Add JSDoc comments for public functions
- Update types in checkpoint.ts if needed
- Use existing error handling patterns
- Follow existing naming conventions

### Testing Conventions

- Unit tests go in `*.test.ts` files
- E2E tests go in `*.e2etest.ts` files
- Use existing test utilities (test-samples/)
- Mock external dependencies (filesystem, APIs)
- Real I/O for integration tests

### Git Workflow

- Commit after each work item
- Use descriptive commit messages
- Reference this plan in commit messages
- Push frequently (don't lose work!)
- Create PR when all items complete

### Common Pitfalls to Avoid

1. **Don't** break existing functionality (run tests!)
2. **Don't** skip manual testing (unit tests aren't enough)
3. **Don't** forget to update docs (users need to know)
4. **Don't** ignore edge cases (corrupted files, signals, etc.)
5. **Don't** overcomplicate (KISS principle)

---

## Appendix: File Locations

### Files to Modify

**Commands** (CLI entry points):
- `src/commands/openai.ts` - OpenAI provider command
- `src/commands/gemini.ts` - Gemini provider command
- `src/commands/local.ts` - Local LLM provider command

**Core Logic**:
- `src/plugins/local-llm-rename/visit-all-identifiers.ts` - Main processing loop
- `src/checkpoint.ts` - Checkpoint save/load/delete

**Documentation**:
- `CLAUDE.md` - Project instructions
- `README.md` - User-facing docs

**Tests**:
- `src/checkpoint-interactive.test.ts` - Interactive prompt tests
- `src/checkpoint-signals.test.ts` - Signal handler tests
- `src/checkpoint.test.ts` - Core checkpoint tests
- `src/checkpoint-resume.e2etest.ts` - E2E resume tests

### Files to Create

**None** - all necessary files already exist

### Files to NOT Modify

**These work correctly, don't touch**:
- `src/checkpoint-determinism.test.ts` - Determinism validation (100% passing)
- `src/checkpoint-salvage.test.ts` - Salvage feature (P2, properly skipped)
- Any files outside checkpoint system

---

## Plan Version History

**v1.0** (2025-11-13-054900):
- Initial plan based on STATUS-2025-11-13-054800.md
- Focus: CLI integration (14 hours)
- Goal: Production-ready in 2 days
- Defer: P2 features (management CLI, salvage, refine-aware)

---

## Next Actions

### Immediate (Start Now)

1. **Read this plan** - Understand scope and approach
2. **Start P1-1** - Interactive resume prompt (highest impact)
3. **Test early** - Verify behavior after each small change
4. **Commit often** - Don't lose work

### Before Starting Each Item

1. Read acceptance criteria
2. Understand technical notes
3. Identify edge cases
4. Write tests first (if possible)
5. Implement incrementally

### After Completing Each Item

1. Run all tests
2. Manual testing
3. Update docs if behavior changed
4. Commit with descriptive message
5. Move to next item

### Before Final Sign-Off

1. Complete all 6 work items
2. Run full test suite
3. Complete manual testing (7 scenarios)
4. Review documentation
5. Check all sign-off checklists
6. Create PR or ship

---

**Plan Status**: Ready for Implementation
**Estimated Time**: 14 hours (2 working days)
**Estimated Cost**: $2,750 (with $1,000 buffer)
**Risk Level**: LOW (core functionality already works)
**Next Step**: Begin P1-1 (Interactive Resume Prompt)
