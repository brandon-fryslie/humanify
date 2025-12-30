#!/usr/bin/env tsx

/**
 * Minifies canonical test samples using terser.
 *
 * This script minifies the original.js files in test-samples/canonical/
 * using consistent settings for reproducibility.
 *
 * Minification settings:
 * - mangle: all variable and function names
 * - compress: standard optimizations
 * - No source maps (for cleaner testing)
 */

import { minify } from 'terser';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CANONICAL_DIR = join(__dirname, '../test-samples/canonical');

const MINIFY_OPTIONS = {
  mangle: {
    toplevel: true, // Mangle top-level names
  },
  compress: {
    dead_code: true,
    drop_console: false, // Keep console for potential debugging
    drop_debugger: true,
    keep_classnames: false,
    keep_fnames: false,
  },
  format: {
    comments: false, // Remove all comments
  },
};

const SAMPLES = [
  'tiny-qs',
  'small-axios',
  'medium-chart',
];

async function minifySample(sampleName: string) {
  const originalPath = join(CANONICAL_DIR, sampleName, 'original.js');
  const minifiedPath = join(CANONICAL_DIR, sampleName, 'minified.js');

  console.log(`Minifying ${sampleName}...`);

  const originalCode = readFileSync(originalPath, 'utf-8');
  const originalLines = originalCode.split('\n').length;
  const originalSize = originalCode.length;

  const result = await minify(originalCode, MINIFY_OPTIONS);

  if (!result.code) {
    throw new Error(`Failed to minify ${sampleName}`);
  }

  writeFileSync(minifiedPath, result.code, 'utf-8');

  const minifiedSize = result.code.length;
  const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

  console.log(`  Original: ${originalLines} lines, ${originalSize} bytes`);
  console.log(`  Minified: ${minifiedSize} bytes (${reduction}% reduction)`);
  console.log(`  Saved to: ${minifiedPath}\n`);
}

async function main() {
  console.log('Minifying canonical samples with terser\n');
  console.log('Settings:');
  console.log('  - Mangle all names (toplevel: true)');
  console.log('  - Standard compression');
  console.log('  - Remove all comments\n');

  for (const sample of SAMPLES) {
    try {
      await minifySample(sample);
    } catch (error) {
      console.error(`Error minifying ${sample}:`, error);
      process.exit(1);
    }
  }

  console.log('All samples minified successfully!');
}

main();
