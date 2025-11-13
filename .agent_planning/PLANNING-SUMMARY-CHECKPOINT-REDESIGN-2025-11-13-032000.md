# Checkpoint Redesign Planning Summary

**Date**: 2025-11-13 03:20:00
**Status Evaluated**: STATUS-CHECKPOINT-EVALUATION-2025-11-13-030745.md
**Implementation Plan**: PLAN-CHECKPOINT-REDESIGN-2025-11-13-032000.md
**Sprint 1 Plan**: SPRINT-CHECKPOINT-WEEK1-2025-11-13-032000.md

---

## Problem Statement

The HumanifyJS checkpoint system is fundamentally broken, causing:
- **Incorrect output**: Resume operates on wrong AST state
- **100% waste**: Failed work is not recovered, actually makes things worse
- **Financial impact**: Users waste ~$400/month on redundant API calls
- **Trust issues**: Silent failures, no user control

---

## Solution Overview

Redesign checkpoint system in 4 phases over 4 weeks:

1. **Phase 1 (Week 1)**: Stop the bleeding - fix critical correctness bugs
2. **Phase 2 (Week 2)**: Add determinism and robustness - make checkpoints reliable
3. **Phase 3 (Week 3)**: Improve UX - add management CLI and signal handlers
4. **Phase 4 (Week 4)**: Optimize - add compression and fine-grained progress tracking

---

## Critical Flaws Addressed

### P0 - Blocks Correct Operation
1. **AST state not preserved** → Store transformed code in checkpoint
2. **Renames map always empty** → Fix renamesHistory persistence bug
3. **Silent auto-resume** → Add interactive prompt requiring user consent

### P1 - Causes Money Waste
4. **Non-deterministic batching** → Make dependency graph fully deterministic
5. **Refine mode not tracked** → Track refine iteration in checkpoint
6. **No checkpoint validation** → Validate options/batch structure before resume

### P2 - UX Problems
7. **No checkpoint management** → Build `humanify checkpoints` CLI
8. **No signal handlers** → Save checkpoint on Ctrl+C / SIGTERM
9. **No salvage capability** → Extract partial work from invalid checkpoints

---

## Week 1 Sprint (Highest Priority)

**Goal**: Make checkpoints safe to use - produce correct output on resume

**Tasks**:
1. Add `--enable-checkpoints` flag (default: disabled)
2. Fix renames history persistence bug
3. Add interactive resume prompt (Y/n/inspect/delete)
4. Store transformed code in checkpoint

**Deliverable**: Working checkpoints that resume correctly (basic functionality)

**Effort**: 16 hours over 5 days

**Success Criteria**:
- Resume output matches continuous run (100% correctness)
- Checkpoint contains non-empty renames map
- User prompted for consent on resume
- Checkpoints disabled by default (safe)

---

## Work Item Summary

### Phase 1: Stop the Bleeding (Week 1, 16 hours)
- P0-1: Add safety flag and warning (2h)
- P0-2: Fix renames history persistence (4h)
- P0-3: Add interactive resume prompt (5h)
- P0-4: Store transformed code in checkpoint (5h)

### Phase 2: Determinism and Robustness (Week 2, 20 hours)
- P1-1: Make batching deterministic (8h)
- P1-2: Add refine iteration tracking (6h)
- P1-3: Comprehensive checkpoint validation (6h)

### Phase 3: User Experience (Week 3, 12 hours)
- P2-1: Add signal handlers for graceful interruption (4h)
- P2-2: Build checkpoint management CLI (6h)
- P2-3: Add rename salvage tool (2h)

### Phase 4: Polish and Optimization (Week 4, 12 hours)
- P3-1: Add checkpoint compression (3h)
- P3-2: Add checkpoint metadata and expiration (4h)
- P3-3: Add progress persistence within batches (5h)

### Testing and Documentation (Throughout, 28 hours)
- Unit tests (10h)
- E2E tests (8h)
- Integration tests (4h)
- Regression tests (2h)
- Documentation updates (4h)

**Total Effort**: 88 hours (~3-4 weeks full-time, 5-6 weeks part-time)

---

## Key Decisions

### Design Decisions

1. **Store transformed code, not renames replay**
   - Rationale: Replay on fresh AST is complex and error-prone (as seen in current system)
   - Trade-off: Larger checkpoint files (mitigated by compression)
   - Benefit: Guaranteed correctness on resume

2. **Checkpoints disabled by default**
   - Rationale: Current system is broken, better safe than sorry
   - Requires opt-in: `--enable-checkpoints`
   - Can enable by default after Phase 2 (deterministic batching)

3. **Interactive prompt for resume**
   - Rationale: User should consent to resume, not be surprised
   - Alternatives: `--no-interactive` for CI, `--fresh-start` to skip
   - Benefit: User control and visibility

