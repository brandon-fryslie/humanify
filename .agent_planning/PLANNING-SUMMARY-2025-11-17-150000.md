# PLANNING SUMMARY: Global Progress Tracking Implementation

**Generated**: 2025-11-17 15:00:00
**Full Plan**: PLAN-2025-11-17-150000.md
**Source STATUS**: STATUS-2025-11-17-115400.md

---

## QUICK OVERVIEW

### What We're Building

A comprehensive progress tracking system that:
1. **Estimates total work upfront** (before any API calls)
2. **Displays iteration number** with color coding (Iteration 1=yellow, 2+=blue)
3. **Shows global progress bar** (0-100% across ALL files, chunks, iterations)
4. **Shows per-batch progress** without overlap or flicker
5. **Uses color** to highlight important information

### Why We're Building It

User complaints from PROJECT_SPEC.md:
- "Calculate this for the entire codebase BEFORE sending ANY requests to the OpenAI API"
- "There is no indication whatsoever how much progress we are making through the actual application as a whole"
- "progress output is passable but still pretty bad. it continually flickers between 'Processing...' with a progress bar"
- "Use color to draw attention to important information"

STATUS report confirms:
- ✅ Refinement chaining works correctly
- ❌ Global progress tracking NOT IMPLEMENTED
- ❌ Upfront work estimation MISSING
- ❌ Iteration display NOT IMPLEMENTED
- ⚠️ Progress bars overlap and flicker

---

## IMPLEMENTATION PHASES

### Phase 1: Work Estimation (3-4 hours)

**Goal**: Calculate total work before any API calls

**Key Deliverables**:
- New module: `src/estimate-work.ts`
- New test: `src/estimate-work.test.ts`
- CLI flag: `--estimate-only`

**What It Does**:
1. Runs webcrack to discover files
2. Parses ASTs to count identifiers
3. Estimates batches (based on turbo mode settings)
4. Calculates total API calls across all iterations

**Output Example**:
```
Work Estimate:
  Files: 3
  Total Identifiers: 1,247
  Estimated Batches: 42
  Estimated API Calls: 1,247 (pass 1) + 1,247 (refinement) = 2,494
  Estimated Cost: ~$0.50 (assuming gpt-4o-mini)
```

### Phase 2: Global Progress Tracker (4-5 hours)

**Goal**: Track progress across all files and iterations

**Key Deliverables**:
- New module: `src/global-progress.ts`
- New test: `src/global-progress.test.ts`
- Integration with `unminify.ts`, `visit-all-identifiers.ts`

**What It Does**:
1. Initializes from WorkEstimate
2. Tracks completed identifiers vs total
3. Updates as processing happens
4. Provides percentage (0-1) for display

**API**:
```typescript
const tracker = new GlobalProgressTracker(workEstimate);
tracker.startIteration(1);
tracker.startFile("output/file1.js", 1);
tracker.updateProgress(10); // 10 identifiers processed
const pct = tracker.getPercentage(); // 0.008 (10/1247)
```

### Phase 3: Enhanced Display (3-4 hours)

**Goal**: Clean, colorful, non-overlapping display

**Key Deliverables**:
- New module: `src/display-manager.ts`
- New dependency: `chalk` (for colors)
- Integration with commands and `unminify.ts`

**What It Does**:
1. Shows iteration header (yellow for 1, blue for 2+)
2. Shows global progress bar (0-100%)
3. Shows batch progress bar (current batch)
4. Prints batch summary stats
5. No overlap or flicker (using cli-progress MultiBar)

**Display Example**:
```
Iteration: 1                          ← Yellow text
 ████████████████████░░░░░░░░░░ | 65% | Global Progress
 ████████████████████████████░░ | 87% | Batch 12/18

Processing file 2/3: output/bundle.js

──────────────────────────────────────
Batch Complete
  Identifiers: 47
  Tokens: 12,340
  Cache Hits: 3
  Elapsed: 8.2s
──────────────────────────────────────
```

### Phase 4: Integration & Polish (2-3 hours)

**Goal**: Production-ready, tested, documented

**Key Deliverables**:
- E2E test: `src/global-progress.e2etest.ts`
- Documentation updates: `CLAUDE.md`, `README.md`
- Performance verification on large files
- Backwards compatibility check

**What It Does**:
1. Comprehensive testing (unit + e2e)
2. Performance verification (<1% overhead)
3. Documentation with examples
4. Fallback for non-TTY environments

---

## TIMELINE

### Sprint 1: Foundation (4-6 hours)
- **Goal**: `--estimate-only` flag works
- **Tasks**: Phase 1 complete
- **Test**: Run `humanify unminify --estimate-only test.js`

### Sprint 2: Tracking (4-6 hours)
- **Goal**: Progress updates correctly
- **Tasks**: Phase 2 complete
- **Test**: Progress percentage matches actual work

### Sprint 3: Display (3-5 hours)
- **Goal**: Beautiful, clean display
- **Tasks**: Phase 3 complete
- **Test**: No flickering, colors work, iteration shown

### Sprint 4: Polish (2-3 hours)
- **Goal**: Ship it
- **Tasks**: Phase 4 complete
- **Test**: All tests pass, docs updated

**Total**: 13-20 hours (2-3 work sessions)
**Average**: ~15 hours

---

## KEY DECISIONS

### Decision 1: Estimation Strategy

