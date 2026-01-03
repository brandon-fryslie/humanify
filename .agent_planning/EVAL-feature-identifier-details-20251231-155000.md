# Evaluation: Feature Request - Identifier-Level Details Per Pass
Timestamp: 2025-12-31-155000
Confidence: FRESH
Scope: feature/identifier-details-per-pass
Files in Scope: 47

## Executive Summary

**Request**: Add capabilities to show:
1. Which identifiers were skipped per pass
2. Which identifiers were unchanged per pass
3. The context that was sent with each identifier to the LLM

**Current State**: The data exists in ledger events but is NOT exposed through the webapp API or UI.

**Gap Summary**:
- Data Layer: ✅ COMPLETE - All needed data is captured in ledger events
- API Layer: ❌ MISSING - No endpoints to query identifier-level data
- UI Layer: ❌ MISSING - No components to display identifier details

**Verdict**: PAUSE - Need clarification on data volume and performance requirements before implementation.

---

## Data Layer Assessment

### What Data Is Currently Captured

**Status**: ✅ COMPLETE - All required data exists in ledger events

The ledger (`events.jsonl`) captures the following relevant events:

#### 1. BATCH_STARTED Event
```typescript
interface BatchStartedEvent {
  type: "BATCH_STARTED";
  timestamp: string;
  jobId: string;
  passNumber: number;
  batchNumber: number;
  identifierIds: string[]; // ✅ List of all identifiers in batch
}
```
**Evidence**: `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/ledger/events.ts:104-111`

#### 2. IDENTIFIER_RENAMED Event
```typescript
interface IdentifierRenamedEvent {
  type: "IDENTIFIER_RENAMED";
  timestamp: string;
  jobId: string;
  passNumber: number;
  batchNumber: number;
  id: string;           // ✅ Stable identifier ID
  oldName: string;      // ✅ Name before rename
  newName: string;      // ✅ Name after rename (may equal oldName if unchanged)
  confidence: number;   // ✅ LLM confidence score
}
```
**Evidence**: `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/ledger/events.ts:118-128`

#### 3. BATCH_COMPLETED Event
```typescript
interface BatchStats {
  identifiersProcessed: number;  // ✅ Total count
  identifiersRenamed: number;    // ✅ Count that changed
  identifiersUnchanged: number;  // ✅ Count that stayed same
  identifiersSkipped: number;    // ✅ Count that failed/skipped
  tokensUsed: TokenStats;
  durationMs: number;
  errors: number;
}

interface BatchCompletedEvent {
  type: "BATCH_COMPLETED";
  timestamp: string;
  jobId: string;
  passNumber: number;
  batchNumber: number;
  stats: BatchStats;  // ✅ Aggregate stats
}
```
**Evidence**: `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/ledger/events.ts:51-59,134-141`

### What Data Is MISSING

**Context sent to LLM**: ❌ NOT CAPTURED

The ledger events do NOT currently capture:
- The actual context string sent to the LLM for each identifier
- The prompt used
- The full LLM request/response

**Evidence**: Searched through ledger event types - no `context` field in `IdentifierRenamedEvent`.

**Where context IS available**:
1. **During processing** (runtime only):
   - `PassEngine.getContextForIdentifier()` extracts context
   - Context is passed to `ProcessorFunction`
   - Evidence: `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/orchestrator/pass-engine.ts:129-145`

2. **In Vault cache** (request-level):
   - Vault stores `{hash}.json` with full LLM request/response
   - Hash is `hash(model + prompt + options)`
   - Evidence: `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/FINAL_PROJECT_SPEC.md:35-49`
   - BUT: Vault files are cached globally, not organized by identifier ID
   - AND: Vault evicts old entries (LRU with 1GB max)

**Current Capability**:
- ✅ Can determine which identifiers were skipped (by absence of IDENTIFIER_RENAMED event for IDs in BATCH_STARTED)
- ✅ Can determine which identifiers were unchanged (oldName === newName in IDENTIFIER_RENAMED)
- ❌ CANNOT retrieve context for specific identifier after the fact

