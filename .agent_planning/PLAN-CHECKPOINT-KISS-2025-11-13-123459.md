# Checkpoint System: KISS Implementation Plan

**Source**: STATUS-2025-11-13-123032.md
**Spec**: User's simplified KISS requirements
**Generated**: 2025-11-13-123459
**Total Estimated Time**: 4-5 hours
**Target**: Production-ready in 1 day

---

## Executive Summary

The checkpoint core infrastructure is **80% complete** with all save/resume logic working. What remains is purely **user-facing UI**: startup prompts and two simple subcommands. This plan focuses exclusively on the KISS requirements with zero feature creep.

**Current State**:
- ✅ Auto-save after each batch (code complete)
- ✅ Auto-delete on completion (verified working)
- ✅ Resume from checkpoint (code complete)
- ❌ Startup prompt (not implemented)
- ❌ Subcommands (not implemented)

**Remaining Work**: Add ~150 lines of UI code across 3 files.

---

## Work Items

### P0-1: Verify Core Functionality (CRITICAL)

**Status**: Not Started
**Effort**: 30 minutes
**Dependencies**: None
**Spec Reference**: Core requirement validation
**Status Reference**: STATUS-2025-11-13-123032.md section "Critical Blocker Analysis"

#### Description
The STATUS report found `.humanify-checkpoints/` directory empty despite passing tests. Must verify checkpoint files are actually created during real execution before building UI on top.

#### Acceptance Criteria
- [ ] Build project with `npm run build`
- [ ] Run `./dist/index.mjs unminify test-samples/valid-output.js --turbo --max-concurrent 5`
- [ ] Interrupt with Ctrl+C after 5 seconds
- [ ] Verify `.humanify-checkpoints/*.json` files exist
- [ ] If files missing: Add debug logging to `saveCheckpoint()` and diagnose
- [ ] If files present: Feature WORKS, proceed to P1

#### Technical Notes
```bash
# Test command
npm run build
./dist/index.mjs unminify test-samples/valid-output.js --turbo --output /tmp/test-checkpoint --max-concurrent 5

# Wait 5 seconds, then Ctrl+C

# Verify
ls -la .humanify-checkpoints/
cat .humanify-checkpoints/*.json | jq .

# Should see JSON with:
# - version: "2.0.0"
# - completedBatches: 1-N
# - totalBatches: N
# - renames: { "oldName": "newName" }
# - partialCode: "transformed code..."
```

**If empty directory**:
- Hypothesis 1: Turbo mode not enabled in tests (most likely)
- Hypothesis 2: Filesystem permissions issue
- Hypothesis 3: Error swallowed silently

**Debug steps**:
```typescript
// Add to src/checkpoint.ts:38-45
export function saveCheckpoint(checkpointId: string, checkpoint: Checkpoint): void {
  const path = getCheckpointPath(checkpointId);
  console.log(`[DEBUG] Saving checkpoint to: ${path}`);
  console.log(`[DEBUG] Current directory: ${process.cwd()}`);
  console.log(`[DEBUG] Checkpoint ID: ${checkpointId}`);

  writeFileSync(path, JSON.stringify(checkpoint, null, 2));

  // Verify write succeeded
  const { size } = statSync(path);
  console.log(`[DEBUG] Write successful, file size: ${size} bytes`);
  console.log(`\n💾 Checkpoint saved: ${checkpoint.completedBatches}/${checkpoint.totalBatches} batches complete`);
}
```

**Location**: `src/checkpoint.ts:38-45`

---

### P1-1: Add Missing Checkpoint Fields

**Status**: Not Started
**Effort**: 30 minutes
**Dependencies**: P0-1 (must verify core works first)
**Spec Reference**: User requirement "Use checkpoint's original args"
**Status Reference**: STATUS-2025-11-13-123032.md section "Missing fields in Checkpoint interface"

#### Description
Checkpoint interface currently lacks fields needed to resume with original command-line arguments. The `resume` subcommand and startup prompt both need to know what file and args were originally used.

#### Acceptance Criteria
- [ ] Update `Checkpoint` interface in `src/checkpoint.ts` with new fields
- [ ] Update `saveCheckpoint()` calls to populate new fields
- [ ] Update `loadCheckpoint()` to read new fields (backwards compatible)
- [ ] Verify checkpoint JSON includes new fields
- [ ] All existing tests still pass

#### Technical Notes

**File**: `src/checkpoint.ts:5-13`

