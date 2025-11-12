import type { FileChunk } from "./file-splitter.js";

/**
 * Phase 1: Chunk Reassembler
 *
 * Reassembles processed chunks into final output.
 * Validates symbol consistency across chunks.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ReassembleOptions {
  preserveComments: boolean;
  addChunkMarkers: boolean;  // For debugging
}

export interface ProcessedChunk {
  code: string;
  metadata: FileChunk;
}

// ============================================================================
// IMPLEMENTATION
// ============================================================================

/**
 * Reassemble processed chunks into final output.
 */
export function reassembleChunks(
  chunks: ProcessedChunk[],
  options: ReassembleOptions
): string {
  if (chunks.length === 0) {
    return '';
  }

  const lines: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Add chunk marker for debugging
    if (options.addChunkMarkers) {
      lines.push(`\n// ============================================================`);
      lines.push(`// CHUNK ${i + 1}/${chunks.length}`);
      lines.push(`// Lines: ${chunk.metadata.startLine}-${chunk.metadata.endLine}`);
      lines.push(`// Symbols: ${chunk.metadata.symbols.join(', ')}`);
      lines.push(`// ============================================================\n`);
    }

    // Add chunk code
    lines.push(chunk.code);

    // Add separator between chunks (unless it's the last one)
    if (i < chunks.length - 1 && !options.addChunkMarkers) {
      lines.push(''); // Empty line separator
    }
  }

  return lines.join('\n');
}

/**
 * Validate that all chunks have consistent symbol usage
 */
export function validateSymbolConsistency(chunks: ProcessedChunk[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const globalSymbols = new Map<string, number>(); // symbol -> first definition chunk

  // First pass: collect all symbol definitions
  for (const chunk of chunks) {
    for (const symbol of chunk.metadata.symbols) {
      if (!globalSymbols.has(symbol)) {
        globalSymbols.set(symbol, chunk.metadata.index);
      } else {
        // Symbol redefinition (potential error)
        const firstChunk = globalSymbols.get(symbol)!;
        errors.push(
          `Symbol '${symbol}' defined in both chunk ${firstChunk} and chunk ${chunk.metadata.index}`
        );
      }
    }
  }

  // Second pass: verify references
  for (const chunk of chunks) {
    for (const ref of chunk.metadata.externalRefs) {
      // Check if referenced symbol is defined in any chunk
      if (!globalSymbols.has(ref)) {
        // It's okay if it's a built-in or imported
        continue;
      }

      const definedInChunk = globalSymbols.get(ref)!;

      // Ideally, dependencies should be defined before usage
      // (Though JavaScript hoisting makes this complex)
      if (definedInChunk > chunk.metadata.index) {
        // Forward reference - might be okay for function declarations
        // This is a warning, not an error
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
