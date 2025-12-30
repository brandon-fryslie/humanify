/**
 * Quality Regression Detection
 *
 * Tracks per-identifier confidence across passes and detects regressions.
 * A regression occurs when confidence drops by >10% between passes.
 *
 * Policies:
 * - keep-best: Use highest-confidence name from history
 * - keep-latest: Always use most recent name (ignore regressions)
 */

export interface IdentifierPass {
  pass: number;
  name: string;
  confidence: number;
}

export interface IdentifierHistory {
  id: string;
  passes: IdentifierPass[];
}

export interface RegressionDetectorConfig {
  /** Regression threshold: confidence drop > this fraction triggers regression */
  regressionThreshold?: number;
  /** Policy for handling regressions */
  policy?: 'keep-best' | 'keep-latest';
  /** Warning threshold: emit warning if regression rate exceeds this */
  warningThreshold?: number;
}

export interface Regression {
  id: string;
  previousPass: number;
  currentPass: number;
  previousName: string;
  currentName: string;
  previousConfidence: number;
  currentConfidence: number;
  confidenceDrop: number;
}

export interface RegressionReport {
  totalIdentifiers: number;
  regressedCount: number;
  regressionRate: number;
  regressions: Regression[];
  shouldWarn: boolean;
}

export interface RegressionDetector {
  /** Track a new rename decision for an identifier */
  trackRename(id: string, pass: number, name: string, confidence: number): void;

  /** Detect regressions for all tracked identifiers */
  detectRegressions(): RegressionReport;

  /** Get history for a specific identifier */
  getHistory(id: string): IdentifierHistory | null;

  /** Get the best name for an identifier based on policy */
  getBestName(id: string): { name: string; confidence: number; pass: number } | null;

  /** Clear all history (for testing) */
  clear(): void;
}

const DEFAULT_CONFIG: Required<RegressionDetectorConfig> = {
  regressionThreshold: 0.1, // 10% drop
  policy: 'keep-best',
  warningThreshold: 0.1, // Warn if >10% of identifiers regress
};

export class RegressionDetectorImpl implements RegressionDetector {
  private config: Required<RegressionDetectorConfig>;
  private history: Map<string, IdentifierPass[]>;

  constructor(config?: RegressionDetectorConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.history = new Map();
  }

  trackRename(id: string, pass: number, name: string, confidence: number): void {
    if (!this.history.has(id)) {
      this.history.set(id, []);
    }

    const passes = this.history.get(id)!;

    // Ensure passes are in order
    passes.push({ pass, name, confidence });
    passes.sort((a, b) => a.pass - b.pass);
  }

  detectRegressions(): RegressionReport {
    const regressions: Regression[] = [];
    const regressedIds = new Set<string>(); // Track unique identifiers that regressed

    for (const [id, passes] of this.history.entries()) {
      if (passes.length < 2) {
        continue; // Need at least 2 passes to detect regression
      }

      // Check each consecutive pair of passes
      for (let i = 1; i < passes.length; i++) {
        const prev = passes[i - 1];
        const curr = passes[i];

        // Regression: confidence[N] < confidence[N-1] * (1 - threshold)
        const threshold = prev.confidence * (1 - this.config.regressionThreshold);
        if (curr.confidence < threshold) {
          const drop = prev.confidence - curr.confidence;
          regressions.push({
            id,
            previousPass: prev.pass,
            currentPass: curr.pass,
            previousName: prev.name,
            currentName: curr.name,
            previousConfidence: prev.confidence,
            currentConfidence: curr.confidence,
            confidenceDrop: drop,
          });

          // Track that this identifier has regressed
          regressedIds.add(id);
        }
      }
    }

    const totalIdentifiers = this.history.size;
    const regressedCount = regressedIds.size; // Count unique identifiers, not events
    const regressionRate = totalIdentifiers > 0 ? regressedCount / totalIdentifiers : 0;
    const shouldWarn = regressionRate > this.config.warningThreshold;

    return {
      totalIdentifiers,
      regressedCount,
      regressionRate,
      regressions,
      shouldWarn,
    };
  }

  getHistory(id: string): IdentifierHistory | null {
    const passes = this.history.get(id);
    if (!passes) {
      return null;
    }

    return {
      id,
      passes: [...passes], // Return copy
    };
  }

  getBestName(id: string): { name: string; confidence: number; pass: number } | null {
    const passes = this.history.get(id);
    if (!passes || passes.length === 0) {
      return null;
    }

    if (this.config.policy === 'keep-latest') {
      // Return most recent pass
      const latest = passes[passes.length - 1];
      return {
        name: latest.name,
        confidence: latest.confidence,
        pass: latest.pass,
      };
    } else {
      // keep-best: Return highest confidence
      const best = passes.reduce((max, curr) => (curr.confidence > max.confidence ? curr : max));
      return {
        name: best.name,
        confidence: best.confidence,
        pass: best.pass,
      };
    }
  }

  clear(): void {
    this.history.clear();
  }

  /**
   * Get statistics for monitoring
   */
  getStats(): {
    identifierCount: number;
    passCount: number;
    avgConfidence: number;
    avgPassesPerIdentifier: number;
  } {
    const identifierCount = this.history.size;
    let totalPasses = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    for (const passes of this.history.values()) {
      totalPasses += passes.length;
      for (const pass of passes) {
        totalConfidence += pass.confidence;
        confidenceCount++;
      }
    }

    return {
      identifierCount,
      passCount: totalPasses,
      avgConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
      avgPassesPerIdentifier: identifierCount > 0 ? totalPasses / identifierCount : 0,
    };
  }

  /**
   * Generate warning message when regression rate is high
   */
  getWarningMessage(report: RegressionReport): string | null {
    if (!report.shouldWarn) {
      return null;
    }

    const rate = (report.regressionRate * 100).toFixed(1);
    const threshold = (this.config.warningThreshold * 100).toFixed(0);

    return `⚠ High churn detected: ${report.regressedCount}/${report.totalIdentifiers} identifiers regressed (${rate}% > ${threshold}% threshold). Consider fewer passes or different strategy.`;
  }
}

/**
 * Factory function for creating a RegressionDetector
 */
export function createRegressionDetector(config?: RegressionDetectorConfig): RegressionDetector {
  return new RegressionDetectorImpl(config);
}
