# HumanifyJS: Claude Code CLI Deobfuscation Implementation Plan

**Generated:** 2025-10-30 06:53:35
**Source STATUS:** STATUS-claude-code-cli.md (undated)
**Target File:** test-samples/claude-code-cli.js (9.4MB, 3,791 lines, ~2,500-5,000 identifiers)
**Current Readiness:** 45% - NOT READY for production

---

## Executive Summary

**Mission:** Successfully deobfuscate claude-code-cli.js (9.4MB minified bundle) using HumanifyJS with acceptable cost, quality, and reliability.

**Critical Reality Check:**
- HumanifyJS has **NEVER** successfully processed a real-world file of this size
- Largest test file: <1KB (9,400x smaller than target)
- Estimated cost: **$50-200** in API fees
- Estimated time: **15-60 minutes** processing
- Expected quality: **80-90% readable** (best case)
- Risk of failure: **HIGH** without proper validation

**Strategic Approach:**
Progressive validation through increasing file sizes to de-risk the full file processing. Each validation step builds confidence while minimizing wasted API costs.

**Total Work:** 26 tasks across 4 phases
**Estimated Effort:** 12-18 hours implementation + 2-4 hours testing
**Estimated API Costs:** $15-30 for validation, $50-200 for full file
**Timeline:** 3-5 days (assuming Phase 2 optimizations complete)

---

## Success Criteria

**Minimum Viable Success:**
- ✅ File processes without crashes or errors
- ✅ Output is valid, parseable JavaScript
- ✅ Variable/function names are semantic (not `a`, `b`, `temp`)
- ✅ Code structure is readable (proper formatting)
- ✅ Actual cost matches dry-run estimate (within 20%)
- ✅ Memory usage stays under 4GB
- ✅ Process completes in reasonable time (<2 hours)

**Ideal Success:**
- ✅ Output runs correctly (same behavior as minified input)
- ✅ Names match semantic intent (e.g., `handleUserInput`, not `processData`)
- ✅ Major modules/functions are identifiable
- ✅ Quality score >70% (measured by non-generic name ratio)

**Acceptable Partial Success:**
- ⚠️ File processes but some sections remain poorly named
- ⚠️ 60-70% readability improvement
- ⚠️ Requires manual cleanup for production use
- ⚠️ Cost higher than estimate but <$300

---

## Phase 0: Validation Framework (CRITICAL - DO FIRST)

**Goal:** Implement safety nets to prevent expensive failures
**Estimated Effort:** 3-4 hours
**Estimated Cost:** $0 (no API calls)
**Success Criteria:** All P0 tasks complete, tools ready for validation

---

### P0-1: Implement Dry-Run Mode with Cost Estimation

**Status:** Not Started
**Effort:** Small (1-1.5 hours)
**Dependencies:** None
**Priority:** P0 (CRITICAL)
**Spec Reference:** CLAUDE.md (Development Commands) • **Status Reference:** STATUS-claude-code-cli.md (Section 4.1, lines 225-243)

#### Description

Add `--dry-run` flag that analyzes input without making API calls, providing cost and time estimates. This is **MANDATORY** before any large file processing to prevent bill shock.

**Critical for:** Understanding what we're about to spend before committing.

#### Acceptance Criteria

- [ ] Add `--dry-run` flag to all commands (openai, gemini, local)
- [ ] Count identifiers in input file (var/let/const/function declarations)
- [ ] Calculate estimated API calls: `ceil(identifierCount / batchSize)`
- [ ] Estimate tokens per call (based on context window size)
- [ ] Calculate cost: `apiCalls × avgTokens × pricePerToken`
- [ ] Estimate time: `apiCalls × avgLatency` (with parallelization factor)
- [ ] Display comprehensive summary with recommendation
- [ ] User confirmation prompt before proceeding
- [ ] Test with 100-line file (should estimate ~10 identifiers, $0.50)
- [ ] Test with claude-code-cli.js (should estimate 2,500-5,000 identifiers, $50-200)

#### Technical Notes

**Implementation location:** `src/commands/default-args.ts` or new `src/dry-run.ts`

**Output format:**
```
🔍 Dry-run analysis for: test-samples/claude-code-cli.js
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File Information:
  Size:                  9.4 MB
  Lines:                 3,791
  Estimated identifiers: 2,847

Processing Configuration:
  Provider:              OpenAI (gpt-4o-mini)
  Turbo mode:            Enabled
  Batch size:            10
  Context window:        2000 tokens

API Call Estimates:
  Total API calls:       285 (parallel batches)
  Avg tokens/call:       400 (200 prompt + 200 completion)
  Total tokens:          114,000

Cost Estimates:
  Input tokens:          57,000 @ $0.150/1M = $8.55
  Output tokens:         57,000 @ $0.600/1M = $34.20
  Total estimated cost:  $42.75

Time Estimates:
  Avg latency:           3s per batch
  Sequential time:       14m 15s
  Parallel time:         ~4m 30s (with turbo @ batch-10)

Memory Estimates:
  AST size:              ~95 MB
  Dependency graph:      ~10 MB
  Peak memory:           ~300 MB (well under 4GB limit)

⚠️  RECOMMENDATIONS:
  • This is a LARGE file - first real-world test at this scale
  • Consider testing with 1000-line excerpt first ($10)
  • Ensure Phase 2 optimizations are complete (reference index)
  • Use --perf flag to capture detailed timing
  • Set aside 1 hour for processing + validation

Proceed with processing? [y/N]
```

**Cost calculation by provider:**

```typescript
const PRICING = {
  openai: {
    'gpt-4o-mini': { input: 0.150, output: 0.600 }, // per 1M tokens
    'gpt-4o': { input: 2.50, output: 10.00 }
  },
  gemini: {
    'gemini-1.5-flash': { input: 0.075, output: 0.30 },
    'gemini-1.5-pro': { input: 1.25, output: 5.00 }
  },
  local: {
    'llama': { input: 0, output: 0 } // Free but slower
  }
};
```

**Identifier counting:**
- Parse AST with Babel
- Count binding identifiers (exclude built-ins, imports)
- Group by scope to estimate dependency graph size
- Use same logic as actual processing (consistency)

**Risk Level:** Low (read-only analysis, no mutations)

---

### P0-2: Add Memory Monitoring and Limits

**Status:** Not Started
**Effort:** Small (30-45 minutes)
**Dependencies:** None
**Priority:** P0 (CRITICAL)
**Spec Reference:** CLAUDE.md (Architecture) • **Status Reference:** STATUS-claude-code-cli.md (Section 4.3, lines 251-260)

#### Description

Add memory usage tracking at key processing stages to detect and prevent out-of-memory crashes. The 9.4MB input could produce a 50-100MB AST in memory.

#### Acceptance Criteria

- [ ] Log heap usage before/after each major step
- [ ] Add `--max-memory` flag (in MB, default: 4096)
- [ ] Check memory after AST parsing
- [ ] Check memory after dependency graph building
- [ ] Check memory during batch processing
- [ ] Abort with helpful error if threshold exceeded
- [ ] Document minimum required memory in README
- [ ] Test with small `--max-memory` value to trigger abort

#### Technical Notes

**Implementation:**

```typescript
function logMemoryUsage(stage: string) {
  const used = process.memoryUsage();
  console.log(`    → Memory (${stage}): ${(used.heapUsed / 1024 / 1024).toFixed(0)}MB heap, ${(used.rss / 1024 / 1024).toFixed(0)}MB RSS`);
}

function checkMemoryLimit(maxMemoryMB: number) {
  const heapUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;
  if (heapUsedMB > maxMemoryMB) {
    throw new Error(
      `Memory limit exceeded: ${heapUsedMB.toFixed(0)}MB used, ` +
      `${maxMemoryMB}MB limit. Try --max-memory ${Math.ceil(heapUsedMB * 1.5)}`
    );
  }
}
```

**Monitoring points:**
1. After input file read
2. After Babel parsing (AST creation)
3. After webcrack unbundling
4. After dependency graph construction
5. During batch processing (every 10 batches)
6. After final code generation

**Expected memory profile:**
- Input file: 9.4MB
- Parsed AST: ~50-100MB (10-20x expansion typical)
- Dependency graph: ~10-20MB (dense graph for 3000 identifiers)
- Peak during processing: ~200-400MB
- Safety threshold: 4096MB (leave headroom)

**CLI Usage:**
```bash
# Default (4GB limit)
humanify openai input.js

# Custom limit
humanify openai input.js --max-memory 8192

# If limit exceeded, command suggests:
Error: Memory limit exceeded: 5200MB used, 4096MB limit
Try: node --max-old-space-size=6144 humanify openai input.js --max-memory 6144
```

**Risk Level:** Low (defensive, prevents worse failures)

---

### P0-3: Implement Output Validation (Smoke Tests)

**Status:** Not Started
**Effort:** Medium (1-1.5 hours)
**Dependencies:** None
**Priority:** P0 (CRITICAL)
**Spec Reference:** CLAUDE.md (Test Patterns) • **Status Reference:** STATUS-claude-code-cli.md (Section 4.4, lines 262-271)

#### Description

Add automatic validation that renamed output is syntactically valid JavaScript. This catches AST transformation bugs before we waste time analyzing broken output.

