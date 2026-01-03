/**
 * Ledger Reader for Logs Panel and Identifier Details
 *
 * Reads ledger events from a job directory and transforms them
 * into log entries and identifier details for display in the UI.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import {
  LedgerEvent,
  PassStartedEvent,
  BatchStartedEvent,
  BatchCompletedEvent,
  PassCompletedEvent,
  JobCompletedEvent,
  JobStartedEvent,
  SnapshotCreatedEvent,
  IdentifierRenamedEvent,
  deserializeEvent,
  isPassStartedEvent,
  isPassCompletedEvent,
  isBatchStartedEvent,
  isBatchCompletedEvent,
  isIdentifierRenamedEvent,
} from "../../../../turbo-v2/ledger/events.js";
import { ConsoleLogEntry, PassDetail, IdentifierDetail, ListIdentifiersQuery } from "../../shared/types.js";

// Get __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root (for resolving paths)
const PROJECT_ROOT = resolve(__dirname, "../../../../..");

// Checkpoints directory
const CHECKPOINT_DIR = join(PROJECT_ROOT, ".humanify-checkpoints");

/**
 * Find the most recent job directory for an experiment
 *
 * Job directories are named {inputHash}-{configHash}-{timestamp}
 * We need to find the most recently modified one that contains events.jsonl
 */
function findJobDir(experimentId: string): string | null {
  if (!existsSync(CHECKPOINT_DIR)) {
    return null;
  }

  try {
    const entries = readdirSync(CHECKPOINT_DIR, { withFileTypes: true });
    const jobDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: entry.name,
        path: join(CHECKPOINT_DIR, entry.name),
        mtime: statSync(join(CHECKPOINT_DIR, entry.name)).mtime.getTime(),
      }))
      .filter((dir) => existsSync(join(dir.path, "events.jsonl")))
      .sort((a, b) => b.mtime - a.mtime);

    // Return the most recent job directory
    // TODO: In future, could store jobDir in experiment metadata for precise matching
    return jobDirs.length > 0 ? jobDirs[0].path : null;
  } catch (error) {
    console.error("[ledger-reader] Error finding job directory:", error);
    return null;
  }
}

/**
 * Transform a ledger event to a log entry
 */
function eventToLogEntry(event: LedgerEvent): ConsoleLogEntry | null {
  const timestamp = event.timestamp;

  switch (event.type) {
    case "JOB_STARTED": {
      const e = event as JobStartedEvent;
      return {
        timestamp,
        level: "info",
        message: `Job started: ${e.config.passes} passes, input: ${e.config.inputPath}`,
      };
    }

    case "PASS_STARTED": {
      const e = event as PassStartedEvent;
      return {
        timestamp,
        level: "info",
        message: `Pass ${e.passNumber} started: ${e.passConfig.processor}:${e.passConfig.mode}:${e.passConfig.concurrency} (${e.identifierCount} identifiers)`,
      };
    }

    case "BATCH_COMPLETED": {
      const e = event as BatchCompletedEvent;
      const tokens = e.stats.tokensUsed.total;
      const tokenStr = tokens > 0 ? `, ${tokens} tokens` : "";
      return {
        timestamp,
        level: "debug",
        message: `Batch ${e.batchNumber + 1} complete: ${e.stats.identifiersRenamed}/${e.stats.identifiersProcessed} renamed, ${e.stats.durationMs}ms${tokenStr}`,
      };
    }

    case "PASS_COMPLETED": {
      const e = event as PassCompletedEvent;
      const tokens = e.stats.tokensUsed.total;
      const tokenStr = tokens > 0 ? `, ${tokens.toLocaleString()} tokens` : "";
      const duration = (e.stats.durationMs / 1000).toFixed(1);
      return {
        timestamp,
        level: "info",
        message: `Pass ${e.passNumber} complete: ${e.stats.identifiersRenamed}/${e.stats.identifiersProcessed} renamed in ${duration}s${tokenStr}`,
      };
    }

    case "SNAPSHOT_CREATED": {
      const e = event as SnapshotCreatedEvent;
      return {
        timestamp,
        level: "debug",
        message: `Snapshot created: pass ${e.passNumber}, ${e.snapshotPath}`,
      };
    }

    case "JOB_COMPLETED": {
      const e = event as JobCompletedEvent;
      if (e.success) {
        const duration = (e.totalDurationMs / 1000).toFixed(1);
        return {
          timestamp,
          level: "info",
          message: `Job completed successfully in ${duration}s. Output: ${e.finalSnapshotPath}`,
        };
      } else {
        return {
          timestamp,
          level: "error",
          message: `Job failed: ${e.errorMessage}`,
        };
      }
    }

    // Skip identifier-level events (too noisy)
    case "IDENTIFIER_RENAMED":
    case "BATCH_STARTED":
      return null;

    default:
      return null;
  }
}

