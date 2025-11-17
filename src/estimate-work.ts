import fs from "fs/promises";
import { parseAsync } from "@babel/core";
import * as babelTraverse from "@babel/traverse";
import { Identifier, Node } from "@babel/types";
import { webcrack } from "./plugins/webcrack.js";
import { splitFile } from "./file-splitter.js";
import { buildDependencyGraph, topologicalSort, mergeBatches, splitLargeBatches, DependencyMode } from "./plugins/local-llm-rename/dependency-graph.js";
import { NodePath } from "@babel/core";

// Handle Babel traverse import quirks (same as visit-all-identifiers.ts)
const traverse: typeof babelTraverse.default.default = (
  typeof babelTraverse.default === "function"
    ? babelTraverse.default
    : babelTraverse.default.default
) as any;

/**
 * Estimation options (subset of processing options)
 */
export interface EstimateOptions {
  turbo?: boolean;
  maxConcurrent?: number;
  dependencyMode?: DependencyMode;
  minBatchSize?: number;
  maxBatchSize?: number;
  chunkSize?: number;
  enableChunking?: boolean;
}

/**
 * Per-file work estimate
 */
export interface FileEstimate {
  path: string;
  identifiers: number;
  batches: number;
  chunks: number;
}

/**
 * Overall work estimate
 */
export interface WorkEstimate {
  totalFiles: number;
  totalIdentifiers: number;
  totalBatches: number;
  estimatedAPICalls: number;
  files: FileEstimate[];
}

/**
 * Estimate the total work for processing a file through HumanifyJS.
 * This function runs all the preparatory steps (webcrack, AST parsing, dependency graph)
 * WITHOUT making any API calls or actual transformations.
 *
 * @param inputPath - Path to input file
 * @param outputDir - Output directory (for webcrack)
 * @param options - Processing options (turbo, chunking, etc.)
 * @returns WorkEstimate with totals and per-file breakdowns
 */
export async function estimateWork(
  inputPath: string,
  outputDir: string,
  options: EstimateOptions = {}
): Promise<WorkEstimate> {
  const startTime = performance.now();

  console.log(`\n=== Estimating Work ===`);
  console.log(`Input file: ${inputPath}`);
  console.log(`Mode: ${options.turbo ? 'TURBO' : 'SEQUENTIAL'}\n`);

  // Read input file
  const bundledCode = await fs.readFile(inputPath, "utf-8");

  // Run webcrack to discover files
  console.log(`[1/3] Running webcrack to discover files...`);
  const extractedFiles = await webcrack(bundledCode, outputDir);
  console.log(`  → Found ${extractedFiles.length} file(s)\n`);

  const fileEstimates: FileEstimate[] = [];
  let totalIdentifiers = 0;
  let totalBatches = 0;
  let totalAPICalls = 0;

  // Estimate work for each file
  for (let i = 0; i < extractedFiles.length; i++) {
    const file = extractedFiles[i];
    console.log(`[2/3] Analyzing file ${i + 1}/${extractedFiles.length}: ${file.path}`);

    const code = await fs.readFile(file.path, "utf-8");

    if (code.trim().length === 0) {
      console.log(`  → Skipping empty file`);
      fileEstimates.push({
        path: file.path,
        identifiers: 0,
        batches: 0,
        chunks: 0
      });
      continue;
    }

    // Check if file needs chunking
    const chunkThreshold = options.chunkSize || 100000;
    const shouldChunk = options.enableChunking !== false && code.length > chunkThreshold;

    if (shouldChunk) {
      // Estimate for chunked file
      const estimate = await estimateChunkedFile(code, chunkThreshold, options);
      fileEstimates.push({
        path: file.path,
        identifiers: estimate.identifiers,
        batches: estimate.batches,
        chunks: estimate.chunks
      });

      totalIdentifiers += estimate.identifiers;
      totalBatches += estimate.batches;
      totalAPICalls += estimate.apiCalls;

      console.log(`  → File size: ${code.length} chars (${estimate.chunks} chunks)`);
      console.log(`  → Identifiers: ${estimate.identifiers}`);
      console.log(`  → Batches: ${estimate.batches}`);
      console.log(`  → Estimated API calls: ${estimate.apiCalls}`);
    } else {
      // Estimate for single file (no chunking)
      const estimate = await estimateSingleFile(code, options);
      fileEstimates.push({
        path: file.path,
        identifiers: estimate.identifiers,
        batches: estimate.batches,
        chunks: 1
      });

      totalIdentifiers += estimate.identifiers;
      totalBatches += estimate.batches;
      totalAPICalls += estimate.apiCalls;

      console.log(`  → File size: ${code.length} chars`);
      console.log(`  → Identifiers: ${estimate.identifiers}`);
      console.log(`  → Batches: ${estimate.batches}`);
      console.log(`  → Estimated API calls: ${estimate.apiCalls}`);
    }

    console.log();
  }

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
  console.log(`[3/3] Estimation complete [${elapsed}s]\n`);
  console.log(`=== Work Summary ===`);
  console.log(`Total files: ${extractedFiles.length}`);
  console.log(`Total identifiers: ${totalIdentifiers}`);
  console.log(`Total batches: ${totalBatches}`);
  console.log(`Estimated API calls: ${totalAPICalls}`);
  console.log();

  return {
    totalFiles: extractedFiles.length,
    totalIdentifiers,
    totalBatches,
    estimatedAPICalls: totalAPICalls,
    files: fileEstimates
  };
}

