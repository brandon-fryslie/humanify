# Definition of Done: All Sprints
**Generated**: 2025-12-30
**Covers**: Sprints 1-12

This document contains the acceptance criteria for all 12 sprints. Each sprint must have ALL criteria met before being marked complete.

---

## Sprint 1: Phase 0 Completion - Hypothesis Validation

### D1.1: Run Semantic Scoring on All Baselines
- [ ] `test-samples/canonical/tiny-qs/output-sequential/semantic-score.json` exists
- [ ] `test-samples/canonical/small-axios/output-sequential/semantic-score.json` exists
- [ ] `test-samples/canonical/medium-chart/output-sequential/semantic-score.json` exists
- [ ] `test-samples/canonical/tiny-qs/output-turbo/semantic-score.json` exists
- [ ] `test-samples/canonical/small-axios/output-turbo/semantic-score.json` exists
- [ ] Each JSON contains: `{ score: number, confidence: number, sampleSize: number, model: string }`

### D1.2: Analyze Results and Make Go/No-Go Decision
- [ ] Sequential scores documented (expected: 80-90%)
- [ ] 1-pass parallel scores documented (expected: 60-70%)
- [ ] Ratio calculated: `1-pass / sequential`
- [ ] Decision documented: GO if ratio ≥ 0.60, NO-GO if ratio < 0.50
- [ ] `VALIDATION-RESULTS.md` created with all findings

### D1.3: Update Spec with Empirical Data
- [ ] FINAL_PROJECT_SPEC.md lines 156-166 updated with measured values
- [ ] No `~` prefix on quality numbers
- [ ] "UNVALIDATED" note removed from hypothesis section
- [ ] Validation results section added

---

## Sprint 2: Foundation - Vault Implementation

### D2.1: Implement Vault Core
- [ ] `src/turbo-v2/vault/vault.ts` exists
- [ ] Exports `Vault` class implementing `VaultInterface`
- [ ] `computeKey(model, prompt, options)` returns SHA-256 hash
- [ ] `get(key)` returns cached entry or null
- [ ] `set(key, entry)` writes to `.humanify-cache/vault/{hash}.json`
- [ ] `has(key)` returns boolean
- [ ] Writes are atomic (temp file + rename)

### D2.2: Implement Vault Integration with LLM Gateway
- [ ] `src/turbo-v2/llm-gateway.ts` exists
- [ ] On request: Check vault first
- [ ] On cache miss: Call LLM, store in vault, return response
- [ ] On cache hit: Return cached response (no API call)
- [ ] Tracks metrics: `{ hits: number, misses: number }`

### D2.3: Vault Unit Tests
- [ ] Test file: `src/turbo-v2/vault/vault.test.ts`
- [ ] Test: Cache miss triggers API call
- [ ] Test: Cache hit skips API call
- [ ] Test: 100% hit rate on identical requests
- [ ] Test: Atomic writes survive SIGKILL mid-write
- [ ] All tests pass

---

## Sprint 3: Foundation - Ledger Implementation

### D3.1: Implement Ledger Core
- [ ] `src/turbo-v2/ledger/ledger.ts` exists
- [ ] Exports `Ledger` class implementing `LedgerInterface`
- [ ] `append(event)` writes JSONL with fsync
- [ ] `replay()` yields events in order
- [ ] `getState()` returns reconstructed state
- [ ] Partial lines at EOF are discarded

### D3.2: Implement Event Types and Schemas
- [ ] `src/turbo-v2/ledger/events.ts` exists
- [ ] Defines all 8 event types with TypeScript interfaces
- [ ] JOB_STARTED, PASS_STARTED, BATCH_STARTED, IDENTIFIER_RENAMED
- [ ] BATCH_COMPLETED, PASS_COMPLETED, SNAPSHOT_CREATED, JOB_COMPLETED
- [ ] Each event has: `type`, `timestamp`, payload fields
- [ ] JSON schema validation available

### D3.3: Ledger Unit Tests
- [ ] Test file: `src/turbo-v2/ledger/ledger.test.ts`
- [ ] Test: Append and replay preserves order
- [ ] Test: Partial EOF line discarded
- [ ] Test: State correctly reconstructed
- [ ] Test: 10,000 events replay in < 1 second
- [ ] All tests pass

---

## Sprint 4: Foundation - Core Orchestration

### D4.1: Implement Analyzer
- [ ] `src/turbo-v2/analyzer/analyzer.ts` exists
- [ ] Parses JavaScript via Babel
- [ ] Extracts all binding identifiers
- [ ] Each identifier has: id, name, bindingType, scopeId, references, context
- [ ] Writes `analysis.json` to job directory
- [ ] Handles 5000+ identifiers without OOM

### D4.2: Implement Single-Pass Parallel Orchestrator
- [ ] `src/turbo-v2/orchestrator/pass-engine.ts` exists
- [ ] Processes identifiers in parallel (configurable concurrency)
- [ ] Rate limiting prevents API throttling
- [ ] Uses Vault for caching
- [ ] Logs events to Ledger
- [ ] Tracks progress: processed/total/errors

