import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync } from "fs";
import { join } from "path";

/**
 * Token usage statistics for an LLM response
 */
export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

/**
 * A single vault entry containing both request and response
 */
export interface VaultEntry {
  request: {
    model: string;
    prompt: string;
    options: Record<string, any>;
  };
  response: {
    content: string;
    tokens: TokenUsage;
    timestamp: string;
  };
  hash: string;
}

/**
 * Interface for the Vault (request-level cache)
 */
export interface VaultInterface {
  get(key: string): Promise<VaultEntry | null>;
  set(key: string, entry: VaultEntry): Promise<void>;
  has(key: string): Promise<boolean>;
  computeKey(model: string, prompt: string, options: Record<string, any>): string;
}

/**
 * Vault: Content-addressed cache for LLM request/response pairs
 *
 * Purpose: Ensure zero wasted API spend on retries by caching all LLM responses
 *
 * Key Design Decisions:
 * - Cache key: SHA-256 hash of (model + prompt + options)
 * - Storage: .humanify-cache/vault/{hash}.json
 * - Atomic writes: temp file + rename pattern for crash safety
 * - Global cache: Shared across all jobs (not per-job)
 */
export class Vault implements VaultInterface {
  private cacheDir: string;

  constructor(cacheDir: string = ".humanify-cache/vault") {
    this.cacheDir = cacheDir;
    this.ensureCacheDir();
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Compute cache key from request parameters
   * Uses SHA-256 for collision resistance
   */
  computeKey(model: string, prompt: string, options: Record<string, any>): string {
    // Stable JSON serialization: sort keys for deterministic output
    const sortedOptions = JSON.stringify(options, Object.keys(options).sort());
    const payload = `${model}||${prompt}||${sortedOptions}`;
    return createHash("sha256").update(payload).digest("hex");
  }

  /**
   * Get vault entry path for a given key
   */
  private getEntryPath(key: string): string {
    return join(this.cacheDir, `${key}.json`);
  }

  /**
   * Get vault entry by key
   * Returns null if not found
   */
  async get(key: string): Promise<VaultEntry | null> {
    const path = this.getEntryPath(key);

    if (!existsSync(path)) {
      return null;
    }

    try {
      const content = readFileSync(path, "utf-8");
      const entry = JSON.parse(content) as VaultEntry;

      // Validate entry structure
      if (!this.validateEntry(entry)) {
        console.warn(`[vault] Invalid entry structure for key ${key}, ignoring`);
        return null;
      }

      return entry;
    } catch (error) {
      console.warn(`[vault] Error reading entry ${key}:`, error);
      return null;
    }
  }

  /**
   * Set vault entry with atomic write
   * Uses temp file + rename pattern for crash safety
   */
  async set(key: string, entry: VaultEntry): Promise<void> {
    const path = this.getEntryPath(key);
    const tempPath = `${path}.tmp`;

    try {
      // Validate entry before writing
      if (!this.validateEntry(entry)) {
        throw new Error("Invalid vault entry structure");
      }

      // Write to temp file
      writeFileSync(tempPath, JSON.stringify(entry, null, 2), "utf-8");

      // Atomic rename (POSIX guarantees atomicity)
      renameSync(tempPath, path);
    } catch (error) {
      // Cleanup temp file if it exists
      if (existsSync(tempPath)) {
        try {
          unlinkSync(tempPath);
        } catch {
          // Ignore cleanup errors
        }
      }
      throw error;
    }
  }

  /**
   * Check if vault has entry for key
   */
  async has(key: string): Promise<boolean> {
    return existsSync(this.getEntryPath(key));
  }

  /**
   * Validate vault entry structure
   */
  private validateEntry(entry: any): entry is VaultEntry {
    if (!entry || typeof entry !== "object") return false;

    // Validate request
    if (!entry.request || typeof entry.request !== "object") return false;
    if (typeof entry.request.model !== "string") return false;
    if (typeof entry.request.prompt !== "string") return false;
    if (!entry.request.options || typeof entry.request.options !== "object") return false;

    // Validate response
    if (!entry.response || typeof entry.response !== "object") return false;
    if (typeof entry.response.content !== "string") return false;
    if (typeof entry.response.timestamp !== "string") return false;

    // Validate tokens
    if (!entry.response.tokens || typeof entry.response.tokens !== "object") return false;
    if (typeof entry.response.tokens.prompt !== "number") return false;
    if (typeof entry.response.tokens.completion !== "number") return false;
    if (typeof entry.response.tokens.total !== "number") return false;

    // Validate hash
    if (typeof entry.hash !== "string") return false;

    return true;
  }
}
