/**
 * Metrics Extractor for Turbo-V2 Experiments
 *
 * Extracts metrics from the Ledger event log after job completion.
 */

import { existsSync } from "fs";
import { join } from "path";
import { Ledger, LedgerState } from "../../../../turbo-v2/ledger/ledger.js";
import {
  LedgerEvent,
  PassCompletedEvent,
  JobCompletedEvent,
  isPassCompletedEvent,
  isJobCompletedEvent,
  isJobStartedEvent,
} from "../../../../turbo-v2/ledger/events.js";
import { TokenUsage } from "../../shared/types.js";

/**
 * Extracted metrics from a completed job
 */
export interface ExtractedMetrics {
  /** Token usage across all passes */
  tokens: TokenUsage;

  /** Total identifiers processed */
  identifiersProcessed: number;

  /** Total identifiers that were renamed (changed) */
  identifiersRenamed: number;

  /** Number of passes completed */
  passCount: number;

  /** Total duration in milliseconds */
  durationMs: number;

  /** Per-pass statistics */
  passStats: PassMetrics[];

  /** Job success status */
  success: boolean;

  /** Final output path */
  outputPath?: string;
}

/**
 * Metrics for a single pass
 */
export interface PassMetrics {
  passNumber: number;
  identifiersProcessed: number;
  identifiersRenamed: number;
  identifiersUnchanged: number;
  identifiersSkipped: number;
  tokens: TokenUsage;
  durationMs: number;
  errors: number;
  batchCount: number;
}

/**
 * Extract metrics from a job directory
 *
 * @param jobDir Path to the job directory (contains events.jsonl)
 * @returns Extracted metrics or null if not found/invalid
 */
export async function extractMetrics(jobDir: string): Promise<ExtractedMetrics | null> {
  const eventsPath = join(jobDir, "events.jsonl");

  if (!existsSync(eventsPath)) {
    console.warn(`[metrics-extractor] No events.jsonl found at: ${eventsPath}`);
    return null;
  }

  // Create ledger and get all events
  const ledger = new Ledger(jobDir);
  const events = await ledger.getAllEvents();

  if (events.length === 0) {
    console.warn(`[metrics-extractor] No events in ledger at: ${eventsPath}`);
    return null;
  }

  return extractMetricsFromEvents(events);
}

/**
 * Extract metrics from an array of ledger events
 */
export function extractMetricsFromEvents(events: LedgerEvent[]): ExtractedMetrics {
  // Initialize accumulators
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalIdentifiersProcessed = 0;
  let totalIdentifiersRenamed = 0;
  let totalDurationMs = 0;
  let success = false;
  let outputPath: string | undefined;

  const passStats: PassMetrics[] = [];

  // Process events
  for (const event of events) {
    if (isPassCompletedEvent(event)) {
      const passEvent = event as PassCompletedEvent;
      const stats = passEvent.stats;

      // Accumulate totals
      totalPromptTokens += stats.tokensUsed.prompt;
      totalCompletionTokens += stats.tokensUsed.completion;
      totalIdentifiersProcessed += stats.identifiersProcessed;
      totalIdentifiersRenamed += stats.identifiersRenamed;
      totalDurationMs += stats.durationMs;

      // Store per-pass stats
      passStats.push({
        passNumber: passEvent.passNumber,
        identifiersProcessed: stats.identifiersProcessed,
        identifiersRenamed: stats.identifiersRenamed,
        identifiersUnchanged: stats.identifiersUnchanged,
        identifiersSkipped: stats.identifiersSkipped,
        tokens: {
          promptTokens: stats.tokensUsed.prompt,
          completionTokens: stats.tokensUsed.completion,
          totalTokens: stats.tokensUsed.total,
        },
        durationMs: stats.durationMs,
        errors: stats.errors,
        batchCount: stats.batchCount,
      });
    } else if (isJobCompletedEvent(event)) {
      const jobEvent = event as JobCompletedEvent;
      success = jobEvent.success;
      outputPath = jobEvent.finalSnapshotPath;
      // Use job's total duration if available
      if (jobEvent.totalDurationMs) {
        totalDurationMs = jobEvent.totalDurationMs;
      }
    }
  }

  return {
    tokens: {
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      totalTokens: totalPromptTokens + totalCompletionTokens,
    },
    identifiersProcessed: totalIdentifiersProcessed,
    identifiersRenamed: totalIdentifiersRenamed,
    passCount: passStats.length,
    durationMs: totalDurationMs,
    passStats,
    success,
    outputPath,
  };
}

/**
 * Find the job directory for an experiment/sample combination
 *
 * Job directories are stored in .humanify-checkpoints/ and named with hashes
 * This searches for a matching job based on the experiment output directory
 */
export function findJobDir(
  checkpointDir: string,
  experimentId: string,
  sample: string
): string | null {
  // The job output dir contains the experiment/sample path
  // We need to find a job whose config.outputPath contains this
  // For now, we use a convention-based approach

  // Jobs are typically stored as:
  // .humanify-checkpoints/{inputHash}-{configHash}-{timestamp}/

  // Since we control the output dir when calling executeTurboV2,
  // we can store the job ID in the experiment data

  // For the MVP, assume job dir is:
  // {checkpointDir}/{experimentId}-{sample}/
  const expectedJobDir = join(checkpointDir, `${experimentId}-${sample}`);

  if (existsSync(expectedJobDir)) {
    return expectedJobDir;
  }

  return null;
}

/**
 * Get a summary of the metrics for display
 */
export function formatMetricsSummary(metrics: ExtractedMetrics): string {
  const durationSec = (metrics.durationMs / 1000).toFixed(1);
  const tokenK = (metrics.tokens.totalTokens / 1000).toFixed(1);

  return [
    `Duration: ${durationSec}s`,
    `Passes: ${metrics.passCount}`,
    `Identifiers: ${metrics.identifiersProcessed} processed, ${metrics.identifiersRenamed} renamed`,
    `Tokens: ${tokenK}K total (${metrics.tokens.promptTokens} prompt, ${metrics.tokens.completionTokens} completion)`,
    `Status: ${metrics.success ? "Success" : "Failed"}`,
  ].join("\n");
}
