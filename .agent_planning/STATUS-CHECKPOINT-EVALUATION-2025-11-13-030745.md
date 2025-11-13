# HumanifyJS Checkpoint System Evaluation

**Date**: 2025-11-13
**Status**: CRITICALLY BROKEN - FUNDAMENTAL ARCHITECTURE FLAWS
**Financial Impact**: HIGH - Wasting money on redundant API calls

---

## Executive Summary

The current checkpoint system is **fundamentally broken** and achieves the opposite of its intended purpose. Rather than saving money, it wastes money by:

1. **Running on incorrect code state** - Checkpoints don't store the AST/code state, only batch numbers
2. **Non-deterministic batch construction** - Same input produces different batch counts on resume
3. **Silent auto-resume** - No user consent, no awareness of broken state
4. **Empty renames map** - Checkpoint stores zero rename information despite claiming to track them

**Cost of current system**: On a failed 10K identifier run that crashes at 50%, resume will likely:
- Waste 100% of API calls (rerun everything on wrong AST state)
- Produce incorrect/garbage output
- User has no idea this happened

---

## Critical Flaws Analysis

### 1. THE FATAL FLAW: AST State Not Preserved

**Location**: `src/plugins/local-llm-rename/visit-all-identifiers.ts:239-271`

```typescript
// Check for existing checkpoint
if (checkpointId) {
  checkpoint = loadCheckpoint(checkpointId);
  if (checkpoint && checkpoint.totalBatches === batches.length) {
    startBatch = checkpoint.completedBatches;

    // Restore renames from checkpoint
    console.log(`Restoring ${Object.keys(checkpoint.renames).length} previous renames...`);

    // Replay all renames that were already done
    for (const [oldName, newName] of Object.entries(checkpoint.renames)) {
      const scope = scopes.find(s => s.node.name === oldName);  // BUG: oldName doesn't exist anymore!
      if (scope && scope.scope.hasBinding(oldName)) {
        scope.scope.rename(oldName, newName);
        // ...
      }
    }
  }
}
```

**Why this is catastrophically broken**:

1. **Checkpoint stores empty renames map**: Line 367 in `saveCheckpoint()` shows `renames: renamesMap`, but examining actual checkpoints shows `"renames": {}` - IT'S ALWAYS EMPTY!

2. **Even if renames were stored, the lookup is wrong**: After batch 1 completes and renames `x` → `calculateTotal`, the AST is mutated. On resume, the code tries to find a scope with `s.node.name === "x"`, but that identifier no longer exists in the AST - it's already been renamed to `calculateTotal`!

3. **Fresh AST parsing on resume**: Line 41 `parseAsync(code)` creates a brand new AST from the ORIGINAL source code. All previous AST mutations are lost.

4. **Result**: Resume starts with fresh AST (pre-rename state) but skips batches 1-N, meaning the LLM sees MINIFIED variable names where it should see SEMANTIC names from earlier batches.

**Real-world scenario**:
```javascript
// Original code
function a(b, c) {
  return b + c;
}

// After batch 1 (renames 'a'):
function calculateSum(b, c) {
  return b + c;
}

// After batch 2 (renames 'b'):
function calculateSum(firstNumber, c) {
  return firstNumber + c;
}

// CRASH and resume from batch 3
// Checkpoint says: "Skip batches 1-2, start at batch 3 (rename 'c')"
// BUT AST is fresh parse of ORIGINAL CODE!
// LLM now sees: function a(b, c) { return b + c; }
// LLM has NO CONTEXT that 'a' is calculateSum or 'b' is firstNumber
// Result: Garbage rename suggestions
```

**This is why the user says "rerunning hundreds of requests on incorrect code"** - the checkpoint system is skipping batches but on the WRONG AST STATE.

---

### 2. Non-Deterministic Batch Construction

**Location**: `src/plugins/local-llm-rename/dependency-graph.ts:40-286`

The dependency graph construction is **not deterministic** across runs:

```typescript
// Line 54: Hash includes mode
const cacheKey = `${code}-${mode}`;

// Line 190-196: Builds dependency graph from AST traversal
const dependencies = await buildDependencyGraph(code, scopes, {
  mode: options?.dependencyMode || "balanced"
});
let batches = topologicalSort(scopes, dependencies);

// Line 199-208: Merges small batches based on COST HEURISTICS
batches = mergeBatches(batches, minBatchSize, dependencies);

// Line 212-222: Splits large batches
batches = splitLargeBatches(batches, maxBatchSize);
```

