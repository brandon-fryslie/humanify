/**
 * Cost Calculator for Turbo-V2 Experiments
 *
 * Calculates API costs based on token usage and model pricing.
 */

import { CostBreakdown, TokenUsage } from "../../shared/types.js";

/**
 * Pricing per million tokens (in USD)
 */
interface ModelPricing {
  input: number;  // $ per 1M input tokens
  output: number; // $ per 1M output tokens
}

/**
 * Model pricing table (as of Dec 2024)
 * Source: OpenAI pricing page
 */
const MODEL_PRICING: Record<string, ModelPricing> = {
  // GPT-4o Mini
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gpt-4o-mini-2024-07-18": { input: 0.15, output: 0.60 },

  // GPT-4o
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-4o-2024-11-20": { input: 2.50, output: 10.00 },
  "gpt-4o-2024-08-06": { input: 2.50, output: 10.00 },
  "gpt-4o-2024-05-13": { input: 5.00, output: 15.00 },

  // GPT-4 Turbo
  "gpt-4-turbo": { input: 10.00, output: 30.00 },
  "gpt-4-turbo-preview": { input: 10.00, output: 30.00 },

  // GPT-4
  "gpt-4": { input: 30.00, output: 60.00 },

  // O1 models
  "o1": { input: 15.00, output: 60.00 },
  "o1-mini": { input: 3.00, output: 12.00 },
  "o1-preview": { input: 15.00, output: 60.00 },
};

/**
 * Default model if not specified
 */
const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Calculate cost from token usage
 *
 * @param tokens Token usage with prompt/completion counts
 * @param model Model name (defaults to gpt-4o-mini)
 * @returns Cost breakdown in USD
 */
export function calculateCost(
  tokens: TokenUsage,
  model: string = DEFAULT_MODEL
): CostBreakdown {
  // Get pricing for model (fallback to default)
  const pricing = MODEL_PRICING[model] || MODEL_PRICING[DEFAULT_MODEL];

  // Calculate costs (pricing is per million tokens)
  const inputCost = (tokens.promptTokens / 1_000_000) * pricing.input;
  const outputCost = (tokens.completionTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;

  return {
    inputCost: roundToSixDecimals(inputCost),
    outputCost: roundToSixDecimals(outputCost),
    totalCost: roundToSixDecimals(totalCost),
  };
}

/**
 * Calculate cost from raw token counts
 */
export function calculateCostFromRaw(
  promptTokens: number,
  completionTokens: number,
  model: string = DEFAULT_MODEL
): CostBreakdown {
  return calculateCost({
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
  }, model);
}

/**
 * Format cost as USD string
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    // Show more precision for very small amounts
    return `$${cost.toFixed(4)}`;
  }
  return `$${cost.toFixed(2)}`;
}

/**
 * Format cost breakdown as string
 */
export function formatCostBreakdown(breakdown: CostBreakdown): string {
  return `$${breakdown.totalCost.toFixed(4)} (in: ${formatCost(breakdown.inputCost)}, out: ${formatCost(breakdown.outputCost)})`;
}

/**
 * Get pricing info for a model
 */
export function getModelPricing(model: string): ModelPricing | null {
  return MODEL_PRICING[model] || null;
}

/**
 * Check if a model is supported
 */
export function isSupportedModel(model: string): boolean {
  return model in MODEL_PRICING;
}

/**
 * List all supported models
 */
export function getSupportedModels(): string[] {
  return Object.keys(MODEL_PRICING);
}

/**
 * Round to 6 decimal places (micro-dollar precision)
 */
function roundToSixDecimals(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000;
}
