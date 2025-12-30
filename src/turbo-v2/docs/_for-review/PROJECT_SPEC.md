# Turbo V2: Project Specification

## Overview

Turbo V2 is a ground-up reimplementation of the parallel processing mode for HumanifyJS. It replaces the V1 dependency-graph approach with a **multi-pass architecture** that achieves high parallelism while maintaining quality through iterative refinement.

### Goals

1. **Speed**: Process 100K+ identifier files in hours, not days
2. **Quality**: Match or exceed sequential mode quality
3. **Reliability**: Robust checkpointing for long-running jobs
4. **Flexibility**: Pluggable processors for different strategies
5. **Observability**: Clear logging, progress tracking, and telemetry

### Non-Goals

- Backward compatibility with V1 turbo checkpoints
- Support for local LLM (OpenAI only for V2 initial release)
- Automatic chunking (handled separately in pipeline)

---

## Core Architecture: Multi-Pass Processing

### The Insight

Sequential processing gives best quality because each identifier sees all previously renamed identifiers. But it's slow.

The key insight: **Two parallel passes can match or exceed sequential quality.**

| Method | ID #1 Context | ID #500 Context | ID #1000 Context | Average |
|--------|---------------|-----------------|------------------|---------|
| Sequential | 0% renamed | 50% renamed | 100% renamed | 50% |
| 2-Pass Parallel | 100% (pass 1) | 100% (pass 1) | 100% (pass 1) | 100%* |

\* Pass 1 quality (~70% accurate names)

**Why this works:**
- Sequential gives BEST context to LAST identifiers (who often need it least)
- Sequential gives WORST context to FIRST identifiers (who may need it most)
- Multi-pass gives EQUAL context to ALL identifiers
- "Rough" names from pass 1 are much better than obfuscated names

### Cost/Benefit

| Method | API Calls | Wall Time (30 concurrent) | Quality |
|--------|-----------|---------------------------|---------|
| Sequential | n | n × latency | Baseline |
| 1-Pass Parallel | n | n/30 × latency | ~60-70% |
| 2-Pass Parallel | 2n | 2n/30 × latency | ~85-95% |

**2-pass is 15x faster than sequential with potentially equal or better quality.**

---

## Directory Structure

```
src/turbo-v2/
  index.ts                    # Main entry point

  # Core orchestration
  orchestrator.ts             # Runs multi-pass pipeline
  pass-runner.ts              # Executes a single pass

  # Processors
  processors/
    index.ts                  # Processor registry
    base.ts                   # PassProcessor interface
    llm-rename.ts             # Core LLM rename processor
    refinement.ts             # Confirm-or-improve processor
    anchor-detect.ts          # Identify high-value identifiers
    conflict-detect.ts        # Find inconsistent names
    consistency.ts            # Enforce naming patterns

  # Checkpointing
  checkpoint/
    manager.ts                # CheckpointManager implementation
    storage.ts                # File I/O for checkpoints
    types.ts                  # Checkpoint interfaces

  # Execution modes
  modes/
    parallel.ts               # Parallel execution
    streaming.ts              # Sliding window execution
    sequential.ts             # Sequential execution

  # Utilities
  context.ts                  # Context extraction for identifiers
  identifiers.ts              # Identifier discovery and info
  stats.ts                    # Statistics tracking

  # Types
  types.ts                    # Core interfaces
```

---

## CLI Interface

### Basic Usage

```bash
# Default: 2-pass parallel
humanify unminify input.js --turbo-v2

# Explicit pass count
humanify unminify input.js --turbo-v2 --passes 3

# Output directory
humanify unminify input.js --turbo-v2 -o output/
```

### Pass Configuration

```bash
# Per-pass configuration
# Syntax: processor:mode:concurrency[:filter][:options]

humanify unminify input.js --turbo-v2 \
  --pass "rename:parallel:50" \
  --pass "rename:parallel:50"

# Anchor-first pipeline
humanify unminify input.js --turbo-v2 \
  --pass "anchor-detect:parallel:100" \
  --pass "rename:sequential:1:anchors" \
  --pass "rename:parallel:50:non-anchors"

# Quality pipeline with refinement
humanify unminify input.js --turbo-v2 \
  --pass "rename:parallel:50" \
  --pass "refine:parallel:50" \
  --pass "conflict-detect:parallel:100" \
  --pass "rename:sequential:1:flagged"

# Mixed models
humanify unminify input.js --turbo-v2 \
  --pass "rename:parallel:100:model=gpt-4o-mini" \
  --pass "refine:parallel:20:model=gpt-4o"
```

