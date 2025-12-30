/**
 * PASS ARGUMENT PARSER
 *
 * Parses --pass argument strings into PassConfig objects
 *
 * Syntax: processor:mode:concurrency[:filter][:options]
 *
 * Examples:
 *   rename:parallel:50
 *   rename:sequential:1:anchors
 *   refine:parallel:30:low-confidence:model=gpt-4o
 */

import { PassConfig } from "../ledger/events.js";

/**
 * Parse error with helpful message
 */
export class PassParseError extends Error {
  constructor(message: string, public readonly input: string) {
    super(message);
    this.name = "PassParseError";
  }
}

/**
 * Valid processor types
 */
const VALID_PROCESSORS = ["rename", "refine", "analyze", "transform"] as const;

/**
 * Valid execution modes
 */
const VALID_MODES = ["parallel", "streaming", "sequential"] as const;

/**
 * Valid filter types
 */
const VALID_FILTERS = ["anchors", "low-confidence", "all"] as const;

/**
 * Parse a single --pass argument into a PassConfig
 *
 * @param passArg - The pass argument string
 * @returns Parsed PassConfig
 * @throws PassParseError if syntax is invalid
 */
export function parsePassArg(passArg: string): PassConfig {
  const parts = passArg.split(":");

  if (parts.length < 3) {
    throw new PassParseError(
      `Pass argument must have at least 3 parts: processor:mode:concurrency. Got: "${passArg}"`,
      passArg
    );
  }

  const [processor, mode, concurrencyStr, filter, optionsStr] = parts;

  // Validate processor
  if (!VALID_PROCESSORS.includes(processor as any)) {
    throw new PassParseError(
      `Invalid processor: "${processor}". Valid options: ${VALID_PROCESSORS.join(", ")}`,
      passArg
    );
  }

  // Validate mode
  if (!VALID_MODES.includes(mode as any)) {
    throw new PassParseError(
      `Invalid mode: "${mode}". Valid options: ${VALID_MODES.join(", ")}`,
      passArg
    );
  }

  // Parse concurrency
  const concurrency = parseInt(concurrencyStr, 10);
  if (isNaN(concurrency) || concurrency < 1) {
    throw new PassParseError(
      `Invalid concurrency: "${concurrencyStr}". Must be a positive integer.`,
      passArg
    );
  }

  // Validate filter (optional)
  if (filter && !VALID_FILTERS.includes(filter as any)) {
    throw new PassParseError(
      `Invalid filter: "${filter}". Valid options: ${VALID_FILTERS.join(", ")}, or omit for no filter`,
      passArg
    );
  }

  // Parse options (optional)
  let model: string | undefined;
  if (optionsStr) {
    const options = parseOptions(optionsStr);
    model = options.model;
  }

  return {
    processor: processor as PassConfig["processor"],
    mode: mode as PassConfig["mode"],
    concurrency,
    filter: filter as PassConfig["filter"],
    model,
  };
}

/**
 * Parse options string like "model=gpt-4o,temp=0.7" into object
 */
function parseOptions(optionsStr: string): Record<string, string> {
  const options: Record<string, string> = {};

  const pairs = optionsStr.split(",");
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (!key || !value) {
      throw new PassParseError(
        `Invalid option format: "${pair}". Expected: key=value`,
        optionsStr
      );
    }
    options[key.trim()] = value.trim();
  }

  return options;
}

/**
 * Parse multiple --pass arguments
 *
 * @param passArgs - Array of pass argument strings
 * @returns Array of parsed PassConfig objects
 * @throws PassParseError if any argument is invalid
 */
export function parsePassArgs(passArgs: string[]): PassConfig[] {
  return passArgs.map((arg, index) => {
    try {
      return parsePassArg(arg);
    } catch (error) {
      if (error instanceof PassParseError) {
        throw new PassParseError(
          `Error in --pass argument #${index + 1}: ${error.message}`,
          arg
        );
      }
      throw error;
    }
  });
}

/**
 * Validate that pass arguments don't conflict with other flags
 *
 * Rules:
 * - Cannot mix --passes N with --pass "..."
 * - Cannot mix --preset NAME with --pass "..."
 */
export function validatePassFlags(opts: {
  passes?: number;
  pass?: string[];
  preset?: string;
}): void {
  const hasPassesFlag = opts.passes !== undefined;
  const hasPassFlag = opts.pass && opts.pass.length > 0;
  const hasPresetFlag = opts.preset !== undefined;

  if (hasPassesFlag && hasPassFlag) {
    throw new Error(
      "Cannot mix --passes and --pass flags. Use one or the other."
    );
  }

  if (hasPresetFlag && hasPassFlag) {
    throw new Error(
      "Cannot mix --preset and --pass flags. Use one or the other."
    );
  }
}

/**
 * Get helpful error message for common mistakes
 */
export function getPassSyntaxHelp(): string {
  return `
Pass Syntax: processor:mode:concurrency[:filter][:options]

Processors: ${VALID_PROCESSORS.join(", ")}
Modes: ${VALID_MODES.join(", ")}
Filters: ${VALID_FILTERS.join(", ")} (optional)
Options: key=value,key2=value2 (optional)

Examples:
  --pass "rename:parallel:50"
  --pass "rename:sequential:1:anchors"
  --pass "refine:parallel:30:low-confidence:model=gpt-4o"

Multiple passes:
  --pass "rename:parallel:50" --pass "refine:parallel:30"
`.trim();
}
