import { NodePath } from "@babel/core";
import { Identifier, Node } from "@babel/types";
import {
  getCachedDependencies,
  saveDependencyCache
} from "./dependency-cache.js";
import { instrumentation } from "../../instrumentation.js";

/**
 * Represents a dependency edge: 'from' must be renamed before 'to'
 */
export interface Dependency {
  from: NodePath<Identifier>;
  to: NodePath<Identifier>;
  reason: "scope-containment" | "reference";
}

export type DependencyMode = "strict" | "balanced" | "relaxed";

export interface DependencyOptions {
  mode?: DependencyMode;
}

/**
 * Reference index for O(1) reference lookups.
 * Built once by traversing each identifier's references.
 */
interface ReferenceIndex {
  // For each identifier, which other identifiers it references (by name)
  nameReferences: Map<string, Set<string>>;
  // For each identifier name, its binding (for verification)
  bindings: Map<string, any>;
}

/**
 * Build a dependency graph for identifiers based on scope containment and references.
 * Returns an array of dependencies where each dependency indicates that
 * 'from' must be renamed before 'to' for optimal context.
 */
export async function buildDependencyGraph(
  code: string,
  identifiers: NodePath<Identifier>[],
  options: DependencyOptions = {}
): Promise<Dependency[]> {
  const mode = options.mode || "balanced";

  const graphSpan = instrumentation.startSpan("build-dependency-graph", {
    identifierCount: identifiers.length,
    mode
  });

  try {
    // Try cache first (cache key includes mode)
    const cacheKey = `${code}-${mode}`;
    const cachedResult = await instrumentation.measure(
      "check-dependency-cache",
      () => getCachedDependencies(cacheKey, identifiers)
    );

    if (cachedResult) {
      graphSpan.setAttribute("cacheHit", true);
      graphSpan.setAttribute("dependencyCount", cachedResult.dependencies.length);
      return cachedResult.dependencies;
    }

    graphSpan.setAttribute("cacheHit", false);

    const graphStartTime = performance.now();
    console.log(
      `    → Cache MISS: building dependency graph (mode: ${mode})...`
    );

    const deps: Dependency[] = [];

    // Phase 1: Build scope hierarchy (precomputation)
    // Skip if relaxed mode (doesn't use scope containment)
    let scopeHierarchy: Map<NodePath<Identifier>, Set<NodePath<Identifier>>>;

    if (mode === "relaxed") {
      const phase1Start = performance.now();
      scopeHierarchy = new Map();
      const phase1Time = Math.round(performance.now() - phase1Start);
      console.log(`    → Phase 1: Skipping scope hierarchy (relaxed mode)... [${phase1Time}ms]`);
    } else {
      console.log(`    → Phase 1: Building scope hierarchy...`);
      const startTime = performance.now();
      scopeHierarchy = buildScopeHierarchy(identifiers, (progress) => {
        if (progress % 10000 === 0) {
          const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
          const pct = ((progress / identifiers.length) * 100).toFixed(1);
          console.log(`    →   Progress: ${progress}/${identifiers.length} (${pct}%) - ${elapsed}s elapsed`);
        }
      });
      const elapsed = Math.round(performance.now() - startTime);
      console.log(`    → Scope hierarchy built [${elapsed}ms]`);
    }

    // Phase 2: Add scope containment dependencies based on mode
    if (mode !== "relaxed") {
      const phase2Start = performance.now();
      console.log(
        `    → Phase 2: Adding scope containment dependencies (mode: ${mode})...`
      );
      const containmentSpan = instrumentation.startSpan(
        "add-scope-containment-deps"
      );
      let containmentCount = 0;

      for (const idA of identifiers) {
        const contained = scopeHierarchy.get(idA);
        if (contained) {
          for (const idB of contained) {
            // In balanced mode, only add DIRECT parent-child dependencies
            // Skip transitive dependencies (grandparent -> grandchild)
            if (mode === "balanced") {
              const idBScope = getScopeForContainment(idB);
              const idBParentScope = idBScope.parent;
              const idAScope = getScopeForContainment(idA);

              // Direct child if:
              // 1. idB's parent scope is idA's scope (idB is one level nested in idA)
              // 2. idB's scope IS idA's scope AND idA is a function/class (idB is declared directly in idA's body)
              const isDirectChild =
                idBParentScope === idAScope ||
                (idBScope === idAScope && isFunctionOrClass(idA));

              if (isDirectChild) {
                // idB is DIRECT child of idA
                deps.push({
                  from: idA,
                  to: idB,
                  reason: "scope-containment"
                });
                containmentCount++;
              }
            } else {
              // Strict mode: add all scope containment
              deps.push({
                from: idA,
                to: idB,
                reason: "scope-containment"
              });
              containmentCount++;
            }
          }
        }
      }

      containmentSpan.setAttribute("dependenciesAdded", containmentCount);
      containmentSpan.end();
      const phase2Time = Math.round(performance.now() - phase2Start);
      console.log(`    → Phase 2 complete [${phase2Time}ms]`);
    } else {
      const phase2Start = performance.now();
      const phase2Time = Math.round(performance.now() - phase2Start);
      console.log(
        `    → Phase 2: Skipping scope containment (relaxed mode)... [${phase2Time}ms]`
      );
    }

    // Phase 3: Check references using reference index (OPTIMIZED)
    const phase3Start = performance.now();
    console.log(`    → Phase 3: Building reference index...`);
    const refIndex = instrumentation.measureSync(
      "build-reference-index",
      () => buildReferenceIndex(identifiers),
      { identifierCount: identifiers.length }
    );
    const phase3aTime = Math.round(performance.now() - phase3Start);
    console.log(`    → Reference index built [${phase3aTime}ms]`);

    const phase3bStart = performance.now();
    console.log(`    → Phase 3b: Checking references via index...`);
    const refSpan = instrumentation.startSpan("check-references");
    let refChecks = 0;
    let refCount = 0;
    let processedCount = 0;
    const totalIdentifiers = identifiers.length;

    // Build reverse index: name → identifiers with that name
    // This allows us to avoid O(n²) by only checking relevant pairs
    const nameToIdentifiers = new Map<string, NodePath<Identifier>[]>();
    for (const id of identifiers) {
      const name = id.node.name;
      if (!nameToIdentifiers.has(name)) {
        nameToIdentifiers.set(name, []);
      }
      nameToIdentifiers.get(name)!.push(id);
    }

    // O(n × refs) instead of O(n²): only check pairs where a reference exists
    for (const idB of identifiers) {
      processedCount++;

      // Show progress every 1000 identifiers (or at key percentages)
      if (processedCount % 1000 === 0 || processedCount === totalIdentifiers) {
        const elapsed = (performance.now() - phase3bStart) / 1000; // seconds
        const pct = ((processedCount / totalIdentifiers) * 100).toFixed(1);
        const rate = processedCount / elapsed; // identifiers per second
        const remaining = (totalIdentifiers - processedCount) / rate; // seconds
        const etaMin = Math.floor(remaining / 60);
        const etaSec = Math.floor(remaining % 60);
        console.log(
          `    →   Progress: ${processedCount}/${totalIdentifiers} (${pct}%) - ${elapsed.toFixed(1)}s elapsed, ETA: ${etaMin}m ${etaSec}s`
        );
      }

      // Get all names that idB references
      const referencedNames = refIndex.nameReferences.get(idB.node.name);
      if (!referencedNames) continue;

      const idBBinding = idB.scope.getBinding(idB.node.name);
      if (!idBBinding) continue;

      // For each referenced name, check all identifiers with that name
      for (const refName of referencedNames) {
        const potentialTargets = nameToIdentifiers.get(refName);
        if (!potentialTargets) continue;

        for (const idA of potentialTargets) {
          refChecks++;

          const idABinding = idA.scope.getBinding(idA.node.name);
          if (!idABinding) continue;

          // Verify bindings match (handle shadowing)
          let foundReference = false;

          // Look through idB's binding path for references to idA
          const binding = idB.scope.getBinding(idB.node.name);
          if (binding) {
            // Check the binding path (declaration + init + references)
            binding.path.traverse({
              Identifier(path) {
                if (path.node.name === idA.node.name) {
                  const refBinding = path.scope.getBinding(path.node.name);
                  if (refBinding === idABinding) {
                    foundReference = true;
                    path.stop();
                  }
                }
              }
            });

            // Also check reference paths
            if (!foundReference) {
              for (const refPath of binding.referencePaths) {
                refPath.traverse({
                  Identifier(path) {
                    if (path.node.name === idA.node.name) {
                      const refBinding = path.scope.getBinding(path.node.name);
                      if (refBinding === idABinding) {
                        foundReference = true;
                        path.stop();
                      }
                    }
                  }
                });
                if (foundReference) break;
              }
            }
          }

          if (foundReference) {
            deps.push({
              from: idA,
              to: idB,
              reason: "reference"
            });
            refCount++;
          }
        }
      }
    }

    refSpan.setAttribute("checks", refChecks);
    refSpan.setAttribute("dependenciesAdded", refCount);
    refSpan.end();
    const phase3bTime = Math.round(performance.now() - phase3bStart);
    console.log(`    → Reference checking complete [${phase3bTime}ms]`);

    graphSpan.setAttribute("dependencyCount", deps.length);

    const graphTotalTime = Math.round(performance.now() - graphStartTime);
    console.log(
      `    → Total dependencies: ${deps.length} (scope: ${deps.filter((d) => d.reason === "scope-containment").length}, ref: ${deps.filter((d) => d.reason === "reference").length}) [total: ${graphTotalTime}ms]`
    );

    // Save to cache WITH precomputed indices
    await instrumentation.measure(
      "save-dependency-cache",
      () => saveDependencyCache(
        cacheKey,
        identifiers,
        deps,
        scopeHierarchy,
        refIndex.nameReferences
      ),
      { dependencyCount: deps.length }
    );

    return deps;
  } finally {
    graphSpan.end();
  }
}

