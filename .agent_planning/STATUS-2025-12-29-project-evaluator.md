# Status Report - 2025-12-29T23:45:00Z

## Executive Summary
Overall: 0% complete (planning phase only) | Critical issues: 14 major gaps | Plans status: NEEDS_CLARIFICATION

**This is a PLANNING EVALUATION. No implementation exists yet.**

## Planning Assessment

### Documents Evaluated
1. `/Users/bmf/code/brandon-fryslie_humanify/.agent_planning/turbo-v2/PROJECT_SPEC.md` (20KB)
2. `/Users/bmf/code/brandon-fryslie_humanify/.agent_planning/turbo-v2/APPROACHES-RESEARCH.md` (48KB)

### Completeness: MAJOR GAPS FOUND

| Area | Status | Issues |
|------|--------|--------|
| Core Architecture | PARTIAL | Multi-pass design complete, but processor implementations undefined |
| CLI Interface | COMPLETE | Well-specified |
| Checkpointing | MOSTLY COMPLETE | Missing conflict resolution edge cases |
| Internal API | MOSTLY COMPLETE | Some TypeScript interfaces incomplete |
| Validation Plan | INCOMPLETE | Missing key details |
| Error Handling | MISSING | Not specified |
| Migration Path | MISSING | v1→v2 transition undefined |

### Consistency: CONTRADICTIONS FOUND

| Contradiction | Location | Impact |
|---------------|----------|---------|
| Pass count defaults | CLI says "default 2-pass" but preset table shows different defaults | User confusion |
| Checkpoint frequency | Two different mechanisms (every N identifiers AND every M seconds) with unclear interaction | Implementation ambiguity |
| Processor naming | "LLMRenameProcessor" vs "rename" vs "llm-rename" used inconsistently | Implementation confusion |
| Filter semantics | `onlyAnchors: false` vs `non-anchors` filter - are these equivalent? | Logic bugs |

### Feasibility: TECHNICAL RISKS

| Risk | Severity | Evidence |
|------|----------|----------|
| **Multi-pass hypothesis unvalidated** | CRITICAL | Spec assumes 2-pass will achieve 85-95% quality with NO empirical evidence |
| **Context window management** | HIGH | Passing "all previous renames" to LLM could exceed token limits for large files |
| **AST mutation between passes** | HIGH | No design for incremental AST updates - may need full reparse each pass |
| **Checkpoint storage explosion** | MEDIUM | Code snapshots × passes × large files = potentially gigabytes |
| **Progress bar complexity** | LOW | Real-time progress across parallel workers is non-trivial |

### Ambiguities: NEEDS_CLARIFICATION

#### CRITICAL AMBIGUITIES (block implementation)

**1. What happens when a pass produces WORSE names than the previous pass?**
- Context: Pass 2 might "refine" a good pass 1 name into something worse
- How it was guessed: Spec assumes monotonic quality improvement
- Options:
  - A: Always accept pass N output (may degrade quality)
  - B: Keep pass N-1 name if confidence drops (requires confidence tracking)
  - C: Flag for manual review (not automatable)
- Impact: Core quality assumption may be violated

**2. How are "anchors" defined precisely?**
- Context: Multiple processors reference "anchors" but definition varies
- Spec says: ">5 references OR top-level scope" (AnchorDetectionProcessor)
- Spec also says: "top 10-20% by importance" (Anchor-First Strategy)
- Spec also references: "reference count threshold" (undefined value)
- Options:
  - A: Hard threshold (>5 refs) - may miss important low-ref identifiers
  - B: Percentage-based (top 10%) - consistent count but arbitrary cutoff
  - C: Composite score - more sophisticated but requires tuning
- Impact: Anchor-first pipeline may select wrong identifiers

**3. What is the exact prompt for "confirm-or-improve" refinement?**
- Context: RefinementProcessor uses different prompting strategy than LLMRenameProcessor
- How it was guessed: No prompt engineering specified
- Options:
  - A: "Is '{name}' correct? If not, suggest better" - may bias toward no change
  - B: "Suggest name given context (current: '{name}')" - may ignore current name
  - C: "Rate confidence in '{name}', improve if <0.7" - requires confidence calibration
- Impact: Pass 2+ quality depends entirely on this

