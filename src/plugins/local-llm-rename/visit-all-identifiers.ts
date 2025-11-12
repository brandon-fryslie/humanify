import { parseAsync, transformFromAstAsync, NodePath } from "@babel/core";
import * as babelTraverse from "@babel/traverse";
import { Identifier, toIdentifier, Node } from "@babel/types";
import { buildDependencyGraph, topologicalSort, mergeBatches, splitLargeBatches } from "./dependency-graph.js";
import { parallelLimit } from "../../parallel-utils.js";
import { instrumentation } from "../../instrumentation.js";

const traverse: typeof babelTraverse.default.default = (
  typeof babelTraverse.default === "function"
    ? babelTraverse.default
    : babelTraverse.default.default
) as any; // eslint-disable-line @typescript-eslint/no-explicit-any -- This hack is because pkgroll fucks up the import somehow

type Visitor = (name: string, scope: string) => Promise<string>;

export interface VisitOptions {
  turbo?: boolean; // Enable information-flow graph optimization + parallelization
  maxConcurrent?: number; // Maximum concurrent API requests (default: 10)
  dependencyMode?: "strict" | "balanced" | "relaxed"; // Dependency graph strictness (default: balanced)
  minBatchSize?: number; // Minimum batch size for parallelization (default: 1)
  maxBatchSize?: number; // Maximum batch size to prevent memory spikes (default: 100)
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
    const parseStart = performance.now();
    const ast = await instrumentation.measure(
      "parse-ast",
      () => parseAsync(code, { sourceType: "unambiguous" }),
      { codeSize: code.length }
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
        scopes,
        visitor,
        contextWindowSize,
        renames,
        visited,
        onProgress,
        options.maxConcurrent ?? 10,
        options
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
    const stringified = await instrumentation.measure("transform-ast", () =>
      transformFromAstAsync(ast)
    );

    if (stringified?.code == null) {
      throw new Error("Failed to stringify code");
    }

    rootSpan.setAttribute("outputSize", stringified.code.length);
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

  for (const smallestScope of scopes) {
    if (hasVisited(smallestScope, visited)) continue;

    const smallestScopeNode = smallestScope.node;
    if (smallestScopeNode.type !== "Identifier") {
      throw new Error("No identifiers found");
    }

    const surroundingCode = await scopeToString(
      smallestScope,
      contextWindowSize
    );
    const renamed = await visitor(smallestScopeNode.name, surroundingCode);
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
  code: string,
  scopes: NodePath<Identifier>[],
  visitor: Visitor,
  contextWindowSize: number,
  renames: Set<string>,
  visited: Set<string>,
  onProgress?: (percentageDone: number) => void,
  maxConcurrent: number = 10,
  options?: VisitOptions
) {
  const turboSpan = instrumentation.startSpan("turbo-mode", {
    identifierCount: scopes.length,
    maxConcurrent
  });

  try {
    const numRenamesExpected = scopes.length;
    let processedCount = 0;

    // Build dependency graph and get optimal batches
    console.log(`    → Building dependency graph...`);
    const dependencies = await buildDependencyGraph(code, scopes, {
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

    // Process each batch
    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
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
              }

              markVisited(job.scope, newName, visited);
              processedCount++;
            }
          },
          { mutations: jobs.length }
        );
      } finally {
        batchSpan.end();
      }
    }
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

function hasVisited(path: NodePath<Identifier>, visited: Set<string>) {
  return visited.has(path.node.name);
}

function markVisited(
  path: NodePath<Identifier>,
  newName: string,
  visited: Set<string>
) {
  visited.add(newName);
}

async function scopeToString(
  path: NodePath<Identifier>,
  contextWindowSize: number
) {
  const surroundingPath = closestSurroundingContextPath(path);
  const code = `${surroundingPath}`; // Implements a hidden `.toString()`
  if (code.length < contextWindowSize) {
    return code;
  }
  if (surroundingPath.isProgram()) {
    const start = path.node.start ?? 0;
    const end = path.node.end ?? code.length;
    if (end < contextWindowSize / 2) {
      return code.slice(0, contextWindowSize);
    }
    if (start > code.length - contextWindowSize / 2) {
      return code.slice(-contextWindowSize);
    }

    return code.slice(
      start - contextWindowSize / 2,
      end + contextWindowSize / 2
    );
  } else {
    return code.slice(0, contextWindowSize);
  }
}

function closestSurroundingContextPath(
  path: NodePath<Identifier>
): NodePath<Node> {
  const programOrBindingNode = path.findParent(
    (p) => p.isProgram() || path.node.name in p.getOuterBindingIdentifiers()
  )?.scope.path;
  return programOrBindingNode ?? path.scope.path;
}
