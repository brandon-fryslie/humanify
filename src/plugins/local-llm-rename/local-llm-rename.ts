import { showPercentage } from "../../progress.js";
import { defineFilename } from "./define-filename.js";
import { Prompt } from "./llama.js";
import { unminifyVariableName } from "./unminify-variable-name.js";
import { visitAllIdentifiers, VisitOptions, VisitResult } from "./visit-all-identifiers.js";
import { GlobalProgressManager, formatETA } from "../../global-progress.js";
import { DisplayManager } from "../../display-manager.js";

const PADDING_CHARS = 200;

export const localReanme = (
  prompt: Prompt,
  contextWindowSize: number,
  turbo?: boolean,
  maxConcurrent?: number,
  minBatchSize?: number,
  maxBatchSize?: number,
  dependencyMode?: "strict" | "balanced" | "relaxed",
  checkpointMetadata?: {
    originalFile: string;
    originalProvider: string;
    originalModel?: string;
    originalArgs: Record<string, any>;
  },
  progressManager?: GlobalProgressManager,
  displayManager?: DisplayManager
) => {
  let lastPercentage = 0;

  return async (code: string): Promise<string | VisitResult> => {
    const filename = await defineFilename(
      prompt,
      code.slice(0, PADDING_CHARS * 2)
    );

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
      (name, surroundingCode) =>
        unminifyVariableName(prompt, name, filename, surroundingCode),
      contextWindowSize,
      onProgress,
      options
    );

    // Return the VisitResult object (contains code and checkpointId)
    return result;
  };
};