**4. How does code snapshot work with AST mutations?**
- Context: Each pass transforms code, but AST path-based identifiers may become invalid
- Spec says: Save code snapshot after each pass
- Spec also says: IdentifierInfo has `location: { start, end, line, column }`
- Question: Are locations updated after mutations? Or regenerated?
- Options:
  - A: Regenerate all IdentifierInfo from snapshot - expensive but safe
  - B: Update locations after mutations - complex, error-prone
  - C: Use stable IDs instead of locations - requires design change
- Impact: Checkpoint resume may fail or corrupt state

**5. What is "semantic similarity" scoring?**
- Context: Success criteria uses "Semantic score ≥ 95% of sequential baseline"
- Spec says: "LLM-as-judge comparison vs original (0-100)"
- Questions:
  - What is the exact judge prompt?
  - What does "vs original" mean - compare to original source or sequential output?
  - How are scores aggregated across identifiers?
  - Is this per-identifier or file-level?
- Impact: Cannot objectively measure success

**6. What happens on checkpoint config mismatch?**
- Context: Resume Scenarios section shows prompt but not actual behavior
- Example: User ran `--pass rename:parallel:50`, now runs `--pass rename:streaming:25`
- Spec shows: Interactive prompt with 3 options
- Question: What's the DEFAULT behavior if non-interactive (CI, automated runs)?
- Options:
  - A: Fail with error (safe but annoying)
  - B: Start fresh (wasteful)
  - C: Auto-continue if compatible (undefined "compatible")
- Impact: Automation/CI workflows may break

#### MEDIUM AMBIGUITIES (implementation details unclear)

**7. How are name collisions handled across passes?**
- Context: Pass 1 might produce collision, pass 2 processes same identifiers
- Spec says: "Handle collisions with prefix strategy" (AST Mutator)
- Question: Are prefixed names visible to pass 2? Or only final output?
- Impact: Pass 2 context quality, potential confusing names

**8. What is "unchanged" vs "renamed" vs "improved"?**
- Context: PassStats tracks all three but definitions overlap
- If identifier "a" → "a" in pass 1: unchanged
- If identifier "a" → "config" in pass 1, then "config" → "config" in pass 2: unchanged or renamed?
- If identifier "a" → "cfg" → "config": improved (how measured?)
- Impact: Statistics may be meaningless

**9. How does filter composition work?**
- Context: PassConfig allows multiple filter options
- Example: `{ onlyAnchors: true, skipHighConfidence: true }`
- Question: AND or OR logic? Which takes precedence?
- Impact: Pipeline behavior ambiguous

**10. What constitutes a "conflict"?**
- Context: ConflictDetectionProcessor and conflict-detect pass both referenced
- Spec implies: "inconsistent names" but no definition
- Examples: Are "config" and "configuration" a conflict? "getUserName" vs "get_user_name"?
- Impact: Conflict detection may flag too much or too little

#### LOW AMBIGUITIES (nice to clarify)

**11. Is metadata persistent across passes?**
- Context: ProcessorResult includes `metadata?: Record<string, any>`
- Example: AnchorDetectionProcessor sets `{ isAnchor: true }`
- Question: Is this available to pass 2 processors?
- Impact: Processors may need to recompute

**12. What's the retry strategy for LLM API failures?**
- Context: No error handling specified
- Question: Retry with backoff? Fail immediately? Skip identifier?
- Impact: Long-running jobs may fail unnecessarily

**13. What happens if --passes N where N > configured passes?**
- Context: `--passes 5` but config has 2 passes
- Question: Repeat last pass? Error? Extend with default config?
- Impact: User confusion

**14. Are identifiers processed in deterministic order within a batch?**
- Context: Parallel execution within batch
- Question: Is output deterministic for same input?
- Impact: Testability, reproducibility

## Testability: INSUFFICIENT

### Missing Test Specifications

1. **No acceptance tests defined**
   - Success criteria exists but no test procedure
   - Example: "Semantic score ≥ 95%" - how is this measured in CI?

2. **No regression test strategy**
   - How to ensure v2 doesn't break when adding features?
   - No test samples versioning strategy

3. **No performance regression detection**
   - Success criteria has time targets but no automated checks
   - Example: "100K identifiers in < 4 hours" - is this in CI? On what hardware?

