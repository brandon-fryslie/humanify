# Checkpoint Redesign Backlog

**Generated**: 2025-11-13 03:20:00
**Status Source**: STATUS-CHECKPOINT-EVALUATION-2025-11-13-030745.md
**Full Plan**: PLAN-CHECKPOINT-REDESIGN-2025-11-13-032000.md

---

## Quick Reference

**Total Work Items**: 13 (4 P0, 3 P1, 3 P2, 3 P3)
**Total Effort**: 88 hours (60 implementation + 28 testing/docs)
**Timeline**: 4-5 weeks
**Current Focus**: Phase 1 (Week 1) - Stop the Bleeding

---

## P0 - Critical Correctness Issues (16 hours)

### P0-1: Add Safety Flag and Warning
- **Effort**: 2 hours
- **Status**: Not Started
- **Goal**: Disable checkpoints by default until fixed
- **Files**: `src/cli.ts`, `src/commands/*.ts`

### P0-2: Fix Renames History Persistence
- **Effort**: 4 hours
- **Status**: Not Started
- **Goal**: Fix bug where checkpoint.renames is always empty
- **Files**: `src/plugins/local-llm-rename/visit-all-identifiers.ts`

### P0-3: Add Interactive Resume Prompt
- **Effort**: 5 hours
- **Status**: Not Started
- **Goal**: User consent for resume (Y/n/inspect/delete)
- **Files**: `src/checkpoint-prompt.ts` (new), `visit-all-identifiers.ts`

### P0-4: Store Transformed Code in Checkpoint
- **Effort**: 5 hours
- **Status**: Not Started
- **Goal**: Resume on correct AST state (not original code)
- **Files**: `visit-all-identifiers.ts`, `checkpoint.ts`

---

## P1 - Reliability Issues (20 hours)

### P1-1: Make Batching Deterministic
- **Effort**: 8 hours
- **Status**: Not Started
- **Goal**: Same input → same batches (no checkpoint rejection)
- **Files**: `dependency-graph.ts`, `visit-all-identifiers.ts`

### P1-2: Add Refine Iteration Tracking
- **Effort**: 6 hours
- **Status**: Not Started
- **Goal**: Track which pass (initial/refine), preserve state
- **Files**: `checkpoint.ts`, all `commands/*.ts`

### P1-3: Comprehensive Checkpoint Validation
- **Effort**: 6 hours
- **Status**: Not Started
- **Goal**: Validate options/batch structure before resume
- **Files**: `checkpoint.ts`, `visit-all-identifiers.ts`

---

## P2 - User Experience (12 hours)

### P2-1: Add Signal Handlers
- **Effort**: 4 hours
- **Status**: Not Started
- **Goal**: Save checkpoint on Ctrl+C / SIGTERM
- **Files**: `visit-all-identifiers.ts`

### P2-2: Build Checkpoint Management CLI
- **Effort**: 6 hours
- **Status**: Not Started
- **Goal**: `humanify checkpoints list/show/delete/clean`
- **Files**: `src/commands/checkpoints.ts` (new), `cli.ts`

### P2-3: Add Rename Salvage Tool
- **Effort**: 2 hours
- **Status**: Not Started
- **Goal**: Extract valid renames from broken checkpoints
- **Files**: `src/commands/checkpoints.ts`

---

## P3 - Polish and Optimization (12 hours)

### P3-1: Add Checkpoint Compression
- **Effort**: 3 hours
- **Status**: Not Started
- **Goal**: Gzip transformed code to save disk space
- **Files**: `checkpoint.ts`

### P3-2: Add Metadata and Expiration
- **Effort**: 4 hours
- **Status**: Not Started
- **Goal**: Store filename/CLI args, auto-delete old checkpoints
- **Files**: `checkpoint.ts`, `cli.ts`

### P3-3: Progress Persistence Within Batches
- **Effort**: 5 hours
- **Status**: Not Started
- **Goal**: Save checkpoint every N renames (not just batch boundaries)
- **Files**: `visit-all-identifiers.ts`

---

## Testing and Documentation (28 hours)

### Unit Tests (10 hours)
- Checkpoint I/O tests
- Renames persistence tests
- Deterministic batching tests
- Validation logic tests

### E2E Tests (8 hours)
- Resume correctness tests (25%, 50%, 75%)
- SIGINT handling test
- Refine mode resume test
- Salvage tool test

### Integration Tests (4 hours)
- Real-world files (TensorFlow.js, Babylon.js)
- Cross-provider testing
- Chunking + checkpoint interaction

### Regression Tests (2 hours)
- Verify all existing tests still pass
- Verify turbo mode works
- Verify chunking works

### Documentation (4 hours)
- Update CLAUDE.md
- Update README.md
- Update CHECKPOINT-FEATURE.md
- Update CLI help text

---

## Dependency Graph

```
P0-1 (Safety Flag)
  ↓
P0-2 (Fix Renames) → P0-3 (Interactive Prompt) → P0-4 (Transformed Code)
  ↓                     ↓                              ↓
  └───────────────────→ P1-1 (Deterministic Batching) ←┘
                         ↓
                        P1-2 (Refine Tracking)
                         ↓
                        P1-3 (Validation)
                         ↓
         ┌───────────────┼───────────────┐
         ↓               ↓               ↓
    P2-1 (Signals)  P2-2 (CLI)     P3-1 (Compression)
         ↓               ↓               ↓
         └───────→  P2-3 (Salvage) ←────┘
                         ↓
         ┌───────────────┴───────────────┐
         ↓                               ↓
    P3-2 (Metadata)              P3-3 (Fine-grained)
```

