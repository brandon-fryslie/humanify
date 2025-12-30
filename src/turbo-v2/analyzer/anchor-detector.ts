/**
 * Anchor Detection - Identifies high-importance identifiers
 *
 * Anchors are identifiers that should be processed with maximum care (sequentially)
 * because they provide semantic context for other identifiers.
 *
 * Importance score formula (from FINAL_PROJECT_SPEC.md):
 * importance = 0.5 * log(references) + 0.3 * (isExport ? 1 : 0) + 0.2 * (scopeSize / maxScope)
 */

export interface Identifier {
  id: string;
  name: string;
  bindingType: 'var' | 'function' | 'class' | 'parameter' | 'import';
  scopeId: string;
  references: number;
  context: string;
  isExported?: boolean;
  scopeSize?: number;
}

export interface AnchorDetectorConfig {
  /** Percentile threshold for anchor selection (e.g., 0.1 = top 10%) */
  threshold?: number;
  /** Minimum reference count to be considered an anchor */
  minReferences?: number;
  /** Exported identifiers automatically become anchors */
  exportsAreAnchors?: boolean;
}

export interface AnchorDetector {
  detectAnchors(identifiers: Identifier[]): Identifier[];
  computeImportance(identifier: Identifier): number;
}

/**
 * Default configuration:
 * - Top 10-20% by importance score
 * - Minimum 3 references
 * - Exports are automatically anchors
 */
const DEFAULT_CONFIG: Required<AnchorDetectorConfig> = {
  threshold: 0.2, // Top 20%
  minReferences: 3,
  exportsAreAnchors: true,
};

export class AnchorDetectorImpl implements AnchorDetector {
  private config: Required<AnchorDetectorConfig>;

  constructor(config?: AnchorDetectorConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Compute importance score for an identifier
   *
   * Formula: 0.5 * log(references) + 0.3 * (isExport ? 1 : 0) + 0.2 * (scopeSize / maxScope)
   *
   * Components:
   * - Reference count (50% weight): More references = more important
   * - Export status (30% weight): Exported identifiers are API surface
   * - Scope size (20% weight): Larger scopes affect more code
   *
   * Score range: 0-1 (normalized)
   */
  computeImportance(identifier: Identifier): number {
    // Component 1: Reference count (logarithmic scale to handle outliers)
    // log(1) = 0, log(10) ≈ 1, log(100) ≈ 2
    // Normalize to 0-1 range by dividing by log(100) ≈ 4.6
    const refScore = identifier.references > 0 ? Math.log(identifier.references + 1) / 4.6 : 0;

    // Component 2: Export status (binary: 0 or 1)
    const exportScore = identifier.isExported ? 1 : 0;

    // Component 3: Scope size (not yet implemented in analyzer, default to 0)
    // Will be implemented when scope size tracking is added
    const scopeScore = 0;

    // Weighted combination
    const importance = 0.5 * refScore + 0.3 * exportScore + 0.2 * scopeScore;

    return Math.min(importance, 1.0); // Cap at 1.0
  }

  /**
   * Detect anchors from a list of identifiers
   *
   * Algorithm:
   * 1. Filter out identifiers with too few references
   * 2. Compute importance score for each
   * 3. Sort by importance (descending)
   * 4. Take top N% by threshold
   * 5. Always include exports if configured
   *
   * Returns: Array of anchor identifiers (sorted by importance, descending)
   */
  detectAnchors(identifiers: Identifier[]): Identifier[] {
    if (identifiers.length === 0) {
      return [];
    }

    // Step 1: Filter by minimum references
    const candidates = identifiers.filter(
      (id) => id.references >= this.config.minReferences || (this.config.exportsAreAnchors && id.isExported),
    );

    if (candidates.length === 0) {
      return [];
    }

    // Step 2 & 3: Compute importance and sort
    const scored = candidates
      .map((identifier) => ({
        identifier,
        importance: this.computeImportance(identifier),
      }))
      .sort((a, b) => b.importance - a.importance);

    // Step 4: Take top N%
    const cutoffIndex = Math.max(1, Math.ceil(scored.length * this.config.threshold));
    const topAnchors = scored.slice(0, cutoffIndex);

    // Step 5: Ensure all exports are included (if configured)
    if (this.config.exportsAreAnchors) {
      const exportedIds = identifiers.filter((id) => id.isExported);
      const exportedIdSet = new Set(exportedIds.map((id) => id.id));

      // Add any exports not in top N%
      for (const exportedId of exportedIds) {
        if (!topAnchors.some((a) => a.identifier.id === exportedId.id)) {
          topAnchors.push({
            identifier: exportedId,
            importance: this.computeImportance(exportedId),
          });
        }
      }
    }

    // Return identifiers only (sorted by importance)
    return topAnchors.sort((a, b) => b.importance - a.importance).map((a) => a.identifier);
  }

  /**
   * Get statistics about anchor detection
   */
  getStats(identifiers: Identifier[]): {
    totalIdentifiers: number;
    anchorCount: number;
    anchorPercentage: number;
    avgImportance: number;
    minImportance: number;
    maxImportance: number;
  } {
    const anchors = this.detectAnchors(identifiers);
    const importances = anchors.map((a) => this.computeImportance(a));

    return {
      totalIdentifiers: identifiers.length,
      anchorCount: anchors.length,
      anchorPercentage: identifiers.length > 0 ? (anchors.length / identifiers.length) * 100 : 0,
      avgImportance: importances.length > 0 ? importances.reduce((a, b) => a + b, 0) / importances.length : 0,
      minImportance: importances.length > 0 ? Math.min(...importances) : 0,
      maxImportance: importances.length > 0 ? Math.max(...importances) : 0,
    };
  }
}

/**
 * Factory function for creating an AnchorDetector
 */
export function createAnchorDetector(config?: AnchorDetectorConfig): AnchorDetector {
  return new AnchorDetectorImpl(config);
}