4. **No quality regression detection**
   - If pass 2 produces worse names, how is this caught?
   - No per-identifier quality tracking

5. **Test samples insufficient**
   - Only 3 samples: tiny-qs (~150), small-axios (~800), medium-chart (~5000)
   - Missing: large sample (50K+), deeply nested scopes, bundled code patterns
   - No adversarial cases: extremely long identifiers, unicode, edge cases

### Validation Protocol Gaps

| Hypothesis | Validation Method | Gap |
|------------|-------------------|-----|
| "2-pass ≥ sequential quality" | Quality score comparison | No baseline exists, judge prompt undefined |
| "Pass 1 alone ~70% quality" | Quality score of 1-pass | Threshold arbitrary, no justification |
| "Pass 3 has diminishing returns" | Quality delta pass 2→3 vs 1→2 | No definition of "diminishing" |
| "Streaming mode helps within pass" | Quality score streaming vs parallel | No test plan |

## Dependencies & Assumptions

### External Dependencies (not documented)

1. **OpenAI API stability**
   - Assumption: API latency and rate limits are predictable
   - Risk: Structured output format may change
   - Mitigation: None specified

2. **Babel version compatibility**
   - Assumption: AST mutations work across Babel versions
   - Risk: Babel breaking changes invalidate checkpoints
   - Mitigation: None specified

3. **Node.js version requirements**
   - Assumption: Works on Node 20+
   - Question: What about Node 18? 22?
   - Spec: Not mentioned

4. **File system assumptions**
   - Checkpoint directory creation assumes write permissions
   - No handling of read-only file systems
   - No handling of network drives (slow I/O)

### Internal Dependencies (undocumented)

1. **Dependency on existing babel-utils**
   - Spec says: "All code transformations are done at the AST level via Babel"
   - Question: Can turbo-v2 use existing `src/babel-utils.ts`?
   - Or must it reimplement?

2. **Dependency on identifier discovery**
   - PROJECT_SPEC references "identifier discovery" but doesn't specify implementation
   - PLAN references "identifier-collector.ts" from Phase 1
   - Question: Is this new code or adapting existing `visit-all-identifiers.ts`?

3. **Dependency on context extraction**
   - Similar to above - is this new or reused?

### Hidden Assumptions

1. **"Most identifiers stabilize by pass 2"**
   - No evidence provided
   - Critical for "skip high confidence" optimization
   - If false, multi-pass wastes API calls

2. **"Rough names from pass 1 are better than obfuscated names"**
   - Probably true, but what if pass 1 produces MISLEADING names?
   - Misleading > obfuscated from LLM perspective?

3. **"Parallel processing is safe for AST mutations"**
   - Spec says: "Sequential mutations only (AST not thread-safe)"
   - But also: "Process in batches in parallel"
   - Assumption: Extract contexts in parallel, mutate sequentially
   - This sequencing is not explicitly designed

4. **"Code snapshots are affordable"**
   - For 100K identifier file, 3 passes = 3 full file copies
   - If file is 10MB, checkpoint dir is 30MB+ per job
   - No disk space management strategy

5. **"Resume always makes sense"**
   - What if pass 1 completed, but we learned the config was wrong?
   - User may want to restart, not resume
   - No "discard and restart" workflow

## Implementation Red Flags

### Missing From Spec

1. **Error handling** - Not a single try/catch block designed
2. **Logging levels** - Only progress format shown, no debug/error logging
3. **Cancellation** - SIGINT handling mentioned, but what about graceful shutdown mid-API-call?
4. **Rate limiting** - OpenAI has rate limits, no backoff/retry strategy
5. **Memory limits** - No max memory checks despite `--max-memory` flag in existing code
6. **Timeout handling** - What if a single identifier takes 60 seconds?
7. **Partial failure recovery** - If batch fails, retry? Skip? Abort?
8. **Version compatibility** - What if user runs v2, then v1, then v2 again?

### Design Inconsistencies

1. **Processor interface vs built-in processors**
   - Interface shows `PassProcessor` with `process()` method
   - Built-in examples show class-based processors
   - But CLI parsing suggests string-based processor names
   - Question: How does registry work?

