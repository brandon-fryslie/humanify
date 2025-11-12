# Memory Optimization Implementation Plan
**Date:** 2025-10-31
**Status:** PLANNED
**Priority:** P0 - CRITICAL

## Executive Summary

Implement three-phase memory optimization to enable processing of large minified JavaScript files:
1. **Phase 1:** File splitting (reduces memory 10-100x)
2. **Phase 2:** Progressive batch size reduction (prevents OOM)
3. **Phase 3:** Disk-based caching (handles extreme files)

## Phase 1: File Splitting [THIS SPRINT]

### Overview

Split large files into smaller chunks at top-level statement boundaries, process independently, and reassemble.

### Architecture

```
┌──────────────┐
│ Large File   │
│  (10MB)      │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  File Splitter       │
│  - Parse AST         │
│  - Split at top-level│
│  - Extract symbols   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Chunks (1MB each)                   │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │Chunk 1 │ │Chunk 2 │ │Chunk N │  │
│  └────────┘ └────────┘ └────────┘  │
└──────────────┬───────────────────────┘
               │
               ▼
      ┌────────────────┐
      │ Process Chunks │
      │  Sequentially  │
      └────────┬───────┘
               │
               ▼
      ┌────────────────┐
      │   Reassemble   │
      └────────┬───────┘
               │
               ▼
      ┌────────────────┐
      │  Output File   │
      └────────────────┘
```

### Components

#### 1. File Splitter (`src/file-splitter.ts`)

**Purpose:** Split large JavaScript files into processable chunks

```typescript
export interface SplitOptions {
  maxChunkSize: number;        // Max chars per chunk (default: 50000)
  minChunkSize: number;        // Min chars per chunk (default: 10000)
  splitStrategy: 'statements' | 'functions' | 'modules';
}

export interface FileChunk {
  index: number;
  code: string;
  startLine: number;
  endLine: number;
  symbols: string[];          // Symbols defined in this chunk
  externalRefs: string[];     // Symbols referenced but not defined
}

export interface SplitResult {
  chunks: FileChunk[];
  globalSymbols: Map<string, number>;  // symbol -> chunk index
  metadata: {
    originalSize: number;
    chunkCount: number;
    avgChunkSize: number;
  };
}

export async function splitFile(
  code: string,
  options: SplitOptions
): Promise<SplitResult>
```

**Algorithm:**
1. Parse code to AST
2. Find top-level statements (Program.body)
3. Group statements into chunks targeting `maxChunkSize`
4. Extract symbols from each chunk
5. Build global symbol table
6. Return chunks + metadata

**Edge Cases:**
- Single statement > `maxChunkSize` → Don't split that statement
- Circular dependencies → Keep dependent statements together
- IIFE patterns → Don't split across IIFE boundaries
- Module exports → Track in global symbol table

#### 2. Chunk Processor (`src/chunk-processor.ts`)

**Purpose:** Process chunks with shared context

```typescript
export interface ProcessOptions {
  sharedSymbols: Map<string, string>;  // Original -> renamed mapping
  visitor: (name: string, scope: string) => Promise<string>;
  contextWindowSize: number;
}

export async function processChunk(
  chunk: FileChunk,
  options: ProcessOptions
): Promise<{
  renamedCode: string;
  newSymbols: Map<string, string>;  // New renames from this chunk
}>
```

**Algorithm:**
1. Prepend shared symbol declarations to chunk context
2. Run existing rename logic on chunk
3. Track new renames
4. Return renamed code + symbol updates

#### 3. Chunk Reassembler (`src/chunk-reassembler.ts`)

**Purpose:** Combine processed chunks into final output

```typescript
export interface ReassembleOptions {
  preserveComments: boolean;
  addChunkMarkers: boolean;  // For debugging
}

export function reassembleChunks(
  chunks: Array<{code: string; metadata: FileChunk}>,
  options: ReassembleOptions
): string
```

**Algorithm:**
1. Concatenate chunks in order
2. Optionally add comment markers between chunks
3. Validate symbol table consistency
4. Return combined code

### Integration Points

#### Update `unminify.ts`

