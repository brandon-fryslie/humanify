# Status Report - Turbo V2 Planning Gaps Evaluation
Timestamp: 2024-12-29-23:45
Scope: planning/turbo-v2-readiness
Confidence: FRESH

## Executive Summary

**Overall Planning State**: 60% complete - Core architecture defined, critical specifications missing
**Blockers Before Implementation**: 6 critical gaps, 3 deferred to implementation
**Risk Level**: MEDIUM-HIGH - Core hypothesis unvalidated, success metrics undefined
**Recommended Next Action**: PAUSE implementation - Resolve critical gaps first

---

## Evaluation Methodology

Files reviewed:
- `.agent_planning/turbo-v2/PROJECT_SPEC.md` (20KB, comprehensive architecture)
- `.agent_planning/turbo-v2/APPROACHES-RESEARCH.md` (48KB, 14 approaches cataloged)
- `.agent_planning/turbo-v2/DOD-2024-12-29.md` (Phase 0 definition of done)
- `.agent_planning/turbo-v2/PLAN-2024-12-29.md` (6-phase implementation plan)
- `test-samples/canonical/` (Phase 0 baseline infrastructure)
- `scripts/measure-baseline.ts`, `scripts/score-semantic.ts` (validation tools)

Phase 0 status checked:
- Baseline measurement infrastructure: PARTIAL (1/3 samples measured)
- Semantic scoring: EXISTS but undefined in spec
- Comparison pipeline: EXISTS but success metrics undefined

---

## Critical Gaps (MUST RESOLVE BEFORE IMPLEMENTATION)

### Gap 1: **Unvalidated Core Hypothesis**
**Status**: BLOCKING
**Location**: PROJECT_SPEC.md lines 29-53

**The Problem**:
The entire architecture rests on this claim:
> "Two parallel passes can match or exceed sequential quality."

**Evidence of the assumption**:
```
| 2-Pass Parallel | 2n | 2n/30 × latency | ~85-95% |
```

**What's missing**:
- NO empirical validation
- Quality numbers (85-95%) are **guesses** marked with `~`
- Table shows "Expected Quality" not "Measured Quality"
- Pass 1 quality assumption (~70% accurate) is untested

**Why this blocks implementation**:
If the hypothesis is false:
- The entire multi-pass architecture is the wrong solution
- We'd discover after 2-3 weeks of implementation
- May need completely different approach (streaming, anchor-first, etc.)

**Required to unblock**:
1. Complete Phase 0 baseline measurements (all 3 samples)
2. Run semantic scoring on:
   - Sequential baseline (ground truth)
   - 1-pass parallel (hypothesis: ~60-70%)
   - 2-pass parallel (hypothesis: ~85-95%)
3. Document actual quality numbers in PROJECT_SPEC.md
4. If hypothesis fails, revisit architecture decision

**Estimated effort**: 2-4 hours (API calls, waiting for LLM)

---

### Gap 2: **Undefined Success Metric**
**Status**: BLOCKING
**Location**: PROJECT_SPEC.md line 627, score-semantic.ts exists but not specified

**The Problem**:
Success criteria states:
> "Quality: Semantic score ≥ 95% of sequential baseline"

But:
- What IS "semantic score"? (0-100 scale from `score-semantic.ts`)
- What does "≥ 95% of baseline" mean?
  - If baseline scores 70, is 66.5 success? (95% of 70)
  - Or must we score 95 when baseline scores 100?
- How do we handle the identifier sampling in `score-semantic.ts`? (only scores 200 identifiers)

**Why this blocks implementation**:
- Cannot objectively determine when v2 is "done"
- Different interpretations lead to different optimization choices
- Quality regressions undetectable without clear metric

**Required to unblock**:
1. Define semantic score calculation precisely
2. Specify success threshold numerically:
   ```
   Success: semantic_score(turbo_v2) ≥ 0.95 × semantic_score(sequential)
   OR
   Success: semantic_score(turbo_v2) ≥ 90  (absolute threshold)
   ```
3. Document scoring methodology in PROJECT_SPEC.md
4. Specify how to handle sampling vs full-file scoring