### Presets

```bash
humanify unminify input.js --turbo-v2 --preset fast
humanify unminify input.js --turbo-v2 --preset balanced
humanify unminify input.js --turbo-v2 --preset quality
humanify unminify input.js --turbo-v2 --preset anchor
```

| Preset | Pipeline | Use Case |
|--------|----------|----------|
| `fast` | rename:parallel × 2 | Maximum speed |
| `balanced` | rename:parallel → refine:parallel | Good quality/speed |
| `quality` | rename → refine → conflict-detect → fix → consistency | Best quality |
| `anchor` | anchor-detect → rename:seq:anchors → rename:parallel | Large files |

### Checkpoint Options

```bash
# Force fresh start
humanify unminify input.js --turbo-v2 --fresh

# Replay from specific pass
humanify unminify input.js --turbo-v2 --replay-from 2

# Checkpoint management
humanify checkpoints list
humanify checkpoints show input.js
humanify checkpoints clear input.js
humanify checkpoints clear --older-than 7d
```

### Other Options

```bash
--context-size N        # Context window size (default: 5000)
--checkpoint-every N    # Save progress every N identifiers (default: 100)
--dry-run               # Show plan without executing
--verbose               # Detailed logging
--quiet                 # Minimal output
```

---

## Logging Format

```
[turbo-v2] Starting 2-pass processing for input.js
[turbo-v2] Found 5002 identifiers

[pass 1/2] Processor: rename | Mode: parallel (50 concurrent)
[pass 1/2] ████████████████████░░░░░░░░░░ 67% (3351/5002) | 45.2s | 32K tokens
[pass 1/2] Complete: 5002 identifiers | 82.1s | 48K tokens
[pass 1/2] Checkpoint saved

[pass 2/2] Processor: rename | Mode: parallel (50 concurrent)
[pass 2/2] Context: 5002 renames from pass 1
[pass 2/2] ████████████████████████████░░ 93% (4652/5002) | 78.3s | 51K tokens
[pass 2/2] Complete: 5002 identifiers | 84.2s | 55K tokens
[pass 2/2] Checkpoint saved

[turbo-v2] All passes complete
[turbo-v2] Total: 166.3s | 103K tokens | $0.31
[turbo-v2] Output: output/deobfuscated.js
```

### Progress Format

Real-time progress with:
- Pass number and total
- Visual progress bar
- Percentage and counts
- Elapsed time
- Token usage

### Interrupt Handling

```
^C
[turbo-v2] Interrupt received, saving checkpoint...
[turbo-v2] Progress saved: pass 2, 3421/5002 identifiers
[turbo-v2] Resume with: humanify unminify input.js --turbo-v2
```

---

## Checkpointing

### Directory Structure

```
.humanify-checkpoints/
  {input-hash}/
    job.json                      # Job metadata and state
    passes/
      pass-001-complete.json      # Completed pass results
      pass-002-complete.json
      pass-003-progress.json      # In-progress pass
    snapshots/
      after-pass-001.js           # Code after each pass
      after-pass-002.js
    history/
      identifiers.jsonl           # Per-identifier history
```

### Job Metadata (job.json)

```json
{
  "version": 2,
  "created": "2024-12-29T10:30:00Z",
  "updated": "2024-12-29T11:45:00Z",

  "input": {
    "file": "/path/to/input.js",
    "hash": "sha256:abc123...",
    "size": 1450000,
    "identifiers": 5002
  },

  "config": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "passes": [
      { "processor": "rename", "mode": "parallel", "maxConcurrent": 50 },
      { "processor": "rename", "mode": "parallel", "maxConcurrent": 50 }
    ]
  },

  "state": {
    "status": "in_progress",
    "currentPass": 2,
    "completedPasses": 1,
    "totalPasses": 2
  },

  "stats": {
    "totalDuration": 82100,
    "totalTokens": 48000,
    "totalApiCalls": 5002
  }
}
```

### Completed Pass (pass-NNN-complete.json)