/**
 * Read ledger events and convert to log entries
 */
export function readLedgerLogs(experimentId: string, limit: number = 100): ConsoleLogEntry[] {
  const jobDir = findJobDir(experimentId);

  if (!jobDir) {
    return [];
  }

  const eventsPath = join(jobDir, "events.jsonl");

  if (!existsSync(eventsPath)) {
    return [];
  }

  try {
    const content = readFileSync(eventsPath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);

    const logs: ConsoleLogEntry[] = [];

    for (const line of lines) {
      const event = deserializeEvent(line);
      if (event) {
        const logEntry = eventToLogEntry(event);
        if (logEntry) {
          logs.push(logEntry);
        }
      }
    }

    // Return last N entries
    return logs.slice(-limit);
  } catch (error) {
    console.error("[ledger-reader] Error reading ledger:", error);
    return [];
  }
}

/**
 * Read ledger events for a specific run's job directory
 */
export function readLedgerLogsForRun(jobDir: string, limit: number = 100): ConsoleLogEntry[] {
  if (!jobDir || !existsSync(jobDir)) {
    return [];
  }

  const eventsPath = join(jobDir, "events.jsonl");

  if (!existsSync(eventsPath)) {
    return [];
  }

  try {
    const content = readFileSync(eventsPath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);

    const logs: ConsoleLogEntry[] = [];

    for (const line of lines) {
      const event = deserializeEvent(line);
      if (event) {
        const logEntry = eventToLogEntry(event);
        if (logEntry) {
          logs.push(logEntry);
        }
      }
    }

    // Return last N entries
    return logs.slice(-limit);
  } catch (error) {
    console.error("[ledger-reader] Error reading ledger for run:", error);
    return [];
  }
}

/**
 * Read all ledger events from a job directory
 */
function readAllEvents(jobDir: string): LedgerEvent[] {
  if (!jobDir || !existsSync(jobDir)) {
    return [];
  }

  const eventsPath = join(jobDir, "events.jsonl");

  if (!existsSync(eventsPath)) {
    return [];
  }

  try {
    const content = readFileSync(eventsPath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);

    const events: LedgerEvent[] = [];

    for (const line of lines) {
      const event = deserializeEvent(line);
      if (event) {
        events.push(event);
      }
    }

    return events;
  } catch (error) {
    console.error("[ledger-reader] Error reading events:", error);
    return [];
  }
}

/**
 * Get pass details for a run
 */
export function getPassesForRun(jobDir: string): PassDetail[] {
  const events = readAllEvents(jobDir);

  // Group events by pass number
  const passesByNumber = new Map<number, {
    started?: PassStartedEvent;
    completed?: PassCompletedEvent;
    batches: Set<number>;
  }>();

  for (const event of events) {
    if (isPassStartedEvent(event)) {
      if (!passesByNumber.has(event.passNumber)) {
        passesByNumber.set(event.passNumber, { batches: new Set() });
      }
      passesByNumber.get(event.passNumber)!.started = event;
    } else if (isPassCompletedEvent(event)) {
      if (!passesByNumber.has(event.passNumber)) {
        passesByNumber.set(event.passNumber, { batches: new Set() });
      }
      passesByNumber.get(event.passNumber)!.completed = event;
    } else if (isBatchCompletedEvent(event)) {
      if (!passesByNumber.has(event.passNumber)) {
        passesByNumber.set(event.passNumber, { batches: new Set() });
      }
      passesByNumber.get(event.passNumber)!.batches.add(event.batchNumber);
    }
  }

  // Convert to PassDetail array
  const passes: PassDetail[] = [];

  for (const [passNumber, data] of passesByNumber.entries()) {
    const started = data.started;
    const completed = data.completed;

    if (!started) continue; // Skip if no PASS_STARTED event

    passes.push({
      passNumber,
      processor: started.passConfig.processor,
      mode: started.passConfig.mode,
      concurrency: started.passConfig.concurrency,
      identifierCount: started.identifierCount,
      renamedCount: completed?.stats.identifiersRenamed ?? 0,
      unchangedCount: completed?.stats.identifiersUnchanged ?? 0,
      skippedCount: completed?.stats.identifiersSkipped ?? 0,
      duration: completed?.stats.durationMs,
      tokensUsed: completed?.stats.tokensUsed.total,
      batches: data.batches.size,
    });
  }

  // Sort by pass number
  passes.sort((a, b) => a.passNumber - b.passNumber);

  return passes;
}

