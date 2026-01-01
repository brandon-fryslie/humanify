/**
 * Identifier Analyzer
 *
 * Utility to categorize and analyze variable names, determining if they are:
 * - Single letter (a, b, x, etc.) - obfuscated/minified
 * - Mangled (a1, _x, $$, etc.) - partially obfuscated
 * - Semantic (addNumbers, userConfig, etc.) - meaningful names
 */

export interface IdentifierAnalysis {
  total: number;
  singleLetter: string[];
  mangled: string[];
  semantic: string[];
  singleLetterCount: number;
  mangledCount: number;
  semanticCount: number;
  singleLetterPercent: number;
  mangledPercent: number;
  semanticPercent: number;
}

/**
 * JavaScript reserved words and built-in identifiers that should be ignored
 */
const RESERVED_WORDS = new Set([
  // Keywords
  "break", "case", "catch", "continue", "debugger", "default", "delete",
  "do", "else", "finally", "for", "function", "if", "in", "instanceof",
  "new", "return", "switch", "this", "throw", "try", "typeof", "var",
  "void", "while", "with", "class", "const", "enum", "export", "extends",
  "import", "super", "implements", "interface", "let", "package", "private",
  "protected", "public", "static", "yield", "async", "await", "of",
  // Common built-ins
  "undefined", "null", "true", "false", "NaN", "Infinity",
  "Object", "Array", "String", "Number", "Boolean", "Function", "Symbol",
  "Error", "TypeError", "ReferenceError", "SyntaxError", "RangeError",
  "Map", "Set", "WeakMap", "WeakSet", "Promise", "Proxy", "Reflect",
  "JSON", "Math", "Date", "RegExp", "console", "document", "window",
  "module", "exports", "require", "process", "global", "__dirname", "__filename"
]);

/**
 * Common short semantic words that are acceptable (e.g., "id", "fn", "cb")
 */
const ACCEPTABLE_SHORT_WORDS = new Set([
  "id", "fn", "cb", "db", "io", "fs", "os", "ui", "vm", "gc",
  "ok", "no", "or", "on", "of", "if", "is", "in", "to", "at",
  "up", "do", "go", "by", "my", "it", "el", "em", "px", "pt",
  "ms", "ns", "rx", "tx", "ip", "ws", "fd"
]);

/**
 * Determine if a name is a single letter (obfuscated)
 */
export function isSingleLetter(name: string): boolean {
  return /^[a-zA-Z]$/.test(name);
}

/**
 * Determine if a name is mangled (partially obfuscated)
 * e.g., a1, _x, $$, t0, __proto__, etc.
 */
export function isMangled(name: string): boolean {
  // Already categorized as single letter
  if (isSingleLetter(name)) return false;

  // Skip reserved words
  if (RESERVED_WORDS.has(name)) return false;

  // Skip acceptable short words
  if (ACCEPTABLE_SHORT_WORDS.has(name.toLowerCase())) return false;

  // Pattern: single letter + single digit (e.g., a1, b2, t0)
  if (/^[a-zA-Z][0-9]$/.test(name)) return true;

  // Pattern: single letter + numbers (e.g., a123)
  if (/^[a-zA-Z]\d+$/.test(name)) return true;

  // Pattern: underscore + single letter (e.g., _a, _b)
  if (/^_[a-zA-Z]$/.test(name)) return true;

  // Pattern: double underscore prefix (webpack mangling)
  if (/^__[a-z][a-z0-9]*$/.test(name) && name.length < 8) return true;

  // Pattern: only underscores and short letters (e.g., _$, $$, _a_)
  if (/^[_$]+[a-z]?[_$]*$/i.test(name) && name.length <= 4) return true;

  // Pattern: letter followed by underscores/numbers only (e.g., e_, t_1)
  if (/^[a-z][_0-9]+$/i.test(name) && name.length <= 4) return true;

  return false;
}

/**
 * Determine if a name is semantic (meaningful)
 */