```json
{
  "pass": 1,
  "processor": "rename",
  "mode": "parallel",
  "status": "complete",
  "startedAt": "2024-12-29T10:30:00Z",
  "completedAt": "2024-12-29T10:45:00Z",

  "results": {
    "renames": {
      "a": { "newName": "config", "confidence": 0.85 },
      "b": { "newName": "options", "confidence": 0.92 }
    },
    "metadata": {
      "a": { "isAnchor": true }
    }
  },

  "stats": {
    "identifiers": 5002,
    "renamed": 4251,
    "unchanged": 751,
    "duration": 82100,
    "tokens": 48000
  }
}
```

### In-Progress Pass (pass-NNN-progress.json)

```json
{
  "pass": 2,
  "processor": "rename",
  "status": "in_progress",
  "startedAt": "2024-12-29T10:45:00Z",
  "lastCheckpoint": "2024-12-29T11:00:00Z",

  "progress": {
    "total": 5002,
    "completed": 3421,
    "pending": 1581
  },

  "partialResults": {
    "renames": {
      "a": { "newName": "configManager", "confidence": 0.9 }
    }
  },

  "stats": {
    "duration": 54000,
    "tokens": 35000
  }
}
```

### Identifier History (identifiers.jsonl)

Append-only log for debugging and analysis:

```jsonl
{"id":"a","pass":1,"name":"config","confidence":0.85,"ts":"2024-12-29T10:35:00Z"}
{"id":"a","pass":2,"name":"configManager","confidence":0.9,"ts":"2024-12-29T10:50:00Z"}
```

### Resume Behavior

| Scenario | Behavior |
|----------|----------|
| Clean pass completion | Resume from next pass |
| Mid-pass interrupt | Resume from last checkpoint |
| Passes added to config | Continue with new passes |
| Pass config changed | Prompt user: restart or re-run from changed pass |
| Input file changed | Invalidate checkpoint, restart |

### Checkpoint Frequency

- Every 100 identifiers (configurable)
- Every 60 seconds (configurable)
- On SIGINT/SIGTERM

---

## Internal API

### Core Types

```typescript
// Identifier information
interface IdentifierInfo {
  id: string;                     // Unique ID (location-based)
  name: string;                   // Current name
  originalName: string;           // Original obfuscated name
  location: { start: number; end: number; line: number; column: number };
  scope: { type: string; depth: number; size: number };
  references: number;
  referencedBy: string[];
}

// Context provided to processors
interface ProcessorContext {
  passNumber: number;
  totalPasses: number;
  code: string;
  allIdentifiers: IdentifierInfo[];
  previousResults: PassResult[];

  // Helpers
  getRenameHistory(id: string): string[];
  getContext(id: IdentifierInfo, windowSize: number): string;
  getMetadata(id: string, key: string): any;
}

// Result from processing one identifier
interface ProcessorResult {
  identifier: IdentifierInfo;
  newName: string;
  confidence: number;
  metadata?: Record<string, any>;
}

// Result from one pass
interface PassResult {
  pass: number;
  processor: string;
  renames: Map<string, RenameResult>;
  code: string;
  stats: PassStats;
  metadata: Map<string, any>;
}

// Statistics for one pass
interface PassStats {
  identifiers: number;
  renamed: number;
  unchanged: number;
  duration: number;
  tokens: number;
  apiCalls: number;
  avgLatency: number;
}
```

### Processor Interface

```typescript
interface PassProcessor {
  name: string;

  // Process a single identifier
  process(
    identifier: IdentifierInfo,
    context: ProcessorContext
  ): Promise<ProcessorResult>;

  // Optional: pre-processing (e.g., build reference graph)
  preProcess?(
    identifiers: IdentifierInfo[],
    context: ProcessorContext
  ): Promise<void>;

  // Optional: post-processing (e.g., detect conflicts)
  postProcess?(
    results: ProcessorResult[],
    context: ProcessorContext
  ): Promise<PostProcessResult>;
}

interface PostProcessResult {
  modifications: Array<{
    identifier: IdentifierInfo;
    action: 'rename' | 'flag' | 'skip';
    newName?: string;
    reason?: string;
  }>;
}
```

### Built-in Processors

