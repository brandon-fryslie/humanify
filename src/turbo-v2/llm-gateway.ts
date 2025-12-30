import { Vault, VaultEntry, TokenUsage } from "./vault/vault.js";

/**
 * Metrics for LLM Gateway operations
 */
export interface LLMGatewayMetrics {
  hits: number;
  misses: number;
  errors: number;
  totalRequests: number;
}

/**
 * LLM request parameters
 */
export interface LLMRequest {
  model: string;
  prompt: string;
  options?: Record<string, any>;
}

/**
 * LLM response
 */
export interface LLMResponse {
  content: string;
  tokens: TokenUsage;
}

/**
 * LLM Provider function type
 * Takes a request and returns a response
 */
export type LLMProvider = (request: LLMRequest) => Promise<LLMResponse>;

/**
 * LLM Gateway: Vault-aware LLM request handler
 *
 * Purpose: Check vault before making API calls to eliminate wasted spend
 *
 * Flow:
 * 1. Compute cache key from request
 * 2. Check vault for existing response
 * 3. On cache hit: Return cached response (no API call)
 * 4. On cache miss: Call LLM provider, cache response, return
 * 5. Track metrics: hits, misses, errors
 */
export class LLMGateway {
  private vault: Vault;
  private provider: LLMProvider;
  private metrics: LLMGatewayMetrics;

  constructor(provider: LLMProvider, vaultDir?: string) {
    this.vault = new Vault(vaultDir);
    this.provider = provider;
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0,
    };
  }

  /**
   * Make an LLM request with vault caching
   * Returns cached response if available, otherwise calls provider
   */
  async request(request: LLMRequest): Promise<LLMResponse> {
    this.metrics.totalRequests++;

    const options = request.options || {};
    const key = this.vault.computeKey(request.model, request.prompt, options);

    // Check vault first
    const cached = await this.vault.get(key);
    if (cached) {
      this.metrics.hits++;
      return {
        content: cached.response.content,
        tokens: cached.response.tokens,
      };
    }

    // Cache miss - call provider
    this.metrics.misses++;

    try {
      const response = await this.provider(request);

      // Store in vault
      const entry: VaultEntry = {
        request: {
          model: request.model,
          prompt: request.prompt,
          options,
        },
        response: {
          content: response.content,
          tokens: response.tokens,
          timestamp: new Date().toISOString(),
        },
        hash: key,
      };

      await this.vault.set(key, entry);

      return response;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): LLMGatewayMetrics {
    return { ...this.metrics };
  }

  /**
   * Get hit rate percentage
   */
  getHitRate(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return (this.metrics.hits / this.metrics.totalRequests) * 100;
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0,
    };
  }
}