### D4.3: Implement Transformer
- [ ] `src/turbo-v2/transformer/transformer.ts` exists
- [ ] Applies rename map to AST via Babel scope.rename()
- [ ] Handles collisions by prefixing with `_`
- [ ] Validates: `renamed_in_code == len(rename_map)`
- [ ] Writes snapshots to `snapshots/after-pass-NNN.js`
- [ ] Output is valid JavaScript (parse test)

### Gate 2 Validation
- [ ] Crash during pass → restart → 100% vault hit rate
- [ ] No duplicate API calls on retry

---

## Sprint 5: Multi-Pass - N-Pass Orchestration

### D5.1: Implement N-Pass Orchestration
- [ ] `src/turbo-v2/orchestrator/multi-pass.ts` exists
- [ ] Runs N passes sequentially
- [ ] Pass N reads `snapshots/after-pass-(N-1).js`
- [ ] Pass N writes `snapshots/after-pass-N.js`
- [ ] Pass config: processor, mode, concurrency, filter, model
- [ ] Pre-computes total work before starting

### D5.2: Implement Glossary Injection
- [ ] Glossary section added to prompt template
- [ ] Contains top 100 renames from previous pass
- [ ] Prioritized by reference count
- [ ] Pass 2+ prompts include glossary
- [ ] Glossary format: `oldName → newName`

### D5.3: Multi-Pass Integration Tests
- [ ] Test: 2-pass on tiny-qs produces valid output
- [ ] Test: Pass 2 glossary contains Pass 1 renames
- [ ] Test: Semantic score improves between passes
- [ ] Test: 3-pass achieves >80% stability

---

## Sprint 6: Multi-Pass - Quality Validation

### D6.1: Implement AnchorDetector
- [ ] `src/turbo-v2/analyzer/anchor-detector.ts` exists
- [ ] `computeImportance(identifier)` returns score 0-1
- [ ] `detectAnchors(identifiers, threshold)` returns top N%
- [ ] Default threshold: top 10-20%
- [ ] Score formula documented in code

### D6.2: Run Quality Benchmarks
- [ ] 2-pass semantic scores measured for all 3 samples
- [ ] Score ≥ 95% of sequential baseline (Gate 3)
- [ ] Time < 10 minutes for medium-chart 5000 identifiers (Gate 4)
- [ ] 3+ trials for statistical significance
- [ ] Results documented with confidence intervals

### D6.3: Quality Regression Detection
- [ ] `src/turbo-v2/quality/regression-detector.ts` exists
- [ ] Detects: confidence[N] < confidence[N-1] * 0.9
- [ ] Policy options: `keep-best`, `keep-latest`
- [ ] Per-identifier history tracked
- [ ] Warning if regression rate > 10%

### Gate 3 Validation
- [ ] 2-pass semantic score ≥ 95% of sequential on medium-chart

### Gate 4 Validation
- [ ] 5000 identifiers processed in < 10 minutes

---

## Sprint 7: Checkpointing - Mid-Pass Resume

### D7.1: Implement Checkpoint Manager
- [ ] `src/turbo-v2/checkpoint/checkpoint-manager.ts` exists
- [ ] Triggers every 100 identifiers (configurable)
- [ ] Triggers every 60 seconds (configurable)
- [ ] Saves: completedIds, pendingIds, renameMap, stats
- [ ] Writes to `passes/pass-NNN-progress.json`
- [ ] Atomic writes via temp + rename

### D7.2: Implement Snapshot Manager
- [ ] `src/turbo-v2/checkpoint/snapshot-manager.ts` exists
- [ ] Atomic writes (temp + rename)
- [ ] Validates output is valid JavaScript
- [ ] Computes hash for integrity
- [ ] Diff verification available

### D7.3: Checkpoint Unit Tests
- [ ] Test: Checkpoint saved after N identifiers
- [ ] Test: Checkpoint restored correctly
- [ ] Test: No progress lost on crash mid-batch
- [ ] Test: Atomic write survives SIGKILL
- [ ] All tests pass

---

## Sprint 8: Checkpointing - Full Resume

### D8.1: Implement Resume Logic
- [ ] `src/turbo-v2/checkpoint/resume-handler.ts` exists
- [ ] Detects existing checkpoint by input hash
- [ ] Loads snapshot and restores queue on resume
- [ ] Handles config diff: continue / replay / restart
- [ ] `--fresh` flag ignores checkpoint
- [ ] User prompt for ambiguous cases

### D8.2: Implement Replay Harness
- [ ] `src/turbo-v2/checkpoint/replay-harness.ts` exists
- [ ] Replays ledger events to regenerate state
- [ ] Can replay to any point in history
- [ ] Used for debugging and verification

### D8.3: Graceful Shutdown Handler
- [ ] SIGINT handler saves progress and exits cleanly
- [ ] SIGTERM handler saves progress and exits cleanly
- [ ] Message: "Safe to exit. Resume with same command."
- [ ] No data loss on Ctrl+C

