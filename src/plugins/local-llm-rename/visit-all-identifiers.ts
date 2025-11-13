import { parseAsync, transformFromAstAsync, NodePath, ParseResult } from "@babel/core";
import * as babelTraverse from "@babel/traverse";
import * as babelGenerator from "@babel/generator";
import { Identifier, toIdentifier, Node } from "@babel/types";
import { buildDependencyGraph, topologicalSort, mergeBatches, splitLargeBatches } from "./dependency-graph.js";
import { parallelLimit } from "../../parallel-utils.js";
import { instrumentation } from "../../instrumentation.js";
import { getCheckpointId, loadCheckpoint, saveCheckpoint, deleteCheckpoint, Checkpoint, CHECKPOINT_VERSION } from "../../checkpoint.js";

const traverse: typeof babelTraverse.default.default = (
  typeof babelTraverse.default === "function"
    ? babelTraverse.default
    : babelTraverse.default.default
) as any; // eslint-disable-line @typescript-eslint/no-explicit-any -- This hack is because pkgroll fucks up the import somehow

const generate: typeof babelGenerator.default = (
  typeof babelGenerator.default === "function"
    ? babelGenerator.default
    : (babelGenerator as any).default?.default || babelGenerator
) as any; // eslint-disable-line @typescript-eslint/no-explicit-any -- Same issue as traverse

type Visitor = (name: string, scope: string) => Promise<string>;

export interface VisitOptions {
  turbo?: boolean; // Enable information-flow graph optimization + parallelization
  maxConcurrent?: number; // Maximum concurrent API requests (default: 10)
  dependencyMode?: "strict" | "balanced" | "relaxed"; // Dependency graph strictness (default: balanced)
  minBatchSize?: number; // Minimum batch size for parallelization (default: 1)
  maxBatchSize?: number; // Maximum batch size to prevent memory spikes (default: 100)
  enableCheckpoints?: boolean; // Save progress checkpoints (default: true for turbo mode)
}

export async function visitAllIdentifiers(
  code: string,
  visitor: Visitor,
  contextWindowSize: number,
  onProgress?: (percentageDone: number) => void,
  options?: VisitOptions
) {
  const rootSpan = instrumentation.startSpan("visit-all-identifiers", {
    codeSize: code.length,
    contextWindowSize,
    turbo: options?.turbo ?? false
  });

  try {
    // Check for existing checkpoint BEFORE parsing
    // If checkpoint exists with transformed code, use that instead of original
    const enableCheckpoints = options?.turbo ? (options?.enableCheckpoints ?? true) : false;
    const originalCheckpointId = enableCheckpoints ? getCheckpointId(code) : null;
    let checkpoint: Checkpoint | null = null;
    let codeToProcess = code;

    if (originalCheckpointId) {
      checkpoint = loadCheckpoint(originalCheckpointId);
      if (checkpoint && checkpoint.partialCode) {
        console.log(`📂 Resuming from transformed code (${checkpoint.completedBatches}/${checkpoint.totalBatches} batches completed)`);
        codeToProcess = checkpoint.partialCode;
      }
    }

    const parseStart = performance.now();
    const ast = await instrumentation.measure(
      "parse-ast",
      () => parseAsync(codeToProcess, { sourceType: "unambiguous" }),
      { codeSize: codeToProcess.length }
    );
    const parseTime = Math.round(performance.now() - parseStart);
    console.log(`    → Parsing AST... [${parseTime}ms]`);

    const renames = new Set<string>();
    const visited = new Set<string>();

    if (!ast) {
      throw new Error("Failed to parse code");
    }

    const scopes = instrumentation.measureSync("find-scopes", () =>
      findScopes(ast)
    );
    const numRenamesExpected = scopes.length;

    rootSpan.setAttribute("identifierCount", numRenamesExpected);

    console.log(`    → Found ${numRenamesExpected} identifier(s) to rename`);
    console.log(`    → Context window size: ${contextWindowSize} chars`);

    // Choose processing path based on options
    if (options?.turbo) {
      console.log(`    → Mode: TURBO (dependency graph + parallel batches)`);
      console.log(
        `    → Max concurrent requests: ${options.maxConcurrent ?? 10}`
      );
      await visitAllIdentifiersTurbo(
        code,
        ast,
        scopes,
        visitor,
        contextWindowSize,
        renames,
        visited,
        onProgress,
        options.maxConcurrent ?? 10,
        options,
        checkpoint
      );
    } else {
      console.log(`    → Mode: SEQUENTIAL (one identifier at a time)`);
      await visitAllIdentifiersSequential(
        scopes,
        visitor,
        contextWindowSize,
        renames,
        visited,
        onProgress
      );
    }

    onProgress?.(1);

    console.log(`    → Transforming AST back to code...`);
    // Use @babel/generator directly instead of transformFromAstAsync
    // This is more reliable and works with any AST node type
    const stringified = instrumentation.measureSync("transform-ast", () => ({
      code: generate(ast as any).code
    }));

    if (stringified?.code == null) {
      throw new Error("Failed to stringify code");
    }

    rootSpan.setAttribute("outputSize", stringified.code.length);

    // Delete checkpoint on successful completion
    if (originalCheckpointId) {
      deleteCheckpoint(originalCheckpointId);
    }

    return stringified.code;
  } finally {
    rootSpan.end();
  }
}

