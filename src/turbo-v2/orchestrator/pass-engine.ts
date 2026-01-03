/**
 * PASS ENGINE: Single-Pass Parallel Orchestrator
 *
 * Purpose: Coordinate identifier processing in a single pass with parallel execution
 *
 * Key Responsibilities:
 * - Process all identifiers in parallel with rate limiting
 * - Track progress: processed, remaining, errors
 * - Use Vault for caching LLM responses
 * - Log events to Ledger for crash recovery
 * - Emit progress updates
 * - Handle errors gracefully with retry logic
 */

import { Analyzer, AnalyzedIdentifier, AnalysisResult } from "../analyzer/analyzer.js";
import { Transformer, RenameMap } from "../transformer/transformer.js";
import { Vault } from "../vault/vault.js";
import { Ledger } from "../ledger/ledger.js";
import {
  PassStartedEvent,
  BatchStartedEvent,
  BatchCompletedEvent,
  PassCompletedEvent,
  IdentifierRenamedEvent,
  PassConfig,
  BatchStats,
  PassStats,
} from "../ledger/events.js";

/**
 * Processor function: Given identifier and context, return new name and confidence
 */
export interface ProcessorFunction {
  (name: string, context: string): Promise<{ newName: string; confidence: number }>;
}

/**
 * Progress callback
 */
export interface ProgressCallback {
  (processed: number, total: number, errors: number): void;
}

/**
 * PassEngine configuration
 */
export interface PassEngineConfig {
  concurrency: number; // Max concurrent requests (default: 50)
  batchSize: number; // Identifiers per batch (default: 50)
  retryCount: number; // Max retries per identifier (default: 3)
  retryDelayMs: number; // Delay between retries (default: 1000)
  onProgress?: ProgressCallback;
  // Adaptive context sizing
  previousConfidence?: Record<string, number>; // Confidence from previous pass
  lowConfidenceThreshold?: number; // Threshold for expanding context (default: 0.7)
  expandedContextSize?: number; // Larger context for low-confidence (default: 1500)
  maxContextSize?: number; // Maximum context for very low confidence (default: 3000)
}

/**
 * Result of a pass execution
 */
export interface PassResult {
  renameMap: RenameMap;
  stats: PassStats;
  confidenceMap: Record<string, number>; // identifier ID -> confidence score
  sourceMap?: any; // Source map for the transformed code
}

/**
 * PassEngine: Orchestrate single-pass parallel processing
 */
export class PassEngine {
  private analyzer: Analyzer;
  private transformer: Transformer;
  private vault: Vault;
  private ledger: Ledger;
  private config: Required<Omit<PassEngineConfig, 'previousConfidence'>> & { previousConfidence?: Record<string, number> };
  private sourceCode: string = ""; // Stored for adaptive context re-extraction

  constructor(
    vault: Vault,
    ledger: Ledger,
    config: Partial<PassEngineConfig> = {}
  ) {
    this.vault = vault;
    this.ledger = ledger;
    this.analyzer = new Analyzer();
    this.transformer = new Transformer();

    this.config = {
      concurrency: config.concurrency ?? 50,
      batchSize: config.batchSize ?? 50,
      retryCount: config.retryCount ?? 3,
      retryDelayMs: config.retryDelayMs ?? 1000,
      onProgress: config.onProgress ?? (() => {}),
      previousConfidence: config.previousConfidence,
      lowConfidenceThreshold: config.lowConfidenceThreshold ?? 0.7,
      expandedContextSize: config.expandedContextSize ?? 1500,
      maxContextSize: config.maxContextSize ?? 3000,
    };
  }

  /**
   * Get adaptive context size based on previous confidence
   */
  private getContextSizeForIdentifier(identifier: AnalyzedIdentifier): number {
    if (!this.config.previousConfidence) {
      return 500; // Default
    }

    const prevConfidence = this.config.previousConfidence[identifier.id];
    if (prevConfidence === undefined) {
      return 500; // No previous data, use default
    }

    if (prevConfidence < 0.5) {
      // Very low confidence - use maximum context
      return this.config.maxContextSize;
    } else if (prevConfidence < this.config.lowConfidenceThreshold) {
      // Low confidence - use expanded context
      return this.config.expandedContextSize;
    }

    return 500; // Good confidence, default context is fine
  }

  /**
   * Get context for identifier, potentially expanded based on previous confidence
   */
  private getContextForIdentifier(identifier: AnalyzedIdentifier): string {
    const contextSize = this.getContextSizeForIdentifier(identifier);

    if (contextSize === 500) {
      // Use pre-computed context
      return identifier.context;
    }

    // Re-extract with larger context window
    return Analyzer.extractContextAtLocation(
      this.sourceCode,
      identifier.location.start.line,
      identifier.location.start.column,
      contextSize
    );
  }

