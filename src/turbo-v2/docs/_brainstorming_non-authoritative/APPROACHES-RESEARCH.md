# Turbo V2: Parallelization Approaches Research

## The Core Problem

**Goal**: Maximize parallelism (speed) while maximizing renamed-context visibility (quality)

**Constraints**:
1. JavaScript often has one massive program scope with thousands of identifiers
2. O(n²) dependency detection is prohibitively expensive at scale (100K+ identifiers)
3. Sequential processing gives best quality but is too slow for large files
4. Naive parallel processing sacrifices quality (identifiers don't see each other's renames)

**The Trade-off Spectrum**:
```
Full Sequential ←————————————————————→ Full Parallel
   Best Quality                           Best Speed
   Worst Speed                            Worst Quality
```

**V1 Turbo Approach**: Dependency graph + topological batching
- Works well for code with many small scopes
- Falls apart for JS with one large scope (batch becomes the whole file)
- O(n²) dependency detection is slow

---

## Core Architectural Principle: Multi-Pass Processing

**Key Insight**: Two passes may capture most of sequential's value while enabling full parallelism.

### Why Multi-Pass Works

**Sequential (n identifiers) - Context Analysis:**
```
ID #1:    sees 0 renamed      (0% context)
ID #500:  sees 499 renamed    (50% context)
ID #1000: sees 999 renamed    (100% context)
Average:  sees ~n/2 renamed   (50% context)
```

**Two-Pass (both parallel) - Context Analysis:**
```
Pass 1: ALL identifiers see 0 renamed     (0% context)
Pass 2: ALL identifiers see n renamed     (100% context from Pass 1)
```

**The Math:**
- Sequential average: 50% of identifiers visible as renamed
- Two-pass in pass 2: 100% of identifiers visible as renamed (from pass 1)

**The Trade-off:**
- Sequential: Later IDs see *refined* names (cumulative improvement)
- Two-pass: Pass 2 sees *all* names, but they're "rough" from pass 1

**If pass 1 achieves 70% accuracy:**
- Pass 2 sees 70% good names for ALL identifiers
- Early sequential identifiers see 0% context (disadvantaged)
- Two-pass may actually be BETTER for early identifiers

### Multi-Pass as Foundation

All approaches below should be evaluated in multi-pass configuration:

| Configuration | Pass 1 | Pass 2 | Expected Quality | Speed |
|---------------|--------|--------|------------------|-------|
| Baseline | Parallel | None | ~60-70% | Fastest |
| Two-Pass Parallel | Parallel | Parallel | ~85-90% | Fast |
| Two-Pass Hybrid | Parallel | Streaming | ~90-95% | Medium |
| Two-Pass Sequential | Parallel | Sequential | ~95-98% | Slower |
| Three-Pass | Parallel | Parallel | Parallel | ~92-95% | Fast |

### Multi-Pass Architecture

Multi-pass is a **first-class architectural concept**. Every layer of the application is designed around running N passes.

#### CLI Design

```bash
# Basic usage - defaults to 2-pass parallel rename
humanify unminify input.js --turbo-v2

# Explicit pass count (all same processor)
humanify unminify input.js --turbo-v2 --passes 3

# Per-pass configuration with processors
humanify unminify input.js --turbo-v2 \
  --pass "rename:parallel:50" \
  --pass "rename:parallel:50"

# Full syntax: processor:mode:concurrency[:filter]
humanify unminify input.js --turbo-v2 \
  --pass "anchor-detect:parallel:100" \
  --pass "rename:sequential:1:anchors" \
  --pass "rename:parallel:50:non-anchors"

# Complex pipeline with refinement
humanify unminify input.js --turbo-v2 \
  --pass "rename:parallel:50" \
  --pass "refine:parallel:50" \
  --pass "conflict-detect:parallel:100" \
  --pass "rename:sequential:1:flagged"

# Mixed models
humanify unminify input.js --turbo-v2 \
  --pass "rename:parallel:100:model=gpt-4o-mini" \
  --pass "refine:parallel:20:model=gpt-4o"

# Shorthand presets
humanify unminify input.js --turbo-v2 --preset fast        # 2-pass parallel
humanify unminify input.js --turbo-v2 --preset balanced    # 2-pass with refinement
humanify unminify input.js --turbo-v2 --preset quality     # 5-pass with conflict detection
humanify unminify input.js --turbo-v2 --preset anchor      # Anchor-first pipeline

# Load pipeline from config file
humanify unminify input.js --turbo-v2 --pipeline ./my-pipeline.json

# Dry run - show what passes would run without executing
humanify unminify input.js --turbo-v2 --preset quality --dry-run
```

**Available Processors:**
| Name | Description | Uses LLM | Output |
|------|-------------|----------|--------|
| `rename` | Core LLM rename | Yes | New names |
| `refine` | Confirm or improve existing names | Yes | Refined names |
| `anchor-detect` | Identify high-value identifiers | No | Anchor flags |
| `conflict-detect` | Find inconsistent names | No | Conflict flags |
| `consistency` | Enforce naming patterns | No | Fixes |
| `classify` | Categorize identifiers (var/func/class) | Maybe | Type flags |

**Available Filters:**
| Filter | Description |
|--------|-------------|
| `anchors` | Only process anchor-flagged identifiers |
| `non-anchors` | Only process non-anchor identifiers |
| `flagged` | Only process flagged identifiers (e.g., conflicts) |
| `low-confidence` | Only process confidence < 0.7 |
| `changed` | Only process names that changed in previous pass |
| `refs>N` | Only process identifiers with > N references |

#### Logging Design

