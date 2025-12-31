/**
 * TURBO V2 CLI INTEGRATION
 *
 * Entry point for --turbo-v2 mode
 * Integrates multi-pass orchestrator with Commander.js CLI
 */

import { MultiPass } from "../orchestrator/multi-pass.js";
import { Vault } from "../vault/vault.js";
import { VaultEviction, DEFAULT_EVICTION_CONFIG } from "../vault/eviction.js";
import { Ledger } from "../ledger/ledger.js";
import { PassConfig, JobConfig } from "../ledger/events.js";
import { ProgressRenderer } from "../ui/progress-renderer.js";
import { MetricsCollector } from "../metrics/metrics-collector.js";
import { ProcessorFunction } from "../orchestrator/pass-engine.js";
import { parsePassArgs, validatePassFlags } from "./pass-parser.js";
import { getPreset, isValidPreset } from "./presets.js";
import { createHash } from "crypto";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

/**
 * Options for turbo-v2 execution
 */
export interface TurboV2Options {
  inputPath: string;
  outputDir: string;
  provider: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;

  // Pass configuration
  passes?: number;
  pass?: string[];
  preset?: string;

  // Checkpointing
  checkpointDir?: string;
  fresh?: boolean;

  // Vault
  vaultMaxSize?: number; // Max vault size in bytes (default: 1GB)

  // UI
  quiet?: boolean;
  verbose?: boolean;
  noColor?: boolean;

  // Advanced
  contextSize?: number;
  maxConcurrent?: number;
}

/**
 * Processor type determines the prompt strategy
 */
type ProcessorType = "rename" | "refine" | "analyze" | "transform";

/**
 * Build prompt based on processor type
 */
function buildPrompt(type: ProcessorType, name: string, context: string): string {
  switch (type) {
    case "rename":
      return `You are renaming a JavaScript identifier in deobfuscated code.

Current name: ${name}
Surrounding code:
${context}

ANALYZE the code to understand:
1. What is the PURPOSE of the containing function or block?
2. What role does this identifier play? (input, output, counter, flag, handler, etc.)
3. What domain is this code in? (chart rendering, network requests, form handling, animation, etc.)

Provide a SEMANTIC variable name that describes what this identifier represents.
- Use camelCase
- Be specific: "userEmailList" not just "list"
- Describe purpose: "retryAttemptCount" not just "count"
- Consider the domain context

Respond with JSON: { "name": "<new_name>", "confidence": <0-1> }`;

    case "refine":
      return `You are reviewing a JavaScript identifier that was renamed in an earlier pass.

Current name: ${name}
Surrounding code (with other renamed identifiers now visible):
${context}

ANALYSIS INSTRUCTIONS:
1. What is the PURPOSE of the function or block containing this identifier?
2. What does this identifier REPRESENT in that context?
3. How is it USED - is it input data, output, a counter, a flag, a handler, etc.?

NAMING DECISION:
- If the name clearly describes its purpose and role → keep it
- If the name is vague, generic, or doesn't capture the semantic meaning → improve it
- Be AGGRESSIVE about improving unclear names like "data", "value", "item", "result", "temp", "obj", "handler", "callback", "config"
- Name should describe WHAT IT IS, not just WHAT TYPE it is (e.g., "userList" not "array", "retryCount" not "counter")
- Consider the domain: is this a chart, animation, network request, form validation, etc.?

Respond with JSON: { "name": "<name>", "confidence": <0-1>, "action": "keep" | "improve" }`;

    case "analyze":
      // Analyze doesn't rename, just returns the same name with metadata
      return `Analyze this JavaScript identifier for importance.

Name: ${name}
Context:
${context}

Respond with JSON: { "name": "${name}", "confidence": 1, "importance": "high" | "medium" | "low" }`;

    case "transform":
      // Transform applies rules, no LLM needed - just return unchanged
      return "";

    default:
      return buildPrompt("rename", name, context);
  }
}

/**
 * Create a processor function for the given provider and type
 */
