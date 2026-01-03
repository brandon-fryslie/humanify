# Sprint Plan: Dashboard Real Data Integration (Revised)

**Generated**: 2025-12-31
**Revision**: TypeScript integration (no shell commands)

## Sprint Goal

Make the experiment dashboard functional with real data by directly importing and calling turbo-v2 TypeScript modules, extracting metrics from the Ledger, and populating all UI fields.

## Key Architecture Decision

**BEFORE (Shell execution - BAD)**:
```typescript
execSync(`npx tsx src/cli.ts unminify ... --turbo-v2`);
```

**AFTER (Direct TypeScript import - GOOD)**:
```typescript
import { executeTurboV2 } from "../../turbo-v2/cli/turbo-v2-command.js";
import { Ledger } from "../../turbo-v2/ledger/ledger.js";

await executeTurboV2({
  inputPath,
  outputDir,
  provider: "openai",
  preset,
});

const ledger = new Ledger(jobDir);
const state = await ledger.getState();
// state.totalTokensUsed, state.totalIdentifiersRenamed, etc.
```

---

## Scope

**In scope (this sprint):**
1. Direct turbo-v2 TypeScript integration in dashboard runner
2. Ledger-based metrics extraction (tokens, identifiers, duration)
3. Cost calculation from token counts

**Explicitly out of scope (future sprints):**
- Console log streaming to UI
- Real-time progress via WebSocket
- Sample file validation at creation
- Advanced retry/error handling

---

## Work Items

### P0: Direct Turbo-V2 Integration

**What**: Replace shell execution with direct TypeScript imports

**Files to modify**:
- `src/turbo-v2/webapp/server/run-experiment.ts` - Complete rewrite

**Implementation**:
```typescript
import { executeTurboV2, TurboV2Options } from "../../turbo-v2/cli/turbo-v2-command.js";
import { Ledger } from "../../turbo-v2/ledger/ledger.js";
import { join, resolve } from "path";

const PROJECT_ROOT = resolve(__dirname, "../../../../..");

async function runSample(
  experimentId: string,
  sample: SampleName,
  preset: string,
  mode: ProcessingMode
): Promise<SampleResult> {
  const startTime = performance.now();

  // Resolve paths from project root
  const inputPath = join(PROJECT_ROOT, "test-samples/canonical", sample, "minified.js");
  const outputDir = join(PROJECT_ROOT, ".humanify-experiments", experimentId, sample);
  const checkpointDir = join(PROJECT_ROOT, ".humanify-checkpoints");

  const options: TurboV2Options = {
    inputPath,
    outputDir,
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    preset,
    checkpointDir,
    quiet: false,
  };

  await executeTurboV2(options);

  // Read metrics from Ledger
  const jobDir = findLatestJobDir(checkpointDir); // Find the job that just ran
  const ledger = new Ledger(jobDir);
  const state = await ledger.getState();

  const duration = (performance.now() - startTime) / 1000;

  return {
    sample,
    duration,
    tokens: {
      promptTokens: state.tokenStats?.prompt || 0,
      completionTokens: state.tokenStats?.completion || 0,
      totalTokens: state.totalTokensUsed || 0,
    },
    identifiersProcessed: state.totalIdentifiersProcessed || 0,
    identifiersRenamed: state.totalIdentifiersRenamed || 0,
    outputPath: join(outputDir, "output.js"),
  };
}
```

**Acceptance Criteria**:
- [ ] `run-experiment.ts` imports `executeTurboV2` directly (no `execSync`)
- [ ] Path resolution uses `PROJECT_ROOT` constant (works from any working directory)
- [ ] Sample files load correctly: tiny-qs, small-axios, medium-chart
- [ ] Output files written to `.humanify-experiments/{expId}/{sample}/`
- [ ] No "module not found" or path errors

---

### P0: Ledger-Based Metrics Extraction

**What**: Read token counts and identifier stats from the Ledger after execution

**Key insight**: The Ledger stores ALL events with full metrics:
```typescript
interface LedgerState {
  jobId: string;
  totalTokensUsed: number;
  totalIdentifiersRenamed: number;
  passResults: PassResult[];
  // Each PassResult has stats.tokensUsed.{prompt, completion, total}
}
```

**Files to create/modify**:
- `src/turbo-v2/webapp/server/lib/metrics-extractor.ts` - NEW

**Implementation**:
```typescript
import { Ledger, LedgerState } from "../../../turbo-v2/ledger/ledger.js";
import { TokenUsage, CostBreakdown } from "../../shared/types.js";

interface ExtractedMetrics {
  tokens: TokenUsage;
  identifiersProcessed: number;
  identifiersRenamed: number;
  passCount: number;
}

export async function extractMetricsFromLedger(jobDir: string): Promise<ExtractedMetrics> {
  const ledger = new Ledger(jobDir);
  const state = await ledger.getState();

  // Aggregate tokens across all passes
  let promptTokens = 0;
  let completionTokens = 0;

  for (const pass of state.passResults || []) {
    promptTokens += pass.stats?.tokensUsed?.prompt || 0;
    completionTokens += pass.stats?.tokensUsed?.completion || 0;
  }

  return {
    tokens: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    identifiersProcessed: state.totalIdentifiersProcessed || 0,
    identifiersRenamed: state.totalIdentifiersRenamed || 0,
    passCount: state.completedPasses || 0,
  };
}
```

