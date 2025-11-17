import OpenAI from "openai";
import {
  visitAllIdentifiers,
  VisitOptions,
  VisitResult
} from "../local-llm-rename/visit-all-identifiers.js";
import { showPercentage } from "../../progress.js";
import { verbose } from "../../verbose.js";
import { instrumentation } from "../../instrumentation.js";
import { RateLimitCoordinator } from "../../rate-limit-coordinator.js";
import { GlobalProgressManager, formatETA } from "../../global-progress.js";
import { DisplayManager } from "../../display-manager.js";

/**
 * Retry an API call with exponential backoff on rate limits.
 * Handles both request-per-minute (RPM) and tokens-per-minute (TPM) limits.
 *
 * Uses a shared RateLimitCoordinator to synchronize rate limit handling
 * across all parallel requests, preventing "thundering herd" where each
 * request independently hits the rate limit.
 *
 * With 500 retries and 60s max backoff, this allows up to ~8 hours of retrying
 * before giving up - essentially unlimited for practical purposes.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  coordinator: RateLimitCoordinator,
  maxRetries: number = 500
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Check global rate limit state before attempting
    // This prevents all parallel requests from simultaneously hitting rate limits
    await coordinator.checkAndWait();

    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error
      if (error?.status === 429 || error?.code === "rate_limit_exceeded") {
        // Extract retry delay from headers
        let delayMs: number;

        // Check x-ratelimit-reset-tokens header (e.g., "59.696s")
        const resetTokens = error.headers?.["x-ratelimit-reset-tokens"];
        const resetRequests = error.headers?.["x-ratelimit-reset-requests"];

        if (resetTokens && resetTokens.includes("s")) {
          // Parse "59.696s" → 59696ms
          const seconds = parseFloat(resetTokens.replace("s", ""));
          delayMs = Math.ceil(seconds * 1000);
        } else if (resetRequests && resetRequests.includes("s")) {
          // Parse "12ms" or "1.5s"
          if (resetRequests.includes("ms")) {
            delayMs = parseInt(resetRequests.replace("ms", ""), 10);
          } else {
            const seconds = parseFloat(resetRequests.replace("s", ""));
            delayMs = Math.ceil(seconds * 1000);
          }
        } else if (error.headers?.["retry-after-ms"]) {
          delayMs = parseInt(error.headers["retry-after-ms"], 10);
        } else if (error.headers?.["retry-after"]) {
          delayMs = parseInt(error.headers["retry-after"], 10) * 1000;
        } else {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s (capped at 60s)
          delayMs = Math.min(1000 * Math.pow(2, attempt), 60000);
        }

        if (attempt < maxRetries) {
          // Notify coordinator to pause ALL parallel requests
          // This is the key to preventing thundering herd
          coordinator.notifyRateLimit(delayMs);

          // Wait for coordinator's pause to expire (all requests wait together)
          // NOTE: We don't log here to avoid interfering with progress bars
          // Rate limit stats are shown in the final summary
          await coordinator.checkAndWait();

          continue;
        } else {
          console.error(`\n❌ FATAL: Max retries (${maxRetries}) exceeded after rate limiting.`);
          console.error(`   This should never happen with 500 retries!`);
          console.error(`   Your OpenAI rate limits may be exhausted for an extended period.`);
          console.error(`   Check your usage at: https://platform.openai.com/usage`);
        }
      }

      // Not a rate limit error or max retries exceeded
      throw error;
    }
  }

  throw lastError;
}

export function openaiRename({
  apiKey,
  baseURL,
  model,
  contextWindowSize,
  turbo,
  maxConcurrent,
  minBatchSize,
  maxBatchSize,
  dependencyMode,
  checkpointMetadata,
  progressManager,
  displayManager
}: {
  apiKey: string;
  baseURL: string;
  model: string;
  contextWindowSize: number;
  turbo?: boolean;
  maxConcurrent?: number;
  minBatchSize?: number;
  maxBatchSize?: number;
  dependencyMode?: "strict" | "balanced" | "relaxed";
  checkpointMetadata?: {
    originalFile: string;
    originalProvider: string;
    originalModel?: string;
    originalArgs: Record<string, any>;
  };
  progressManager?: GlobalProgressManager;
  displayManager?: DisplayManager;
}) {
  const client = new OpenAI({ apiKey, baseURL });
  let totalTokens = 0;
  let totalCost = 0;
  let lastPercentage = 0;

  return async (code: string): Promise<string | VisitResult> => {
    // Create rate limit coordinator for this processing run
    // Shared across all parallel API requests to coordinate backoff
    const rateLimitCoordinator = new RateLimitCoordinator();

    const options: VisitOptions = {
      turbo,
      maxConcurrent,
      minBatchSize,
      maxBatchSize,
      dependencyMode,
      checkpointMetadata
    };

    // Create composite progress callback
    const onProgress = (percentage: number) => {
      // Call legacy progress display
      showPercentage(percentage);

      // Update display manager and progress manager if available
      if (progressManager && displayManager && progressManager.isInitialized()) {
        // Calculate identifiers completed based on percentage change
        const progress = progressManager.getProgress();
        const totalIdentifiers = progress.state.totalIdentifiers;
        const identifiersPerIteration = totalIdentifiers / progress.state.totalIterations;
        const identifiersCompleted = Math.round(percentage * identifiersPerIteration);
        const identifiersDelta = identifiersCompleted - Math.round(lastPercentage * identifiersPerIteration);

        if (identifiersDelta > 0) {
          // Update global progress
          progressManager.updateProgress(0, identifiersDelta);

          // Update display
          const currentProgress = progressManager.getProgress();
          displayManager.updateGlobalProgress(
            currentProgress.state.completedIdentifiers,
            currentProgress.state.totalIdentifiers,
            formatETA(currentProgress.etaSeconds)
          );
        }

        lastPercentage = percentage;
      }
    };

    const result = await visitAllIdentifiers(
      code,
      async (name, surroundingCode) => {
        verbose.log(`Renaming ${name}`);
        verbose.log("Context: ", surroundingCode);

        const response = await instrumentation.measure(
          "openai-api-call",
          () =>
            retryWithBackoff(
              () =>
                client.chat.completions.create(
                  toRenamePrompt(name, surroundingCode, model)
                ),
              rateLimitCoordinator
            ),
          {
            model,
            identifier: name,
            contextLength: surroundingCode.length
          }
        );

        if (response.usage) {
          totalTokens += response.usage.total_tokens;
          // Rough cost estimate for gpt-4o-mini: $0.15 per 1M input, $0.60 per 1M output
          const inputCost = (response.usage.prompt_tokens / 1_000_000) * 0.15;
          const outputCost =
            (response.usage.completion_tokens / 1_000_000) * 0.6;
          totalCost += inputCost + outputCost;
        }

        const result = response.choices[0].message?.content;
        if (!result) {
          throw new Error("Failed to rename", { cause: response });
        }
        const renamed = JSON.parse(result).newName;

        verbose.log(`Renamed ${name} → ${renamed}`);

        return renamed;
      },
      contextWindowSize,
      onProgress,
      options
    );

    // Log final stats
    if (instrumentation.isEnabled()) {
      const stats = rateLimitCoordinator.getStats();
      console.log(
        `\n=== OpenAI Usage ===\nTotal tokens: ${totalTokens.toLocaleString()}\nEstimated cost: $${totalCost.toFixed(4)}\nRate limits hit: ${stats.totalRateLimits}\n`
      );
    }

    // Return the VisitResult object (contains code and checkpointId)
    return result;
  };
}

function toRenamePrompt(
  name: string,
  context: string,
  model: string
): OpenAI.Chat.ChatCompletionCreateParamsNonStreaming {
  return {
    model,
    messages: [
      {
        role: "system",
        content: `You are an expert at reading minified javascript and generating clear, descriptive variable names.

Given a variable name and surrounding code context, suggest a better name that:
1. Clearly describes the variable's purpose
2. Follows camelCase convention
3. Is concise but descriptive
4. Matches the coding style of the context

Return ONLY a JSON object with a single "newName" field. No explanation.`,
      },
      {
        role: "user",
        content: `Variable: ${name}\n\nContext:\n${context}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "variable_rename",
        strict: true,
        schema: {
          type: "object",
          properties: {
            newName: {
              type: "string",
              description: "The new variable name",
            },
          },
          required: ["newName"],
          additionalProperties: false,
        },
      },
    },
  };
}