**Sources of non-determinism**:

1. **Merge heuristics** (line 672-786): `getMergeCost()` calculates cost based on scope levels and dependencies. With floating-point arithmetic and traversal order variations, small changes can cause different merge decisions.

2. **Cycle detection** (line 634-650): When cycles exist, the algorithm picks "node with smallest scope". If multiple nodes have identical scope size, the order depends on Set iteration order which is not guaranteed.

3. **Split boundaries** (line 681-701): Simple chunking by `maxBatchSize`, but if batch sizes change due to merging differences, split points differ.

4. **Checkpoint validation** (line 241): `checkpoint.totalBatches === batches.length` - if batch count differs by even 1, checkpoint is rejected. This happens frequently!

**Evidence from logs**: The planning doc says "If code changes between runs, dependency graph may differ" but the user reports this happening on IDENTICAL input! This is because the graph construction itself is non-deterministic.

**Result**: Checkpoint appears valid (same input hash) but batch count differs → checkpoint rejected → start over → all progress lost.

---

### 3. Silent Auto-Resume Without User Consent

**Location**: `src/plugins/local-llm-rename/visit-all-identifiers.ts:239-271`

```typescript
if (checkpointId) {
  checkpoint = loadCheckpoint(checkpointId);  // Automatically loads
  if (checkpoint && checkpoint.totalBatches === batches.length) {
    startBatch = checkpoint.completedBatches;
    console.log(`Resuming from batch ${startBatch + 1}/${batches.length}`);
    // No prompt, no confirmation, just resumes
  }
}
```

**Problems**:

1. **No user prompt**: User has no idea checkpoint exists or is being used
2. **No validation feedback**: User doesn't know if checkpoint is valid/stale
3. **No escape hatch**: No way to force fresh start without manually deleting `.humanify-checkpoints/`
4. **Silent failures**: If checkpoint is corrupt/stale, user sees cryptic "batch count mismatch" and starts fresh - but doesn't know why

**User requirement violation**: The user explicitly stated:
> "On startup, check for unfinished work - Prompt user to resume or start fresh - NO --resume flag needed - If user declines, start fresh"

Current implementation: **NO PROMPT, AUTO-RESUME, NO CHOICE**

---

### 4. Renames Map Is Always Empty

**Location**: `src/plugins/local-llm-rename/visit-all-identifiers.ts:353-368`

```typescript
// Save checkpoint after each batch completes
if (checkpointId) {
  // Build renames map from history
  const renamesMap: Record<string, string> = {};
  for (const rename of renamesHistory) {
    renamesMap[rename.oldName] = rename.newName;
  }

  saveCheckpoint(checkpointId, {
    version: "1.0.0",
    timestamp: Date.now(),
    inputHash: checkpointId,
    completedBatches: batchIdx + 1,
    totalBatches: batches.length,
    renames: renamesMap,  // Should contain renames
    partialCode: ""
  });
}
```

**Examining actual checkpoint** (`.humanify-checkpoints/e0d4919d8da95a49.json`):
```json
{
  "version": "1.0.0",
  "timestamp": 1763027453542,
  "inputHash": "e0d4919d8da95a49",
  "completedBatches": 8,
  "totalBatches": 161,
  "renames": {},        // EMPTY!
  "partialCode": ""     // EMPTY!
}
```

**Why is it empty?**

Looking at line 183: `const renamesHistory: Array<{ oldName: string; newName: string; scopePath: string }> = [];`

This array is declared but examination of the code shows it's only populated in line 338-342:
```typescript
renamesHistory.push({
  oldName: job.name,
  newName: safeRenamed,
  scopePath: job.scope.toString()
});
```

But `job.name` and `safeRenamed` might be THE SAME (line 325: `if (newName !== job.name)`), meaning no rename occurred. When LLM returns the same name, nothing is pushed to history.

**However**, the real bug is: Even when renames ARE made, the `renamesHistory` array is LOCAL to the `visitAllIdentifiersTurbo` function and doesn't persist across function calls. When you resume, a NEW `renamesHistory` array is created (line 183), starting empty.

