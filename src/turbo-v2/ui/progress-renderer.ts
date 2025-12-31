/**
 * PROGRESS RENDERER: Fixed-Layout Progress UI
 *
 * Purpose: Display real-time progress with fixed-width lines (no flicker)
 *
 * Key Responsibilities:
 * - Show global progress (across all passes/iterations)
 * - Show pass-level progress
 * - Show batch-level progress
 * - Color coding: iteration 1 (yellow), iteration 2+ (blue), errors (red)
 * - ETA calculation based on throughput
 * - Fixed-width output (prevent terminal flicker)
 */

import { PassStats } from "../ledger/events.js";

/**
 * Color codes for terminal output
 */
const COLORS = {
  RESET: "\x1b[0m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[36m",
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  CYAN: "\x1b[96m",
  DIM: "\x1b[2m",
};

/**
 * Progress state for tracking
 */
export interface ProgressState {
  jobId: string;
  inputFile: string;
  totalIdentifiers: number;
  currentIteration: number;
  totalIterations: number;
  currentPass: number;
  totalPasses: number;
  currentBatch?: number;
  totalBatches?: number;
  globalProcessed: number;
  globalTotal: number;
  passProcessed: number;
  passTotal: number;
  batchProcessed?: number;
  batchTotal?: number;
  tokensUsed: number;
  errors: number;
  startTime: number;
  lastCheckpointTime?: number;
  lastCheckpointCount?: number;
}

/**
 * Configuration for progress renderer
 */
export interface ProgressRendererConfig {
  width?: number; // Terminal width (default: 80)
  showColor?: boolean; // Enable color output (default: true)
  updateIntervalMs?: number; // Min time between updates (default: 100ms)
  quiet?: boolean; // Disable all output (default: false)
  noColor?: boolean; // Disable color (default: false)
}

/**
 * ProgressRenderer: Display fixed-layout progress
 */
export class ProgressRenderer {
  private config: {
    width: number;
    showColor: boolean;
    updateIntervalMs: number;
    quiet: boolean;
  };
  private lastUpdateTime: number = 0;
  private lineCount: number = 0;
  private currentState: ProgressState | null = null;

  constructor(config: ProgressRendererConfig = {}) {
    this.config = {
      width: config.width ?? 80,
      showColor: config.showColor ?? (config.noColor ? false : true),
      updateIntervalMs: config.updateIntervalMs ?? 100,
      quiet: config.quiet ?? false,
    };
  }

  /**
   * Start the progress display (no-op, for compatibility)
   */
  start(): void {
    // Nothing to do on start
  }

  /**
   * Update progress for a pass
   */
  updatePass(passNumber: number, processed: number, total: number): void {
    if (this.config.quiet) return;

    // Simple progress update - could be enhanced to use full render()
    const percent = total > 0 ? Math.floor((processed / total) * 100) : 0;
    process.stdout.write(`\r[pass ${passNumber}] ${processed}/${total} (${percent}%)`);
  }

  /**
   * Mark progress as complete
   */
  complete(): void {
    if (!this.config.quiet) {
      console.log(""); // New line after progress updates
    }
  }

  /**
   * Display an error message
   */
  error(message: string): void {
    console.error(this.color(`[turbo-v2] Error: ${message}`, COLORS.RED));
  }

  /**
   * Render progress display
   */
  render(state: ProgressState): void {
    // Throttle updates
    const now = Date.now();
    if (now - this.lastUpdateTime < this.config.updateIntervalMs) {
      return;
    }
    this.lastUpdateTime = now;

    // Clear previous output
    this.clearLines();

    const lines: string[] = [];

    // Line 1: Header
    lines.push(this.renderHeader(state));

    // Line 2: Empty line
    lines.push("");

    // Line 3: Global progress
    lines.push(this.renderGlobalProgress(state));

    // Line 4: Pass progress
    lines.push(this.renderPassProgress(state));

    // Line 5: Metrics
    lines.push(this.renderMetrics(state));

    // Line 6: Empty line
    lines.push("");

    // Line 7: Separator
    lines.push(this.renderSeparator());

    // Output all lines
    for (const line of lines) {
      console.log(line);
    }

    this.lineCount = lines.length;
  }

  /**
   * Clear previous lines (move cursor up and clear)
   */
  private clearLines(): void {
    if (this.lineCount > 0) {
      // Move cursor up
      process.stdout.write(`\x1b[${this.lineCount}A`);
      // Clear from cursor to end of screen
      process.stdout.write("\x1b[J");
    }
  }

  /**
   * Render header line
   */
  private renderHeader(state: ProgressState): string {
    const prefix = this.color("[turbo-v2]", COLORS.CYAN);
    const jobId = this.color(state.jobId, COLORS.DIM);
    const file = state.inputFile;
    const count = this.color(
      `(${state.totalIdentifiers} identifiers)`,
      COLORS.DIM
    );

    return `${prefix} ${jobId} | ${file} ${count}`;
  }

  /**
   * Render global progress bar
   */
  private renderGlobalProgress(state: ProgressState): string {
    const iterationColor =
      state.currentIteration === 1 ? COLORS.YELLOW : COLORS.BLUE;

    const iterLabel = this.color(
      `Iteration ${state.currentIteration}/${state.totalIterations}`,
      iterationColor
    );

    const percent = Math.floor(
      (state.globalProcessed / state.globalTotal) * 100
    );
    const bar = this.renderProgressBar(
      state.globalProcessed,
      state.globalTotal,
      30,
      iterationColor
    );

    const eta = this.calculateETA(
      state.globalProcessed,
      state.globalTotal,
      state.startTime
    );

    return `${iterLabel} | Global ${percent}% ${bar} ETA ${eta}`;
  }

