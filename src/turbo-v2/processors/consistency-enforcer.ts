/**
 * CONSISTENCY ENFORCER
 *
 * Applies naming convention rules to ensure consistent code style.
 * Used in the "quality" preset (Pass 5) as final cleanup.
 *
 * Features:
 * 1. Enforces naming conventions (camelCase, PascalCase, etc.)
 * 2. Applies prefix/suffix patterns (is*, has*, get*, set*, etc.)
 * 3. Fixes common naming mistakes
 *
 * No LLM calls - pure rule-based transformations.
 */

export interface Identifier {
  id: string;
  name: string;
  bindingType: 'var' | 'function' | 'class' | 'parameter' | 'import';
  scopeId: string;
  references: number;
  context: string;
}

export interface ConsistencyRule {
  name: string;
  description: string;
  apply: (name: string, identifier: Identifier) => string | null;
}

export interface ConsistencyEnforcerConfig {
  /** Target naming convention for variables/functions (default: 'camelCase') */
  variableConvention?: 'camelCase' | 'snake_case' | 'PascalCase';
  /** Target naming convention for classes (default: 'PascalCase') */
  classConvention?: 'PascalCase' | 'camelCase';
  /** Target naming convention for constants (default: 'UPPER_CASE') */
  constantConvention?: 'UPPER_CASE' | 'camelCase';
  /** Apply boolean prefixes (is*, has*, can*, should*) */
  applyBooleanPrefixes?: boolean;
  /** Apply getter/setter prefixes (get*, set*) */
  applyAccessorPrefixes?: boolean;
  /** Fix common mistakes (e.g., double prefixes) */
  fixCommonMistakes?: boolean;
  /** Custom rules to apply */
  customRules?: ConsistencyRule[];
}

export interface EnforcementResult {
  id: string;
  originalName: string;
  newName: string;
  rulesApplied: string[];
  changed: boolean;
}

export interface ConsistencyEnforcer {
  enforce(identifiers: Identifier[]): EnforcementResult[];
  getSummary(results: EnforcementResult[]): {
    total: number;
    changed: number;
    unchanged: number;
    byRule: Record<string, number>;
  };
}

const DEFAULT_CONFIG: Required<ConsistencyEnforcerConfig> = {
  variableConvention: 'camelCase',
  classConvention: 'PascalCase',
  constantConvention: 'UPPER_CASE',
  applyBooleanPrefixes: true,
  applyAccessorPrefixes: true,
  fixCommonMistakes: true,
  customRules: [],
};

export class ConsistencyEnforcerImpl implements ConsistencyEnforcer {
  private config: Required<ConsistencyEnforcerConfig>;
  private rules: ConsistencyRule[];

  constructor(config?: ConsistencyEnforcerConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rules = this.buildRules();
  }

  /**
   * Build rule set based on configuration
   */
  private buildRules(): ConsistencyRule[] {
    const rules: ConsistencyRule[] = [];

    // Rule 1: Fix common mistakes
    if (this.config.fixCommonMistakes) {
      rules.push({
        name: 'fix-double-prefixes',
        description: 'Remove duplicate prefixes (e.g., isIsValid → isValid)',
        apply: (name: string) => {
          // Detect double prefixes
          const prefixes = ['is', 'has', 'can', 'should', 'get', 'set'];
          for (const prefix of prefixes) {
            const pattern = new RegExp(`^${prefix}${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}`, 'i');
            if (pattern.test(name)) {
              return name.replace(pattern, prefix);
            }
          }
          return null;
        },
      });

      rules.push({
        name: 'fix-redundant-suffixes',
        description: 'Remove redundant suffixes (e.g., dataData → data)',
        apply: (name: string) => {
          // Detect word repeated at end
          const match = name.match(/^(.+?)([A-Z][a-z]+)\2$/);
          if (match) {
            return match[1] + match[2];
          }
          return null;
        },
      });
    }

    // Rule 2: Apply naming conventions
    rules.push({
      name: 'enforce-variable-convention',
      description: `Enforce ${this.config.variableConvention} for variables`,
      apply: (name: string, identifier: Identifier) => {
        if (identifier.bindingType === 'var' || identifier.bindingType === 'parameter') {
          return this.convertToConvention(name, this.config.variableConvention);
        }
        return null;
      },
    });

    rules.push({
      name: 'enforce-function-convention',
      description: `Enforce ${this.config.variableConvention} for functions`,
      apply: (name: string, identifier: Identifier) => {
        if (identifier.bindingType === 'function') {
          return this.convertToConvention(name, this.config.variableConvention);
        }
        return null;
      },
    });

    rules.push({
      name: 'enforce-class-convention',
      description: `Enforce ${this.config.classConvention} for classes`,
      apply: (name: string, identifier: Identifier) => {
        if (identifier.bindingType === 'class') {
          return this.convertToConvention(name, this.config.classConvention);
        }
        return null;
      },
    });

    // Rule 3: Apply boolean prefixes
    if (this.config.applyBooleanPrefixes) {
      rules.push({
        name: 'apply-boolean-prefixes',
        description: 'Add boolean prefixes for likely boolean variables',
        apply: (name: string, identifier: Identifier) => {
          // Skip if already has boolean prefix
          if (/^(is|has|can|should|will|did)[A-Z]/.test(name)) {
            return null;
          }

          // Check context for boolean indicators
          const context = identifier.context.toLowerCase();
          const booleanIndicators = [
            'true',
            'false',
            'boolean',
            'bool',
            '?',
            '&&',
            '||',
            '!',
            'if (',
            'while (',
          ];

          const hasBoolean = booleanIndicators.some((indicator) => context.includes(indicator));
          if (hasBoolean && identifier.bindingType === 'var') {
            // Try to infer appropriate prefix
            if (context.includes('enabled') || context.includes('disabled')) {
              return `is${this.capitalize(name)}`;
            }
            if (context.includes('check') || context.includes('validate')) {
              return `is${this.capitalize(name)}`;
            }
            if (context.includes('permission') || context.includes('access')) {
              return `can${this.capitalize(name)}`;
            }
            // Default to 'is' prefix
            return `is${this.capitalize(name)}`;
          }

          return null;
        },
      });
    }

    // Rule 4: Apply accessor prefixes
    if (this.config.applyAccessorPrefixes) {
      rules.push({
        name: 'apply-accessor-prefixes',
        description: 'Add get/set prefixes for accessor functions',
        apply: (name: string, identifier: Identifier) => {
          if (identifier.bindingType !== 'function') {
            return null;
          }

          // Skip if already has accessor prefix
          if (/^(get|set)[A-Z]/.test(name)) {
            return null;
          }

          const context = identifier.context.toLowerCase();

          // Detect getters (return statements without side effects)
          if (context.includes('return ') && !context.includes('=')) {
            return `get${this.capitalize(name)}`;
          }

          // Detect setters (assignment without return)
          if (context.includes('=') && !context.includes('return ')) {
            return `set${this.capitalize(name)}`;
          }

          return null;
        },
      });
    }

    // Add custom rules
    rules.push(...this.config.customRules);

    return rules;
  }

