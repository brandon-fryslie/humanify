# Turbo V2 Architecture and Safeguards

Technical design for a fresh rewrite that avoids the v1 pitfalls (lost checkpoints, ignored LLM results, refinement resetting to original input, unreadable progress). Written for an engineer with no external context.

## Objectives and Non-Negotiables
- Never delete checkpoints automatically; isolate per run to avoid collisions.
- Ensure LLM rename results are actually applied to emitted code; auditable end-to-end.
- Refinement/iterations must start from the previous output snapshot, not the original input.
- Stable, legible progress/UI: iteration aware, global progress, per-batch progress, no flicker.
- Preserve and export all API interactions to allow replay, auditing, and diffing vs final code.
- Pre-compute total work before first API call to derive global progress and cost estimates.

## High-Level Components
- **Job Planner**: Reads CLI args, computes input hash, builds deterministic jobId (e.g., `{inputHash}-{timestamp}-{passesHash}`), and materializes a work plan (passes, batch sizes, concurrency).
- **Analyzer**: Single upfront scan to count identifiers, build reference/importance metadata, and partition work into batches; outputs `analysis.json`.
- **Pass Engine**: Runs N passes; each pass sees prior pass results and code snapshot; enforces ordering and state transitions; provides hooks for checkpointing.
- **Checkpoint Manager**: Handles durable storage, mid-pass checkpoints, and resume/replay logic; never deletes without explicit CLI command.
- **LLM Gateway**: Normalizes prompts/responses, handles retries/backoff, caches responses, and persists full responses for audit.
- **Transformer**: Applies rename maps to AST/code, emits code snapshots per pass, and verifies invariants (e.g., renamed identifier counts match plan).
- **Progress/UI Renderer**: Renders fixed-layout, colored lines for iteration, global progress, batch progress, and stats; avoids cursor flicker by rewriting the same lines or using log-only mode.
- **Artifact Store**: Per-job directory containing checkpoints, snapshots, logs, metrics, and raw API exchanges.

## Directory Layout (Per Job)
```
.humanify-checkpoints/
  {jobId}/
    job.json                 # metadata, config, status
    analysis.json            # identifier counts, batches, reference stats
    passes/
      pass-001-progress.json
      pass-001-complete.json
      pass-002-progress.json
      ...
    responses/
      pass-001/
        batch-0001.jsonl     # raw LLM exchanges per identifier
    renames/
      pass-001-renames.jsonl # {id, original, proposed, confidence, meta}
      pass-002-renames.jsonl
    snapshots/
      after-pass-000.js      # code snapshot after pass N
    logs/
      console.log
      metrics.jsonl          # tokens, latency, failures
```
Notes:
- `jobId` includes timestamp to isolate concurrent runs even with identical inputs.
- No automatic deletion. Add explicit `humanify checkpoints clear ...` commands for manual cleanup.

## Job Lifecycle
1. **Plan**: Hash input file, parse CLI config, compute jobId, load/validate existing checkpoint (if resuming), or start fresh.
2. **Analyze** (no LLM): Parse once, collect identifiers, references, and scopes; compute batches and total work = `iterations * passes * totalIdentifiers` (or weighted by filters). Write `analysis.json`.
3. **Initialize Progress Model**: From analysis and pass config, derive:
   - Total identifiers per pass/iteration.
   - Estimated batches and requests.
   - Global progress denominator before first API call.
4. **Run Passes**:
   - Load prior code snapshot (input for pass 1, last snapshot for subsequent passes).
   - For each batch: build prompts, call LLM gateway, persist raw responses immediately, update renames map, apply to in-memory AST, emit mid-pass checkpoint based on thresholds (N identifiers or M seconds).
   - After each pass: materialize `pass-N-complete.json`, write `after-pass-N.js`, update job state.
5. **Transform/Emit**: Apply final rename map, run optional formatting, write output directory for the job (e.g., `output/{jobId}/deobfuscated.js`) and optionally `latest` symlink.
6. **Summarize**: Print stats per pass and overall (tokens, duration, success/failure counts, changed identifiers), and write metrics to `metrics.jsonl`.

## Pass / Iteration Semantics
- **Iteration**: A full multi-pass run over the code. Iteration 1 uses the original input; iteration >1 must load the previous iteration’s final snapshot as its starting point.
- **Pass Types**:
  - `rename`: core LLM rename.
  - `refine`: confirm/improve existing names with context that includes previous pass results.
  - `analyze-only`: non-LLM processors (anchors, conflicts) that enrich metadata for later passes.
- **Context Flow**: Each pass consumes the previous snapshot and the cumulative rename history. Refinement never reverts to the original file; it always sees the already-renamed code.

## Checkpointing and Resume
- **Mid-Pass**: Save progress every `saveEveryIdentifiers` and `saveEverySeconds`; includes pending queue, completed identifiers, partial renames, and last applied snapshot hash.
- **Pass Complete**: Immutable `pass-N-complete.json` plus `after-pass-N.js`.
- **Resume Rules**:
  - If config changes, detect diff and prompt options: discard, replay from pass K, or continue if compatible.
  - If input hash changes, invalidate checkpoint unless `--force`.
  - Resume mid-pass by restoring queue and code snapshot.