**Acceptance Criteria**:
- [ ] `extractMetricsFromLedger()` returns accurate token counts from Ledger
- [ ] Token counts match what's displayed in turbo-v2 CLI output
- [ ] Identifier counts (processed, renamed) populated
- [ ] Works for multi-pass experiments (sums across passes)

---

### P0: Cost Calculation

**What**: Calculate API costs from token counts

**Pricing (as of 2025)**:
| Model | Input | Output |
|-------|-------|--------|
| gpt-4o-mini | $0.150/1M | $0.600/1M |
| gpt-4o | $2.50/1M | $10.00/1M |

**Files to create**:
- `src/turbo-v2/webapp/server/lib/cost-calculator.ts` - NEW

**Implementation**:
```typescript
import { TokenUsage, CostBreakdown } from "../../shared/types.js";

const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
  "gpt-4o": { input: 2.50 / 1_000_000, output: 10.00 / 1_000_000 },
};

export function calculateCost(tokens: TokenUsage, model: string = "gpt-4o-mini"): CostBreakdown {
  const pricing = PRICING[model] || PRICING["gpt-4o-mini"];

  const prompt = tokens.promptTokens * pricing.input;
  const completion = tokens.completionTokens * pricing.output;

  return {
    prompt,
    completion,
    total: prompt + completion,
  };
}
```

**Acceptance Criteria**:
- [ ] `calculateCost({ promptTokens: 1000, completionTokens: 500 }, "gpt-4o-mini")` returns ~$0.00045
- [ ] Supports both gpt-4o-mini and gpt-4o pricing
- [ ] Returns CostBreakdown with prompt, completion, total fields

---

### P1: Scoring Integration

**What**: Run semantic scoring after turbo-v2 completes

**Note**: The scoring script already exists at `scripts/score-semantic.ts`

**Implementation** (in run-experiment.ts):
```typescript
import { scoreOutput } from "./lib/scorer.js";

// After turbo-v2 completes
const score = await scoreOutput(
  join(PROJECT_ROOT, "test-samples/canonical", sample, "original.js"),
  outputPath
);
```

**Acceptance Criteria**:
- [ ] Score is calculated by comparing output to original
- [ ] Score appears in SampleResult (0-100 scale)
- [ ] Scoring errors don't crash the experiment (return score: 0 with error)

---

### P1: Wire Everything Together

**What**: Update the runner to populate all SampleResult fields

**Final SampleResult structure**:
```typescript
interface SampleResult {
  sample: SampleName;
  score?: number;                    // From semantic scorer
  duration?: number;                 // From timing
  outputPath?: string;               // File path
  error?: string;                    // If failed

  // NEW - from Ledger
  tokens?: TokenUsage;               // { promptTokens, completionTokens, totalTokens }
  cost?: CostBreakdown;              // { prompt, completion, total }
  identifiersProcessed?: number;
  identifiersRenamed?: number;
}
```

**Acceptance Criteria**:
- [ ] All SampleResult fields populated after experiment runs
- [ ] UI displays all metrics (tokens, costs, identifiers, score, duration)
- [ ] Compare view charts show real data

---

## Dependencies

1. **turbo-v2 infrastructure must be working** - Sprints 1-9 already complete ✓
2. **Test samples must exist** - Already at `test-samples/canonical/` ✓
3. **OPENAI_API_KEY must be set** - User responsibility
4. **Scoring script must work** - `scripts/score-semantic.ts` exists ✓

---

## Risks

| Risk | Mitigation |
|------|------------|
| Import path issues (ESM vs CJS) | Use `.js` extensions, test imports first |
| Ledger state format changes | Add defensive coding, handle missing fields |
| Token counts don't match expected | Add logging, compare with CLI output |
| Scoring script fails | Graceful degradation (score: 0, log error) |

---

## Estimated Effort

| Item | Hours |
|------|-------|
| Direct turbo-v2 integration | 2-3 |
| Ledger metrics extraction | 1-2 |
| Cost calculation | 0.5 |
| Scoring integration | 1 |
| Wiring + testing | 2-3 |
| **Total** | **6-9 hours** |

---

## Testing Strategy

### Unit Tests
1. `cost-calculator.test.ts` - Pricing calculations
2. `metrics-extractor.test.ts` - Ledger parsing (mock Ledger)

### Integration Tests
1. Run `executeTurboV2()` on tiny-qs, verify output exists
2. Extract metrics from Ledger, verify non-zero values
3. Calculate cost, verify reasonable range

### E2E Tests
1. Create experiment via API
2. Run experiment
3. Verify all fields populated in response
4. Verify UI displays data correctly

---

## Success Criteria

After this sprint:
1. User creates experiment, clicks "Run"
2. Experiment actually executes turbo-v2 processing
3. Experiment detail shows:
   - Score > 0 (semantic similarity)
   - Duration > 0
   - Tokens: promptTokens, completionTokens, totalTokens (all > 0)
   - Cost: prompt, completion, total (all > 0)
   - Identifiers: processed, renamed (both > 0)
4. Compare view charts display real data