| Processor | Description | Uses LLM |
|-----------|-------------|----------|
| `LLMRenameProcessor` | Core rename with LLM | Yes |
| `RefinementProcessor` | Confirm or improve existing names | Yes |
| `AnchorDetectionProcessor` | Flag high-value identifiers | No |
| `ConflictDetectionProcessor` | Find inconsistent names | No |
| `ConsistencyProcessor` | Enforce naming patterns | No |

### Pass Configuration

```typescript
interface PassConfig {
  processor: PassProcessor | string;
  mode: 'parallel' | 'streaming' | 'sequential';
  maxConcurrent?: number;
  windowSize?: number;

  filter?: {
    onlyAnchors?: boolean;
    onlyFlagged?: boolean;
    skipHighConfidence?: boolean;
    minReferences?: number;
    custom?: (id: IdentifierInfo, ctx: ProcessorContext) => boolean;
  };

  model?: string;
  contextSize?: number;
}

interface TurboV2Config {
  provider: 'openai';
  model?: string;
  contextSize?: number;
  passes: PassConfig[];
}
```

### Orchestrator

```typescript
async function runTurboV2(
  inputCode: string,
  config: TurboV2Config,
  options: {
    onPassStart?: (pass: number, processor: string) => void;
    onPassComplete?: (result: PassResult) => void;
    onProgress?: (pass: number, done: number, total: number) => void;
    checkpoint?: CheckpointManager;
  }
): Promise<TurboV2Result>;

interface TurboV2Result {
  code: string;
  passes: PassResult[];
  stats: {
    totalDuration: number;
    totalTokens: number;
    totalApiCalls: number;
  };
}
```

### Checkpoint Manager

```typescript
interface CheckpointManager {
  // Lifecycle
  initialize(inputFile: string, config: TurboV2Config): Promise<void>;
  hasCheckpoint(): boolean;
  loadCheckpoint(): Promise<CheckpointState | null>;

  // Pass management
  startPass(pass: number, config: PassConfig): Promise<void>;
  saveProgress(pass: number, progress: PassProgress): Promise<void>;
  completePass(pass: number, result: PassResult): Promise<void>;

  // Code snapshots
  saveCodeSnapshot(pass: number, code: string): Promise<void>;
  loadCodeSnapshot(pass: number): Promise<string>;

  // History
  recordRename(pass: number, id: string, result: ProcessorResult): Promise<void>;
  getIdentifierHistory(id: string): Promise<RenameHistoryEntry[]>;

  // Cleanup
  clear(): Promise<void>;
}
```

---

## Execution Modes

### Parallel Mode

All identifiers processed concurrently with rate limiting.

```typescript
async function runParallel(
  identifiers: IdentifierInfo[],
  processor: PassProcessor,
  context: ProcessorContext,
  options: { maxConcurrent: number }
): Promise<ProcessorResult[]>;
```

- Best for: Maximum speed, independent identifiers
- Concurrency: Configurable (default: 50)
- Context: All identifiers see same code state (from previous pass)

### Streaming Mode (Sliding Window)

Process in source-order windows. Each window sees previous windows' renames.

```typescript
async function runStreaming(
  identifiers: IdentifierInfo[],
  processor: PassProcessor,
  context: ProcessorContext,
  options: { windowSize: number; maxConcurrent: number }
): Promise<ProcessorResult[]>;
```

- Best for: Balance of speed and local context
- Window size: Configurable (default: 50)
- Context: Identifiers see previous windows renamed

### Sequential Mode

One identifier at a time. Each sees all previous renames.

```typescript
async function runSequential(
  identifiers: IdentifierInfo[],
  processor: PassProcessor,
  context: ProcessorContext
): Promise<ProcessorResult[]>;
```

- Best for: Maximum quality, small identifier sets
- Context: Each identifier sees all previous renames

---

## Validation & Testing

### Test Samples

| Sample | Identifiers | Size | Use Case |
|--------|-------------|------|----------|
| tiny-qs | ~150 | 356 lines | Fast iteration |
| small-axios | ~800 | 3K lines | Medium tests |
| medium-chart | ~5000 | 11K lines | Stress tests |

### Quality Metrics

1. **Semantic Score**: LLM-as-judge comparison vs original (0-100)
2. **Stability Rate**: % of names unchanged between passes
3. **Confidence Distribution**: Histogram of confidence scores

### Validation Protocol

1. Run single-pass parallel → measure quality
2. Run two-pass parallel → measure improvement
3. Run three-pass parallel → measure diminishing returns
4. Compare to sequential baseline

