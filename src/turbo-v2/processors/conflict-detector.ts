/**
 * CONFLICT DETECTOR
 *
 * Detects naming conflicts and inconsistencies in renamed code.
 * Used in the "quality" preset (Pass 3) to identify problematic renames.
 *
 * Detects:
 * 1. Same identifier renamed differently in different scopes
 * 2. Similar names for unrelated identifiers (potential confusion)
 * 3. Inconsistent naming patterns
 *
 * No LLM calls - pure analysis based on rename history.
 */

export interface Identifier {
  id: string;
  name: string;
  bindingType: 'var' | 'function' | 'class' | 'parameter' | 'import';
  scopeId: string;
  references: number;
  context: string;
}

export interface RenameHistory {
  id: string;
  originalName: string;
  currentName: string;
  scopeId: string;
  bindingType: string;
}

export interface Conflict {
  type: 'duplicate-name' | 'similar-names' | 'scope-inconsistency';
  severity: 'error' | 'warning';
  identifiers: RenameHistory[];
  message: string;
  suggestion?: string;
}

export interface ConflictDetectorConfig {
  /** Minimum string similarity to flag as similar (0-1, default: 0.8) */
  similarityThreshold?: number;
  /** Flag duplicate original names with different new names */
  checkDuplicateOriginals?: boolean;
  /** Flag similar new names for different identifiers */
  checkSimilarNames?: boolean;
  /** Flag inconsistent patterns (e.g., camelCase vs snake_case) */
  checkPatternConsistency?: boolean;
}

export interface ConflictDetector {
  detectConflicts(history: RenameHistory[]): Conflict[];
  getSummary(conflicts: Conflict[]): {
    total: number;
    errors: number;
    warnings: number;
    byType: Record<string, number>;
  };
}

const DEFAULT_CONFIG: Required<ConflictDetectorConfig> = {
  similarityThreshold: 0.8,
  checkDuplicateOriginals: true,
  checkSimilarNames: true,
  checkPatternConsistency: true,
};

export class ConflictDetectorImpl implements ConflictDetector {
  private config: Required<ConflictDetectorConfig>;

