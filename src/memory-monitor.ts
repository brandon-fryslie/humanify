/**
 * Memory monitoring and limit enforcement
 */

export interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  timestamp: number;
}

export interface MemoryCheckpoint {
  phase: string;
  snapshot: MemorySnapshot;
}

export class MemoryMonitor {
  private checkpoints: MemoryCheckpoint[] = [];
  private maxMemoryMB: number | null = null;

  /**
   * Set maximum memory limit in MB
   */
  setLimit(limitMB: number): void {
    this.maxMemoryMB = limitMB;
  }

  /**
   * Take a memory snapshot at a specific phase
   */
  checkpoint(phase: string): void {
    const snapshot = this.takeSnapshot();
    this.checkpoints.push({ phase, snapshot });

    // Log if verbose
    const heapMB = (snapshot.heapUsed / 1024 / 1024).toFixed(0);
    const rssMB = (snapshot.rss / 1024 / 1024).toFixed(0);
    console.log(`    → Memory (${phase}): ${heapMB}MB heap, ${rssMB}MB RSS`);
  }

  /**
   * Take a memory snapshot
   */
  private takeSnapshot(): MemorySnapshot {
    const mem = process.memoryUsage();
    return {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
      rss: mem.rss,
      timestamp: Date.now()
    };
  }

  /**
   * Get peak memory usage across all checkpoints
   */
  getPeak(): number {
    if (this.checkpoints.length === 0) {
      return process.memoryUsage().heapUsed;
    }
    return Math.max(...this.checkpoints.map((c) => c.snapshot.heapUsed));
  }

  /**
   * Check if current memory usage exceeds limit
   * Returns false if limit is exceeded
   */
  checkLimit(limitMB?: number): boolean {
    const limit = limitMB ?? this.maxMemoryMB;
    if (limit === null) return true;

    const heapUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;
    return heapUsedMB <= limit;
  }

  /**
   * Abort if memory limit is exceeded
   * Throws error if limit exceeded
   */
  abortIfExceeds(limitMB?: number): void {
    const limit = limitMB ?? this.maxMemoryMB;
    if (limit === null) return;

    const heapUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;
    if (heapUsedMB > limit) {
      throw new Error(
        `Memory limit exceeded: ${heapUsedMB.toFixed(0)}MB used, ${limit}MB limit. ` +
        `Try: node --max-old-space-size=${Math.ceil(heapUsedMB * 1.5)} humanify ...`
      );
    }
  }

  /**
   * Report memory usage summary
   */
  report(): void {
    if (this.checkpoints.length === 0) {
      console.log("\n=== Memory Report ===");
      console.log("No checkpoints recorded");
      return;
    }

    console.log("\n=== Memory Report ===");
    console.log(
      `${"Phase".padEnd(30)} ${"Heap Used".padStart(12)} ${"RSS".padStart(12)} ${"Delta".padStart(12)}`
    );
    console.log("─".repeat(70));

    let previousHeap = 0;
    for (const checkpoint of this.checkpoints) {
      const heapMB = (checkpoint.snapshot.heapUsed / 1024 / 1024).toFixed(1);
      const rssMB = (checkpoint.snapshot.rss / 1024 / 1024).toFixed(1);
      const deltaMB =
        previousHeap > 0
          ? ((checkpoint.snapshot.heapUsed - previousHeap) / 1024 / 1024).toFixed(1)
          : "0.0";
      const deltaStr =
        previousHeap > 0
          ? `${parseFloat(deltaMB) >= 0 ? "+" : ""}${deltaMB}MB`
          : "-";

      console.log(
        `${checkpoint.phase.padEnd(30)} ${(heapMB + "MB").padStart(12)} ${(rssMB + "MB").padStart(12)} ${deltaStr.padStart(12)}`
      );

      previousHeap = checkpoint.snapshot.heapUsed;
    }

    const peakMB = (this.getPeak() / 1024 / 1024).toFixed(1);
    console.log("─".repeat(70));
    console.log(`Peak memory usage: ${peakMB}MB`);
    console.log();
  }

  /**
   * Reset all checkpoints
   */
  reset(): void {
    this.checkpoints = [];
  }
}

// Global memory monitor instance
export const memoryMonitor = new MemoryMonitor();
