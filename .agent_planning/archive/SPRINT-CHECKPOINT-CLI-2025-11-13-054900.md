# Sprint: Checkpoint CLI Integration

**Sprint Duration**: 2 working days (14 hours)
**Sprint Goal**: Make checkpoint feature accessible and production-ready
**Sprint Start**: 2025-11-13
**Sprint End**: 2025-11-15 (estimated)
**Source Plan**: PLAN-CHECKPOINT-CLI-2025-11-13-054900.md
**Source Status**: STATUS-2025-11-13-054800.md

---

## Sprint Overview

**Problem**: Checkpoint system works perfectly but is invisible to users. Core functionality is 100% operational, but lacks user-facing controls.

**Solution**: Add interactive prompts, signal handlers, CLI flags, and documentation to make feature accessible.

**Success Criteria**:
- Users can control checkpoint behavior
- Ctrl+C saves progress
- Feature is documented
- All manual tests pass

---

## Sprint Backlog (Priority Order)

### Day 1 (8 hours)

#### Morning (4 hours)

**[P1] Interactive Resume Prompt** (3 hours)
- **Goal**: Give users control over checkpoint resume
- **Files**: src/commands/{openai,gemini,local}.ts
- **Tasks**:
  1. Add readline import and prompt function (30 min)
  2. Implement prompt logic in OpenAI command (1h)
  3. Copy to Gemini and Local commands (30 min)
  4. Handle edge cases (corrupted checkpoint, invalid input) (30 min)
  5. Quick manual test with valid-output.js (30 min)
- **Output**: Working interactive prompt in all 3 providers
- **Test**: Run with existing checkpoint, verify choices work

**Break** (1 hour lunch)

#### Afternoon (4 hours)

**[P1] Signal Handlers** (4 hours)
- **Goal**: Save checkpoint on Ctrl+C
- **Files**: src/commands/{openai,gemini,local}.ts, visit-all-identifiers.ts
- **Tasks**:
  1. Add signal handler setup in OpenAI command (1h)
  2. Add shutdown flag to visitAllIdentifiers options (30 min)
  3. Modify batch loop to check shutdown flag (1h)
  4. Copy to Gemini and Local commands (30 min)
  5. Test Ctrl+C behavior manually (1h)
- **Output**: Ctrl+C saves checkpoint before exit
- **Test**: Interrupt run, verify checkpoint saved and resumable

**End of Day 1**: 7 hours work, core UX features complete

---

### Day 2 (6 hours)

#### Morning (4 hours)

**[P1] CLI Flags** (2 hours)
- **Goal**: Allow users to configure checkpoint behavior
- **Files**: src/commands/{openai,gemini,local}.ts, checkpoint.ts
- **Tasks**:
  1. Add flags to OpenAI command definition (30 min)
  2. Add flag validation logic (30 min)
  3. Add setCheckpointDirectory to checkpoint.ts (15 min)
  4. Copy flags to Gemini and Local commands (30 min)
  5. Test each flag manually (15 min)
- **Output**: Working CLI flags for checkpoint control
- **Test**: Verify --disable, --enable, --auto-resume, --checkpoint-dir

**[P1] Documentation** (2 hours)
- **Goal**: Users know feature exists and how to use it
- **Files**: CLAUDE.md, README.md
- **Tasks**:
  1. Add "Checkpoint System" section to CLAUDE.md (1h)
  2. Update README.md features list (15 min)
  3. Add usage examples to README (30 min)
  4. Verify all examples work (15 min)
- **Output**: Complete documentation with working examples
- **Test**: Run all code examples, verify they work

**Break** (1 hour lunch)

#### Afternoon (2 hours)

**[P1] Manual CLI Testing** (2 hours)
- **Goal**: Verify integrated system works correctly
- **Files**: N/A (manual testing)
- **Tasks**:
  1. Run all 7 test scenarios (1h 30min)
  2. Fix any issues found (30 min contingency)
  3. Document any edge cases discovered
- **Output**: Confidence that system works end-to-end
- **Test Scenarios**:
  - Fresh run (no checkpoint)
  - Interrupted + resumed
  - Inspect checkpoint
  - Delete checkpoint
  - Start fresh (ignore checkpoint)
  - Ctrl+C saves checkpoint
  - Disabled checkpoints

