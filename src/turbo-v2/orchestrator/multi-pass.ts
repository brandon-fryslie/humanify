/**
 * MULTI-PASS ORCHESTRATOR: N-Pass Sequential Processing
 *
 * Purpose: Coordinate multiple passes with snapshot handoff and glossary injection
 *
 * Key Responsibilities:
 * - Run N passes sequentially
 * - Each pass reads from previous pass's snapshot
 * - Build glossary from previous pass renames
 * - Inject glossary into prompts for context
 * - Pre-compute total work before starting
 * - Track cumulative progress across all passes
 *
 * Core Insight:
 * Pass 2 sees ALL of Pass 1's renames in the glossary, giving it full context
 * to make better naming decisions.
 */

import { PassEngine, ProcessorFunction, PassResult } from "./pass-engine.js";
import { Vault } from "../vault/vault.js";
import { Ledger } from "../ledger/ledger.js";
import { Analyzer } from "../analyzer/analyzer.js";
import {
  PassConfig,
  SnapshotCreatedEvent,
  JobStartedEvent,
  JobCompletedEvent,
  JobConfig,
} from "../ledger/events.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { createHash } from "crypto";

/**
 * Glossary entry: oldName -> newName mapping with reference count
 */
export interface GlossaryEntry {
  oldName: string;
  newName: string;
  references: number;
  confidence: number;
}

/**
 * Multi-pass configuration
 */
export interface MultiPassConfig {
  passes: PassConfig[]; // Configuration for each pass
  jobId: string;
  inputPath: string;
  outputDir: string;
  snapshotsDir: string;
  maxGlossarySize?: number; // Max glossary entries to include (default: 100)
  onProgress?: (passNumber: number, processed: number, total: number) => void;
}

/**
 * Multi-pass result
 */
export interface MultiPassResult {
  finalSnapshotPath: string;
  finalSnapshotHash: string;
  totalPasses: number;
  totalDurationMs: number;
  passResults: PassResult[];
  success: boolean;
}

/**
 * MultiPass: Orchestrate N sequential passes with glossary injection
 */
export class MultiPass {
  private vault: Vault;
  private ledger: Ledger;
  private analyzer: Analyzer;
  private config: Required<MultiPassConfig>;

  constructor(vault: Vault, ledger: Ledger, config: MultiPassConfig) {
    this.vault = vault;
    this.ledger = ledger;
    this.analyzer = new Analyzer();

    this.config = {
      passes: config.passes,
      jobId: config.jobId,
      inputPath: config.inputPath,
      outputDir: config.outputDir,
      snapshotsDir: config.snapshotsDir,
      maxGlossarySize: config.maxGlossarySize ?? 100,
      onProgress: config.onProgress ?? (() => {}),
    };
  }

