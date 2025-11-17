import * as cliProgress from "cli-progress";

/**
 * ANSI color codes for terminal output
 */
const COLORS = {
  reset: "\x1b[0m",
  yellow: "\x1b[33m",
  blue: "\x1b[94m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
};

/**
 * Apply color to text
 */
function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

/**
 * Centralized display manager to prevent overlapping progress bars
 * and provide clean, non-flickering output.
 */
export class DisplayManager {
  private multibar: cliProgress.MultiBar | null = null;
  private globalBar: cliProgress.SingleBar | null = null;
  private fileBar: cliProgress.SingleBar | null = null;
  private batchBar: cliProgress.SingleBar | null = null;
  private enabled: boolean;
  private currentIteration: number = 1;
  private totalIterations: number = 1;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;

    if (enabled) {
      // Create multibar container
      this.multibar = new cliProgress.MultiBar(
        {
          clearOnComplete: false,
          hideCursor: true,
          format: "{level} |{bar}| {percentage}% | {message}",
          gracefulExit: true,
        },
        cliProgress.Presets.shades_classic
      );
    }
  }

  /**
   * Show the iteration header (colored based on iteration number)
   * @param iteration - Current iteration number
   * @param totalIterations - Total number of iterations
   */
  showIterationHeader(iteration: number, totalIterations: number): void {
    if (!this.enabled) {
      return;
    }

    this.currentIteration = iteration;
    this.totalIterations = totalIterations;

    // Color coding:
    // - Iteration 1: Yellow (initial pass)
    // - Iteration 2+: Bright blue (refinement passes)
    const iterationLabel =
      iteration === 1
        ? colorize(`Iteration: ${iteration}`, "yellow")
        : colorize(`Iteration: ${iteration}+`, "blue");

    console.log(`\n${iterationLabel}`);
  }

  /**
   * Start or update the global progress bar
   * @param current - Current progress value
   * @param total - Total value
   * @param eta - Estimated time remaining (formatted string, e.g., "5m 30s")
   * @param message - Optional status message
   */
  updateGlobalProgress(
    current: number,
    total: number,
    eta: string,
    message?: string
  ): void {
    if (!this.enabled || !this.multibar) {
      return;
    }

    // Create global bar if it doesn't exist
    if (!this.globalBar) {
      this.globalBar = this.multibar.create(total, current, {
        level: colorize("Global  ", "green"),
        percentage: 0,
        message: message || "Initializing...",
      });
    }

    // Calculate percentage
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    // Update bar
    const displayMessage = message
      ? `${message} (ETA: ${eta})`
      : `ETA: ${eta}`;

    this.globalBar.update(current, {
      percentage,
      message: displayMessage,
    });

    // Update total if it changed
    if (this.globalBar.getTotal() !== total) {
      this.globalBar.setTotal(total);
    }
  }

  /**
   * Show current file being processed
   * @param filename - Name of the file
   * @param fileIndex - Index of current file (1-based)
   * @param totalFiles - Total number of files
   */
  showCurrentFile(filename: string, fileIndex: number, totalFiles: number): void {
    if (!this.enabled) {
      return;
    }

    console.log(
      colorize(`\nProcessing file ${fileIndex}/${totalFiles}: ${filename}`, "cyan")
    );
  }

  /**
   * Start a new batch progress bar
   * @param batchNum - Current batch number (1-based)
   * @param totalBatches - Total number of batches
   * @param batchSize - Number of items in this batch
   */
  startBatch(batchNum: number, totalBatches: number, batchSize: number): void {
    if (!this.enabled || !this.multibar) {
      return;
    }

    // Remove old batch bar if it exists
    if (this.batchBar) {
      this.multibar.remove(this.batchBar);
      this.batchBar = null;
    }

    // Create new batch bar
    this.batchBar = this.multibar.create(batchSize, 0, {
      level: colorize("  Batch ", "gray"),
      percentage: 0,
      message: `Batch ${batchNum}/${totalBatches}`,
    });
  }

  /**
   * Update batch progress
   * @param current - Current progress value
   * @param message - Optional status message
   */
  updateBatch(current: number, message?: string): void {
    if (!this.enabled || !this.batchBar) {
      return;
    }

    const total = this.batchBar.getTotal();
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    this.batchBar.update(current, {
      percentage,
      message: message || this.batchBar.value,
    });
  }

  /**
   * Finish current batch and remove its progress bar
   * @param summary - Optional summary message to display
   */
  finishBatch(summary?: string): void {
    if (!this.enabled || !this.multibar) {
      return;
    }

    // Complete the batch bar
    if (this.batchBar) {
      this.batchBar.update(this.batchBar.getTotal());
      this.multibar.remove(this.batchBar);
      this.batchBar = null;
    }

    // Show summary if provided
    if (summary) {
      console.log(colorize(`  ✓ ${summary}`, "gray"));
    }
  }

  /**
   * Show a status message (doesn't interfere with progress bars)
   * @param message - Status message to display
   */
  showStatus(message: string): void {
    if (!this.enabled) {
      return;
    }

    console.log(colorize(`  ${message}`, "gray"));
  }

  /**
   * Show an error message
   * @param message - Error message to display
   */
  showError(message: string): void {
    if (!this.enabled) {
      return;
    }

    console.error(colorize(`✗ ${message}`, "red"));
  }

  /**
   * Show a success message
   * @param message - Success message to display
   */
  showSuccess(message: string): void {
    if (!this.enabled) {
      return;
    }

    console.log(colorize(`✓ ${message}`, "green"));
  }

  /**
   * Stop all progress bars and clean up
   */
  stop(): void {
    if (!this.enabled || !this.multibar) {
      return;
    }

    // Complete all bars to their totals
    if (this.globalBar) {
      this.globalBar.update(this.globalBar.getTotal());
    }
    if (this.fileBar) {
      this.fileBar.update(this.fileBar.getTotal());
    }
    if (this.batchBar) {
      this.batchBar.update(this.batchBar.getTotal());
    }

    // Stop multibar
    this.multibar.stop();

    // Clear references
    this.globalBar = null;
    this.fileBar = null;
    this.batchBar = null;
  }

  /**
   * Check if display manager is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
let displayManager: DisplayManager | null = null;

/**
 * Get the display manager singleton
 * @param enabled - Whether to enable display (default: true)
 */
export function getDisplayManager(enabled: boolean = true): DisplayManager {
  if (!displayManager) {
    displayManager = new DisplayManager(enabled);
  }
  return displayManager;
}

/**
 * Reset the display manager (for testing)
 */
export function resetDisplayManager(): void {
  if (displayManager) {
    displayManager.stop();
    displayManager = null;
  }
}