**Estimated effort**: 1 hour (documentation + decision)

---

### Gap 3: **Inconsistent Definitions**
**Status**: BLOCKING
**Location**: Multiple files, affects implementation contracts

**The Problems**:

**3a. "Anchor" has 3 different definitions**:
- APPROACHES-RESEARCH.md line 898: "top 10-20% by importance"
- APPROACHES-RESEARCH.md line 904: reference count + scope size + type + position
- PROJECT_SPEC.md line 615: "high-value identifiers" (no threshold)
- Open question line 709: "What reference count defines an anchor?"

**3b. Processor names inconsistent**:
- `LLMRenameProcessor` vs `llm-rename` vs `rename`
- CLI says `--pass "rename:parallel:50"`
- Code interface says `processor: 'llm-rename'`
- Example pipelines use both `rename` and `llm-rename`

**3c. Filter semantics undefined**:
```typescript
filter?: {
  onlyAnchors?: boolean;
  onlyFlagged?: boolean;
  skipHighConfidence?: boolean;
}
```
What happens if `onlyAnchors=true` AND `skipHighConfidence=true`?
- Process anchors that are low confidence?
- Or skip all (empty set)?
- Filters are AND or OR?

**Why this blocks implementation**:
- Developer implementing `AnchorDetectionProcessor` won't know what to implement
- CLI parser can't validate processor names
- Filter logic will be implemented inconsistently

**Required to unblock**:
1. Define "anchor" precisely with threshold in types.ts
2. Standardize processor naming: use `rename` everywhere OR `llm-rename` everywhere
3. Document filter composition rules (AND vs OR, precedence)
4. Add examples to PROJECT_SPEC.md showing edge cases

**Estimated effort**: 2 hours (spec clarification + documentation)

---

### Gap 4: **No Error Handling Specification**
**Status**: BLOCKING (for Phase 5 checkpointing)
**Location**: Checkpointing section, no error scenarios documented

**Missing scenarios**:

**4a. API failures mid-batch**:
- LLM API returns 500 error for identifier #50 of 100
- Do we: retry? skip? fail entire batch? checkpoint partial?
- How many retries? What backoff strategy?

**4b. Checkpoint corruption**:
- Disk full during checkpoint write
- Crash during serialization
- Partial JSON written
- How to detect? How to recover?

**4c. Config changes on resume**:
PROJECT_SPEC.md shows **user prompt** for config changes (line 350-357)
- But this is an API/library. CLI commands may be non-interactive.
- What's the default behavior in non-interactive mode?
- What if called from a script?

**4d. Concurrent access**:
- Two processes try to resume same checkpoint
- Race condition on checkpoint file writes
- File locking strategy?

**Why this blocks implementation**:
Phase 5 (checkpointing) will be fragile without error handling spec.
Developer won't know what to implement.

**Required to unblock**:
1. Document API failure retry strategy
2. Specify checkpoint atomicity requirements (temp file + rename?)
3. Define non-interactive resume behavior
4. Specify file locking or detect concurrent access

**Estimated effort**: 3 hours (design + documentation)

---

### Gap 5: **Quality Regression Handling Undefined**
**Status**: BLOCKING (for multi-pass)
**Location**: Multi-pass architecture, no regression handling

**The Problem**:
Multi-pass assumes each pass improves quality:
```
Pass 1: ~70% quality
Pass 2: ~85% quality
Pass 3: ~90% quality
```

But what if:
- Pass 2 produces **worse** names for 20% of identifiers?
- Pass 3 changes stable names from pass 2?
- LLM "flip-flops" between `config` and `configuration`?

**Why this blocks implementation**:
Without regression handling:
- More passes can make output worse
- No way to detect quality degradation
- Users would add `--passes 5` expecting better quality, get worse

**Current spec has hints but no specification**:
- `confidence` field in ProcessorResult (line 407) - but no use of it
- "Stability Rate" metric mentioned (line 629) - but no implementation
- Identifier history tracking (line 347-354) - but no decision logic

**Required to unblock**:
1. Specify quality regression detection:
   - Compare pass N to pass N-1 per identifier
   - Define "regression" (confidence drop? name length? semantic score?)
