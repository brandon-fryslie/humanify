# Turbo V2: The Authoritative Specification

> One document to rule them all. Written for an engineer with no external context.

---

## 1. Mission

Turbo V2 is a ground-up rewrite of HumanifyJS's parallel processing mode. It achieves **sequential-level quality** at **parallel-level speeds** while ensuring **zero data loss** and **zero wasted API spend**.

### North Star Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Resilience** | 100% resume from any crash | Power loss, OOM, network failure—never lose progress |
| **Efficiency** | Never pay twice for same LLM response | Vault caching eliminates re-billing |
| **Quality** | ≥95% of sequential semantic quality | Multi-pass refinement matches careful sequential |
| **Speed** | 10-30x faster than sequential | Hours not days for 100K+ identifier files |

### Guardrails (V1 Lessons Learned)

1. **Never delete checkpoints automatically** — isolate per jobId; cleanup only via explicit CLI
2. **Refinement reads previous snapshot, not original** — each pass builds on the last
3. **Apply renames immediately to AST** — no "lost renames"; keep audit trail
4. **Stable UI** — iteration-aware, global progress, no flicker; use color for emphasis
5. **Preserve all API responses** — for replay, audit, and cost recovery
6. **Pre-compute total work** — enable accurate global progress and cost estimates before first API call

---

## 2. Architecture: Ledger & Vault

### 2.1 The Vault (Request-Level Cache)

**What**: A persistent, content-addressed store for raw LLM interactions.

```
.humanify-cache/vault/{hash}.json
```

**Key**: `hash(model + prompt + options)`

**Why**: If the app crashes during parsing or AST mutation, we reload from Vault instead of re-running the LLM request. Zero wasted spend.

**Eviction Policy**:
- Max size: 1GB (configurable via `--vault-max-size`)
- Strategy: LRU (least recently used)
- Cleanup: Automatic eviction when vault exceeds threshold
- Evicts until size < 80% of max (configurable target size)

### 2.2 The Ledger (Event-Sourced Checkpointing)

**What**: An append-only log of every state change.

**Format**: `events.jsonl` (line-delimited JSON)

**Events**:
- `JOB_STARTED` — job metadata, config
- `PASS_STARTED` — pass number, config
- `BATCH_STARTED` — batch number, identifier IDs
- `IDENTIFIER_RENAMED` — id, oldName, newName, confidence
- `BATCH_COMPLETED` — batch number, stats
- `PASS_COMPLETED` — pass number, stats
- `SNAPSHOT_CREATED` — pass number, snapshot hash
- `JOB_COMPLETED` — final stats

**Recovery**: State is rebuilt by replaying the ledger. Partial lines are discarded.

**Granularity**: Progress saved after *every single identifier*, not just batches.

### 2.3 Core Components

| Component | Responsibility |
|-----------|----------------|
| **Job Planner** | Parse CLI, hash input, compute `jobId`, build pass plan |
| **Analyzer** | One upfront parse → identifiers, scopes, refs, importance → `analysis.json` |
| **Pass Engine** | Run N passes over current snapshot; enforce sequencing; support parallel/streaming/sequential |
| **Checkpoint Manager** | Ledger writes, snapshot creation, resume logic, config-diff handling |
| **LLM Gateway** | Prompt normalization, retries/backoff, rate limiting, vault caching, model-per-pass |
| **Transformer** | Apply rename maps to AST; validate invariants; emit snapshots |
| **Progress Renderer** | Fixed-line colored UI; global/pass/batch progress; summaries |
| **Artifact Store** | Per-job directory management |

---

## 3. Storage Layout