export function isSemantic(name: string): boolean {
  // Skip reserved words
  if (RESERVED_WORDS.has(name)) return false;

  // Not single letter or mangled → semantic
  return !isSingleLetter(name) && !isMangled(name);
}

/**
 * Analyze an array of identifiers
 */
export function analyzeIdentifiers(identifiers: string[]): IdentifierAnalysis {
  // Filter out reserved words first
  const filtered = identifiers.filter(id => !RESERVED_WORDS.has(id));

  const singleLetter: string[] = [];
  const mangled: string[] = [];
  const semantic: string[] = [];

  for (const name of filtered) {
    if (isSingleLetter(name)) {
      singleLetter.push(name);
    } else if (isMangled(name)) {
      mangled.push(name);
    } else {
      semantic.push(name);
    }
  }

  const total = filtered.length;

  return {
    total,
    singleLetter,
    mangled,
    semantic,
    singleLetterCount: singleLetter.length,
    mangledCount: mangled.length,
    semanticCount: semantic.length,
    singleLetterPercent: total > 0 ? (singleLetter.length / total) * 100 : 0,
    mangledPercent: total > 0 ? (mangled.length / total) * 100 : 0,
    semanticPercent: total > 0 ? (semantic.length / total) * 100 : 0
  };
}

/**
 * Calculate improvement score between before and after
 */
export function calculateImprovement(
  before: IdentifierAnalysis,
  after: IdentifierAnalysis
): {
  singleLetterReduction: number;
  mangledReduction: number;
  semanticIncrease: number;
  overallImprovement: number;
} {
  const singleLetterReduction = before.singleLetterPercent - after.singleLetterPercent;
  const mangledReduction = before.mangledPercent - after.mangledPercent;
  const semanticIncrease = after.semanticPercent - before.semanticPercent;

  // Overall improvement: weighted combination
  // High weight on semantic increase, medium on single-letter reduction
  const overallImprovement = (
    semanticIncrease * 0.5 +
    singleLetterReduction * 0.35 +
    mangledReduction * 0.15
  );

  return {
    singleLetterReduction,
    mangledReduction,
    semanticIncrease,
    overallImprovement
  };
}

/**
 * Generate a summary report
 */
export function generateReport(
  before: IdentifierAnalysis,
  after: IdentifierAnalysis,
  detailed: boolean = false
): string {
  const improvement = calculateImprovement(before, after);

  let report = `
=== Identifier Quality Analysis ===

BEFORE (Input):
  Total identifiers: ${before.total}
  Single-letter:     ${before.singleLetterCount} (${before.singleLetterPercent.toFixed(1)}%)
  Mangled:           ${before.mangledCount} (${before.mangledPercent.toFixed(1)}%)
  Semantic:          ${before.semanticCount} (${before.semanticPercent.toFixed(1)}%)

AFTER (Output):
  Total identifiers: ${after.total}
  Single-letter:     ${after.singleLetterCount} (${after.singleLetterPercent.toFixed(1)}%)
  Mangled:           ${after.mangledCount} (${after.mangledPercent.toFixed(1)}%)
  Semantic:          ${after.semanticCount} (${after.semanticPercent.toFixed(1)}%)

IMPROVEMENT:
  Single-letter reduction: ${improvement.singleLetterReduction.toFixed(1)}%
  Mangled reduction:       ${improvement.mangledReduction.toFixed(1)}%
  Semantic increase:       ${improvement.semanticIncrease.toFixed(1)}%
  Overall improvement:     ${improvement.overallImprovement.toFixed(1)}%
`;

  if (detailed) {
    report += `
REMAINING SINGLE-LETTER VARIABLES:
  ${after.singleLetter.slice(0, 20).join(", ")}${after.singleLetter.length > 20 ? "..." : ""}

REMAINING MANGLED VARIABLES:
  ${after.mangled.slice(0, 20).join(", ")}${after.mangled.length > 20 ? "..." : ""}

SAMPLE SEMANTIC NAMES:
  ${after.semantic.slice(0, 20).join(", ")}${after.semantic.length > 20 ? "..." : ""}
`;
  }

  return report;
}
