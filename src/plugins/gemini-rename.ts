import {
  visitAllIdentifiers,
  VisitOptions
} from "./local-llm-rename/visit-all-identifiers.js";
import { verbose } from "../verbose.js";
import { showPercentage } from "../progress.js";
import {
  GoogleGenerativeAI,
  ModelParams,
  SchemaType
} from "@google/generative-ai";
import { RateLimitCoordinator } from "../rate-limit-coordinator.js";

/**
 * Retry an API call with exponential backoff on rate limits.
 * Similar to OpenAI retry logic but adapted for Gemini errors.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  coordinator: RateLimitCoordinator,
  maxRetries: number = 500
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Check global rate limit state before attempting
    await coordinator.checkAndWait();

    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error (Gemini uses 429 or RESOURCE_EXHAUSTED)
      const isRateLimit =
        error?.status === 429 ||
        error?.statusCode === 429 ||
        error?.code === "RESOURCE_EXHAUSTED" ||
        error?.message?.includes("quota") ||
        error?.message?.includes("rate limit");

      if (isRateLimit) {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s (capped at 60s)
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 60000);

        if (attempt < maxRetries) {
          // Notify coordinator to pause ALL parallel requests
          coordinator.notifyRateLimit(delayMs);

          // Wait for coordinator's pause to expire
          await coordinator.checkAndWait();

          continue;
        } else {
          console.error(`\n❌ FATAL: Max retries (${maxRetries}) exceeded after rate limiting.`);
          console.error(`   This should never happen with 500 retries!`);
          console.error(`   Your Gemini rate limits may be exhausted for an extended period.`);
          console.error(`   Check your usage at: https://aistudio.google.com/`);
        }
      }

      // Not a rate limit error or max retries exceeded
      throw error;
    }
  }

  throw lastError;
}

export function geminiRename({
  apiKey,
  model: modelName,
  contextWindowSize,
  turbo,
  maxConcurrent,
  dependencyMode
}: {
  apiKey: string;
  model: string;
  contextWindowSize: number;
  turbo?: boolean;
  maxConcurrent?: number;
  dependencyMode?: "strict" | "balanced" | "relaxed";
}) {
  const client = new GoogleGenerativeAI(apiKey);

  return async (code: string): Promise<string> => {
    // Create rate limit coordinator for this processing run
    // Shared across all parallel API requests to coordinate backoff
    const rateLimitCoordinator = new RateLimitCoordinator();

    const options: VisitOptions = {
      turbo,
      maxConcurrent,
      dependencyMode
    };

    return await visitAllIdentifiers(
      code,
      async (name, surroundingCode) => {
        verbose.log(`Renaming ${name}`);
        verbose.log("Context: ", surroundingCode);

        const model = client.getGenerativeModel(
          toRenameParams(name, modelName)
        );

        const result = await retryWithBackoff(
          () => model.generateContent(surroundingCode),
          rateLimitCoordinator
        );

        const renamed = JSON.parse(result.response.text()).newName;

        verbose.log(`Renamed to ${renamed}`);

        return renamed;
      },
      contextWindowSize,
      showPercentage,
      options
    );
  };
}

function toRenameParams(name: string, model: string): ModelParams {
  return {
    model,
    systemInstruction: `Rename Javascript variables/function \`${name}\` to have descriptive name based on their usage in the code."`,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        nullable: false,
        description: "The new name for the variable/function",
        type: SchemaType.OBJECT,
        properties: {
          newName: {
            type: SchemaType.STRING,
            nullable: false,
            description: `The new name for the variable/function called \`${name}\``
          }
        },
        required: ["newName"]
      }
    }
  };
}