/**
 * Estimate work for a single file (no chunking)
 */
async function estimateSingleFile(
  code: string,
  options: EstimateOptions
): Promise<{ identifiers: number; batches: number; apiCalls: number }> {
  // Parse to AST
  const ast = await parseAsync(code, { sourceType: "unambiguous" });

  if (!ast) {
    throw new Error("Failed to parse code");
  }

  // Count identifiers (same logic as visit-all-identifiers.ts)
  const identifiers = findScopes(ast);
  const identifierCount = identifiers.length;

  if (identifierCount === 0) {
    return { identifiers: 0, batches: 0, apiCalls: 0 };
  }

  // Calculate batches based on mode
  let batchCount: number;
  let apiCalls: number;

  if (options.turbo) {
    // Turbo mode: use dependency graph to estimate batches
    const dependencies = await buildDependencyGraph(
      code,
      identifiers,
      { mode: options.dependencyMode || "balanced" }
    );

    let batches = topologicalSort(identifiers, dependencies);

    // Apply batch merging/splitting (same as actual processing)
    const minBatchSize = options.minBatchSize ?? 1;
    if (minBatchSize > 1) {
      batches = mergeBatches(batches, minBatchSize, dependencies);
    }

    const maxBatchSize = options.maxBatchSize ?? 100;
    if (maxBatchSize > 0) {
      batches = splitLargeBatches(batches, maxBatchSize);
    }

    batchCount = batches.length;

    // API calls = total identifiers (one per identifier in turbo mode)
    apiCalls = identifierCount;
  } else {
    // Sequential mode: 1 batch with all identifiers processed sequentially
    batchCount = 1;

    // API calls = total identifiers (one per identifier)
    apiCalls = identifierCount;
  }

  return {
    identifiers: identifierCount,
    batches: batchCount,
    apiCalls
  };
}

/**
 * Estimate work for a chunked file
 */
async function estimateChunkedFile(
  code: string,
  chunkThreshold: number,
  options: EstimateOptions
): Promise<{ identifiers: number; batches: number; chunks: number; apiCalls: number }> {
  // Split file into chunks
  const splitResult = await splitFile(code, {
    maxChunkSize: chunkThreshold,
    minChunkSize: 10000,
    splitStrategy: 'statements'
  });

  let totalIdentifiers = 0;
  let totalBatches = 0;
  let totalAPICalls = 0;

  // Estimate work for each chunk
  for (const chunk of splitResult.chunks) {
    const estimate = await estimateSingleFile(chunk.code, options);
    totalIdentifiers += estimate.identifiers;
    totalBatches += estimate.batches;
    totalAPICalls += estimate.apiCalls;
  }

  return {
    identifiers: totalIdentifiers,
    batches: totalBatches,
    chunks: splitResult.chunks.length,
    apiCalls: totalAPICalls
  };
}

/**
 * Find all binding identifiers (same logic as visit-all-identifiers.ts)
 */
function findScopes(ast: Node): NodePath<Identifier>[] {
  const scopes: [nodePath: NodePath<Identifier>, scopeSize: number][] = [];

  traverse(ast, {
    BindingIdentifier(path) {
      // Skip binding identifiers in assignment expressions
      if (path.parent?.type === "AssignmentExpression") {
        return;
      }

      const bindingBlock = closestSurroundingContextPath(path).scope.block;
      const pathSize = bindingBlock.end! - bindingBlock.start!;

      scopes.push([path, pathSize]);
    }
  });

  scopes.sort((a, b) => b[1] - a[1]);

  return scopes.map(([nodePath]) => nodePath);
}

/**
 * Helper to get the closest surrounding context path
 */
function closestSurroundingContextPath(path: NodePath<Identifier>): NodePath<Node> {
  const programOrBindingNode = path.findParent(
    (p) => p.isProgram() || path.node.name in p.getOuterBindingIdentifiers()
  )?.scope.path;
  return programOrBindingNode ?? path.scope.path;
}