---

### Final Hour (Sign-Off)

**[P1] Final Sign-Off** (1 hour)
- **Goal**: Verify production-readiness
- **Files**: N/A (checklist review)
- **Tasks**:
  1. Run full test suite (15 min)
  2. Review all checklists (30 min)
  3. Make go/no-go decision (15 min)
- **Output**: Production-ready feature or identified blockers
- **Decision**: GO → ship, NO-GO → identify remaining work

**Total Sprint Time**: 14 hours over 2 days

---

## Daily Breakdown

### Day 1: Core UX Features

**Focus**: User control and safety
**Hours**: 7h work + 1h break = 8h total
**Deliverables**:
- ✅ Interactive prompt working
- ✅ Signal handlers working
- ✅ Ctrl+C saves progress
- ✅ Users have control

**End-of-Day Demo**:
```bash
# Start processing
humanify unminify large.js --turbo

# Press Ctrl+C after 50%
# Should see: "Interrupt received, saving checkpoint..."

# Resume
humanify unminify large.js --turbo
# Should see prompt with options: Y/n/inspect/delete
# Press Y
# Should resume from 50%
```

### Day 2: Configuration & Polish

**Focus**: Flexibility and documentation
**Hours**: 5h work + 1h break = 6h total
**Deliverables**:
- ✅ CLI flags working
- ✅ Documentation complete
- ✅ All manual tests pass
- ✅ Production-ready

**End-of-Day Demo**:
```bash
# Show help
humanify unminify --help
# Should show checkpoint flags

# Auto-resume
humanify unminify large.js --turbo --auto-resume

# Disable
humanify unminify large.js --turbo --disable-checkpoints
```

---

## Risk Management

### Risks & Mitigations

**Risk 1**: Signal handler doesn't work reliably
- **Impact**: HIGH (data loss)
- **Likelihood**: MEDIUM
- **Mitigation**: Extensive manual testing, test on different file sizes
- **Contingency**: Add warning that Ctrl+C may not save (better than nothing)

**Risk 2**: Readline blocks in CI/CD
- **Impact**: HIGH (breaks automation)
- **Likelihood**: HIGH
- **Mitigation**: Add --auto-resume flag (already planned)
- **Contingency**: Document workaround for CI/CD

**Risk 3**: Manual testing reveals major issues
- **Impact**: HIGH (delays ship)
- **Likelihood**: MEDIUM
- **Mitigation**: Test early and often during development
- **Contingency**: Use buffer time (8 hours) to fix issues

**Risk 4**: Documentation takes longer than expected
- **Impact**: MEDIUM (can ship without perfect docs)
- **Likelihood**: LOW
- **Mitigation**: Keep docs simple and focused
- **Contingency**: Ship with minimal docs, improve later

---

## Definition of Done

### Work Item is "Done" when:

- [ ] Code implemented and working
- [ ] Unit tests pass (if applicable)
- [ ] Manual testing successful
- [ ] Edge cases handled
- [ ] Error messages clear
- [ ] Code committed with descriptive message

### Sprint is "Done" when:

- [ ] All 6 work items complete
- [ ] All unit tests pass (51/51)
- [ ] All e2e tests pass (8/8)
- [ ] All 7 manual test scenarios pass
- [ ] Documentation complete and accurate
- [ ] Sign-off checklist complete
- [ ] No known critical bugs

---

## Testing Strategy

### Unit Tests (Automated)

**Run after each change**:
```bash
npm run test:unit
```

**Expected**: 51/51 passing (including new tests)

### E2E Tests (Automated)

**Run after major changes**:
```bash
npm run test:e2e
```

**Expected**: 8/8 passing (checkpoint-resume.e2etest.ts)

### Manual Tests (Human)

**Run at end of each day**:
- Scenario 1-7 from plan
- Test on multiple file sizes
- Test all 3 providers

**Expected**: All scenarios work smoothly

---

## Dependencies

### External Dependencies

- **None** - all work is internal to codebase

### Internal Dependencies