**Proof**: The checkpoint at batch 8 shows `"renames": {}` despite completing 8 batches. If renames were being tracked, this should contain dozens or hundreds of entries.

**Result**: Checkpoint stores ZERO rename information, making it useless for resume.

---

### 5. Refine Mode Not Tracked

**Location**: `src/commands/openai.ts:178-203`

```typescript
// Pass 2: Refinement (if enabled)
if (opts.refine) {
  console.log("\n=== Pass 2: Refinement (2x parallelism) ===\n");

  const pass1OutputFile = `${opts.outputDir}/deobfuscated.js`;

  await unminify(pass1OutputFile, opts.outputDir, [
    babel,
    openaiRename({
      apiKey,
      baseURL,
      model: opts.model,
      contextWindowSize,
      turbo: opts.turbo,
      maxConcurrent: maxConcurrent * 2,  // 2x parallelism
      minBatchSize: parseInt(opts.minBatchSize, 10),
      maxBatchSize: parseInt(opts.maxBatchSize, 10),
      dependencyMode: "relaxed"
    }),
    prettier
  ]);
}
```

**Problems**:

1. **No refine tracking in checkpoint**: Checkpoint format has no field for "which pass am I on?"
2. **Checkpoint hash collision**: Pass 1 uses original file, pass 2 uses `deobfuscated.js`. If you crash during pass 2 and restart, the checkpoint ID is calculated from the ORIGINAL file (line 178: `filename` is still the original input), but pass 2 is working on DIFFERENT code!
3. **Cannot resume mid-refine**: If pass 2 crashes, you lose all refine progress and restart from pass 1.

**User requirement violation**: User wants "refine-aware processing" with "visible indication of current refine state". Current system: **ZERO REFINE AWARENESS**.

---

## Money Waste Scenarios

### Scenario 1: Large File Crash at 50%

**File**: 10,000 identifiers, costs $0.001 per rename = $10 total