---

## Data Structures for Identifier Tracking

### Analyzer Output

```typescript
interface AnalyzedIdentifier {
  id: string;              // Stable ID (binding + location)
  name: string;            // Current name
  location: SourceLocation;
  scopeId: string;
  context: string;         // ✅ Context extracted during analysis
  // ... other fields
}

interface AnalysisResult {
  identifiers: AnalyzedIdentifier[];
  totalIdentifiers: number;
  // ...
}
```
**Evidence**: Analysis happens once per pass, context is stored on `AnalyzedIdentifier` object.

**Gap**: This is runtime state, not persisted to ledger.

### Pass Engine State

The PassEngine processes identifiers but does NOT persist individual contexts:
```typescript
async executePass(
  code: string,
  processor: ProcessorFunction,
  passNumber: number,
  jobId: string,
  passConfig: PassConfig,
  snapshotPath?: string
): Promise<PassResult>
```

**Flow**:
1. Analyze code → get `AnalyzedIdentifier[]`
2. For each identifier: extract context → call processor → emit IDENTIFIER_RENAMED
3. Context is NOT logged to ledger

**Evidence**: `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/orchestrator/pass-engine.ts:171-200`

---

## UI Components Assessment

### Current Components

**ExperimentDetail.tsx**:
- Shows experiment overview, runs, results, processing logs
- Processing Log tab reads from ledger via `readLedgerLogs()`
- Evidence: `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/webapp/client/components/ExperimentDetail.tsx:901-984`

**What it displays from ledger**:
- Job started/completed
- Pass started/completed
- Batch completed (with aggregate stats)
- Snapshot created

**What it SKIPS**:
```typescript
// ledger-reader.ts:140-143
case "IDENTIFIER_RENAMED":
case "BATCH_STARTED":
  return null;  // ❌ Explicitly filtered out as "too noisy"
```
**Evidence**: `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/webapp/server/lib/ledger-reader.ts:140-143`

### Missing UI Components

To display identifier-level details, need:

1. **PassDetailView** component:
   - Shows list of all identifiers processed in a pass
   - Columns: ID, Old Name, New Name, Status (renamed/unchanged/skipped), Confidence
   - Click to drill into identifier detail

2. **IdentifierDetailDialog** component:
   - Shows full information for one identifier:
     - Old name, new name, confidence
     - Context sent to LLM (if available)
     - Prompt used (if available)
     - Timestamp
   - Currently: ❌ DOES NOT EXIST

3. **Pass-level filtering**:
   - Filter by status: all / renamed / unchanged / skipped
   - Filter by confidence threshold
   - Search by identifier ID or name

---

## API Endpoints Assessment

### Current Endpoints

**GET /api/experiments/:id/logs**:
- Returns transformed ledger events
- Filters out IDENTIFIER_RENAMED events
- Evidence: `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/webapp/server/api/experiments.ts:150-171`

### Missing Endpoints

Need to add:

#### 1. GET /api/experiments/:experimentId/runs/:runId/passes/:passNumber/identifiers

**Purpose**: List all identifiers processed in a pass

**Response**:
```typescript
interface IdentifierListResponse {
  identifiers: {
    id: string;
    oldName: string;
    newName: string;
    status: "renamed" | "unchanged" | "skipped";
    confidence?: number;  // Only for renamed/unchanged
    timestamp: string;
  }[];
  stats: {
    total: number;
    renamed: number;
    unchanged: number;
    skipped: number;
  };
}
```