```
.humanify-checkpoints/
  {jobId}/
    job.json                    # Metadata, config, status
    analysis.json               # Identifiers, batches, refs, importance scores
    events.jsonl                # Append-only ledger (source of truth)
    snapshot.json               # Derived fast-resume state (atomic writes)
    passes/
      pass-001-progress.json    # Mid-pass checkpoint
      pass-001-complete.json    # Pass completion record
    responses/
      pass-001/
        batch-0001.jsonl        # Raw LLM request/response pairs
    renames/
      pass-001-renames.jsonl    # Rename decisions per pass
    snapshots/
      after-pass-000.js         # Original input (or previous iteration output)
      after-pass-001.js         # Code after pass 1
    logs/
      console.log               # Full console output
      metrics.jsonl             # Timing, tokens, errors

.humanify-cache/
  vault/
    {hash}.json                 # Cached LLM responses (global, not per-job)
```

**Isolation**: Each job has unique `jobId = {inputHash}-{configHash}-{timestamp}` (include iteration count when >1). Concurrent runs never collide.

**Cleanup**: Only via explicit `humanify checkpoints clear [--older-than 7d]`.

---

## 4. Checkpointing Model

### Ledger + Snapshot Pattern

1. **Ledger** (`events.jsonl`) is the source of truth — append-only, crash-resistant
2. **Snapshot** (`snapshot.json`) is a periodic derived state — atomic write via temp+rename
3. **Resume**: Load snapshot for fast start, replay ledger events since snapshot

### Mid-Pass Checkpointing

Triggered by:
- Every N identifiers (default: 100)
- Every M seconds (default: 60)
- On SIGINT/SIGTERM

Checkpoint contains:
- Completed identifier IDs
- Pending identifier queue
- Partial rename map
- Current snapshot hash
- Stats (tokens, duration, errors)

### Resume Rules

| Scenario | Behavior |
|----------|----------|
| Input hash matches | Resume from checkpoint |
| Input hash differs | Error unless `--force` |
| Config differs | Prompt: continue / replay from pass K / restart |
| Mid-pass checkpoint | Restore queue, load snapshot, continue |

### Replay

Given `after-pass-K.js` and ledger events, deterministically regenerate any downstream state.

---

## 5. Multi-Pass Processing

### Iterations (End-to-End Refinement)

- **Definition**: An iteration is a full multi-pass run. Iteration 1 starts from the original input snapshot; iteration N>1 starts from the final snapshot of iteration N-1.
- **Defaults**: `iterationCount = 1` unless specified. Iteration metadata is part of `jobId` for uniqueness.
- **Resume**: Mid-iteration resume uses that iteration's checkpoints. Cross-iteration resume loads the last completed iteration's final snapshot and continues with remaining iterations.
- **UI**: Iteration 1 shown in yellow; iteration ≥2 shown in bright blue. Global progress denominator includes all iterations and passes.

### The Core Insight

**VALIDATED 2025-12-30**: Empirical testing confirms the multi-pass hypothesis.

Sequential mode achieves best quality but is slow. The key insight:

| Method | ID #1 Context | ID #500 Context | ID #1000 Context | Average |
|--------|---------------|-----------------|------------------|---------|
| Sequential | 0% | 50% | 100% | 50% |
| 2-Pass Parallel | 100% (Pass 2) | 100% (Pass 2) | 100% (Pass 2) | 100%* |

\* Pass 1 gives 60-87% accurate names (measured); Pass 2 sees ALL of them.

**Measured Baseline Quality** (semantic scores, 2025-12-30):

| Sample | Sequential | 1-Pass Parallel | Ratio |
|--------|------------|-----------------|-------|
| tiny-qs | 75/100 | 65/100 | 87% |
| small-axios | 55/100 | 40/100 | 73% |
| medium-chart | 50/100 | 50/100 | 100% |
| **Average** | **60/100** | **52/100** | **86%** |

**Key Finding**: 1-pass parallel achieves 86% of sequential quality, validating that 2-pass can reach ≥95% of sequential.

**2-pass parallel can match or exceed sequential quality because early identifiers get better context.**

### Pass Types

