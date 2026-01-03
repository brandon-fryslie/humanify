/**
 * Ledger Watcher for Real-Time Progress
 *
 * Polls the Ledger events.jsonl file for new events and emits them
 * via callback. Used by the SSE endpoint to stream progress updates.
 */

import { existsSync, statSync, watch, FSWatcher, readFileSync } from "fs";
import { join } from "path";
import {
  LedgerEvent,
  PassStartedEvent,
  BatchCompletedEvent,
  PassCompletedEvent,
  JobCompletedEvent,
  deserializeEvent,
} from "../../../../turbo-v2/ledger/events.js";

/**
 * Progress event sent to frontend
 */
export interface ProgressEvent {
  type:
    | "connected"
    | "pass_started"
    | "batch_completed"
    | "pass_completed"
    | "completed"
    | "failed"
    | "error";

  // Pass information
  passNumber?: number;
  totalPasses?: number;
  passProcessor?: string;

  // Batch information
  batchNumber?: number;
  totalBatches?: number;

  // Progress stats
  identifiersProcessed?: number;
  identifiersRenamed?: number;
  tokensUsed?: number;

  // Timing
  durationMs?: number;
  timestamp?: string;

  // Completion
  success?: boolean;
  outputPath?: string;
  errorMessage?: string;
}

/**
 * Callback function type for progress events
 */
export type ProgressCallback = (event: ProgressEvent) => void;

/**
 * Cleanup function to stop watching
 */
export type CleanupFunction = () => void;

/**
 * Options for the ledger watcher
 */
export interface WatcherOptions {
  /** Polling interval in milliseconds (default: 500) */
  pollInterval?: number;

  /** Maximum time to wait before giving up (default: 30 min) */
  maxWaitMs?: number;
}

/**
 * Watch a ledger for new events and emit progress updates
 *
 * @param jobDir Path to the job directory containing events.jsonl
 * @param onProgress Callback for each progress event
 * @param options Watcher options
 * @returns Cleanup function to stop watching
 */