/**
 * Get identifier details for a specific pass
 */
export function getIdentifiersForPass(
  jobDir: string,
  passNumber: number,
  query: ListIdentifiersQuery = {}
): { identifiers: IdentifierDetail[]; total: number } {
  const events = readAllEvents(jobDir);

  // Track identifiers in this pass
  const identifierMap = new Map<string, IdentifierDetail>();
  const batchIdentifiers = new Map<number, Set<string>>();

  // First pass: collect BATCH_STARTED events to know which identifiers were attempted
  for (const event of events) {
    if (isBatchStartedEvent(event) && event.passNumber === passNumber) {
      batchIdentifiers.set(event.batchNumber, new Set(event.identifierIds));
    }
  }

  // Second pass: collect IDENTIFIER_RENAMED events
  for (const event of events) {
    if (isIdentifierRenamedEvent(event) && event.passNumber === passNumber) {
      const status: "renamed" | "unchanged" = event.oldName === event.newName ? "unchanged" : "renamed";

      identifierMap.set(event.id, {
        id: event.id,
        oldName: event.oldName,
        newName: event.newName,
        status,
        confidence: event.confidence,
        batchNumber: event.batchNumber,
        passNumber: event.passNumber,
        // vaultHash would come from a separate index file (not implemented yet)
        // For now, we leave it undefined
      });
    }
  }

  // Third pass: identify skipped identifiers
  // (those in BATCH_STARTED but not in IDENTIFIER_RENAMED)
  for (const [batchNumber, identifierIds] of batchIdentifiers.entries()) {
    for (const id of identifierIds) {
      if (!identifierMap.has(id)) {
        // This identifier was attempted but not renamed (skipped)
        identifierMap.set(id, {
          id,
          oldName: "", // We don't have the old name for skipped identifiers
          newName: "",
          status: "skipped",
          batchNumber,
          passNumber,
        });
      }
    }
  }

  // Convert to array
  let identifiers = Array.from(identifierMap.values());

  // Apply status filter
  const statusFilter = query.status ?? "all";
  if (statusFilter !== "all") {
    identifiers = identifiers.filter((id) => id.status === statusFilter);
  }

  // Apply sorting
  const sortField = query.sort ?? "id";
  const sortOrder = query.order ?? "asc";

  identifiers.sort((a, b) => {
    let aVal: string | number | undefined;
    let bVal: string | number | undefined;

    switch (sortField) {
      case "id":
        aVal = a.id;
        bVal = b.id;
        break;
      case "oldName":
        aVal = a.oldName;
        bVal = b.oldName;
        break;
      case "newName":
        aVal = a.newName;
        bVal = b.newName;
        break;
      case "confidence":
        aVal = a.confidence ?? 0;
        bVal = b.confidence ?? 0;
        break;
      default:
        aVal = a.id;
        bVal = b.id;
    }

    if (aVal === undefined && bVal === undefined) return 0;
    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  const total = identifiers.length;

  // Apply pagination
  const page = query.page ?? 1;
  const limit = query.limit ?? 100;
  const offset = (page - 1) * limit;

  identifiers = identifiers.slice(offset, offset + limit);

  return { identifiers, total };
}

/**
 * Get vault hash for an identifier (if available)
 *
 * Note: This would require reading a vault index file that maps
 * identifier IDs to vault hashes. For now, this is a placeholder.
 */
export function getVaultHashForIdentifier(
  jobDir: string,
  passNumber: number,
  identifierId: string
): string | null {
  // TODO: Read vault index file
  // Format: passes/pass-{N}/vault-index.jsonl
  // Each line: {identifierId, vaultHash, timestamp}

  const indexPath = join(jobDir, "passes", `pass-${String(passNumber).padStart(3, "0")}`, "vault-index.jsonl");

  if (!existsSync(indexPath)) {
    return null;
  }

  try {
    const content = readFileSync(indexPath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.identifierId === identifierId) {
          return entry.vaultHash;
        }
      } catch {
        // Skip invalid lines
      }
    }

    return null;
  } catch (error) {
    console.error("[ledger-reader] Error reading vault index:", error);
    return null;
  }
}
