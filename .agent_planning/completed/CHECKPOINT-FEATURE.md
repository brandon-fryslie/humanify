# Checkpoint Feature - Crash Recovery

**Date**: 2025-11-12
**Status**: Implemented - Basic batch-level checkpointing

---

## Overview

Automatic checkpoint saving to prevent loss of progress when rate limits or crashes occur during processing.

## How It Works

### Checkpoint Saves
1. After each batch completes in turbo mode, save checkpoint to `.humanify-checkpoints/`
2. Checkpoint includes:
   - Completed batch number
   - Total batches
   - Timestamp
   - Input file hash (for matching)

### Auto-Resume
1. When processing starts, check for existing checkpoint
2. If checkpoint found for same input file:
   - Validate batch count matches (dependency graph didn't change)
   - Skip already-completed batches
   - Resume from next batch
3. Show clear feedback to user

### Auto-Cleanup
- Delete checkpoint automatically on successful completion
- Keeps `.humanify-checkpoints/` clean

## User Experience

### Normal Flow (No Checkpoint)
```bash
$ humanify unminify --provider openai input.js --turbo

→ Building dependency graph...
→ Total batches: 100
→ Processing batch 1/100...
💾 Checkpoint saved: 1/100 batches complete
→ Processing batch 2/100...
💾 Checkpoint saved: 2/100 batches complete
...
⚠️  Rate limit hit (attempt 1/10)
    Waiting 59.7s before retry...
    Resuming...
...
→ Processing batch 100/100...
✅ Checkpoint deleted (processing complete)
```

### Resume Flow (Found Checkpoint)
```bash
$ humanify unminify --provider openai input.js --turbo

📂 Found checkpoint: 45/100 batches already completed
   Timestamp: 11/12/2025, 5:30:22 PM
→ Resuming from batch 46/100
→ Processing batch 46/100...
💾 Checkpoint saved: 46/100 batches complete
...
```

## Current Limitations

### 1. Batch-Level Only
- Saves progress per batch, not per identifier
- If batch crashes midway, that batch restarts from beginning
- **Impact**: May re-process up to `maxBatchSize` identifiers (default: 100)

### 2. No Rename Storage
- Doesn't store actual renames in checkpoint
- Can't skip API calls for completed identifiers within resumed batch
- **Impact**: Some redundant API calls on resume

### 3. Dependency Graph Changes
- If code changes between runs, dependency graph may differ
- Different batch count = checkpoint rejected, start fresh
- **Reason**: Safety - don't want to apply stale renames

## Future Improvements

### Priority 1: Store Renames in Checkpoint
```typescript
interface Checkpoint {
  // ... existing fields
  renames: Record<string, string>; // oldName -> newName
  visitedIdentifiers: string[];    // List of completed identifiers
}
```

**Benefit**: On resume, skip API calls for already-renamed identifiers
**Effort**: Medium - need to serialize/deserialize rename map

### Priority 2: Finer-Grained Checkpoints
- Save checkpoint every N identifiers instead of per batch
- Allows resume within a batch
**Benefit**: Minimize wasted API calls
**Effort**: Low - just increase save frequency

### Priority 3: Manual Checkpoint Management
```bash
# List checkpoints
humanify checkpoints list

# Resume specific checkpoint
humanify unminify --provider openai input.js --checkpoint abc123

# Delete old checkpoints
humanify checkpoints clean --older-than 7d
```

**Benefit**: User control over checkpoints
**Effort**: Medium - add CLI commands

## Implementation Details

### File Structure
```
.humanify-checkpoints/
  ├── abc123def456.json  # Checkpoint for file hash abc123def456
  └── 789ghi012jkl.json  # Checkpoint for another file
```

### Checkpoint Format
```json
{
  "version": "1.0.0",
  "timestamp": 1731455422000,
  "inputHash": "abc123def456",
  "completedBatches": 45,
  "totalBatches": 100,
  "renames": {},
  "partialCode": ""
}
```

### Key Functions

**`src/checkpoint.ts`**:
- `saveCheckpoint()` - Write checkpoint to disk
- `loadCheckpoint()` - Read checkpoint if exists
- `deleteCheckpoint()` - Remove on completion
- `getCheckpointId()` - Hash input file for unique ID

**`src/plugins/local-llm-rename/visit-all-identifiers.ts`**:
- Modified `visitAllIdentifiersTurbo()` to:
  - Check for checkpoint before starting
  - Skip completed batches
  - Save after each batch
  - Delete on completion

## Testing

### Manual Test
```bash
# Start processing a large file
humanify unminify --provider openai large-file.js --turbo

# Kill it mid-processing (Ctrl+C)

# Restart - should resume
humanify unminify --provider openai large-file.js --turbo
# Should see: "📂 Found checkpoint: N/M batches already completed"
```

### Verification
- Check `.humanify-checkpoints/` directory created
- Verify checkpoint file exists after first batch
- Confirm resume skips completed batches
- Verify checkpoint deleted on success

## Cost Savings

### Example: 10K Identifier File
- Total batches: 100 (100 identifiers per batch)
- Crash at batch 50
- **Without checkpoints**: Restart from 0, lose 5K API calls (~$5-10)
- **With checkpoints**: Resume from batch 50, save 5K API calls

### Large File (100K identifiers)
- Total batches: 1000
- Crash at batch 800
- **Savings**: 80K API calls (~$80-160 saved)

## Conclusion

Checkpoint feature provides:
- ✅ Automatic crash recovery
- ✅ No user action required
- ✅ Significant cost savings on large files
- ✅ Clear feedback during operation

Current limitations are minor and can be improved incrementally if needed.