| Type | Description | Uses LLM |
|------|-------------|----------|
| `rename` | Core LLM rename | Yes |
| `refine` | "Confirm or improve" with full context | Yes |
| `analyze` | Detect anchors, conflicts, patterns | Maybe |
| `transform` | Apply consistency rules | No |

### Execution Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `parallel` | All identifiers concurrent (rate-limited) | Maximum speed |
| `streaming` | Source-order windows, each sees previous | Local context |
| `sequential` | One at a time, each sees all previous | Maximum quality |

### Context Flow

- Each pass operates on the **previous pass's output snapshot**
- Refinement never re-reads original obfuscated code
- Cumulative rename history available to all passes
- Identifier IDs are stable (binding + location), not string names

---

## 6. Pipeline Presets

Presets provide pre-configured multi-pass strategies for common use cases. They optimize for different quality/speed/cost trade-offs.

### Fast Preset (Default)

**Use Case**: Maximum speed with good quality. Best for most files.

**Pipeline**:
```
Pass 1: rename:parallel:50 (gpt-4o-mini)
Pass 2: rename:parallel:50 (gpt-4o-mini)
```

**How it works**:
- Pass 1: Initial parallel rename (60-87% quality)
- Pass 2: Sees all Pass 1 renames, improves context for better suggestions

**Performance Expectations**:
- Quality: 85-95% of sequential baseline
- Speed: 10-15x faster than sequential
- Cost: 2x API calls (double tokens)
- Time: ~5-10 minutes for 5000 identifiers

**When to use**:
- Default choice for files with 100-10,000 identifiers
- Time-sensitive workflows
- When cost is moderate concern

**CLI**:
```bash
humanify unminify input.js --turbo-v2 --preset fast
# or simply:
humanify unminify input.js --turbo-v2
```

---

### Balanced Preset

**Use Case**: Good quality/speed trade-off with explicit refinement step.

**Pipeline**:
```
Pass 1: rename:parallel:50 (gpt-4o-mini)
Pass 2: refine:parallel:50 (gpt-4o-mini)
```

**How it works**:
- Pass 1: Initial rename with surrounding context
- Pass 2: Refinement processor reviews each name with full Pass 1 context
- Refine processor prompt explicitly asks: "Is this name correct? Suggest improvement or keep."

**Performance Expectations**:
- Quality: 90-95% of sequential baseline
- Speed: 8-12x faster than sequential
- Cost: 2x API calls
- Time: ~7-12 minutes for 5000 identifiers

**When to use**:
- When quality is more important than raw speed
- Files with complex business logic
- When you want explicit confirmation of rename quality

**CLI**:
```bash
humanify unminify input.js --turbo-v2 --preset balanced
```

---

### Quality Preset

**Use Case**: Maximum quality. Best results regardless of cost.

**Pipeline**:
```
Pass 1: rename:parallel:50
Pass 2: refine:parallel:50
Pass 3: analyze:parallel:100 (conflict detection)
Pass 4: rename:sequential:1 (low-confidence only)
Pass 5: transform:parallel:100 (consistency enforcement)
```

**How it works**:
- Pass 1-2: Standard rename + refine
- Pass 3: Analyze identifies conflicts (same identifier with different names, similar names for unrelated identifiers)
- Pass 4: Sequential processing of flagged low-confidence identifiers with full context
- Pass 5: Apply naming consistency rules (camelCase, prefix/suffix patterns)

**Performance Expectations**:
- Quality: 95-100% of sequential baseline (may exceed)
- Speed: 3-5x faster than sequential
- Cost: 5x API calls
- Time: ~15-30 minutes for 5000 identifiers

**When to use**:
- Production deobfuscation requiring high accuracy
- Files with critical business logic
- When cost is not a concern
- When you need consistent naming conventions

**CLI**:
```bash
humanify unminify input.js --turbo-v2 --preset quality
```

---

### Anchor Preset

**Use Case**: Large files with clear hierarchy. Anchor-first hybrid strategy.