```
[turbo-v2] Starting 2-pass processing for input.js (1000 identifiers)

[pass 1/2] Mode: parallel (50 concurrent)
[pass 1/2] Progress: 100/1000 (10%) - 12.3s elapsed
[pass 1/2] Progress: 500/1000 (50%) - 45.2s elapsed
[pass 1/2] Complete: 1000/1000 - 82.1s total, 48K tokens
[pass 1/2] Checkpoint saved: .humanify-checkpoints/abc123-pass1.json

[pass 2/2] Mode: parallel (50 concurrent)
[pass 2/2] Context: using 1000 renames from pass 1
[pass 2/2] Progress: 100/1000 (10%) - 11.8s elapsed
[pass 2/2] Progress: 500/1000 (50%) - 44.9s elapsed
[pass 2/2] Complete: 1000/1000 - 81.3s total, 52K tokens
[pass 2/2] Checkpoint saved: .humanify-checkpoints/abc123-pass2.json

[turbo-v2] All passes complete: 163.4s total, 100K tokens
[turbo-v2] Output written: output/deobfuscated.js
```

#### Checkpoint Design

Checkpointing is critical for long-running jobs. Design must handle:
1. Pass completion checkpoints
2. Mid-pass progress checkpoints
3. Resume from any point
4. Configuration changes on resume
5. Input file changes (invalidation)

##### Directory Structure

```
.humanify-checkpoints/
  {input-hash}/                    # One directory per unique input file
    job.json                       # Job metadata and current state
    passes/
      pass-001-complete.json       # Completed pass results
      pass-002-complete.json
      pass-003-progress.json       # In-progress pass state
    snapshots/
      after-pass-001.js            # Code snapshot after each pass
      after-pass-002.js
    history/
      identifiers.jsonl            # Per-identifier history (append-only)
```

##### Job Metadata (job.json)

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
    "passes": [
      { "processor": "rename", "mode": "parallel", "maxConcurrent": 50 },
      { "processor": "rename", "mode": "parallel", "maxConcurrent": 50 }
    ]
  },

  "state": {
    "status": "in_progress",        // "pending" | "in_progress" | "complete" | "failed"
    "currentPass": 2,
    "completedPasses": 1,
    "totalPasses": 2
  },

  "stats": {
    "totalDuration": 82100,
    "totalTokens": 48000,
    "totalApiCalls": 1000
  }
}
```

##### Completed Pass (pass-NNN-complete.json)

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
      "b": { "newName": "options", "confidence": 0.92 },
      "c": { "newName": "c", "confidence": 0.3, "unchanged": true }
    },
    "metadata": {
      "a": { "isAnchor": true },
      "b": { "isAnchor": false }
    }
  },

  "stats": {
    "identifiers": 1000,
    "processed": 1000,
    "renamed": 847,
    "unchanged": 153,
    "duration": 82100,
    "tokens": 48000,
    "apiCalls": 1000,
    "avgLatency": 82
  }
}
```

##### In-Progress Pass (pass-NNN-progress.json)

```json
{
  "pass": 2,
  "processor": "rename",
  "mode": "parallel",
  "status": "in_progress",
  "startedAt": "2024-12-29T10:45:00Z",
  "lastCheckpoint": "2024-12-29T11:00:00Z",

  "progress": {
    "total": 1000,
    "completed": 450,
    "pending": 550,
    "failed": 0
  },

  "partialResults": {
    "renames": {
      "a": { "newName": "configManager", "confidence": 0.9 },
      "b": { "newName": "optionsParser", "confidence": 0.88 }
      // ... only completed identifiers
    }
  },

  "pendingIdentifiers": ["c", "d", "e", ...],  // Or store by index/location

  "stats": {
    "duration": 900000,  // So far
    "tokens": 22000,
    "apiCalls": 450
  }
}
```

##### Identifier History (identifiers.jsonl)

Append-only log tracking each identifier across passes:

```jsonl
{"id":"a","original":"a","pass":1,"name":"config","confidence":0.85,"ts":"2024-12-29T10:35:00Z"}
{"id":"b","original":"b","pass":1,"name":"options","confidence":0.92,"ts":"2024-12-29T10:35:01Z"}
{"id":"a","original":"a","pass":2,"name":"configManager","confidence":0.9,"ts":"2024-12-29T10:50:00Z"}
{"id":"b","original":"b","pass":2,"name":"optionsParser","confidence":0.88,"ts":"2024-12-29T10:50:01Z"}
```

This enables:
- Tracking name evolution across passes
- Analyzing which identifiers benefit from more passes
- Debugging naming decisions

##### Resume Scenarios

**Scenario 1: Resume after clean pass completion**
```bash
$ humanify unminify input.js --turbo-v2
[checkpoint] Found checkpoint for input.js
  • Completed: pass 1/2 (rename:parallel)
  • Status: pass 2 not started
  Resume from pass 2? [Y/n] y
[pass 2/2] Resuming...
```

**Scenario 2: Resume mid-pass**
```bash
$ humanify unminify input.js --turbo-v2
[checkpoint] Found checkpoint for input.js
  • Completed: pass 1/2
  • In progress: pass 2/2 (450/1000 identifiers, 45%)
  Resume pass 2 from checkpoint? [Y/n] y
[pass 2/2] Resuming from identifier 451/1000...
```

**Scenario 3: Config changed - passes added**
```bash
$ humanify unminify input.js --turbo-v2 --passes 3  # Was 2
[checkpoint] Found checkpoint for input.js
  • Completed: pass 1/2, pass 2/2
  • New config adds pass 3
  Continue with pass 3? [Y/n] y
[pass 3/3] Starting new pass...
```

**Scenario 4: Config changed - passes modified**
```bash
$ humanify unminify input.js --turbo-v2 --pass "rename:streaming:25"  # Was parallel
[checkpoint] Found checkpoint for input.js
  ⚠ Config mismatch:
    Pass 2 was: rename:parallel:50
    Pass 2 now: rename:streaming:25
  Options:
    [1] Discard checkpoint, start fresh
    [2] Keep pass 1 results, re-run pass 2 with new config
    [3] Cancel
  Choice: 2
[pass 2/2] Re-running with new config...
```

**Scenario 5: Input file changed**
```bash
$ humanify unminify input.js --turbo-v2
[checkpoint] Found checkpoint for input.js
  ⚠ Input file has changed (hash mismatch)
  Checkpoint is invalid. Starting fresh.
[pass 1/2] Starting...
```