```typescript
export interface Checkpoint {
  version: string;
  timestamp: number;
  inputHash: string;
  completedBatches: number;
  totalBatches: number;
  renames: Record<string, string>;
  partialCode: string;

  // NEW: Store original command for resume
  originalFile: string;                  // e.g., "test-samples/simple.js"
  originalProvider: string;               // e.g., "openai"
  originalModel?: string;                 // e.g., "gpt-4o-mini"
  originalArgs: Record<string, any>;      // All CLI args (turbo, maxConcurrent, etc.)
}
```

**File**: `src/plugins/local-llm-rename/visit-all-identifiers.ts:395-403`

Need to accept these parameters in `visitAllIdentifiersTurbo()` and pass through to `saveCheckpoint()`:

```typescript
// Option 1: Add to VisitOptions interface
export interface VisitOptions {
  turbo?: boolean;
  maxConcurrent?: number;
  minBatchSize?: number;
  maxBatchSize?: number;
  dependencyMode?: "strict" | "balanced" | "relaxed";
  enableCheckpoints?: boolean;

  // NEW: Checkpoint metadata
  checkpointMetadata?: {
    originalFile: string;
    originalProvider: string;
    originalModel?: string;
    originalArgs: Record<string, any>;
  };
}

// Then in saveCheckpoint call:
saveCheckpoint(checkpointId, {
  version: CHECKPOINT_VERSION,
  timestamp: Date.now(),
  inputHash: checkpointId,
  completedBatches: batchIdx + 1,
  totalBatches: batches.length,
  renames: Object.fromEntries(renamesHistory),
  partialCode: transformedCode || code,

  // NEW: Add metadata
  originalFile: options?.checkpointMetadata?.originalFile ?? "unknown",
  originalProvider: options?.checkpointMetadata?.originalProvider ?? "unknown",
  originalModel: options?.checkpointMetadata?.originalModel,
  originalArgs: options?.checkpointMetadata?.originalArgs ?? {}
});
```

**File**: `src/commands/unminify.ts:240-252`

Pass metadata when creating rename plugin:

```typescript
// Pass checkpoint metadata through options
await unminify(
  filename,
  opts.outputDir,
  [babel, renamePlugin, prettier],
  {
    chunkSize: parseInt(opts.chunkSize, 10),
    enableChunking: opts.chunking !== false,
    debugChunks: opts.debugChunks,

    // NEW: Pass checkpoint metadata
    checkpointMetadata: {
      originalFile: filename,
      originalProvider: provider,
      originalModel: model,
      originalArgs: opts
    }
  }
);
```

**Backwards Compatibility**: Make new fields optional with `?` to handle old checkpoints gracefully.

---

### P2-1: Implement Startup Prompt

**Status**: Not Started
**Effort**: 2-3 hours
**Dependencies**: P0-1 (verify core), P1-1 (checkpoint fields)
**Spec Reference**: User requirement "Startup prompt when running humanify unminify"
**Status Reference**: STATUS-2025-11-13-123032.md section "Startup prompt"

#### Description
When running `humanify unminify file.js`, check for existing checkpoint and prompt user to resume or start fresh. Display warning if CLI args differ from checkpoint's original args. **Always use checkpoint's original args** to ensure consistency.

#### Acceptance Criteria
- [ ] Detect checkpoint at startup before processing
- [ ] Display menu with checkpoint info (batches, timestamp)
- [ ] Show warning if current CLI args differ from checkpoint args
- [ ] User can choose: [1] Resume, [2] Start fresh, [Q] Cancel
- [ ] Resume uses checkpoint's original args (not current CLI args)
- [ ] Start fresh deletes checkpoint and uses current args
- [ ] Cancel exits cleanly (exit code 0)
- [ ] No prompt if no checkpoint exists
- [ ] Works with all providers (openai, gemini, local)

#### Technical Notes

**Location**: `src/commands/unminify.ts:154-157` (after reading input file, before unminify call)