#### Acceptance Criteria

- [ ] Add `--validate` flag (enabled by default)
- [ ] After renaming, re-parse output with Babel
- [ ] Verify AST parses without syntax errors
- [ ] (Optional) Run `node --check output.js` for runtime validation
- [ ] Log validation results with timing
- [ ] Save validation report to `.humanify-validation.json`
- [ ] Exit with error code if validation fails
- [ ] Skip validation with `--no-validate` flag

#### Technical Notes

**Validation pipeline:**

```typescript
async function validateOutput(code: string, outputPath: string): Promise<ValidationReport> {
  const report: ValidationReport = {
    syntaxValid: false,
    runtimeCheckPassed: false,
    errors: [],
    warnings: []
  };

  // 1. Syntax validation (fast)
  try {
    parseSync(code, { sourceType: 'module', plugins: ['typescript'] });
    report.syntaxValid = true;
  } catch (error) {
    report.errors.push(`Syntax error: ${error.message}`);
    return report; // Stop here if syntax invalid
  }

  // 2. Runtime validation (optional, slower)
  if (outputPath) {
    try {
      const result = await execAsync(`node --check "${outputPath}"`);
      report.runtimeCheckPassed = result.exitCode === 0;
      if (result.stderr) {
        report.warnings.push(result.stderr);
      }
    } catch (error) {
      report.errors.push(`Runtime check failed: ${error.message}`);
    }
  }

  return report;
}
```

**Validation report format:**

```json
{
  "timestamp": "2025-10-30T06:53:35Z",
  "input": "test-samples/claude-code-cli.js",
  "output": "claude-code-cli.humanified.js",
  "syntaxValid": true,
  "runtimeCheckPassed": true,
  "errors": [],
  "warnings": [],
  "stats": {
    "inputSize": 9830400,
    "outputSize": 12450300,
    "identifiersRenamed": 2847,
    "processingTimeMs": 285000
  }
}
```

**What this catches:**
- Broken AST transformations
- Invalid scope.rename() operations
- Name collisions that break code
- Missing imports/exports
- Syntax errors from LLM hallucinations

**What this doesn't catch:**
- Semantic bugs (code runs but wrong behavior)
- Logic errors
- Renamed variables breaking runtime behavior

**Risk Level:** Low (read-only validation, defensive)

---

### P0-4: Test Webcrack Integration

**Status:** Not Started
**Effort:** Small (30-45 minutes)
**Dependencies:** None
**Priority:** P0 (CRITICAL)
**Spec Reference:** CLAUDE.md (Core Processing Pipeline) • **Status Reference:** STATUS-claude-code-cli.md (Section 4.2, lines 246-249)

#### Description

Verify that webcrack unbundling works on claude-code-cli.js **before** attempting full processing. Webcrack may fail on unknown bundle formats, wasting time and money.

#### Acceptance Criteria

- [ ] Manually run webcrack on claude-code-cli.js
- [ ] Verify unbundling produces valid output
- [ ] Count number of output files
- [ ] Inspect structure (multiple modules vs. single file)
- [ ] Document webcrack behavior in validation report
- [ ] If webcrack fails: add `--skip-webcrack` flag
- [ ] If webcrack succeeds: document expected output structure
- [ ] Test with `--no-beautify` to see raw unbundled output

#### Technical Notes

**Manual test command:**

```bash
# Test webcrack standalone
npx webcrack test-samples/claude-code-cli.js --output output/claude-cli-unbundled

# Check results
ls -lh output/claude-cli-unbundled/
cat output/claude-cli-unbundled/index.js | head -50

# Expected outcomes:
# Success: Multiple .js files or single unbundled file
# Failure: Error messages about unsupported format
```

**Possible outcomes:**

1. **Success - Multiple files:** Webcrack extracts webpack modules into separate files
   - Action: Process each file independently
   - Benefit: Smaller chunks, better context

2. **Success - Single file:** Webcrack reformats but doesn't split
   - Action: Process single large file
   - Benefit: Original bundle structure preserved

3. **Partial success:** Some modules extracted, some inline
   - Action: Process largest chunks first
   - Risk: Mixed quality

4. **Failure:** Webcrack crashes or produces invalid output
   - Action: Add `--skip-webcrack` flag
   - Fallback: Process minified bundle directly

**Integration points to verify:**

```typescript
// In unminify.ts, webcrack is called like:
const result = await webcrack(code);

// Verify:
// 1. result.code is valid JavaScript
// 2. result.code size is reasonable (not empty, not corrupt)
// 3. Any extracted modules are accessible
```

**Fallback strategy if webcrack fails:**

```typescript
// Add flag to skip webcrack
if (args['skip-webcrack']) {
  console.log('    → Skipping webcrack unbundling');
  return code; // Process minified bundle directly
}
```

**Document findings:**
- Webcrack version tested
- Bundle format detected (webpack/rollup/esbuild)
- Number of modules extracted
- Any warnings or errors
- Recommendation for full processing

**Risk Level:** Low (test only, no modifications)

---

## Phase 1: Progressive Validation (MANDATORY)

**Goal:** Validate approach on increasing file sizes before full attempt
**Estimated Effort:** 2-3 hours
**Estimated Cost:** $15-30 in API fees
**Success Criteria:** All validation tests pass, cost matches estimates, quality acceptable

**Philosophy:** Test small, learn fast, minimize waste.

---

### P1-1: Create Test Sample Files

**Status:** Not Started
**Effort:** Small (30 minutes)
**Dependencies:** P0-4 (webcrack tested)
**Priority:** P1 (HIGH)
**Spec Reference:** STATUS-claude-code-cli.md (Section 5, Phase 1)

#### Description

Extract progressively larger samples from claude-code-cli.js for validation testing. This allows incremental confidence building without risking full API costs.

#### Acceptance Criteria

- [ ] Create `test-samples/claude-cli-100.js` (100 lines)
- [ ] Create `test-samples/claude-cli-500.js` (500 lines)
- [ ] Create `test-samples/claude-cli-1000.js` (1000 lines)
- [ ] Ensure each sample is self-contained (valid JavaScript)
- [ ] Include representative complexity (nested scopes, references)
- [ ] Document sample characteristics (identifier count, scope depth)
- [ ] Verify samples parse with Babel
- [ ] Commit samples to repo for reproducibility

#### Technical Notes

**Extraction strategy:**

```bash
# Extract first N lines (may not be valid JS)
head -n 100 test-samples/claude-code-cli.js > test-samples/claude-cli-100.js

# Better: Extract complete statements/functions
# Use AST to find natural break points

# Validate extracted sample
npx babel test-samples/claude-cli-100.js --out-file /dev/null
# (Should succeed without errors)
```

**Sample selection criteria:**
- Include various identifier types (var, const, function)
- Include nested scopes (closures, IIFEs)
- Include references between identifiers
- Avoid truncating in middle of expressions
- Preserve string literals and comments

**Document sample stats:**

```markdown
## Test Samples

| Sample | Lines | Size | Identifiers | Scopes | Expected Cost |
|--------|-------|------|-------------|--------|---------------|
| 100    | 100   | 100KB| ~30         | 5-10   | $0.50         |
| 500    | 500   | 500KB| ~150        | 20-30  | $5.00         |
| 1000   | 1000  | 1MB  | ~300        | 40-60  | $10.00        |
| FULL   | 3791  | 9.4MB| ~2850       | 200+   | $50-200       |
```

**Risk Level:** Low (file manipulation only)

---

### P1-2: Validation Test - 100 Line Sample

**Status:** Not Started
**Effort:** Small (30 minutes)
**Dependencies:** P0-1, P0-2, P0-3, P1-1
**Priority:** P1 (HIGH)
**Cost:** ~$0.50
**Spec Reference:** STATUS-claude-code-cli.md (Section 5, Test 1)

#### Description

First real-world test with API calls. Process 100-line sample to validate tooling, cost estimation, and output quality.

#### Acceptance Criteria

- [ ] Run dry-run mode on 100-line sample
- [ ] Verify cost estimate is ~$0.50
- [ ] Run actual processing with `--turbo --perf`
- [ ] Verify processing completes without errors
- [ ] Verify actual cost matches estimate (within 20%)
- [ ] Verify memory usage is reasonable (<500MB)
- [ ] Verify output is valid JavaScript
- [ ] Manual inspection: Are names semantic?
- [ ] Manual inspection: Is code readable?
- [ ] Document results in validation report
- [ ] If failures: Stop and fix before continuing

#### Technical Notes

**Test commands:**

```bash
# Dry-run first
humanify openai test-samples/claude-cli-100.js --dry-run

# Expected output:
# Estimated identifiers: ~30
# Estimated cost: $0.50
# Estimated time: 10-15s

# Actual run
humanify openai test-samples/claude-cli-100.js --turbo --perf \
  --output output/claude-cli-100.humanified.js

# Validation
node --check output/claude-cli-100.humanified.js
cat output/claude-cli-100.humanified.js | head -50  # Manual inspection
```

**Success metrics:**
- Processing time: <30 seconds
- Memory usage: <500MB
- Actual cost: $0.40-0.60
- Output valid: ✓
- Names semantic: >70% non-generic

**Quality assessment:**

