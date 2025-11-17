import { WorkEstimate } from "./estimate-work.js";

/**
 * State tracked across the entire processing run
 */
export interface ProgressState {
  currentIteration: number;
  totalIterations: number;
  completedBatches: number;
  totalBatches: number;
  completedIdentifiers: number;
  totalIdentifiers: number;
  startTime: number;
}

/**
 * Derived metrics from progress state
 */
export interface ProgressMetrics {
  state: ProgressState;
  percentComplete: number;
  etaSeconds: number | null;
  identifiersPerSecond: number;
  elapsedSeconds: number;
}

/**
 * Format ETA seconds into a human-readable string
 * @param etaSeconds - ETA in seconds, or null if not available
 * @returns Formatted string like "5m 30s" or "2h 15m" or "calculating..."
 */
export function formatETA(etaSeconds: number | null): string {
  if (etaSeconds === null) {
    return "calculating...";
  }

  if (etaSeconds < 60) {
    return `${Math.ceil(etaSeconds)}s`;
  }

  if (etaSeconds < 3600) {
    const minutes = Math.floor(etaSeconds / 60);
    const seconds = Math.ceil(etaSeconds % 60);
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(etaSeconds / 3600);
  const minutes = Math.ceil((etaSeconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

/**
 * Global progress manager that tracks state across all iterations, files, and batches
 */
export class GlobalProgressManager {
  private state: ProgressState | null = null;

  /**
   * Initialize progress tracking
   * @param estimate - Work estimate from estimate-work.ts
   * @param iterations - Total number of iterations (e.g., 1 for single pass, 2 for refinement)
   */
  initialize(estimate: WorkEstimate, iterations: number): void {
    this.state = {
      currentIteration: 1,
      totalIterations: iterations,
      completedBatches: 0,
      totalBatches: estimate.totalBatches * iterations,
      completedIdentifiers: 0,
      totalIdentifiers: estimate.totalIdentifiers * iterations,
      startTime: Date.now(),
    };
  }

  /**
   * Begin a new iteration
   * @param iterationNum - The iteration number (1-indexed)
   */
  startIteration(iterationNum: number): void {
    if (!this.state) {
      throw new Error("GlobalProgressManager not initialized");
    }

    this.state.currentIteration = iterationNum;
  }

  /**
   * Update progress with newly completed work
   * @param batchesCompleted - Number of batches completed in this update
   * @param identifiersCompleted - Number of identifiers completed in this update
   */
  updateProgress(batchesCompleted: number, identifiersCompleted: number): void {
    if (!this.state) {
      throw new Error("GlobalProgressManager not initialized");
    }

    this.state.completedBatches += batchesCompleted;
    this.state.completedIdentifiers += identifiersCompleted;
  }

  /**
   * Get current progress state and calculated metrics
   * @returns Progress metrics including percentage, ETA, and rates
   */
  getProgress(): ProgressMetrics {
    if (!this.state) {
      throw new Error("GlobalProgressManager not initialized");
    }

    const elapsedMs = Date.now() - this.state.startTime;
    const elapsedSeconds = elapsedMs / 1000;

    // Calculate percentage complete (0-100)
    const percentComplete =
      this.state.totalIdentifiers > 0
        ? (this.state.completedIdentifiers / this.state.totalIdentifiers) * 100
        : 0;

    // Calculate processing rate (identifiers per second)
    const identifiersPerSecond =
      elapsedSeconds > 0 ? this.state.completedIdentifiers / elapsedSeconds : 0;

    // Calculate ETA (estimated time of arrival)
    let etaSeconds: number | null = null;
    if (identifiersPerSecond > 0 && this.state.completedIdentifiers > 0) {
      const remainingIdentifiers =
        this.state.totalIdentifiers - this.state.completedIdentifiers;
      etaSeconds = remainingIdentifiers / identifiersPerSecond;
    }

    return {
      state: { ...this.state },
      percentComplete,
      etaSeconds,
      identifiersPerSecond,
      elapsedSeconds,
    };
  }

  /**
   * Mark processing as finished
   */
  finish(): void {
    if (!this.state) {
      return;
    }

    // Update to 100% complete
    this.state.completedBatches = this.state.totalBatches;
    this.state.completedIdentifiers = this.state.totalIdentifiers;
  }

  /**
   * Reset the manager state (for testing)
   */
  reset(): void {
    this.state = null;
  }

  /**
   * Check if manager is initialized
   */
  isInitialized(): boolean {
    return this.state !== null;
  }
}

// Singleton instance
let globalProgressManager: GlobalProgressManager | null = null;

/**
 * Get the global progress manager singleton
 */
export function getGlobalProgressManager(): GlobalProgressManager {
  if (!globalProgressManager) {
    globalProgressManager = new GlobalProgressManager();
  }
  return globalProgressManager;
}

/**
 * Reset the global progress manager (for testing)
 */
export function resetGlobalProgressManager(): void {
  globalProgressManager = null;
}