/**
 * Get the scope for containment checking.
 * For function/class identifiers, returns the scope they CREATE (function body/class body).
 * For other identifiers, returns the scope where they're declared.
 */
function getScopeForContainment(id: NodePath<Identifier>): any {
  const binding = id.scope.getBinding(id.node.name);
  if (!binding) return id.scope;

  // Check if the binding.path itself is a function or class declaration
  const pathType = binding.path.type;

  if (pathType === "FunctionDeclaration" ||
      pathType === "FunctionExpression" ||
      pathType === "ArrowFunctionExpression" ||
      pathType === "ClassDeclaration" ||
      pathType === "ClassExpression") {
    // For functions and classes, return the inner scope they create
    return binding.path.scope;
  }

  // For variables, return the scope where they're declared
  return closestSurroundingContextPath(id).scope;
}

/**
 * Check if an identifier is a function or class (creates a scope).
 */
function isFunctionOrClass(id: NodePath<Identifier>): boolean {
  const binding = id.scope.getBinding(id.node.name);
  if (!binding) return false;

  const pathType = binding.path.type;
  return (
    pathType === "FunctionDeclaration" ||
    pathType === "FunctionExpression" ||
    pathType === "ArrowFunctionExpression" ||
    pathType === "ClassDeclaration" ||
    pathType === "ClassExpression"
  );
}