---

## Weekly Breakdown

### Week 1: Stop the Bleeding (16h)
**Goal**: Checkpoints produce correct output
- P0-1: Safety flag (2h)
- P0-2: Fix renames (4h)
- P0-3: Interactive prompt (5h)
- P0-4: Transformed code (5h)

**Success**: Resume output matches continuous run

---

### Week 2: Determinism (20h)
**Goal**: Checkpoints never rejected incorrectly
- P1-1: Deterministic batching (8h)
- P1-2: Refine tracking (6h)
- P1-3: Validation (6h)

**Success**: Same input → same batches, always

---

### Week 3: User Experience (12h)
**Goal**: User control and visibility
- P2-1: Signal handlers (4h)
- P2-2: Management CLI (6h)
- P2-3: Salvage tool (2h)

**Success**: Full checkpoint management capability

---

### Week 4: Polish (12h)
**Goal**: Optimized and production-ready
- P3-1: Compression (3h)
- P3-2: Metadata/expiration (4h)
- P3-3: Fine-grained progress (5h)

**Success**: Minimal overhead, production quality

---

### Week 5: Testing (28h)
**Goal**: Comprehensive coverage
- Unit tests (10h)
- E2E tests (8h)
- Integration tests (4h)
- Regression tests (2h)
- Documentation (4h)

**Success**: All tests pass, docs complete

---

## Progress Tracking

**Completed**: 0 / 13 work items (0%)
**In Progress**: 0 / 13 work items
**Not Started**: 13 / 13 work items (100%)

**Phase 1 (P0)**: 0 / 4 complete
**Phase 2 (P1)**: 0 / 3 complete
**Phase 3 (P2)**: 0 / 3 complete
**Phase 4 (P3)**: 0 / 3 complete

---

## File Inventory

### Files to Modify
1. `src/checkpoint.ts` - Enhanced interface, validation, compression
2. `src/plugins/local-llm-rename/visit-all-identifiers.ts` - Resume logic, signal handlers
3. `src/plugins/local-llm-rename/dependency-graph.ts` - Deterministic sorting
4. `src/cli.ts` - New flags (enable-checkpoints, no-interactive, etc.)
5. `src/commands/openai.ts` - Checkpoint flag check
6. `src/commands/gemini.ts` - Checkpoint flag check
7. `src/commands/local.ts` - Checkpoint flag check

### Files to Create
1. `src/checkpoint-prompt.ts` - Interactive resume prompt
2. `src/commands/checkpoints.ts` - Checkpoint management CLI
3. `src/checkpoint.test.ts` - Unit tests
4. `src/checkpoint-resume.e2etest.ts` - E2E tests

**Total**: 11 files (7 modified, 4 new)

---

## Cost-Benefit Summary

### Current State (Broken)
- Failed runs: 20/month
- Cost per failed run: $20 (wasted)
- **Total waste**: $400/month

### After Fix
- Failed runs: 20/month
- Cost per failed run: $0 (resume works)
- **Total savings**: $400/month

### Development Cost
- 88 hours × $125/hour = $11,000
- Payback: 27.5 months (~2.3 years)
- **12-month ROI**: -56%

### Intangible Benefits
- Correct output (vs broken output)
- User trust (vs frustration)
- Reduced support burden
- Feature parity with competitors

**Recommendation**: Proceed for correctness, not just cost savings

---

## Risk Summary

### High-Risk Items
1. P0-4: Resume output must match continuous run exactly
2. P1-1: Deterministic batching is complex, many edge cases
3. P1-3: Validation must catch all incompatibilities

### Mitigation
- Comprehensive E2E testing
- Phased rollout (P0 first, P1-P3 later)
- Beta testing with real users
- Feature flag for gradual rollout

### Success Criteria
- 100% resume correctness
- 0% false checkpoint rejection
- All existing tests pass (no regressions)

---

## Next Actions

1. **Today**: Review plan, confirm approach
2. **Week 1 Day 1**: Begin P0-1 (safety flag)
3. **Week 1 Day 2**: Complete P0-2 (fix renames)
4. **Week 1 Day 3-4**: Complete P0-3, P0-4
5. **Week 1 Day 5**: Integration testing

**First PR**: After Week 1 (P0 items only)
**Second PR**: After Week 2 (P1 items)
**Third PR**: After Week 3 (P2 items)
**Fourth PR**: After Week 4 (P3 items + docs)

---

## Questions for Stakeholders

1. **Phasing**: Ship after Week 1 (basic functionality) or wait for Week 2 (reliability)?
2. **Default**: Keep checkpoints disabled by default until when?
3. **Testing**: What real-world files should we test with?
4. **ROI**: Proceed despite 2.3 year payback?
5. **Scope**: Any features to add/cut from this plan?

---

## Related Documents

- **Full Implementation Plan**: PLAN-CHECKPOINT-REDESIGN-2025-11-13-032000.md
- **Week 1 Sprint Plan**: SPRINT-CHECKPOINT-WEEK1-2025-11-13-032000.md
- **Planning Summary**: PLANNING-SUMMARY-CHECKPOINT-REDESIGN-2025-11-13-032000.md
- **Evaluation Report**: STATUS-CHECKPOINT-EVALUATION-2025-11-13-030745.md