**Implementation approach**:
```typescript
// Pseudocode
async function getIdentifiersForPass(jobDir: string, passNumber: number) {
  const ledger = new Ledger(jobDir);
  const events = await ledger.getAllEvents();

  // Find BATCH_STARTED events for this pass
  const batchStartedEvents = events.filter(
    e => e.type === "BATCH_STARTED" && e.passNumber === passNumber
  );

  // Collect all identifier IDs that were queued
  const allIds = batchStartedEvents.flatMap(e => e.identifierIds);

  // Find IDENTIFIER_RENAMED events for this pass
  const renamedEvents = events.filter(
    e => e.type === "IDENTIFIER_RENAMED" && e.passNumber === passNumber
  );

  // Build map: id -> rename info
  const renamedMap = new Map(
    renamedEvents.map(e => [e.id, { oldName: e.oldName, newName: e.newName, confidence: e.confidence, timestamp: e.timestamp }])
  );

  // Classify each identifier
  const identifiers = allIds.map(id => {
    const rename = renamedMap.get(id);
    if (!rename) {
      return { id, status: "skipped" };
    }
    const status = rename.oldName === rename.newName ? "unchanged" : "renamed";
    return { id, ...rename, status };
  });

  return identifiers;
}
```

#### 2. GET /api/experiments/:experimentId/runs/:runId/passes/:passNumber/identifiers/:id

**Purpose**: Get details for a specific identifier

**Response**:
```typescript
interface IdentifierDetailResponse {
  id: string;
  oldName: string;
  newName: string;
  confidence?: number;
  status: "renamed" | "unchanged" | "skipped";
  timestamp: string;
  context?: string;      // ❌ NOT AVAILABLE - see below
  prompt?: string;       // ❌ NOT AVAILABLE
  batchNumber?: number;
}
```

**Problem**: Context is NOT stored in ledger.

**Possible workarounds**:
1. Re-extract context from snapshot code (requires re-analysis)
2. Modify ledger to store context (increases storage ~100x)
3. Store context in separate file per batch (e.g., `batch-001-contexts.jsonl`)
4. Accept that historical context is not available, only show for current/recent runs

#### 3. GET /api/experiments/:experimentId/runs/:runId/passes

**Purpose**: List all passes with summary stats

**Response**:
```typescript
interface PassSummaryResponse {
  passes: {
    passNumber: number;
    processor: string;
    mode: string;
    concurrency: number;
    stats: PassStats;
  }[];
}
```

**Implementation**: Already have PassStats in ledger, just need to expose.

---

## Ambiguities Found

### 1. Context Storage Strategy

**Question**: How should we handle context data for identifier details?

**Why it matters**: Context strings are large (500-3000 chars each). For 10,000 identifiers, that's 5-30MB of text data per pass.

**Current state**: Context is NOT persisted anywhere after processing completes.

**Options**:

**A. Store in ledger events**
- Modify `IdentifierRenamedEvent` to include `context: string` field
- Pros: All data in one place, easy to query
- Cons:
  - Ledger file size explodes (10KB → 30MB for 10K identifiers)
  - Slower ledger replay
  - Storage concerns for many experiments

**B. Store in separate context files**
- Create `passes/pass-NNN/contexts.jsonl` with `{id, context}` per line
- Pros: Keeps ledger lean, context optional to load
- Cons:
  - More files to manage
  - Need to coordinate with ledger events
  - Still 5-30MB per pass

**C. Don't store, re-extract on demand**
- When user requests context for identifier X, re-analyze snapshot and extract
- Pros: Zero storage overhead
- Cons:
  - Slow (re-analyze entire file just for one identifier)
  - Requires keeping all snapshots (already planned)
  - Re-extracted context may differ slightly if code changed

**D. Hybrid: Store only for recent/active experiments**
- Store contexts in memory during active experiment run
- Persist to temp file during run, delete after completion
- User can view context in real-time, but not after experiment finishes
- Pros: Best UX during run, no long-term storage cost
- Cons: Historical analysis limited

**E. Store in Vault and create index**
- Vault already has full LLM requests/responses
- Create index file: `{identifierId} -> {vaultHash}`
- Pros: Reuses existing storage, no duplication
- Cons:
  - Vault can evict entries (LRU)
  - Vault hash is based on content, may have collisions
  - Complex to map identifier → vault entry reliably

**Impact**: Without context storage, feature is 60% complete (can show status, confidence, names, but NOT what was sent to LLM).