/**
 * Build reference index by traversing each identifier's binding path ONCE.
 * Returns a map of which identifiers each identifier references.
 *
 * This is the Phase 2 optimization that replaces O(n²) reference checking
 * with O(n) index building + O(1) lookups.
 *
 * IMPORTANT: Only includes references to identifiers in OUTER scopes.
 * References to identifiers in INNER scopes (declared inside functions/classes)
 * are excluded because they're handled by scope containment dependencies.
 */
function buildReferenceIndex(
  identifiers: NodePath<Identifier>[]
): ReferenceIndex {
  const startTime = performance.now();

  const nameReferences = new Map<string, Set<string>>();
  const bindings = new Map<string, any>();

  for (const id of identifiers) {
    const binding = id.scope.getBinding(id.node.name);
    if (!binding) continue;

    bindings.set(id.node.name, binding);
    const referenced = new Set<string>();

    // Get the scope of this identifier (the scope where it creates its context)
    const idScope = getScopeForContainment(id);
    const idIsFunction = isFunctionOrClass(id);

    // Traverse the binding's path (declaration + initialization)
    // This includes the identifier's declaration and any initialization code
    binding.path.traverse({
      Identifier(path) {
        // Skip the identifier itself
        if (path === id) return;

        // Skip binding identifiers (declarations) - we only want references
        if (path.isBindingIdentifier()) return;

        const refBinding = path.scope.getBinding(path.node.name);
        if (refBinding) {
          // CRITICAL FIX: Only include references to identifiers NOT in INNER scopes
          // Skip identifiers declared INSIDE this identifier's scope
          const refScope = refBinding.scope;

          // For functions/classes: skip variables declared in the same scope (function body)
          // For variables: don't skip variables in the same scope (they CAN reference each other)
          if (idIsFunction && refScope === idScope) return;

          // Check if refScope is STRICTLY INSIDE idScope (refScope is a descendant)
          // If so, skip it (it's an inner declaration, not an external dependency)
          let current = refScope.parent; // Start from parent since we checked === above
          let isInner = false;
          while (current) {
            if (current === idScope) {
              isInner = true;
              break;
            }
            current = current.parent;
          }

          // Only add if it's NOT an inner scope reference
          if (!isInner) {
            referenced.add(path.node.name);
          }
        }
      }
    });

    // Also check the reference paths (where this identifier is used)
    for (const refPath of binding.referencePaths) {
      refPath.traverse({
        Identifier(path) {
          // Skip binding identifiers here too
          if (path.isBindingIdentifier()) return;

          const refBinding = path.scope.getBinding(path.node.name);
          if (refBinding) {
            // Same check as above
            const refScope = refBinding.scope;

            // For functions/classes: skip variables declared in the same scope (function body)
            if (idIsFunction && refScope === idScope) return;

            let current = refScope.parent;
            let isInner = false;
            while (current) {
              if (current === idScope) {
                isInner = true;
                break;
              }
              current = current.parent;
            }

            if (!isInner) {
              referenced.add(path.node.name);
            }
          }
        }
      });
    }

    nameReferences.set(id.node.name, referenced);
  }

  return { nameReferences, bindings };
}