2. **Filter semantics unclear**
   - `filter: { onlyAnchors: true }` - does this mean process ONLY anchors?
   - Or process all, but flag anchors?
   - ConflictDetectionProcessor uses `postProcess` to flag, not filter

3. **Mode vs processor confusion**
   - `mode: 'parallel' | 'streaming' | 'sequential'` in PassConfig
   - But also processors like `LLMRenameProcessor`, `RefinementProcessor`
   - Are modes orthogonal to processors? Or coupled?
   - Example: Can RefinementProcessor run in streaming mode?

4. **Checkpoint granularity**
   - "Save every 100 identifiers" - but in parallel execution, which 100?
   - Is it: "after 100 identifiers have been processed" (non-deterministic order)?
   - Or: "after identifier 0-99 batch completes" (deterministic)?

### Overengineering Risks

1. **Pluggable processors**
   - 5+ processor types for initial release
   - Complex interface with pre/post processing
   - Question: Is this flexibility needed now, or YAGNI?

2. **Multiple execution modes**
   - Parallel, streaming, sequential all in v2.0
   - Question: Should v2.0 only do parallel, add modes later?

3. **Elaborate checkpoint structure**
   - job.json + passes/*.json + snapshots/*.js + history/*.jsonl
   - 4 levels of directory nesting
   - Question: Is this over-designed for initial version?

4. **Preset system**
   - 4 presets defined before any validation
   - Question: Should we validate default 2-pass first, add presets later?

### Undefined Behavior

1. **What if identifier count changes between passes?**
   - Edge case: AST mutation introduces new identifiers (unlikely but possible)
   - No handling specified

2. **What if two identifiers have same original name?**
   - Example: Two `a` variables in different scopes
   - Checkpoint uses identifier as key - collision?
   - Need unique ID strategy

3. **What if LLM returns same name for two different identifiers?**
   - Collision detection mentioned, but resolution strategy unclear
   - Prefix with `_` mentioned for AST mutator, but does pass 2 see prefixed names?

4. **What if checkpoint is partially written (power loss during save)?**
   - No atomic write strategy
   - No corruption detection

## Specific File/Section Issues

### PROJECT_SPEC.md

**Lines 378-432**: `ProcessorContext` interface
- `getRenameHistory(id: string): string[]` - but `id` is described as "location-based"
- If location changes after AST mutation, how is history keyed?
- **NEEDS_CLARIFICATION**: Use stable ID scheme

**Lines 437-457**: `PassProcessor` interface
- `preProcess` is optional but used in example pipelines (anchor-detect)
- Question: What happens if `preProcess` fails? Abort entire pass?
- **MISSING**: Error handling contract

**Lines 470-477**: Built-in processors table
- Lists 5 processors but only 3 are defined in code examples
- `ConflictDetectionProcessor` and `ConsistencyProcessor` have no implementation details
- **INCOMPLETE**: Need full specifications

**Lines 500-506**: `TurboV2Config` interface
- `model?: string` - what's the default? gpt-4o-mini or gpt-4o?
- Different sections give different answers
- **INCONSISTENT**: Needs single source of truth

**Lines 618-625**: Test samples table
- Claims `tiny-qs: ~150` but actual file might differ
- **NEEDS VALIDATION**: Verify actual identifier counts

**Lines 626-646**: Quality metrics
- "Semantic Score" defined as "LLM-as-judge comparison vs original (0-100)"
- "vs original" is ambiguous - original source code or original minified?
- If original source, need to ship with source (licensing issues?)
- If original minified, score is meaningless
- **CRITICAL AMBIGUITY**: Must clarify

**Lines 703-709**: Open questions
- These should be answered BEFORE implementation starts
- Leaving them open risks mid-implementation pivots
- **RECOMMENDATION**: Answer via rapid prototyping in Phase 0

### APPROACHES-RESEARCH.md

**Lines 29-63**: "Why Multi-Pass Works" math
- Table shows "100% context" for pass 2, but this is misleading
- Context quality depends on pass 1 accuracy, which is assumed ~70%
- So pass 2 sees "100% of 70%-accurate names" = effectively 70% context quality
- Math conflates quantity (100% identifiers visible) with quality (70% accurate names)
- **MISLEADING**: Needs clarification

**Lines 75-117**: CLI Design examples
- Example shows `--pass "rename:parallel:50:model=gpt-4o-mini"`
- But PassConfig interface has `model` as top-level field, not in options string
- **INCONSISTENT**: How are model overrides actually parsed?

**Lines 413-461**: CheckpointManager API
- `loadCheckpoint(inputHash: string)` uses hash as parameter
- But earlier specs use file path
- **INCONSISTENT**: Which is the actual key?

**Lines 722-771**: Example pipelines
- `qualityPipeline` has 5 passes - extremely expensive
- No cost estimate provided
- For 5000 identifiers × 5 passes = 25K API calls
- At $0.10/1K tokens, potentially $50-100 per file
- **MISSING**: Cost/benefit analysis

**Lines 850-887**: Theoretical analysis
- Claims "2-pass may actually be BETTER than sequential"
- Based on: early identifiers in sequential get 0% context
- But ignores: later identifiers in sequential get 100% ACCURATE context (not 70% accurate)
- Analysis is oversimplified
- **NEEDS VALIDATION**: Empirical testing required

## Workflow Recommendation

**PAUSE - Ambiguities need clarification before proceeding**

## Clarification Needed Before Proceeding

### Question 1: Multi-pass quality assumption
**Context**: Core architecture depends on pass 2 matching/exceeding sequential quality
**How it was guessed**: Theoretical analysis assumes 70% pass 1 accuracy yields 85-95% pass 2 accuracy
**Options**:
- A: Proceed with implementation, validate hypothesis empirically in Phase 1-2 (risk: may need redesign)
- B: Build rapid prototype first to validate hypothesis before full implementation (safer, slower)
- C: Implement both multi-pass AND single-pass modes, let data decide (flexible, more work)
**Impact of wrong choice**: If hypothesis is false, entire multi-pass architecture is wasted effort

### Question 2: Anchor definition
**Context**: Multiple features depend on "anchor" concept
**How it was guessed**: Multiple heuristics proposed (ref count, percentage, scope-based)
**Options**:
- A: Hard threshold (refs > 5) - simple but may miss important identifiers
- B: Percentage-based (top 10%) - consistent but arbitrary
- C: Composite score (refs + scope size + type) - sophisticated but complex
**Impact of wrong choice**: Anchor-first pipeline may select wrong identifiers, degrading quality

### Question 3: Semantic similarity scoring
**Context**: Success criteria depends on this metric
**How it was guessed**: "LLM-as-judge" mentioned but no details
**Options**:
- A: Manual review of sample (subjective, not scalable)
- B: LLM scoring with prompt template (need to design prompt)
- C: Automated metrics (name length, type match, etc.) (objective but incomplete)
**Impact of wrong choice**: Cannot objectively measure if v2 succeeds

### Question 4: Pass N worse than pass N-1 handling
**Context**: Multi-pass assumes monotonic improvement
**How it was guessed**: Not addressed in spec
**Options**:
- A: Always use latest pass (may degrade quality)
- B: Keep best name across all passes (requires quality tracking)
- C: Confidence-based selection (requires confidence calibration)
**Impact of wrong choice**: Quality may regress in later passes without detection

### Question 5: Checkpoint compatibility strategy
**Context**: Long-running jobs need resume capability
**How it was guessed**: Interactive prompts shown but default behavior undefined
**Options**:
- A: Strict compatibility (error on any mismatch) - safe but inflexible
- B: Lenient compatibility (continue if "close enough") - flexible but risky
- C: Version-based migration (v1 → v2 upgrade path) - complex but future-proof
**Impact of wrong choice**: Users may lose checkpoint progress unnecessarily, or resume with wrong config

### Question 6: Error handling strategy
**Context**: No error handling specified anywhere
**How it was guessed**: Happy path only in spec
**Options**:
- A: Fail fast (first error aborts) - simple but wasteful for long jobs
- B: Best effort (skip failed identifiers, continue) - resilient but may produce incomplete output
- C: Retry with backoff (handle transient failures) - robust but complex
**Impact of wrong choice**: Long-running jobs may fail unnecessarily, or produce incorrect output

## What Could Not Be Verified

| Item | Why | User Can Check |
|------|-----|----------------|
| Multi-pass quality hypothesis | No implementation exists | Run rapid prototype: 1-pass vs 2-pass on tiny-qs |
| Anchor heuristic effectiveness | No empirical data | Manually identify "important" identifiers in test samples, compare to heuristics |
| Checkpoint overhead | No performance testing | Implement checkpoint save, measure time on medium-chart |
| Context window limits | No token counting | Calculate worst-case tokens for 5000 identifiers with all previous renames |
| Processor composition | No working implementation | Try implementing two processors and confirm they compose correctly |
| LLM-as-judge reliability | No judge prompt designed | Design prompt, run on sample, check inter-rater reliability |
| Cost at scale | No API usage yet | Estimate: 100K identifiers × 2 passes × 500 tokens/call × $0.10/1M tokens |

## Recommendations (Priority Order)

### CRITICAL (Must Address Before Implementation)

1. **Answer Open Questions** (PROJECT_SPEC lines 703-709)
   - Determine optimal pass count via rapid prototyping
   - Determine anchor definition via empirical testing
   - Design semantic similarity scoring methodology

2. **Design error handling strategy**
   - File: PROJECT_SPEC.md
   - Add section: "Error Handling and Recovery"
   - Cover: API failures, partial failures, corrupt checkpoints, timeout handling

3. **Clarify ambiguities 1-6** (see above)
   - Multi-pass quality assumption
   - Anchor definition
   - Semantic similarity scoring
   - Pass regression handling
   - Checkpoint compatibility
   - Error strategy

4. **Define test acceptance criteria**
   - File: PROJECT_SPEC.md, section "Validation & Testing"
   - Add: Specific test procedures for each success criterion
   - Add: Automated regression test strategy
   - Add: Performance regression detection

### HIGH (Should Address Before Full Implementation)

5. **Simplify initial scope**
   - Remove: Streaming mode, sequential mode (add post-validation)
   - Remove: Conflict detection, consistency processors (add post-validation)
   - Remove: Mixed model pipelines (add post-validation)
   - Keep: Core 2-pass parallel with LLM rename only
   - Rationale: Validate core hypothesis before adding complexity

6. **Design stable identifier scheme**
   - File: types.ts
   - Problem: Location-based IDs break after AST mutations
   - Solution: Use content hash or binding path as stable ID

7. **Specify all processor implementations**
   - File: PROJECT_SPEC.md, section "Built-in Processors"
   - Add: Full specification for ConflictDetectionProcessor
   - Add: Full specification for ConsistencyProcessor
   - Add: Full specification for RefinementProcessor prompt

8. **Design checkpoint atomicity**
   - File: checkpoint/storage.ts
   - Problem: Partial writes during power loss
   - Solution: Atomic write strategy (temp file + rename)

### MEDIUM (Nice to Have Before Implementation)

9. **Add adversarial test cases**
   - Unicode identifiers
   - Extremely long identifier names (>1000 chars)
   - Deeply nested scopes (>20 levels)
   - Pathological bundler output

10. **Document migration path**
    - File: PROJECT_SPEC.md, new section
    - v1 checkpoint invalidation strategy
    - User communication plan
    - Fallback to v1 if needed

11. **Resolve naming inconsistencies**
    - Standardize: "LLMRenameProcessor" or "rename" or "llm-rename"
    - Standardize: filter syntax and semantics

12. **Add cost estimation**
    - For each preset, estimate API cost
    - Add to CLI: `--dry-run` shows estimated cost

### LOW (Can Address During Implementation)

13. **Clarify filter composition**
    - Document AND vs OR logic for multiple filters

14. **Define metadata persistence**
    - Specify if processor metadata carries across passes

15. **Specify retry strategy**
    - Backoff algorithm for API failures

## Summary for Next Steps

**Do NOT proceed with implementation until:**

1. ✅ Open Questions (lines 703-709) are answered
2. ✅ Ambiguities 1-6 are clarified
3. ✅ Error handling strategy is designed
4. ✅ Test acceptance criteria are defined
5. ✅ Semantic similarity scoring methodology is specified

**Recommended approach:**

1. Build minimal prototype (1-pass vs 2-pass on tiny-qs) to validate core hypothesis
2. If hypothesis holds, proceed with simplified Phase 1 (parallel only, no advanced processors)
3. If hypothesis fails, pivot to alternative approach (streaming, anchor-first, etc.)

**Current status: Premature to implement without validation.**
