/**
 * METRICS COLLECTOR: Track and Export Metrics
 *
 * Purpose: Collect metrics for observability and analysis
 *
 * Key Responsibilities:
 * - Track timing data (pass duration, identifier processing time)
 * - Track token usage (prompt, completion, total)
 * - Track errors (count, types)
 * - Track vault hit rates
 * - Export to JSONL format
 * - Support quiet/verbose modes
 */

import * as fs from "fs/promises";
import * as path from "path";
import { PassStats } from "../ledger/events.js";

/**
 * Metric event types
 */
export type MetricEvent =
  | {
      type: "job_started";
      timestamp: string;
      jobId: string;
      inputFile: string;
      totalIdentifiers: number;
      totalPasses: number;
    }
  | {
      type: "pass_completed";
      timestamp: string;
      jobId: string;
      passNumber: number;
      stats: PassStats;
    }
  | {
      type: "vault_hit";
      timestamp: string;
      jobId: string;
      cacheKey: string;
    }
  | {
      type: "vault_miss";
      timestamp: string;
      jobId: string;
      cacheKey: string;
    }
  | {
      type: "error";
      timestamp: string;
      jobId: string;
      errorType: string;
      message: string;
      context?: string;
    }
  | {
      type: "job_completed";
      timestamp: string;
      jobId: string;
      totalDurationMs: number;
      totalTokens: number;
      totalErrors: number;
      vaultHitRate: number;
    };

/**
 * Metrics summary for a job
 */
export interface MetricsSummary {
  jobId: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  passes: number;
  identifiers: number;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  errors: number;
  vaultStats: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

/**
 * Configuration for metrics collector
 */
export interface MetricsCollectorConfig {
  outputDir: string; // Directory to write metrics.jsonl (default: logs/)
  quiet?: boolean; // Disable console output (default: false)
  verbose?: boolean; // Enable detailed logging (default: false)
}

/**
 * MetricsCollector: Collect and export metrics
 */
export class MetricsCollector {
  private config: Required<MetricsCollectorConfig>;
  private metricsPath: string;
  private events: MetricEvent[] = [];
  private vaultHits: number = 0;
  private vaultMisses: number = 0;
  private startTime: string | null = null;

  constructor(config: MetricsCollectorConfig) {
    this.config = {
      outputDir: config.outputDir,
      quiet: config.quiet ?? false,
      verbose: config.verbose ?? false,
    };

    this.metricsPath = path.join(this.config.outputDir, "metrics.jsonl");
  }

  /**
   * Initialize metrics collection (ensure output directory exists)
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.config.outputDir, { recursive: true });

    if (this.config.verbose) {
      console.log(`[metrics] Writing to ${this.metricsPath}`);
    }
  }

  /**
   * Record job started event
   */
  async recordJobStarted(
    jobId: string,
    inputFile: string,
    totalIdentifiers: number,
    totalPasses: number
  ): Promise<void> {
    const event: MetricEvent = {
      type: "job_started",
      timestamp: new Date().toISOString(),
      jobId,
      inputFile,
      totalIdentifiers,
      totalPasses,
    };

    this.startTime = event.timestamp;
    await this.recordEvent(event);

    if (!this.config.quiet) {
      console.log(
        `[metrics] Job started: ${inputFile} (${totalIdentifiers} identifiers, ${totalPasses} passes)`
      );
    }
  }

  /**
   * Record pass completed event
   */
  async recordPassCompleted(
    jobId: string,
    passNumber: number,
    stats: PassStats
  ): Promise<void> {
    const event: MetricEvent = {
      type: "pass_completed",
      timestamp: new Date().toISOString(),
      jobId,
      passNumber,
      stats,
    };

    await this.recordEvent(event);

    if (this.config.verbose) {
      console.log(
        `[metrics] Pass ${passNumber} completed: ${stats.identifiersProcessed} identifiers, ${stats.tokensUsed.total} tokens, ${(stats.durationMs / 1000).toFixed(1)}s`
      );
    }
  }

  /**
   * Record vault hit
   */
  async recordVaultHit(jobId: string, cacheKey: string): Promise<void> {
    this.vaultHits++;

    if (this.config.verbose) {
      const event: MetricEvent = {
        type: "vault_hit",
        timestamp: new Date().toISOString(),
        jobId,
        cacheKey,
      };

      await this.recordEvent(event);
    }
  }