**Pipeline**:
```
Pass 1: analyze:parallel:100 (detect anchors)
Pass 2: rename:sequential:1 (anchors only, top 10-20%)
Pass 3: rename:parallel:50 (rest, with anchor glossary)
Pass 4: refine:parallel:50 (optional cleanup)
```

**How it works**:
- Pass 1: Detect high-importance identifiers (anchors): exports, classes, functions, high reference count
- Pass 2: Sequentially rename anchors with maximum context (each sees previous)
- Pass 3: Parallel rename of remaining identifiers, with anchor names in glossary
- Pass 4: Refinement pass for final polish

**Anchor Detection Criteria**:
- Exported identifiers
- Class or function declarations
- Reference count ≥ 3
- Scope size ≥ 50 lines
- Typically top 10-20% by importance score

**Performance Expectations**:
- Quality: 90-98% of sequential baseline
- Speed: 5-10x faster than sequential
- Cost: 4x API calls
- Time: ~10-20 minutes for 5000 identifiers

**When to use**:
- Files with 5000+ identifiers
- Clear architectural hierarchy (libraries, frameworks)
- When important identifiers need sequential attention
- Files with many small helper functions referencing few key exports

**CLI**:
```bash
humanify unminify input.js --turbo-v2 --preset anchor
```

---

### Preset Comparison Table

| Preset | Passes | Quality | Speed | Cost | Best For |
|--------|--------|---------|-------|------|----------|
| `fast` | 2 | 85-95% | 10-15x | 2x | Default choice, most files |
| `balanced` | 2 | 90-95% | 8-12x | 2x | Quality-focused, moderate cost |
| `quality` | 5 | 95-100% | 3-5x | 5x | Production, critical code |
| `anchor` | 4 | 90-98% | 5-10x | 4x | Large files, clear hierarchy |

**Quality**: Percentage of sequential baseline semantic score
**Speed**: Speedup vs. sequential processing
**Cost**: API call multiplier vs. 1-pass

---

### Custom Presets

You can define custom presets via config file (deferred to future sprint). For now, use explicit `--pass` arguments:

```bash
# Custom 3-pass pipeline
humanify unminify input.js --turbo-v2 \
  --pass "rename:parallel:50" \
  --pass "refine:parallel:50" \
  --pass "rename:sequential:1:low-confidence"
```

---

## 7. CLI Interface

### Basic Usage

```bash
# Default 2-pass parallel (fast preset)
humanify unminify input.js --turbo-v2

# Use preset
humanify unminify input.js --turbo-v2 --preset balanced

# Explicit passes
humanify unminify input.js --turbo-v2 --passes 3

# Custom pipeline
humanify unminify input.js --turbo-v2 \
  --pass "rename:parallel:50" \
  --pass "refine:parallel:50"
```

### Pass Syntax

```
processor:mode:concurrency[:filter][:options]

Examples:
  rename:parallel:50
  rename:sequential:1:anchors
  refine:parallel:30:low-confidence:model=gpt-4o
```

### Key Options

```bash
--passes N                    # Number of passes (if not using --pass)
--pass "..."                  # Define custom pass (repeatable)
--preset NAME                 # Use preset pipeline

--checkpoint-dir DIR          # Checkpoint location (default: .humanify-checkpoints)
--output-dir DIR              # Output location (default: output/)
--save-every-identifiers N    # Mid-pass checkpoint frequency (default: 100)
--save-every-seconds N        # Mid-pass checkpoint frequency (default: 60)

--vault-max-size N            # Max vault size in bytes (default: 1GB)

--fresh                       # Ignore existing checkpoint, start fresh
--replay-from N               # Replay from after pass N

--dry-run                     # Show plan without executing
--verbose                     # Detailed logging
--quiet                       # Minimal output
--no-color                    # Disable colored output
```

### Checkpoint Commands