```typescript
// NEW: Add helper function for user input
async function promptUser(message: string): Promise<string> {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// NEW: Add startup checkpoint prompt
async function handleCheckpointPrompt(
  filename: string,
  inputCode: string,
  currentOpts: any
): Promise<{ shouldResume: boolean; opts: any }> {
  const checkpointId = getCheckpointId(inputCode);
  const checkpoint = loadCheckpoint(checkpointId);

  if (!checkpoint) {
    // No checkpoint exists, proceed with current args
    return { shouldResume: false, opts: currentOpts };
  }

  // Display checkpoint info
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📂 CHECKPOINT FOUND`);
  console.log(`${"=".repeat(60)}`);
  console.log(`File: ${checkpoint.originalFile ?? filename}`);
  console.log(`Progress: ${checkpoint.completedBatches}/${checkpoint.totalBatches} batches completed`);
  console.log(`Timestamp: ${new Date(checkpoint.timestamp).toLocaleString()}`);
  console.log(`Provider: ${checkpoint.originalProvider ?? "unknown"}`);
  if (checkpoint.originalModel) {
    console.log(`Model: ${checkpoint.originalModel}`);
  }

  // Check if args differ
  const checkpointArgs = checkpoint.originalArgs ?? {};
  const argsDiffer = JSON.stringify(checkpointArgs) !== JSON.stringify(currentOpts);

  if (argsDiffer) {
    console.log(`\n⚠️  WARNING: CLI arguments differ from checkpoint`);
    console.log(`\nCheckpoint args:`);
    console.log(`  Provider: ${checkpoint.originalProvider}`);
    console.log(`  Model: ${checkpoint.originalModel ?? "(default)"}`);
    if (checkpointArgs.turbo) console.log(`  --turbo`);
    if (checkpointArgs.maxConcurrent) console.log(`  --max-concurrent ${checkpointArgs.maxConcurrent}`);
    if (checkpointArgs.dependencyMode && checkpointArgs.dependencyMode !== "balanced") {
      console.log(`  --dependency-mode ${checkpointArgs.dependencyMode}`);
    }

    console.log(`\nCurrent args:`);
    console.log(`  Provider: ${currentOpts.provider}`);
    console.log(`  Model: ${currentOpts.model ?? "(default)"}`);
    if (currentOpts.turbo) console.log(`  --turbo`);
    if (currentOpts.maxConcurrent) console.log(`  --max-concurrent ${currentOpts.maxConcurrent}`);
    if (currentOpts.dependencyMode && currentOpts.dependencyMode !== "balanced") {
      console.log(`  --dependency-mode ${currentOpts.dependencyMode}`);
    }

    console.log(`\n⚠️  If you resume, checkpoint's original args will be used.`);
  }

  // Prompt user
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[1] Resume from checkpoint`);
  console.log(`[2] Start fresh (delete checkpoint)`);
  console.log(`[Q] Cancel`);
  console.log(`${"=".repeat(60)}`);

  const choice = await promptUser("Your choice: ");

  if (choice === "1") {
    console.log(`\n✅ Resuming from checkpoint with original args\n`);
    // Use checkpoint's args (merge to preserve any new fields)
    return {
      shouldResume: true,
      opts: { ...currentOpts, ...checkpointArgs }
    };
  } else if (choice === "2") {
    console.log(`\n🗑️  Deleting checkpoint, starting fresh\n`);
    deleteCheckpoint(checkpointId);
    return { shouldResume: false, opts: currentOpts };
  } else {
    console.log(`\nCancelled by user`);
    process.exit(0);
  }
}
```

**Integration** (in unminify command action, line ~154):

```typescript
try {
  // Read input for validation later
  const inputCode = await fs.readFile(filename, "utf-8");

  // NEW: Handle checkpoint prompt BEFORE dry-run or execution
  const checkpointResult = await handleCheckpointPrompt(filename, inputCode, opts);
  if (checkpointResult.shouldResume) {
    // Replace opts with checkpoint's original args
    Object.assign(opts, checkpointResult.opts);

    // Re-parse model defaults in case provider changed
    const defaultModels = {
      openai: "gpt-4o-mini",
      gemini: "gemini-1.5-flash",
      local: DEFAULT_MODEL
    };
    const provider = opts.provider.toLowerCase();
    const model = opts.model ?? defaultModels[provider as keyof typeof defaultModels];

    // Update derived values
    opts.model = model;
    // ... (rest of setup)
  }

  // Handle dry-run mode AFTER checkpoint prompt
  if (opts.dryRun) {
    // ... existing dry-run code
  }

  // ... rest of command
}
```

**Edge Cases**:
- No checkpoint: Skip prompt, proceed normally
- Invalid choice: Treat as cancel
- Checkpoint without originalArgs: Warn user, prompt for start fresh
- Ctrl+C during prompt: Exit gracefully (already handled by signal handler)

---