  /**
   * Record vault miss
   */
  async recordVaultMiss(jobId: string, cacheKey: string): Promise<void> {
    this.vaultMisses++;

    if (this.config.verbose) {
      const event: MetricEvent = {
        type: "vault_miss",
        timestamp: new Date().toISOString(),
        jobId,
        cacheKey,
      };

      await this.recordEvent(event);
    }
  }

  /**
   * Record error
   */
  async recordError(
    jobId: string,
    errorType: string,
    message: string,
    context?: string
  ): Promise<void> {
    const event: MetricEvent = {
      type: "error",
      timestamp: new Date().toISOString(),
      jobId,
      errorType,
      message,
      context,
    };

    await this.recordEvent(event);

    if (!this.config.quiet) {
      console.error(`[metrics] Error: ${errorType} - ${message}`);
    }
  }

  /**
   * Record job completed event
   */
  async recordJobCompleted(
    jobId: string,
    totalDurationMs: number,
    totalTokens: number,
    totalErrors: number
  ): Promise<void> {
    const vaultHitRate =
      this.vaultHits + this.vaultMisses > 0
        ? this.vaultHits / (this.vaultHits + this.vaultMisses)
        : 0;

    const event: MetricEvent = {
      type: "job_completed",
      timestamp: new Date().toISOString(),
      jobId,
      totalDurationMs,
      totalTokens,
      totalErrors,
      vaultHitRate,
    };

    await this.recordEvent(event);

    if (!this.config.quiet) {
      console.log(
        `[metrics] Job completed: ${(totalDurationMs / 1000).toFixed(1)}s, ${totalTokens} tokens, ${totalErrors} errors`
      );
      console.log(
        `[metrics] Vault: ${this.vaultHits} hits, ${this.vaultMisses} misses (${(vaultHitRate * 100).toFixed(1)}% hit rate)`
      );
    }
  }

  /**
   * Get metrics summary
   */
  getSummary(jobId: string): MetricsSummary | null {
    // Find job_started and job_completed events
    const startedEvent = this.events.find(
      (e) => e.type === "job_started" && e.jobId === jobId
    ) as Extract<MetricEvent, { type: "job_started" }> | undefined;

    const completedEvent = this.events.find(
      (e) => e.type === "job_completed" && e.jobId === jobId
    ) as Extract<MetricEvent, { type: "job_completed" }> | undefined;

    if (!startedEvent || !completedEvent) {
      return null;
    }

    // Aggregate pass stats
    const passEvents = this.events.filter(
      (e) => e.type === "pass_completed" && e.jobId === jobId
    ) as Extract<MetricEvent, { type: "pass_completed" }>[];

    const tokensUsed = passEvents.reduce(
      (acc, e) => ({
        prompt: acc.prompt + e.stats.tokensUsed.prompt,
        completion: acc.completion + e.stats.tokensUsed.completion,
        total: acc.total + e.stats.tokensUsed.total,
      }),
      { prompt: 0, completion: 0, total: 0 }
    );

    return {
      jobId,
      startTime: startedEvent.timestamp,
      endTime: completedEvent.timestamp,
      durationMs: completedEvent.totalDurationMs,
      passes: passEvents.length,
      identifiers: startedEvent.totalIdentifiers,
      tokensUsed,
      errors: completedEvent.totalErrors,
      vaultStats: {
        hits: this.vaultHits,
        misses: this.vaultMisses,
        hitRate: completedEvent.vaultHitRate,
      },
    };
  }

  /**
   * Get vault hit rate
   */
  getVaultHitRate(): number {
    if (this.vaultHits + this.vaultMisses === 0) {
      return 0;
    }

    return this.vaultHits / (this.vaultHits + this.vaultMisses);
  }

  /**
   * Record an event (write to JSONL and store in memory)
   */
  private async recordEvent(event: MetricEvent): Promise<void> {
    this.events.push(event);

    // Append to JSONL file
    const line = JSON.stringify(event) + "\n";
    await fs.appendFile(this.metricsPath, line, "utf-8");
  }

  /**
   * Clear all metrics (for testing)
   */
  clear(): void {
    this.events = [];
    this.vaultHits = 0;
    this.vaultMisses = 0;
    this.startTime = null;
  }
}