/**
 * Original sequential processing (preserves existing behavior)
 */
async function visitAllIdentifiersSequential(
  scopes: NodePath<Identifier>[],
  visitor: Visitor,
  contextWindowSize: number,
  renames: Set<string>,
  visited: Set<string>,
  onProgress?: (percentageDone: number) => void
) {
  const numRenamesExpected = scopes.length;

  for (const [i, smallestScope] of scopes.entries()) {
    const smallestScopeNode = smallestScope.node;
    if (hasVisited(smallestScope, visited)) continue;

    const scopeString = await scopeToString(smallestScope, contextWindowSize);
    const renamed = await visitor(smallestScopeNode.name, scopeString);

    if (renamed !== smallestScopeNode.name) {
      let safeRenamed = toIdentifier(renamed);
      while (
        renames.has(safeRenamed) ||
        smallestScope.scope.hasBinding(safeRenamed)
      ) {
        safeRenamed = `_${safeRenamed}`;
      }
      renames.add(safeRenamed);

      smallestScope.scope.rename(smallestScopeNode.name, safeRenamed);
    }
    markVisited(smallestScope, smallestScopeNode.name, visited);

    onProgress?.(visited.size / numRenamesExpected);
  }
}

/**
 * Turbo mode: Use information-flow graph for optimal ordering + parallel batch execution
 */