```typescript
// Count generic vs semantic names
const GENERIC_NAMES = ['data', 'temp', 'result', 'value', 'item', 'obj', 'arr'];

function assessQuality(code: string): QualityMetrics {
  const ast = parseSync(code);
  let totalIdentifiers = 0;
  let genericCount = 0;

  traverse(ast, {
    Identifier(path) {
      if (path.isBindingIdentifier()) {
        totalIdentifiers++;
        if (GENERIC_NAMES.includes(path.node.name.toLowerCase())) {
          genericCount++;
        }
      }
    }
  });

  return {
    totalIdentifiers,
    genericCount,
    semanticRatio: 1 - (genericCount / totalIdentifiers)
  };
}
```

**Failure modes to check:**
- Syntax errors in output
- Name collisions
- Missing imports/exports
- Broken references
- Memory overflow
- API errors (rate limit, timeout)

**Decision point:** Only proceed to P1-3 if this test succeeds.

**Risk Level:** Low (small file, low cost)

---

### P1-3: Validation Test - 500 Line Sample

**Status:** Not Started
**Effort:** Small (30 minutes)
**Dependencies:** P1-2 (100-line test passed)
**Priority:** P1 (HIGH)
**Cost:** ~$5.00
**Spec Reference:** STATUS-claude-code-cli.md (Section 5, Test 2)

#### Description

Medium-scale test to validate performance with larger dependency graphs and more API calls. This is 5x larger than previous test.

#### Acceptance Criteria

- [ ] Run dry-run mode on 500-line sample
- [ ] Verify cost estimate is ~$5.00
- [ ] Run actual processing with `--turbo --perf`
- [ ] Verify processing completes without errors
- [ ] Verify actual cost matches estimate (within 20%)
- [ ] Verify memory usage is reasonable (<1GB)
- [ ] Verify output is valid JavaScript
- [ ] Compare quality to 100-line test (should be similar)
- [ ] Document performance scaling (time per identifier)
- [ ] If failures: Diagnose and fix before continuing

#### Technical Notes

**Test commands:**

```bash
# Dry-run
humanify openai test-samples/claude-cli-500.js --dry-run

# Expected output:
# Estimated identifiers: ~150
# Estimated cost: $5.00
# Estimated time: 45-90s

# Actual run
humanify openai test-samples/claude-cli-500.js --turbo --perf \
  --output output/claude-cli-500.humanified.js \
  2>&1 | tee output/claude-cli-500.log

# Validation
node --check output/claude-cli-500.humanified.js
```

**Performance metrics to capture:**

```
Processing time: Xs
Time per identifier: X.XXs
Dependency graph build: Xs
Reference index build: Xs
API call time: Xs
Total cost: $X.XX
Memory peak: XXXMB
```

**Scaling analysis:**

| Metric | 100-line | 500-line | Scaling Factor |
|--------|----------|----------|----------------|
| Identifiers | 30 | 150 | 5x |
| Time | 15s | 75s | 5x (linear, good) |
| Cost | $0.50 | $5.00 | 10x (quadratic, concern?) |
| Memory | 200MB | 500MB | 2.5x (sublinear, good) |

**Red flags to watch for:**
- Quadratic time scaling (bad)
- Exponential cost scaling (very bad)
- Memory usage growing faster than file size
- Quality degradation with larger files

**Decision point:**
- If scaling is linear/sublinear: Proceed to P1-4
- If scaling is quadratic: Investigate before continuing
- If scaling is exponential: STOP, redesign needed

**Risk Level:** Low-Medium (higher cost, but still manageable)

---

### P1-4: Validation Test - 1000 Line Sample

**Status:** Not Started
**Effort:** Small (45 minutes)
**Dependencies:** P1-3 (500-line test passed)
**Priority:** P1 (HIGH)
**Cost:** ~$10.00
**Spec Reference:** STATUS-claude-code-cli.md (Section 5, Test 4)

#### Description

Large-scale validation test approaching 1/4 of full file size. This is the final confidence check before attempting full file processing.

#### Acceptance Criteria

- [ ] Run dry-run mode on 1000-line sample
- [ ] Verify cost estimate is ~$10.00
- [ ] Run actual processing with `--turbo --perf --validate`
- [ ] Verify processing completes without errors
- [ ] Verify actual cost matches estimate (within 20%)
- [ ] Verify memory usage is reasonable (<2GB)
- [ ] Verify output is valid JavaScript
- [ ] Extrapolate to full file (cost, time, memory)
- [ ] Document confidence level for full file attempt
- [ ] Make GO/NO-GO decision for Phase 2

#### Technical Notes

**Test commands:**

```bash
# Dry-run
humanify openai test-samples/claude-cli-1000.js --dry-run

# Expected output:
# Estimated identifiers: ~300
# Estimated cost: $10.00
# Estimated time: 2-4 minutes

# Actual run with full monitoring
node --max-old-space-size=4096 humanify openai test-samples/claude-cli-1000.js \
  --turbo --perf --validate \
  --output output/claude-cli-1000.humanified.js \
  2>&1 | tee output/claude-cli-1000.log
```

**Extrapolation to full file:**

```
1000-line sample results:
  Identifiers: 300
  Time: 3m
  Cost: $10.50
  Memory: 1.2GB

Full file extrapolation (3791 lines, 3.8x larger):
  Identifiers: ~1,140 (if linear)
  Time: ~11m (if linear scaling)
  Cost: $40 (if linear scaling)
  Memory: ~4.5GB (if linear scaling)

Confidence: [HIGH/MEDIUM/LOW]
Recommendation: [PROCEED/OPTIMIZE/ABORT]
```

**GO/NO-GO Decision Matrix:**

| Metric | Green (GO) | Yellow (CAUTION) | Red (NO-GO) |
|--------|-----------|------------------|-------------|
| Time scaling | Linear | Subquadratic | Quadratic+ |
| Cost scaling | Linear | 1.5x | 2x+ |
| Memory | <2GB | 2-3GB | >3GB |
| Quality | >70% | 50-70% | <50% |
| Errors | None | Warnings only | Critical errors |

**Decision outcomes:**

1. **GREEN (All metrics good):** Proceed to Phase 2 with high confidence
2. **YELLOW (Mixed):** Optimize bottlenecks before Phase 2
3. **RED (Any metric critical):** Stop, reassess approach

**Risk Level:** Medium (significant cost, but still fraction of full file)

---

### P1-5: Analyze Validation Results and Tune Parameters

**Status:** Not Started
**Effort:** Medium (1-2 hours)
**Dependencies:** P1-2, P1-3, P1-4 (all validation tests complete)
**Priority:** P1 (HIGH)
**Cost:** $0
**Spec Reference:** STATUS-claude-code-cli.md (Section 4.5, lines 264-280)

#### Description

Analyze validation test results to optimize parameters before full file processing. This fine-tuning can significantly improve quality and reduce cost.

#### Acceptance Criteria

- [ ] Compare quality metrics across 100/500/1000-line tests
- [ ] Identify optimal context window size
- [ ] Identify optimal batch size for turbo mode
- [ ] Test different dependency modes (strict/balanced/relaxed)
- [ ] Measure impact of context window on quality
- [ ] Document optimal configuration
- [ ] Update default parameters based on findings
- [ ] Create recommended command for full file

#### Technical Notes

**Parameters to tune:**

1. **Context Window Size** (affects quality):
   - Current: 2000 tokens (assumed)
   - Test: 500, 1000, 2000, 5000 tokens
   - Measure: Semantic name quality vs cost
   - Tradeoff: Larger context = better names, higher cost

2. **Batch Size** (affects parallelization):
   - Current: 10 for OpenAI, 4 for local
   - Test: 5, 10, 20, 50
   - Measure: Processing time vs rate limits
   - Tradeoff: Larger batch = faster, more rate limit risk

3. **Dependency Mode** (affects graph size):
   - Current: balanced
   - Test: strict, balanced, relaxed
   - Measure: Quality vs build time
   - Tradeoff: Strict = better context, slower

**Tuning experiments:**

```bash
# Experiment 1: Context window size (on 500-line sample)
humanify openai test-samples/claude-cli-500.js --context-window 500 -o out1.js
humanify openai test-samples/claude-cli-500.js --context-window 2000 -o out2.js
humanify openai test-samples/claude-cli-500.js --context-window 5000 -o out3.js

# Compare quality manually
# Q: Are names more semantic with larger context?
# Q: Is cost increase worth quality improvement?

# Experiment 2: Batch size (on 1000-line sample)
humanify openai test-samples/claude-cli-1000.js --turbo --batch-size 5 -o out4.js
humanify openai test-samples/claude-cli-1000.js --turbo --batch-size 20 -o out5.js

# Compare processing time
# Q: Does larger batch hit rate limits?
# Q: Is speedup significant?

# Experiment 3: Dependency mode (on 1000-line sample)
humanify openai test-samples/claude-cli-1000.js --dependency-mode strict -o out6.js
humanify openai test-samples/claude-cli-1000.js --dependency-mode relaxed -o out7.js

# Compare quality and speed
# Q: Does strict mode improve name quality?
# Q: Is balanced mode the sweet spot?
```

**Document optimal configuration:**