**Scenario 6: Replay from specific pass**
```bash
$ humanify unminify input.js --turbo-v2 --replay-from 1
[checkpoint] Replaying from after pass 1
  • Loading code snapshot from after-pass-001.js
  • Discarding pass 2+ results
[pass 2/2] Starting fresh from pass 1 snapshot...
```

##### CLI Options for Checkpointing

```bash
# Automatic resume (default)
humanify unminify input.js --turbo-v2

# Force fresh start (ignore checkpoint)
humanify unminify input.js --turbo-v2 --no-resume
humanify unminify input.js --turbo-v2 --fresh

# Resume from specific pass (discard later passes)
humanify unminify input.js --turbo-v2 --replay-from 2

# List checkpoints
humanify checkpoints list
humanify checkpoints list --verbose

# Show checkpoint details
humanify checkpoints show input.js
humanify checkpoints show abc123  # By hash

# Clean up checkpoints
humanify checkpoints clear                    # All
humanify checkpoints clear input.js           # Specific file
humanify checkpoints clear --older-than 7d    # Old ones
humanify checkpoints clear --completed        # Only completed jobs

# Export checkpoint for debugging
humanify checkpoints export input.js -o checkpoint-debug/
```

##### Checkpoint Manager API

```typescript
interface CheckpointManager {
  // Initialization
  initialize(inputFile: string, inputHash: string, config: TurboV2Config): Promise<void>;

  // Check for existing checkpoint
  hasCheckpoint(inputHash: string): boolean;
  loadCheckpoint(inputHash: string): Promise<CheckpointState | null>;

  // Detect changes
  detectConfigChanges(saved: TurboV2Config, current: TurboV2Config): ConfigDiff;

  // Pass lifecycle
  startPass(passNumber: number, config: PassConfig): Promise<void>;
  completePass(passNumber: number, result: PassResult): Promise<void>;

  // Mid-pass checkpointing
  saveProgress(passNumber: number, progress: PassProgress): Promise<void>;

  // Identifier-level tracking (for history)
  recordRename(passNumber: number, identifier: string, result: ProcessorResult): Promise<void>;

  // Code snapshots
  saveCodeSnapshot(passNumber: number, code: string): Promise<void>;
  loadCodeSnapshot(passNumber: number): Promise<string>;

  // Cleanup
  clear(inputHash: string): Promise<void>;
  clearAll(): Promise<void>;

  // Queries
  getPassResults(passNumber: number): Promise<PassResult | null>;
  getIdentifierHistory(identifier: string): Promise<IdentifierHistory>;
  getStats(): Promise<JobStats>;
}

interface CheckpointState {
  job: JobMetadata;
  completedPasses: PassResult[];
  currentPassProgress: PassProgress | null;
  codeSnapshots: Map<number, string>;  // passNumber -> code
}

interface ConfigDiff {
  passesAdded: number[];
  passesRemoved: number[];
  passesModified: Array<{ pass: number; changes: string[] }>;
  isCompatible: boolean;  // Can we continue, or must restart?
}
```

##### Checkpoint Frequency

For mid-pass checkpointing, save progress:
- Every N identifiers (configurable, default: 100)
- Every M seconds (configurable, default: 60)
- On interrupt signal (SIGINT/SIGTERM)

```typescript
interface CheckpointConfig {
  // When to save mid-pass progress
  saveEveryIdentifiers: number;   // Default: 100
  saveEverySeconds: number;       // Default: 60
  saveOnInterrupt: boolean;       // Default: true

  // What to save
  saveCodeSnapshots: boolean;     // Default: true
  saveIdentifierHistory: boolean; // Default: true

  // Storage
  checkpointDir: string;          // Default: .humanify-checkpoints
  compressSnapshots: boolean;     // Default: true (gzip)
}
```

##### Graceful Shutdown

Handle interrupts gracefully:

```typescript
process.on('SIGINT', async () => {
  console.log('\n[checkpoint] Interrupt received, saving progress...');
  await checkpointManager.saveProgress(currentPass, currentProgress);
  console.log('[checkpoint] Progress saved. Safe to exit.');
  console.log('[checkpoint] Resume with: humanify unminify input.js --turbo-v2');
  process.exit(0);
});
```

##### Storage Considerations

For large files (100K+ identifiers):
- `renames` object could be huge - consider streaming JSON or separate files
- Code snapshots are full file copies - compress with gzip
- Identifier history grows linearly - rotate/compact old entries

```typescript
// For very large files, split renames across multiple files
.humanify-checkpoints/
  {hash}/
    passes/
      pass-001-complete.json      # Metadata only
      pass-001-renames/
        chunk-0000.json           # Identifiers 0-999
        chunk-0001.json           # Identifiers 1000-1999
        ...
```

#### Internal API Design

Each pass can run a **different processor** - not just "rename" but any analysis or transformation.