4. **Separate checkpoint per refine iteration**
   - Rationale: Refine uses different input file, needs separate state
   - Checkpoint ID: `<hash>` for pass 1, `<hash>-refine1` for pass 2
   - Benefit: Can resume mid-refine

5. **Deterministic batching via explicit sorting**
   - Rationale: Current merge heuristics are non-deterministic
   - Solution: Secondary sort by name, integer-only math, explicit tie-breaking
   - Benefit: Same input → same batches → checkpoints never rejected

### Technology Decisions

1. **Use Node.js built-in modules only**
   - `readline` for prompts
   - `zlib` for compression
   - `crypto` for hashing
   - No new dependencies needed

2. **Checkpoint format: JSON**
   - Human-readable, easy to inspect
   - Standard library support
   - Can add compression without changing format

3. **Checkpoint location: `.humanify-checkpoints/`**
   - Keep existing directory (user familiarity)
   - Add subdirectories: `archive/`, `invalid/`

---

## Migration Plan

### Handling Existing Checkpoints

**Problem**: v1.0.0 checkpoints are broken and incompatible

**Solution**:
1. On first run with new code, detect v1.0.0 checkpoints
2. Prompt: "Found old checkpoint format. [D]elete or [K]eep for reference?"
3. If delete: Remove checkpoint
4. If keep: Move to `.humanify-checkpoints/archive/v1.0.0/`
5. Start fresh with v2.0.0 checkpoint

### Version Compatibility

| Version | Compatible With | Breaking Changes |
|---------|----------------|------------------|
| v1.0.0 | NONE | Broken, must delete |
| v2.0.0 | v2.0.0+ | Added: transformedCode, batchStructureHash, optionsHash |
| v2.1.0 | v2.1.0+ | Added: refineIteration, originalCommand (backward compatible) |

---

## Testing Strategy

### Unit Tests (10 hours)
- Checkpoint I/O (save/load/delete)
- Renames persistence
- Compression/decompression
- Validation logic
- Deterministic batching

### E2E Tests (8 hours)
- Resume from 25%, 50%, 75% → verify correctness
- Resume after SIGINT
- Batch count mismatch → checkpoint rejected
- Refine mode resume
- Salvage partial work

### Integration Tests (4 hours)
- Real-world files (TensorFlow.js, Babylon.js)
- Kill and resume at various points
- Change input → verify rejection
- Change options → verify rejection

### Regression Tests (2 hours)
- All existing tests still pass
- Turbo mode works
- Chunking works
- All providers work

---

## Success Metrics

### Correctness
- [ ] Resume output matches continuous run (100% accuracy)
- [ ] No duplicate API calls on resume
- [ ] No missing renames on resume

### Reliability
- [ ] 0% checkpoint rejection rate on identical input (deterministic)
- [ ] 100% checkpoint save success rate
- [ ] 100% checkpoint validation accuracy

### Cost Savings
- [ ] Failed runs that resume successfully: 100% (vs 0% current)
- [ ] API call savings per resume: 50-90%
- [ ] Estimated monthly savings: $400 (vs $400 wasted currently)

### User Experience
- [ ] User prompted on resume: 100% of cases
- [ ] Clear error messages: 100% of invalid checkpoints
- [ ] Checkpoint management CLI: All commands functional

---

## Risks and Mitigation

### Development Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Resume output doesn't match | HIGH | E2E tests verify byte-for-byte correctness |
| Checkpoint files too large | MEDIUM | Add compression (Phase 4) |
| Prompt UX confusing | LOW | User testing, iterate on messaging |
| CI workflows break | LOW | `--no-interactive` flag, test in CI |
| New edge cases discovered | MEDIUM | Phased approach allows iteration |

### Business Risks

| Risk | Severity | Impact |
|------|----------|--------|
| Users waste money on bad resumes | HIGH | $400/month lost (current state) |
| Silent incorrect output | CRITICAL | Trust loss (current state) |
| Development takes 88 hours | MEDIUM | 2.3 year payback, but worth it for correctness |

**Net Risk**: Risk of NOT fixing >> Risk of fixing

---

## ROI Analysis

### Pure API Cost Savings
- Development cost: 88h × $125/h = $11,000
- Monthly savings: $400
- Payback period: 27.5 months (~2.3 years)
- 12-month ROI: -56% (loses $6,200 in first year)

### Including Intangible Benefits
- User trust: Invaluable (correct output vs broken output)
- User time saved: Hours per failed run
- Support burden reduced: Fewer "why is output wrong?" tickets
- Feature parity: Other tools have working checkpoints
- Long-term value: Fixed once, benefits forever