```markdown
## Recommended Configuration for Claude Code CLI

Based on validation tests with 100/500/1000-line samples:

**Provider:** OpenAI (gpt-4o-mini)
**Context Window:** 2000 tokens (sweet spot: quality vs cost)
**Batch Size:** 10 (avoids rate limits, good parallelization)
**Dependency Mode:** balanced (best quality/speed tradeoff)
**Turbo Mode:** Enabled (5x speedup with minimal quality loss)

**Estimated Full File:**
- Identifiers: ~2,850
- Time: ~15 minutes
- Cost: $50-75
- Memory: <3GB
- Quality: 70-80% semantic names

**Recommended Command:**
```bash
node --max-old-space-size=4096 humanify openai \
  test-samples/claude-code-cli.js \
  --turbo \
  --batch-size 10 \
  --context-window 2000 \
  --dependency-mode balanced \
  --perf \
  --validate \
  --output output/claude-code-cli.humanified.js
```
```

**Risk Level:** Low (analysis only, no API calls)

---

## Phase 2: Full File Processing (HIGH STAKES)

**Goal:** Process complete claude-code-cli.js with confidence
**Estimated Effort:** 1-2 hours
**Estimated Cost:** $50-200 in API fees
**Success Criteria:** File processes successfully, output is readable, cost is acceptable

**WARNING:** Only proceed if Phase 1 validation passed all tests.

---

### P2-1: Pre-Flight Checklist and Environment Setup

**Status:** Not Started
**Effort:** Small (15 minutes)
**Dependencies:** P1-5 (parameters tuned), Phase 0 complete
**Priority:** P1 (HIGH)
**Cost:** $0

#### Description

Final preparation before expensive full file processing. Verify all systems are ready and contingencies are in place.

#### Acceptance Criteria

- [ ] Verify Phase 2 optimizations are complete (reference index)
- [ ] Verify all tests pass (npm run test)
- [ ] Clear dependency cache (fresh run)
- [ ] Ensure adequate disk space (>500MB free)
- [ ] Set Node.js heap size (`--max-old-space-size=4096`)
- [ ] Prepare logging/monitoring
- [ ] Document start time and environment
- [ ] Backup original file
- [ ] Set cost alarm ($200 maximum)

#### Technical Notes

**Pre-flight checklist:**

```markdown
## Full File Processing Pre-Flight Checklist

- [ ] Phase 1 validation: ✅ All tests passed
- [ ] Phase 2 optimizations: ✅ Reference index implemented
- [ ] Test suite: ✅ 85/86 tests passing
- [ ] Optimal config: ✅ Parameters tuned
- [ ] Disk space: ✅ >500MB available
- [ ] Memory limit: ✅ --max-old-space-size=4096
- [ ] Cost budget: ✅ $200 maximum approved
- [ ] Backup: ✅ Original file saved
- [ ] Logging: ✅ Output piped to log file
- [ ] Time allocation: ✅ 1-2 hours reserved

Current environment:
- Node version: v20.x.x
- HumanifyJS version: x.x.x
- OpenAI API: ✅ Key configured
- Cache: ✅ Cleared for fresh run
- Start time: 2025-10-30 07:00:00

Expected outcomes:
- Processing time: 15-30 minutes
- Cost: $50-100
- Memory peak: 2-4GB
- Output size: 12-15MB

Contingency plan:
- If crashes: Resume from checkpoint (if implemented)
- If cost exceeds $150: Abort and reassess
- If quality poor: Manual cleanup required

Approved by: [Your Name]
Date: 2025-10-30
```

**Environment setup:**

```bash
# Set memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Verify configuration
node --version
humanify --version
echo $OPENAI_API_KEY | cut -c1-8  # Verify key is set

# Clear cache for fresh run
rm -rf .humanify-cache/

# Create output directory
mkdir -p output/claude-cli-full

# Backup original
cp test-samples/claude-code-cli.js test-samples/claude-code-cli.js.backup
```

**Risk Level:** Low (preparation only)

---

### P2-2: Dry-Run on Full File

**Status:** Not Started
**Effort:** Small (5 minutes)
**Dependencies:** P2-1
**Priority:** P1 (HIGH)
**Cost:** $0

#### Description

Final cost/time estimate before committing to full processing. This is the last chance to abort if estimates are unacceptable.

#### Acceptance Criteria

- [ ] Run dry-run mode on full claude-code-cli.js
- [ ] Review cost estimate
- [ ] Review time estimate
- [ ] Review memory estimate
- [ ] Compare to extrapolations from Phase 1
- [ ] Make final GO/NO-GO decision
- [ ] Document decision rationale

#### Technical Notes

**Dry-run command:**

```bash
humanify openai test-samples/claude-code-cli.js --dry-run
```

**Expected output:**

```
🔍 Dry-run analysis for: test-samples/claude-code-cli.js
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File Information:
  Size:                  9.4 MB
  Lines:                 3,791
  Estimated identifiers: 2,847

Processing Configuration:
  Provider:              OpenAI (gpt-4o-mini)
  Turbo mode:            Enabled
  Batch size:            10
  Context window:        2000 tokens
  Dependency mode:       balanced

API Call Estimates:
  Total API calls:       285
  Avg tokens/call:       400
  Total tokens:          114,000

Cost Estimates:
  Total estimated cost:  $68.40

Time Estimates:
  Parallel time:         ~18 minutes

Memory Estimates:
  Peak memory:           ~3.2 GB

⚠️  This is a large file - ensure Phase 1 validation passed.

Proceed with processing? [y/N]
```

**Decision matrix:**

| Estimate | Expected (from P1) | Acceptable? | Action |
|----------|-------------------|-------------|--------|
| Cost | $50-100 | $68 | ✅ GO |
| Time | 15-30min | 18min | ✅ GO |
| Memory | 2-4GB | 3.2GB | ✅ GO |
| Confidence | HIGH | HIGH | ✅ GO |

**If any estimate exceeds acceptable range:** ABORT and reassess.

**Risk Level:** Low (analysis only)

---

### P2-3: Execute Full File Processing

**Status:** Not Started
**Effort:** Large (15-30 minutes processing + monitoring)
**Dependencies:** P2-2 (dry-run approved)
**Priority:** P1 (HIGH)
**Cost:** $50-100 (actual)

#### Description

The main event: Process full claude-code-cli.js with optimized parameters. Monitor closely for errors, memory issues, or unexpected behavior.

#### Acceptance Criteria

- [ ] Run full processing with optimal configuration
- [ ] Monitor progress in real-time
- [ ] Capture complete log output
- [ ] Verify processing completes without errors
- [ ] Check final memory usage
- [ ] Verify output file is created
- [ ] Run validation on output
- [ ] Document actual cost, time, and quality
- [ ] Save all artifacts (logs, validation reports)

#### Technical Notes

**Processing command:**

```bash
# Full command with all options
time node --max-old-space-size=4096 \
  dist/index.mjs openai test-samples/claude-code-cli.js \
  --turbo \
  --batch-size 10 \
  --context-window 2000 \
  --dependency-mode balanced \
  --perf \
  --validate \
  --output output/claude-cli-full/claude-code-cli.humanified.js \
  2>&1 | tee output/claude-cli-full/processing.log

# Monitor in separate terminal
watch -n 5 'tail -20 output/claude-cli-full/processing.log'

# Monitor memory
watch -n 10 'ps aux | grep humanify | head -1'
```

**What to watch for:**

1. **Progress updates:** Should see regular progress % increases
2. **Memory usage:** Should stay under 4GB
3. **API errors:** Rate limits, timeouts (should retry automatically)
4. **Warnings:** Context window truncations, name collisions
5. **Performance:** Should match Phase 1 extrapolations

**Success indicators:**

```
Processing: 100%
Dependency graph built in X.XXs
Reference index built in X.XXs
Renamed 2,847 identifiers
Validation: ✅ Output is valid JavaScript
Total cost: $XX.XX
Total time: XXm XXs
Memory peak: XXXMB
Output: output/claude-cli-full/claude-code-cli.humanified.js
```

**Failure scenarios:**

1. **Out of memory:** Increase `--max-old-space-size`, retry
2. **Rate limit:** Reduce `--batch-size`, retry
3. **Validation fails:** Review errors, may need manual fixes
4. **Cost exceeds budget:** Abort if >$200

**If processing fails:**
- Capture error logs
- Document failure point (% complete)
- Determine if resumable (checkpoint feature)
- Decide: Fix and retry vs. alternative approach

**Risk Level:** HIGH (expensive, time-consuming, can fail)

---

### P2-4: Validate and Analyze Output

**Status:** Not Started
**Effort:** Medium (1-2 hours)
**Dependencies:** P2-3 (processing complete)
**Priority:** P1 (HIGH)
**Cost:** $0

#### Description

Comprehensive validation and quality assessment of the deobfuscated output. This determines if the output meets success criteria.

#### Acceptance Criteria

- [ ] Verify output file exists and is non-empty
- [ ] Verify output is valid JavaScript (syntax check)
- [ ] Verify output size is reasonable (not truncated)
- [ ] Run quality assessment (semantic name ratio)
- [ ] Manual code review (sample 10-20 functions)
- [ ] Compare to original (structural similarity)
- [ ] Identify high-quality sections
- [ ] Identify poor-quality sections (for manual cleanup)
- [ ] Document overall quality score
- [ ] Make recommendations for improvement