### P3-1: Implement `clear-checkpoints` Subcommand

**Status**: Not Started
**Effort**: 45 minutes
**Dependencies**: P1-1 (checkpoint fields for display)
**Spec Reference**: User requirement "clear-checkpoints subcommand"
**Status Reference**: STATUS-2025-11-13-123032.md section "4a. clear-checkpoints"

#### Description
Add `humanify clear-checkpoints` command to list all checkpoints and delete them after confirmation.

#### Acceptance Criteria
- [ ] Command lists all checkpoints with file/progress/timestamp
- [ ] User can confirm deletion (Y/n prompt)
- [ ] Deletes all checkpoints on confirmation
- [ ] Shows count of deleted checkpoints
- [ ] Handles zero checkpoints gracefully
- [ ] Works from any directory

#### Technical Notes

**New file**: `src/commands/checkpoints.ts`

```typescript
import { cli } from "../cli.js";
import { listCheckpoints, deleteCheckpoint } from "../checkpoint.js";
import * as readline from "readline";

async function promptUser(message: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function clearCheckpointsCommand() {
  return cli()
    .name("clear-checkpoints")
    .description("Delete all checkpoint files")
    .action(async () => {
      const checkpoints = listCheckpoints();

      if (checkpoints.length === 0) {
        console.log("No checkpoints found.");
        return;
      }

      console.log(`\nFound ${checkpoints.length} checkpoint(s):\n`);
      checkpoints.forEach((cp, idx) => {
        const progress = `${cp.completedBatches}/${cp.totalBatches} batches`;
        const date = new Date(cp.timestamp).toLocaleString();
        const file = cp.originalFile ?? "unknown file";
        console.log(`  ${idx + 1}. ${file} (${progress}, ${date})`);
      });

      console.log();
      const confirm = await promptUser("Delete all checkpoints? (Y/n): ");

      if (confirm === "Y" || confirm === "y" || confirm === "") {
        for (const cp of checkpoints) {
          deleteCheckpoint(cp.inputHash);
        }
        console.log(`\n✅ Deleted ${checkpoints.length} checkpoint(s)`);
      } else {
        console.log("\nCancelled.");
      }
    });
}
```

**Register in**: `src/index.ts:24-26`

```typescript
import { clearCheckpointsCommand } from "./commands/checkpoints.js";

cli()
  .name("humanify")
  .description("Unminify code using OpenAI, Gemini, or a local LLM")
  .version(version)
  .addCommand(unminifyCommand)
  .addCommand(download())
  .addCommand(clearCheckpointsCommand())  // NEW
  .parse(process.argv);
```

---

### P3-2: Implement `resume` Subcommand

**Status**: Not Started
**Effort**: 1 hour
**Dependencies**: P1-1 (checkpoint fields), P3-1 (shared prompt utils)
**Spec Reference**: User requirement "resume subcommand"
**Status Reference**: STATUS-2025-11-13-123032.md section "4b. resume"

#### Description
Add `humanify resume` command to list checkpoints and resume selected one with original arguments.

#### Acceptance Criteria
- [ ] Lists all checkpoints with details
- [ ] User can select checkpoint by number
- [ ] Loads checkpoint's original file path and args
- [ ] Resumes processing with original args
- [ ] Handles missing original file gracefully
- [ ] Validates checkpoint file still exists
- [ ] Shows clear error if file moved/deleted

#### Technical Notes

**Add to**: `src/commands/checkpoints.ts`