```typescript
export async function unminify(
  filename: string,
  outputDir: string,
  plugins: ((code: string) => Promise<string>)[] = [],
  options: UnminifyOptions = {}
) {
  const bundledCode = await fs.readFile(filename, "utf-8");

  // NEW: Check if file should be split
  const shouldSplit = bundledCode.length > (options.chunkSize || 100000);

  if (shouldSplit) {
    console.log(`  → File size ${bundledCode.length} exceeds chunk threshold`);
    console.log(`  → Splitting into chunks...`);

    const splitResult = await splitFile(bundledCode, {
      maxChunkSize: options.chunkSize || 50000,
      minChunkSize: 10000,
      splitStrategy: 'statements'
    });

    console.log(`  → Created ${splitResult.chunks.length} chunks`);

    // Process each chunk
    const processedChunks = [];
    const sharedSymbols = new Map<string, string>();

    for (let i = 0; i < splitResult.chunks.length; i++) {
      const chunk = splitResult.chunks[i];
      console.log(`\n  → Processing chunk ${i+1}/${splitResult.chunks.length}...`);

      const processed = await processChunk(chunk, {
        sharedSymbols,
        visitor: /* create visitor from plugins */,
        contextWindowSize: options.contextWindowSize
      });

      // Update shared symbols for next chunk
      for (const [orig, renamed] of processed.newSymbols) {
        sharedSymbols.set(orig, renamed);
      }

      processedChunks.push({
        code: processed.renamedCode,
        metadata: chunk
      });

      // Force GC after each chunk
      if (global.gc) global.gc();
    }

    // Reassemble
    const finalCode = reassembleChunks(processedChunks, {
      preserveComments: true,
      addChunkMarkers: options.debugChunks || false
    });

    return finalCode;
  }

  // Existing non-chunked path
  return processFullFile(bundledCode, plugins, options);
}
```

### CLI Integration

Add new flags to all commands:

```typescript
.option(
  "--chunk-size <size>",
  "Split files larger than this (chars). Default: auto-detect based on --max-memory",
  "100000"
)
.option(
  "--no-chunking",
  "Disable file chunking even for large files"
)
.option(
  "--debug-chunks",
  "Add comment markers between chunks for debugging"
)
```

### Testing Strategy

#### Unit Tests

**`src/file-splitter.test.ts`:**
- Split simple file with 2 functions
- Split file with circular dependencies
- Handle single huge function
- Extract symbols correctly
- Build global symbol table

**`src/chunk-processor.test.ts`:**
- Process chunk with shared symbols
- Handle cross-chunk references
- Rename local vs global symbols

**`src/chunk-reassembler.test.ts`:**
- Reassemble 3 chunks
- Preserve formatting
- Add debug markers

#### Integration Tests

**`test-samples/large-file.llmtest.ts`:**
```typescript
test('process 1MB file with chunking', async () => {
  const output = await runHumanify('large.min.js', {
    chunkSize: 50000,
    maxMemory: 200
  });

  // Verify output
  expect(output).toMatch(/humanified/);

  // Verify memory stayed under limit
  expect(peakMemory).toBeLessThan(200 * 1024 * 1024);
});
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Splitting overhead | < 5% | Time to split vs process |
| Memory reduction | > 50% | Peak heap with vs without |
| Correctness | 100% | Output matches non-chunked |
| Max file size | 10MB | Can process without OOM |

### Rollout Plan

1. **Week 1:**
   - Implement file-splitter.ts
   - Write unit tests
   - Test on small samples

2. **Week 2:**
   - Implement chunk-processor.ts
   - Implement chunk-reassembler.ts
   - Integration testing

3. **Week 3:**
   - Update unminify.ts
   - Update all commands
   - E2E testing on TensorFlow.js and Babylon.js

### Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Cross-chunk refs break | HIGH | MEDIUM | Extensive testing, shared symbol table |
| Semantics change | CRITICAL | LOW | Only split at safe boundaries |
| Perf degradation | MEDIUM | MEDIUM | Make chunking optional, tune chunk size |
| Complexity | MEDIUM | HIGH | Good docs, debug markers, verbose logging |

---

## Phase 2: Progressive Batch Size Reduction [NEXT SPRINT]

### Overview

Dynamically adjust batch sizes and concurrency based on available memory.

### Components

#### 1. Enhanced MemoryMonitor

```typescript
export class MemoryMonitor {
  // Existing methods...

  /**
   * Get available heap headroom in MB
   */
  getAvailableHeadroom(): number {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const limit = this.maxMemoryMB || Infinity;
    return limit - used;
  }

  /**
   * Recommend batch size based on available memory
   */
  recommendBatchSize(
    currentBatchSize: number,
    memoryPerItem: number
  ): number {
    const headroom = this.getAvailableHeadroom();
    const safeHeadroom = headroom * 0.8;  // Leave 20% buffer
    const recommendedSize = Math.floor(safeHeadroom / memoryPerItem);
    return Math.max(1, Math.min(currentBatchSize, recommendedSize));
  }