#### Technical Notes

**Validation commands:**

```bash
# File size check
ls -lh output/claude-cli-full/claude-code-cli.humanified.js

# Syntax validation
node --check output/claude-cli-full/claude-code-cli.humanified.js

# Quality assessment
humanify assess-quality output/claude-cli-full/claude-code-cli.humanified.js

# Side-by-side comparison
code --diff test-samples/claude-code-cli.js \
  output/claude-cli-full/claude-code-cli.humanified.js
```

**Quality metrics:**

```typescript
interface QualityReport {
  totalIdentifiers: number;
  renamedIdentifiers: number;
  semanticNames: number;
  genericNames: number;
  semanticRatio: number; // 0-1
  avgNameLength: number;
  longNames: number; // >50 chars, likely hallucinations
  qualityScore: number; // 0-100

  breakdown: {
    excellent: number; // >90% semantic
    good: number;      // 70-90%
    fair: number;      // 50-70%
    poor: number;      // <50%
  };
}
```

**Manual review checklist:**

- [ ] Sample 5 renamed functions: Are names accurate?
- [ ] Check 5 renamed variables: Are they semantic?
- [ ] Review complex nested scopes: Are they readable?
- [ ] Check for name collisions: Any obvious bugs?
- [ ] Review error handling: Still intact?
- [ ] Check imports/exports: Correct?
- [ ] Overall readability: 1-10 scale

**Quality classification:**

| Score | Classification | Action Required |
|-------|----------------|-----------------|
| 90-100 | Excellent | Minor touch-ups only |
| 70-89 | Good | Some manual cleanup |
| 50-69 | Fair | Significant manual work |
| 30-49 | Poor | Major rework needed |
| 0-29 | Failed | Consider alternative approach |

**Document findings:**

```markdown
## Full File Processing Results

### Execution Metrics
- Start time: 2025-10-30 07:00:00
- End time: 2025-10-30 07:18:23
- Duration: 18m 23s
- Identifiers processed: 2,847
- API calls: 285
- Actual cost: $72.50

### Quality Metrics
- Semantic names: 2,150 (75.5%)
- Generic names: 697 (24.5%)
- Quality score: 76/100
- Classification: Good

### Breakdown by Section
- Main entry point: Excellent (95%)
- CLI argument parsing: Good (78%)
- Core logic: Good (72%)
- Helper utilities: Fair (65%)
- Error handling: Poor (45%)

### Recommendations
1. Manual review of error handling (45% quality)
2. Rename ~700 generic names manually
3. Add comments to complex sections
4. Estimated cleanup time: 2-4 hours

### Overall Assessment
✅ SUCCESS - Output is usable with moderate cleanup
```

**Risk Level:** Low (analysis only, no modifications)

---

### P2-5: Create Processing Report and Archive Artifacts

**Status:** Not Started
**Effort:** Small (30 minutes)
**Dependencies:** P2-4 (validation complete)
**Priority:** P2 (MEDIUM)
**Cost:** $0

#### Description

Document the complete end-to-end processing experience for future reference and lessons learned.

#### Acceptance Criteria

- [ ] Create comprehensive processing report
- [ ] Document actual vs. estimated metrics
- [ ] Archive all logs and artifacts
- [ ] Document lessons learned
- [ ] Identify improvement opportunities
- [ ] Create reproducible workflow
- [ ] Update project documentation
- [ ] Share results with stakeholders

#### Technical Notes

**Report location:** `.agent_planning/CLAUDE-CLI-PROCESSING-REPORT-2025-10-30.md`

**Report structure:**

```markdown
# Claude Code CLI Processing Report

## Executive Summary
[Success/Partial Success/Failure]

## Processing Details
- Input: test-samples/claude-code-cli.js (9.4MB)
- Output: claude-code-cli.humanified.js (12.3MB)
- Provider: OpenAI (gpt-4o-mini)
- Configuration: [list all parameters]

## Metrics Comparison

| Metric | Estimated | Actual | Variance |
|--------|-----------|--------|----------|
| Identifiers | 2,850 | 2,847 | -0.1% |
| Time | 18min | 18m23s | +2.1% |
| Cost | $68.40 | $72.50 | +6.0% |
| Memory | 3.2GB | 2.9GB | -9.4% |
| Quality | 70-80% | 76% | On target |

## Validation Results
[From P2-4]

## Lessons Learned

### What Worked Well
1. Progressive validation saved time/money
2. Dry-run prevented cost overruns
3. Turbo mode performed as expected
4. Memory monitoring prevented crashes

### What Could Be Improved
1. Context window tuning needed more testing
2. Error handling sections had poor quality
3. Batch size could be optimized further

### Surprises
1. Processing faster than expected
2. Quality better than worst-case scenario
3. Memory usage lower than estimated

## Recommendations

### For Next Large File
1. Use same progressive validation approach
2. Increase context window for complex sections
3. Add section-specific processing (error handling needs special attention)

### For Tool Improvements
1. Implement checkpointing (P3-2)
2. Add quality-guided reprocessing
3. Domain-specific prompt tuning

## Artifacts
- Processing log: output/claude-cli-full/processing.log
- Validation report: output/claude-cli-full/validation.json
- Output file: output/claude-cli-full/claude-code-cli.humanified.js
- Quality report: output/claude-cli-full/quality-report.json
```

**Archive structure:**

```
output/claude-cli-full/
├── claude-code-cli.humanified.js
├── processing.log
├── validation.json
├── quality-report.json
├── memory-profile.txt
└── README.md (summary)
```

**Risk Level:** Low (documentation only)

---

## Phase 3: Quality Improvement (CONDITIONAL)

**Goal:** Improve output quality if Phase 2 results are suboptimal
**Estimated Effort:** 4-8 hours
**Estimated Cost:** $20-100 (reprocessing costs)
**Success Criteria:** Quality score improves by 10-20 points

**Trigger Condition:** Phase 2 quality score <70 OR user requests improvements

---

### P3-1: Identify Quality Improvement Opportunities

**Status:** Not Started
**Effort:** Medium (1-2 hours)
**Dependencies:** P2-4 (quality assessment complete)
**Priority:** P2 (MEDIUM)
**Cost:** $0

#### Description

Analyze Phase 2 output to identify specific sections or patterns that need improvement. Focus improvement efforts on highest-impact areas.

#### Acceptance Criteria

- [ ] Identify low-quality sections (quality <50%)
- [ ] Categorize issues (generic names, wrong names, truncation)
- [ ] Prioritize by impact (frequently used functions first)
- [ ] Estimate effort for manual vs. automated fixes
- [ ] Create improvement action plan
- [ ] Document expected quality improvement

#### Technical Notes

**Analysis approach:**

1. **Quantitative analysis:**
   - Parse output AST
   - Score each function/class by name quality
   - Identify bottom 20% (worst quality)

2. **Qualitative analysis:**
   - Manual review of critical sections
   - Identify naming patterns (LLM tendencies)
   - Check for systematic issues

3. **Root cause analysis:**
   - Why did certain sections fail?
   - Insufficient context?
   - Complex code structure?
   - LLM model limitations?

**Improvement strategies:**

| Issue | Cause | Solution | Cost |
|-------|-------|----------|------|
| Generic names | Small context window | Increase window, reprocess | $10-20 |
| Wrong names | Missing dependencies | Stricter dependency mode | $20-40 |
| Truncated context | Large scopes | Section-specific processing | Manual |
| Hallucinations | LLM creativity | Manual review/fix | Manual |

**Prioritization:**

1. **High priority:** Core logic functions (most used)
2. **Medium priority:** Utility functions (moderately used)
3. **Low priority:** Edge cases, error handlers (rarely used)

**Risk Level:** Low (analysis only)

---

### P3-2: Implement Section-Specific Reprocessing

**Status:** Not Started
**Effort:** Medium (2-3 hours)
**Dependencies:** P3-1
**Priority:** P2 (MEDIUM)
**Cost:** $10-30

#### Description

Reprocess low-quality sections with optimized parameters (larger context, better prompts) without redoing entire file.

#### Acceptance Criteria

- [ ] Extract low-quality sections
- [ ] Reprocess with increased context window
- [ ] Reprocess with stricter dependency mode
- [ ] Reprocess with better prompts (if implemented)
- [ ] Merge improved sections back into output
- [ ] Validate merged output
- [ ] Measure quality improvement

#### Technical Notes

**Selective reprocessing:**

```bash
# Extract poor-quality section (lines 1000-1500)
sed -n '1000,1500p' output/claude-cli-full/claude-code-cli.humanified.js \
  > temp/section-to-improve.js

# Reprocess with optimized parameters
humanify openai temp/section-to-improve.js \
  --context-window 5000 \  # 2.5x larger
  --dependency-mode strict \
  --output temp/section-improved.js

# Merge back into full output (manual or scripted)
# Replace lines 1000-1500 with improved version
```

**Merge strategy:**

1. **Manual merge:** Copy-paste improved sections
2. **Script merge:** Use sed/awk to replace line ranges
3. **AST merge:** Parse both, swap subtrees (safest)

**Quality verification:**