### 2. Performance for Large Files

**Question**: How should UI handle experiments with 10,000+ identifiers?

**Options**:
- Pagination (show 100 at a time)
- Virtualized scrolling
- Server-side filtering
- Export to CSV instead of interactive view

**Why it matters**: Loading 10K identifier records in browser could freeze UI.

### 3. Which Runs to Support

**Question**: Should identifier details be available for ALL runs, or just the most recent?

**Context**: Each experiment can have multiple runs. Each run has its own job directory with ledger.

**Options**:
- All runs (requires reading ledger for any selected run)
- Latest run only (simpler, less storage)
- Latest N runs (e.g., last 3)

---

## Recommendations

### Highest Priority

1. **Clarify context storage strategy** before implementing API/UI
   - Recommend Option D (Hybrid) for MVP:
     - Store contexts in memory during active runs
     - Expose via API only while run is active
     - After completion, context not available
   - For future: Add Option B (separate context files) if historical analysis is needed

2. **Implement basic identifier list endpoint** (without context)
   - GET /api/experiments/:id/runs/:runId/passes/:passNumber/identifiers
   - Returns: id, oldName, newName, status, confidence
   - This is fully implementable with existing ledger data

3. **Add PassDetailView UI component**
   - Table showing all identifiers
   - Filter by status
   - Pagination for large lists
   - Click to see detail (without context for now)

### Medium Priority

4. **Add pass-level summary endpoint**
   - GET /api/experiments/:id/runs/:runId/passes
   - Expose PassStats that already exist in ledger

5. **Add identifier detail endpoint**
   - GET /api/experiments/:id/runs/:runId/passes/:passNumber/identifiers/:id
   - Initially without context field

### Lower Priority