2. Specify handling:
   - Keep pass N-1 name if pass N is worse?
   - Or always take latest pass?
   - Or configurable policy?
3. Document in types.ts and orchestrator spec

**Estimated effort**: 2-3 hours (design decision + spec)

---

### Gap 6: **Missing Processor Specifications**
**Status**: BLOCKING (for Phase 1+)
**Location**: PROJECT_SPEC.md lines 471-477

**The Problem**:
5 processors listed, only 2 have ANY specification:

| Processor | Spec Location | Completeness |
|-----------|---------------|--------------|
| `LLMRenameProcessor` | APPROACHES-RESEARCH.md lines 601-609 | 40% - no prompt, no model params |
| `RefinementProcessor` | APPROACHES-RESEARCH.md lines 651-665 | 60% - has concept, missing prompt |
| `AnchorDetectionProcessor` | APPROACHES-RESEARCH.md lines 616-628 | 30% - heuristic only, no threshold |
| `ConflictDetectionProcessor` | APPROACHES-RESEARCH.md lines 633-646 | 10% - stub only |
| `ConsistencyProcessor` | APPROACHES-RESEARCH.md lines 668-681 | 5% - comment only |

**What's missing for EACH processor**:

**LLMRenameProcessor** (needed for Phase 1):
- Exact LLM prompt template
- Model parameters (temperature, max_tokens)
- Response parsing (structured output format?)
- How does it differ from current `openai-rename.ts`?

**RefinementProcessor** (needed for "balanced" preset):
- Prompt for "confirm or improve"
- How to present current name + full context
- Decision threshold (when to keep vs improve)

**AnchorDetectionProcessor** (needed for "anchor" preset):
- Exact scoring algorithm
- Threshold for "isAnchor" flag
- Edge cases (what if no identifiers meet threshold?)

**ConflictDetectionProcessor** (needed for "quality" preset):
- What IS a conflict?
- String similarity threshold?
- Semantic similarity via LLM?
- How many identifiers to compare (all-pairs is O(n²))?

**ConsistencyProcessor** (needed for "quality" preset):
- What patterns to enforce?
- camelCase vs snake_case?
- Prefix consistency?
- Fix algorithm?

**Why this blocks implementation**:
- Phase 1 needs LLMRenameProcessor
- Cannot implement presets without processor specs
- Developer will "wing it" and implementation will be wrong

**Required to unblock**:
For Phase 1: Fully specify LLMRenameProcessor
For other phases: Specify processors before using in presets

**Estimated effort**:
- LLMRenameProcessor: 2 hours
- Each other processor: 1-2 hours when needed

---

## Deferred Gaps (Can Resolve During Implementation)

### Gap 7: **Context Size Optimization**
**Status**: DEFERRED
**Location**: Open questions line 704

**The Gap**: "What's the optimal context window per pass?"

**Why defer**:
- Empirical question requiring experiments
- Can start with reasonable default (5000 chars from existing code)
- Can tune during Phase 1 testing

**When to address**: Phase 1 performance testing

---

### Gap 8: **Confidence Threshold Tuning**
**Status**: DEFERRED
**Location**: Open questions line 705

**The Gap**: "When should we skip re-processing?"

**Why defer**:
- Optimization question, not correctness
- Can implement simple policy (always reprocess) initially
- Tune after measuring confidence distribution

**When to address**: Phase 2-3 optimization

---

### Gap 9: **Batch Size Tuning**
**Status**: DEFERRED
**Location**: --min-batch-size, --max-batch-size defaults undefined

**The Gap**: Spec shows flags but no default values researched

**Why defer**:
- Can use conservative defaults (min=3, max=100 from text)
- Can tune based on memory profiling
- Not blocking correctness

**When to address**: Phase 4 optimization

---

## Validation Infrastructure Assessment

### Phase 0 Completion Status

**Step 0.1: Canonical Libraries** ✅ COMPLETE
- tiny-qs: 148 identifiers
- small-axios: ~800 identifiers
- medium-chart: 5002 identifiers
- All have original.js + minified.js