```typescript
// Compare before/after for specific section
const before = assessQuality(originalSection);
const after = assessQuality(improvedSection);

console.log(`Quality improvement: ${before.score} → ${after.score} (+${after.score - before.score})`);
```

**Risk Level:** Medium (can introduce inconsistencies)

---

### P3-3: Manual Cleanup Pass

**Status:** Not Started
**Effort:** Large (4-8 hours)
**Dependencies:** P2-4 or P3-2
**Priority:** P3 (LOW)
**Cost:** $0

#### Description

Manual review and cleanup of remaining generic names, incorrect names, and unclear sections. This is human time, not API cost.

#### Acceptance Criteria

- [ ] Review all functions in priority order
- [ ] Fix generic names manually
- [ ] Fix obviously wrong names
- [ ] Add explanatory comments
- [ ] Verify no name collisions introduced
- [ ] Run validation after changes
- [ ] Final quality assessment

#### Technical Notes

**Manual cleanup checklist:**

```markdown
## Manual Cleanup Tasks

### High Priority (Core Functions)
- [ ] Fix main() function (currently: processData)
- [ ] Fix CLI entry point (currently: handleCommand)
- [ ] Fix error handler (currently: errorCallback)
- [... 20-50 more items]

### Medium Priority (Utilities)
- [ ] Fix string formatter (currently: formatString)
- [ ] Fix config loader (currently: loadConfig)
- [... 50-100 more items]

### Low Priority (Edge Cases)
- [ ] Review error messages
- [ ] Check debug logging
- [... 100+ items]
```

**Cleanup workflow:**

1. Open humanified file in IDE
2. Go to next item on checklist
3. Read surrounding code for context
4. Determine correct name
5. Rename using IDE refactoring (safe)
6. Add comment explaining function
7. Mark item as complete
8. Repeat

**Quality gates:**

- After every 10 renames: Run validation
- After every 50 renames: Test build
- After complete pass: Final validation

**Estimated time:** 4-8 hours (depends on file complexity and quality starting point)

**Risk Level:** Low (manual review is safe, IDE handles renames)

---

### P3-4: Add Domain-Specific Knowledge

**Status:** Not Started
**Effort:** Medium (2-3 hours)
**Dependencies:** Code understanding
**Priority:** P3 (LOW)
**Cost:** $0

#### Description

Enhance LLM prompts with domain-specific knowledge about Claude Code CLI to improve naming accuracy. This requires understanding what the code actually does.

#### Acceptance Criteria

- [ ] Analyze original Claude Code CLI functionality
- [ ] Document key modules and their purposes
- [ ] Create domain glossary (CLI terms, AI terms, etc.)
- [ ] Update LLM prompts to include domain context
- [ ] (Optional) Reprocess with enhanced prompts
- [ ] Measure quality improvement

#### Technical Notes

**Domain knowledge to capture:**

```markdown
## Claude Code CLI Domain Knowledge

### Primary Functions
- CLI argument parsing (commander.js)
- AI model interaction (Anthropic API)
- Code analysis and execution
- File system operations
- Session management

### Common Patterns
- `handle*` prefix for event handlers
- `*Command` suffix for command implementations
- `*Provider` suffix for API clients
- `validate*` prefix for validation functions

### Key Terms
- Tools, Functions, Prompts (AI concepts)
- Sessions, Contexts, Conversations (state management)
- Artifacts, Responses, Completions (API types)
```

**Enhanced prompt example:**

```typescript
// Before (generic):
const prompt = `Rename this JavaScript variable to be semantic based on its usage: ${code}`;

// After (domain-specific):
const prompt = `
You are renaming variables in the Claude Code CLI codebase,
a tool for AI-assisted code development.

Common patterns:
- handle* for event handlers
- *Command for CLI commands
- validate* for validation
- *Provider for API clients

Rename this variable: ${code}
`;
```

**Reprocessing decision:**
- If Phase 2 quality <60%: Worth reprocessing with enhanced prompts
- If Phase 2 quality 60-80%: Manual cleanup faster
- If Phase 2 quality >80%: Not needed

**Risk Level:** Low (prompt improvement)

---

## Phase 4: Production Readiness (POLISH)

**Goal:** Prepare tools and processes for future large file processing
**Estimated Effort:** 4-6 hours
**Estimated Cost:** $0
**Success Criteria:** Reproducible workflow, lessons learned documented

---

### P4-1: Implement Progress Checkpointing

**Status:** Not Started
**Effort:** Large (3-4 hours)
**Dependencies:** None
**Priority:** P2 (MEDIUM)
**Cost:** $0
**Spec Reference:** STATUS-claude-code-cli.md (Section 4.6, lines 273-280)

#### Description

Add ability to save progress during processing and resume from last checkpoint if crash or interruption occurs. Critical for multi-hour processing runs.

#### Acceptance Criteria

- [ ] Save checkpoint every N identifiers (default: 100)
- [ ] Checkpoint includes: renamed AST, remaining identifiers, API usage
- [ ] Add `--resume` flag to continue from checkpoint
- [ ] Detect existing checkpoint on start
- [ ] Prompt user to resume or start fresh
- [ ] Validate checkpoint integrity
- [ ] Clean up checkpoints on successful completion
- [ ] Test crash recovery scenario

#### Technical Notes

**Checkpoint format:**

```typescript
interface Checkpoint {
  version: string;
  timestamp: number;
  inputFile: string;
  inputHash: string;

  progress: {
    totalIdentifiers: number;
    processedIdentifiers: number;
    percentComplete: number;
  };

  state: {
    renamedAST: string; // Serialized AST
    remainingIdentifiers: string[]; // Names to process
    dependencyGraph: any; // Cached graph
  };

  usage: {
    apiCalls: number;
    totalCost: number;
    elapsedSeconds: number;
  };
}
```

**Checkpoint file location:**

```
.humanify-checkpoints/
  └── <input-file-hash>/
      ├── checkpoint-latest.json
      ├── checkpoint-0100.json
      ├── checkpoint-0200.json
      └── ...
```

**Resume logic:**

```typescript
async function resumeFromCheckpoint(checkpoint: Checkpoint) {
  console.log(`Found checkpoint: ${checkpoint.progress.percentComplete}% complete`);
  console.log(`Resume from checkpoint? [Y/n]`);

  const answer = await promptUser();

  if (answer === 'y') {
    // Load state
    const ast = deserializeAST(checkpoint.state.renamedAST);
    const remaining = checkpoint.state.remainingIdentifiers;

    // Continue processing from where we left off
    return processIdentifiers(ast, remaining, checkpoint.usage);
  } else {
    // Start fresh
    return processFromScratch();
  }
}
```

**Checkpoint frequency:**

- Small files (<500 ids): Every 100 identifiers
- Medium files (500-2000 ids): Every 250 identifiers
- Large files (>2000 ids): Every 500 identifiers

**Benefits:**

- Crash recovery (power loss, OOM, etc.)
- Pausable processing (can stop and resume later)
- Cost tracking (know exactly how much spent so far)

**Risk Level:** Medium (complexity in state serialization)

---

### P4-2: Add Cost Tracking and Budget Limits

**Status:** Not Started
**Effort:** Medium (1-2 hours)
**Dependencies:** None
**Priority:** P2 (MEDIUM)
**Cost:** $0
**Spec Reference:** STATUS-claude-code-cli.md (Section 4.8, lines 286-289)

#### Description

Track actual API costs during processing and abort if budget exceeded. Prevents runaway costs from bugs or misestimation.

#### Acceptance Criteria

- [ ] Add `--max-cost` flag (in dollars, default: 100)
- [ ] Track token usage for each API call
- [ ] Calculate running cost total
- [ ] Display cost in progress updates
- [ ] Abort if cost exceeds limit
- [ ] Save cost report at end
- [ ] Support cost tracking for all providers

#### Technical Notes

**Cost tracking:**

```typescript
class CostTracker {
  private totalInputTokens = 0;
  private totalOutputTokens = 0;
  private provider: 'openai' | 'gemini' | 'local';
  private model: string;

  recordUsage(inputTokens: number, outputTokens: number) {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
  }

  getCurrentCost(): number {
    const pricing = PRICING[this.provider][this.model];
    const inputCost = (this.totalInputTokens / 1_000_000) * pricing.input;
    const outputCost = (this.totalOutputTokens / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  }

  checkBudget(maxCost: number): boolean {
    return this.getCurrentCost() <= maxCost;
  }
}
```

**Progress display with cost:**

```
Processing: 45% (1,280 / 2,847 identifiers)
API calls: 128 / 285
Current cost: $32.50 / $100.00 budget
Time elapsed: 8m 23s
```

**Budget exceeded handling:**

```typescript
if (!costTracker.checkBudget(maxCost)) {
  console.error(`\n❌ Budget exceeded: $${costTracker.getCurrentCost().toFixed(2)} / $${maxCost}`);
  console.error(`Processing stopped at ${progress}% complete`);
  console.error(`Use --max-cost ${Math.ceil(costTracker.getCurrentCost() * 1.5)} to continue`);
  process.exit(1);
}
```

**Cost report:**