export function watchLedger(
  jobDir: string,
  onProgress: ProgressCallback,
  options: WatcherOptions = {}
): CleanupFunction {
  const { pollInterval = 500, maxWaitMs = 30 * 60 * 1000 } = options;

  const eventsPath = join(jobDir, "events.jsonl");
  let lastLineCount = 0;
  let lastFileSize = 0;
  let fsWatcher: FSWatcher | null = null;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let stopped = false;
  let totalPasses = 2; // Default, will be updated from events
  let totalBatches = 10; // Default, will be estimated

  // Track cumulative totals to send to client
  let cumulativeStats = {
    identifiersProcessed: 0,
    identifiersRenamed: 0,
    tokensUsed: 0,
    durationMs: 0,
  };

  // Send initial connected event
  onProgress({ type: "connected", timestamp: new Date().toISOString() });

  /**
   * Read and process new events from the ledger file
   */
  const checkForNewEvents = (): boolean => {
    if (stopped) return false;

    if (!existsSync(eventsPath)) {
      // File doesn't exist yet - job may not have started
      return true;
    }

    try {
      const stats = statSync(eventsPath);

      // Only read if file has grown
      if (stats.size <= lastFileSize) {
        return true;
      }

      // Read entire file and get new lines
      const content = readFileSync(eventsPath, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      // Process only new lines
      for (let i = lastLineCount; i < lines.length; i++) {
        const event = deserializeEvent(lines[i]);
        if (event) {
          // Update totals from events
          if (event.type === "JOB_STARTED" && (event as any).config?.passes) {
            totalPasses = (event as any).config.passes;
          }
          if (event.type === "PASS_STARTED") {
            // Estimate batches from identifier count
            const passEvent = event as PassStartedEvent;
            totalBatches = Math.ceil(passEvent.identifierCount / 50);
          }

          // Accumulate stats from batch completed events
          if (event.type === "BATCH_COMPLETED") {
            const batchEvent = event as BatchCompletedEvent;
            cumulativeStats.identifiersProcessed += batchEvent.stats.identifiersProcessed;
            cumulativeStats.identifiersRenamed += batchEvent.stats.identifiersRenamed;
            cumulativeStats.tokensUsed += batchEvent.stats.tokensUsed.total;
            cumulativeStats.durationMs += batchEvent.stats.durationMs;
          }

          const progressEvent = transformToProgressEvent(event, totalPasses, totalBatches);
          if (progressEvent) {
            // Add cumulative stats to the event (client will use directly, not accumulate)
            progressEvent.identifiersProcessed = cumulativeStats.identifiersProcessed;
            progressEvent.identifiersRenamed = cumulativeStats.identifiersRenamed;
            progressEvent.tokensUsed = cumulativeStats.tokensUsed;
            progressEvent.durationMs = cumulativeStats.durationMs;

            onProgress(progressEvent);

            // Check for completion
            if (progressEvent.type === "completed" || progressEvent.type === "failed") {
              stopped = true;
              cleanup();
              return false;
            }
          }
        }
      }

      lastLineCount = lines.length;
      lastFileSize = stats.size;
      return true;
    } catch (error) {
      console.error("[ledger-watcher] Error reading events:", error);
      return true;
    }
  };

  /**
   * Cleanup resources
   */
  const cleanup = (): void => {
    stopped = true;

    if (fsWatcher) {
      try {
        fsWatcher.close();
      } catch {}
      fsWatcher = null;
    }

    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  // Start watching
  // Use both fs.watch (for immediate notification) and polling (as backup)
  try {
    if (existsSync(jobDir)) {
      fsWatcher = watch(jobDir, (eventType, filename) => {
        if (filename === "events.jsonl") {
          checkForNewEvents();
        }
      });

      fsWatcher.on("error", (err) => {
        console.warn("[ledger-watcher] FSWatcher error:", err);
        // Fall back to polling only
        if (fsWatcher) {
          fsWatcher.close();
          fsWatcher = null;
        }
      });
    }
  } catch (error) {
    console.warn("[ledger-watcher] Could not create FSWatcher, using polling only");
  }

  // Also poll periodically as backup
  pollTimer = setInterval(() => {
    if (!checkForNewEvents()) {
      cleanup();
    }
  }, pollInterval);

  // Initial check
  checkForNewEvents();

  // Return cleanup function
  return cleanup;
}

/**
 * Transform a ledger event to a progress event
 */
function transformToProgressEvent(
  event: LedgerEvent,
  totalPasses: number,
  totalBatches: number
): ProgressEvent | null {
  switch (event.type) {
    case "PASS_STARTED": {
      const e = event as PassStartedEvent;
      return {
        type: "pass_started",
        passNumber: e.passNumber,
        totalPasses,
        passProcessor: e.passConfig.processor,
        timestamp: e.timestamp,
      };
    }

    case "BATCH_COMPLETED": {
      const e = event as BatchCompletedEvent;
      return {
        type: "batch_completed",
        passNumber: e.passNumber,
        batchNumber: e.batchNumber,
        totalBatches,
        identifiersProcessed: e.stats.identifiersProcessed,
        identifiersRenamed: e.stats.identifiersRenamed,
        tokensUsed: e.stats.tokensUsed.total,
        durationMs: e.stats.durationMs,
        timestamp: e.timestamp,
      };
    }

    case "PASS_COMPLETED": {
      const e = event as PassCompletedEvent;
      return {
        type: "pass_completed",
        passNumber: e.passNumber,
        totalPasses,
        identifiersProcessed: e.stats.identifiersProcessed,
        identifiersRenamed: e.stats.identifiersRenamed,
        tokensUsed: e.stats.tokensUsed.total,
        durationMs: e.stats.durationMs,
        timestamp: e.timestamp,
      };
    }

    case "JOB_COMPLETED": {
      const e = event as JobCompletedEvent;
      if (e.success) {
        return {
          type: "completed",
          success: true,
          outputPath: e.finalSnapshotPath,
          durationMs: e.totalDurationMs,
          timestamp: e.timestamp,
        };
      } else {
        return {
          type: "failed",
          success: false,
          errorMessage: e.errorMessage,
          timestamp: e.timestamp,
        };
      }
    }

    // Skip other event types for progress
    default:
      return null;
  }
}

/**
 * Wait for a job to start by watching for the events.jsonl file
 *
 * @param jobDir Job directory to watch
 * @param timeoutMs Maximum time to wait
 * @returns True if file appeared, false if timed out
 */
export async function waitForJobStart(
  jobDir: string,
  timeoutMs: number = 30000
): Promise<boolean> {
  const eventsPath = join(jobDir, "events.jsonl");
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (existsSync(eventsPath)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return false;
}