  /**
   * Execute N-pass pipeline
   *
   * Workflow:
   * 1. Emit JOB_STARTED event
   * 2. Pre-compute total work (analyze input to get total identifiers)
   * 3. Copy input to snapshots/after-pass-000.js
   * 4. For each pass N:
   *    a. Read input from snapshots/after-pass-(N-1).js
   *    b. Build glossary from Pass N-1 renames (if N > 1)
   *    c. Create processor with glossary injection
   *    d. Execute pass via PassEngine
   *    e. Write output to snapshots/after-pass-N.js
   *    f. Emit SNAPSHOT_CREATED event
   * 5. Emit JOB_COMPLETED event
   * 6. Return final result
   */
  async execute(
    baseProcessor: ProcessorFunction
  ): Promise<MultiPassResult> {
    const jobStartTime = performance.now();

    console.log(`[multi-pass] Starting job ${this.config.jobId} with ${this.config.passes.length} passes`);

    // Ensure output directories exist
    this.ensureDirectories();

    // Step 1: Read input code
    const inputCode = readFileSync(this.config.inputPath, "utf-8");
    const inputHash = this.hashCode(inputCode);

    // Step 2: Pre-compute total work
    console.log(`[multi-pass] Analyzing input to compute total work...`);
    const analysis = await this.analyzer.analyze(inputCode);
    const totalIdentifiers = analysis.totalIdentifiers;
    const totalWork = totalIdentifiers * this.config.passes.length;

    console.log(
      `[multi-pass] Total work: ${totalIdentifiers} identifiers × ${this.config.passes.length} passes = ${totalWork}`
    );

    // Step 3: Emit JOB_STARTED event
    const jobConfig: JobConfig = {
      inputPath: this.config.inputPath,
      outputPath: this.config.outputDir,
      passes: this.config.passes.length,
      provider: "openai", // TODO: Make configurable
    };

    const jobStartedEvent: JobStartedEvent = {
      type: "JOB_STARTED",
      timestamp: new Date().toISOString(),
      jobId: this.config.jobId,
      config: jobConfig,
      inputHash,
    };
    await this.ledger.append(jobStartedEvent);

    // Step 4: Create initial snapshot (pass 0)
    const initialSnapshotPath = join(
      this.config.snapshotsDir,
      "after-pass-000.js"
    );
    this.writeSnapshot(initialSnapshotPath, inputCode);

    const initialSnapshotEvent: SnapshotCreatedEvent = {
      type: "SNAPSHOT_CREATED",
      timestamp: new Date().toISOString(),
      jobId: this.config.jobId,
      passNumber: 0,
      snapshotPath: initialSnapshotPath,
      snapshotHash: this.hashCode(inputCode),
    };
    await this.ledger.append(initialSnapshotEvent);

    console.log(`[multi-pass] Created initial snapshot: ${initialSnapshotPath}`);

    // Step 5: Execute each pass sequentially
    const passResults: PassResult[] = [];
    let currentCode = inputCode;
    let previousPassGlossary: GlossaryEntry[] = [];

    for (let passIndex = 0; passIndex < this.config.passes.length; passIndex++) {
      const passNumber = passIndex + 1;
      const passConfig = this.config.passes[passIndex];

      console.log(
        `\n[multi-pass] === Pass ${passNumber}/${this.config.passes.length}: ${passConfig.processor}:${passConfig.mode}:${passConfig.concurrency} ===`
      );

      // Read input from previous pass's snapshot
      const inputSnapshotPath = join(
        this.config.snapshotsDir,
        `after-pass-${String(passNumber - 1).padStart(3, "0")}.js`
      );
      currentCode = readFileSync(inputSnapshotPath, "utf-8");

      // Build glossary from previous pass (if N > 1)
      const glossary = passNumber > 1 ? previousPassGlossary : [];

      console.log(
        `[multi-pass] Pass ${passNumber} glossary: ${glossary.length} entries from previous pass`
      );

      // Create processor with glossary injection
      const processorWithGlossary = this.createProcessorWithGlossary(
        baseProcessor,
        glossary
      );

      // Create PassEngine for this pass
      const passEngine = new PassEngine(this.vault, this.ledger, {
        concurrency: passConfig.concurrency,
        batchSize: 50,
        retryCount: 3,
        retryDelayMs: 1000,
        onProgress: (processed, total, errors) => {
          this.config.onProgress(passNumber, processed, total);
        },
      });

      // Output snapshot path for this pass
      const outputSnapshotPath = join(
        this.config.snapshotsDir,
        `after-pass-${String(passNumber).padStart(3, "0")}.js`
      );

      // Execute pass
      const passResult = await passEngine.executePass(
        currentCode,
        processorWithGlossary,
        passNumber,
        this.config.jobId,
        passConfig,
        outputSnapshotPath
      );

      passResults.push(passResult);

      // Build glossary for next pass
      // Read the analysis again to get reference counts
      const passAnalysis = await this.analyzer.analyze(currentCode);
      previousPassGlossary = this.buildGlossary(
        passResult.renameMap,
        passAnalysis.identifiers
      );

      console.log(
        `[multi-pass] Pass ${passNumber} complete: ${passResult.stats.identifiersRenamed} renamed, ${passResult.stats.identifiersUnchanged} unchanged, ${passResult.stats.identifiersSkipped} skipped`
      );

      // Read output for next pass
      currentCode = readFileSync(outputSnapshotPath, "utf-8");

      // Emit SNAPSHOT_CREATED event
      const snapshotEvent: SnapshotCreatedEvent = {
        type: "SNAPSHOT_CREATED",
        timestamp: new Date().toISOString(),
        jobId: this.config.jobId,
        passNumber,
        snapshotPath: outputSnapshotPath,
        snapshotHash: this.hashCode(currentCode),
      };
      await this.ledger.append(snapshotEvent);
    }

    // Step 6: Calculate final results
    const totalDuration = performance.now() - jobStartTime;

    const finalSnapshotPath = join(
      this.config.snapshotsDir,
      `after-pass-${String(this.config.passes.length).padStart(3, "0")}.js`
    );
    const finalSnapshotHash = this.hashCode(currentCode);

    // Copy final snapshot to output
    const finalOutputPath = join(this.config.outputDir, "output.js");
    this.writeSnapshot(finalOutputPath, currentCode);

    console.log(
      `\n[multi-pass] === Job Complete ===`
    );
    console.log(`[multi-pass] Total duration: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`[multi-pass] Final output: ${finalOutputPath}`);

    // Step 7: Emit JOB_COMPLETED event
    const jobCompletedEvent: JobCompletedEvent = {
      type: "JOB_COMPLETED",
      timestamp: new Date().toISOString(),
      jobId: this.config.jobId,
      totalPasses: this.config.passes.length,
      totalDurationMs: totalDuration,
      finalSnapshotPath: finalOutputPath,
      success: true,
    };
    await this.ledger.append(jobCompletedEvent);

    return {
      finalSnapshotPath: finalOutputPath,
      finalSnapshotHash,
      totalPasses: this.config.passes.length,
      totalDurationMs: totalDuration,
      passResults,
      success: true,
    };
  }

  /**
   * Create a processor function that injects glossary into prompts
   *
   * The glossary provides context from previous pass:
   * - oldName → newName mappings
   * - Prioritized by reference count (most-referenced first)
   * - Limited to maxGlossarySize entries
   *
   * This is the key insight of multi-pass: Pass N sees ALL of Pass N-1's renames
   */
  private createProcessorWithGlossary(
    baseProcessor: ProcessorFunction,
    glossary: GlossaryEntry[]
  ): ProcessorFunction {
    // If no glossary, return base processor unchanged
    if (glossary.length === 0) {
      return baseProcessor;
    }

    // Build glossary text
    const glossaryText = this.formatGlossary(glossary);

    // Return wrapped processor that prepends glossary to context
    return async (name: string, context: string) => {
      const enhancedContext = this.injectGlossary(context, glossaryText);
      return baseProcessor(name, enhancedContext);
    };
  }

  /**
   * Build glossary from rename map
   *
   * Process:
   * 1. For each rename, look up reference count from analysis
   * 2. Create GlossaryEntry with oldName, newName, references, confidence
   * 3. Sort by reference count (descending)
   * 4. Take top N entries (maxGlossarySize)
   */
  private buildGlossary(
    renameMap: Record<string, string>,
    identifiers: any[]
  ): GlossaryEntry[] {
    const entries: GlossaryEntry[] = [];

    // Build map of identifier ID -> reference count
    const idToReferences = new Map<string, number>();
    for (const identifier of identifiers) {
      idToReferences.set(identifier.id, identifier.references);
    }

    // Create glossary entries
    for (const [id, newName] of Object.entries(renameMap)) {
      // Find original identifier to get old name
      const identifier = identifiers.find((i) => i.id === id);
      if (!identifier) continue;

      const oldName = identifier.name;
      const references = idToReferences.get(id) ?? 0;

      entries.push({
        oldName,
        newName,
        references,
        confidence: 1.0, // TODO: Track confidence from processor
      });
    }

    // Sort by reference count (descending)
    entries.sort((a, b) => b.references - a.references);

    // Take top N
    return entries.slice(0, this.config.maxGlossarySize);
  }

  /**
   * Format glossary as text for injection into prompts
   *
   * Format:
   * ```
   * Glossary from previous pass:
   * - a → config (referenced 42 times)
   * - b → handler (referenced 18 times)
   * - c → processData (referenced 7 times)
   * ...
   * ```
   */
  private formatGlossary(glossary: GlossaryEntry[]): string {
    const lines = ["Glossary from previous pass:"];

    for (const entry of glossary) {
      lines.push(
        `- ${entry.oldName} → ${entry.newName} (referenced ${entry.references} times)`
      );
    }

    return lines.join("\n");
  }

  /**
   * Inject glossary into context
   *
   * The glossary is prepended to the context so the LLM sees:
   * 1. What names were chosen in the previous pass
   * 2. How frequently those identifiers are used
   * 3. The current context
   *
   * This gives the LLM full information about the codebase's naming decisions
   */
  private injectGlossary(context: string, glossaryText: string): string {
    return `${glossaryText}\n\nGiven this context, suggest a name for the identifier in the following code:\n\n${context}`;
  }

  /**
   * Ensure all necessary directories exist
   */
  private ensureDirectories(): void {
    if (!existsSync(this.config.outputDir)) {
      mkdirSync(this.config.outputDir, { recursive: true });
    }

    if (!existsSync(this.config.snapshotsDir)) {
      mkdirSync(this.config.snapshotsDir, { recursive: true });
    }
  }

  /**
   * Write snapshot to disk with atomic write
   * Uses temp file + rename pattern
   */
  private writeSnapshot(path: string, code: string): void {
    const dir = dirname(path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const tempPath = `${path}.tmp`;

    try {
      writeFileSync(tempPath, code, "utf-8");
      // Atomic rename
      // Use imported renameSync
      renameSync(tempPath, path);
    } catch (error) {
      // Cleanup on error
      if (existsSync(tempPath)) {
        // Use imported unlinkSync
        try {
          unlinkSync(tempPath);
        } catch {
          // Ignore cleanup errors
        }
      }
      throw error;
    }
  }

  /**
   * Hash code for integrity verification
   */
  private hashCode(code: string): string {
    return createHash("sha256").update(code).digest("hex");
  }

  /**
   * Calculate stability metric: % unchanged between passes
   *
   * Stability = unchangedCount / totalCount
   * Target: >80% by pass 3
   */
  static calculateStability(
    currentPassResult: PassResult,
    totalIdentifiers: number
  ): number {
    const unchanged = currentPassResult.stats.identifiersUnchanged;
    return unchanged / totalIdentifiers;
  }
}