```typescript
// =============================================================================
// PASS PROCESSORS - Pluggable operations that can run in any pass
// =============================================================================

/**
 * A PassProcessor performs a specific operation on identifiers.
 * Different processors can be composed into a multi-pass pipeline.
 */
interface PassProcessor {
  name: string;

  /**
   * Process a single identifier, given context from previous passes.
   * Returns the new name (or same name if unchanged).
   */
  process(
    identifier: IdentifierInfo,
    context: ProcessorContext
  ): Promise<ProcessorResult>;

  /**
   * Optional: Run analysis before processing (e.g., build reference graph)
   */
  preProcess?(identifiers: IdentifierInfo[], context: ProcessorContext): Promise<void>;

  /**
   * Optional: Run analysis after processing (e.g., detect conflicts)
   */
  postProcess?(results: ProcessorResult[], context: ProcessorContext): Promise<PostProcessResult>;
}

interface IdentifierInfo {
  name: string;                    // Current name (may be from previous pass)
  originalName: string;            // Original obfuscated name
  location: SourceLocation;
  scope: ScopeInfo;
  references: number;              // How many times referenced
  referencedBy: string[];          // Which other identifiers reference this
}

interface ProcessorContext {
  passNumber: number;
  totalPasses: number;
  code: string;                    // Current code state
  allIdentifiers: IdentifierInfo[];
  previousResults: PassResult[];   // Results from all previous passes

  // Computed helpers
  getRenameHistory(identifier: string): string[];  // All names this ID has had
  getContext(identifier: IdentifierInfo, windowSize: number): string;  // Surrounding code
}

interface ProcessorResult {
  identifier: IdentifierInfo;
  newName: string;
  confidence: number;              // 0-1, how confident in this name
  metadata?: Record<string, any>;  // Processor-specific data
}

interface PostProcessResult {
  modifications: Array<{
    identifier: IdentifierInfo;
    action: 'rename' | 'flag' | 'skip';
    newName?: string;
    reason?: string;
  }>;
}

// =============================================================================
// BUILT-IN PROCESSORS
// =============================================================================

/**
 * Core rename processor - calls LLM to suggest names
 */
class LLMRenameProcessor implements PassProcessor {
  name = 'llm-rename';
  constructor(private config: { model: string; contextSize: number }) {}

  async process(id: IdentifierInfo, ctx: ProcessorContext): Promise<ProcessorResult> {
    const context = ctx.getContext(id, this.config.contextSize);
    const newName = await this.callLLM(id.name, context);
    return { identifier: id, newName, confidence: 0.8 };
  }
}

/**
 * Anchor detection - identifies high-value identifiers
 * Doesn't rename, just flags identifiers as anchors
 */
class AnchorDetectionProcessor implements PassProcessor {
  name = 'anchor-detection';

  async process(id: IdentifierInfo, ctx: ProcessorContext): Promise<ProcessorResult> {
    const isAnchor = id.references > 5 || id.scope.isTopLevel;
    return {
      identifier: id,
      newName: id.name,  // Don't rename
      confidence: 1,
      metadata: { isAnchor }
    };
  }
}

/**
 * Conflict detection - finds inconsistent names
 */
class ConflictDetectionProcessor implements PassProcessor {
  name = 'conflict-detection';

  async postProcess(results: ProcessorResult[], ctx: ProcessorContext): Promise<PostProcessResult> {
    const conflicts = this.detectConflicts(results);
    return {
      modifications: conflicts.map(c => ({
        identifier: c.identifier,
        action: 'flag',
        reason: `Conflicts with ${c.conflictsWith}`
      }))
    };
  }
}

/**
 * Refinement processor - improves names from previous pass
 * Uses "confirm or improve" prompt instead of fresh naming
 */
class RefinementProcessor implements PassProcessor {
  name = 'refinement';

  async process(id: IdentifierInfo, ctx: ProcessorContext): Promise<ProcessorResult> {
    const history = ctx.getRenameHistory(id.originalName);
    const currentName = history[history.length - 1];

    // Ask LLM to confirm or improve, given full context
    const context = ctx.getContext(id, 10000);
    const result = await this.callLLM(currentName, context, 'confirm-or-improve');

    return { identifier: id, newName: result.name, confidence: result.confidence };
  }
}

/**
 * Consistency enforcer - ensures related identifiers have consistent naming
 */
class ConsistencyProcessor implements PassProcessor {
  name = 'consistency';

  async postProcess(results: ProcessorResult[], ctx: ProcessorContext): Promise<PostProcessResult> {
    // Find groups of related identifiers (same prefix, related scopes, etc.)
    // Ensure consistent naming patterns within groups
    const modifications = [];

    // Example: if we have "getUserName" and "get_user_email", suggest "getUserEmail"
    // ...

    return { modifications };
  }
}

// =============================================================================
// PASS CONFIGURATION
// =============================================================================

interface PassConfig {
  processor: PassProcessor | string;  // Processor instance or name of built-in

  // Execution mode
  mode: 'parallel' | 'streaming' | 'sequential';
  maxConcurrent?: number;
  windowSize?: number;

  // Filtering - which identifiers to process
  filter?: {
    onlyAnchors?: boolean;
    onlyFlagged?: boolean;
    skipHighConfidence?: boolean;
    minReferences?: number;
    custom?: (id: IdentifierInfo, ctx: ProcessorContext) => boolean;
  };

  // Checkpointing
  checkpointEvery?: number;  // Save every N identifiers
}

interface TurboV2Config {
  passes: PassConfig[];

  // Global settings
  provider: 'openai' | 'gemini' | 'local';
  model?: string;
  contextSize?: number;
}

// =============================================================================
// EXAMPLE PIPELINES
// =============================================================================

// Simple 2-pass parallel
const simpleTwoPass: TurboV2Config = {
  provider: 'openai',
  passes: [
    { processor: 'llm-rename', mode: 'parallel', maxConcurrent: 50 },
    { processor: 'llm-rename', mode: 'parallel', maxConcurrent: 50 }
  ]
};

// Anchor-first pipeline
const anchorFirst: TurboV2Config = {
  provider: 'openai',
  passes: [
    // Pass 1: Detect anchors (fast, no LLM)
    { processor: 'anchor-detection', mode: 'parallel', maxConcurrent: 100 },
    // Pass 2: Rename anchors only (sequential for quality)
    { processor: 'llm-rename', mode: 'sequential', filter: { onlyAnchors: true } },
    // Pass 3: Rename rest (parallel, sees anchor names)
    { processor: 'llm-rename', mode: 'parallel', maxConcurrent: 50, filter: { onlyAnchors: false } }
  ]
};

// Quality-focused pipeline
const qualityPipeline: TurboV2Config = {
  provider: 'openai',
  passes: [
    // Pass 1: Fast parallel rough names
    { processor: 'llm-rename', mode: 'parallel', maxConcurrent: 50 },
    // Pass 2: Parallel refinement with context
    { processor: 'refinement', mode: 'parallel', maxConcurrent: 50 },
    // Pass 3: Conflict detection (no LLM)
    { processor: 'conflict-detection', mode: 'parallel', maxConcurrent: 100 },
    // Pass 4: Re-process flagged conflicts
    { processor: 'llm-rename', mode: 'sequential', filter: { onlyFlagged: true } },
    // Pass 5: Consistency pass
    { processor: 'consistency', mode: 'parallel', maxConcurrent: 100 }
  ]
};

// Experimental: different models per pass
const mixedModelPipeline: TurboV2Config = {
  provider: 'openai',
  passes: [
    // Pass 1: Cheap model for rough names
    { processor: new LLMRenameProcessor({ model: 'gpt-4o-mini', contextSize: 2000 }), mode: 'parallel', maxConcurrent: 100 },
    // Pass 2: Expensive model for refinement
    { processor: new LLMRenameProcessor({ model: 'gpt-4o', contextSize: 10000 }), mode: 'parallel', maxConcurrent: 20 }
  ]
};

// =============================================================================
// ORCHESTRATOR
// =============================================================================

interface PassResult {
  pass: number;
  processor: string;
  renames: Map<string, string>;
  code: string;
  stats: PassStats;
  metadata: Map<string, any>;  // Processor-specific metadata (e.g., anchor flags)
}

async function runTurboV2(
  inputCode: string,
  config: TurboV2Config,
  options: {
    onPassStart?: (pass: number, processor: string) => void;
    onPassComplete?: (result: PassResult) => void;
    onProgress?: (pass: number, done: number, total: number) => void;
    checkpoint?: CheckpointManager;
  }
): Promise<FinalResult>;
```

