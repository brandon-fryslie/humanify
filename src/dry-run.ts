/**
 * Dry-run mode: Analyze input file and estimate cost/time without making API calls
 */

import { parse as parseSync } from "@babel/parser";
import * as babelTraverse from "@babel/traverse";
import * as fs from "fs/promises";

// Handle babel traverse import quirk
const traverse: typeof babelTraverse.default.default = (
  typeof babelTraverse.default === "function"
    ? babelTraverse.default
    : babelTraverse.default.default
) as any;

export interface DryRunResult {
  // File info
  fileSize: number;
  lines: number;

  // Identifier analysis
  identifiers: number;

  // Token estimates
  estimatedTokens: {
    min: number;
    max: number;
    avg: number;
  };

  // Cost estimates (in dollars)
  estimatedCost: {
    min: number;
    max: number;
    avg: number;
  };

  // Time estimates (in seconds)
  estimatedTime: {
    min: number;
    max: number;
  };

  // Memory estimates (in MB)
  estimatedMemory: {
    ast: number;
    dependencyGraph: number;
    peak: number;
  };

  // API call estimates
  apiCalls: number;
}

export interface DryRunOptions {
  provider: "openai" | "gemini" | "local";
  model: string;
  batchSize: number;
  contextWindowSize: number;
  turbo: boolean;
}

// Pricing per 1M tokens
const PRICING = {
  openai: {
    "gpt-4o-mini": { input: 0.15, output: 0.6 },
    "gpt-4o": { input: 2.5, output: 10.0 }
  },
  gemini: {
    "gemini-1.5-flash": { input: 0.075, output: 0.3 },
    "gemini-1.5-pro": { input: 1.25, output: 5.0 }
  },
  local: {
    llama: { input: 0, output: 0 }
  }
} as const;

// Average API latency (ms)
const AVG_LATENCY = {
  openai: 3000,
  gemini: 2500,
  local: 8000
} as const;

/**
 * Count binding identifiers in code
 */
function countIdentifiers(code: string): number {
  const ast = parseSync(code, {
    sourceType: "module",
    plugins: ["typescript"]
  });

  let count = 0;
  traverse(ast, {
    Identifier(path: any) {
      if (path.isBindingIdentifier()) {
        count++;
      }
    }
  });

  return count;
}

/**
 * Estimate tokens for identifiers based on context window
 */
function estimateTokens(
  identifierCount: number,
  contextWindowSize: number
): { min: number; max: number; avg: number } {
  // Conservative estimates based on context window
  const minTokensPerIdentifier = Math.min(200, contextWindowSize / 4);
  const maxTokensPerIdentifier = Math.min(800, contextWindowSize);
  const avgTokensPerIdentifier = Math.min(400, contextWindowSize / 2);

  return {
    min: identifierCount * minTokensPerIdentifier,
    max: identifierCount * maxTokensPerIdentifier,
    avg: identifierCount * avgTokensPerIdentifier
  };
}

/**
 * Calculate cost based on token usage and pricing
 */
function calculateCost(
  tokens: { min: number; max: number; avg: number },
  provider: "openai" | "gemini" | "local",
  model: string
): { min: number; max: number; avg: number } {
  // Get pricing for the provider/model
  let pricing = { input: 0, output: 0 };

  if (provider === "openai") {
    pricing =
      PRICING.openai[model as keyof typeof PRICING.openai] ||
      PRICING.openai["gpt-4o-mini"];
  } else if (provider === "gemini") {
    pricing =
      PRICING.gemini[model as keyof typeof PRICING.gemini] ||
      PRICING.gemini["gemini-1.5-flash"];
  } else if (provider === "local") {
    return { min: 0, max: 0, avg: 0 };
  }

  // Assume roughly equal input/output tokens
  const calcCost = (tokenCount: number) => {
    const inputCost = (tokenCount * pricing.input) / 1_000_000;
    const outputCost = (tokenCount * pricing.output) / 1_000_000;
    return inputCost + outputCost;
  };

  return {
    min: calcCost(tokens.min),
    max: calcCost(tokens.max),
    avg: calcCost(tokens.avg)
  };
}

/**
 * Estimate processing time
 */
function estimateTime(
  identifierCount: number,
  batchSize: number,
  provider: "openai" | "gemini" | "local",
  turbo: boolean
): { min: number; max: number } {
  const avgLatency = AVG_LATENCY[provider];
  const apiCalls = Math.ceil(identifierCount / batchSize);

  if (turbo) {
    // With turbo mode, calls are parallelized
    const minTime = (apiCalls * avgLatency) / 1000 / 2; // Optimistic
    const maxTime = (apiCalls * avgLatency) / 1000; // Conservative
    return { min: minTime, max: maxTime };
  } else {
    // Sequential processing
    const totalTime = (apiCalls * avgLatency) / 1000;
    return { min: totalTime, max: totalTime * 1.2 };
  }
}

/**
 * Estimate memory usage
 */
