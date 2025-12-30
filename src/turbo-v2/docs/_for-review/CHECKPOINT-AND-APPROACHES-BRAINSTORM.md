# Brainstorming: Robust Checkpointing & High-ROI Approaches

## Part 1: The "Unbreakable" Checkpoint System

**Objective:** Zero data loss, maximum resume granularity, auditability.

The current file-based JSON approach in the plan has risks: JSON corruption on crash, overwriting data, and coarse granularity (batch-level).

### 1.1 Architecture: The "Ledger" Model
Instead of overwriting `status.json` files, we treat the execution as an **append-only ledger** of events.

*   **Concept:** "Event Sourcing" for the deobfuscator.
*   **Mechanism:**
    *   Every API call, every state change, every completed batch is an **Event**.
    *   Events are written immediately to an `events.jsonl` (line-delimited JSON) file.
    *   State is *derived* by replaying the ledger.
*   **Benefits:**
    *   **Crash Proof:** Appending a line is atomic on POSIX. If the process dies mid-write, we lose at most one partial line (easy to discard), not the whole state.
    *   **Infinite Undo:** We can replay history up to any point. "Rewind to 5 minutes ago" becomes possible.
    *   **Auditability:** We see exactly *why* a variable got renamed (e.g., "Event: Pass 1 Rename", then "Event: User Correction", then "Event: Pass 2 Refinement").

### 1.2 Layered Caching (The "Safety Net")
Checkpointing usually saves *application state*. We should also cache *raw IO*.

*   **Request-Level Caching (The "Vault"):**
    *   **Key:** `Hash(Prompt + Model + Temperature)`
    *   **Value:** Raw LLM Response
    *   **Storage:** SQLite DB or simple file-hash store (`.humanify-cache/ab/cd/ef123...`).
    *   **Why:** If the app logic crashes *processing* the response, or if we change the *parsing* logic, we don't pay for the API call again. We just re-read the raw response from the Vault.
    *   **Persistence:** This cache persists *across* different runs/projects. "Did I already ask GPT-4 what `var a = 1` means?" Yes? Return the cached answer.

### 1.3 Immutable Artifacts
*   **Rule:** Never overwrite a source file or an output file.
*   **Versioning:**
    *   `checkpoint-run-001/`
    *   `checkpoint-run-002/`
*   **Symlinks:** `latest -> checkpoint-run-002`.

### 1.4 Technical Implementation Details (The "Ironclad" Spec)
1.  **Dual-Write Strategy:**
    *   Write to `events.jsonl` (Source of Truth).
    *   Periodically (e.g., every 10 events) update a `snapshot.json` (for fast resume) using atomic rename (write `snapshot.tmp`, then `mv snapshot.tmp snapshot.json`).
2.  **Process Isolation:**
    *   The "Checkpoint Daemon" could be a separate lightweight process (or worker thread) that receives messages from the main worker. If the main worker OOMs (Out of Memory), the daemon ensures the final bytes are flushed to disk.

---

## Part 2: High-ROI Approaches (Speed/Quality/Cost)

**Constraint:** Budget = 2-3x Sequential. Goal = Maximum Speed & Quality.

### 2.1 The "Anchor-First" Hybrid (High Value)
*   **Hypothesis:** 20% of identifiers (function names, exported classes, top-level vars) provide 80% of the context.
*   **Strategy:**
    1.  **Analyze:** Identify "Anchors" (high ref count, large scope).
    2.  **Pass 1 (Sequential, Smart):** Rename *only* the Anchors. Because there are fewer of them, sequential processing is fast (e.g., 200 items vs 2000).
    3.  **Pass 2 (Parallel, Flood):** Rename everything else in parallel. The prompt includes the *already renamed* Anchors as context.
*   **Cost:** ~1.2x (Small extra sequential pass).
*   **Speed:** Fast (Parallelizing the bulk).
*   **Quality:** High (The "skeleton" of the app is solid before fleshing out details).

### 2.2 "Speculative Parallel" with Verification (The "Fast Check")
*   **Strategy:**
    1.  **Pass 1 (Cheap & Fast):** Run *everything* in parallel using a cheaper model (e.g., `gpt-4o-mini`). It makes guesses.
    2.  **Pass 2 (The Judge):** Use a high-quality model (e.g., `gpt-4o`) to review chunks of the code. "Here are the renamed variables. Do any look wrong or inconsistent?"
    3.  **Refine:** Only re-run the specific variables the Judge flagged.
*   **Cost:** Low (Mini is 1/30th the price).
*   **Speed:** Blazing fast (Mini is faster).
*   **Quality:** Surprising. Mini is often "good enough" for simple vars (`i` -> `index`), saving the big guns for complex logic.

### 2.3 The "Consensus" Approach (Ensemble)
*   **Strategy:** Run 3 parallel requests with *different temperatures* or even *different prompts*.
*   **Aggregation:** If 3/3 agree -> High Confidence. If they disagree -> Flag for Sequential Review.
*   **Why:** Parallel requests are instantaneous. 3 parallel requests take the same wall-time as 1.
*   **Cost:** 3x (exactly hitting your budget limit).
*   **Benefit:** drastically reduces hallucinations.

### 2.4 "Context Expansion" Iteration
*   **Pass 1:** Rename with Local Context (function body). Fast, parallel.
*   **Pass 2:** Rename with Global Context (imports/exports).
*   **Key:** Use the *results* of Pass 1 to build a "Glossary".
*   **The Glossary Trick:**
    *   Pass 1 generates a map: `a -> user`, `b -> database`.
    *   Pass 2 prompt: "Here is a Glossary of terms we found: {a: user, b: database}. Now rename `c` in this function..."
    *   This simulates sequential knowledge sharing without the sequential bottleneck.

---

## Recommendation for V2

**Architecture:**
1.  **System:** Ledger-based Checkpointing + Request-Level "Vault" Cache.
2.  **Pipeline:**
    *   **Pre-computation:** Static Analysis (Scope, Refs, Anchors).
    *   **Pass 1 (Anchors):** Sequential rename of top 10% importance.
    *   **Pass 2 (Bulk):** Parallel rename of the rest, using Pass 1 output as "Glossary".
    *   **Pass 3 (Cleanup):** Parallel "Linter" pass to catch inconsistencies.

This keeps us within the 2-3x cost budget (1.1x for anchors + 1.0x for bulk + 0.5x for cleanup ≈ 2.6x) while maximizing quality via the Anchor/Glossary context.