  /**
   * Trigger garbage collection if available
   */
  tryGC(): void {
    if (global.gc) {
      global.gc();
      console.log(`    → Triggered GC`);
    }
  }
}
```

#### 2. Update Turbo Mode

```typescript
async function visitAllIdentifiersTurbo(/* ... */) {
  let currentMaxConcurrent = options.maxConcurrent ?? 10;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    // Check memory before each batch
    const headroom = memoryMonitor.getAvailableHeadroom();

    if (headroom < 50) {  // Less than 50MB free
      // Reduce concurrency
      const oldConcurrent = currentMaxConcurrent;
      currentMaxConcurrent = Math.max(1, Math.floor(currentMaxConcurrent / 2));

      console.warn(`⚠️  Low memory (${headroom.toFixed(0)}MB free)`);
      console.warn(`    Reducing concurrency: ${oldConcurrent} → ${currentMaxConcurrent}`);

      // Trigger GC
      memoryMonitor.tryGC();
    }

    // Process batch with adjusted concurrency
    await parallelLimit(
      tasks,
      currentMaxConcurrent,  // Use adjusted value
      onProgress
    );

    // GC between batches if low memory
    if (headroom < 100) {
      memoryMonitor.tryGC();
    }
  }
}
```

### CLI Integration

```typescript
.option(
  "--adaptive-batching",
  "Dynamically adjust batch size based on available memory",
  true  // Enabled by default
)
.option(
  "--memory-threshold <percent>",
  "Memory usage threshold for batch size reduction (0-100)",
  "80"
)
```

### Testing

**`src/memory-monitor.test.ts`:**
- Calculate headroom correctly
- Recommend smaller batch when low memory
- Recommend same batch when plenty of memory
- TryGC doesn't crash if gc unavailable

**Integration test:**
```typescript
test('adaptive batching prevents OOM', async () => {
  const output = await runHumanify('large.min.js', {
    maxMemory: 300,  // Intentionally low
    adaptiveBatching: true
  });

  // Should complete without crashing
  expect(output).toBeDefined();

  // Should have logged warnings
  expect(logs).toContain('Low memory');
  expect(logs).toContain('Reducing concurrency');
});
```

### Performance Impact

- Best case (plenty of memory): 0% overhead
- Worst case (constant low memory): 2-3x slower (batch size = 1)
- Typical: < 10% overhead

---

## Phase 3: Disk-Based Caching [FUTURE]

### Overview

Persist batch results to disk to reduce memory pressure for extremely large files.

### Components

#### 1. Batch Cache (`src/batch-cache.ts`)

```typescript
export class BatchCache {
  private cacheDir: string;

  async saveBatch(
    batchIndex: number,
    results: string[]
  ): Promise<void> {
    const filename = path.join(this.cacheDir, `batch-${batchIndex}.json`);
    await fs.writeFile(filename, JSON.stringify(results));
  }

  async loadBatch(batchIndex: number): Promise<string[]> {
    const filename = path.join(this.cacheDir, `batch-${batchIndex}.json`);
    const data = await fs.readFile(filename, 'utf-8');
    return JSON.parse(data);
  }

  async cleanup(): Promise<void> {
    await fs.rm(this.cacheDir, { recursive: true, force: true });
  }
}
```

#### 2. Update Turbo Mode

```typescript
async function visitAllIdentifiersTurbo(/* ... */) {
  const batchCache = new BatchCache(options.cachedir || '/tmp/humanify');

  try {
    // Phase 1: API calls with disk persistence
    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const newNames = await parallelLimit(/* ... */);

      // Save to disk
      await batchCache.saveBatch(batchIdx, newNames);

      // Clear from memory
      newNames.length = 0;
      memoryMonitor.tryGC();
    }

    // Phase 2: AST mutations from disk
    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const newNames = await batchCache.loadBatch(batchIdx);

      // Mutate AST
      for (let i = 0; i < newNames.length; i++) {
        // ... mutation logic ...
      }

      // Clear from memory
      newNames.length = 0;
    }
  } finally {
    await batchCache.cleanup();
  }
}
```

### Performance Target

- Disk I/O overhead: < 10% of total time
- Memory reduction: > 90% for API call phase
- Enables processing of 100K+ identifier files

---

## Success Criteria

### Phase 1 Complete When:
- ✅ TensorFlow.js (1.4MB) processes with < 200MB peak memory
- ✅ Babylon.js (7.2MB) processes without OOM
- ✅ Output matches non-chunked version (byte-for-byte or semantic equivalence)
- ✅ All tests passing
- ✅ Documentation updated

### Phase 2 Complete When:
- ✅ Adaptive batching prevents OOM in low-memory scenarios
- ✅ User warned when performance degrades significantly
- ✅ GC triggered appropriately
- ✅ All tests passing

### Phase 3 Complete When:
- ✅ 100K+ identifier files process successfully
- ✅ Disk I/O overhead < 10%
- ✅ Memory usage independent of file size
- ✅ Cleanup always runs (even on error)

## Timeline

- **Week 1-3:** Phase 1 (File Splitting)
- **Week 4-5:** Phase 2 (Progressive Batch Size)
- **Future:** Phase 3 (Disk Caching) - Implement if needed based on real-world usage

## Resource Requirements

- **Development Time:** 3-4 weeks (Phases 1-2)
- **Testing Time:** 1 week
- **Documentation:** 2-3 days
- **Code Review:** 3-4 sessions

## Next Steps

1. ✅ Status evaluation complete
2. ✅ Implementation plan created
3. ⏭️  Create `src/file-splitter.ts` stub
4. ⏭️  Write unit tests for file splitting
5. ⏭️  Implement splitting algorithm
