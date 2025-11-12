import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { NodePath } from "@babel/core";
import { Identifier } from "@babel/types";
import { Dependency } from "./dependency-graph.js";
import { instrumentation } from "../../instrumentation.js";

const CACHE_DIR = ".humanify-cache/dependencies";
const CACHE_VERSION = "2.0";

interface CacheEntry {
  fileHash: string;
  identifierCount: number;
  identifierNames: string[];
  dependencies: SerializedDependency[];
  scopeHierarchy: [number, number[]][]; // NEW in v2.0
  referenceIndex: {
    nameReferences: [string, string[]][]; // NEW in v2.0
  };
  timestamp: number;
  version: string;
}

interface SerializedDependency {
  fromIndex: number;
  toIndex: number;
  reason: "scope-containment" | "reference";
}

/**
 * Result returned from getCachedDependencies with optional precomputed indices
 */
export interface CachedDependenciesResult {
  dependencies: Dependency[];
  scopeHierarchy: Map<NodePath<Identifier>, Set<NodePath<Identifier>>> | null;
  referenceIndex: Map<string, Set<string>> | null;
}

/**
 * Try to load cached dependencies for the given code.
 * Returns null on cache miss or validation failure.
 * If cache hit, returns dependencies along with precomputed indices (if available).
 */
export async function getCachedDependencies(
  code: string,
  identifiers: NodePath<Identifier>[]
): Promise<CachedDependenciesResult | null> {
  const hash = hashCode(code);
  const cachePath = getCachePath(hash);

  try {
    const cacheContent = await fs.readFile(cachePath, "utf-8");
    const cached: CacheEntry = JSON.parse(cacheContent);

    const cacheSize = Buffer.byteLength(cacheContent, "utf-8");
    instrumentation.startSpan("cache-validation").end(); // Just for tracking

    // Validate cache version
    if (cached.version !== CACHE_VERSION) {
      console.log(`    → Cache invalid: version mismatch (expected ${CACHE_VERSION}, got ${cached.version || 'none'})`);
      instrumentation
        .startSpan("cache-miss", { reason: "version-mismatch" })
        .end();
      return null;
    }

    // Validate identifier count
    if (cached.identifierCount !== identifiers.length) {
      console.log(`    → Cache invalid: identifier count mismatch`);
      instrumentation
        .startSpan("cache-miss", { reason: "identifier-count-mismatch" })
        .end();
      return null;
    }

    // Verify identifier names match (structural validation)
    const currentNames = identifiers.map((id) => id.node.name);
    if (!arraysEqual(cached.identifierNames, currentNames)) {
      console.log(`    → Cache invalid: identifier names changed`);
      instrumentation
        .startSpan("cache-miss", { reason: "identifier-names-changed" })
        .end();
      return null;
    }

    console.log(
      `    → Cache HIT! Loaded ${cached.dependencies.length} dependencies (${formatBytes(cacheSize)})`
    );

    const hitSpan = instrumentation.startSpan("cache-hit", {
      cacheSize,
      dependencyCount: cached.dependencies.length
    });
    hitSpan.end();

    // Deserialize dependencies: map indices back to NodePath objects
    const dependencies = cached.dependencies.map((dep) => ({
      from: identifiers[dep.fromIndex],
      to: identifiers[dep.toIndex],
      reason: dep.reason
    }));

    // Deserialize scope hierarchy if present
    let scopeHierarchy: Map<NodePath<Identifier>, Set<NodePath<Identifier>>> | null = null;
    if (cached.scopeHierarchy) {
      scopeHierarchy = deserializeScopeHierarchy(cached.scopeHierarchy, identifiers);
      console.log(`    → Cache HIT! Loaded precomputed scope hierarchy`);
    }

    // Deserialize reference index if present
    let referenceIndex: Map<string, Set<string>> | null = null;
    if (cached.referenceIndex?.nameReferences) {
      referenceIndex = deserializeReferenceIndex(cached.referenceIndex.nameReferences);
      console.log(`    → Cache HIT! Loaded precomputed reference index`);
    }

    return {
      dependencies,
      scopeHierarchy,
      referenceIndex
    };
  } catch (err) {
    // Cache miss or read error
    instrumentation.startSpan("cache-miss", { reason: "not-found" }).end();
    return null;
  }
}

/**
 * Save dependency graph to cache for future runs.
 * Includes precomputed indices for faster cache hits.
 */
