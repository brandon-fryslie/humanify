# Turbo V2 Architecture (Cached)

**Last Validated**: 2024-12-29 23:45
**Source Files**:
- `.agent_planning/turbo-v2/PROJECT_SPEC.md`
- `.agent_planning/turbo-v2/APPROACHES-RESEARCH.md`
- `.agent_planning/turbo-v2/PLAN-2024-12-29.md`

## Core Architectural Decisions

### Multi-Pass Processing (Foundation)
- **NOT** dependency graph batching (v1 approach)
- **IS** multiple sequential passes, each fully parallel
- Each pass sees previous pass results
- Pass 1: All identifiers processed in parallel (no context from each other)
- Pass 2+: All identifiers see previous pass renames

### Hypothesis
**Unvalidated**: Two parallel passes can match or exceed sequential quality
- Pass 1 expected: ~70% quality
- Pass 2 expected: ~85-95% quality
- Based on: 100% of identifiers see context vs sequential's 50% average

### Processor Architecture
Pluggable processors that can run in any pass:
1. **LLMRenameProcessor**: Core rename with LLM
2. **RefinementProcessor**: Confirm or improve existing names
3. **AnchorDetectionProcessor**: Flag high-value identifiers
4. **ConflictDetectionProcessor**: Find inconsistent names
5. **ConsistencyProcessor**: Enforce naming patterns

### Execution Modes
- **Parallel**: All identifiers processed concurrently (configurable limit)
- **Streaming**: Source-order windows with overlapping context
- **Sequential**: One at a time, each sees all previous renames

### CLI Design
```bash
humanify unminify --turbo-v2 input.js
  --pass "processor:mode:concurrency[:filter]"
  --preset [fast|balanced|quality|anchor]
```

### Presets
- **fast**: 2-pass parallel rename (default)
- **balanced**: rename → refine
- **quality**: rename → refine → conflict-detect → fix → consistency
- **anchor**: anchor-detect → rename anchors sequentially → rename rest parallel

### Checkpointing
- Per-pass completion checkpoints
- Mid-pass progress checkpoints (every N identifiers)
- Resume from any interruption point
- New format (incompatible with v1)

## Implementation Phases

### Phase 0: Validation Infrastructure ✓ (75% complete)
- Canonical test samples (tiny, small, medium)
- Baseline measurement scripts
- Semantic scoring tool
- **Missing**: Complete baseline measurements, integrate semantic scoring

### Phase 1: Foundation (No Dependencies, Sequential)
- Identifier collector
- Context extractor
- Simple batch scheduler
- Parallel executor
- AST mutator

### Phase 2: Dependency Ordering
- Scope hierarchy builder
- Dependency analyzer (scope only)
- Topological batch scheduler

### Phase 3: Reference Dependencies (Optional)
- Reference index builder
- Extended dependency analyzer

### Phase 4: Batch Optimization
- Batch merger (small batches)
- Batch splitter (large batches)

### Phase 5: Checkpointing
- Checkpoint serializer
- Checkpoint validator
- Resume logic

### Phase 6: Caching (Optional)
- Dependency graph cache
- Cache management

## Key Differences from V1

| Aspect | V1 | V2 |
|--------|----|----|
| Core approach | Dependency graph batching | Multi-pass parallel |
| Providers | OpenAI, Gemini, Local | OpenAI only (initially) |
| Checkpoint format | JSON (compatible) | New format (incompatible) |
| Testing | Integration-heavy | Unit tests per component |
| Code organization | Single large file | Modular components |
| Code origin | Evolved from sequential | Fresh from scratch |

## Success Criteria (From Spec)

1. **Speed**: 100K identifiers in < 4 hours (2-pass, 50 concurrent)
2. **Quality**: Semantic score ≥ 95% of sequential baseline
3. **Reliability**: Resume from any interruption point
4. **Usability**: Single command for common cases, flexible for advanced

**Note**: Success metric definition is incomplete (Gap 2 in STATUS-2024-12-29-gaps.md)
