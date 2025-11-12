import OpenAI from "openai";
import {
  visitAllIdentifiers,
  VisitOptions
} from "../local-llm-rename/visit-all-identifiers.js";
import { showPercentage } from "../../progress.js";
import { verbose } from "../../verbose.js";
import { instrumentation } from "../../instrumentation.js";

/**
 * Retry an API call with exponential backoff on rate limits
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error
      if (error?.status === 429 || error?.code === "rate_limit_exceeded") {
        // Extract retry delay from headers or use exponential backoff
        let delayMs: number;

        if (error.headers?.["retry-after-ms"]) {
          delayMs = parseInt(error.headers["retry-after-ms"], 10);
        } else if (error.headers?.["retry-after"]) {
          delayMs = parseInt(error.headers["retry-after"], 10) * 1000;
        } else {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          delayMs = Math.min(1000 * Math.pow(2, attempt), 30000);
        }

        if (attempt < maxRetries) {
          verbose.log(`Rate limit hit, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
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
