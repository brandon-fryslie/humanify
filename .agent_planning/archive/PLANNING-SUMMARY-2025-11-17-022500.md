# Planning Summary: HumanifyJS Critical Bug Fixes

**Generated**: 2025-11-17 02:25:00
**Source STATUS**: STATUS-2025-11-17-021529.md
**Planning Docs**: PLAN-2025-11-17-022500.md
**Beads Issues**: brandon-fryslie_humanify-7dp, brandon-fryslie_humanify-e7c

---

## Overview

Two critical bugs in HumanifyJS have been identified, analyzed, and detailed implementation plans have been created. Both bugs are production-blocking and affect core functionality.

### Bug #1: Checkpoint Deletion Timing (CRITICAL - Data Loss Risk)
- **Issue ID**: brandon-fryslie_humanify-7dp
- **Severity**: CRITICAL
- **Location**: `src/plugins/local-llm-rename/visit-all-identifiers.ts:151-152`
- **Impact**: Complete data loss on any downstream failure after checkpoint deletion
- **Effort**: 15-21 hours (2-3 days)

### Bug #2: Refinement Hardcoded Filename (HIGH - Feature Broken)
- **Issue ID**: brandon-fryslie_humanify-e7c
- **Severity**: HIGH
- **Location**: `src/commands/openai.ts:249`
- **Impact**: Refinement feature completely broken for multi-file bundles
- **Effort**: 12-17 hours (1.5-2 days)

---

## Quick Reference

### Bug #1 Implementation Phases

| Phase | Goal | Effort | Files Modified |
|-------|------|--------|----------------|
| 1a | Modify plugin interface return type | 1-2h | `src/unminify.ts:21` |
| 1b | Update visitAllIdentifiers return type | 2-3h | `src/plugins/local-llm-rename/visit-all-identifiers.ts:151-155` |
| 1c | Update all rename plugins | 3-4h | 3 plugin files |
| 1d | Delete checkpoints after write | 3-4h | `src/unminify.ts:60,152-156,229-233,263` |
| 1e | Error handling & edge cases | 2-3h | `src/unminify.ts:259-266` |

**Total**: 15-21 hours

### Bug #2 Implementation Phases

| Phase | Goal | Effort | Files Modified |
|-------|------|--------|----------------|
| 2a | Discover actual output files | 2-3h | `src/commands/openai.ts:244-276` |
| 2b | Add skipWebcrack option | 2-3h | `src/unminify.ts:12-16,48-54` |
| 2c | Apply fix to Gemini command | 1-2h | `src/commands/gemini.ts` (verify only) |
| 2d | Verify Local command | 1h | `src/commands/local.ts` (verify only) |
| 2e | Fix validation for multi-file | 2-3h | `src/commands/openai.ts:301-320` |

**Total**: 12-17 hours

---

## Testing Strategy Summary

### Bug #1 Tests
1. **Unit Tests** (`src/checkpoint-deletion-timing.test.ts`):
   - Verify return type includes checkpointId
   - Checkpoint ID matches code hash

2. **E2E Tests** (`src/checkpoint-deletion-timing.e2etest.ts`):
   - Checkpoint persists if write fails
   - Checkpoint deleted after success
   - Resume works correctly

3. **Manual Tests**:
   - Kill process mid-run → checkpoint exists
   - Simulate write failure → checkpoint preserved
   - Normal completion → checkpoint deleted

### Bug #2 Tests
1. **E2E Tests** (`src/refinement-multifile.e2etest.ts`):
   - Multi-file bundle → all files refined
   - Single file → refinement works
   - Webcrack not run on pass 2

2. **Manual Tests**:
   - Real bundle (TensorFlow) → all files refined
   - Verify webcrack logs: once in pass 1, skipped in pass 2

---

## Acceptance Criteria Summary

### Bug #1 Must-Haves
✓ visitAllIdentifiers returns `{code, checkpointId}`
✓ All three plugins updated (openai, gemini, local)
✓ Checkpoint deleted AFTER write succeeds
✓ Write failures preserve checkpoints
✓ Existing tests pass
✓ New tests for write failures

### Bug #2 Must-Haves
✓ No hardcoded "deobfuscated.js"
✓ Discovers all .js files dynamically
✓ Handles nested directories
✓ Each file processed separately
✓ Webcrack not run on pass 2
✓ Validation checks all files

---

## Files Impacted