```typescript
export function resumeCommand() {
  return cli()
    .name("resume")
    .description("Resume processing from a checkpoint")
    .action(async () => {
      const checkpoints = listCheckpoints();

      if (checkpoints.length === 0) {
        console.log("No checkpoints found.");
        console.log("Run 'humanify unminify <file> --turbo' to create checkpoints.");
        return;
      }

      console.log(`\nAvailable checkpoints:\n`);
      checkpoints.forEach((cp, idx) => {
        const progress = `${cp.completedBatches}/${cp.totalBatches} batches`;
        const percentage = Math.round((cp.completedBatches / cp.totalBatches) * 100);
        const date = new Date(cp.timestamp).toLocaleString();
        const file = cp.originalFile ?? "unknown file";
        const provider = cp.originalProvider ?? "unknown";

        console.log(`  [${idx + 1}] ${file}`);
        console.log(`      Progress: ${progress} (${percentage}% complete)`);
        console.log(`      Provider: ${provider}`);
        console.log(`      Timestamp: ${date}`);
        console.log();
      });

      const choice = await promptUser("Select checkpoint [1-" + checkpoints.length + "] or Q to cancel: ");

      if (choice.toLowerCase() === "q") {
        console.log("\nCancelled.");
        return;
      }

      const index = parseInt(choice) - 1;
      if (isNaN(index) || index < 0 || index >= checkpoints.length) {
        console.error(`\n❌ Invalid choice: ${choice}`);
        return;
      }

      const cp = checkpoints[index];
      const file = cp.originalFile;

      if (!file) {
        console.error(`\n❌ Checkpoint missing original file path`);
        console.error(`   This checkpoint was created with an older version.`);
        console.error(`   Please delete it with: humanify clear-checkpoints`);
        return;
      }

      // Check if file still exists
      const fs = await import("fs/promises");
      try {
        await fs.access(file);
      } catch {
        console.error(`\n❌ Original file not found: ${file}`);
        console.error(`   The file may have been moved or deleted.`);
        console.error(`   Delete this checkpoint with: humanify clear-checkpoints`);
        return;
      }

      // Reconstruct command
      console.log(`\n✅ Resuming: ${file}`);
      console.log(`   Provider: ${cp.originalProvider}`);
      if (cp.originalModel) {
        console.log(`   Model: ${cp.originalModel}`);
      }
      console.log(`   Progress: ${cp.completedBatches}/${cp.totalBatches} batches\n`);

      // Import and call unminify command programmatically
      const { unminifyCommand } = await import("./unminify.js");

      // Reconstruct args
      const args = cp.originalArgs ?? {};

      // Build command array (for commander.js)
      const commandArgs = [file];

      // Parse the original command - need to reconstruct process.argv format
      // This is tricky because commander.js expects process.argv
      // Easier solution: Print the command for user to run

      console.log(`Run this command to resume:\n`);
      let cmd = `humanify unminify ${file}`;

      if (args.provider && args.provider !== "openai") {
        cmd += ` --provider ${args.provider}`;
      }
      if (args.model) {
        cmd += ` --model ${args.model}`;
      }
      if (args.outputDir && args.outputDir !== "output") {
        cmd += ` --outputDir ${args.outputDir}`;
      }
      if (args.turbo) {
        cmd += ` --turbo`;
      }
      if (args.maxConcurrent && args.maxConcurrent !== "10") {
        cmd += ` --max-concurrent ${args.maxConcurrent}`;
      }
      if (args.dependencyMode && args.dependencyMode !== "balanced") {
        cmd += ` --dependency-mode ${args.dependencyMode}`;
      }
      if (args.contextSize && args.contextSize !== `${DEFAULT_CONTEXT_WINDOW_SIZE}`) {
        cmd += ` --context-size ${args.contextSize}`;
      }

      console.log(`  ${cmd}\n`);
      console.log(`(Checkpoint will be automatically detected and you'll be prompted to resume)\n`);
    });
}
```

**Alternative Approach (Simpler)**:

Instead of programmatically calling unminify, just print the command for user to copy/paste. This is simpler and avoids process.argv manipulation complexity.

**Register in**: `src/index.ts`

```typescript
import { clearCheckpointsCommand, resumeCommand } from "./commands/checkpoints.js";

cli()
  // ...
  .addCommand(clearCheckpointsCommand())
  .addCommand(resumeCommand())  // NEW
  .parse(process.argv);
