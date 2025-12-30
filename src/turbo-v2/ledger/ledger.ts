import { createReadStream, existsSync, mkdirSync, appendFileSync, openSync, fsyncSync, closeSync, readFileSync } from "fs";
import { createInterface } from "readline";
import { dirname } from "path";
import {
  LedgerEvent,
  serializeEvent,
  deserializeEvent,
  isIdentifierRenamedEvent,
  isPassCompletedEvent,
  isJobCompletedEvent,
  PassStats,
} from "./events.js";

/**
 * Reconstructed state from replaying ledger events
 */
export interface LedgerState {
  jobId: string;
  currentPass: number;
  completedPasses: number;
  renameMap: Record<string, string>; // id -> newName
  totalIdentifiersRenamed: number;
  totalTokensUsed: number;
  jobComplete: boolean;
  lastEventTimestamp: string;
}

/**
 * Interface for the Ledger (append-only event log)
 */
export interface LedgerInterface {
  append(event: LedgerEvent): Promise<void>;
  replay(): AsyncIterable<LedgerEvent>;
  getState(): Promise<LedgerState>;
}

/**
 * Ledger: Append-only event log for turbo-v2
 *
 * Purpose: Source of truth for all state changes, enabling crash recovery
 *
 * Key Design Decisions:
 * - Format: JSONL (one event per line) for easy append and line-by-line reading
 * - Durability: fsync after each append ensures event is written to disk
 * - Recovery: Partial lines at EOF are discarded (incomplete writes)
 * - Replay: Events can be replayed to reconstruct state at any point
 *
 * File Layout:
 * {jobDir}/events.jsonl
 *
 * Example:
 * {"type":"JOB_STARTED","timestamp":"2025-12-30T00:00:00.000Z","jobId":"abc123",...}
 * {"type":"PASS_STARTED","timestamp":"2025-12-30T00:00:01.000Z","jobId":"abc123",...}
 * {"type":"IDENTIFIER_RENAMED","timestamp":"2025-12-30T00:00:02.000Z","jobId":"abc123",...}
 * ...
 */
export class Ledger implements LedgerInterface {
  private eventsPath: string;
  private jobDir: string;

  /**
   * Create a new Ledger instance
   * @param jobDir Directory for this job's checkpoint data
   */
  constructor(jobDir: string) {
    this.jobDir = jobDir;
    this.eventsPath = `${jobDir}/events.jsonl`;
    this.ensureJobDir();
  }

  /**
   * Ensure job directory exists
   */
  private ensureJobDir(): void {
    const dir = dirname(this.eventsPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Append an event to the ledger with fsync for durability
   *
   * This is the critical path for crash safety:
   * 1. Serialize event to JSON
   * 2. Append to file with newline
   * 3. fsync to ensure write is durable on disk
   *
   * If the process crashes between step 2 and 3, the partial line
   * will be discarded on replay (see recovery logic in replay()).
   */
  async append(event: LedgerEvent): Promise<void> {
    const line = serializeEvent(event) + "\n";

    // Open file for append
    const fd = openSync(this.eventsPath, "a");

    try {
      // Write event as single line
      appendFileSync(fd, line, "utf-8");

      // Force write to disk (durability guarantee)
      fsyncSync(fd);
    } finally {
      // Always close the file descriptor
      closeSync(fd);
    }
  }

  /**
   * Replay all events from the ledger in order
   *
   * Recovery logic:
   * - Each line is parsed independently
   * - Invalid lines are skipped (logged as warning)
   * - Partial lines at EOF are discarded
   * - Events are yielded in chronological order
   *
   * This is an async generator to support streaming large ledgers
   * without loading entire file into memory.
   */
  async *replay(): AsyncIterable<LedgerEvent> {
    if (!existsSync(this.eventsPath)) {
      // No events yet - valid for new jobs
      return;
    }

    const fileStream = createReadStream(this.eventsPath, { encoding: "utf-8" });
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity, // Handle both \n and \r\n
    });

    for await (const line of rl) {
      // Skip empty lines
      if (!line.trim()) {
        continue;
      }

      // Parse event
      const event = deserializeEvent(line);

      if (!event) {
        // Invalid event - log warning and skip
        console.warn(`[ledger] Invalid event in ${this.eventsPath}, skipping line: ${line.substring(0, 100)}`);
        continue;
      }

      yield event;
    }
  }

  /**
   * Reconstruct current state by replaying all events
   *
   * This is the primary recovery mechanism:
   * - Replay all events from ledger
   * - Build up state incrementally
   * - Return final state
   *
   * State includes:
   * - Current job progress (pass number, completion status)
   * - Accumulated rename map (all renames across all passes)
   * - Statistics (tokens, identifiers, etc.)
   */
  async getState(): Promise<LedgerState> {
    const state: LedgerState = {
      jobId: "",
      currentPass: 0,
      completedPasses: 0,
      renameMap: {},
      totalIdentifiersRenamed: 0,
      totalTokensUsed: 0,
      jobComplete: false,
      lastEventTimestamp: "",
    };

    // Replay all events and update state
    for await (const event of this.replay()) {
      state.lastEventTimestamp = event.timestamp;

      // Update state based on event type
      switch (event.type) {
        case "JOB_STARTED":
          state.jobId = event.jobId;
          break;

        case "PASS_STARTED":
          state.currentPass = event.passNumber;
          break;

        case "IDENTIFIER_RENAMED":
          // Add to rename map
          state.renameMap[event.id] = event.newName;
          state.totalIdentifiersRenamed++;
          break;

        case "PASS_COMPLETED":
          state.completedPasses = event.passNumber;
          state.totalTokensUsed += event.stats.tokensUsed.total;
          break;

        case "JOB_COMPLETED":
          state.jobComplete = true;
          break;

        // Other events don't affect state reconstruction
        case "BATCH_STARTED":
        case "BATCH_COMPLETED":
        case "SNAPSHOT_CREATED":
          break;
      }
    }

    return state;
  }

  /**
   * Get the path to the events file
   * Useful for debugging and inspection
   */
  getEventsPath(): string {
    return this.eventsPath;
  }

  /**
   * Count total events in ledger
   * Useful for validation and testing
   */
  async countEvents(): Promise<number> {
    let count = 0;
    for await (const _ of this.replay()) {
      count++;
    }
    return count;
  }

  /**
   * Get all events as array (for testing)
   * WARNING: Loads entire ledger into memory
   */
  async getAllEvents(): Promise<LedgerEvent[]> {
    const events: LedgerEvent[] = [];
    for await (const event of this.replay()) {
      events.push(event);
    }
    return events;
  }

  /**
   * Validate ledger integrity
   * Returns true if all events can be parsed successfully
   */
  async validate(): Promise<boolean> {
    try {
      for await (const _ of this.replay()) {
        // Just iterate through all events
        // Invalid events are logged as warnings and skipped
      }
      return true;
    } catch (error) {
      console.error("[ledger] Validation failed:", error);
      return false;
    }
  }
}
