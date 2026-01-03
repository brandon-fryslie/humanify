# Sprint Plan: Dashboard Real Data Integration (Final)

**Generated**: 2025-12-31
**Approach**: Direct TypeScript integration with real-time progress

## Sprint Goal

Make the experiment dashboard fully functional with real data: direct turbo-v2 execution, real-time progress updates, and complete metrics display.

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  Express Backend │────▶│  Turbo-V2 Lib   │
│                 │     │                  │     │                 │
│  - ExperimentList│    │  - /api/experiments│   │  - MultiPass    │
│  - ExperimentDetail│  │  - /api/progress SSE│  │  - Ledger       │
│  - Progress Bar │◀────│  - run-experiment │◀───│  - Vault        │
└─────────────────┘ SSE └──────────────────┘     └─────────────────┘
```

**Key Decision**: Use Server-Sent Events (SSE) for real-time progress (simpler than WebSocket for one-way updates).

---

## Scope

**In scope (this sprint):**
1. Direct turbo-v2 TypeScript integration
2. Ledger-based metrics extraction
3. Cost calculation
4. **Real-time progress via SSE**

**Out of scope:**
- ~~Console log streaming~~ (not needed - we have structured progress)

---

## Work Items

### P0: Direct Turbo-V2 Integration

**What**: Call `executeTurboV2()` directly instead of shell commands

**Files**:
- `src/turbo-v2/webapp/server/run-experiment.ts` - Rewrite

**Implementation**:
```typescript
import { executeTurboV2 } from "../../../turbo-v2/cli/turbo-v2-command.js";
import { resolve, join } from "path";

const PROJECT_ROOT = resolve(__dirname, "../../../../..");

export async function runExperiment(experimentId: string): Promise<void> {
  const experiment = storage.getExperiment(experimentId);

  for (const sample of experiment.samples) {
    const inputPath = join(PROJECT_ROOT, "test-samples/canonical", sample, "minified.js");
    const outputDir = join(PROJECT_ROOT, ".humanify-experiments", experimentId, sample);

    await executeTurboV2({
      inputPath,
      outputDir,
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      preset: experiment.preset,
      checkpointDir: join(PROJECT_ROOT, ".humanify-checkpoints"),
    });

    // Extract metrics and update storage...
  }
}
```

**Acceptance Criteria**:
- [ ] No `execSync()` or shell commands
- [ ] `executeTurboV2()` imported and called directly
- [ ] Paths resolve correctly from project root
- [ ] Output files created at expected locations

---

### P0: Real-Time Progress via SSE

**What**: Stream progress updates to frontend as experiment runs

**Architecture**:
```
Frontend                    Backend                     Turbo-V2
   │                           │                           │
   │  GET /api/progress/:id    │                           │
   │ ─────────────────────────▶│                           │
   │                           │  Poll Ledger events.jsonl │
   │  SSE: {pass: 1, batch: 3} │◀──────────────────────────│
   │ ◀─────────────────────────│                           │
   │  SSE: {pass: 1, batch: 4} │                           │
   │ ◀─────────────────────────│                           │
   │  SSE: {status: completed} │                           │
   │ ◀─────────────────────────│                           │
```

**Files**:
- `src/turbo-v2/webapp/server/api/progress.ts` - NEW (SSE endpoint)
- `src/turbo-v2/webapp/server/lib/ledger-watcher.ts` - NEW (poll Ledger)
- `src/turbo-v2/webapp/client/hooks/useExperimentProgress.ts` - NEW

**Backend SSE Endpoint**:
```typescript
// progress.ts
import { Router, Request, Response } from "express";
import { watchLedger } from "../lib/ledger-watcher.js";

export const progressRouter = Router();

progressRouter.get("/:id/progress", async (req: Request, res: Response) => {
  const { id } = req.params;

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Watch Ledger for this experiment's job
  const cleanup = watchLedger(id, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);

    if (event.type === "JOB_COMPLETED" || event.type === "JOB_FAILED") {
      res.end();
    }
  });

  req.on("close", cleanup);
});
```

**Ledger Watcher**:
```typescript
// ledger-watcher.ts
import { watch } from "fs";
import { Ledger } from "../../../../turbo-v2/ledger/ledger.js";

export function watchLedger(
  experimentId: string,
  onEvent: (event: ProgressEvent) => void
): () => void {
  const jobDir = findJobDir(experimentId);
  const eventsFile = join(jobDir, "events.jsonl");

  let lastLineCount = 0;

  const watcher = watch(eventsFile, async () => {
    const ledger = new Ledger(jobDir);
    const events = await ledger.getEvents();

    // Emit only new events
    for (let i = lastLineCount; i < events.length; i++) {
      const event = events[i];
      onEvent(transformToProgressEvent(event));
    }
    lastLineCount = events.length;
  });

  return () => watcher.close();
}