**Step 0.2: Minified Samples** ✅ COMPLETE
- All samples minified with terser
- Stored in test-samples/canonical/

**Step 0.3: Comparison Pipeline** ✅ EXISTS
- Script: `scripts/compare-unminified.ts` (imported by measure-baseline.ts)
- Metrics: identifier count, exact matches, structural validity
- **Missing**: Semantic similarity integration

**Step 0.4: Baseline Measurement** ⚠️ PARTIAL
- tiny-qs: ✅ COMPLETE (9.52% exact match, 83.4s)
- small-axios: ❌ NOT MEASURED (output exists but no baseline-scores.json)
- medium-chart: ❌ NOT MEASURED (output exists but no baseline-scores.json)

**Semantic Scoring Tool** ✅ EXISTS
- `scripts/score-semantic.ts` implemented
- Uses GPT-4o for LLM-as-judge scoring
- **Never integrated into validation pipeline**
- **Never run on any baseline outputs**

### Critical Missing Baseline Data

Cannot validate turbo-v2 hypothesis without:
1. Sequential baseline semantic scores (all 3 samples)
2. Turbo V1 semantic scores (all 3 samples)
3. Pass 1 quality measurement (1-pass parallel, no dependencies)

**Current state**: Have structural metrics only (exact match %).
**Need**: Semantic meaning scores (0-100) from LLM judge.

---

## Runtime Check Assessment

### Existing Checks

| Check | Status | Purpose |
|-------|--------|---------|
| `npm test` | EXISTS | Unit + e2e tests |
| `npm run test:e2e` | EXISTS | End-to-end with real LLM |
| Baseline measurement | PARTIAL | Sequential quality baseline |
| Semantic scoring | EXISTS | LLM-as-judge quality |

### Missing Checks for Turbo V2

**Recommended persistent checks**:
1. **Smoke test for turbo-v2**: `npm run test:turbo-v2:smoke`
   - Run tiny-qs through 2-pass parallel
   - Verify output parses
   - Compare semantic score to baseline
   - Should run in < 2 minutes

2. **Quality regression test**: `npm run test:turbo-v2:quality`
   - Run all 3 samples
   - Ensure semantic score ≥ 95% of baseline
   - Fails if quality drops

3. **Performance benchmark**: `npm run test:turbo-v2:perf`
   - Measure speedup vs sequential
   - Track tokens used, API calls
   - Detect performance regressions

**These don't exist yet but should be created alongside implementation.**

---

## Dependencies and Risks

### Dependency Chain

```
Gap 1 (Hypothesis Validation)
  ↓ (blocks)
Gap 2 (Success Metric)
  ↓ (blocks)
Implementation Start
  ↓ (needs)
Gap 6 (Processor Specs)
  ↓ (needs)
Gap 3 (Consistent Definitions)
  ↓ (enables)
Phase 1-3 Implementation
  ↓ (needs)
Gap 5 (Quality Regression)
  ↓ (enables)
Phase 5 Checkpointing
  ↓ (needs)
Gap 4 (Error Handling)
  ↓ (enables)
Production Ready
```

### Risk Analysis

**HIGH RISK: Core hypothesis fails**
- Probability: 30%
- Impact: Complete architecture change needed
- Mitigation: Validate Gap 1 FIRST before any coding

**MEDIUM RISK: Quality regression in multi-pass**
- Probability: 50%
- Impact: Need regression handling (Gap 5)
- Mitigation: Design regression policy before Phase 2

**MEDIUM RISK: Processor implementations vary**
- Probability: 70%
- Impact: Inconsistent quality across presets
- Mitigation: Resolve Gap 6 with detailed specs

**LOW RISK: Error handling edge cases**
- Probability: 40%
- Impact: Checkpoint corruption, requires re-run
- Mitigation: Resolve Gap 4 before Phase 5

---

## Ambiguities Requiring Clarification

### Ambiguity 1: Multi-Pass Quality Assumption

**Question**: How does the LLM respond to seeing "rough" names from pass 1?

**Context**:
Spec assumes: "Rough names from pass 1 are much better than obfuscated names" (line 42)