/**
 * Precompute scope hierarchy for O(1) containment lookups.
 * Returns a map where each identifier maps to the set of identifiers it contains.
 */
function buildScopeHierarchy(
  identifiers: NodePath<Identifier>[],
  onProgress?: (processed: number) => void
): Map<NodePath<Identifier>, Set<NodePath<Identifier>>> {
  const hierarchy = new Map<NodePath<Identifier>, Set<NodePath<Identifier>>>();

  // For each identifier, find all identifiers it contains
  let processed = 0;
  for (const outer of identifiers) {
    const contained = new Set<NodePath<Identifier>>();
    const outerScope = getScopeForContainment(outer);

    processed++;
    onProgress?.(processed);

    for (const inner of identifiers) {
      if (outer === inner) continue;

      const innerScope = getScopeForContainment(inner);

      // Special case: if innerScope === outerScope, inner is directly in outer's scope
      // BUT only if outer is a function/class (which creates the scope)
      // This prevents variables at the same scope level from containing each other
      if (innerScope === outerScope && isFunctionOrClass(outer)) {
        contained.add(inner);
        continue;
      }

      // Check if innerScope is descendant of outerScope
      let current = innerScope.parent;
      while (current) {
        if (current === outerScope) {
          contained.add(inner);
          break;
        }
        current = current.parent;
      }
    }

    if (contained.size > 0) {
      hierarchy.set(outer, contained);
    }
  }

  return hierarchy;
}

/**
 * Check if the outer identifier's scope contains the inner identifier's scope.
 * This determines whether inner's context will include outer when being renamed.
 */
function scopeContains(
  outer: NodePath<Identifier>,
  inner: NodePath<Identifier>
): boolean {
  const outerScope = closestSurroundingContextPath(outer).scope;
  const innerScope = closestSurroundingContextPath(inner).scope;

  // Walk up from inner scope to see if we reach outer scope
  let current = innerScope.parent; // Start from parent to avoid self-containment
  while (current) {
    if (current === outerScope) {
      return true;
    }
    current = current.parent;
  }

  return false;
}