  /**
   * Execute a single pass over code
   *
   * Workflow:
   * 1. Analyze code to extract identifiers
   * 2. Emit PASS_STARTED event
   * 3. Split identifiers into batches
   * 4. For each batch:
   *    a. Emit BATCH_STARTED event
   *    b. Process identifiers in parallel (with rate limiting)
   *    c. Emit IDENTIFIER_RENAMED events
   *    d. Emit BATCH_COMPLETED event
   * 5. Transform code with rename map
   * 6. Emit PASS_COMPLETED event
   * 7. Return rename map and stats
   *
   * @param code Input code
   * @param processor LLM processor function
   * @param passNumber Pass number (1-indexed)
   * @param jobId Job identifier
   * @param passConfig Pass configuration
   * @param snapshotPath Path to write snapshot
   * @param sourceMap Optional source map from previous pass (for stable IDs)
   * @returns Pass result with rename map and stats
   */
  async executePass(
    code: string,
    processor: ProcessorFunction,
    passNumber: number,
    jobId: string,
    passConfig: PassConfig,
    snapshotPath?: string,
    sourceMap?: any
  ): Promise<PassResult> {
    const startTime = performance.now();

    // Store source code for adaptive context re-extraction
    this.sourceCode = code;

    // Step 1: Analyze code
    console.log(`[pass-engine] Analyzing code for pass ${passNumber}...`);
    // Use source map if available to ensure stable IDs
    const analysis = await this.analyzer.analyze(code, sourceMap);
    console.log(`[pass-engine] Found ${analysis.totalIdentifiers} identifiers`);

    // Log adaptive context info if enabled
    if (this.config.previousConfidence) {
      const lowConfCount = Object.values(this.config.previousConfidence).filter(c => c < this.config.lowConfidenceThreshold).length;
      if (lowConfCount > 0) {
        console.log(`[pass-engine] Adaptive context: ${lowConfCount} identifiers will get expanded context`);
      }
    }

    // Step 2: Emit PASS_STARTED event
    const passStartedEvent: PassStartedEvent = {
      type: "PASS_STARTED",
      timestamp: new Date().toISOString(),
      jobId,
      passNumber,
      passConfig,
      identifierCount: analysis.totalIdentifiers,
    };
    await this.ledger.append(passStartedEvent);

    // Step 3: Process identifiers in batches
    const batches = this.createBatches(analysis.identifiers, this.config.batchSize);
    const renameMap: RenameMap = {};
    const confidenceMap: Record<string, number> = {};
    let totalProcessed = 0;
    let totalRenamed = 0;
    let totalUnchanged = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalTokens = { prompt: 0, completion: 0, total: 0 };

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchStartTime = performance.now();

      // Emit BATCH_STARTED event
      const batchStartedEvent: BatchStartedEvent = {
        type: "BATCH_STARTED",
        timestamp: new Date().toISOString(),
        jobId,
        passNumber,
        batchNumber: batchIndex,
        identifierIds: batch.map((id) => id.id),
      };
      await this.ledger.append(batchStartedEvent);

      // Process batch in parallel
      const batchResults = await this.processBatch(
        batch,
        processor,
        jobId,
        passNumber,
        batchIndex
      );

      // Accumulate results
      let batchRenamed = 0;
      let batchUnchanged = 0;
      let batchSkipped = 0;
      let batchErrors = 0;
      let batchTokens = { prompt: 0, completion: 0, total: 0 };

      for (const result of batchResults) {
        totalProcessed++;

        // Track confidence for all identifiers (for adaptive context in next pass)
        confidenceMap[result.identifier.id] = result.confidence;

        if (result.error) {
          totalErrors++;
          batchErrors++;
          totalSkipped++;
          batchSkipped++;
        } else if (result.newName === result.identifier.name) {
          totalUnchanged++;
          batchUnchanged++;
        } else {
          renameMap[result.identifier.id] = result.newName;
          totalRenamed++;
          batchRenamed++;

          // Emit IDENTIFIER_RENAMED event
          const renamedEvent: IdentifierRenamedEvent = {
            type: "IDENTIFIER_RENAMED",
            timestamp: new Date().toISOString(),
            jobId,
            passNumber,
            batchNumber: batchIndex,
            id: result.identifier.id,
            oldName: result.identifier.name,
            newName: result.newName,
            confidence: result.confidence,
          };
          await this.ledger.append(renamedEvent);
        }

        // Accumulate tokens (if available)
        if (result.tokens) {
          // Track per-batch tokens
          batchTokens.prompt += result.tokens.prompt;
          batchTokens.completion += result.tokens.completion;
          batchTokens.total += result.tokens.total;
          // And cumulative tokens for pass stats
          totalTokens.prompt += result.tokens.prompt;
          totalTokens.completion += result.tokens.completion;
          totalTokens.total += result.tokens.total;
        }
      }

      const batchDuration = performance.now() - batchStartTime;

      // Emit BATCH_COMPLETED event
      const batchStats: BatchStats = {
        identifiersProcessed: batch.length,
        identifiersRenamed: batchRenamed,
        identifiersUnchanged: batchUnchanged,
        identifiersSkipped: batchSkipped,
        tokensUsed: batchTokens,  // Use per-batch tokens, not cumulative
        durationMs: batchDuration,
        errors: batchErrors,
      };

      const batchCompletedEvent: BatchCompletedEvent = {
        type: "BATCH_COMPLETED",
        timestamp: new Date().toISOString(),
        jobId,
        passNumber,
        batchNumber: batchIndex,
        stats: batchStats,
      };
      await this.ledger.append(batchCompletedEvent);

      // Report progress
      this.config.onProgress(totalProcessed, analysis.totalIdentifiers, totalErrors);
    }