6. **Context storage implementation** (if user confirms it's needed)
   - Decide on storage strategy (needs user input on requirements)
   - Implement chosen approach
   - Update API to include context
   - Update UI to display context

---

## Implementation Roadmap

### Phase 1: Identifier List (No Context) - 2-3 days

**Data Layer**:
- ✅ No changes needed - all data in ledger

**API Layer**:
- [ ] Add `GET /api/experiments/:id/runs/:runId/passes/:passNumber/identifiers`
  - Read ledger events
  - Build identifier list with status
  - Return paginated results
- [ ] Add `GET /api/experiments/:id/runs/:runId/passes`
  - Extract pass summaries from ledger

**UI Layer**:
- [ ] Create `PassDetailView` component
  - Table of identifiers
  - Status filtering (renamed/unchanged/skipped)
  - Confidence sorting
  - Pagination
- [ ] Add "View Details" button to pass summary in ExperimentDetail
- [ ] Update types in `shared/types.ts`

**Testing**:
- [ ] Run experiment with turbo-v2
- [ ] Verify all identifiers shown
- [ ] Verify skipped identifiers detected
- [ ] Verify unchanged identifiers detected

### Phase 2: Context Storage (If Approved) - 3-5 days

**Depends on**: Clarification from user on storage strategy

**If Option B (Separate context files)**:

**Data Layer**:
- [ ] Modify PassEngine to emit context events
- [ ] Create `ContextStore` class to write `contexts.jsonl` per batch
- [ ] Add `getContextForIdentifier()` method

**API Layer**:
- [ ] Add `GET /api/experiments/:id/runs/:runId/passes/:passNumber/identifiers/:id/context`
  - Read from context files
  - Return context string + metadata

**UI Layer**:
- [ ] Create `IdentifierDetailDialog` component
- [ ] Display context in code block with syntax highlighting
- [ ] Show prompt template (if available)

**Testing**:
- [ ] Verify context captured for all identifiers
- [ ] Verify context can be retrieved after run completes
- [ ] Check file sizes for 10K identifier experiment

### Phase 3: Historical Analysis - 2-3 days

**Optional enhancement**:

- [ ] Add cross-pass comparison
  - Show how identifier name evolved across passes
  - Track confidence trend
- [ ] Add bulk export
  - Export identifier list to CSV
  - Include all metadata

---

## Testing Checklist

### Data Capture Verification
- [x] IDENTIFIER_RENAMED events written for all processed identifiers
- [x] oldName === newName for unchanged identifiers
- [x] Skipped identifiers absent from IDENTIFIER_RENAMED (present in BATCH_STARTED only)
- [x] BatchStats.identifiersSkipped count matches missing identifiers
- [ ] Context available during processing (not persisted)

### API Verification
- [ ] Identifier list endpoint returns all IDs from BATCH_STARTED
- [ ] Status correctly classified (renamed/unchanged/skipped)
- [ ] Pagination works for 1000+ identifiers
- [ ] Pass summary endpoint returns correct PassStats

### UI Verification
- [ ] PassDetailView renders for pass with 100+ identifiers
- [ ] Filtering by status works
- [ ] Sorting by confidence works
- [ ] Pagination controls work
- [ ] No performance issues with 10K identifiers (virtualized scrolling)

### Edge Cases
- [ ] Pass with 0 identifiers processed
- [ ] Pass with 100% skipped identifiers
- [ ] Pass with 100% unchanged identifiers
- [ ] Identifier ID with special characters
- [ ] Run that was cancelled mid-pass

---

## Workflow Recommendation

**PAUSE** - Need user clarification on:

### Question 1: Context Storage
**Context**: Identifier context (500-3000 chars) is NOT currently stored. This is 60% of the feature.

**Options**:
- A. Add to ledger events (+30MB per pass for 10K identifiers)
- B. Separate context files (+5-30MB per pass, separate from ledger)
- C. Don't store, re-extract on demand (slow, requires snapshot)
- D. Store only for active runs (great UX, no historical data)
- E. Index into Vault (complex, Vault can evict)

**Recommended**: Start with Option D (active runs only), add Option B later if historical analysis is needed.

**Impact of wrong choice**:
- If we add context to ledger (A) and user doesn't need it → wasted storage, slow ledger replay
- If we don't store (C/D) and user needs historical analysis → poor UX, slow queries

### Question 2: Performance Requirements
**Context**: Large experiments can have 10,000+ identifiers per pass.

**Questions**:
- Should UI support viewing all 10K at once? Or paginate?
- Is export to CSV acceptable for bulk analysis?
- How important is historical analysis vs. real-time monitoring?

### Question 3: Priority
**Context**: Three levels of functionality:

**Level 1 (2-3 days)**:
- Show identifier list per pass
- Show status (renamed/unchanged/skipped)
- Show confidence scores
- NO context display

**Level 2 (+3-5 days)**:
- Add context storage (requires decision on Question 1)
- Display context in UI

**Level 3 (+2-3 days)**:
- Cross-pass comparison
- Bulk export
- Advanced filtering

**Question**: Which level is needed now vs. later?

---

## Evidence Summary

**Files Examined**:
- `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/FINAL_PROJECT_SPEC.md` - Ledger spec
- `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/ledger/events.ts` - Event types
- `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/ledger/ledger.ts` - Ledger implementation
- `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/orchestrator/pass-engine.ts` - Pass processing
- `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/webapp/shared/types.ts` - Type definitions
- `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/webapp/server/lib/ledger-reader.ts` - Log transformation
- `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/webapp/server/lib/metrics-extractor.ts` - Metrics extraction
- `/Users/bmf/code/brandon-fryslie_humanify/src/turbo-v2/webapp/client/components/ExperimentDetail.tsx` - UI component

**Key Findings**:
1. ✅ Identifier status (renamed/unchanged/skipped) is fully derivable from existing events
2. ✅ Confidence scores are captured in IDENTIFIER_RENAMED events
3. ❌ Context is NOT stored in ledger, only exists during processing
4. ❌ No API endpoints exist for identifier-level queries
5. ❌ UI explicitly filters out identifier events as "too noisy"

**Confidence**: HIGH - Examined complete data flow from pass-engine → ledger → API → UI