async function createProcessor(
  options: TurboV2Options,
  processorType: ProcessorType = "rename"
): Promise<ProcessorFunction> {
  const { provider, model, apiKey, baseURL } = options;

  // Transform doesn't need LLM
  if (processorType === "transform") {
    return async (name: string, _context: string) => ({
      newName: name,
      confidence: 1,
    });
  }

  // ============================================================
  // OPENAI PROVIDER
  // ============================================================
  if (provider === "openai") {
    const { default: OpenAI } = await import("openai");

    const openai = new OpenAI({
      apiKey: apiKey!,
      baseURL: baseURL,
    });

    const modelName = model ?? "gpt-4o-mini";

    return async (name: string, context: string): Promise<{ newName: string; confidence: number; tokens?: { prompt: number; completion: number; total: number } }> => {
      try {
        const prompt = buildPrompt(processorType, name, context);

        const response = await openai.chat.completions.create({
          model: modelName,
          messages: [{ role: "user", content: prompt }],
          temperature: processorType === "refine" ? 0.4 : 0.3,
          max_tokens: 100,
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response from OpenAI");
        }

        const parsed = JSON.parse(content);

        const tokens = response.usage
          ? {
              prompt: response.usage.prompt_tokens,
              completion: response.usage.completion_tokens,
              total: response.usage.total_tokens,
            }
          : undefined;

        return {
          newName: parsed.name || name,
          confidence: parsed.confidence ?? 0.5,
          tokens,
        };
      } catch (error: any) {
        console.warn(`Failed to ${processorType} ${name}: ${error.message}`);
        return {
          newName: name,
          confidence: 0,
        };
      }
    };
  }

  // ============================================================
  // Z.AI PROVIDER (GLM models via OpenAI-compatible API)
  // ============================================================
  if (provider === "zai") {
    const { default: OpenAI } = await import("openai");

    const openai = new OpenAI({
      apiKey: apiKey!,
      baseURL: baseURL ?? "https://api.z.ai/api/coding/paas/v4",
    });

    const modelName = model ?? "GLM-4.7";

    return async (name: string, context: string): Promise<{ newName: string; confidence: number; tokens?: { prompt: number; completion: number; total: number } }> => {
      const maxRetries = 3;
      let lastError: any;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Use simplified prompt for z.ai - ask for JSON FIRST before any reasoning
          const prompt = `OUTPUT THIS EXACT FORMAT FIRST (fill in the values):
{"name": "newVariableName", "confidence": 0.85}

Then you may explain your reasoning.

Task: Rename JavaScript variable "${name}" to a semantic name.
Context:
${context}

Use camelCase. Be specific.`;

          // z.ai GLM-4.7 uses reasoning mode - needs many more tokens
          // because it reasons at length before outputting the JSON
          const response = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: prompt }],
            temperature: processorType === "refine" ? 0.4 : 0.3,
            max_tokens: 1500, // GLM-4.7 reasons at length before outputting
          });

          // GLM-4.7 puts response in reasoning_content, not content
          const message = response.choices[0]?.message as any;
          let content = message?.content || message?.reasoning_content || "";

          if (!content) {
            throw new Error("Empty response from z.ai");
          }


        // Extract JSON from the response (may be in markdown code blocks or at end of reasoning)
        let parsed: any;

        // Try to find JSON in code blocks first (handles ```json, ```javascript, or just ```)
        const codeBlockMatch = content.match(/```(?:json|javascript)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          const codeContent = codeBlockMatch[1].trim();
          // If it starts with {, try to parse directly
          if (codeContent.startsWith('{')) {
            parsed = JSON.parse(codeContent);
          } else {
            // Look for JSON object within the code block
            const jsonInBlock = codeContent.match(/\{[\s\S]*"name"[\s\S]*\}/);
            if (jsonInBlock) {
              parsed = JSON.parse(jsonInBlock[0]);
            }
          }
        }

        // If no valid JSON found in code blocks, search for JSON pattern
        if (!parsed) {
          // Try to extract name directly using regex (more robust than JSON parsing)
          const nameMatch = content.match(/"name"\s*:\s*"([^"]+)"/);
          const confMatch = content.match(/"confidence"\s*:\s*([\d.]+)/);

          if (nameMatch) {
            // Found name, use it even if full JSON parsing fails
            parsed = {
              name: nameMatch[1],
              confidence: confMatch ? parseFloat(confMatch[1]) : 0.5,
            };
          } else {
            // Try full JSON object parsing as fallback
            const jsonMatch = content.match(/\{[^{}]*"name"\s*:\s*"[^"]+"/);
            if (jsonMatch) {
              const startIdx = content.indexOf(jsonMatch[0]);
              let braceCount = 0;
              let endIdx = startIdx;
              for (let i = startIdx; i < content.length; i++) {
                if (content[i] === '{') braceCount++;
                if (content[i] === '}') braceCount--;
                if (braceCount === 0) {
                  endIdx = i + 1;
                  break;
                }
              }
              try {
                parsed = JSON.parse(content.substring(startIdx, endIdx));
              } catch {
                // JSON parsing failed, try regex extraction
                const innerNameMatch = content.substring(startIdx).match(/"name"\s*:\s*"([^"]+)"/);
                if (innerNameMatch) {
                  parsed = { name: innerNameMatch[1], confidence: 0.5 };
                }
              }
            }

            if (!parsed) {
              throw new Error("Could not find JSON in z.ai response");
            }
          }
        }

        const tokens = response.usage
          ? {
              prompt: response.usage.prompt_tokens,
              completion: response.usage.completion_tokens,
              total: response.usage.total_tokens,
            }
          : undefined;

          return {
            newName: parsed.name || name,
            confidence: parsed.confidence ?? 0.5,
            tokens,
          };
        } catch (error: any) {
          lastError = error;

          // Retry on rate limiting (429)
          if (error.status === 429 || error.message?.includes('429')) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000) + Math.random() * 1000;
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }

          // Don't retry on other errors
          break;
        }
      }

      // All retries exhausted
      console.warn(`[z.ai] Failed to ${processorType} ${name}: ${lastError?.message || 'Unknown error'}`);
      return {
        newName: name,
        confidence: 0,
      };
    };
  }

  // ============================================================
  // OTHER PROVIDERS (not yet implemented)
  // ============================================================
  if (provider === "gemini") {
    throw new Error("Gemini provider not yet supported in turbo-v2 mode. Use --provider openai or --provider zai.");
  }

  if (provider === "local") {
    throw new Error("Local provider not yet supported in turbo-v2 mode. Use --provider openai or --provider zai.");
  }

  throw new Error(`Unknown provider: ${provider}. Supported: openai, zai`);
}

/**
 * Create processors for each pass type in the pipeline
 */
async function createProcessors(
  options: TurboV2Options,
  passConfigs: PassConfig[]
): Promise<Map<ProcessorType, ProcessorFunction>> {
  const processors = new Map<ProcessorType, ProcessorFunction>();
  const neededTypes = new Set(passConfigs.map((p) => p.processor as ProcessorType));

  for (const type of neededTypes) {
    processors.set(type, await createProcessor(options, type));
  }

  return processors;
}

/**
 * Result of turbo-v2 execution
 */
export interface TurboV2Result {
  jobId: string;
  jobDir: string;
  success: boolean;
  outputPath?: string;
  durationMs?: number;
}

/**
 * Execute turbo-v2 pipeline
 */
export async function executeTurboV2(options: TurboV2Options): Promise<TurboV2Result> {
  // Validate flag combinations
  validatePassFlags({
    passes: options.passes,
    pass: options.pass,
    preset: options.preset,
  });

  // Determine pass configuration
  const passConfigs = determinePassConfigs(options);

  // Setup infrastructure
  const checkpointDir = options.checkpointDir ?? ".humanify-checkpoints";
  const vaultDir = ".humanify-cache/vault";
  const jobId = generateJobId(options.inputPath, passConfigs);
  const jobDir = join(checkpointDir, jobId);

  // Create job directory if it doesn't exist
  if (!existsSync(jobDir)) {
    mkdirSync(jobDir, { recursive: true });
  }

  // Initialize vault and eviction
  const vault = new Vault(vaultDir);
  const eviction = new VaultEviction(vaultDir, {
    maxSize: options.vaultMaxSize ?? DEFAULT_EVICTION_CONFIG.maxSize,
  });

  // Check vault size and evict if needed
  if (eviction.needsEviction()) {
    if (!options.quiet) {
      console.log("[turbo-v2] Vault size exceeded threshold, running eviction...");
    }
    const evictionStats = eviction.evict();
    if (!options.quiet) {
      console.log(`[turbo-v2] ${VaultEviction.formatStats(evictionStats)}`);
    }
  }

  // Display vault stats if verbose
  if (options.verbose) {
    const stats = eviction.getStats();
    console.log(`[turbo-v2] Vault: ${VaultEviction.formatSize(stats.vaultSize)} / ${stats.entryCount} entries`);
  }

  // Initialize other components
  const ledger = new Ledger(jobDir);
  const metrics = new MetricsCollector({
    outputDir: join(jobDir, "logs"),
    quiet: options.quiet,
    verbose: options.verbose,
  });
  const renderer = new ProgressRenderer({
    quiet: options.quiet ?? false,
    noColor: options.noColor ?? false,
  });

  // Build job config
  const jobConfig: JobConfig = {
    inputPath: options.inputPath,
    outputPath: options.outputDir,
    passes: passConfigs.length,
    provider: options.provider,
    model: options.model,
    concurrency: options.maxConcurrent,
    checkpointDir,
  };

  // Create processor functions for each pass type in the pipeline
  const processors = await createProcessors(options, passConfigs);

  // Create multi-pass orchestrator
  const multiPass = new MultiPass(vault, ledger, {
    passes: passConfigs,
    jobId,
    inputPath: options.inputPath,
    outputDir: options.outputDir,
    snapshotsDir: join(jobDir, "snapshots"),
    maxGlossarySize: 100,
    onProgress: (passNumber, processed, total) => {
      renderer.updatePass(passNumber, processed, total);
    },
  });

  try {
    // Display initial info
    if (!options.quiet) {
      console.log(`\n[turbo-v2] Starting job: ${jobId}`);
      console.log(`  Input: ${options.inputPath}`);
      console.log(`  Passes: ${passConfigs.length}`);
      console.log(`  Pipeline: ${passConfigs.map(p => p.processor).join(" → ")}`);
      console.log(`  Provider: ${options.provider} (${options.model ?? "default"})`);
      console.log();
    }

    // Execute pipeline
    renderer.start();
    const result = await multiPass.execute(processors);
    renderer.complete();

    // Display summary
    if (!options.quiet) {
      console.log(`\n[turbo-v2] Job complete`);
      console.log(`  Output: ${result.finalSnapshotPath}`);
      console.log(`  Duration: ${(result.totalDurationMs / 1000).toFixed(1)}s`);
      console.log(`  Success: ${result.success}`);
    }

    // Export metrics if verbose
    if (options.verbose) {
      const metricsPath = join(jobDir, "logs", "metrics.jsonl");
      metrics.export(metricsPath);
      console.log(`\n  Metrics exported to: ${metricsPath}`);
    }

    if (!result.success) {
      process.exit(1);
    }

    // Return result for callers (like the webapp)
    return {
      jobId,
      jobDir,
      success: result.success,
      outputPath: result.finalSnapshotPath,
      durationMs: result.totalDurationMs,
    };
  } catch (error: any) {
    renderer.error(error.message);

    if (options.verbose && error.stack) {
      console.error(`\nStack trace:\n${error.stack}`);
    }

    // Return failure result
    return {
      jobId,
      jobDir,
      success: false,
    };
  }
}

/**
 * Determine pass configuration from CLI options
 */
function determinePassConfigs(options: TurboV2Options): PassConfig[] {
  // Priority: --pass > --preset > --passes > default

  // Case 1: Explicit --pass arguments
  if (options.pass && options.pass.length > 0) {
    return parsePassArgs(options.pass);
  }

  // Case 2: Preset
  if (options.preset) {
    const preset = getPreset(options.preset);
    if (!preset) {
      throw new Error(
        `Unknown preset: "${options.preset}". Use --help to see available presets.`
      );
    }
    return preset;
  }

  // Case 3: --passes N (generate N identical rename passes)
  if (options.passes && options.passes > 0) {
    const passes: PassConfig[] = [];
    for (let i = 0; i < options.passes; i++) {
      passes.push({
        processor: "rename",
        mode: "parallel",
        concurrency: options.maxConcurrent ?? 50,
      });
    }
    return passes;
  }

  // Case 4: Default (fast preset = 2-pass parallel)
  return getPreset("fast")!;
}

/**
 * Generate unique job ID from input and configuration
 */
function generateJobId(inputPath: string, passConfigs: PassConfig[]): string {
  // Read input file to get content hash
  const inputContent = readFileSync(inputPath, "utf-8");
  const inputHash = createHash("sha256")
    .update(inputContent)
    .digest("hex")
    .substring(0, 12);

  // Hash pass configuration
  const configStr = JSON.stringify(passConfigs);
  const configHash = createHash("sha256")
    .update(configStr)
    .digest("hex")
    .substring(0, 8);

  // Timestamp for uniqueness
  const timestamp = Date.now().toString(36);

  return `${inputHash}-${configHash}-${timestamp}`;
}
