/**
 * ANALYZER: Identifier Collection and Context Extraction
 *
 * Purpose: Parse JavaScript/TypeScript once to extract all identifiers with metadata
 *
 * Key Responsibilities:
 * - Parse code to AST via Babel
 * - Extract binding identifiers (variables, functions, classes, parameters, imports)
 * - Compute stable identifier IDs (binding + location)
 * - Extract surrounding context for each identifier
 * - Calculate importance scores (reference count, scope size, exports)
 * - Output analysis.json for consumption by PassEngine
 */

import { parseAsync } from "@babel/core";
import * as babelTraverse from "@babel/traverse";
import { Node, Identifier, Binding } from "@babel/types";
import { createHash } from "crypto";
// @ts-ignore - source-map-js is not fully typed
import sourceMapJs from "source-map-js";

// Handle Babel's CommonJS/ESM export quirks
const traverse: typeof babelTraverse.default.default = (
  typeof babelTraverse.default === "function"
    ? babelTraverse.default
    : babelTraverse.default.default
) as any;

/**
 * Binding type for an identifier
 */
export type BindingType = "var" | "function" | "class" | "parameter" | "import" | "other";

/**
 * An analyzed identifier with all metadata
 */
export interface AnalyzedIdentifier {
  id: string; // Stable ID = hash(binding + location)
  name: string; // Current identifier name
  bindingType: BindingType;
  scopeId: string; // Parent scope identifier
  references: number; // How many times this identifier is referenced
  context: string; // Surrounding code snippet
  importance: number; // Computed importance score (0-1)
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

/**
 * Complete analysis output
 */
export interface AnalysisResult {
  identifiers: AnalyzedIdentifier[];
  totalIdentifiers: number;
  codeHash: string; // Hash of input code for change detection
  timestamp: string;
}

/**
 * Analyzer configuration
 */
export interface AnalyzerConfig {
  contextWindowSize?: number; // Characters of context to extract (default: 500)
  minReferences?: number; // Minimum references to include identifier (default: 0)
}

/**
 * Analyzer: Parse code and extract identifier metadata
 */
export class Analyzer {
  private config: Required<AnalyzerConfig>;

  constructor(config: AnalyzerConfig = {}) {
    this.config = {
      contextWindowSize: config.contextWindowSize ?? 500,
      minReferences: config.minReferences ?? 0,
    };
  }