```
P1-1 (Prompt) ──┐
                ├──> P1-5 (Testing) ──> P1-6 (Sign-off)
P1-2 (Signals) ─┤          ▲
                │          │
P1-3 (Flags) ───┴──────────┤
                           │
P1-4 (Docs) ───────────────┘
```

**Critical Path**: P1-1 → P1-2 → P1-3 → P1-4 → P1-5 → P1-6

**Blockers**: None (all work can start immediately)

---

## Success Metrics

### Completion Metrics

- [ ] 6/6 work items complete
- [ ] 51/51 unit tests pass
- [ ] 8/8 e2e tests pass
- [ ] 7/7 manual scenarios pass
- [ ] Sign-off checklist complete

### Quality Metrics

- **Test Coverage**: >80% for checkpoint code
- **Performance**: <5% overhead vs no checkpoints
- **Error Rate**: 0 (no confusing errors or crashes)
- **User Satisfaction**: Smooth UX, clear messages

### Timeline Metrics

- **Day 1 Target**: 7 hours (P1-1 + P1-2)
- **Day 2 Target**: 7 hours (P1-3 + P1-4 + P1-5 + P1-6)
- **Total Target**: 14 hours
- **Buffer**: 8 hours (built into estimates)

---

## Communication Plan

### Daily Check-ins

**End of Day 1**:
- Demo interactive prompt and signal handlers
- Report any blockers or issues
- Adjust Day 2 plan if needed

**End of Day 2**:
- Demo complete feature
- Review sign-off checklist
- Make go/no-go decision

### Escalation

**If blocked**:
1. Document blocker clearly
2. Identify workarounds
3. Adjust timeline if needed
4. Communicate impact

---

## Rollback Plan

### If Sprint Fails

**Revert to**: Previous state (checkpoints work but are hidden)
**Impact**: No user-facing changes
**Cost**: $2,750 wasted

**Partial Ship Options**:
1. Ship P1-1 only (prompt) - gives some visibility
2. Ship P1-1 + P1-2 (prompt + signals) - core safety
3. Ship P1-1 + P1-2 + P1-4 (add docs) - minimal viable

**Decision Criteria**:
- If 0-1 items complete: Don't ship
- If 2-3 items complete: Consider partial ship
- If 4+ items complete: Ship with known gaps
- If all 6 complete: Full ship

---

## Post-Sprint Actions

### Immediate (After Ship)

- [ ] Update release notes
- [ ] Announce feature to users
- [ ] Monitor for bug reports
- [ ] Track usage metrics

### Short-Term (Next Week)

- [ ] Collect user feedback
- [ ] Fix any reported bugs
- [ ] Improve docs based on questions
- [ ] Consider P2 features

### Long-Term (Next Month)

- [ ] Measure actual cost savings
- [ ] Evaluate ROI
- [ ] Decide on P2 implementation
- [ ] Plan improvements based on usage

---

## Appendix: Quick Reference

### Commands for Testing

**Fresh run**:
```bash
rm -rf .humanify-checkpoints/
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
```

**Interrupted run**:
```bash
# Start and Ctrl+C after 50%
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js

# Resume
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
```

**Inspect**:
```bash
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
# Type: inspect
```

**Delete**:
```bash
humanify unminify test-samples/valid-output.js --turbo --provider openai -o output.js
# Type: delete
```

**Disabled**:
```bash
humanify unminify test-samples/valid-output.js --turbo --provider openai --disable-checkpoints -o output.js
```

**Auto-resume**:
```bash
humanify unminify test-samples/valid-output.js --turbo --provider openai --auto-resume -o output.js
```

### Files to Modify Summary

**Day 1**:
- src/commands/openai.ts
- src/commands/gemini.ts
- src/commands/local.ts
- src/plugins/local-llm-rename/visit-all-identifiers.ts

**Day 2**:
- Same command files (add flags)
- src/checkpoint.ts (add setCheckpointDirectory)
- CLAUDE.md (add section)
- README.md (update features)

### Test Commands Summary

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# All tests
npm test

# Specific test file
tsx --test src/checkpoint.test.ts

# Lint
npm run lint
```

---

**Sprint Status**: Ready to Start
**Estimated Duration**: 14 hours (2 days)
**Risk Level**: LOW (core works, adding UX)
**Next Action**: Begin P1-1 (Interactive Resume Prompt)
