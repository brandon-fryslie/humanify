# Memory Optimization Status Report
**Date:** 2025-10-31
**Focus:** Memory management for processing large minified JavaScript files

## Critical Problem

**Humanify runs out of memory when processing large files**, making it unable to handle production-scale minified JavaScript bundles.

### Evidence

From recent test runs:
- Process d1a366: **KILLED** due to memory exhaustion
- Process 7a65c8: **FAILED** with rate limit error after 23% progress
- TensorFlow.js (1.4MB, ~34K identifiers):
  - Dependency graph: **332MB**
  - Peak memory: **~453MB**
  - 70,541 dependencies generated for 869 identifiers (81:1 ratio!)

### Root Causes

1. **Dependency Graph Explosion**
   - **332MB** for scope hierarchy map
   - 70,541 dependencies for 869 identifiers
   - All held in memory simultaneously
   - Quadratic growth with file size

2. **Full AST in Memory**
   - Entire file parsed and held as AST
   - No streaming or chunking
   - Memory proportional to file size

3. **Batch Context Pre-extraction**
   - All contexts extracted before API calls
   - Each context = up to `contextWindowSize` chars
   - All held until batch completes

4. **Scope Hierarchy Map**
   - Complete scope containment tree in memory
   - Not released until processing complete

## Current Infrastructure

### ✅ What Exists

1. **MemoryMonitor** (`src/memory-monitor.ts`)
   - Checkpointing at phases
   - Limit checking (`checkLimit()`, `abortIfExceeds()`)
   - Peak tracking and reporting
   - **Gap:** No automated GC triggering
   - **Gap:** No dynamic batch size adjustment

2. **Dependency Caching** (`src/plugins/local-llm-rename/dependency-cache.ts`)
   - Saves dependency graph to disk
   - Reuses across runs
   - **Gap:** Still loads entire graph into memory
   - **Gap:** No streaming read/write

3. **Turbo Mode** (`src/plugins/local-llm-rename/visit-all-identifiers.ts`)
   - Parallel batch processing
   - Batch merging/splitting
   - **Gap:** No memory-aware batch sizing
   - **Gap:** Processes entire file at once

### ❌ What's Missing

1. **File Splitting**
   - No chunking infrastructure
   - No top-level statement splitter
   - No chunk reassembly logic
   - No cross-chunk reference handling

2. **Progressive Memory Management**
   - No dynamic batch size reduction
   - No automatic GC triggering
   - No memory pressure detection

3. **Disk-Based Processing**
   - No batch result persistence
   - No streaming dependency graph
   - No intermediate result cleanup

4. **Memory-Aware Scheduling**
   - No batch size based on available memory
   - No adaptive concurrency limits
   - No memory headroom calculation

## Proposed Solutions (Prioritized)

### Priority 1: File Splitting ⭐⭐⭐

**Impact:** **HIGH** - Reduces memory by 10-100x
**Effort:** **MEDIUM** - Requires new infrastructure
**Risk:** **MEDIUM** - Must handle cross-chunk references correctly

**Approach:**
1. Split large files at top-level statement boundaries
2. Process each chunk independently
3. Handle cross-chunk references via shared symbol table
4. Reassemble chunks preserving semantics

**Target:** Process 10MB files by splitting into 1MB chunks

### Priority 2: Progressive Batch Size Reduction ⭐⭐

**Impact:** **MEDIUM** - Prevents OOM, slower processing
**Effort:** **LOW** - Modify existing code
**Risk:** **LOW** - Graceful degradation

**Approach:**
1. Monitor heap usage during batch processing
2. Dynamically reduce `maxConcurrent` when memory > 80%
3. Trigger GC between batches
4. Warn user if batch size drops below threshold

**Target:** Never exceed `--max-memory` limit

### Priority 3: Disk-Based Caching ⭐

**Impact:** **MEDIUM** - Reduces memory for large batches
**Effort:** **MEDIUM** - New persistence layer
**Risk:** **LOW** - Adds I/O overhead

**Approach:**
1. Save batch results to disk after processing
2. Clear batch from memory
3. Stream batches back for AST mutation phase
4. Clean up temp files on completion

**Target:** Process 100K+ identifier files

## Implementation Plan

### Phase 1: File Splitting (This Sprint)

**Goal:** Process files 10x larger without memory issues

1. **Create File Splitter** (`src/file-splitter.ts`)
   - Split AST at top-level statements
   - Maintain symbol table across chunks
   - Track cross-chunk dependencies