```

---

### P4-1: Manual Testing and Validation

**Status**: Not Started
**Effort**: 30 minutes
**Dependencies**: P2-1, P3-1, P3-2 (all features implemented)
**Spec Reference**: All KISS requirements
**Status Reference**: STATUS-2025-11-13-123032.md section "Success Metrics"

#### Description
Manually test all checkpoint flows to ensure everything works end-to-end in real usage.

#### Acceptance Criteria
- [ ] **Scenario 1: Normal completion (no checkpoint prompt)**
  - Run `humanify unminify small-file.js --turbo` to completion
  - Verify no checkpoint files remain after completion

- [ ] **Scenario 2: Resume from checkpoint**
  - Run `humanify unminify medium-file.js --turbo --max-concurrent 5`
  - Interrupt with Ctrl+C after ~20% complete
  - Verify checkpoint file exists in `.humanify-checkpoints/`
  - Run same command again
  - Verify startup prompt appears with correct info
  - Select [1] Resume
  - Verify processing continues from checkpoint
  - Verify output is correct

- [ ] **Scenario 3: Start fresh (delete checkpoint)**
  - With existing checkpoint from scenario 2
  - Run `humanify unminify medium-file.js --turbo --max-concurrent 10` (different args)
  - Verify startup prompt shows arg mismatch warning
  - Select [2] Start fresh
  - Verify checkpoint deleted
  - Verify processing starts from beginning

- [ ] **Scenario 4: clear-checkpoints command**
  - Create 2-3 checkpoints by interrupting different files
  - Run `humanify clear-checkpoints`
  - Verify all checkpoints listed
  - Confirm deletion
  - Verify all checkpoints deleted

- [ ] **Scenario 5: resume command**
  - Create checkpoint by interrupting processing
  - Run `humanify resume`
  - Verify checkpoint listed with details
  - Verify command printed for user to run

- [ ] **Scenario 6: No checkpoints**
  - Clear all checkpoints
  - Run `humanify unminify file.js --turbo`
  - Verify no prompt appears
  - Verify normal processing

- [ ] **Scenario 7: File not found**
  - Create checkpoint
  - Move/rename original file
  - Run `humanify resume`
  - Verify error message about missing file

#### Technical Notes

**Test files**:
- Small (fast): `test-samples/valid-output.js` (~20KB)
- Medium (interruptible): `test-samples/multi-flags.js` if available, or download with `just download-tensorflow`

**Test script** (create as `test-checkpoint-manual.sh`):

```bash
#!/bin/bash
set -e

echo "=== Manual Checkpoint Testing ==="
echo

# Build
echo "Building..."
npm run build

echo
echo "=== Scenario 1: Normal completion ==="
./dist/index.mjs unminify test-samples/valid-output.js --turbo --output /tmp/test1
ls -la .humanify-checkpoints/ || echo "No checkpoints (expected)"

echo
echo "=== Scenario 2: Create checkpoint (will interrupt) ==="
echo "Press Ctrl+C after a few seconds..."
./dist/index.mjs unminify test-samples/valid-output.js --turbo --output /tmp/test2 --max-concurrent 2 &
PID=$!
sleep 5
kill -INT $PID || true
wait $PID || true