  /**
   * Enforce consistency rules on all identifiers
   */
  enforce(identifiers: Identifier[]): EnforcementResult[] {
    const results: EnforcementResult[] = [];

    for (const identifier of identifiers) {
      let currentName = identifier.name;
      const rulesApplied: string[] = [];

      // Apply each rule in sequence
      for (const rule of this.rules) {
        const newName = rule.apply(currentName, identifier);
        if (newName && newName !== currentName) {
          currentName = newName;
          rulesApplied.push(rule.name);
        }
      }

      results.push({
        id: identifier.id,
        originalName: identifier.name,
        newName: currentName,
        rulesApplied,
        changed: currentName !== identifier.name,
      });
    }

    return results;
  }

  /**
   * Convert name to specified convention
   */
  private convertToConvention(
    name: string,
    convention: 'camelCase' | 'snake_case' | 'PascalCase' | 'UPPER_CASE'
  ): string | null {
    // Parse name into words
    const words = this.parseWords(name);
    if (words.length === 0) return null;

    switch (convention) {
      case 'camelCase':
        return this.toCamelCase(words);
      case 'snake_case':
        return this.toSnakeCase(words);
      case 'PascalCase':
        return this.toPascalCase(words);
      case 'UPPER_CASE':
        return this.toUpperCase(words);
      default:
        return null;
    }
  }

  /**
   * Parse identifier name into words
   */
  private parseWords(name: string): string[] {
    // Handle different naming conventions
    let words: string[] = [];

    if (name.includes('_')) {
      // snake_case or UPPER_CASE
      words = name.split('_').filter((w) => w.length > 0);
    } else if (/[a-z][A-Z]/.test(name)) {
      // camelCase or PascalCase
      words = name.split(/(?=[A-Z])/).filter((w) => w.length > 0);
    } else {
      // Single word or already lowercase
      words = [name];
    }

    return words.map((w) => w.toLowerCase());
  }

  /**
   * Convert words to camelCase
   */
  private toCamelCase(words: string[]): string {
    if (words.length === 0) return '';
    return words[0] + words.slice(1).map(this.capitalize).join('');
  }

  /**
   * Convert words to snake_case
   */
  private toSnakeCase(words: string[]): string {
    return words.join('_');
  }

  /**
   * Convert words to PascalCase
   */
  private toPascalCase(words: string[]): string {
    return words.map(this.capitalize).join('');
  }

  /**
   * Convert words to UPPER_CASE
   */
  private toUpperCase(words: string[]): string {
    return words.map((w) => w.toUpperCase()).join('_');
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get summary statistics about enforcement results
   */
  getSummary(results: EnforcementResult[]): {
    total: number;
    changed: number;
    unchanged: number;
    byRule: Record<string, number>;
  } {
    const byRule: Record<string, number> = {};
    let changed = 0;
    let unchanged = 0;

    for (const result of results) {
      if (result.changed) {
        changed++;
        for (const rule of result.rulesApplied) {
          byRule[rule] = (byRule[rule] || 0) + 1;
        }
      } else {
        unchanged++;
      }
    }

    return {
      total: results.length,
      changed,
      unchanged,
      byRule,
    };
  }
}

/**
 * Factory function for creating a ConsistencyEnforcer
 */
export function createConsistencyEnforcer(config?: ConsistencyEnforcerConfig): ConsistencyEnforcer {
  return new ConsistencyEnforcerImpl(config);
}