/**
 * Check if the referencer identifier references the referenced identifier.
 */
function references(
  referencer: NodePath<Identifier>,
  referenced: NodePath<Identifier>
): boolean {
  const binding = referencer.scope.getBinding(referencer.node.name);
  if (!binding) return false;

  // Check if any of the binding's references include the referenced identifier
  for (const refPath of binding.referencePaths) {
    // Simple case: direct reference
    if (refPath === referenced) {
      return true;
    }

    // Check if the reference expression includes the referenced identifier
    let found = false;
    refPath.traverse({
      Identifier(path) {
        if (path.node.name === referenced.node.name) {
          // Verify it's the same binding
          const refBinding = path.scope.getBinding(path.node.name);
          if (refBinding === referenced.scope.getBinding(referenced.node.name)) {
            found = true;
            path.stop();
          }
        }
      }
    });

    if (found) return true;
  }

  return false;
}

/**
 * Helper to get the closest surrounding context path (same logic as in visit-all-identifiers)
 */
function closestSurroundingContextPath(
  path: NodePath<Identifier>
): NodePath<Node> {
  const programOrBindingNode = path.findParent(
    (p) => p.isProgram() || path.node.name in p.getOuterBindingIdentifiers()
  )?.scope.path;
  return programOrBindingNode ?? path.scope.path;
}

/**
 * Perform topological sort on identifiers based on their dependencies.
 * Returns batches where all identifiers in a batch can be processed in parallel.
 * Dependencies between batches are respected (batch N depends only on batches 0..N-1).
 *
 * Uses Kahn's algorithm with cycle detection.
 */
export function topologicalSort(
  identifiers: NodePath<Identifier>[],
  dependencies: Dependency[]
): NodePath<Identifier>[][] {
  const batches: NodePath<Identifier>[][] = [];
  const processed = new Set<NodePath<Identifier>>();

  // Build adjacency map and in-degree map
  const dependsOn = new Map<NodePath<Identifier>, Set<NodePath<Identifier>>>();
  const inDegree = new Map<NodePath<Identifier>, number>();

  // Create a set for fast lookup
  const identifierSet = new Set(identifiers);

  // Initialize
  for (const id of identifiers) {
    dependsOn.set(id, new Set());
    inDegree.set(id, 0);
  }

  // Build graph (skip dependencies that reference identifiers not in our list)
  for (const dep of dependencies) {
    if (identifierSet.has(dep.from) && identifierSet.has(dep.to)) {
      dependsOn.get(dep.to)!.add(dep.from);
      inDegree.set(dep.to, inDegree.get(dep.to)! + 1);
    }
  }

  // Build a set of unprocessed identifiers for faster iteration
  const unprocessed = new Set(identifiers);

  // Process batches
  while (unprocessed.size > 0) {
    const batch: NodePath<Identifier>[] = [];

    // Find all nodes with no unprocessed dependencies
    for (const id of unprocessed) {
      const unprocessedDeps = Array.from(dependsOn.get(id)!).filter(
        (dep) => !processed.has(dep)
      );

      if (unprocessedDeps.length === 0) {
        batch.push(id);
      }
    }

    // Cycle detection: if no nodes can be added, we have a cycle
    if (batch.length === 0) {
      // Break cycle by picking node with smallest scope (most specific)
      const remaining = Array.from(unprocessed);

      if (remaining.length > 0) {
        // Sort by scope size (smallest first)
        remaining.sort((a, b) => {
          const aScope = closestSurroundingContextPath(a).scope.block;
          const bScope = closestSurroundingContextPath(b).scope.block;
          const aSize = (aScope.end ?? 0) - (aScope.start ?? 0);
          const bSize = (bScope.end ?? 0) - (bScope.start ?? 0);
          return aSize - bSize;
        });

        batch.push(remaining[0]);
      }
    }

    batches.push(batch);
    batch.forEach((id) => {
      processed.add(id);
      unprocessed.delete(id);
    });
  }

  return batches;
}