**But consider**:
- Pass 1 name: `configOptions` (good)
- Pass 1 name: `dataHandler` (generic, wrong - actually a validator)
- Pass 2 sees `dataHandler` in context
- Does LLM trust the wrong name and reinforce it?
- Or does LLM correct it?

**Why this matters**:
If LLM anchors on pass 1 names (even wrong ones), multi-pass could amplify errors instead of fixing them.

**Needs empirical testing**: Run 2-pass and measure if wrong names get corrected or reinforced.

---

### Ambiguity 2: "Parallel" Mode Context

**Question**: In parallel mode, what context does each identifier see?

**From APPROACHES-RESEARCH.md line 577**:
> "Context: All identifiers see same code state (from previous pass)"

**But in same pass**:
- All processed in parallel
- AST mutations happen AFTER all API calls complete
- So identifiers in SAME pass see obfuscated names
- Only identifiers in NEXT pass see renamed names

**Contradiction in spec**:
- Line 199 says pass 2 sees "5002 renames from pass 1" ✓ Correct
- Line 579 says "Context: All identifiers see same code state" ✓ Correct
- But line 29-34 table implies pass 2 identifiers see each other's renames ✗ Wrong

**How LLM guessed**: Assumed "parallel within pass = no intra-pass context"
**Is this correct?**: Probably yes, but not explicitly stated

**Needs clarification**: Update table in lines 29-34 to show:
```
Pass 1 parallel: All IDs see 0% renamed (each other not visible)
Pass 2 parallel: All IDs see 100% renamed from pass 1 (each other still not visible)
```

---

### Ambiguity 3: Checkpoint Resume Atomicity

**Question**: Is checkpoint resume atomic or incremental?

**From PROJECT_SPEC.md line 363**:
> "Scenario 2: Resume mid-pass"
> "Resume pass 2 from identifier 451/1000..."

**Ambiguity**:
- Does this mean we resume API calls from identifier 451?
- Or does it mean we already HAVE results for 1-450, and resume API calls from 451?
- What if we crash DURING the API call for identifier 451?

**Current spec doesn't say**:
- Are partial results persisted immediately?
- Or only at checkpoint boundaries (every 100 identifiers)?

**How implementation might guess wrong**:
- Save results after every API call → high I/O overhead
- Save results every 100 identifiers → lose up to 99 calls on crash
- Neither is clearly specified

**Needs clarification**: Specify checkpoint granularity and partial result handling.

---

## Recommendations

### 1. IMMEDIATE (Before Any Coding)

**Priority 1 - Hypothesis Validation** (MUST DO):
```bash
# Complete baseline measurements
npm run measure-baseline small-axios
npm run measure-baseline medium-chart

# Run semantic scoring on all baselines
./scripts/score-semantic.ts test-samples/canonical/tiny-qs/original.js \
  test-samples/canonical/tiny-qs/output-sequential/deobfuscated.js

# Measure 1-pass parallel quality (NEW - need to implement)
# Measure 2-pass parallel quality (NEW - need to implement)

# Document actual numbers in PROJECT_SPEC.md
```
**Estimated time**: 4-6 hours (mostly LLM API time)
**Blocking**: Everything

---

**Priority 2 - Define Success** (MUST DO):
- Specify exact semantic score formula
- Set numerical threshold for success
- Document in PROJECT_SPEC.md line 627
- Create quality regression test

**Estimated time**: 1 hour
**Blocking**: Quality validation

---

**Priority 3 - Resolve Inconsistencies** (MUST DO):
- Define "anchor" precisely (Gap 3a)
- Standardize processor names (Gap 3b)
- Document filter composition (Gap 3c)
- Fix contradictions in spec

**Estimated time**: 2 hours
**Blocking**: Phase 1 implementation

---

### 2. BEFORE PHASE 1

**Priority 4 - Specify LLMRenameProcessor** (MUST DO):
- Exact prompt template
- Model parameters
- Response format
- Difference from existing `openai-rename.ts`

**Estimated time**: 2-3 hours
**Blocking**: Phase 1 implementation

---

### 3. BEFORE PHASE 5