  constructor(config?: ConflictDetectorConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Detect all conflicts in rename history
   */
  detectConflicts(history: RenameHistory[]): Conflict[] {
    const conflicts: Conflict[] = [];

    if (this.config.checkDuplicateOriginals) {
      conflicts.push(...this.detectDuplicateOriginals(history));
    }

    if (this.config.checkSimilarNames) {
      conflicts.push(...this.detectSimilarNames(history));
    }

    if (this.config.checkPatternConsistency) {
      conflicts.push(...this.detectPatternInconsistencies(history));
    }

    return conflicts;
  }

  /**
   * Detect same original identifier renamed differently
   *
   * Example: Variable 'a' renamed to 'config' in one scope, 'options' in another
   * This indicates inconsistent understanding of what 'a' represents.
   */
  private detectDuplicateOriginals(history: RenameHistory[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const byOriginal = new Map<string, RenameHistory[]>();

    // Group by original name
    for (const entry of history) {
      if (!byOriginal.has(entry.originalName)) {
        byOriginal.set(entry.originalName, []);
      }
      byOriginal.get(entry.originalName)!.push(entry);
    }

    // Find duplicates with different new names
    for (const [originalName, entries] of byOriginal) {
      if (entries.length <= 1) continue;

      const uniqueNewNames = new Set(entries.map((e) => e.currentName));
      if (uniqueNewNames.size > 1) {
        conflicts.push({
          type: 'scope-inconsistency',
          severity: 'warning',
          identifiers: entries,
          message: `Original identifier '${originalName}' renamed to ${uniqueNewNames.size} different names: ${Array.from(uniqueNewNames).join(', ')}`,
          suggestion: `Consider using consistent name across all scopes, or verify they are truly different identifiers`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Detect similar names for unrelated identifiers
   *
   * Example: 'handleClick' and 'handleClickEvent' for different identifiers
   * This can cause confusion when reading the code.
   */
  private detectSimilarNames(history: RenameHistory[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const entries = history.filter((e) => e.originalName !== e.currentName); // Only renamed

    // Compare all pairs
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i];
        const b = entries[j];

        // Skip if same identifier
        if (a.id === b.id) continue;

        // Skip if same original name (already caught by duplicate detector)
        if (a.originalName === b.originalName) continue;

        // Check similarity
        const similarity = this.computeSimilarity(a.currentName, b.currentName);
        if (similarity >= this.config.similarityThreshold) {
          conflicts.push({
            type: 'similar-names',
            severity: 'warning',
            identifiers: [a, b],
            message: `Similar names detected (${Math.round(similarity * 100)}% similar): '${a.currentName}' and '${b.currentName}' for different identifiers`,
            suggestion: `Consider making names more distinct to avoid confusion`,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect inconsistent naming patterns
   *
   * Example: Mix of camelCase and snake_case, or inconsistent prefix usage
   */
  private detectPatternInconsistencies(history: RenameHistory[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const entries = history.filter((e) => e.originalName !== e.currentName);

    // Analyze naming patterns
    const patterns = {
      camelCase: entries.filter((e) => this.isCamelCase(e.currentName)),
      snake_case: entries.filter((e) => this.isSnakeCase(e.currentName)),
      PascalCase: entries.filter((e) => this.isPascalCase(e.currentName)),
      UPPER_CASE: entries.filter((e) => this.isUpperCase(e.currentName)),
    };

    // Find dominant pattern
    const total = entries.length;
    const counts = {
      camelCase: patterns.camelCase.length,
      snake_case: patterns.snake_case.length,
      PascalCase: patterns.PascalCase.length,
      UPPER_CASE: patterns.UPPER_CASE.length,
    };

    const dominant = Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a));
    const dominantCount = dominant[1];
    const dominantPattern = dominant[0];

    // If less than 80% follow dominant pattern, flag inconsistency
    if (total > 10 && dominantCount / total < 0.8) {
      const minorities = Object.entries(counts)
        .filter(([pattern, count]) => pattern !== dominantPattern && count > 0)
        .map(([pattern, count]) => `${pattern} (${count})`);

      if (minorities.length > 0) {
        conflicts.push({
          type: 'scope-inconsistency',
          severity: 'warning',
          identifiers: entries.slice(0, 5), // Sample of affected identifiers
          message: `Inconsistent naming conventions detected: ${dominantPattern} (${dominantCount}) vs ${minorities.join(', ')}`,
          suggestion: `Consider enforcing consistent naming convention (${dominantPattern} appears to be dominant)`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Compute string similarity using Levenshtein distance
   * Returns 0-1 (0 = completely different, 1 = identical)
   */
  private computeSimilarity(a: string, b: string): number {
    if (a === b) return 1.0;
    if (a.length === 0 || b.length === 0) return 0;

    // Levenshtein distance
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    const distance = matrix[b.length][a.length];
    const maxLen = Math.max(a.length, b.length);
    return 1 - distance / maxLen;
  }

  /**
   * Check if string is camelCase
   */
  private isCamelCase(str: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(str) && /[a-z]/.test(str) && /[A-Z]/.test(str);
  }

  /**
   * Check if string is snake_case
   */
  private isSnakeCase(str: string): boolean {
    return /^[a-z][a-z0-9_]*$/.test(str) && str.includes('_');
  }

  /**
   * Check if string is PascalCase
   */
  private isPascalCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }

  /**
   * Check if string is UPPER_CASE
   */
  private isUpperCase(str: string): boolean {
    return /^[A-Z][A-Z0-9_]*$/.test(str);
  }

  /**
   * Get summary statistics about conflicts
   */
  getSummary(conflicts: Conflict[]): {
    total: number;
    errors: number;
    warnings: number;
    byType: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    let errors = 0;
    let warnings = 0;

    for (const conflict of conflicts) {
      byType[conflict.type] = (byType[conflict.type] || 0) + 1;
      if (conflict.severity === 'error') {
        errors++;
      } else {
        warnings++;
      }
    }

    return {
      total: conflicts.length,
      errors,
      warnings,
      byType,
    };
  }
}

/**
 * Factory function for creating a ConflictDetector
 */
export function createConflictDetector(config?: ConflictDetectorConfig): ConflictDetector {
  return new ConflictDetectorImpl(config);
}