/**
 * Merge small batches to ensure minimum batch size.
 * This sacrifices some dependency ordering for better parallelization.
 *
 * Strategy: Intelligently merge batches by minimizing cross-batch dependencies.
 * We prefer to merge batches with:
 * 1. Similar scope levels (global vars with global vars, inner vars with inner vars)
 * 2. Minimal mutual references
 * 3. Consecutive batches (to preserve dependency order where possible)
 */
/**
 * Split large batches to prevent memory spikes and improve parallelization.
 *
 * Large batches (e.g., 148K identifiers) cause:
 * - Memory spikes when extracting all contexts at once
 * - Long waits for all API calls to complete before moving to next batch
 *
 * Strategy: Split batches larger than maxSize into chunks.
 */
export function splitLargeBatches(
  batches: NodePath<Identifier>[][],
  maxBatchSize: number
): NodePath<Identifier>[][] {
  if (maxBatchSize <= 0) return batches;

  const result: NodePath<Identifier>[][] = [];

  for (const batch of batches) {
    if (batch.length <= maxBatchSize) {
      result.push(batch);
    } else {
      // Split into chunks of maxBatchSize
      for (let i = 0; i < batch.length; i += maxBatchSize) {
        result.push(batch.slice(i, i + maxBatchSize));
      }
    }
  }

  return result;
}

export function mergeBatches(
  batches: NodePath<Identifier>[][],
  minBatchSize: number,
  dependencies: Dependency[]
): NodePath<Identifier>[][] {
  if (minBatchSize <= 1 || batches.length === 0) return batches;

  // Build dependency lookup for fast checking
  const depSet = new Set<string>();
  for (const dep of dependencies) {
    const key = `${dep.from.node.name}->${dep.to.node.name}`;
    depSet.add(key);
  }

  const hasDependency = (from: NodePath<Identifier>, to: NodePath<Identifier>): boolean => {
    return depSet.has(`${from.node.name}->${to.node.name}`) ||
           depSet.has(`${to.node.name}->${from.node.name}`);
  };

  // Calculate "merge cost" between two batches
  const getMergeCost = (batch1: NodePath<Identifier>[], batch2: NodePath<Identifier>[]): number => {
    let cost = 0;

    // Count cross-batch dependencies
    for (const id1 of batch1) {
      for (const id2 of batch2) {
        if (hasDependency(id1, id2)) {
          cost += 10; // High penalty for dependencies
        }
      }
    }

    // Calculate scope level difference (prefer merging similar scopes)
    const getScopeLevel = (id: NodePath<Identifier>): number => {
      let level = 0;
      let scope = id.scope;
      while (scope.parent) {
        level++;
        scope = scope.parent;
      }
      return level;
    };

    const batch1AvgLevel = batch1.reduce((sum, id) => sum + getScopeLevel(id), 0) / batch1.length;
    const batch2AvgLevel = batch2.reduce((sum, id) => sum + getScopeLevel(id), 0) / batch2.length;
    cost += Math.abs(batch1AvgLevel - batch2AvgLevel);

    return cost;
  };

  const merged: NodePath<Identifier>[][] = [];
  const used = new Set<number>();

  // First pass: merge consecutive small batches with low merge cost
  for (let i = 0; i < batches.length; i++) {
    if (used.has(i)) continue;

    let currentBatch = [...batches[i]];
    used.add(i);

    // Try to merge with consecutive batches until we reach minBatchSize
    while (currentBatch.length < minBatchSize && i + 1 < batches.length) {
      const nextIdx = i + 1;
      if (used.has(nextIdx)) break;

      const nextBatch = batches[nextIdx];
      const cost = getMergeCost(currentBatch, nextBatch);

      // Only merge if cost is reasonable (less than 5 dependencies per identifier)
      const avgCostPerIdentifier = cost / (currentBatch.length + nextBatch.length);
      if (avgCostPerIdentifier < 5 || currentBatch.length + nextBatch.length <= minBatchSize) {
        currentBatch.push(...nextBatch);
        used.add(nextIdx);
        i = nextIdx;
      } else {
        break;
      }
    }

    merged.push(currentBatch);
  }

  return merged;
}
