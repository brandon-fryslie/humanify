import type { FileChunk } from "./file-splitter.js";

/**
 * Phase 1: Chunk Processor
 *
 * Processes individual chunks with awareness of symbols from other chunks.
 * Maintains consistent naming across chunk boundaries.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ProcessOptions {
  sharedSymbols: Map<string, string>;  // Original -> renamed mapping
  visitor: (name: string, context: string) => Promise<string>;
  contextWindowSize: number;
}

export interface ProcessResult {
  renamedCode: string;
  newSymbols: Map<string, string>;  // New renames from this chunk
}

// ============================================================================
// IMPLEMENTATION
// ============================================================================

/**
 * Process a chunk with shared symbol context from previous chunks.
 */
export async function processChunk(
  chunk: FileChunk,
  options: ProcessOptions
): Promise<ProcessResult> {
  const { sharedSymbols, visitor, contextWindowSize } = options;

  // Build context with shared symbols
  const contextLines: string[] = [];

  // Add shared symbols as context
  if (sharedSymbols.size > 0) {
    contextLines.push('// Previously renamed symbols:');
    for (const [original, renamed] of sharedSymbols) {
      contextLines.push(`// ${original} → ${renamed}`);
    }
    contextLines.push('');
  }

  contextLines.push('// Current chunk:');
  const truncatedCode = chunk.code.substring(0, contextWindowSize);
  contextLines.push(truncatedCode);

  const context = contextLines.join('\n');

  // Collect all identifiers to rename (includes both this chunk's symbols and shared symbols)
  const allRenames = new Map<string, string>(); // original -> renamed
  const newSymbols = new Map<string, string>();

  // First, add all shared symbol renames (for references to symbols from previous chunks)
  for (const [original, renamed] of sharedSymbols) {
    allRenames.set(original, renamed);
  }

  // Second, process this chunk's own symbols
  for (const symbol of chunk.symbols) {
    // Check if already renamed in previous chunk (shouldn't happen, but handle it)
    if (sharedSymbols.has(symbol)) {
      // Use existing rename
      const renamed = sharedSymbols.get(symbol)!;
      allRenames.set(symbol, renamed);
    } else {
      // Need to get new name from visitor
      const newName = await visitor(symbol, context);
      allRenames.set(symbol, newName);
      newSymbols.set(symbol, newName);
    }
  }

  // Apply all renames to the code
  let renamedCode = chunk.code;

  // Use simple regex replacement
  // Sort by length (longest first) to avoid partial replacements
  const sortedRenames = Array.from(allRenames.entries()).sort((a, b) => b[0].length - a[0].length);

  for (const [original, renamed] of sortedRenames) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${escapeRegex(original)}\\b`, 'g');
    renamedCode = renamedCode.replace(regex, renamed);
  }

  return {
    renamedCode,
    newSymbols
  };
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