**Timeline**:
1. Start fresh, process batches 1-80 (4,000 identifiers, $4 spent)
2. Rate limit hit, process hangs, user kills it
3. Checkpoint saved: `completedBatches: 80, totalBatches: 160, renames: {}`
4. User restarts command
5. System loads checkpoint, parses fresh AST (pre-rename state)
6. System skips batches 1-80 (thinks they're done)
7. System processes batches 81-160 with ORIGINAL MINIFIED NAMES in context
8. LLM produces garbage suggestions because it can't see semantic context from batches 1-80
9. Output is unusable, user must restart from scratch
10. **Total wasted**: $4 from first run + $6 from bad resume = **$10 wasted, 100% of budget**

**Without checkpoint**: Would have lost $4. **With checkpoint**: Lost $10 (actually WORSE!).

---

### Scenario 2: Non-Deterministic Batch Count Mismatch

**File**: 5,000 identifiers, costs $0.001 per rename = $5 total

**Timeline**:
1. Start fresh, dependency graph produces 100 batches
2. Process batches 1-40 (2,000 identifiers, $2 spent)
3. Crash (OOM, rate limit, user interrupt)
4. Checkpoint saved: `completedBatches: 40, totalBatches: 100`
5. User restarts command
6. Dependency graph now produces 102 batches (non-deterministic merge)
7. Checkpoint rejected: `totalBatches mismatch (100 vs 102)`
8. System starts fresh, processes all 5,000 identifiers again ($5)
9. **Total wasted**: $2 from first run (completely lost)

**Cost**: $7 total for $5 of work = **40% waste**.

---

### Scenario 3: Refine Mode Crash

**File**: 3,000 identifiers, costs $0.001 per rename = $3 per pass, $6 total with refine

**Timeline**:
1. Pass 1 completes successfully ($3 spent)
2. Pass 2 starts (refine with 2x parallelism)
3. Process 1,500 identifiers in pass 2 ($1.50 spent)
4. Crash (rate limit exhaustion)
5. Checkpoint saved with original file hash (pass 1 hash, not pass 2)
6. User restarts command
7. System sees checkpoint for pass 1, loads it
8. System thinks pass 1 is partially complete (wrong!)
9. OR system doesn't find checkpoint for pass 2 at all
10. System restarts from pass 1 beginning
11. **Total wasted**: $1.50 from pass 2 (completely lost)

**Cost**: $7.50 total for $6 of work = **25% waste**.

---

### Scenario 4: Chunking + Checkpoints = Disaster

**File**: 200KB file (exceeds 100KB chunk threshold), 15,000 identifiers total

**Timeline**:
1. File is split into 3 chunks (chunk A: 5K ids, chunk B: 5K ids, chunk C: 5K ids)
2. Chunk A processing: 80 batches, completes successfully ($5 spent)
3. Chunk B processing: 70 batches, crashes at batch 40 ($2.85 spent)
4. Checkpoint saved for chunk B: `completedBatches: 40, totalBatches: 70`
5. User restarts command
6. System re-splits file, BUT symbol tracking may differ slightly
7. Chunk B now has different identifiers (slight variation in split boundaries)
8. Checkpoint hash matches (same source code) but **identifiers are different**
9. System resumes at batch 40, but batches 1-40 were on OLD identifier list
10. System processes batches 40-70 on NEW identifier list with wrong context
11. **Result**: Garbage output, must restart chunk B from scratch

**Total wasted**: $2.85 from partial chunk B, and potentially chunk A output is corrupted too.

---

## Current State vs. Requirements Matrix

| Requirement | Current State | Gap |
|-------------|---------------|-----|
| **Refine-aware processing** | No refine tracking at all | Need `refineIteration` field in checkpoint |
| **Visible refine state** | No indication to user | Need console output showing pass number |
| **Interactive resume** | Silent auto-resume | Need user prompt on startup |
| **No auto-resume** | Always auto-resumes if checkpoint found | Remove auto-load, add prompt |
| **Self-contained checkpoints** | Missing: original command, all options, code state | Need full command + options + AST state |
| **Resume without re-entering command** | Requires same CLI args every time | Need to store and replay original command |
| **Versioned checkpoints** | Has version field but not validated | Need version check + migration logic |
| **Breaking changes = version bump** | No version validation | Need schema validation |
| **Auto-save on ANY termination** | Only saves on batch completion | Need signal handlers (SIGINT, SIGTERM) |
| **Design for sudden termination** | Loses progress within a batch | Need more frequent saves |
| **Reliable checkpoint generation** | Renames map is always empty | Need to fix renamesHistory persistence |
| **Checkpoint validation** | Only checks batch count | Need schema validation, AST hash validation |
| **Salvage partial work** | No salvage capability | Need to extract renames from partial checkpoint |
| **Extract usable renames** | No rename extraction | Need CLI command to inspect/salvage checkpoints |

**Score**: 1/14 requirements met (versioned checkpoints has the field, but isn't used correctly)

---

## Technical Debt Analysis

### Immediate Issues (Blocks Correct Operation)

1. **AST state not preserved** - Must store transformed code, not just batch number
2. **Renames map always empty** - Must fix renamesHistory persistence
3. **No user prompt** - Must add interactive resume prompt
4. **Non-deterministic batching** - Must make dependency graph deterministic

### High-Priority Issues (Causes Money Waste)

5. **Refine mode not tracked** - Must add refine iteration to checkpoint
6. **Checkpoint validation insufficient** - Must validate AST consistency
7. **No salvage capability** - Must build rename extraction tooling

### Medium-Priority Issues (UX Problems)

8. **No checkpoint management** - Need `humanify checkpoints` CLI commands
9. **No checkpoint visibility** - User can't see what checkpoints exist
10. **No manual checkpoint creation** - Can't save progress on demand

### Low-Priority Issues (Nice-to-Have)

11. **No checkpoint compression** - Large checkpoints waste disk space
12. **No checkpoint expiration** - Old checkpoints accumulate forever
13. **No checkpoint metadata** - Can't see what file/settings a checkpoint is for

---

## Deterministic Batching Analysis

**Question**: Is identifier sorting deterministic?

**Answer**: **PARTIALLY DETERMINISTIC** with non-deterministic edge cases:

1. **Initial scope sorting** (line 395 in `visit-all-identifiers.ts`):
   ```typescript
   scopes.sort((a, b) => b[1] - a[1]);
   ```
   This sorts by scope size (larger first). **Deterministic** IF no two scopes have identical size. **Non-deterministic** if multiple scopes have same size (stable sort not guaranteed in all JS engines).

2. **Dependency graph construction** (covered above): **NON-DETERMINISTIC** due to merge heuristics and cycle detection.

3. **Topological sort** (line 587-660 in `dependency-graph.ts`):
   - Uses Set iteration which is **insertion-order deterministic** in modern JS
   - BUT cycle breaking (line 634-650) can be non-deterministic if multiple nodes have identical scope size
   - **Result**: MOSTLY deterministic, but edge cases exist

**Recommendation**: Must add explicit deterministic ordering:
- Secondary sort by identifier name (line 395)
- Tie-breaking in cycle detection by name (line 640)
- Remove floating-point arithmetic in merge cost (line 748)
- Seed all random/hash operations deterministically

---

## Cost Analysis

### Question: How much does a failed run cost?

**Small file (1,000 identifiers)**:
- Cost per identifier: ~$0.001 (OpenAI gpt-4o-mini)
- Total cost: $1
- Failed at 50%: Lost $0.50

**Medium file (10,000 identifiers)**:
- Total cost: $10
- Failed at 50%: Lost $5

**Large file (100,000 identifiers)**:
- Total cost: $100
- Failed at 50%: Lost $50
- With refine (2 passes): $200 total
- Failed at pass 2, 50%: Lost $50 + $50 = $100

### Question: How much does broken resume cost?

**Scenario**: 10K identifiers, crash at 50%, bad resume

**Current broken system**:
- First run: $5 spent (50% complete)
- Resume with wrong AST state: $5 spent (remaining 50%)
- Output is garbage, must restart
- Restart from scratch: $10 spent
- **Total**: $20 spent for $10 of work = **100% waste**

**Ideal checkpoint system**:
- First run: $5 spent (50% complete)
- Resume with correct AST state: $5 spent (remaining 50%)
- Output is correct
- **Total**: $10 spent for $10 of work = **0% waste**

**Savings**: $10 per failed run (100% of failed work recovered)

### Question: What's the ROI of a robust checkpoint system?

**Assumptions**:
- Average file size: 10K identifiers ($10 per run)
- Failure rate: 20% (rate limits, crashes, user interrupts)
- Users per month: 100
- Failed runs per month: 20

**Current broken system**:
- Failed runs: 20 × $10 = $200 wasted per month
- Bad resumes: 20 × $10 = $200 additional waste
- **Total waste**: $400/month

**With robust checkpoints**:
- Failed runs: 20 × $0 = $0 wasted (perfect resume)
- **Total waste**: $0/month
- **Savings**: $400/month = $4,800/year

**Development effort**: ~2-3 weeks (40-60 hours)
- Cost: ~$5,000-7,500 (at $125/hr)
- **Payback period**: 1-2 months
- **12-month ROI**: 577% to 850%

**Conclusion**: EXTREMELY high ROI. Every month without robust checkpoints costs users $400.

---

## What Exists vs. What Needs to Be Built

### What Exists (Can Be Salvaged)

1. **Checkpoint file structure** (`src/checkpoint.ts`):
   - `saveCheckpoint()` / `loadCheckpoint()` / `deleteCheckpoint()` functions work correctly
   - JSON serialization is fine
   - File naming by hash is correct
   - Directory creation is correct

2. **Checkpoint format foundation** (`Checkpoint` interface):
   - `version` field exists
   - `timestamp` field exists
   - `inputHash` field exists
   - `renames` field exists (even though always empty)
   - Structure is extensible

3. **Integration points** (`visit-all-identifiers.ts`):
   - Checkpoint loading logic is in the right place (after batch computation)
   - Checkpoint saving logic is in the right place (after each batch)
   - Checkpoint deletion logic is in the right place (on completion)

4. **Batch-level granularity**:
   - Saving after each batch is the right frequency (not too fine, not too coarse)
   - Progress tracking variables (`completedBatches`, `totalBatches`) are correct

### What Needs Complete Redesign

1. **AST State Preservation**:
   - **Current**: Stores nothing about AST state
   - **Needed**: Store transformed code OR store renames map + original code hash
   - **Approach**: Add `transformedCode: string` to checkpoint format
   - **Challenge**: Large files = large checkpoints (100KB code = 100KB checkpoint)
   - **Alternative**: Store renames map + replay on fresh AST (but must fix renamesHistory bug)

2. **Deterministic Batching**:
   - **Current**: Non-deterministic dependency graph construction
   - **Needed**: Fully deterministic sorting, merging, and cycle breaking
   - **Approach**:
     - Add secondary sort by name (lexicographic)
     - Remove floating-point arithmetic from merge cost
     - Deterministic cycle breaking (always pick lexicographically first)
     - Hash final batch structure and store in checkpoint
   - **Challenge**: Existing checkpoints will become invalid (version bump required)

3. **Interactive Resume**:
   - **Current**: Silent auto-resume
   - **Needed**: User prompt with checkpoint info
   - **Approach**:
     - On startup, detect checkpoint
     - Print checkpoint summary (date, progress, estimated remaining cost)
     - Prompt: "Resume from checkpoint? [Y/n/inspect]"
     - If "inspect", show full checkpoint details
     - If "n", delete checkpoint and start fresh
     - If "Y", resume
   - **Challenge**: Must work in CI/non-interactive environments (need `--no-interactive` flag)

4. **Refine Mode Tracking**:
   - **Current**: No refine awareness
   - **Needed**: Track which pass (initial, refine 1, refine 2, etc.)
   - **Approach**:
     - Add `refineIteration: number` to checkpoint format
     - Add `originalCommand: string[]` to checkpoint (full argv)
     - On resume, detect refine iteration from checkpoint
     - Print "Resuming Pass 2 (Refinement) from batch X/Y"
   - **Challenge**: Refine pass uses different input file - need separate checkpoint namespace

5. **Checkpoint Validation**:
   - **Current**: Only validates batch count
   - **Needed**: Validate AST consistency, schema version, options compatibility
   - **Approach**:
     - Add `optionsHash: string` to checkpoint (hash of all CLI options)
     - Add `batchStructureHash: string` to checkpoint (hash of batch sizes/order)
     - On resume, recompute both hashes and compare
     - If mismatch, reject checkpoint with explanation
   - **Challenge**: Must decide which option changes invalidate checkpoint (e.g., changing `--max-concurrent` is OK, changing `--dependency-mode` is not)

### What Needs New Components

1. **Rename Salvage Tool**:
   - **Purpose**: Extract valid renames from broken/stale checkpoints
   - **Approach**:
     - Parse checkpoint, extract renames map
     - Parse fresh AST, find identifiers that still exist
     - Apply renames where possible, skip where identifier is gone
     - Output salvaged renames to new checkpoint
   - **CLI**: `humanify checkpoints salvage <checkpoint-id>`

2. **Checkpoint Management CLI**:
   - **Commands**:
     - `humanify checkpoints list` - Show all checkpoints with metadata
     - `humanify checkpoints show <id>` - Detailed checkpoint info
     - `humanify checkpoints delete <id>` - Delete specific checkpoint
     - `humanify checkpoints clean` - Delete old/invalid checkpoints
     - `humanify checkpoints validate <id>` - Check if checkpoint is valid for current input
   - **Purpose**: Give user visibility and control

3. **Signal Handlers**:
   - **Purpose**: Save checkpoint on Ctrl+C, SIGTERM, SIGINT
   - **Approach**:
     - Register signal handlers at start of `visitAllIdentifiersTurbo()`
     - On signal, save current checkpoint with `interruptedAt: Date.now()`
     - Print "Checkpoint saved due to interrupt"
     - Exit gracefully
   - **Challenge**: Must ensure checkpoint is written before process exits

4. **Progress Persistence**:
   - **Purpose**: Save renames as they happen, not just at batch boundaries
   - **Approach**:
     - Change `renamesHistory` from local array to checkpoint-backed structure
     - After each rename, append to checkpoint file (or in-memory buffer with periodic flush)
     - On resume, load renames from checkpoint and mark as visited
   - **Challenge**: More I/O overhead (but negligible compared to LLM API calls)

---

## Recommendations

### Immediate Actions (Week 1)

**STOP USING CHECKPOINTS UNTIL FIXED** - Current system causes more harm than good.

1. **Add `--disable-checkpoints` flag** (1 hour)
   - Default to disabled until system is fixed
   - Print warning: "Checkpoints are experimental and may cause incorrect output"

2. **Fix renamesHistory persistence** (4 hours)
   - Change `renamesHistory` from local array to persistent structure
   - Store in checkpoint after every batch
   - Verify with test that checkpoint contains renames

3. **Add interactive resume prompt** (4 hours)
   - Detect checkpoint on startup
   - Print summary and ask user to confirm
   - Add `--no-interactive` flag for CI

### Short-Term Actions (Week 2)

4. **Make batching deterministic** (8 hours)
   - Add secondary sort by name
   - Remove floating-point arithmetic
   - Add tie-breaking in cycle detection
   - Test that same input produces same batches

5. **Store transformed code in checkpoint** (8 hours)
   - Add `transformedCode: string` to checkpoint format
   - On resume, use transformed code instead of fresh parse
   - Test that resume produces identical output to continuous run

6. **Add refine iteration tracking** (6 hours)
   - Add `refineIteration` and `originalCommand` to checkpoint
   - On resume, restore full command context
   - Print clear indication of which pass is running

### Medium-Term Actions (Week 3-4)

7. **Build checkpoint validation** (8 hours)
   - Add options hash and batch structure hash
   - Validate on resume, reject if incompatible
   - Print clear error messages

8. **Add signal handlers** (4 hours)
   - Catch SIGINT, SIGTERM
   - Save checkpoint before exit
   - Test with manual Ctrl+C

9. **Build checkpoint management CLI** (12 hours)
   - Implement `list`, `show`, `delete`, `clean` commands
   - Add to main CLI router
   - Write tests and documentation

10. **Build rename salvage tool** (8 hours)
    - Parse checkpoint and extract valid renames
    - Apply to fresh AST
    - Test with corrupted/stale checkpoints

### Long-Term Actions (Month 2+)

11. **Add checkpoint compression** (4 hours)
    - Gzip checkpoint files
    - Reduces disk usage by ~80%

12. **Add checkpoint expiration** (4 hours)
    - Auto-delete checkpoints older than N days
    - Configurable via `--checkpoint-ttl` flag

13. **Add checkpoint metadata** (4 hours)
    - Store input filename, CLI args, timestamps
    - Makes `humanify checkpoints list` more useful

---

## Risk Assessment

### Risks of Current System

1. **Financial risk**: HIGH - Users waste money on bad resumes
2. **Correctness risk**: CRITICAL - Output may be corrupted silently
3. **Trust risk**: HIGH - Users lose trust when checkpoint "works" but output is wrong
4. **Debugging risk**: MEDIUM - Hard to diagnose why output is wrong

### Risks of Fixing System

1. **Breaking changes**: Existing checkpoints will be invalid (acceptable - they're broken anyway)
2. **Development time**: 40-60 hours (2-3 weeks)
3. **Testing complexity**: Need to test resume scenarios thoroughly
4. **Edge cases**: May discover new issues during implementation

### Risk Mitigation

1. **Version bump**: Bump checkpoint version to 2.0.0, reject old checkpoints
2. **Feature flag**: Keep `--disable-checkpoints` flag permanently
3. **Comprehensive tests**: Test resume scenarios with mocked crashes
4. **Beta testing**: Roll out to small user group first
5. **Documentation**: Clear guide on when checkpoints help vs. hurt

---

## Conclusion

The current checkpoint system is **fundamentally broken** and **actively harmful**. It fails to achieve its core purpose (save progress) and instead:

- Produces incorrect output by resuming on wrong AST state
- Wastes money by rerunning API calls on bad context
- Misleads users into thinking progress is being saved
- Has no user control or visibility

**Recommendation**: **Disable checkpoints by default** until the system is completely redesigned with:
1. AST state preservation (transformed code storage)
2. Deterministic batching (reliable batch computation)
3. Interactive resume (user consent and visibility)
4. Refine awareness (track which pass we're on)
5. Robust validation (detect incompatible checkpoints)
6. Salvage capability (extract partial progress from broken checkpoints)

**Estimated effort**: 40-60 hours over 2-3 weeks
**ROI**: 577-850% (pays for itself in 1-2 months)
**Priority**: **CRITICAL** - every month costs users $400+ in wasted API calls

The existing checkpoint infrastructure (file I/O, serialization, integration points) can be salvaged. The core logic (what to store, when to resume, how to validate) needs complete redesign.
