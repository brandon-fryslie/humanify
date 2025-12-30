#!/usr/bin/env tsx

/**
 * Compares unminified output against original source code.
 *
 * Extracts all identifier names from both files and calculates:
 * - Total identifier count
 * - Exact name matches
 * - Match percentage
 * - Structural validity
 *
 * Usage:
 *   npm run compare <original-file> <unminified-file>
 *   tsx scripts/compare-unminified.ts original.js unminified.js
 */

import * as babel from '@babel/core';
import * as t from '@babel/types';
import { readFileSync } from 'fs';
import { resolve } from 'path';

interface ComparisonMetrics {
  originalIdentifierCount: number;
  unminifiedIdentifierCount: number;
  exactMatches: number;
  matchPercentage: number;
  structurallyValid: boolean;
  originalIdentifiers: Set<string>;
  unminifiedIdentifiers: Set<string>;
  matchedIdentifiers: Set<string>;
}

/**
 * Extract all binding identifier names from a JavaScript file
 */
function extractIdentifiers(code: string, filepath: string): Set<string> {
  const identifiers = new Set<string>();

  try {
    const ast = babel.parseSync(code, {
      filename: filepath,
      sourceType: 'unambiguous',
      parserOpts: {
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
      },
    });

    if (!ast) {
      throw new Error('Failed to parse code');
    }

    babel.traverse(ast, {
      // Binding identifiers (variable declarations, function names, params, etc.)
      BindingIdentifier(path) {
        identifiers.add(path.node.name);
      },
      // Also capture function names from declarations/expressions
      FunctionDeclaration(path) {
        if (path.node.id) {
          identifiers.add(path.node.id.name);
        }
      },
      FunctionExpression(path) {
        if (path.node.id) {
          identifiers.add(path.node.id.name);
        }
      },
      // Class names
      ClassDeclaration(path) {
        if (path.node.id) {
          identifiers.add(path.node.id.name);
        }
      },
      ClassExpression(path) {
        if (path.node.id) {
          identifiers.add(path.node.id.name);
        }
      },
      // Property names in object patterns (destructuring)
      ObjectProperty(path) {
        if (
          t.isIdentifier(path.node.key) &&
          !path.node.computed &&
          t.isPattern(path.node.value)
        ) {
          identifiers.add(path.node.key.name);
        }
      },
    });

    return identifiers;
  } catch (error) {
    throw new Error(`Failed to extract identifiers from ${filepath}: ${error}`);
  }
}

/**
 * Check if code is structurally valid (parses correctly)
 */
function isStructurallyValid(code: string, filepath: string): boolean {
  try {
    babel.parseSync(code, {
      filename: filepath,
      sourceType: 'unambiguous',
      parserOpts: {
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Compare original and unminified files
 */
export function compareFiles(
  originalPath: string,
  unminifiedPath: string
): ComparisonMetrics {
  const originalCode = readFileSync(originalPath, 'utf-8');
  const unminifiedCode = readFileSync(unminifiedPath, 'utf-8');

  // Check structural validity
  const structurallyValid =
    isStructurallyValid(originalCode, originalPath) &&
    isStructurallyValid(unminifiedCode, unminifiedPath);

  if (!structurallyValid) {
    console.error('Error: One or both files are not structurally valid');
    return {
      originalIdentifierCount: 0,
      unminifiedIdentifierCount: 0,
      exactMatches: 0,
      matchPercentage: 0,
      structurallyValid: false,
      originalIdentifiers: new Set(),
      unminifiedIdentifiers: new Set(),
      matchedIdentifiers: new Set(),
    };
  }

  // Extract identifiers
  const originalIdentifiers = extractIdentifiers(originalCode, originalPath);
  const unminifiedIdentifiers = extractIdentifiers(
    unminifiedCode,
    unminifiedPath
  );

  // Calculate matches
  const matchedIdentifiers = new Set<string>();
  for (const id of originalIdentifiers) {
    if (unminifiedIdentifiers.has(id)) {
      matchedIdentifiers.add(id);
    }
  }

  const exactMatches = matchedIdentifiers.size;
  const matchPercentage =
    originalIdentifiers.size > 0
      ? (exactMatches / originalIdentifiers.size) * 100
      : 0;

  return {
    originalIdentifierCount: originalIdentifiers.size,
    unminifiedIdentifierCount: unminifiedIdentifiers.size,
    exactMatches,
    matchPercentage,
    structurallyValid,
    originalIdentifiers,
    unminifiedIdentifiers,
    matchedIdentifiers,
  };
}

/**
 * Format metrics for display
 */
function formatMetrics(metrics: ComparisonMetrics): string {
  const lines: string[] = [];

  lines.push('Comparison Results');
  lines.push('==================\n');

  lines.push('Structural Validity');
  lines.push('-------------------');
  lines.push(
    `Both files parse correctly: ${metrics.structurallyValid ? 'YES' : 'NO'}\n`
  );

  if (!metrics.structurallyValid) {
    return lines.join('\n');
  }

  lines.push('Identifier Counts');
  lines.push('-----------------');
  lines.push(`Original file: ${metrics.originalIdentifierCount} identifiers`);
  lines.push(
    `Unminified file: ${metrics.unminifiedIdentifierCount} identifiers\n`
  );

  lines.push('Name Matching');
  lines.push('-------------');
  lines.push(`Exact matches: ${metrics.exactMatches}`);
  lines.push(`Match rate: ${metrics.matchPercentage.toFixed(2)}%\n`);

  // Show sample of matched identifiers
  const matchedSample = Array.from(metrics.matchedIdentifiers)
    .sort()
    .slice(0, 10);
  if (matchedSample.length > 0) {
    lines.push('Sample matched identifiers:');
    matchedSample.forEach((id) => lines.push(`  - ${id}`));
    if (metrics.matchedIdentifiers.size > 10) {
      lines.push(`  ... and ${metrics.matchedIdentifiers.size - 10} more`);
    }
  }

  return lines.join('\n');
}

/**
 * Main CLI entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error('Usage: npm run compare <original-file> <unminified-file>');
    console.error(
      '   or: tsx scripts/compare-unminified.ts original.js unminified.js'
    );
    process.exit(1);
  }

  const [originalPath, unminifiedPath] = args.map((p) => resolve(p));

  console.log('Comparing files:');
  console.log(`  Original:   ${originalPath}`);
  console.log(`  Unminified: ${unminifiedPath}\n`);

  try {
    const metrics = compareFiles(originalPath, unminifiedPath);
    console.log(formatMetrics(metrics));

    // Also output JSON for programmatic use
    const jsonOutput = {
      originalIdentifierCount: metrics.originalIdentifierCount,
      unminifiedIdentifierCount: metrics.unminifiedIdentifierCount,
      exactMatches: metrics.exactMatches,
      matchPercentage: Number(metrics.matchPercentage.toFixed(2)),
      structurallyValid: metrics.structurallyValid,
    };

    console.log('\nJSON Output:');
    console.log(JSON.stringify(jsonOutput, null, 2));
  } catch (error) {
    console.error('Error comparing files:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