#### Stats & Telemetry

Track per-pass metrics for analysis:

```typescript
interface PassStats {
  pass: number;
  mode: string;
  identifiers: number;
  renamed: number;          // Names that changed
  unchanged: number;        // Names kept from previous pass
  improved: number;         // Names that got "better" (longer, more semantic)
  duration: number;         // Wall clock ms
  tokens: number;           // API tokens consumed
  apiCalls: number;         // Number of API requests
  avgLatency: number;       // Average API latency
}

interface JobStats {
  passes: PassStats[];
  totalDuration: number;
  totalTokens: number;
  qualityScore?: number;    // If scoring enabled
}
```

#### Quality Tracking Across Passes

Optional: track how names evolve across passes for debugging/analysis:

```typescript
interface IdentifierHistory {
  original: string;         // "a"
  passes: string[];         // ["config", "configOptions", "configOptions"]
  final: string;            // "configOptions"
  stabilizedAt: number;     // Pass 2 (name stopped changing)
}
```

This helps answer:
- How many passes until names stabilize?
- Which identifiers benefit most from additional passes?
- Is pass 3 worth it?

### Key Questions to Validate

1. **What's pass 1 standalone quality?** (Parallel, no context)
2. **How much does pass 2 improve over pass 1?** (With pass 1 context)
3. **Is there value in pass 3?** (Diminishing returns?)
4. **Does pass 2 mode matter?** (Parallel vs streaming vs sequential)
5. **Can we skip pass 2 for "confident" names?** (Optimization)

### Theoretical Analysis: Multi-Pass vs Sequential

**Context Quality Per Identifier:**

| Method | ID #1 | ID #250 | ID #500 | ID #750 | ID #1000 | Average |
|--------|-------|---------|---------|---------|----------|---------|
| Sequential | 0% | 25% | 50% | 75% | 100% | 50% |
| 1-Pass Parallel | 0% | 0% | 0% | 0% | 0% | 0% |
| 2-Pass Parallel | 100%* | 100%* | 100%* | 100%* | 100%* | 100%* |
| 3-Pass Parallel | 100%** | 100%** | 100%** | 100%** | 100%** | 100%** |

\* Pass 1 quality (~70% accurate)
\** Pass 2 quality (~85% accurate)

