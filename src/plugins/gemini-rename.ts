import {
  visitAllIdentifiers,
  VisitOptions,
  VisitResult
} from "./local-llm-rename/visit-all-identifiers.js";
import { verbose } from "../verbose.js";
import { showPercentage } from "../progress.js";
import {
  GoogleGenerativeAI,
  ModelParams,
  SchemaType
} from "@google/generative-ai";
import { RateLimitCoordinator } from "../rate-limit-coordinator.js";
import { GlobalProgressManager, formatETA } from "../global-progress.js";
import { DisplayManager } from "../display-manager.js";

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
  minBatchSize,
  maxBatchSize,
  dependencyMode,
  checkpointMetadata,
  progressManager,
  displayManager
}: {
  apiKey: string;
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
  const client = new GoogleGenerativeAI(apiKey);
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
      onProgress,
      options
    );

    // Return the VisitResult object (contains code and checkpointId)
    return result;
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