### Gate 1 Validation
- [ ] Kill process mid-pass
- [ ] Resume with same command
- [ ] All completed identifiers preserved
- [ ] Processing continues from checkpoint

---

## Sprint 9: UI & Observability

### D9.1: Implement Progress Renderer
- [ ] `src/turbo-v2/ui/progress-renderer.ts` exists
- [ ] Fixed-width lines (no flicker)
- [ ] Shows: global progress, pass progress, batch progress
- [ ] Color coding: iteration 1 (yellow), 2+ (blue), errors (red)
- [ ] ETA calculation
- [ ] Progress bars render correctly in terminal

### D9.2: Implement Pass Summaries
- [ ] Summary displayed after each pass
- [ ] Shows: identifiers processed/renamed/unchanged
- [ ] Shows: token usage (prompt/completion/total)
- [ ] Shows: duration, average ms/identifier
- [ ] Shows: error count
- [ ] Shows: snapshot path

### D9.3: Implement Metrics Collection
- [ ] `src/turbo-v2/metrics/metrics-collector.ts` exists
- [ ] Tracks: timing, tokens, errors, vault hit rate
- [ ] Writes to `logs/metrics.jsonl`
- [ ] `--quiet` disables console output
- [ ] `--verbose` enables detailed logging

---

## Sprint 10: CLI Integration

### D10.1: Implement --turbo-v2 Flag
- [ ] `humanify unminify input.js --turbo-v2` works
- [ ] Uses new turbo-v2 engine
- [ ] Default: 2-pass parallel pipeline
- [ ] No `--turbo-v2` = existing v1 behavior (backwards compatible)

### D10.2: Implement Pass Argument Parsing
- [ ] `--pass "rename:parallel:50"` parses correctly
- [ ] `--pass "refine:sequential:1:low-confidence"` parses correctly
- [ ] Multiple `--pass` flags supported
- [ ] Invalid syntax shows helpful error

### D10.3: Implement Checkpoint Commands
- [ ] `humanify checkpoints list` shows all checkpoints
- [ ] `humanify checkpoints show JOB_ID` shows details
- [ ] `humanify checkpoints clear` clears all
- [ ] `humanify checkpoints clear --older-than 7d` clears old
- [ ] `humanify checkpoints resume JOB_ID` resumes job

---

## Sprint 11: Advanced Strategies - Presets

### D11.1: Implement Preset System
- [ ] `src/turbo-v2/presets/presets.ts` exists
- [ ] `fast` preset: 2-pass parallel
- [ ] `balanced` preset: rename → refine
- [ ] `quality` preset: 5-pass with conflicts
- [ ] `anchor` preset: anchor-first hybrid
- [ ] `--preset fast` works in CLI

### D11.2: Implement Vault Eviction
- [ ] `src/turbo-v2/vault/eviction.ts` exists
- [ ] LRU eviction when size > threshold
- [ ] Default threshold: 1GB
- [ ] `--vault-max-size N` CLI option
- [ ] Stats: size, entries, evictions

### D11.3: Preset Documentation
- [ ] Each preset documented in FINAL_PROJECT_SPEC.md
- [ ] Use case guidance for each preset
- [ ] Performance expectations documented
- [ ] `--help` shows preset descriptions

---

## Sprint 12: Advanced Strategies - Specialized Processors

### D12.1: Implement Anchor-First Hybrid Pipeline
- [ ] `anchor` preset fully implemented
- [ ] Pass 1: Detect anchors
- [ ] Pass 2: Rename anchors sequentially
- [ ] Pass 3: Rename rest in parallel with glossary
- [ ] Quality improvement measured vs 2-pass

### D12.2: Implement Conflict Detection
- [ ] `src/turbo-v2/processors/conflict-detector.ts` exists
- [ ] Detects same identifier with different names
- [ ] Detects similar names for unrelated identifiers
- [ ] Flags conflicts for review

### D12.3: Implement Consistency Enforcement
- [ ] `src/turbo-v2/processors/consistency-enforcer.ts` exists
- [ ] Applies naming convention rules (camelCase)
- [ ] Applies prefix/suffix patterns
- [ ] No LLM calls (rule-based)

---

## Cross-Sprint Quality Gates

### After Sprint 4 (Gate 2)
- [ ] Crash test: Kill mid-pass, restart, verify 100% vault hits

### After Sprint 6 (Gates 3 & 4)
- [ ] Quality test: 2-pass ≥ 95% sequential quality
- [ ] Speed test: 5000 identifiers < 10 minutes

### After Sprint 8 (Gate 1)
- [ ] Resume test: Kill mid-pass, resume, no lost progress

---

## Final Acceptance

All sprints complete when:
- [ ] All 4 gates pass
- [ ] All unit tests pass
- [ ] Integration tests pass on all 3 canonical samples
- [ ] CLI fully functional with all options
- [ ] Documentation complete
- [ ] No critical bugs open

---

*Use this document to track progress and validate completeness.*