```markdown
## API Cost Report

Provider: OpenAI (gpt-4o-mini)
Processing: test-samples/claude-code-cli.js

Token Usage:
- Input tokens: 57,234
- Output tokens: 62,108
- Total tokens: 119,342

Cost Breakdown:
- Input: $8.59 (57,234 tokens @ $0.150/1M)
- Output: $37.26 (62,108 tokens @ $0.600/1M)
- Total: $45.85

API Calls: 285
Avg cost per call: $0.16
```

**Risk Level:** Low (tracking only, defensive)

---

### P4-3: Create End-to-End Workflow Documentation

**Status:** Not Started
**Effort:** Medium (2-3 hours)
**Dependencies:** All Phase 2 tasks complete
**Priority:** P3 (LOW)
**Cost:** $0

#### Description

Document the complete workflow for processing large minified files based on lessons learned from claude-code-cli.js processing.

#### Acceptance Criteria

- [ ] Create step-by-step guide
- [ ] Document all flags and options
- [ ] Include cost estimates table
- [ ] Provide troubleshooting guide
- [ ] Add examples for different file sizes
- [ ] Document quality expectations
- [ ] Create quick reference guide
- [ ] Update CLAUDE.md with workflow

#### Technical Notes

**Documentation location:**
- `docs/LARGE-FILE-WORKFLOW.md` (detailed)
- `CLAUDE.md` (quick reference)

**Content outline:**

```markdown
# Large File Deobfuscation Workflow

## Overview
How to successfully process large (>1MB) minified JavaScript files.

## Prerequisites
- Phase 2 optimizations complete
- OpenAI API key configured
- Node.js v20+
- Adequate disk space (input size × 5)

## Step-by-Step Process

### Step 1: Preparation (5 minutes)
1. Analyze input file characteristics
2. Estimate cost with dry-run
3. Prepare environment (memory, disk)
4. Set budget limits

### Step 2: Validation (30-60 minutes, $10-20)
1. Create test samples (100/500/1000 lines)
2. Process samples
3. Analyze quality and performance
4. Tune parameters

### Step 3: Full Processing (variable, $50-200)
1. Final dry-run check
2. Execute full processing
3. Monitor progress
4. Validate output

### Step 4: Quality Review (1-2 hours)
1. Run quality assessment
2. Manual review of critical sections
3. Cleanup as needed

## Cost Estimates by File Size

| File Size | Lines | Identifiers | Time | Cost (OpenAI) | Cost (Gemini) |
|-----------|-------|-------------|------|---------------|---------------|
| 1 MB | 400 | 300 | 2-3min | $10 | $5 |
| 5 MB | 2,000 | 1,500 | 8-12min | $50 | $25 |
| 10 MB | 4,000 | 3,000 | 15-25min | $100 | $50 |
| 20 MB | 8,000 | 6,000 | 30-50min | $200 | $100 |

## Troubleshooting

### Out of Memory
**Symptom:** Process crashes with heap error
**Solution:** Increase Node heap size: `--max-old-space-size=8192`

### Cost Too High
**Symptom:** Dry-run estimates exceed budget
**Solutions:**
1. Use Gemini (2x cheaper)
2. Reduce context window
3. Process file in sections
4. Use local LLM (free but slower)

### Poor Quality
**Symptom:** Output has many generic names
**Solutions:**
1. Increase context window (up to 5000 tokens)
2. Use stricter dependency mode
3. Try different LLM model
4. Manual cleanup

### Rate Limits
**Symptom:** API errors during processing
**Solution:** Reduce batch size: `--batch-size 5`

## Best Practices

1. **Always validate first** - Process samples before full file
2. **Use dry-run** - Never process without cost estimate
3. **Enable turbo** - 5-10x faster with minimal quality loss
4. **Set budgets** - Use --max-cost to prevent overruns
5. **Monitor progress** - Watch for errors and memory
6. **Validate output** - Always check output is valid JS
7. **Backup originals** - Keep original files safe

## Examples

### Small File (1MB)
```bash
humanify openai small.js --turbo --output small.humanified.js
```

### Medium File (5MB)
```bash
# Dry-run first
humanify openai medium.js --dry-run

# Process with monitoring
node --max-old-space-size=4096 humanify openai medium.js \
  --turbo --perf --validate --max-cost 75 \
  --output medium.humanified.js
```

### Large File (10MB+)
```bash
# Full workflow with checkpointing
node --max-old-space-size=8192 humanify openai large.js \
  --turbo --perf --validate \
  --max-cost 150 \
  --context-window 2000 \
  --batch-size 10 \
  --output large.humanified.js
```
```

**Risk Level:** Low (documentation only)

---

### P4-4: Archive Lessons Learned and Update Planning Docs

**Status:** Not Started
**Effort:** Small (1 hour)
**Dependencies:** All phases complete
**Priority:** P3 (LOW)
**Cost:** $0

#### Description

Document complete experience, update planning files, and archive artifacts for future reference.

#### Acceptance Criteria

- [ ] Update STATUS file with final outcomes
- [ ] Archive this PLAN file
- [ ] Document lessons learned
- [ ] Identify future improvements
- [ ] Update TODO.md if applicable
- [ ] Clean up old planning files (keep 4 most recent)
- [ ] Create retrospective document

#### Technical Notes

**Retrospective questions:**

1. **What went well?**
   - Progressive validation approach
   - Cost estimation accuracy
   - Memory monitoring
   - Quality of output

2. **What could be improved?**
   - Parameter tuning process
   - Documentation clarity
   - Error handling
   - Recovery mechanisms

3. **What surprised us?**
   - Actual vs. estimated metrics
   - Quality variations
   - Performance bottlenecks
   - Cost factors

4. **What would we do differently?**
   - Earlier testing at scale
   - Better prompts
   - Different provider/model
   - Alternative approach

5. **What should be prioritized next?**
   - Tool improvements
   - Feature additions
   - Bug fixes
   - Documentation

**Planning file retention:**

```bash
# Keep 4 most recent of each type
cd .agent_planning

# Status files
ls -t STATUS-*.md | tail -n +5 | xargs -I {} mv {} archive/{}.archived

# Plan files
ls -t PLAN-*.md | tail -n +5 | xargs -I {} mv {} archive/{}.archived

# Current active plan
mv PLAN-claude-code-cli-2025-10-30-065335.md \
   archive/PLAN-claude-code-cli-2025-10-30-065335.md.archived
```

**Risk Level:** Low (documentation only)

---

## Dependency Graph

```
Phase 0: Validation Framework
┌──────────────────────────────────────┐
│ P0-1: Dry-Run ────┐                  │
│ P0-2: Memory ─────┼──→ Phase 1       │
│ P0-3: Validation ─┤                  │
│ P0-4: Webcrack ───┘                  │
└──────────────────────────────────────┘
              ↓
Phase 1: Progressive Validation
┌──────────────────────────────────────┐
│ P1-1: Test Samples                   │
│   ↓                                  │
│ P1-2: 100-line Test (+ $0.50)        │
│   ↓                                  │
│ P1-3: 500-line Test (+ $5.00)        │
│   ↓                                  │
│ P1-4: 1000-line Test (+ $10.00)      │
│   ↓                                  │
│ P1-5: Tune Parameters                │
└──────────────────────────────────────┘
              ↓
        GO/NO-GO Decision
              ↓
Phase 2: Full File Processing
┌──────────────────────────────────────┐
│ P2-1: Pre-Flight Checklist           │
│   ↓                                  │
│ P2-2: Dry-Run Full File              │
│   ↓                                  │
│ P2-3: Execute (+ $50-100) ──┐        │
│   ↓                         │        │
│ P2-4: Validate Output       │        │
│   ↓                         │        │
│ P2-5: Create Report         │        │
└──────────────────────────────────────┘
              ↓                │
         Quality <70?          │
              ↓                │
Phase 3: Quality Improvement (Optional)
┌──────────────────────────────────────┐
│ P3-1: Identify Opportunities         │
│   ↓                                  │
│ P3-2: Reprocess Sections (+ $10-30)  │
│   ↓                                  │
│ P3-3: Manual Cleanup                 │
│   ↓                                  │
│ P3-4: Domain Knowledge               │
└──────────────────────────────────────┘
              ↓
Phase 4: Production Readiness
┌──────────────────────────────────────┐
│ P4-1: Checkpointing ─────────────┐   │
│ P4-2: Cost Tracking ─────────────┼───│
│ P4-3: Workflow Documentation ────┤   │
│ P4-4: Lessons Learned ───────────┘   │
└──────────────────────────────────────┘
```

---

## Risk Assessment and Mitigation

### Technical Risks

**Risk #1: Memory Overflow**
- **Probability:** Low (20%) - Phase 1 validation will surface this
- **Impact:** High - Process crash, lost work
- **Mitigation:**
  - Memory monitoring (P0-2)
  - Set adequate heap size
  - Test with 1000-line sample first
- **Fallback:** Process file in chunks, use streaming parser

**Risk #2: Cost Overrun**
- **Probability:** Medium (30%) - Estimates can be wrong
- **Impact:** Medium - Unexpected charges
- **Mitigation:**
  - Dry-run before processing (P0-1)
  - Budget limits (P4-2)
  - Progressive validation (Phase 1)
- **Fallback:** Abort early, use cheaper provider

