import { showPercentage } from "../../progress.js";
import { defineFilename } from "./define-filename.js";
import { Prompt } from "./llama.js";
import { unminifyVariableName } from "./unminify-variable-name.js";
import { visitAllIdentifiers, VisitOptions, VisitResult } from "./visit-all-identifiers.js";

const PADDING_CHARS = 200;

export const localReanme = (
  prompt: Prompt,
  contextWindowSize: number,
  turbo?: boolean,
  maxConcurrent?: number,
  dependencyMode?: "strict" | "balanced" | "relaxed",
  checkpointMetadata?: {
    originalFile: string;
    originalProvider: string;
    originalModel?: string;
    originalArgs: Record<string, any>;
  }
) => {
  return async (code: string): Promise<string | VisitResult> => {
    const filename = await defineFilename(
      prompt,
      code.slice(0, PADDING_CHARS * 2)
    );

    const options: VisitOptions = {
      turbo,
      maxConcurrent,
      dependencyMode,
      checkpointMetadata
    };

    const result = await visitAllIdentifiers(
      code,
      (name, surroundingCode) =>
        unminifyVariableName(prompt, name, filename, surroundingCode),
      contextWindowSize,
      showPercentage,
      options
    );

    // Return the VisitResult object (contains code and checkpointId)
    return result;
  };
};
