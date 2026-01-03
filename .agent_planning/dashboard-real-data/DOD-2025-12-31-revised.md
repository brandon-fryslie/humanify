# Definition of Done: Dashboard Real Data Integration (Revised)

**Generated**: 2025-12-31
**Revision**: TypeScript integration approach

---

## Sprint Scope

**2 critical deliverables:**
1. Direct turbo-v2 TypeScript integration (no shell commands)
2. Ledger-based metrics extraction + cost calculation

**Deferred:**
- Console log streaming
- Real-time WebSocket progress
- Sample validation

---

## Acceptance Criteria

### Deliverable 1: Direct Turbo-V2 Integration

#### AC-1.1: TypeScript Import
- [ ] `run-experiment.ts` imports `executeTurboV2` from `turbo-v2/cli/turbo-v2-command.js`
- [ ] No `execSync()`, `spawn()`, or shell command execution
- [ ] All imports resolve correctly (no module not found errors)

#### AC-1.2: Path Resolution
- [ ] `PROJECT_ROOT` constant points to repository root
- [ ] Sample files found at `{PROJECT_ROOT}/test-samples/canonical/{sample}/minified.js`
- [ ] Output written to `{PROJECT_ROOT}/.humanify-experiments/{expId}/{sample}/`
- [ ] Works regardless of current working directory

#### AC-1.3: Execution
- [ ] `executeTurboV2()` called with correct options (inputPath, outputDir, preset, provider)
- [ ] OPENAI_API_KEY passed from environment
- [ ] Experiment completes without throwing errors
- [ ] Output file created and contains valid JavaScript

---

### Deliverable 2: Metrics Extraction & Cost Calculation

#### AC-2.1: Ledger Reading
- [ ] `extractMetricsFromLedger(jobDir)` function reads Ledger state
- [ ] Returns `{ tokens, identifiersProcessed, identifiersRenamed, passCount }`
- [ ] Handles multi-pass experiments (sums tokens across passes)

#### AC-2.2: Token Counts
- [ ] `tokens.promptTokens` > 0 after experiment
- [ ] `tokens.completionTokens` > 0 after experiment
- [ ] `tokens.totalTokens` = promptTokens + completionTokens

#### AC-2.3: Cost Calculation
- [ ] `calculateCost(tokens, model)` returns `{ prompt, completion, total }`
- [ ] gpt-4o-mini pricing: $0.15/1M input, $0.60/1M output
- [ ] gpt-4o pricing: $2.50/1M input, $10.00/1M output
- [ ] Cost values are non-zero for completed experiments

#### AC-2.4: Data Population
- [ ] `SampleResult.tokens` populated with token counts
- [ ] `SampleResult.cost` populated with cost breakdown
- [ ] `SampleResult.identifiersProcessed` populated
- [ ] `SampleResult.identifiersRenamed` populated
- [ ] `SampleResult.score` populated (from semantic scorer)
- [ ] `SampleResult.duration` populated (execution time)

---

## Sprint Complete When

### Functional Requirements
- [ ] Create experiment via UI → experiment created with pending status
- [ ] Click "Run" → experiment executes turbo-v2 processing
- [ ] Experiment detail view shows ALL of:
  - Score > 0
  - Duration > 0
  - Prompt tokens > 0
  - Completion tokens > 0
  - Total tokens > 0
  - Prompt cost > 0
  - Completion cost > 0
  - Total cost > 0
  - Identifiers processed > 0
  - Identifiers renamed > 0
- [ ] Compare view displays real metrics in charts

### Quality Requirements
- [ ] No shell commands (pure TypeScript)
- [ ] Cost calculation unit tests pass
- [ ] Metrics extraction handles missing fields gracefully
- [ ] Errors logged but don't crash the server

---

## Smoke Test

```bash
# 1. Start servers
cd src/turbo-v2/webapp && npm start

# 2. In browser: http://localhost:3457
#    - Click "+ New Experiment"
#    - Select preset: "fast"
#    - Select sample: "tiny-qs"
#    - Click "Create"

# 3. Click "Run" on the experiment

# 4. Wait for completion (1-2 minutes)

# 5. Click "View Details" - verify ALL fields show real numbers:
#    - Score: 60-90 (semantic similarity)
#    - Duration: 30-90s
#    - Prompt tokens: ~10K-20K
#    - Completion tokens: ~2K-5K
#    - Total cost: ~$0.01-0.02
#    - Identifiers processed: ~100-200
#    - Identifiers renamed: ~50-150
```

---

## Files Changed

**Modified:**
- `src/turbo-v2/webapp/server/run-experiment.ts` - Complete rewrite

**Created:**
- `src/turbo-v2/webapp/server/lib/metrics-extractor.ts`
- `src/turbo-v2/webapp/server/lib/cost-calculator.ts`

---

## Verification Time

Estimated: 30-60 minutes (includes running one full experiment)