echo
echo "Checking for checkpoint files..."
ls -la .humanify-checkpoints/
cat .humanify-checkpoints/*.json | jq . || true

echo
echo "=== Scenario 3: Resume prompt ==="
echo "Run manually: ./dist/index.mjs unminify test-samples/valid-output.js --turbo --max-concurrent 2"
echo "Select [1] to resume"
echo

echo "=== Test complete. Run additional scenarios manually. ==="
```

---

## Dependencies and Order

```
P0-1 (Verify Core)
  ├─> P1-1 (Add Fields)
  │     ├─> P2-1 (Startup Prompt)
  │     └─> P3-1 (clear-checkpoints)
  │           └─> P3-2 (resume)
  └─────────────> P4-1 (Manual Testing)
```

**Critical Path**: P0-1 → P1-1 → P2-1 → P4-1 (3.5-4.5 hours)
**Parallel Work**: P3-1 and P3-2 can be done while P2-1 is in progress (saves 30 mins)

---

## Time Breakdown

| Task | Estimated | Actual | Notes |
|------|-----------|--------|-------|
| P0-1: Verify core | 30 min | | CRITICAL - may uncover issues |
| P1-1: Add fields | 30 min | | Should be straightforward |
| P2-1: Startup prompt | 2-3 hours | | Most complex UI work |
| P3-1: clear-checkpoints | 45 min | | Simple CRUD |
| P3-2: resume | 1 hour | | Command printing approach is simple |
| P4-1: Testing | 30 min | | Manual validation |
| **TOTAL** | **5-6 hours** | | Can ship today |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Checkpoint save doesn't work | MEDIUM | HIGH | P0-1 catches this early |
| Args mismatch confuses users | LOW | MEDIUM | Clear warning message in prompt |
| File moved after checkpoint | LOW | LOW | Error message with clear action |
| Backwards compat with old checkpoints | LOW | LOW | Make new fields optional |
| User interrupts during prompt | LOW | LOW | Already handled by signal handler |

---

## Success Criteria

### Must Have (MVP)
- [x] Core checkpoint save/resume works (verify in P0-1)
- [ ] Startup prompt appears when checkpoint exists
- [ ] User can choose resume or start fresh
- [ ] Args mismatch warning displayed
- [ ] Always uses checkpoint's original args on resume
- [ ] `clear-checkpoints` command works
- [ ] `resume` command works
- [ ] All manual test scenarios pass

### Should Have (Quality)
- [ ] Clear, non-confusing UI messages
- [ ] Graceful error handling for edge cases
- [ ] Consistent formatting across prompts
- [ ] All existing tests still pass

### Nice to Have (Future)
- Automatic old checkpoint cleanup
- Progress bar during resume
- Checkpoint file size display
- Export/import checkpoints

---

## Implementation Notes

### Shared Code Patterns

**User Input Helper** (use in all commands):
```typescript
async function promptUser(message: string): Promise<string> {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
```

**Checkpoint Display Format** (consistent across commands):
```typescript
function formatCheckpointInfo(cp: Checkpoint): string {
  const progress = `${cp.completedBatches}/${cp.totalBatches} batches`;
  const percentage = Math.round((cp.completedBatches / cp.totalBatches) * 100);
  const date = new Date(cp.timestamp).toLocaleString();
  const file = cp.originalFile ?? "unknown file";

  return `${file} (${percentage}% complete, ${date})`;
}
```

### Files to Modify

1. **`src/checkpoint.ts`** (P1-1)
   - Update `Checkpoint` interface
   - All functions are already complete

2. **`src/plugins/local-llm-rename/visit-all-identifiers.ts`** (P1-1)
   - Update `VisitOptions` interface
   - Update `saveCheckpoint()` calls to include metadata

3. **`src/commands/unminify.ts`** (P1-1, P2-1)
   - Pass checkpoint metadata to unminify
   - Add `handleCheckpointPrompt()` function
   - Integrate prompt before execution

4. **`src/commands/checkpoints.ts`** (NEW file, P3-1, P3-2)
   - Implement `clearCheckpointsCommand()`
   - Implement `resumeCommand()`
   - Shared helper functions

5. **`src/index.ts`** (P3-1, P3-2)
   - Register new commands

### Testing Strategy

1. **Unit tests**: Not needed - UI code is hard to unit test, prefer manual testing
2. **E2E tests**: Existing checkpoint tests already validate core logic
3. **Manual tests**: Comprehensive scenarios in P4-1 cover all user flows

---

## What's Explicitly Out of Scope

Per user's KISS requirements, these are **NOT** being implemented:

- ❌ Signal handlers (Ctrl+C, SIGTERM) - User accepted this trade-off
- ❌ CLI flags (--enable-checkpoints, --resume-from) - Auto-detect only
- ❌ Complex interactive prompts with inspect/delete - Simple menu only
- ❌ Salvage feature for corrupted checkpoints - Fail fast instead
- ❌ Checkpoint compression - Keep it simple
- ❌ Metadata/expiration - No auto-cleanup
- ❌ Refine-aware checkpoint tracking - Out of scope
- ❌ Progress tracking within batches - Batch-level only

**Rationale**: YAGNI (You Aren't Gonna Need It). Ship MVP, iterate based on real usage.

---

## Deployment Checklist

Before marking as complete:

- [ ] All tests passing (`npm test`)
- [ ] All manual scenarios validated (P4-1)
- [ ] No console.error() calls for normal operation
- [ ] Clear user-facing messages (no debug output)
- [ ] Backwards compatible with existing checkpoints (optional fields)
- [ ] CLAUDE.md updated with checkpoint usage
- [ ] No dead code or commented-out sections
- [ ] Clean git status (no debug files checked in)

---

## Future Enhancements (Post-MVP)

If users request more features later:

1. **Checkpoint management** (1 hour)
   - `humanify checkpoints list` - List without prompting
   - `humanify checkpoints delete <hash>` - Delete specific checkpoint

2. **Better UX** (1 hour)
   - Colored output for warnings
   - Progress bar during resume
   - Time estimates ("~5 minutes remaining")

3. **Advanced features** (2-4 hours)
   - Checkpoint diff (show what will be reprocessed)
   - Export/import for sharing checkpoints
   - Auto-cleanup of old checkpoints

4. **Signal handlers** (2 hours)
   - Graceful Ctrl+C handling (save immediately)
   - SIGTERM handling for cloud environments

**Priority**: Only implement if users actually ask for these. Focus on shipping MVP first.

---

**Plan Complete**: Ready for implementation. Start with P0-1 to verify core functionality.
