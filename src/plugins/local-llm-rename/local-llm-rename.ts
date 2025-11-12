import { showPercentage } from "../../progress.js";
import { defineFilename } from "./define-filename.js";
import { Prompt } from "./llama.js";
import { unminifyVariableName } from "./unminify-variable-name.js";
import { visitAllIdentifiers, VisitOptions } from "./visit-all-identifiers.js";

const PADDING_CHARS = 200;

export const localReanme = (
  prompt: Prompt,
  contextWindowSize: number,
  turbo?: boolean,
  maxConcurrent?: number,
  dependencyMode?: "strict" | "balanced" | "relaxed"
) => {
  return async (code: string): Promise<string> => {
    const filename = await defineFilename(
      prompt,
      code.slice(0, PADDING_CHARS * 2)
    );

    const options: VisitOptions = {
      turbo,
      maxConcurrent,
      dependencyMode
    };

    return await visitAllIdentifiers(
      code,
      (name, surroundingCode) =>
        unminifyVariableName(prompt, name, filename, surroundingCode),
      contextWindowSize,
      showPercentage,
      options
    );
  };
};