function transformToProgressEvent(ledgerEvent: LedgerEvent): ProgressEvent {
  switch (ledgerEvent.type) {
    case "PASS_STARTED":
      return { type: "pass_started", passNumber: ledgerEvent.passNumber, totalPasses: ledgerEvent.totalPasses };
    case "BATCH_COMPLETED":
      return {
        type: "batch_completed",
        passNumber: ledgerEvent.passNumber,
        batchNumber: ledgerEvent.batchNumber,
        processed: ledgerEvent.stats.identifiersProcessed,
        tokens: ledgerEvent.stats.tokensUsed.total,
      };
    case "PASS_COMPLETED":
      return { type: "pass_completed", passNumber: ledgerEvent.passNumber, stats: ledgerEvent.stats };
    case "JOB_COMPLETED":
      return { type: "completed", success: ledgerEvent.success };
    default:
      return { type: "progress" };
  }
}
```

**Frontend Hook**:
```typescript
// useExperimentProgress.ts
import { useState, useEffect } from "react";

interface ProgressState {
  status: "idle" | "running" | "completed" | "failed";
  currentPass: number;
  totalPasses: number;
  currentBatch: number;
  totalBatches: number;
  identifiersProcessed: number;
  tokensUsed: number;
}

export function useExperimentProgress(experimentId: string | null) {
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    if (!experimentId) return;

    const eventSource = new EventSource(`/api/experiments/${experimentId}/progress`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(prev => ({
        ...prev,
        ...data,
      }));
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [experimentId]);

  return progress;
}
```

**Acceptance Criteria**:
- [ ] SSE endpoint streams events as Ledger updates
- [ ] Frontend receives real-time progress updates
- [ ] Progress shows: pass X/Y, batch N/M, identifiers processed, tokens used
- [ ] Connection closes when job completes

---

### P0: Metrics Extraction from Ledger

**What**: Read final metrics from Ledger after job completes

**Files**:
- `src/turbo-v2/webapp/server/lib/metrics-extractor.ts` - NEW

**Implementation**:
```typescript
import { Ledger } from "../../../../turbo-v2/ledger/ledger.js";

export interface ExtractedMetrics {
  tokens: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  identifiersProcessed: number;
  identifiersRenamed: number;
  passCount: number;
  durationMs: number;
}

export async function extractMetrics(jobDir: string): Promise<ExtractedMetrics> {
  const ledger = new Ledger(jobDir);
  const state = await ledger.getState();

  // Aggregate from pass results
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
    durationMs: state.totalDurationMs || 0,
  };
}
```

**Acceptance Criteria**:
- [ ] Reads Ledger state after job completes
- [ ] Returns accurate token counts (matches CLI output)
- [ ] Aggregates across multi-pass jobs

---

### P0: Cost Calculation

**What**: Calculate API costs from token usage

**Files**:
- `src/turbo-v2/webapp/server/lib/cost-calculator.ts` - NEW

**Implementation**:
```typescript
const PRICING = {
  "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
  "gpt-4o": { input: 2.50 / 1_000_000, output: 10.00 / 1_000_000 },
};

export function calculateCost(
  tokens: { promptTokens: number; completionTokens: number },
  model: string = "gpt-4o-mini"
) {
  const pricing = PRICING[model] || PRICING["gpt-4o-mini"];

  const prompt = tokens.promptTokens * pricing.input;
  const completion = tokens.completionTokens * pricing.output;

  return { prompt, completion, total: prompt + completion };
}
```

**Acceptance Criteria**:
- [ ] Correct pricing for gpt-4o-mini and gpt-4o
- [ ] Returns { prompt, completion, total }

---

### P1: Progress UI Components

**What**: Update frontend to display real-time progress

**Files**:
- `src/turbo-v2/webapp/client/components/ExperimentDetail.tsx` - Update
- `src/turbo-v2/webapp/client/components/ExperimentList.tsx` - Update

**Progress Display**:
```
┌─────────────────────────────────────────────────┐
│ Running: tiny-qs                                │
│                                                 │
│ Pass 2/3 (rename:parallel:50)                   │
│ ████████████░░░░░░░░░░░░░░░░░░ 42%              │
│                                                 │
│ Batch 8/20 | 840/2000 identifiers               │
│ Tokens: 45.2K | Est. cost: $0.008               │
└─────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] Progress bar shows during execution
- [ ] Pass number and batch number displayed
- [ ] Token count updates in real-time
- [ ] Estimated cost shown

---

## File Summary

**New Files**:
- `server/api/progress.ts` - SSE endpoint
- `server/lib/ledger-watcher.ts` - Watch Ledger for updates
- `server/lib/metrics-extractor.ts` - Extract final metrics
- `server/lib/cost-calculator.ts` - Calculate costs
- `client/hooks/useExperimentProgress.ts` - Progress hook

**Modified Files**:
- `server/run-experiment.ts` - Direct turbo-v2 integration
- `server/index.ts` - Add progress router
- `client/components/ExperimentDetail.tsx` - Progress UI
- `client/components/ExperimentList.tsx` - Running indicator

---

## Estimated Effort

| Item | Hours |
|------|-------|
| Direct turbo-v2 integration | 2-3 |
| SSE progress endpoint | 2-3 |
| Ledger watcher | 1-2 |
| Metrics extraction | 1 |
| Cost calculation | 0.5 |
| Progress UI | 2 |
| Testing | 2 |
| **Total** | **10-13 hours** |

---

## Success Criteria

After this sprint:
1. Click "Run" → experiment executes turbo-v2 directly
2. **Real-time progress bar** shows pass/batch progress
3. **Live token counter** updates as processing runs
4. After completion:
   - Score > 0
   - All token counts populated
   - Cost breakdown shown
   - Identifiers tracked
5. Compare view works with real data