  /**
   * Render pass-level progress
   */
  private renderPassProgress(state: ProgressState): string {
    const passLabel = `Pass ${state.currentPass}/${state.totalPasses}`;

    let batchInfo = "";
    if (state.currentBatch !== undefined && state.totalBatches !== undefined) {
      const batchPercent = state.totalBatches > 0
        ? Math.floor((state.currentBatch / state.totalBatches) * 100)
        : 0;
      const batchBar = this.renderProgressBar(
        state.currentBatch,
        state.totalBatches,
        20,
        COLORS.GREEN
      );
      batchInfo = ` | Batch ${state.currentBatch}/${state.totalBatches} ${batchPercent}% ${batchBar}`;
    }

    return `${passLabel}${batchInfo}`;
  }

  /**
   * Render metrics line
   */
  private renderMetrics(state: ProgressState): string {
    const tokensLabel = `Tokens: ${this.formatNumber(state.tokensUsed)}`;

    const errorsColor = state.errors > 0 ? COLORS.RED : COLORS.GREEN;
    const errorsLabel = this.color(`Errors: ${state.errors}`, errorsColor);

    let checkpointInfo = "";
    if (
      state.lastCheckpointTime !== undefined &&
      state.lastCheckpointCount !== undefined
    ) {
      const secondsAgo = Math.floor((Date.now() - state.lastCheckpointTime) / 1000);
      checkpointInfo = ` | Checkpoint: ${secondsAgo}s/${state.lastCheckpointCount} ids`;
    }

    return `${tokensLabel} | ${errorsLabel}${checkpointInfo}`;
  }

  /**
   * Render separator line
   */
  private renderSeparator(): string {
    return "─".repeat(this.config.width);
  }

  /**
   * Render a progress bar
   */
  private renderProgressBar(
    current: number,
    total: number,
    width: number,
    color: string
  ): string {
    if (total === 0) {
      return `[${"░".repeat(width)}]`;
    }

    const filled = Math.floor((current / total) * width);
    const empty = width - filled;

    const bar = this.color("█".repeat(filled), color) + "░".repeat(empty);

    return `[${bar}]`;
  }

  /**
   * Calculate ETA
   */
  private calculateETA(
    current: number,
    total: number,
    startTime: number
  ): string {
    if (current === 0) {
      return "calculating...";
    }

    const elapsed = Date.now() - startTime;
    const rate = current / elapsed; // items per ms
    const remaining = total - current;
    const etaMs = remaining / rate;

    return this.formatDuration(etaMs);
  }

  /**
   * Format duration in human-readable form
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);

    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Format large numbers with K/M suffix
   */
  private formatNumber(num: number): string {
    if (num < 1000) {
      return String(num);
    }

    if (num < 1000000) {
      return `${Math.floor(num / 1000)}k`;
    }

    return `${(num / 1000000).toFixed(1)}M`;
  }

  /**
   * Apply color if enabled
   */
  private color(text: string, color: string): string {
    if (!this.config.showColor) {
      return text;
    }

    return `${color}${text}${COLORS.RESET}`;
  }

  /**
   * Render pass summary after pass completion
   */
  renderPassSummary(
    passNumber: number,
    totalPasses: number,
    stats: PassStats,
    snapshotPath?: string
  ): void {
    console.log("");
    console.log(
      this.color(
        `[pass ${passNumber}/${totalPasses}] Complete`,
        COLORS.GREEN
      )
    );

    const lines: string[] = [
      `  • Identifiers: ${stats.identifiersProcessed} processed, ${stats.identifiersRenamed} renamed, ${stats.identifiersUnchanged} unchanged`,
      `  • Tokens: ${this.formatNumber(stats.tokensUsed.total)} (prompt: ${this.formatNumber(stats.tokensUsed.prompt)}, completion: ${this.formatNumber(stats.tokensUsed.completion)})`,
      `  • Duration: ${(stats.durationMs / 1000).toFixed(1)}s (avg ${Math.floor(stats.durationMs / stats.identifiersProcessed)}ms/id)`,
      `  • Errors: ${stats.errors}`,
    ];

    if (snapshotPath) {
      lines.push(`  • Snapshot: ${snapshotPath}`);
    }

    for (const line of lines) {
      console.log(line);
    }

    console.log("");
  }

  /**
   * Render final job summary
   */
  renderJobSummary(
    totalPasses: number,
    allPassStats: PassStats[],
    outputPath: string
  ): void {
    console.log("");
    console.log(this.color("[turbo-v2] Job Complete", COLORS.GREEN));
    console.log("");

    // Aggregate stats
    const totalIdentifiers = allPassStats[0]?.identifiersProcessed ?? 0;
    const totalRenamed = allPassStats.reduce(
      (sum, s) => sum + s.identifiersRenamed,
      0
    );
    const totalTokens = allPassStats.reduce(
      (sum, s) => sum + s.tokensUsed.total,
      0
    );
    const totalDuration = allPassStats.reduce((sum, s) => sum + s.durationMs, 0);
    const totalErrors = allPassStats.reduce((sum, s) => sum + s.errors, 0);

    const lines: string[] = [
      `  • Passes: ${totalPasses}`,
      `  • Identifiers: ${totalIdentifiers}`,
      `  • Total Renames: ${totalRenamed}`,
      `  • Total Tokens: ${this.formatNumber(totalTokens)}`,
      `  • Total Duration: ${(totalDuration / 1000).toFixed(1)}s`,
      `  • Total Errors: ${totalErrors}`,
      `  • Output: ${outputPath}`,
    ];

    for (const line of lines) {
      console.log(line);
    }

    console.log("");
  }
}