**Recommendation**: Proceed anyway due to correctness being critical

---

## Open Questions

### For Week 1
- [x] Should checkpoints be disabled by default? **YES**
- [x] What should interactive prompt look like? **Defined in plan**
- [x] How to handle large checkpoint files? **Defer compression to Week 4**

### For Week 2+
- [ ] Which CLI options invalidate checkpoints? (Need to determine)
- [ ] How often to save checkpoints within batch? (Frequency setting)
- [ ] Should we support migrating v1.0.0 checkpoints? (Probably not, they're empty)

### For Testing
- [ ] What's acceptable threshold for checkpoint file size? (Suggest <10x input file)
- [ ] What providers to test with? (OpenAI primary, others secondary)
- [ ] What test files to use? (Small sample for unit tests, real-world for integration)

---

## Dependencies

### External (Already in package.json)
- `@babel/core` - AST manipulation
- `@babel/traverse` - AST traversal
- `@babel/parser` - Code parsing
- `crypto` (Node.js built-in) - Hashing
- `zlib` (Node.js built-in) - Compression
- `readline` (Node.js built-in) - User prompts

### Internal (No changes needed)
- Build system: pkgroll (no changes)
- Test system: Node.js test runner (no changes)
- CLI framework: commander (no changes)

---

## Documentation Updates

### Files to Update

1. **CLAUDE.md** (Project instructions)
   - Document checkpoint system status
   - Add checkpoint management commands
   - Update testing instructions

2. **README.md** (User-facing)
   - Document `--enable-checkpoints` flag
   - Add checkpoint CLI commands
   - Add troubleshooting section

3. **CHECKPOINT-FEATURE.md** (Technical)
   - Update with v2.0.0 architecture
   - Document validation rules
   - Add migration guide

4. **CLI Help Text**
   - Update `--help` for checkpoint flags
   - Add examples

---

## Timeline

### Week 1 (Nov 13-17): Stop the Bleeding
- **Days 1-2**: Safety flag + Fix renames persistence (6h)
- **Days 3-4**: Interactive prompt + Store transformed code (9h)
- **Day 5**: Integration testing and bug fixes (1h buffer)
- **Deliverable**: Checkpoints that produce correct output

### Week 2 (Nov 18-24): Determinism
- **Days 1-2**: Make batching deterministic (8h)
- **Day 3**: Refine iteration tracking (6h)
- **Days 4-5**: Checkpoint validation (6h)
- **Deliverable**: Reliable checkpoints that never get rejected incorrectly

### Week 3 (Nov 25-Dec 1): User Experience
- **Day 1**: Signal handlers (4h)
- **Days 2-3**: Checkpoint management CLI (6h)
- **Day 4**: Rename salvage tool (2h)
- **Deliverable**: Full checkpoint management and control

### Week 4 (Dec 2-8): Polish
- **Day 1**: Checkpoint compression (3h)
- **Day 2**: Metadata and expiration (4h)
- **Day 3**: Progress persistence within batches (5h)
- **Deliverable**: Optimized checkpoint system

### Week 5 (Dec 9-15): Testing and Documentation
- **Days 1-2**: Comprehensive unit and e2e tests (6h)
- **Day 3**: Documentation updates (2h)
- **Deliverable**: Production-ready checkpoint system

**Total**: 5 weeks (part-time), 88 hours

---

## Next Actions

### Immediate (Today)
1. Review this planning summary with stakeholders
2. Confirm approach and priorities
3. Set up development branch: `feat/checkpoint-redesign-v2`
4. Begin Week 1 Task 1: Add safety flag

### Week 1 Focus
- **Primary goal**: Correctness - resume produces right output
- **Secondary goal**: Safety - checkpoints disabled by default
- **Success metric**: E2E test passes showing correct resume

### Week 2+ Planning
- Schedule checkpoint validation design review
- Determine which CLI options invalidate checkpoints
- Plan beta testing with real users

---

## Conclusion

This plan transforms the checkpoint system from fundamentally broken to production-ready over 4-5 weeks. The phased approach allows shipping incremental value:

- **After Week 1**: Checkpoints work correctly (users can opt-in)
- **After Week 2**: Checkpoints are reliable (consider enabling by default)
- **After Week 3**: Full user experience (management CLI, signal handlers)
- **After Week 4**: Optimized (compression, fine-grained progress)

**Key Success Factors**:
1. Correctness first - Week 1 is all about producing right output
2. User control - Interactive prompts, no surprises
3. Determinism - Same input → same batches
4. Validation - Detect incompatible checkpoints early
5. Testing - Comprehensive test suite for resume scenarios

**Bottom Line**: Broken checkpoints waste money and produce wrong output. This plan fixes both problems while giving users visibility and control.