**Options**:
1. **Accurate** (build full dependency graph) - Slow but precise
2. **Heuristic** (identifierCount / 10) - Fast but approximate
3. **Hybrid** (heuristic by default, `--accurate-estimate` for precision)

**Recommendation**: Hybrid approach
- Default: Fast heuristic (2-3 seconds for 10MB files)
- Flag `--accurate-estimate`: Full analysis (5-10 seconds)

### Decision 2: Progress Update Frequency

**Options**:
1. **Every identifier** - Most accurate, may slow down processing
2. **Every batch** - Less frequent, less overhead
3. **Throttled** (max 10 updates/second) - Balanced

**Recommendation**: Throttled updates
- Update display max 10x/second
- Full accuracy not needed (5% error acceptable)

### Decision 3: Display Layout

**Options**:
1. **cli-progress MultiBar** - Multiple bars, clean layout
2. **Custom rendering** - Full control, more complex
3. **Simple text** - No dependencies, boring

**Recommendation**: cli-progress MultiBar
- Already in use (`unminify.ts`)
- Handles line management automatically
- Fallback to text for non-TTY

---

## RISK MITIGATION

### Risk: Estimation Inaccuracy

**Problem**: Chunking is dynamic, actual batches may differ from estimate

**Mitigation**:
- Document ±5% accuracy expected
- Test with variety of file sizes
- Use conservative estimates (overestimate if unsure)

**Impact**: Low (users accept approximate progress)

### Risk: Progress Callback Not Propagating

**Problem**: `onProgress` may not work in all code paths

**Mitigation**:
- Test all paths: normal, chunked, turbo, turbo+chunked
- Add progress updates at chunk/batch boundaries as backup

**Impact**: Medium (would make progress bar inaccurate)

### Risk: Display Slowing Processing

**Problem**: Frequent updates may add overhead

**Mitigation**:
- Throttle to 10 updates/second
- Benchmark on large files
- Disable display in `--verbose` mode if needed

**Impact**: Low (display overhead <1%)

---

## SUCCESS CRITERIA

### Must Have (P0)

- [ ] Upfront estimation completes before first API call
- [ ] Global progress bar reaches 100% at completion
- [ ] Iteration display shows correct number with color
- [ ] No overlapping or flickering text
- [ ] Works in both turbo and non-turbo modes

### Should Have (P1)

- [ ] Estimation accuracy within 5%
- [ ] Batch summary after each batch
- [ ] Color coding for important info
- [ ] TTY and non-TTY support
- [ ] Backwards compatible with existing flags

### Nice to Have (P2)

- [ ] Estimated time remaining
- [ ] Cost estimation (based on token usage)
- [ ] Cache hit rate display
- [ ] Progress state saved to disk (for resume)

---

## DEPENDENCIES

### External Dependencies

- `chalk` - Color output (may already be installed)
- `cli-progress` - Progress bars (already installed)
- `@babel/parser`, `@babel/traverse` - AST parsing (already installed)

### Internal Dependencies

- Phase 2 depends on Phase 1 (needs WorkEstimate)
- Phase 3 depends on Phase 2 (needs GlobalProgressTracker)
- Phase 4 depends on Phases 1-3 (testing/integration)

**Critical Path**: Sequential (cannot parallelize)

---

## FILE CHANGES

### New Files (6)

1. `src/estimate-work.ts` - Work estimation logic
2. `src/estimate-work.test.ts` - Unit tests
3. `src/global-progress.ts` - Progress tracker
4. `src/global-progress.test.ts` - Unit tests
5. `src/display-manager.ts` - Display logic
6. `src/global-progress.e2etest.ts` - Integration test

### Modified Files (4)

1. `src/unminify.ts` - Add progress/display parameters
2. `src/commands/openai.ts` - Integrate system
3. `src/commands/gemini.ts` - Integrate system
4. `src/commands/local.ts` - Integrate system

**Total Lines Changed**: ~800-1000 (mostly new code)

---

## QUESTIONS FOR USER

### Before Starting

1. **Estimation Speed vs Accuracy**: Prefer fast heuristic (2-3s) or accurate analysis (5-10s)?
   - Recommendation: Fast by default, `--accurate-estimate` flag for precision

2. **Refinement Iterations**: Support only 2 iterations, or arbitrary number (e.g., `--refine=3`)?
   - Recommendation: Limit to 2 for now (simplicity)

3. **Progress Persistence**: Save progress state to disk for resume, or in-memory only?
   - Recommendation: In-memory only (YAGNI - checkpoint system already exists)

4. **Batch Summary Metrics**: Which stats are most important?
   - Identifiers processed
   - Tokens used (cost)
   - Cache hit rate
   - Time remaining
   - Recommendation: All of the above

### During Implementation

5. **Non-TTY Behavior**: Fall back to simple text, or silent (only final summary)?
   - Recommendation: Simple text updates every 10%

---

## NEXT STEPS

### Immediate Actions

1. **User approval** of this plan
2. **Resolve BUG #1** (test failures) - see separate plan
3. **Begin Phase 1** (Work Estimation module)

### After Phase 1 Complete

4. Test `--estimate-only` with real files
5. Verify estimation accuracy
6. Proceed to Phase 2

### After All Phases Complete

7. Run full test suite
8. Performance benchmark on large files (babylon.js, tensorflow.js)
9. Update documentation
10. Ship it!

---

**Status**: READY FOR IMPLEMENTATION
**Approval Needed**: Yes (user review)
**Blockers**: None (can start after test fixes)
**Timeline**: 2-3 work sessions (13-20 hours)