    // Step 4: Transform code
    console.log(`[pass-engine] Transforming code with ${Object.keys(renameMap).length} renames...`);

    // Build identifier location map for transformer
    const identifierLocations = new Map<string, string>();
    for (const identifier of analysis.identifiers) {
      identifierLocations.set(identifier.id, identifier.name);
    }

    const transformerInstance = snapshotPath
      ? Transformer.withSnapshot(snapshotPath)
      : this.transformer;

    const transformResult = await transformerInstance.transform(
      code,
      renameMap,
      identifierLocations
    );

    console.log(
      `[pass-engine] Applied ${transformResult.applied} renames (${transformResult.skipped} skipped, ${transformResult.collisions} collisions)`
    );

    const totalDuration = performance.now() - startTime;

    // Step 5: Emit PASS_COMPLETED event
    const passStats: PassStats = {
      identifiersProcessed: totalProcessed,
      identifiersRenamed: totalRenamed,
      identifiersUnchanged: totalUnchanged,
      identifiersSkipped: totalSkipped,
      tokensUsed: totalTokens,
      durationMs: totalDuration,
      errors: totalErrors,
      batchCount: batches.length,
    };

    const passCompletedEvent: PassCompletedEvent = {
      type: "PASS_COMPLETED",
      timestamp: new Date().toISOString(),
      jobId,
      passNumber,
      stats: passStats,
    };
    await this.ledger.append(passCompletedEvent);

    return {
      renameMap,
      stats: passStats,
      confidenceMap,
      sourceMap: transformResult.map,
    };
  }

  /**
   * Create batches from identifiers
   */
  private createBatches(
    identifiers: AnalyzedIdentifier[],
    batchSize: number
  ): AnalyzedIdentifier[][] {
    const batches: AnalyzedIdentifier[][] = [];

    for (let i = 0; i < identifiers.length; i += batchSize) {
      batches.push(identifiers.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Process a batch of identifiers in parallel
   */
  private async processBatch(
    batch: AnalyzedIdentifier[],
    processor: ProcessorFunction,
    jobId: string,
    passNumber: number,
    batchNumber: number
  ): Promise<
    Array<{
      identifier: AnalyzedIdentifier;
      newName: string;
      confidence: number;
      error?: string;
      tokens?: { prompt: number; completion: number; total: number };
    }>
  > {
    // Create tasks for parallel execution
    const tasks = batch.map((identifier) => async () => {
      try {
        // Process identifier with retry logic
        const result = await this.processIdentifierWithRetry(
          identifier,
          processor
        );

        return {
          identifier,
          newName: result.newName,
          confidence: result.confidence,
          tokens: result.tokens,
        };
      } catch (error) {
        console.error(
          `[pass-engine] Failed to process identifier ${identifier.name}:`,
          error
        );
        return {
          identifier,
          newName: identifier.name, // Keep original on error
          confidence: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    // Execute tasks with concurrency limit
    const results = await this.parallelLimit(tasks, this.config.concurrency);

    return results;
  }

  /**
   * Process a single identifier with retry logic
   */
  private async processIdentifierWithRetry(
    identifier: AnalyzedIdentifier,
    processor: ProcessorFunction
  ): Promise<{
    newName: string;
    confidence: number;
    tokens?: { prompt: number; completion: number; total: number };
  }> {
    let lastError: Error | null = null;

    // Get context (potentially expanded for low-confidence identifiers)
    const context = this.getContextForIdentifier(identifier);

    for (let attempt = 0; attempt < this.config.retryCount; attempt++) {
      try {
        const result = await processor(identifier.name, context);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.retryCount - 1) {
          // Wait before retrying
          await this.sleep(this.config.retryDelayMs * Math.pow(2, attempt));
        }
      }
    }

    // All retries failed
    throw lastError || new Error("Processing failed");
  }

  /**
   * Execute tasks in parallel with concurrency limit
   */
  private async parallelLimit<T>(
    tasks: Array<() => Promise<T>>,
    limit: number
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const task of tasks) {
      const p = task().then((result) => {
        results.push(result);
        executing.splice(executing.indexOf(p), 1);
      });

      executing.push(p);

      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);

    return results;
  }

  /**
   * Sleep for given milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
