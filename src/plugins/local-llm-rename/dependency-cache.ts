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

  // Create cache directory with retry logic for cloud-synced filesystems
  // Cloud storage (iCloud, OneDrive, Dropbox) can return EINVAL or ENOENT
  // when directories aren't immediately available after creation
  const maxRetries = 3;
  const retryDelay = 100; // ms

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Ensure directory exists before writing
      await fs.mkdir(path.dirname(cachePath), { recursive: true });
      await fs.writeFile(cachePath, cacheContent);

      // Success - log and exit
      console.log(
        `    → Cached ${dependencies.length} dependencies (${formatBytes(cacheSize)})`
      );

      instrumentation
        .startSpan("cache-write", {
          cacheSize,
          dependencyCount: dependencies.length
        })
        .end();

      return;
    } catch (err: any) {
      const isRetryable = err.code === 'ENOENT' || err.code === 'EINVAL';
      const isLastAttempt = attempt === maxRetries - 1;

      if (isRetryable && !isLastAttempt) {
        // Wait before retrying on cloud-synced filesystems
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }

      // Non-retryable error or final attempt - log and gracefully degrade
      console.warn(`    → Warning: Failed to write cache (${err.code}): ${err.message}`);
      console.warn(`    → Cache disabled for this run (functionality unaffected)`);
      instrumentation
        .startSpan("cache-write-failed", {
          errorCode: err.code,
          attempt: attempt + 1
        })
        .end();
      return; // Graceful degradation - don't throw
    }
  }
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
    // Cache directory doesn't exist or is empty
    return 0;
  }

  return totalSize;
}

// ============================================================================
// PRIVATE HELPERS
// ============================================================================

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function getCachePath(hash: string): string {
  // Use first 2 chars of hash as subdirectory for better filesystem performance
  const subdir = hash.substring(0, 2);
  return path.join(CACHE_DIR, subdir, `${hash}.json`);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Serialize scope hierarchy Map to JSON-friendly format
 */
function serializeScopeHierarchy(
  hierarchy: Map<NodePath<Identifier>, Set<NodePath<Identifier>>>,
  identifiers: NodePath<Identifier>[]
): [number, number[]][] {
  const indexMap = new Map<NodePath<Identifier>, number>();
  identifiers.forEach((id, idx) => indexMap.set(id, idx));

  const serialized: [number, number[]][] = [];

  for (const [outer, inners] of hierarchy) {
    const outerIdx = indexMap.get(outer);
    if (outerIdx === undefined) continue;

    const innerIndices: number[] = [];
    for (const inner of inners) {
      const innerIdx = indexMap.get(inner);
      if (innerIdx !== undefined) {
        innerIndices.push(innerIdx);
      }
    }

    if (innerIndices.length > 0) {
      serialized.push([outerIdx, innerIndices]);
    }
  }

  return serialized;
}

/**
 * Deserialize scope hierarchy from JSON format
 */
function deserializeScopeHierarchy(
  serialized: [number, number[]][],
  identifiers: NodePath<Identifier>[]
): Map<NodePath<Identifier>, Set<NodePath<Identifier>>> {
  const hierarchy = new Map<NodePath<Identifier>, Set<NodePath<Identifier>>>();

  for (const [outerIdx, innerIndices] of serialized) {
    const outer = identifiers[outerIdx];
    if (!outer) continue;

    const inners = new Set<NodePath<Identifier>>();
    for (const innerIdx of innerIndices) {
      const inner = identifiers[innerIdx];
      if (inner) {
        inners.add(inner);
      }
    }

    if (inners.size > 0) {
      hierarchy.set(outer, inners);
    }
  }

  return hierarchy;
}

/**
 * Serialize reference index Map to JSON-friendly format
 */
function serializeReferenceIndex(
  refIndex: Map<string, Set<string>>
): [string, string[]][] {
  const serialized: [string, string[]][] = [];

  for (const [name, refs] of refIndex) {
    serialized.push([name, Array.from(refs)]);
  }

  return serialized;
}

/**
 * Deserialize reference index from JSON format
 */
function deserializeReferenceIndex(
  serialized: [string, string[]][]
): Map<string, Set<string>> {
  const refIndex = new Map<string, Set<string>>();

  for (const [name, refs] of serialized) {
    refIndex.set(name, new Set(refs));
  }

  return refIndex;
}
