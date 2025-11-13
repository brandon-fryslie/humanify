import OpenAI from "openai";
import {
  visitAllIdentifiers,
  VisitOptions
} from "../local-llm-rename/visit-all-identifiers.js";
import { showPercentage } from "../../progress.js";
import { verbose } from "../../verbose.js";
import { instrumentation } from "../../instrumentation.js";

/**
 * Retry an API call with exponential backoff on rate limits.
 * Handles both request-per-minute (RPM) and tokens-per-minute (TPM) limits.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 10
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
          const delaySeconds = (delayMs / 1000).toFixed(1);
          console.log(`\n⚠️  Rate limit hit (attempt ${attempt + 1}/${maxRetries})`);
          console.log(`    Waiting ${delaySeconds}s before retry...`);

          // Show rate limit details if available
          if (error.headers?.["x-ratelimit-remaining-tokens"] !== undefined) {
            console.log(`    Tokens remaining: ${error.headers["x-ratelimit-remaining-tokens"]}/${error.headers["x-ratelimit-limit-tokens"]}`);
          }
          if (error.headers?.["x-ratelimit-remaining-requests"] !== undefined) {
            console.log(`    Requests remaining: ${error.headers["x-ratelimit-remaining-requests"]}/${error.headers["x-ratelimit-limit-requests"]}`);
          }

          await new Promise(resolve => setTimeout(resolve, delayMs));
          console.log(`    Resuming...`);
          continue;
        } else {
          console.error(`\n❌ Max retries (${maxRetries}) exceeded after rate limiting.`);
          console.error(`   Consider reducing --max-concurrent or processing in smaller batches.`);
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
  dependencyMode
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
}) {
  const client = new OpenAI({ apiKey, baseURL });
  let totalTokens = 0;
  let totalCost = 0;

  return async (code: string): Promise<string> => {
    const options: VisitOptions = {
      turbo,
      maxConcurrent,
      minBatchSize,
      maxBatchSize,
      dependencyMode
    };

    return await visitAllIdentifiers(
      code,
      async (name, surroundingCode) => {
        verbose.log(`Renaming ${name}`);
        verbose.log("Context: ", surroundingCode);

        const response = await instrumentation.measure(
          "openai-api-call",
          () =>
            retryWithBackoff(() =>
              client.chat.completions.create(
                toRenamePrompt(name, surroundingCode, model)
              )
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
      showPercentage,
      options
    ).then((result) => {
      // Log final stats
      if (instrumentation.isEnabled()) {
        console.log(
          `\n=== OpenAI Usage ===\nTotal tokens: ${totalTokens.toLocaleString()}\nEstimated cost: $${totalCost.toFixed(4)}\n`
        );
      }
      return result;
    });
  };
}

function toRenamePrompt(
  name: string,
  surroundingCode: string,
  model: string
): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
  return {
    model,
    messages: [
      {
        role: "system",
        content: `Rename Javascript variables/function \`${name}\` to have descriptive name based on their usage in the code."`
      },
      {
        role: "user",
        content: surroundingCode
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        strict: true,
        name: "rename",
        schema: {
          type: "object",
          properties: {
            newName: {
              type: "string",
              description: `The new name for the variable/function called \`${name}\``
            }
          },
          required: ["newName"],
          additionalProperties: false
        }
      }
    }
  };
}