**Priority 5 - Error Handling Spec** (MUST DO):
- API failure retry strategy
- Checkpoint atomicity
- Non-interactive resume behavior
- Concurrent access handling

**Estimated time**: 3 hours
**Blocking**: Phase 5 (checkpointing)

---

**Priority 6 - Quality Regression Handling** (MUST DO):
- Define regression detection
- Specify handling policy
- Integrate into orchestrator

**Estimated time**: 2-3 hours
**Blocking**: Multi-pass quality

---

### 4. DURING IMPLEMENTATION (Can Defer)

**Priority 7 - Tune Defaults**:
- Context size optimization (Gap 7)
- Confidence threshold (Gap 8)
- Batch sizes (Gap 9)

**Estimated time**: Varies based on experimentation
**Blocking**: Nothing - can use conservative defaults

---

## Recommended Resolution Order

**Week 1 - Validation & Specification** (before coding):
1. ✓ Day 1: Complete baseline measurements (Gap 1)
2. ✓ Day 1: Define success metric (Gap 2)
3. ✓ Day 2: Resolve inconsistencies (Gap 3)
4. ✓ Day 2: Specify LLMRenameProcessor (Gap 6, Phase 1)
5. ✓ Day 3: Design quality regression handling (Gap 5)
6. ✓ Day 3: Spec error handling (Gap 4)

**Week 2+ - Implementation** (PLAN phases 1-6):
- All critical gaps resolved
- Clear specifications for all components
- Empirical validation of core hypothesis
- Objective success criteria

---

## Workflow Recommendation

**VERDICT**: ⚠️ **PAUSE IMPLEMENTATION**

**Reason**: 6 critical gaps block correct implementation

**Next Steps**:
1. User/architect resolves Gaps 1-6 (estimated 12-16 hours)
2. Update PROJECT_SPEC.md with resolved specifications
3. Re-evaluate with fresh STATUS report
4. If all gaps resolved → CONTINUE to implementation
5. If hypothesis fails → PAUSE for architecture rethinking

---

## Summary Stats

- Critical gaps: 6 (must resolve before implementation)
- Deferred gaps: 3 (resolve during implementation)
- Ambiguities found: 3 (need clarification)
- Phase 0 completion: 75% (baseline measurement partial)
- Estimated resolution time: 12-16 hours
- Risk level: MEDIUM-HIGH (unvalidated hypothesis)
- Recommendation: PAUSE implementation, resolve gaps first

---

## Files to Update After Gap Resolution

1. `PROJECT_SPEC.md`:
   - Line 29-53: Add empirical quality numbers (Gap 1)
   - Line 627: Define success metric precisely (Gap 2)
   - Line 471-477: Add full processor specs (Gap 6)
   - Add error handling section (Gap 4)
   - Add quality regression section (Gap 5)

2. `types.ts` (when created):
   - Define "anchor" with threshold (Gap 3a)
   - Define filter composition rules (Gap 3c)
   - Add confidence threshold constants

3. Create `test-samples/canonical/validation-results.md`:
   - Document baseline semantic scores
   - Document 1-pass and 2-pass measurements
   - Track quality over time

4. Create `.agent_planning/turbo-v2/PROCESSOR-SPECS.md`:
   - Detailed spec for each processor
   - Prompts, parameters, algorithms
   - Edge case handling

---

## Appendix: Baseline Measurement Status

### Completed
- tiny-qs sequential: 9.52% exact match, 83.4s (structural only, no semantic score)

### In Progress
- small-axios: output exists, needs baseline-scores.json
- medium-chart: output exists, needs baseline-scores.json

### Never Run
- Semantic scoring on ANY sample
- 1-pass parallel quality measurement
- 2-pass parallel quality measurement
- Turbo V1 comparison

### Next Action
```bash
# Complete structural baselines
npm run measure-baseline small-axios
npm run measure-baseline medium-chart

# Get semantic scores for ALL
for sample in tiny-qs small-axios medium-chart; do
  ./scripts/score-semantic.ts \
    test-samples/canonical/$sample/original.js \
    test-samples/canonical/$sample/output-sequential/deobfuscated.js
done

# Record in validation-results.md
```
