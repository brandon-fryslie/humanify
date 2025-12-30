/**
 * Vault Module: Content-Addressed Cache for LLM Responses
 *
 * Purpose: Ensure zero wasted API spend on retries by caching all LLM interactions
 *
 * Key Components:
 * - Vault: Core cache implementation with SHA-256 key computation
 * - VaultEntry: Structured format for request/response pairs
 * - VaultInterface: Contract for cache implementations
 *
 * Design Principles:
 * - Content-addressed: Cache key is hash of (model + prompt + options)
 * - Crash-safe: Atomic writes via temp file + rename pattern
 * - Global: Shared across all jobs, not per-job
 * - Persistent: Survives process restarts
 *
 * Usage:
 * ```typescript
 * import { Vault } from './vault/vault.js';
 *
 * const vault = new Vault('.humanify-cache/vault');
 * const key = vault.computeKey(model, prompt, options);
 *
 * // Check cache
 * const cached = await vault.get(key);
 * if (cached) {
 *   return cached.response;
 * }
 *
 * // Make API call and cache
 * const response = await callLLM(...);
 * await vault.set(key, { request, response, hash: key });
 * ```
 *
 * See: FINAL_PROJECT_SPEC.md Section 2.1 "The Vault"
 */

export { Vault, VaultEntry, VaultInterface, TokenUsage } from "./vault.js";
