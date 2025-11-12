import { parse } from "@babel/parser";
import generate from "@babel/generator";
const gen = generate.default || generate;
import * as babelTypes from "@babel/types";

/**
 * Phase 1: File Splitting
 *
 * Splits large JavaScript files into smaller chunks at top-level statement boundaries.
 * This enables processing large files without OOM errors.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SplitOptions {
  maxChunkSize: number;
  minChunkSize: number;
  splitStrategy: 'statements' | 'functions' | 'modules';
}

export interface FileChunk {
  index: number;
  code: string;
  startLine: number;
  endLine: number;
  symbols: string[];          // Symbols defined in this chunk
  externalRefs: string[];     // Symbols referenced but not defined
}

export interface SplitResult {
  chunks: FileChunk[];
  globalSymbols: Map<string, number>;  // symbol -> chunk index
  metadata: {
    originalSize: number;
    chunkCount: number;
    avgChunkSize: number;
  };
}

// ============================================================================
// IMPLEMENTATION
// ============================================================================

/**
 * Split a JavaScript file into processable chunks.
 */
export async function splitFile(
  code: string,
  options: SplitOptions
): Promise<SplitResult> {
  // Parse AST
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["typescript"]
  });

  // Extract top-level statements
  const statements = ast.program.body;

  if (statements.length === 0) {
    return {
      chunks: [],
      globalSymbols: new Map(),
      metadata: {
        originalSize: code.length,
        chunkCount: 0,
        avgChunkSize: 0
      }
    };
  }

  // Group statements into chunks
  const chunks: FileChunk[] = [];
  let currentChunk: babelTypes.Statement[] = [];
  let currentSize = 0;
  let chunkIndex = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const stmtCode = gen(stmt).code;
    const stmtSize = stmtCode.length;

    // Check if adding this statement would exceed maxChunkSize
    if (currentSize + stmtSize > options.maxChunkSize && currentChunk.length > 0) {
      // Finalize current chunk
      const chunkAst = babelTypes.program(currentChunk);
      const chunkCode = gen(chunkAst).code;

      chunks.push({
        index: chunkIndex,
        code: chunkCode,
        startLine: currentChunk[0].loc?.start.line || 0,
        endLine: currentChunk[currentChunk.length - 1].loc?.end.line || 0,
        symbols: extractSymbols(currentChunk),
        externalRefs: extractReferences(currentChunk)
      });

      // Start new chunk
      currentChunk = [stmt];
      currentSize = stmtSize;
      chunkIndex++;
    } else {
      // Add to current chunk
      currentChunk.push(stmt);
      currentSize += stmtSize;
    }
  }

  // Finalize last chunk
  if (currentChunk.length > 0) {
    const chunkAst = babelTypes.program(currentChunk);
    const chunkCode = gen(chunkAst).code;

    chunks.push({
      index: chunkIndex,
      code: chunkCode,
      startLine: currentChunk[0].loc?.start.line || 0,
      endLine: currentChunk[currentChunk.length - 1].loc?.end.line || 0,
      symbols: extractSymbols(currentChunk),
      externalRefs: extractReferences(currentChunk)
    });
  }

  // Build global symbol table
  const globalSymbols = new Map<string, number>();
  for (const chunk of chunks) {
    for (const symbol of chunk.symbols) {
      if (!globalSymbols.has(symbol)) {
        globalSymbols.set(symbol, chunk.index);
      }
    }
  }

  return {
    chunks,
    globalSymbols,
    metadata: {
      originalSize: code.length,
      chunkCount: chunks.length,
      avgChunkSize: Math.floor(code.length / chunks.length)
    }
  };
}

/**
 * Extract symbols defined in a set of statements.
 * Uses simple AST walking without Babel traverse to avoid context issues.
 */
function extractSymbols(statements: babelTypes.Statement[]): string[] {
  const symbols: string[] = [];

  for (const stmt of statements) {
    extractSymbolsFromNode(stmt, symbols, true);
  }

  return symbols;
}

/**
 * Recursively extract symbols from a node.
 * Only collects top-level declarations when topLevel is true.
 */
function extractSymbolsFromNode(node: any, symbols: string[], topLevel: boolean = false): void {
  if (!node) return;

  // Variable declarations
  if (babelTypes.isVariableDeclaration(node) && topLevel) {
    for (const decl of node.declarations) {
      extractSymbolsFromPattern(decl.id, symbols);
    }
  }

  // Function declarations
  if (babelTypes.isFunctionDeclaration(node) && topLevel && node.id) {
    symbols.push(node.id.name);
  }

  // Class declarations
  if (babelTypes.isClassDeclaration(node) && topLevel && node.id) {
    symbols.push(node.id.name);
  }

  // Export declarations
  if (babelTypes.isExportNamedDeclaration(node)) {
    if (node.declaration) {
      extractSymbolsFromNode(node.declaration, symbols, true);
    }
  }

  if (babelTypes.isExportDefaultDeclaration(node)) {
    if (node.declaration && babelTypes.isFunctionDeclaration(node.declaration) && node.declaration.id) {
      symbols.push(node.declaration.id.name);
    }
    if (node.declaration && babelTypes.isClassDeclaration(node.declaration) && node.declaration.id) {
      symbols.push(node.declaration.id.name);
    }
  }
}

/**
 * Extract symbols from a binding pattern (handles destructuring).
 */
function extractSymbolsFromPattern(pattern: any, symbols: string[]): void {
  if (babelTypes.isIdentifier(pattern)) {
    symbols.push(pattern.name);
  } else if (babelTypes.isObjectPattern(pattern)) {
    for (const prop of pattern.properties) {
      if (babelTypes.isObjectProperty(prop)) {
        extractSymbolsFromPattern(prop.value, symbols);
      } else if (babelTypes.isRestElement(prop)) {
        extractSymbolsFromPattern(prop.argument, symbols);
      }
    }
  } else if (babelTypes.isArrayPattern(pattern)) {
    for (const elem of pattern.elements) {
      if (elem) {
        extractSymbolsFromPattern(elem, symbols);
      }
    }
  }
}

/**
 * Extract external references in a set of statements.
 * Uses simple regex-based extraction for now.
 */
function extractReferences(statements: babelTypes.Statement[]): string[] {
  const refs = new Set<string>();
  const defined = new Set(extractSymbols(statements));

  // Generate code and extract identifiers
  const code = gen(babelTypes.program(statements)).code;
  const identifierRegex = /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g;
  let match;

  while ((match = identifierRegex.exec(code)) !== null) {
    const name = match[0];
    // Skip keywords and already defined symbols
    if (!defined.has(name) && !isKeyword(name)) {
      refs.add(name);
    }
  }

  return Array.from(refs);
}

function isKeyword(name: string): boolean {
  const keywords = new Set([
    'const', 'let', 'var', 'function', 'class', 'return', 'if', 'else',
    'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'throw',
    'try', 'catch', 'finally', 'typeof', 'instanceof', 'new', 'this',
    'super', 'import', 'export', 'default', 'from', 'as', 'await', 'async',
    'undefined', 'null', 'true', 'false', 'NaN', 'Infinity',
    'eval', 'arguments'
  ]);
  return keywords.has(name);
}
