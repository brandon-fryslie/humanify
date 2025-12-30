# Validation Infrastructure (Cached)

**Last Validated**: 2024-12-29 23:45
**Source Files**:
- `test-samples/canonical/`
- `scripts/measure-baseline.ts`
- `scripts/score-semantic.ts`
- `.agent_planning/turbo-v2/DOD-2024-12-29.md`

## Test Samples

### Canonical Libraries
Located in `test-samples/canonical/`:

| Sample | Size | Identifiers | Purpose |
|--------|------|-------------|---------|
| tiny-qs | ~350 lines | 148 | Fast iteration |
| small-axios | ~3000 lines | ~800 | Medium tests |
| medium-chart | ~11,000 lines | 5002 | Stress tests |

Each sample has:
- `original.js`: Well-named source code (ground truth)
- `minified.js`: Terser-minified version
- `output-sequential/`: Sequential humanify output
- `output-turbo/`: Turbo v1 output (exists but not measured)

## Validation Tools

### Baseline Measurement
**Script**: `scripts/measure-baseline.ts`
**Purpose**: Run sequential humanify and measure quality

**Metrics**:
- Original identifier count
- Unminified identifier count
- Exact matches (name == original name)
- Match percentage
- Structurally valid (parses correctly)
- Processing time

**Usage**:
```bash
npm run measure-baseline [sample-name]
tsx scripts/measure-baseline.ts tiny-qs
```

**Output**: `test-samples/canonical/{sample}/baseline-scores.json`

### Semantic Scoring
**Script**: `scripts/score-semantic.ts`
**Purpose**: LLM-as-judge semantic quality scoring

**How it works**:
1. Extract identifiers from original and unminified
2. Sample if > 200 identifiers (deterministic sampling)
3. Ask GPT-4o to score 0-100 how well names capture semantic meaning
4. Return score + explanation + token cost

**Usage**:
```bash
OPENAI_API_KEY=... npx tsx scripts/score-semantic.ts original.js unminified.js
```

**Scoring guidelines** (from prompt):
- 90-100: Semantically equivalent (config=configuration, opts=options)
- 70-89: Good understanding, minor misses
- 50-69: Moderate understanding, some generic names
- 30-49: Poor understanding, many generic names
- 0-29: Mostly meaningless names

**Output**: JSON with score, explanation, tokens, cost

### Comparison Pipeline
**Script**: Imported from `compare-unminified.ts` by measure-baseline
**Purpose**: Structural comparison of original vs unminified

**Metrics**:
- Identifier counts
- Exact matches
- Parse validity

## Current Validation State

### Completed Baselines
- tiny-qs: ✓ Structural baseline (9.52% exact match, 83.4s)
- small-axios: ✗ Missing baseline-scores.json
- medium-chart: ✗ Missing baseline-scores.json

### Never Run
- Semantic scoring on any sample
- 1-pass parallel quality measurement
- 2-pass parallel quality measurement
- Turbo V1 comparison with semantic scores

## Validation Gaps

### Missing Data
1. **Semantic baselines**: No LLM-as-judge scores for any baseline
2. **Hypothesis validation**: No 1-pass or 2-pass measurements
3. **Complete structural baselines**: Only 1/3 samples measured

### Integration Issues
1. Semantic scoring exists but not integrated into measure-baseline
2. No automated quality regression tests
3. No CI/CD validation pipeline

### Success Metric Undefined
- Semantic score exists (0-100 scale)
- But success threshold not specified
- "≥ 95% of baseline" is ambiguous:
  - 95% of baseline score? (if baseline=70, then 66.5?)
  - Or absolute 95 threshold?

## Recommended Test Strategy

### For Turbo V2 Development

**1. Complete Phase 0 Baselines**:
```bash
# Structural baselines
npm run measure-baseline small-axios
npm run measure-baseline medium-chart

# Semantic baselines
for sample in tiny-qs small-axios medium-chart; do
  ./scripts/score-semantic.ts \
    test-samples/canonical/$sample/original.js \
    test-samples/canonical/$sample/output-sequential/deobfuscated.js
done
```

**2. Create Quality Regression Test**:
```bash
# New test: npm run test:turbo-v2:quality
# Runs turbo-v2 on all samples
# Compares semantic score to baseline
# Fails if < 95% of baseline (once threshold defined)
```

**3. Create Smoke Test**:
```bash
# New test: npm run test:turbo-v2:smoke
# Runs tiny-qs through 2-pass parallel
# Verifies output parses
# Completes in < 2 minutes
```

## How to Use This Cache

When evaluating turbo-v2 progress:
1. Read this file for validation infrastructure state
2. Check if new test samples added
3. Check if baseline measurements complete
4. Don't re-analyze infrastructure unless changed
5. Focus evaluation on implementation gaps vs spec