### Bug #1 Files (5 files)
1. `src/plugins/local-llm-rename/visit-all-identifiers.ts`
2. `src/plugins/openai/openai-rename.ts`
3. `src/plugins/gemini-rename.ts`
4. `src/plugins/local-llm-rename/local-llm-rename.ts`
5. `src/unminify.ts`

### Bug #2 Files (2 files + 2 verifications)
1. `src/commands/openai.ts`
2. `src/unminify.ts`
3. `src/commands/gemini.ts` (verify only - no --refine flag)
4. `src/commands/local.ts` (verify only - no --refine flag)

### New Test Files (4 files)
1. `src/checkpoint-deletion-timing.test.ts` (Bug #1 unit tests)
2. `src/checkpoint-deletion-timing.e2etest.ts` (Bug #1 e2e tests)
3. `src/refinement-multifile.e2etest.ts` (Bug #2 e2e tests)
4. Updates to existing checkpoint tests

---

## Risk & Mitigation

### Bug #1 Risks
- **Risk**: Breaking backward compatibility
- **Mitigation**: Support both string and object returns
- **Rollback**: Revert 5 files to original (simple)

### Bug #2 Risks
- **Risk**: Missing nested directories
- **Mitigation**: Recursive file discovery function
- **Rollback**: Revert to hardcoded filename (feature broken but stable)

### Overall Risk: LOW
- Well-scoped changes
- Clear boundaries
- Comprehensive test coverage
- Simple rollback paths

---

## Execution Timeline

### Recommended Schedule (5 days)

**Day 1** (Bug #1 - Foundation):
- Phase 1a: Plugin interface (1-2h)
- Phase 1b: visitAllIdentifiers (2-3h)
- Review and test: 2h

**Day 2** (Bug #1 - Plugins):
- Phase 1c: Update 3 plugins (3-4h)
- Phase 1d: unminify.ts changes (3-4h)

**Day 3** (Bug #1 - Complete):
- Phase 1e: Error handling (2-3h)
- Unit tests (2h)
- E2E tests (2h)
- Manual testing (1h)

**Day 4** (Bug #2 - Core):
- Phase 2a: File discovery (2-3h)
- Phase 2b: skipWebcrack (2-3h)
- Phase 2e: Validation (2-3h)

**Day 5** (Bug #2 - Complete):
- Phase 2c: Gemini verify (1h)
- Phase 2d: Local verify (1h)
- E2E tests (2h)
- Manual testing (2h)
- Final validation (2h)

---

## Success Criteria

### Technical Success
- [ ] All existing tests pass
- [ ] New tests pass
- [ ] Manual tests confirm fixes
- [ ] No performance regressions
- [ ] Clean code, good error handling

### User-Facing Success
- [ ] Checkpoint survives write failures
- [ ] Resume functionality works
- [ ] Refinement works with multi-file bundles
- [ ] Refinement works with single files
- [ ] Clear error messages guide users

### Documentation Success
- [ ] STATUS report updated to "FIXED"
- [ ] CLAUDE.md updated if needed
- [ ] Code comments explain changes
- [ ] Test files serve as examples

---

## Next Steps

1. **Immediate**: Review this planning summary with stakeholders
2. **Day 1 Start**: Begin Bug #1 implementation (data safety is highest priority)
3. **After Bug #1**: Begin Bug #2 implementation
4. **After Both**: Update STATUS report, run full test suite, deploy

---

## Questions for User

Before starting implementation:

1. **Priority Confirmation**: Is fixing Bug #1 (data loss) before Bug #2 (feature broken) the right order?

2. **Testing Requirements**: Are the proposed test suites sufficient, or do you need additional test scenarios?

3. **Nested Directories**: Bug #2 requires recursive file discovery for nested node_modules. Should this be Phase 2a or a separate follow-up issue?

4. **Gemini/Local Refinement**: Should we add --refine flag to gemini.ts and local.ts as part of Bug #2, or track as separate feature requests?

5. **Backward Compatibility**: Phase 1a maintains backward compatibility by supporting both string and object returns. Is this approach acceptable, or prefer a breaking change?

---

## References

- **Detailed Plan**: `.agent_planning/PLAN-2025-11-17-022500.md`
- **STATUS Report**: `.agent_planning/STATUS-2025-11-17-021529.md`
- **Beads Issues**:
  - Bug #1: `bd show brandon-fryslie_humanify-7dp`
  - Bug #2: `bd show brandon-fryslie_humanify-e7c`
- **Spec**: `CLAUDE.md`

---

**Ready to begin implementation upon approval.**
