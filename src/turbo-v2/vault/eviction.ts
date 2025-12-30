/**
 * VAULT EVICTION SYSTEM
 *
 * Implements LRU (Least Recently Used) eviction policy to prevent unbounded vault growth.
 * Triggered when vault size exceeds a configured threshold.
 */

import { readdirSync, statSync, unlinkSync } from "fs";
import { join } from "path";

/**
 * Eviction statistics
 */
export interface EvictionStats {
  vaultSize: number; // Total size in bytes
  entryCount: number; // Number of cache entries
  evictedCount: number; // Number of entries evicted
  evictedSize: number; // Total size evicted in bytes
}

/**
 * Cache entry metadata for LRU tracking
 */
interface CacheEntryMeta {
  path: string;
  size: number;
  lastAccessed: number; // Access time (mtime)
}

/**
 * Eviction configuration
 */
export interface EvictionConfig {
  maxSize: number; // Maximum vault size in bytes (default: 1GB)
  targetSize?: number; // Target size after eviction (default: 80% of maxSize)
}

/**
 * VaultEviction: Manages LRU eviction for the vault cache
 *
 * Purpose: Prevent unbounded disk usage from cached LLM responses
 *
 * Key Design Decisions:
 * - LRU policy: Evict least recently accessed entries first
 * - Triggered when vault size > maxSize
 * - Evicts until size < targetSize (80% of max by default)
 * - Access time tracked via file mtime (filesystem metadata)
 */
export class VaultEviction {
  private cacheDir: string;
  private config: Required<EvictionConfig>;

  constructor(cacheDir: string = ".humanify-cache/vault", config: EvictionConfig) {
    this.cacheDir = cacheDir;
    this.config = {
      maxSize: config.maxSize,
      targetSize: config.targetSize ?? Math.floor(config.maxSize * 0.8),
    };
  }

  /**
   * Get current vault statistics
   */
  getStats(): Omit<EvictionStats, "evictedCount" | "evictedSize"> {
    let totalSize = 0;
    let entryCount = 0;

    try {
      const files = readdirSync(this.cacheDir);

      for (const file of files) {
        // Only count .json files (skip .tmp files)
        if (!file.endsWith(".json")) continue;

        const filePath = join(this.cacheDir, file);
        try {
          const stats = statSync(filePath);
          totalSize += stats.size;
          entryCount++;
        } catch {
          // Skip files that can't be stat'd (may have been deleted)
          continue;
        }
      }
    } catch (error) {
      // If cache dir doesn't exist, return zeros
      return { vaultSize: 0, entryCount: 0 };
    }

    return {
      vaultSize: totalSize,
      entryCount,
    };
  }

  /**
   * Check if eviction is needed
   */
  needsEviction(): boolean {
    const stats = this.getStats();
    return stats.vaultSize > this.config.maxSize;
  }

  /**
   * Perform LRU eviction
   *
   * Evicts entries until vault size is below targetSize.
   * Returns statistics about the eviction.
   */
  evict(): EvictionStats {
    const initialStats = this.getStats();

    // No eviction needed
    if (initialStats.vaultSize <= this.config.maxSize) {
      return {
        ...initialStats,
        evictedCount: 0,
        evictedSize: 0,
      };
    }

    // Collect all cache entries with metadata
    const entries = this.collectEntries();

    // Sort by last access time (oldest first)
    entries.sort((a, b) => a.lastAccessed - b.lastAccessed);

    // Evict entries until we reach target size
    let currentSize = initialStats.vaultSize;
    let evictedCount = 0;
    let evictedSize = 0;

    for (const entry of entries) {
      if (currentSize <= this.config.targetSize) {
        break; // Target reached
      }

      try {
        unlinkSync(entry.path);
        currentSize -= entry.size;
        evictedSize += entry.size;
        evictedCount++;
      } catch (error) {
        console.warn(`[vault-eviction] Failed to evict ${entry.path}:`, error);
        // Continue with next entry
      }
    }

    const finalStats = this.getStats();

    return {
      vaultSize: finalStats.vaultSize,
      entryCount: finalStats.entryCount,
      evictedCount,
      evictedSize,
    };
  }

  /**
   * Collect all cache entries with metadata
   */
  private collectEntries(): CacheEntryMeta[] {
    const entries: CacheEntryMeta[] = [];

    try {
      const files = readdirSync(this.cacheDir);

      for (const file of files) {
        // Only process .json files
        if (!file.endsWith(".json")) continue;

        const filePath = join(this.cacheDir, file);

        try {
          const stats = statSync(filePath);
          entries.push({
            path: filePath,
            size: stats.size,
            lastAccessed: stats.mtimeMs, // Use modification time as proxy for access time
          });
        } catch {
          // Skip files that can't be stat'd
          continue;
        }
      }
    } catch (error) {
      console.warn(`[vault-eviction] Error reading cache directory:`, error);
    }

    return entries;
  }

  /**
   * Format size in human-readable format
   */
  static formatSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Get eviction summary message
   */
  static formatStats(stats: EvictionStats): string {
    return `Vault: ${VaultEviction.formatSize(stats.vaultSize)} / ${stats.entryCount} entries | Evicted: ${stats.evictedCount} entries (${VaultEviction.formatSize(stats.evictedSize)})`;
  }
}

/**
 * Default eviction configuration
 * 1GB max size, evict to 800MB
 */
export const DEFAULT_EVICTION_CONFIG: EvictionConfig = {
  maxSize: 1024 * 1024 * 1024, // 1GB
  targetSize: 1024 * 1024 * 1024 * 0.8, // 800MB
};