2. **Update unminify.ts**
   - Detect large files (> threshold)
   - Split before processing
   - Process chunks sequentially
   - Reassemble output

3. **Add `--chunk-size` Flag**
   - Default: 50,000 chars per chunk
   - Auto-calculate based on `--max-memory`

4. **Testing**
   - Unit tests for splitter
   - E2E test with 10MB file
   - Verify output equivalence

**Success Criteria:**
- Process TensorFlow.js (1.4MB) with < 200MB peak memory
- Process Babylon.js (7.2MB) without OOM
- Output matches non-chunked version

### Phase 2: Progressive Memory Management (Next Sprint)

**Goal:** Gracefully handle memory pressure

1. **Enhance MemoryMonitor**
   - Add `getAvailableHeadroom()` method
   - Add `recommendBatchSize()` method
   - Add `triggerGC()` helper

2. **Update Turbo Mode**
   - Check memory before each batch
   - Reduce `maxConcurrent` if low memory
   - Log warnings to user

3. **Add `--adaptive-batching` Flag**
   - Enable dynamic batch sizing
   - Set memory threshold (default 80%)

**Success Criteria:**
- Never OOM even with insufficient `--max-memory`
- Warn user if processing becomes too slow
- Automatically recover from memory pressure

### Phase 3: Disk-Based Caching (Future)

**Goal:** Handle extremely large files (100K+ identifiers)

1. **Create Batch Persistence** (`src/batch-cache.ts`)
   - Save batch results to temp directory
   - Stream results back for AST phase
   - Clean up on completion/error

2. **Update Turbo Mode**
   - Persist batches after API calls
   - Clear from memory
   - Load only during AST mutation

3. **Add `--disk-cache` Flag**
   - Enable batch persistence
   - Specify cache directory

**Success Criteria:**
- Process 100K identifier files
- Memory usage independent of file size
- Minimal performance overhead (< 10%)

## Risk Assessment

### File Splitting Risks

1. **Cross-Chunk References**
   - **Risk:** Variable renamed in chunk 1 referenced in chunk 2
   - **Mitigation:** Build global symbol table, share across chunks
   - **Fallback:** Disable splitting for files with complex dependencies

2. **Semantic Changes**
   - **Risk:** Splitting changes code behavior
   - **Mitigation:** Only split at top-level statements
   - **Fallback:** Validate output with comparison tests

3. **Increased Complexity**
   - **Risk:** Harder to debug issues
   - **Mitigation:** Add verbose logging for chunk boundaries
   - **Fallback:** Flag to disable chunking

### Progressive Batch Size Risks

1. **Slow Processing**
   - **Risk:** Batch size = 1 is too slow
   - **Mitigation:** Warn user, suggest more memory
   - **Fallback:** Abort if estimated time > threshold

2. **GC Overhead**
   - **Risk:** Too-frequent GC hurts performance
   - **Mitigation:** Only GC when memory > threshold
   - **Fallback:** Make GC optional

### Disk-Based Caching Risks

1. **Disk Space**
   - **Risk:** Large files fill up disk
   - **Mitigation:** Calculate required space upfront
   - **Fallback:** Abort if insufficient space

2. **I/O Overhead**
   - **Risk:** Disk I/O slower than memory
   - **Mitigation:** Only enable for very large files
   - **Fallback:** Make it optional

## Success Metrics

### Memory Targets

| File Size | Identifiers | Current Peak | Target Peak | Reduction |
|-----------|-------------|--------------|-------------|-----------|
| 1.4MB     | 34K         | 453MB        | 200MB       | 56%       |
| 7.2MB     | 82K         | OOM          | 500MB       | N/A       |
| 14MB      | 150K+       | OOM          | 800MB       | N/A       |

### Performance Targets

- File splitting overhead: < 5% of total time
- Disk caching overhead: < 10% of total time
- No OOM failures for files up to 10MB
- Graceful degradation (no crashes) for any file size

## Next Actions

1. **Immediate:** Start Phase 1 implementation
   - Create `src/file-splitter.ts`
   - Design chunk splitting algorithm
   - Write tests for edge cases

2. **Week 1:** Complete file splitting
   - Integrate with unminify pipeline
   - Test on TensorFlow.js
   - Test on Babylon.js

3. **Week 2:** Start Phase 2
   - Enhance MemoryMonitor
   - Implement adaptive batching
   - Add monitoring/logging

4. **Future:** Evaluate Phase 3 necessity
   - Collect real-world usage data
   - Determine if disk caching needed
   - Consider streaming alternatives