### Key Hypotheses to Validate

| Hypothesis | Validation |
|------------|------------|
| 2-pass ≥ sequential quality | Quality score comparison |
| Pass 1 alone ~70% quality | Quality score of 1-pass |
| Pass 3 has diminishing returns | Quality delta pass 2→3 vs 1→2 |
| Streaming mode helps within pass | Quality score streaming vs parallel |

---

## Implementation Phases

### Phase 1: Foundation

- [ ] Create `src/turbo-v2/` directory structure
- [ ] Implement core types (`types.ts`)
- [ ] Implement identifier discovery (`identifiers.ts`)
- [ ] Implement context extraction (`context.ts`)
- [ ] Implement basic `LLMRenameProcessor`
- [ ] Implement parallel execution mode
- [ ] Implement basic orchestrator (single pass)

### Phase 2: Multi-Pass

- [ ] Extend orchestrator for multi-pass
- [ ] Implement pass context (previous renames visible)
- [ ] Implement code transformation between passes
- [ ] Add pass-level statistics

### Phase 3: Checkpointing

- [ ] Implement `CheckpointManager`
- [ ] Implement job metadata persistence
- [ ] Implement pass completion checkpoints
- [ ] Implement mid-pass progress checkpoints
- [ ] Implement resume logic
- [ ] Implement graceful shutdown (SIGINT)

### Phase 4: CLI Integration

- [ ] Add `--turbo-v2` flag to unminify command
- [ ] Implement `--pass` argument parsing
- [ ] Implement `--preset` shortcuts
- [ ] Implement checkpoint CLI commands
- [ ] Implement progress bar and logging

### Phase 5: Additional Processors

- [ ] Implement `RefinementProcessor`
- [ ] Implement `AnchorDetectionProcessor`
- [ ] Implement `ConflictDetectionProcessor`
- [ ] Implement streaming execution mode
- [ ] Implement sequential execution mode

### Phase 6: Validation

- [ ] Run baseline comparisons
- [ ] Validate multi-pass hypothesis
- [ ] Tune default configurations
- [ ] Document recommended presets

---

## Open Questions

1. **Optimal pass count**: Is 2 passes always enough? When is 3 better?
2. **Context size**: What's the optimal context window per pass?
3. **Confidence threshold**: When should we skip re-processing?
4. **Model selection**: Is gpt-4o-mini sufficient for pass 1?
5. **Anchor threshold**: What reference count defines an "anchor"?

---

## Success Criteria

1. **Speed**: 100K identifiers in < 4 hours (2-pass, 50 concurrent)
2. **Quality**: Semantic score ≥ 95% of sequential baseline
3. **Reliability**: Resume from any interruption point
4. **Usability**: Single command for common cases, flexible for advanced

---

## Appendix: Example Pipelines

### Fast (Default)

```json
{
  "passes": [
    { "processor": "rename", "mode": "parallel", "maxConcurrent": 50 },
    { "processor": "rename", "mode": "parallel", "maxConcurrent": 50 }
  ]
}
```

### Quality

```json
{
  "passes": [
    { "processor": "rename", "mode": "parallel", "maxConcurrent": 50 },
    { "processor": "refine", "mode": "parallel", "maxConcurrent": 50 },
    { "processor": "conflict-detect", "mode": "parallel", "maxConcurrent": 100 },
    { "processor": "rename", "mode": "sequential", "filter": { "onlyFlagged": true } },
    { "processor": "consistency", "mode": "parallel", "maxConcurrent": 100 }
  ]
}
```

### Anchor-First

```json
{
  "passes": [
    { "processor": "anchor-detect", "mode": "parallel", "maxConcurrent": 100 },
    { "processor": "rename", "mode": "sequential", "filter": { "onlyAnchors": true } },
    { "processor": "rename", "mode": "parallel", "maxConcurrent": 50, "filter": { "onlyAnchors": false } },
    { "processor": "refine", "mode": "parallel", "maxConcurrent": 50 }
  ]
}
```

### Mixed Models

```json
{
  "passes": [
    { "processor": "rename", "mode": "parallel", "maxConcurrent": 100, "model": "gpt-4o-mini" },
    { "processor": "refine", "mode": "parallel", "maxConcurrent": 20, "model": "gpt-4o" }
  ]
}
```