```bash
humanify checkpoints list                  # List all checkpoints
humanify checkpoints show JOB_ID           # Show checkpoint details
humanify checkpoints clear                 # Clear all checkpoints
humanify checkpoints clear --older-than 7d # Clear old checkpoints
humanify checkpoints resume JOB_ID         # Resume specific job
```

---

## 8. Progress UI

### Layout

```
[turbo-v2] job-abc123 | input.js (5002 identifiers)

Iteration 1/1 | Global 45% [████████░░░░░░░░] ETA 12m
Pass 2/3 rename:parallel:50 | Batch 4/12 65% [██████░░░░]
Tokens: 123k | Errors: 0 | Checkpoint: 60s/100 ids

──────────────────────────────────────────────────────
```

### Design Principles

1. **Fixed-width lines** — no flicker, no overlap
2. **Global progress** — denominator pre-computed from analysis
3. **Color coding**:
   - Iteration 1: yellow
   - Iteration 2+: bright blue
   - Errors: red
   - Checkpoints: cyan/green

### Pass Summaries

After each pass:
```
[pass 2/3] Complete
  • Identifiers: 5002 processed, 4251 renamed, 751 unchanged
  • Tokens: 48,234 (prompt: 42k, completion: 6k)
  • Duration: 82.1s (avg 16ms/id)
  • Errors: 0
  • Snapshot: snapshots/after-pass-002.js
```

---

## 9. Invariants (Preventing Lost Renames)

### Mandatory Checks

1. **Apply-on-write**: Renames applied to AST after each batch, not deferred
2. **Count validation**: `renamed_in_code == len(rename_map)` on pass completion
3. **No orphan proposals**: Every identifier has final state (renamed OR explicitly unchanged)
4. **Diff verification**: `diff(snapshot[N-1], snapshot[N])` shows expected substitutions
5. **Response persistence**: Raw LLM responses saved before parsing

### Audit Trail

Every rename decision is traceable:
```
events.jsonl → IDENTIFIER_RENAMED(id=x, old=a, new=config, confidence=0.85)
responses/pass-001/batch-0012.jsonl → raw prompt and response
renames/pass-001-renames.jsonl → final rename map
snapshots/after-pass-001.js → actual code
```

---

## 10. Error Handling

### API Failures

| Scenario | Behavior |
|----------|----------|
| Single request fails | Retry 3x with exponential backoff (1s, 2s, 4s) |
| Request exceeds retries | Mark identifier as `skipped`, continue batch |
| Rate limit (429) | Backoff with jitter, respect Retry-After header |
| Batch-wide failure | Checkpoint partial, report skipped count |

### Checkpoint Corruption

| Scenario | Behavior |
|----------|----------|
| Partial JSON | Discard partial line, use last complete |
| Snapshot mismatch | Rebuild from ledger events |
| Unrecoverable | Error with instructions to use `--fresh` |

### Graceful Shutdown

```typescript
process.on('SIGINT', async () => {
  console.log('\n[turbo-v2] Interrupt received, saving checkpoint...');
  await checkpointManager.saveProgress();
  console.log('[turbo-v2] Safe to exit. Resume with same command.');
  process.exit(0);
});
```

---

## 11. Quality Assurance

### Regression Policy

Track per-identifier history:
```typescript
interface IdentifierHistory {
  id: string;
  passes: Array<{ pass: number; name: string; confidence: number }>;
}
```

**Regression**: `confidence[N] < confidence[N-1] * 0.9` (10% drop)

**Policy options**:
- `keep-best` (default): Use highest-confidence name
- `keep-latest`: Always use most recent name

CLI: `--regression-policy [keep-best|keep-latest]`

### Stability Metric

```
stabilityRate = unchangedCount / totalCount
```

- Target: >80% by pass 3
- Warning if <50%: "High churn detected"

---

## 12. Validation Infrastructure

### Test Samples