function estimateMemory(fileSize: number, identifierCount: number) {
  // AST is typically 10-20x the file size
  const astMB = (fileSize * 15) / 1024 / 1024;

  // Dependency graph scales with identifier count
  // ~10KB per identifier for a dense graph
  const graphMB = (identifierCount * 10000) / 1024 / 1024;

  // Peak memory is AST + graph + working memory
  const peakMB = astMB + graphMB + 100; // 100MB overhead

  return {
    ast: astMB,
    dependencyGraph: graphMB,
    peak: peakMB
  };
}

/**
 * Perform dry-run analysis on a file
 */
export async function dryRun(
  filename: string,
  options: DryRunOptions
): Promise<DryRunResult> {
  // Read file
  const code = await fs.readFile(filename, "utf-8");
  const fileSize = code.length;
  const lines = code.split("\n").length;

  // Count identifiers
  const identifiers = countIdentifiers(code);

  // Calculate API calls
  const apiCalls = Math.ceil(identifiers / options.batchSize);

  // Estimate tokens
  const estimatedTokens = estimateTokens(identifiers, options.contextWindowSize);

  // Calculate cost
  const estimatedCost = calculateCost(
    estimatedTokens,
    options.provider,
    options.model
  );

  // Estimate time
  const estimatedTime = estimateTime(
    identifiers,
    options.batchSize,
    options.provider,
    options.turbo
  );

  // Estimate memory
  const estimatedMemory = estimateMemory(fileSize, identifiers);

  return {
    fileSize,
    lines,
    identifiers,
    estimatedTokens,
    estimatedCost,
    estimatedTime,
    estimatedMemory,
    apiCalls
  };
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Format time duration
 */
function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}m ${secs}s`;
}

/**
 * Print dry-run results to console
 */
export function printDryRunResults(
  filename: string,
  options: DryRunOptions,
  result: DryRunResult
): void {
  console.log("\n🔍 Dry-run analysis for:", filename);
  console.log("━".repeat(70));

  console.log("\nFile Information:");
  console.log(`  Size:                  ${formatFileSize(result.fileSize)}`);
  console.log(`  Lines:                 ${result.lines.toLocaleString()}`);
  console.log(`  Estimated identifiers: ${result.identifiers.toLocaleString()}`);

  console.log("\nProcessing Configuration:");
  console.log(`  Provider:              ${options.provider} (${options.model})`);
  console.log(`  Turbo mode:            ${options.turbo ? "Enabled" : "Disabled"}`);
  console.log(`  Batch size:            ${options.batchSize}`);
  console.log(
    `  Context window:        ${options.contextWindowSize.toLocaleString()} chars`
  );

  console.log("\nAPI Call Estimates:");
  console.log(`  Total API calls:       ${result.apiCalls.toLocaleString()}`);
  console.log(
    `  Avg tokens/call:       ${Math.floor(result.estimatedTokens.avg / result.apiCalls).toLocaleString()}`
  );
  console.log(
    `  Total tokens:          ${result.estimatedTokens.avg.toLocaleString()}`
  );

  console.log("\nCost Estimates:");
  console.log(
    `  Input tokens:          ${Math.floor(result.estimatedTokens.avg / 2).toLocaleString()} @ $${options.provider === "openai" ? "0.150" : "0.075"}/1M`
  );
  console.log(
    `  Output tokens:         ${Math.floor(result.estimatedTokens.avg / 2).toLocaleString()} @ $${options.provider === "openai" ? "0.600" : "0.300"}/1M`
  );
  console.log(`  Min cost:              $${result.estimatedCost.min.toFixed(2)}`);
  console.log(`  Avg cost:              $${result.estimatedCost.avg.toFixed(2)}`);
  console.log(`  Max cost:              $${result.estimatedCost.max.toFixed(2)}`);

  console.log("\nTime Estimates:");
  console.log(
    `  Min time:              ${formatTime(result.estimatedTime.min)}`
  );
  console.log(
    `  Max time:              ${formatTime(result.estimatedTime.max)}`
  );

  console.log("\nMemory Estimates:");
  console.log(`  AST size:              ~${result.estimatedMemory.ast.toFixed(0)}MB`);
  console.log(
    `  Dependency graph:      ~${result.estimatedMemory.dependencyGraph.toFixed(0)}MB`
  );
  console.log(
    `  Peak memory:           ~${result.estimatedMemory.peak.toFixed(0)}MB`
  );

  if (result.identifiers > 1000 || result.estimatedCost.avg > 50) {
    console.log("\n⚠️  RECOMMENDATIONS:");
    if (result.identifiers > 1000) {
      console.log("  • This is a LARGE file - consider testing with a smaller sample first");
    }
    if (result.estimatedCost.avg > 50) {
      console.log(
        `  • Estimated cost is $${result.estimatedCost.avg.toFixed(2)} - ensure you have budget approval`
      );
    }
    if (result.estimatedMemory.peak > 4000) {
      console.log(
        `  • High memory usage expected (${result.estimatedMemory.peak.toFixed(0)}MB) - consider increasing Node heap size`
      );
    }
  }

  console.log("\n━".repeat(70));
}