async function visitAllIdentifiersTurbo(
  originalCode: string,
  ast: ParseResult,
  scopes: NodePath<Identifier>[],
  visitor: Visitor,
  contextWindowSize: number,
  renames: Set<string>,
  visited: Set<string>,
  onProgress?: (percentageDone: number) => void,
  maxConcurrent: number = 10,
  options?: VisitOptions,
  existingCheckpoint?: Checkpoint | null
) {
  const turboSpan = instrumentation.startSpan("turbo-mode", {
    identifierCount: scopes.length,
    maxConcurrent
  });

  // Checkpoint support (enabled by default in turbo mode)
  const enableCheckpoints = options?.enableCheckpoints ?? true;
  const checkpointId = enableCheckpoints ? getCheckpointId(originalCode) : null;
  let checkpoint = existingCheckpoint;
  let startBatch = 0;

  // Track all renames for checkpoint persistence
  const renamesHistory: Array<{ oldName: string; newName: string; scopePath: string }> = [];

  // Restore renames history from checkpoint if resuming
  if (checkpoint && checkpoint.renames) {
    for (const [oldName, newName] of Object.entries(checkpoint.renames)) {
      renamesHistory.push({
        oldName,
        newName,
        scopePath: '' // Not needed for resume
      });
      renames.add(newName);
    }
  }

  try {
    const numRenamesExpected = scopes.length;
    let processedCount = checkpoint ? Object.keys(checkpoint.renames).length : 0;

    // Build dependency graph and get optimal batches
    console.log(`    → Building dependency graph...`);
    const dependencies = await buildDependencyGraph(originalCode, scopes, {
      mode: options?.dependencyMode || "balanced"
    });
    let batches = instrumentation.measureSync("topological-sort", () =>
      topologicalSort(scopes, dependencies)
    );

    // Merge small batches for better parallelization
    const minBatchSize = options?.minBatchSize ?? 1;
    if (minBatchSize > 1) {
      const originalBatchCount = batches.length;
      batches = instrumentation.measureSync("merge-batches", () =>
        mergeBatches(batches, minBatchSize, dependencies)
      );
      console.log(
        `    → Merged ${originalBatchCount} batches into ${batches.length} (min size: ${minBatchSize})`
      );
    }

    // Split large batches to prevent memory spikes
    const maxBatchSize = options?.maxBatchSize ?? 100;
    if (maxBatchSize > 0) {
      const beforeSplit = batches.length;
      batches = instrumentation.measureSync("split-batches", () =>
        splitLargeBatches(batches, maxBatchSize)
      );
      if (batches.length > beforeSplit) {
        console.log(
          `    → Split large batches: ${beforeSplit} → ${batches.length} (max size: ${maxBatchSize})`
        );
      }
    }

    console.log(`    → Dependency analysis complete:`);
    console.log(`      • Total batches: ${batches.length}`);
    console.log(`      • Dependencies found: ${dependencies.length}`);

    const batchSizes = batches.map((b) => b.length);
    const avgBatchSize =
      batchSizes.reduce((a, b) => a + b, 0) / batches.length;
    console.log(
      `      • Batch sizes: min=${Math.min(...batchSizes)}, max=${Math.max(...batchSizes)}, avg=${avgBatchSize.toFixed(1)}`
    );

    turboSpan.setAttribute("batchCount", batches.length);
    turboSpan.setAttribute("dependencyCount", dependencies.length);

    // Check for batch count mismatch (indicates code changed or dependency mode changed)
    if (checkpoint && checkpoint.totalBatches !== batches.length) {
      console.log(`    ⚠️  Checkpoint found but batch count mismatch (${checkpoint.totalBatches} vs ${batches.length}), starting fresh`);
      checkpoint = null;
      startBatch = 0;
      processedCount = 0;
      renamesHistory.length = 0; // Clear history
      renames.clear();
    } else if (checkpoint) {
      startBatch = checkpoint.completedBatches;
      console.log(`    ✓ Checkpoint valid, resuming from batch ${startBatch + 1}/${batches.length}`);

      // Mark already-processed identifiers as visited
      for (const [oldName, newName] of Object.entries(checkpoint.renames)) {
        const scope = scopes.find(s => s.node.name === oldName);
        if (scope) {
          markVisited(scope, newName, visited);
        }
      }
    }

    // Process each batch
    for (let batchIdx = startBatch; batchIdx < batches.length; batchIdx++) {
      const batchSpan = instrumentation.startSpan("process-batch", {
        batchIndex: batchIdx + 1,
        totalBatches: batches.length
      });

      try {
        const batch = batches[batchIdx];

        // Filter out already visited identifiers
        const toProcess = batch.filter((scope) => !hasVisited(scope, visited));

        if (toProcess.length === 0) continue;

        batchSpan.setAttribute("identifiersInBatch", toProcess.length);

        // Extract contexts at current AST state (before parallel API calls)
        const jobs = await Promise.all(
          toProcess.map(async (scope) => ({
            scope,
            name: scope.node.name,
            context: await scopeToString(scope, contextWindowSize)
          }))
        );

        // Parallel API calls with concurrency limit
        const newNames = await instrumentation.measure(
          "parallel-api-calls",
          () =>
            parallelLimit(
              jobs.map((job) => () => visitor(job.name, job.context)),
              maxConcurrent,
              (completed) => {
                onProgress?.((processedCount + completed) / numRenamesExpected);
              },
              {
                batchIndex: batchIdx + 1,
                totalBatches: batches.length
              }
            ),
          { batchSize: toProcess.length, maxConcurrent }
        );

        // Sequential AST mutations (ensures consistency)
        instrumentation.measureSync(
          "ast-mutations",
          () => {
            for (let i = 0; i < jobs.length; i++) {
              const job = jobs[i];
              const newName = newNames[i];

              if (newName !== job.name) {
                let safeRenamed = toIdentifier(newName);
                while (
                  renames.has(safeRenamed) ||
                  job.scope.scope.hasBinding(safeRenamed)
                ) {
                  safeRenamed = `_${safeRenamed}`;
                }
                renames.add(safeRenamed);

                job.scope.scope.rename(job.name, safeRenamed);

                // Track rename for checkpoint
                renamesHistory.push({
                  oldName: job.name,
                  newName: safeRenamed,
                  scopePath: job.scope.toString()
                });
              }

              markVisited(job.scope, newName, visited);
              processedCount++;
            }
          },
          { mutations: jobs.length }
        );

        // Save checkpoint after each batch completes
        if (checkpointId) {
          // Build renames map from history
          const renamesMap: Record<string, string> = {};
          for (const rename of renamesHistory) {
            renamesMap[rename.oldName] = rename.newName;
          }

          try {
            // Transform current AST state to code using @babel/generator
            // Use generate instead of transformFromAstAsync because Babel 7.27+ is strict about AST types
            const transformedCode = generate(ast as any).code;

            if (!transformedCode) {
              console.error(`    → ERROR: Checkpoint transform returned empty code! Falling back to original.`);
            }

            saveCheckpoint(checkpointId, {
              version: CHECKPOINT_VERSION,
              timestamp: Date.now(),
              inputHash: checkpointId,
              completedBatches: batchIdx + 1,
              totalBatches: batches.length,
              renames: renamesMap,
              partialCode: transformedCode || originalCode // Fallback to original if transform fails
            });
          } catch (checkpointError) {
            // Log error but don't fail the whole operation
            console.error(`    → ERROR saving checkpoint:`, checkpointError);
            // Save checkpoint with original code as fallback
            saveCheckpoint(checkpointId, {
              version: CHECKPOINT_VERSION,
              timestamp: Date.now(),
              inputHash: checkpointId,
              completedBatches: batchIdx + 1,
              totalBatches: batches.length,
              renames: renamesMap,
              partialCode: originalCode
            });
          }
        }
      } finally {
        batchSpan.end();
      }
    }

    // Checkpoint deletion moved to main function (after final transform)
  } finally {
    turboSpan.end();
  }
}