  /**
   * Analyze JavaScript/TypeScript code
   * Returns structured analysis with all identifiers
   * 
   * @param code The source code to analyze
   * @param sourceMap Optional source map to map locations back to original source (for stable IDs)
   */
  async analyze(code: string, sourceMap?: any): Promise<AnalysisResult> {
    // Parse code to AST
    const ast = await parseAsync(code, {
      sourceType: "unambiguous",
    });

    if (!ast) {
      throw new Error("Failed to parse code to AST");
    }

    // Initialize source map consumer if provided
    let consumer: any = null;
    if (sourceMap) {
      try {
        consumer = new sourceMapJs.SourceMapConsumer(sourceMap);
      } catch (e) {
        console.warn("[analyzer] Failed to parse source map, falling back to unstable IDs:", e);
      }
    }

    // Collect all binding identifiers
    const identifiers: AnalyzedIdentifier[] = [];
    const scopeIds = new Map<any, string>(); // Scope -> ID mapping

    // Capture `this` for use in callbacks
    const self = this;

    traverse(ast, {
      Scope(path) {
        // Generate unique scope ID
        const scopeId = self.generateScopeId(path.scope);
        scopeIds.set(path.scope, scopeId);
      },

      // Collect all binding identifiers
      Identifier(path) {
        const binding = path.scope.getBinding(path.node.name);

        // Only process binding identifiers (skip references)
        if (!binding || binding.identifier !== path.node) {
          return;
        }

        // Skip if below minimum reference threshold
        const referenceCount = binding.referencePaths.length;
        if (referenceCount < self.config.minReferences) {
          return;
        }

        // Determine binding type
        const bindingType = self.getBindingType(binding);

        // Get scope ID
        const scopeId = scopeIds.get(path.scope) ?? "unknown";

        // Generate stable identifier ID
        const identifierId = self.generateIdentifierId(path.node.name, binding, path, consumer);

        // Extract surrounding context
        const context = self.extractContext(code, path);

        // Calculate importance score
        const importance = self.calculateImportance(binding, bindingType);

        // Get location
        const loc = path.node.loc;
        if (!loc) {
          return; // Skip identifiers without location
        }

        identifiers.push({
          id: identifierId,
          name: path.node.name,
          bindingType,
          scopeId,
          references: referenceCount,
          context,
          importance,
          location: {
            start: { line: loc.start.line, column: loc.start.column },
            end: { line: loc.end.line, column: loc.end.column },
          },
        });
      },
    });

    // Sort identifiers by importance (highest first)
    identifiers.sort((a, b) => b.importance - a.importance);

    return {
      identifiers,
      totalIdentifiers: identifiers.length,
      codeHash: this.hashCode(code),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate stable scope ID
   */
  private generateScopeId(scope: any): string {
    // Use path to scope block as stable identifier
    const block = scope.block;
    if (block && block.loc) {
      return `scope:${block.loc.start.line}:${block.loc.start.column}`;
    }
    return `scope:${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate stable identifier ID
   * Format: hash(name + binding type + location)
   */
  private generateIdentifierId(
    name: string, 
    binding: Binding, 
    path: any,
    consumer?: any
  ): string {
    const loc = path.node.loc;
    if (!loc) {
      // Fallback for identifiers without location
      return `id:${name}:${Math.random().toString(36).substring(2, 9)}`;
    }

    let originalName = name;
    let originalLine = loc.start.line;
    let originalColumn = loc.start.column;

    // If source map consumer is available, map back to original location
    if (consumer) {
      const original = consumer.originalPositionFor({
        line: loc.start.line,
        column: loc.start.column
      });

      if (original.source && original.line !== null && original.column !== null) {
        originalLine = original.line;
        originalColumn = original.column;
        if (original.name) {
          originalName = original.name;
        }
      }
    }

    const payload = `${binding.kind}:${originalLine}:${originalColumn}`;
    const hash = createHash("sha256").update(payload).digest("hex").substring(0, 16);
    return `id:${hash}`;
  }

  /**
   * Determine binding type from Babel binding
   */
  private getBindingType(binding: Binding): BindingType {
    const kind = binding.kind;

    switch (kind) {
      case "var":
      case "let":
      case "const":
        return "var";
      case "hoisted":
        return "function";
      case "param":
        return "parameter";
      case "module":
        return "import";
      default:
        // Check if it's a class
        if (binding.path.isClassDeclaration()) {
          return "class";
        }
        return "other";
    }
  }

  /**
   * Extract surrounding context for an identifier
   * Returns a code snippet centered around the identifier
   */
  private extractContext(code: string, path: any): string {
    const loc = path.node.loc;
    if (!loc) {
      return "";
    }

    // Calculate byte offset for the identifier
    const lines = code.split("\n");
    let offset = 0;
    for (let i = 0; i < loc.start.line - 1; i++) {
      offset += lines[i].length + 1; // +1 for newline
    }
    offset += loc.start.column;

    // Extract context window
    const windowSize = this.config.contextWindowSize;
    const halfWindow = Math.floor(windowSize / 2);

    const start = Math.max(0, offset - halfWindow);
    const end = Math.min(code.length, offset + halfWindow);

    return code.substring(start, end);
  }

  /**
   * Calculate importance score for an identifier
   *
   * Importance formula:
   * - 50%: Reference count (normalized log scale)
   * - 30%: Binding type weight (exports, functions, classes higher)
   * - 20%: Scope size (larger scope = more important)
   *
   * Returns: 0-1 score
   */
  private calculateImportance(binding: Binding, bindingType: BindingType): number {
    const referenceCount = binding.referencePaths.length;

    // Reference score (log scale, normalized to 0-1)
    // log2(refs + 1) / 10 capped at 1
    const referenceScore = Math.min(1, Math.log2(referenceCount + 1) / 10);

    // Type weight
    const typeWeights: Record<BindingType, number> = {
      class: 1.0, // Classes are very important
      function: 0.9, // Functions are important
      import: 0.8, // Imports are important
      var: 0.5, // Variables are moderately important
      parameter: 0.3, // Parameters are less important
      other: 0.2, // Other bindings are least important
    };
    const typeScore = typeWeights[bindingType];

    // Scope size score
    // Count statements in scope (rough proxy for importance)
    const scopeSize = this.getScopeSize(binding.scope);
    const scopeScore = Math.min(1, scopeSize / 100);

    // Weighted combination
    const importance = referenceScore * 0.5 + typeScore * 0.3 + scopeScore * 0.2;

    return importance;
  }

  /**
   * Get scope size (number of statements)
   */
  private getScopeSize(scope: any): number {
    const block = scope.block;
    if (!block) return 0;

    // Count child statements
    if (block.body && Array.isArray(block.body)) {
      return block.body.length;
    }

    return 0;
  }

  /**
   * Hash code for change detection
   */
  private hashCode(code: string): string {
    return createHash("sha256").update(code).digest("hex");
  }

  /**
   * Extract context for a specific location with custom window size
   * Used for adaptive context sizing on low-confidence identifiers
   */
  static extractContextAtLocation(
    code: string,
    line: number,
    column: number,
    windowSize: number
  ): string {
    const lines = code.split("\n");
    let offset = 0;
    for (let i = 0; i < line - 1; i++) {
      offset += lines[i].length + 1; // +1 for newline
    }
    offset += column;

    const halfWindow = Math.floor(windowSize / 2);
    const start = Math.max(0, offset - halfWindow);
    const end = Math.min(code.length, offset + halfWindow);

    return code.substring(start, end);
  }
}