- **Replay/Audit**: Ability to reload `after-pass-K.js` and rerun downstream passes; export raw LLM responses for inspection.

## Ensuring LLM Results Reach Output (No “lost renames”)
- **Deterministic Identifier IDs**: Assign stable IDs during analysis (binding + location). All renames map by ID, not by string, to avoid collisions and missed applications.
- **Apply-on-Write**: After each batch, apply renames to the working AST and keep an updated snapshot; never defer application to the end.
- **Validation Invariants**:
  - Count of renamed identifiers in code matches renames map count for that pass.
  - No identifier is in a “proposed” state after pass completion.
  - If the rename map leaves a name unchanged, record `unchanged: true` for audit.
  - On pass completion, diff code vs prior snapshot to confirm substitutions occurred.
- **Raw Response Storage**: Persist full LLM responses per identifier before transformation to guard against serialization bugs.
- **Replay Harness**: Given responses and snapshot, re-apply to verify deterministic reproduction.

## Batching and Parallelism Strategy
- **Default Baseline**: Two-pass parallel rename (rough then refine) to maximize context without sequential bottlenecks.
- **Batch Construction**: Use analysis data to size batches; avoid O(n²) dependency graphs. Optionally support:
  - Source-order windows (streaming).
  - Importance-weighted anchors (high-importance sequential, rest parallel).
- **Context Availability**: Pass 2 uses pass 1 renames; ensure pass 2 prompt includes both original and previous names for referenced identifiers within the batch.
- **Rate Limits and Backoff**: Centralized in LLM gateway; configurable concurrency per pass.

## Progress and UI (Non-Flickery)
- **Layout**: Fixed-width sections on distinct lines:
  - `Iteration i/n | Global 45% [====>.....] ETA 12m`
  - `Pass 2/3 rename (parallel x50) | Batch 4/12 65% [===>...]`
  - `Tokens: 123k | API errors: 0 | Checkpoint: every 60s/200 ids`
- **Global Progress**: Uses precomputed total work across all iterations/passes/batches; updates monotonically.
- **Color**: Iteration 1 in yellow, iteration ≥2 in bright blue, errors in red, checkpoints in cyan/green. Keep one render loop that rewrites the same lines; optionally fall back to log-only mode for non-TTY.
- **Summaries**: After each pass: counts of identifiers processed/renamed/unchanged, tokens used, duration, error counts, and snapshot path.

## Output Directories
- Write to `output/{jobId}/...` with `output/latest` symlink for convenience.
- Refinement iterations use `after-pass-final.js` from the previous iteration as their input; never re-read the original file.
- Include a manifest (`output/{jobId}/manifest.json`) with input hash, jobId, pass configs, and snapshot references.

## API Usage, Caching, and Cost Control
- Cache prompts/responses keyed by `{model, promptHash}` in `responses/` to avoid repeat spend on retries/resume.
- Token accounting per pass and per batch; include in metrics and summaries.
- Configurable model per pass (e.g., `gpt-4o-mini` for rough pass, `gpt-4o` for refine).

## Error Handling and Idempotency
- **Per-Identifier Fault Tolerance**: Retry with backoff; on repeated failure, mark identifier as `failed` and continue, preserving progress.
- **Process Interrupts**: SIGINT/SIGTERM trigger immediate mid-pass checkpoint and clean shutdown.
- **Idempotent Writes**: Write temp files then atomic rename to avoid corrupting checkpoints on crash.

## Testing and Validation Plan (Offline)
- **Unit**: Identifier ID assignment, rename-map application, snapshot diffing, checkpoint read/write.
- **Integration**:
  - Run two-pass on a small fixture; verify global progress reaches 100% and outputs differ from input as expected.
  - Resume mid-pass: kill process, resume, ensure identical output to uninterrupted run.
  - Refinement iteration: run iteration 1 then iteration 2; confirm iteration 2 input equals iteration 1 final snapshot.
  - Audit replay: regenerate output from stored responses and confirm byte-for-byte match.
- **Golden Files**: Keep fixtures and expected snapshots under `fixtures/` for deterministic tests.

## Minimal Initial Configuration (CLI Sketch)
```
humanify unminify input.js --turbo-v2 \
  --passes 2 \
  --pass "rename:parallel:50:model=gpt-4o-mini" \
  --pass "refine:parallel:20:model=gpt-4o" \
  --checkpoint-dir .humanify-checkpoints \
  --output-dir output
```
Flags to include: `--no-resume`, `--resume`, `--replay-from <pass>`, `--iteration-count <n>`, `--save-every-identifiers <n>`, `--save-every-seconds <s>`, `--log-only-ui`, `--color/--no-color`.

## Implementation Order
1. Filesystem + checkpoint manager with jobId isolation and atomic writes.
2. Analyzer to produce `analysis.json` and work partitions; progress model derived from it.
3. Pass engine skeleton with snapshot handoff between passes and iterations.
4. LLM gateway with raw response persistence and caching.
5. Transformer that applies renames incrementally and validates invariants.
6. UI renderer with stable, iteration-aware global progress and per-pass summaries.
7. Replay/audit tooling and integration tests (resume, refinement, audit).