**Risk #3: Poor Output Quality**
- **Probability:** Medium (40%) - LLMs are unpredictable
- **Impact:** Medium - Manual cleanup required
- **Mitigation:**
  - Parameter tuning (P1-5)
  - Section-specific reprocessing (P3-2)
  - Manual review (P3-3)
- **Fallback:** Accept 60-70% quality, manual cleanup

**Risk #4: Webcrack Failure**
- **Probability:** Low (15%) - Most bundles are webpack
- **Impact:** Medium - Can't unbundle, process as-is
- **Mitigation:**
  - Test webcrack first (P0-4)
  - Add --skip-webcrack flag
- **Fallback:** Process minified bundle directly

**Risk #5: API Rate Limits**
- **Probability:** Low (10%) - OpenAI limits are generous
- **Impact:** Low - Automatic retry with backoff
- **Mitigation:**
  - Batch size tuning
  - Exponential backoff (already implemented)
- **Fallback:** Reduce batch size, sequential mode

**Risk #6: Processing Timeout**
- **Probability:** Very Low (5%) - 18min estimated
- **Impact:** Medium - Lost progress
- **Mitigation:**
  - Checkpointing (P4-1)
  - Time estimates in dry-run
- **Fallback:** Resume from checkpoint

### Project Risks

**Risk #7: Unrealistic Expectations**
- **Probability:** High (60%) - Users expect perfect deobfuscation
- **Impact:** High - Disappointment, perceived failure
- **Reality:** Even best AI can't fully restore original code
- **Mitigation:**
  - Set clear expectations upfront (80-90% goal)
  - Show example outputs from validation
  - Document limitations
- **Communication:** "90% readable is a huge win, not a failure"

**Risk #8: Tool Immaturity**
- **Probability:** High (70%) - Never tested at this scale
- **Impact:** Medium - Bugs, edge cases, failures
- **Reality:** This is essentially a beta test
- **Mitigation:**
  - Comprehensive validation (Phase 1)
  - Bug fixes as discovered
  - Iterative improvement
- **Expectation:** Some trial and error is normal

**Risk #9: Time Investment**
- **Probability:** Medium (40%) - May take longer than expected
- **Impact:** Medium - Opportunity cost
- **Mitigation:**
  - Clear effort estimates
  - Phase-based approach (can stop early)
  - Automation where possible
- **Decision:** Is 15-20 hours worth it for this file?

---

## Cost-Benefit Analysis

### Total Investment

**Development Time:**
- Phase 0: 3-4 hours (validation framework)
- Phase 1: 2-3 hours (progressive validation)
- Phase 2: 1-2 hours (full file processing)
- Phase 3: 4-8 hours (quality improvement, if needed)
- Phase 4: 4-6 hours (production readiness)
- **Total: 14-23 hours**

**API Costs:**
- Phase 1 validation: $15-30
- Phase 2 full file: $50-100
- Phase 3 reprocessing: $10-30 (if needed)
- **Total: $75-160**

**Total Investment: 14-23 hours + $75-160**

### Expected Outcomes

**Best Case (30% probability):**
- Clean implementation, no surprises
- Quality: 85-95% semantic names
- Minimal manual cleanup (2-4 hours)
- **Result:** Highly readable code

**Likely Case (50% probability):**
- Some issues, manageable fixes
- Quality: 70-85% semantic names
- Moderate manual cleanup (4-8 hours)
- **Result:** Readable code with some effort

**Worst Case (20% probability):**
- Multiple failures, significant debugging
- Quality: 50-70% semantic names
- Extensive manual cleanup (8-16 hours)
- **Result:** Marginal improvement

### ROI Calculation

**Value of deobfuscated code:**
- Understanding codebase: Saves 20-40 hours of manual analysis
- Debugging capability: Priceless for troubleshooting
- Learning from code: Educational value
- Security analysis: Can identify vulnerabilities

**Breakeven Analysis:**
- If output saves >20 hours of manual work: Positive ROI
- If output quality <60%: Negative ROI (easier to analyze minified)

**Recommendation:** Proceed, but with realistic expectations. Even 70% quality is a significant win over analyzing minified code.

---

## Recommended Sprint Planning

### Sprint 0: Foundation (1 day, $0)
**Goal:** Build validation framework

Tasks:
- P0-1: Dry-run mode
- P0-2: Memory monitoring
- P0-3: Output validation
- P0-4: Webcrack testing

**Exit Criteria:** All P0 tasks complete, tools ready

---

### Sprint 1: Validation (0.5 day, $15-30)
**Goal:** Validate approach with progressive testing

Tasks:
- P1-1: Create test samples
- P1-2: 100-line test
- P1-3: 500-line test
- P1-4: 1000-line test
- P1-5: Tune parameters

**Exit Criteria:** GO/NO-GO decision made

---

### Sprint 2: Execution (0.5 day, $50-100)
**Goal:** Process full file

Tasks:
- P2-1: Pre-flight
- P2-2: Dry-run
- P2-3: Execute
- P2-4: Validate
- P2-5: Report

**Exit Criteria:** Full file processed, quality assessed

---

### Sprint 3: Improvement (Optional, 1-2 days, $10-30)
**Goal:** Improve quality if needed

Tasks:
- P3-1: Identify opportunities
- P3-2: Reprocess sections
- P3-3: Manual cleanup
- P3-4: Domain knowledge

**Exit Criteria:** Quality >70%

---

### Sprint 4: Polish (Optional, 1 day, $0)
**Goal:** Production readiness

Tasks:
- P4-1: Checkpointing
- P4-2: Cost tracking
- P4-3: Documentation
- P4-4: Retrospective

**Exit Criteria:** Reproducible workflow, lessons documented

---

## Success Metrics

**Phase 0 (Validation Framework):**
- ✅ All 4 P0 tasks implemented
- ✅ Dry-run produces accurate estimates
- ✅ Memory monitoring works
- ✅ Output validation catches errors
- ✅ Webcrack behavior documented

**Phase 1 (Progressive Validation):**
- ✅ All 3 test samples process successfully
- ✅ Cost matches estimates (within 20%)
- ✅ Memory usage acceptable (<2GB for 1000-line)
- ✅ Quality acceptable (>60% semantic names)
- ✅ Scaling is linear or sublinear

**Phase 2 (Full File):**
- ✅ Processing completes without crashes
- ✅ Cost <$150
- ✅ Time <2 hours
- ✅ Output is valid JavaScript
- ✅ Quality >60% (minimum viable)
- ✅ Actual metrics match estimates

**Phase 3 (Quality Improvement):**
- ✅ Quality improves by 10-20 points
- ✅ Critical sections are readable
- ✅ Generic names reduced significantly

**Overall Success:**
- ✅ Deobfuscated code is usable for analysis
- ✅ Manual cleanup time <16 hours
- ✅ Total cost <$200
- ✅ Lessons learned documented
- ✅ Reproducible workflow established

---

## Final Recommendations

### Critical Success Factors

1. **DO NOT skip Phase 0** - Validation framework prevents expensive failures
2. **DO NOT skip Phase 1** - Progressive validation builds confidence incrementally
3. **DO use dry-run** - Always estimate before executing
4. **DO monitor closely** - Watch progress, memory, costs
5. **DO set realistic expectations** - 70-80% quality is a win
6. **DO document everything** - Lessons learned are valuable

### When to Proceed

**GREEN LIGHT (GO):**
- ✅ Phase 2 optimizations complete
- ✅ Phase 0 framework implemented
- ✅ Phase 1 validation passed (all tests)
- ✅ Cost estimate acceptable (<$150)
- ✅ Time budget available (1-2 hours)
- ✅ Realistic expectations set

**YELLOW LIGHT (CAUTION):**
- ⚠️ Some Phase 1 tests have issues
- ⚠️ Cost estimate high ($150-250)
- ⚠️ Quality in validation is marginal (60-70%)
- ⚠️ Memory usage concerning (2-3GB for 1000-line)

**RED LIGHT (STOP):**
- ❌ Phase 1 validation failed
- ❌ Cost estimate exceeds budget (>$250)
- ❌ Quality consistently poor (<60%)
- ❌ Memory issues in validation
- ❌ Webcrack fails completely

### Alternative Approaches (If RED)

1. **Use local LLM:** Free but slower (4-8 hours)
2. **Process sections only:** Focus on critical functions
3. **Format only:** Use prettier, skip renaming
4. **Manual analysis:** Traditional reverse engineering
5. **Hybrid approach:** Automate 20%, manual 80%

---

## Conclusion

Processing claude-code-cli.js is **feasible but risky** without proper validation. This plan provides a structured, incremental approach that minimizes wasted effort and cost.

**Key Principles:**
- **Test small, learn fast** - Progressive validation
- **Estimate before execute** - Dry-run always
- **Monitor everything** - Memory, cost, quality
- **Set expectations** - 70-80% is success
- **Document learnings** - Future self will thank you

**Total Timeline:** 3-5 days (depending on quality requirements)
**Total Cost:** $75-160 in API fees
**Total Effort:** 14-23 hours of work
**Expected Quality:** 70-85% readable (with Phase 3)
**Probability of Success:** 70% (with this plan), 20% (without)

**Final Decision:** RECOMMEND PROCEEDING with Phase 0 → Phase 1 → GO/NO-GO decision before Phase 2.

---

**END OF PLAN**