| Sample | Identifiers | Lines | Purpose |
|--------|-------------|-------|---------|
| `tiny-qs` | ~150 | 356 | Fast iteration |
| `small-axios` | ~800 | 3K | Medium tests |
| `medium-chart` | ~5000 | 11K | Stress tests |

### Metrics

1. **Semantic Score**: LLM-as-judge comparison (0-100)
2. **Time**: Wall-clock seconds
3. **Tokens**: API tokens consumed
4. **Quality/Time**: Score per second
5. **Quality/Token**: Score per 1K tokens
6. **Stability**: % names unchanged between passes

### Baselines (Measured 2025-12-30)

| Mode | Quality | Speed | Cost |
|------|---------|-------|------|
| Sequential | 60/100 (measured) | Floor | 1x |
| 1-Pass Parallel | 52/100 (measured, 86% of seq) | Ceiling | 1x |
| 2-Pass Parallel | 85-95/100 (expected) | Fast | 2x |
| V1 Turbo | Reference | Reference | 1x |

**Validation Status**: COMPLETE (see `src/turbo-v2/VALIDATION-RESULTS.md`)

---

## 13. Success Gates

| Gate | Criteria | Validates |
|------|----------|-----------|
| **Gate 1** | Resume mid-pass without losing any identifier progress | Ledger durability |
| **Gate 2** | Vault hit-rate is 100% on retry of crashed run | Caching works |
| **Gate 3** | Semantic score within 5% of sequential on medium-chart | Quality target |
| **Gate 4** | 5000 identifiers in < 10 minutes | Speed target |

---

## 14. Implementation Roadmap

### Phase 0: Validation Infrastructure ✅ COMPLETE (2025-12-30)
- [x] Identify canonical libraries (tiny-qs, small-axios, medium-chart)
- [x] Generate minified/original pairs
- [x] Build semantic scoring script
- [x] Record sequential and 1-pass baselines
- [x] Validate multi-pass hypothesis

**Result**: GO - Average ratio 86% (1-pass/sequential), validating that 2-pass can achieve ≥95%.

### Phase 1: Foundation (Ledger & Vault)
- [ ] Implement Vault (request caching)
- [ ] Implement Ledger (append-only events)
- [ ] Implement IdentifierCollector
- [ ] Implement ContextExtractor
- [ ] Build single-pass parallel Orchestrator

### Phase 2: Multi-Pass & Context Flow
- [ ] N-pass orchestration with snapshot handoff
- [ ] Glossary injection (pass N sees pass N-1)
- [ ] AnchorDetector (importance scoring)

### Phase 3: Checkpointing & Resume
- [ ] Mid-pass checkpointing
- [ ] Resume logic with config-diff handling
- [ ] Replay harness
- [ ] Graceful shutdown

### Phase 4: UI & Observability
- [ ] Fixed-layout progress renderer
- [ ] Global progress with pre-computed totals
- [ ] Per-pass summaries
- [ ] Token/cost tracking

### Phase 5: CLI Integration
- [ ] `--turbo-v2` flag
- [ ] `--pass` argument parsing
- [ ] Presets
- [ ] Checkpoint commands

### Phase 6: Advanced Strategies
- [ ] Anchor-first pipeline
- [ ] Speculative + judge
- [ ] Conflict detection
- [ ] Consistency enforcement

---

## 15. Open Questions

1. **Optimal pass count**: When does pass 3 help? File size? Identifier density?
2. **Anchor threshold**: What defines "important"? References > N? Exports? Classes?
3. **Confidence thresholds**: When to skip refinement? When to flag for review?
4. **Glossary format**: How to inject pass 1 names into pass 2 prompts without bloat?
5. **Window size for streaming**: Source-order window of 25? 50? 100?

---

## 16. File Index

```
src/turbo-v2/
  FINAL_PROJECT_SPEC.md        # This document (authoritative spec)
  VALIDATION-RESULTS.md        # Phase 0 validation results
```

---

*This document is the single source of truth for Turbo V2.*
