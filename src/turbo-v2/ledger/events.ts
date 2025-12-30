/**
 * EVENT TYPES FOR TURBO V2 LEDGER
 *
 * This file defines all 8 event types used in the append-only event log.
 * Each event captures a state transition in the turbo-v2 processing pipeline.
 *
 * Design Principles:
 * - Each event has: type discriminator, timestamp, and payload fields
 * - Events are immutable once written
 * - Events are serialized as JSONL (one event per line)
 * - Versioning strategy: Add new optional fields; never remove/rename existing fields
 */

/**
 * Job configuration passed to turbo-v2
 */
export interface JobConfig {
  inputPath: string;
  outputPath: string;
  passes: number;
  provider: string;
  model?: string;
  concurrency?: number;
  checkpointDir?: string;
  [key: string]: any; // Allow additional config fields
}

/**
 * Pass configuration for a single processing pass
 */
export interface PassConfig {
  processor: "rename" | "refine" | "analyze" | "transform";
  mode: "parallel" | "streaming" | "sequential";
  concurrency: number;
  filter?: "anchors" | "low-confidence" | "all";
  model?: string;
}

/**
 * Token usage statistics
 */
export interface TokenStats {
  prompt: number;
  completion: number;
  total: number;
}

/**
 * Statistics for a completed batch
 */
export interface BatchStats {
  identifiersProcessed: number;
  identifiersRenamed: number;
  identifiersUnchanged: number;
  identifiersSkipped: number;
  tokensUsed: TokenStats;
  durationMs: number;
  errors: number;
}

/**
 * Statistics for a completed pass
 */
export interface PassStats {
  identifiersProcessed: number;
  identifiersRenamed: number;
  identifiersUnchanged: number;
  identifiersSkipped: number;
  tokensUsed: TokenStats;
  durationMs: number;
  errors: number;
  batchCount: number;
}

/**
 * JOB_STARTED Event
 * Emitted when a new job begins
 */
export interface JobStartedEvent {
  type: "JOB_STARTED";
  timestamp: string; // ISO 8601 format
  jobId: string;
  config: JobConfig;
  inputHash: string; // Hash of input file for resume detection
}

/**
 * PASS_STARTED Event
 * Emitted when a pass begins
 */
export interface PassStartedEvent {
  type: "PASS_STARTED";
  timestamp: string;
  jobId: string;
  passNumber: number; // 1-indexed
  passConfig: PassConfig;
  identifierCount: number; // Total identifiers to process in this pass
}

/**
 * BATCH_STARTED Event
 * Emitted when a batch of identifiers begins processing
 */
export interface BatchStartedEvent {
  type: "BATCH_STARTED";
  timestamp: string;
  jobId: string;
  passNumber: number;
  batchNumber: number; // 0-indexed within pass
  identifierIds: string[]; // Stable IDs for identifiers in this batch
}

/**
 * IDENTIFIER_RENAMED Event
 * Emitted when a single identifier is renamed
 * This is the finest-grained event for crash recovery
 */
export interface IdentifierRenamedEvent {
  type: "IDENTIFIER_RENAMED";
  timestamp: string;
  jobId: string;
  passNumber: number;
  batchNumber: number;
  id: string; // Stable identifier ID (binding + location)
  oldName: string;
  newName: string;
  confidence: number; // 0-1 confidence score from LLM
}

/**
 * BATCH_COMPLETED Event
 * Emitted when a batch finishes processing
 */
export interface BatchCompletedEvent {
  type: "BATCH_COMPLETED";
  timestamp: string;
  jobId: string;
  passNumber: number;
  batchNumber: number;
  stats: BatchStats;
}

/**
 * PASS_COMPLETED Event
 * Emitted when a pass finishes
 */
export interface PassCompletedEvent {
  type: "PASS_COMPLETED";
  timestamp: string;
  jobId: string;
  passNumber: number;
  stats: PassStats;
}

/**
 * SNAPSHOT_CREATED Event
 * Emitted when a snapshot is written to disk
 */
export interface SnapshotCreatedEvent {
  type: "SNAPSHOT_CREATED";
  timestamp: string;
  jobId: string;
  passNumber: number; // 0 = original input, N = after pass N
  snapshotPath: string;
  snapshotHash: string; // SHA-256 hash for integrity verification
}

/**
 * JOB_COMPLETED Event
 * Emitted when entire job finishes
 */
export interface JobCompletedEvent {
  type: "JOB_COMPLETED";
  timestamp: string;
  jobId: string;
  totalPasses: number;
  totalDurationMs: number;
  finalSnapshotPath: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Union type of all possible ledger events
 */
export type LedgerEvent =
  | JobStartedEvent
  | PassStartedEvent
  | BatchStartedEvent
  | IdentifierRenamedEvent
  | BatchCompletedEvent
  | PassCompletedEvent
  | SnapshotCreatedEvent
  | JobCompletedEvent;

/**
 * Type guard for JobStartedEvent
 */
export function isJobStartedEvent(event: LedgerEvent): event is JobStartedEvent {
  return event.type === "JOB_STARTED";
}

/**
 * Type guard for PassStartedEvent
 */
export function isPassStartedEvent(event: LedgerEvent): event is PassStartedEvent {
  return event.type === "PASS_STARTED";
}

/**
 * Type guard for BatchStartedEvent
 */
export function isBatchStartedEvent(event: LedgerEvent): event is BatchStartedEvent {
  return event.type === "BATCH_STARTED";
}

/**
 * Type guard for IdentifierRenamedEvent
 */
export function isIdentifierRenamedEvent(event: LedgerEvent): event is IdentifierRenamedEvent {
  return event.type === "IDENTIFIER_RENAMED";
}

/**
 * Type guard for BatchCompletedEvent
 */
export function isBatchCompletedEvent(event: LedgerEvent): event is BatchCompletedEvent {
  return event.type === "BATCH_COMPLETED";
}

/**
 * Type guard for PassCompletedEvent
 */
export function isPassCompletedEvent(event: LedgerEvent): event is PassCompletedEvent {
  return event.type === "PASS_COMPLETED";
}

/**
 * Type guard for SnapshotCreatedEvent
 */
export function isSnapshotCreatedEvent(event: LedgerEvent): event is SnapshotCreatedEvent {
  return event.type === "SNAPSHOT_CREATED";
}

/**
 * Type guard for JobCompletedEvent
 */
export function isJobCompletedEvent(event: LedgerEvent): event is JobCompletedEvent {
  return event.type === "JOB_COMPLETED";
}

/**
 * Validate that an event has required base fields
 */
export function validateEvent(event: any): event is LedgerEvent {
  if (!event || typeof event !== "object") return false;
  if (typeof event.type !== "string") return false;
  if (typeof event.timestamp !== "string") return false;
  if (typeof event.jobId !== "string") return false;

  // Validate timestamp is ISO 8601
  const timestamp = new Date(event.timestamp);
  if (isNaN(timestamp.getTime())) return false;

  return true;
}

/**
 * Serialize event to JSON string (for JSONL)
 */
export function serializeEvent(event: LedgerEvent): string {
  return JSON.stringify(event);
}

/**
 * Deserialize event from JSON string
 * Returns null if invalid
 */
export function deserializeEvent(line: string): LedgerEvent | null {
  try {
    const event = JSON.parse(line);
    if (!validateEvent(event)) {
      return null;
    }
    return event as LedgerEvent;
  } catch {
    return null;
  }
}