function findScopes(ast: Node): NodePath<Identifier>[] {
  const scopes: [nodePath: NodePath<Identifier>, scopeSize: number][] = [];
  traverse(ast, {
    BindingIdentifier(path) {
      const bindingBlock = closestSurroundingContextPath(path).scope.block;
      const pathSize = bindingBlock.end! - bindingBlock.start!;

      scopes.push([path, pathSize]);
    }
  });

  scopes.sort((a, b) => b[1] - a[1]);

  return scopes.map(([nodePath]) => nodePath);
}

function closestSurroundingContextPath(path: NodePath<Identifier>) {
  let cur = path;
  while (!isContextPath(cur)) {
    if (!cur.parentPath) break;
    cur = cur.parentPath;
  }
  return cur;
}

function isContextPath(path: NodePath<Node>) {
  return (
    path.isProgram() ||
    path.isFunction() ||
    path.isForStatement() ||
    path.isForInStatement() ||
    path.isForOfStatement() ||
    path.isBlockStatement() ||
    path.isCatchClause()
  );
}

async function scopeToString(
  path: NodePath<Identifier>,
  contextWindowSize: number
): Promise<string> {
  const surroundingContext = closestSurroundingContextPath(path);

  // Use @babel/generator directly for node-to-code conversion
  // This works for any AST node, not just File/Program (Babel 7.27+ is stricter)
  const contextCode = instrumentation.measureSync("generate-context", () =>
    generate(surroundingContext.node as any).code
  );

  if (!contextCode) {
    throw new Error("Failed to generate context code");
  }

  // Truncate if too large (simple truncation from center)
  if (contextCode.length > contextWindowSize) {
    const halfSize = Math.floor(contextWindowSize / 2);
    const start = contextCode.substring(0, halfSize);
    const end = contextCode.substring(
      contextCode.length - halfSize
    );
    return `${start}\n\n// ... (truncated ${contextCode.length - contextWindowSize} chars) ...\n\n${end}`;
  }

  return contextCode;
}

function hasVisited(scope: NodePath<Identifier>, visited: Set<string>): boolean {
  const key = getVisitKey(scope);
  return visited.has(key);
}

function markVisited(
  scope: NodePath<Identifier>,
  name: string,
  visited: Set<string>
): void {
  const key = getVisitKey(scope);
  visited.add(key);
}

function getVisitKey(scope: NodePath<Identifier>): string {
  // Use node location as unique key
  const node = scope.node;
  return `${node.start}-${node.end}-${node.name}`;
}