**The Key Insight:**
- Sequential gives BEST context to LAST identifiers (who need it least - they're often simple)
- Sequential gives WORST context to FIRST identifiers (who might need it most)
- Multi-pass gives EQUAL context to ALL identifiers

**Why Multi-Pass Might Actually Win:**
- First identifiers in sequential: 0 context → often poor names
- First identifiers in 2-pass: 100% context (rough) → better names
- The "rough" names from pass 1 are still MUCH better than obfuscated names

**Cost Analysis (n=1000 identifiers):**

| Method | API Calls | Context Quality | Time (30 concurrent) |
|--------|-----------|-----------------|----------------------|
| Sequential | 1000 | 50% avg | ~1000 × latency |
| 1-Pass Parallel | 1000 | 0% | ~33 × latency |
| 2-Pass Parallel | 2000 | 100%* | ~67 × latency |
| 3-Pass Parallel | 3000 | 100%** | ~100 × latency |

**Break-even Analysis:**
- 2-pass is 2x API cost but potentially BETTER quality than sequential
- 2-pass is ~15x faster than sequential (parallel vs serial)
- If 2-pass quality ≥ sequential quality, it's strictly better (faster + same/better quality)

---

## Approach Catalog

> **Note**: All approaches below can be used as pass configurations.
> The default evaluation should be: Approach as Pass 1, then measure with/without Pass 2.

### A. Anchor-First Strategy

**Concept**: Identify "anchor" identifiers that provide the most context value, process them first sequentially, then process the rest in parallel.

**Algorithm**:
1. Score each identifier by "influence" (reference count, scope size, centrality)
2. Select top N% as anchors (e.g., 10-20%)
3. Process anchors sequentially (they see each other)
4. Process remaining 80-90% in parallel (they all see anchors)

**Hypothesis**: 80% of context value comes from 20% of identifiers. Function names, class names, and heavily-used variables are more important than loop counters.

**Pros**:
- Simple to implement
- Predictable parallelism (80-90% parallel)
- Avoids O(n²) dependency analysis

**Cons**:
- Non-anchor identifiers don't benefit from each other
- Anchor selection heuristic may be wrong
- Still sequential bottleneck for anchors

**Validation Metrics**:
- Quality score vs sequential baseline
- Time vs v1 turbo
- Vary anchor percentage (5%, 10%, 20%, 50%) and measure impact

---

### B. Source-Order Streaming (Sliding Window)

**Concept**: Process identifiers in source order with overlapping windows. Parallelism within windows, sequential between windows.

**Algorithm**:
1. Sort identifiers by source position (start offset)
2. Process in windows of size W (e.g., 50)
3. Window 1: identifiers 1-50 in parallel
4. Window 2: identifiers 51-100 in parallel (see 1-50 renamed)
5. Continue until done

**Hypothesis**: Source locality is a good proxy for semantic relationship. Nearby code tends to reference each other.

**Pros**:
- O(n) complexity - no dependency graph needed
- Simple implementation
- Predictable memory usage

**Cons**:
- Source order may not match semantic relationships (hoisting, etc.)
- Window boundaries are arbitrary
- Bundled code may interleave unrelated code

**Variations**:
- **B1. Fixed window**: Window of exactly W identifiers
- **B2. Scope-aware window**: Window expands/contracts to respect scope boundaries
- **B3. Overlapping windows**: Identifiers at boundaries appear in multiple windows

**Validation Metrics**:
- Quality score vs sequential baseline
- Vary window size (10, 25, 50, 100) and measure impact
- Compare fixed vs scope-aware windows

---

### C. Two-Pass Refinement

**Concept**: First pass uses parallel processing for rough names, second pass refines with full context.

**Algorithm**:
1. **Pass 1 (Parallel)**: Process all identifiers in parallel with minimal context
   - Each sees only its immediate scope, no other renames
   - Use cheaper/faster model if available
2. **Pass 2 (Selective Sequential)**:
   - Identify "low confidence" names (short names, generic names, conflicts)
   - Re-process only those with full renamed context
   - Or: process ALL sequentially but with "confirm or improve" prompt

**Hypothesis**: Many identifiers have obvious names even without context (loop counters, common patterns). Only ambiguous cases need full context.

**Pros**:
- Best of both worlds potential
- Pass 2 can be optimized (skip confident names)
- Natural quality/speed dial (adjust pass 2 threshold)

**Cons**:
- 2x API calls in worst case (expensive)
- How to detect "low confidence"?
- Pass 1 names might mislead pass 2

**Variations**:
- **C1. Full two-pass**: Both passes process all identifiers
- **C2. Selective refinement**: Pass 2 only processes flagged identifiers
- **C3. Different models**: Pass 1 uses gpt-4o-mini, pass 2 uses gpt-4o
- **C4. Confidence scoring**: LLM returns confidence score, only refine low-confidence

**Validation Metrics**:
- Quality of pass 1 alone vs sequential
- Quality improvement from pass 2
- Token cost comparison
- Identify optimal confidence threshold

---

### D. Top-Level Unit Parallelism

**Concept**: Parse file into top-level units (functions, classes), process units in parallel, sequential within units.

**Algorithm**:
1. Parse AST, identify top-level declarations
2. Categorize identifiers:
   - **Loose**: Program-scope variables not inside any function/class
   - **Contained**: Variables inside a top-level function/class
3. Process loose variables sequentially first (they're the "shared context")
4. Process top-level units in parallel, sequential within each unit

**Hypothesis**: Top-level functions/classes are independent. Loose variables are the shared state that everything references.

**Pros**:
- Natural parallelism boundary (functions are independent)
- Loose variables get full context treatment
- Scales with code modularity

**Cons**:
- Bundled code may have few top-level units (one giant IIFE)
- Loose variables are sequential bottleneck
- Cross-unit references don't benefit from each other

**Variations**:
- **D1. Strict top-level**: Only actual top-level statements
- **D2. IIFE unwrapping**: Treat IIFE contents as top-level
- **D3. Nested parallelism**: Recursively apply within large units

**Validation Metrics**:
- Distribution of identifiers (loose vs contained) across samples
- Quality score vs sequential
- Speedup factor based on number of top-level units

---

### E. Speculative Execution with Conflict Detection

**Concept**: Process in parallel speculatively, then detect and fix conflicts/inconsistencies.

**Algorithm**:
1. Process all identifiers in parallel batches (like v1 turbo)
2. After each batch, run "conflict detection":
   - Find identifiers with similar names that might be inconsistent
   - Find identifiers that reference renamed identifiers but have mismatched semantics
3. Re-process conflicting identifiers with updated context
4. Repeat until no conflicts (or max iterations)

**Hypothesis**: Most parallel guesses are correct. Only a small percentage (10-20%) produce inconsistent names that need refinement.

**Pros**:
- Maintains v1 turbo speed for most identifiers
- Self-correcting
- Can use LLM for conflict detection (semantic comparison)

**Cons**:
- Conflict detection is another LLM call (cost)
- May not converge (oscillating renames)
- "Conflict" is hard to define precisely

**Variations**:
- **E1. Rule-based conflicts**: Simple string matching (similar names)
- **E2. LLM-based conflicts**: Ask LLM if names are semantically consistent
- **E3. Reference-based conflicts**: Only check identifiers that reference each other

**Validation Metrics**:
- Conflict rate per batch
- Iterations to convergence
- Quality vs v1 turbo vs sequential
- Cost of conflict detection

---

### F. Reference-Graph Clustering

**Concept**: Build a lightweight reference graph, cluster tightly-connected identifiers, process clusters with awareness of each other.

**Algorithm**:
1. Build reference graph in O(n) using Babel binding information:
   - For each identifier, record which other identifiers it references
   - No pairwise comparison needed - just traverse each binding once
2. Cluster identifiers using graph clustering (connected components, or k-means on graph)
3. Process clusters in dependency order (if cluster A refs cluster B, B first)
4. Within cluster: sequential or small batches

**Hypothesis**: Reference relationships are the true semantic dependencies. Clustering captures "semantic modules" even in flat scope.

**Pros**:
- O(n) graph construction (not O(n²))
- Respects actual code dependencies
- Natural parallelism between unconnected clusters

**Cons**:
- Large connected components become sequential bottlenecks
- Clustering algorithm choice matters
- May not parallelize well if code is tightly coupled

**Variations**:
- **F1. Connected components**: Disjoint clusters, no cross-cluster refs
- **F2. k-hop clustering**: Identifiers within k references of each other
- **F3. Minimum cut**: Find cuts that minimize cross-cluster refs

**Validation Metrics**:
- Cluster size distribution
- Cross-cluster reference count
- Quality score vs sequential
- Time to build graph and cluster

---

### G. Hierarchical Scope Processing

**Concept**: Process scope tree level-by-level. Each level sees all outer levels renamed.

**Algorithm**:
1. Build scope tree (Program → Functions → Nested Functions → ...)
2. Process level 0 (program scope) sequentially
3. Process level 1 (top-level functions) in parallel, sequential within each
4. Process level 2 (nested functions) in parallel, sequential within each
5. Continue for deeper levels

**Hypothesis**: Outer scopes provide context for inner scopes. Functions at the same depth are independent.

**Pros**:
- Natural scope-based ordering
- Inner functions see outer context
- Parallelism scales with code depth

**Cons**:
- Flat code (one scope) becomes fully sequential
- Level 0 (program scope) may be huge
- Doesn't help with sibling relationships within a scope

**Variations**:
- **G1. Strict levels**: Process all of level N before level N+1
- **G2. Wavefront**: Process as soon as parent scope is done
- **G3. Hybrid**: Combine with source-order within each scope

**Validation Metrics**:
- Scope depth distribution across samples
- Identifiers per level
- Quality score vs sequential
- Parallelism achieved per level

---

### H. Importance-Weighted Ordering

**Concept**: Score identifiers by "importance" and process in importance order with adaptive batching.

**Algorithm**:
1. Score each identifier:
   - Reference count (how often it's used)
   - Scope size (larger scope = more important)
   - Type (function/class names > variables > parameters)
   - Position (earlier declarations may be more foundational)
2. Sort by importance (descending)
3. Process in batches, batch size inversely proportional to importance:
   - Top 10%: batch size 1 (sequential)
   - Next 20%: batch size 5
   - Next 30%: batch size 20
   - Bottom 40%: batch size 100

**Hypothesis**: Important identifiers benefit most from context. Less important ones can tolerate less context.

**Pros**:
- Adaptive quality/speed trade-off
- Important names get best treatment
- Simple to tune (adjust batch sizes)

**Cons**:
- Importance heuristic may be wrong
- Still some sequential processing
- Less important identifiers may get poor names

**Validation Metrics**:
- Correlation between importance score and name quality
- Quality score across importance tiers
- Overall quality vs time trade-off

---

### I. Semantic Chunking

**Concept**: Use AST analysis to identify semantic "chunks" (related code), process chunks with awareness of each other.

**Algorithm**:
1. Identify semantic chunks:
   - Export groups
   - Related functions (call each other)
   - Data + accessor patterns
   - Event handler groups
2. Order chunks by dependency (if chunk A calls chunk B, process B first)
3. Process chunks in parallel where no dependencies
4. Within chunk: sequential or source-order

**Hypothesis**: Code has natural semantic groupings. These groupings are the right unit of parallelism.

**Pros**:
- Semantically meaningful boundaries
- Related code processed together
- May discover "modules" in flat code

**Cons**:
- Chunk detection is complex
- May not parallelize if chunks are interdependent
- Overhead of chunk analysis

**Validation Metrics**:
- Chunk size distribution
- Inter-chunk dependency density
- Quality improvement from chunk awareness

---

### J. Probabilistic Batching

**Concept**: Use statistical sampling to estimate optimal batch boundaries without full dependency analysis.

**Algorithm**:
1. Sample N identifier pairs randomly
2. For each pair, check if they reference each other
3. Estimate overall reference density
4. Set batch size based on expected cross-batch reference rate
5. Process with chosen batch size, accept some quality loss

**Hypothesis**: Statistical estimation is faster than full analysis. We can trade small quality loss for large speed gain.

**Pros**:
- O(sample_size) instead of O(n²)
- Adaptive to code characteristics
- Simple implementation

**Cons**:
- Probabilistic - may miss important dependencies
- Requires tuning sample size
- Quality variance between runs

**Validation Metrics**:
- Accuracy of density estimation
- Quality variance across runs
- Correlation between estimated and actual dependency count

---

### K. LLM-Guided Batching

**Concept**: Use LLM to analyze code structure and suggest optimal processing order.

**Algorithm**:
1. Send code overview to LLM (or compressed representation)
2. Ask LLM to identify:
   - Key identifiers to process first
   - Semantic groupings
   - Suggested processing order
3. Follow LLM's suggested order with parallelism within groups

**Hypothesis**: LLM understands code semantics better than heuristics. It can identify the "right" order.

**Pros**:
- Leverages LLM's code understanding
- May find patterns heuristics miss
- Adaptive to code style

**Cons**:
- Extra LLM call (cost)
- LLM may hallucinate structure
- Context limits for large files

**Validation Metrics**:
- Quality of LLM-suggested order vs heuristics
- Cost of pre-analysis call
- Correlation between LLM confidence and actual quality

---

### L. Hybrid: Anchor + Streaming

**Concept**: Combine anchor-first with source-order streaming for non-anchors.

**Algorithm**:
1. Identify anchor identifiers (top 10-20% by importance)
2. Process anchors sequentially
3. For remaining identifiers:
   - Sort by source order
   - Process in streaming windows
   - Each window sees anchors + previous windows

**Hypothesis**: Anchors provide global context. Source-order streaming provides local context. Combined gives good coverage.

**Pros**:
- Combines benefits of A and B
- Anchors ensure important names are good
- Streaming handles the bulk efficiently

**Cons**:
- More complex implementation
- Two different processing modes
- Parameter tuning (anchor %, window size)

**Validation Metrics**:
- Quality vs A alone, B alone, sequential
- Optimal anchor % and window size combination

---

### M. Dependency-Lite: Reference Count Only

**Concept**: Instead of full dependency graph, only track reference counts. Process highly-referenced identifiers first.

**Algorithm**:
1. For each identifier, count how many times it's referenced (O(n) via binding info)
2. Sort by reference count (descending)
3. Process in order: high ref-count first (sequential), low ref-count later (parallel)
4. Threshold determines sequential vs parallel cutoff

**Hypothesis**: Reference count is a cheap proxy for importance. Highly-referenced identifiers are "load-bearing" for understanding.

**Pros**:
- O(n) analysis
- Simple to implement
- Reference count is meaningful

**Cons**:
- Ignores reference direction (who references whom)
- May not capture scope relationships
- Some important identifiers may have low ref count

**Validation Metrics**:
- Correlation between ref count and actual importance
- Quality at different thresholds
- Comparison to full dependency analysis

---

### N. Progressive Context Expansion

**Concept**: Process in multiple rounds, each round expands the context window.

**Algorithm**:
1. Round 1: Very small context window (500 chars), high parallelism
2. Round 2: Medium context window (2000 chars), medium parallelism
3. Round 3: Large context window (10000 chars), low parallelism
4. Each round can use previous round's names
5. Only "unstable" names (changed between rounds) continue to next round

**Hypothesis**: Many names are determinable with small context. Only hard cases need large context.

**Pros**:
- Progressive refinement
- Cheap initial pass filters easy cases
- Context window directly controls quality/speed

**Cons**:
- Multiple API calls per identifier (worst case)
- How to detect "stable" names?
- May not converge

**Validation Metrics**:
- Stability rate per round
- Quality improvement per round
- Total API calls vs single-pass

---

## Hybrid Combinations to Explore

| Combination | Description |
|-------------|-------------|
| A + B | Anchors first, then streaming windows |
| A + C | Anchors first, then two-pass for rest |
| B + E | Streaming windows with conflict detection |
| D + G | Top-level parallelism with hierarchical within |
| F + H | Reference clustering with importance ordering |
| C + N | Two-pass with progressive context |

---

## Validation Framework

### Test Samples
- **tiny-qs**: 148 identifiers (fast iteration)
- **small-axios**: ~800 identifiers (medium scale)
- **medium-chart**: 5002 identifiers (stress test)

### Metrics
1. **Quality Score**: LLM-as-judge semantic similarity (0-100) vs original
2. **Time**: Wall-clock seconds
3. **Tokens**: Total API tokens consumed
4. **Quality/Time Ratio**: Score per second
5. **Quality/Token Ratio**: Score per 1K tokens

### Baselines
- **Sequential**: Quality ceiling, time floor
- **V1 Turbo**: Current best speed, reference quality
- **Full Parallel (no deps)**: Speed ceiling, quality floor

### Testing Protocol
1. Implement approach as isolated module
2. Run on tiny-qs first (fast feedback)
3. If promising (within 5% of sequential quality), run on small-axios
4. If still promising, run on medium-chart
5. Record all metrics in results table

### Results Template

| Approach | Sample | Quality | Time (s) | Tokens | vs Sequential | vs V1 Turbo |
|----------|--------|---------|----------|--------|---------------|-------------|
| A (10% anchors) | tiny-qs | ? | ? | ? | ? | ? |
| A (20% anchors) | tiny-qs | ? | ? | ? | ? | ? |
| B (window=25) | tiny-qs | ? | ? | ? | ? | ? |
| ... | ... | ... | ... | ... | ... | ... |

---

## Implementation Priority

### Phase 1: Multi-Pass Foundation (Required)

Build the multi-pass infrastructure first. This is the core architecture.

1. **Multi-pass engine** - Framework that runs N passes, each seeing previous pass results
2. **Single-pass parallel baseline** - Simplest case: one parallel pass, no context
3. **Two-pass parallel** - Both passes parallel, pass 2 sees pass 1 renames

### Phase 2: Validate Multi-Pass Hypothesis

Before optimizing pass strategies, validate the core hypothesis:

1. Run single-pass parallel → measure quality (expect ~60-70%)
2. Run two-pass parallel → measure quality (expect ~85-90%)
3. Run three-pass parallel → measure quality (diminishing returns?)
4. Compare to sequential baseline

**Key Question**: Does two-pass parallel match or exceed sequential quality?

### Phase 3: Optimize Pass Strategies (if needed)

If two-pass parallel doesn't match sequential, try:

1. **B. Source-Order Streaming** as pass 2 - Local context improvement
2. **A. Anchor-First** as pass 1 - Better foundation for pass 2
3. **H. Importance-Weighted** for pass ordering - Process important IDs earlier
4. **M. Reference Count** to identify anchors - O(n) importance scoring

### Phase 4: Advanced Optimizations (stretch goals)

1. **Confidence-based skip** - Skip pass 2 for high-confidence pass 1 names
2. **Selective refinement** - Only re-process names that changed between passes
3. **Parallel pass 2** - If pass 2 quality is good enough with parallel

---

## Open Questions

1. **What's the quality ceiling?** Is sequential truly optimal, or could iterative refinement beat it?
2. **What's the acceptable quality floor?** How much quality loss is acceptable for 10x speedup?
3. **How does minification style affect this?** Webpack vs Rollup vs Terser may have different patterns
4. **Does context window size matter more than ordering?** Maybe bigger context with parallel is better than small context with sequential
5. **Can we predict approach effectiveness from code metrics?** (scope count, ref density, etc.)

---

## Next Steps

1. [ ] Run sequential and v1 turbo baselines on all samples
2. [ ] Implement M (reference count) as simplest first approach
3. [ ] Implement B (streaming) as dependency-free approach
4. [ ] Compare results, iterate on promising approaches
5. [ ] Combine best ideas into final v2 design
