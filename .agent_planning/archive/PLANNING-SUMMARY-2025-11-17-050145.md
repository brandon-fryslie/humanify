# PLANNING SUMMARY: Output Quality & Progress Tracking
**Generated**: 2025-11-17 05:01:45
**Full Plan**: PLAN-2025-11-17-050145.md
**Source STATUS**: STATUS-2025-11-17-115400.md

---

## THE CRITICAL QUESTION

**"Does the LLM actually provide semantic variable names?"**

User reports output still contains single-letter variables. We have ZERO evidence the core feature works. Before anything else, we must answer this question definitively.

---

## USER'S TOP CONCERNS (Prioritized)

1. **Output quality is poor** - Single-letter variables remain after processing
2. **No global progress tracking** - Can't tell overall progress or time remaining
3. **Refinement may be broken** - Might re-run on original instead of previous output
4. **Progress display is messy** - Flickering, overlapping, hard to read
5. **Checkpoints deleted too early** - ALREADY FIXED ✓

---

## WORK BREAKDOWN

### Must Do (P0) - 5 Items, ~40-50 hours

1. **brandon-fryslie_humanify-ui2**: Create diagnostic test to verify LLM works
   - **Effort**: 4-6 hours
   - **Why**: This is THE critical unknown. Must verify before anything else.
   - **Output**: YES/NO answer + diagnostic data

2. **brandon-fryslie_humanify-7kq**: Fix 4 turbo mode test failures
   - **Effort**: 1-2 hours
   - **Why**: Quick win to restore 100% test pass rate
   - **Output**: 231/231 tests passing

3. **brandon-fryslie_humanify-6lh**: Implement global progress tracking
   - **Effort**: 8-12 hours
   - **Why**: User explicitly requested, major UX issue
   - **Output**: Iteration tracking, global %, ETA

4. **brandon-fryslie_humanify-cpx**: Verify refinement uses previous output
   - **Effort**: 4-6 hours
   - **Why**: User concerned refinement may be broken
   - **Output**: Test proving refinement works correctly

5. **brandon-fryslie_humanify-40s**: Improve LLM prompts (conditional)
   - **Effort**: 6-8 hours
   - **Why**: Only if diagnostic test shows prompt is the issue
   - **Output**: <10% single-letter variables

### Should Do (P1) - 3 Items, ~33-46 hours

6. **brandon-fryslie_humanify-e7c**: Fix refinement hardcoded filename
   - **Effort**: 12-17 hours
   - **Why**: Refinement broken for bundled files
   - **Output**: Multi-file refinement works

7. **brandon-fryslie_humanify-7dp**: Fix checkpoint deletion timing
   - **Effort**: 15-21 hours
   - **Why**: Data loss risk if downstream failure
   - **Output**: Checkpoints persist until file write succeeds

8. **brandon-fryslie_humanify-8jo**: Fix progress display chaos
   - **Effort**: 6-8 hours
   - **Why**: Improves UX significantly
   - **Output**: Clean, non-flickering progress display

### Nice to Have (P2-P3) - 7 Items, ~20-30 hours

9-15. Various polish items (E2E tests, ETA calculation, edge case fixes)

---

## EXECUTION PLAN

### Week 1: "Does It Even Work?"

**Day 1**: Diagnostic Test
- Create comprehensive diagnostic test
- Run with OpenAI API key
- Get definitive YES/NO answer
- **Decision Point**: If NO, investigate root cause immediately

**Day 2**: Quick Fixes
- Fix 4 test failures (2 hours)
- If diagnostic showed prompt issue, improve prompts (6 hours)
- Re-run diagnostic to measure improvement

### Week 2: "Fix What's Broken"

**Days 3-5**: Refinement Fixes
- Fix hardcoded filename bug (2 days)
- Verify refinement uses previous output (0.5 day)
- Test with real bundles

### Week 3: "Make It Usable"

**Days 6-8**: Progress Tracking
- Fix progress display chaos (1 day)
- Implement global progress tracking (1.5 days)
- Test with large files

### Week 4: "Polish"

**Days 9-14**: Remaining P1 items
- Checkpoint deletion timing
- E2E verification test
- ETA calculation

---

## SUCCESS CRITERIA

**Minimum Viable Quality**:
- ✅ Diagnostic test runs and shows LLM provides semantic names
- ✅ Output has <10% single-letter variables (target: 0%)
- ✅ 100% test pass rate (231/231)
- ✅ Global progress shows before ANY API calls
- ✅ Refinement proven to use previous output

**Full Success**:
- ✅ All P0 and P1 items complete
- ✅ Output has <5% single-letter variables
- ✅ Clean progress display with iteration tracking
- ✅ Refinement works for multi-file bundles
- ✅ Comprehensive E2E test suite

---

## RISK FACTORS

**🔴 HIGH RISK**: Diagnostic test may show LLM doesn't work
- **Mitigation**: Try multiple models, increase context, improve prompts
- **Contingency**: May need post-processing heuristics or manual hints

**🟡 MEDIUM RISK**: Refinement may need major rework
- **Mitigation**: Break into phases, add tests first
- **Contingency**: Consider removing feature temporarily

**🟢 LOW RISK**: Global progress calculation may be slow
- **Mitigation**: Use lightweight parser, show "Analyzing..." progress
- **Contingency**: Estimate instead of calculate

---

## TIMELINE ESTIMATES

**Minimum (P0 only)**: 2-3 weeks (40-50 hours)
**Recommended (P0 + P1)**: 3-4 weeks (73-96 hours)
**Complete (All items)**: 4-6 weeks (93-126 hours)

---

## TRACKING

All work items tracked in beads system:
```bash
bd list --priority 0        # See P0 items
bd show brandon-fryslie_humanify-ui2  # View detailed design
bd stats                    # See overall progress
```

Full details in PLAN-2025-11-17-050145.md

---

**Status**: READY FOR IMPLEMENTATION
**First Action**: Run diagnostic test (brandon-fryslie_humanify-ui2)
**Critical Path**: Diagnostic → Prompts → Refinement → Progress → Polish