export async function saveDependencyCache(
  code: string,
  identifiers: NodePath<Identifier>[],
  dependencies: Dependency[],
  scopeHierarchy?: Map<NodePath<Identifier>, Set<NodePath<Identifier>>>,
  referenceIndex?: Map<string, Set<string>>
): Promise<void> {
  const hash = hashCode(code);
  const cachePath = getCachePath(hash);

  // Create cache directory
  await fs.mkdir(path.dirname(cachePath), { recursive: true });

  // Build index map: NodePath -> array index
  const indexMap = new Map<NodePath<Identifier>, number>();
  identifiers.forEach((id, idx) => indexMap.set(id, idx));

  const cache: CacheEntry = {
    fileHash: hash,
    identifierCount: identifiers.length,
    identifierNames: identifiers.map((id) => id.node.name),
    dependencies: dependencies.map((dep) => ({
      fromIndex: indexMap.get(dep.from)!,
      toIndex: indexMap.get(dep.to)!,
      reason: dep.reason
    })),
    scopeHierarchy: scopeHierarchy
      ? serializeScopeHierarchy(scopeHierarchy, identifiers)
      : [],
    referenceIndex: {
      nameReferences: referenceIndex
        ? serializeReferenceIndex(referenceIndex)
        : []
    },
    timestamp: Date.now(),
    version: CACHE_VERSION
  };

  const cacheContent = JSON.stringify(cache, null, 2);
  const cacheSize = Buffer.byteLength(cacheContent, "utf-8");

  await fs.writeFile(cachePath, cacheContent);

  console.log(
    `    → Cached ${dependencies.length} dependencies (${formatBytes(cacheSize)})`
  );

  instrumentation
    .startSpan("cache-write", {
      cacheSize,
      dependencyCount: dependencies.length
    })
    .end();
}

/**
 * Get total cache size on disk
 */
export async function getCacheSize(): Promise<number> {
  let totalSize = 0;

  try {
    const walkDir = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await walkDir(fullPath);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    };

    await walkDir(CACHE_DIR);
  } catch (err) {
    // Cache directory doesn't exist
    return 0;
  }

  return totalSize;
}

// ============================================================================
// SERIALIZATION HELPERS
// ============================================================================

/**
 * Serialize Map<NodePath, Set<NodePath>> to JSON-compatible format.
 * Converts NodePaths to indices in the identifiers array.
 */
function serializeScopeHierarchy(
  hierarchy: Map<NodePath<Identifier>, Set<NodePath<Identifier>>>,
  identifiers: NodePath<Identifier>[]
): [number, number[]][] {
  const result: [number, number[]][] = [];

  for (const [outer, innerSet] of hierarchy) {
    const outerIdx = identifiers.indexOf(outer);
    if (outerIdx === -1) continue; // Skip if not found

    const innerIndices: number[] = [];
    for (const inner of innerSet) {
      const innerIdx = identifiers.indexOf(inner);
      if (innerIdx !== -1) {
        innerIndices.push(innerIdx);
      }
    }

    if (innerIndices.length > 0) {
      result.push([outerIdx, innerIndices]);
    }
  }

  return result;
}

/**
 * Deserialize JSON to Map<NodePath, Set<NodePath>>.
 * Converts indices back to NodePath references.
 */
function deserializeScopeHierarchy(
  serialized: [number, number[]][],
  identifiers: NodePath<Identifier>[]
): Map<NodePath<Identifier>, Set<NodePath<Identifier>>> {
  const map = new Map<NodePath<Identifier>, Set<NodePath<Identifier>>>();

  for (const [outerIdx, innerIndices] of serialized) {
    if (outerIdx < 0 || outerIdx >= identifiers.length) continue;

    const outer = identifiers[outerIdx];
    const innerSet = new Set<NodePath<Identifier>>();

    for (const innerIdx of innerIndices) {
      if (innerIdx >= 0 && innerIdx < identifiers.length) {
        innerSet.add(identifiers[innerIdx]);
      }
    }

    if (innerSet.size > 0) {
      map.set(outer, innerSet);
    }
  }

  return map;
}

/**
 * Serialize Map<string, Set<string>> to JSON-compatible format.
 */
function serializeReferenceIndex(
  refIndex: Map<string, Set<string>>
): [string, string[]][] {
  const result: [string, string[]][] = [];

  for (const [name, referencedNames] of refIndex) {
    const refsArray = Array.from(referencedNames);
    if (refsArray.length > 0) {
      result.push([name, refsArray]);
    }
  }

  return result;
}

/**
 * Deserialize JSON to Map<string, Set<string>>.
 */
function deserializeReferenceIndex(
  serialized: [string, string[]][]
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  for (const [name, referencedNames] of serialized) {
    map.set(name, new Set(referencedNames));
  }

  return map;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function getCachePath(hash: string): string {
  // Use first 2 chars as subdirectory to avoid too many files in one dir
  const subdir = hash.substring(0, 2);
  return path.join(CACHE_DIR, subdir, `${hash}.json`);
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((val, idx) => val === b[idx]);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}
