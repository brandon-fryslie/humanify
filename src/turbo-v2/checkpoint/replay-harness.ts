/**
 * Replay Harness
 *
 * Replays ledger events to regenerate state at any point in history.
 *
 * Features:
 * - Replays ledger events to regenerate state
 * - Can replay to any point in history
 * - Used for debugging and verification
 * - Deterministic state reconstruction
 *
 * Use Cases:
 * - Debugging: Reproduce exact state at crash point
 * - Verification: Validate checkpoint integrity
 * - Auditing: Reconstruct full processing history
 * - Testing: Verify event replay produces expected state
 */

import { Ledger, LedgerState } from '../ledger/ledger.js';
import {
  LedgerEvent,
  isJobStartedEvent,
  isPassStartedEvent,
  isBatchStartedEvent,
  isIdentifierRenamedEvent,
  isBatchCompletedEvent,
  isPassCompletedEvent,
  isSnapshotCreatedEvent,
  isJobCompletedEvent,
  PassStats,
  BatchStats,
} from '../ledger/events.js';
import { SnapshotManager } from './snapshot-manager.js';

export interface ReplayOptions {
  /** Stop replay after N events (for partial replay) */
  maxEvents?: number;
  /** Stop replay at specific timestamp */
  stopAtTimestamp?: string;
  /** Stop replay after specific pass number */
  stopAfterPass?: number;
  /** Validate state consistency during replay */
  validateState?: boolean;
}

export interface ReplayResult {
  /** Final reconstructed state */
  state: LedgerState;
  /** Number of events replayed */
  eventsReplayed: number;
  /** Validation errors (if validateState enabled) */
  validationErrors: string[];
  /** Per-pass statistics */
  passStats: Map<number, PassStats>;
  /** Snapshots created during replay */
  snapshots: Map<number, string>; // passNumber -> hash
}

export interface ReplayHarnessInterface {
  /**
   * Replay all events to reconstruct current state
   */
  replayAll(): Promise<ReplayResult>;

  /**
   * Replay events up to a specific point
   */
  replayTo(options: ReplayOptions): Promise<ReplayResult>;

  /**
   * Replay events and validate against existing snapshot
   */
  replayAndValidate(passNumber: number): Promise<{
    match: boolean;
    expectedHash: string;
    actualState: LedgerState;
    differences: string[];
  }>;

  /**
   * Get state at specific point in history without full replay
   */
  getStateAt(eventIndex: number): Promise<LedgerState>;

  /**
   * Verify ledger integrity
   */
  verifyIntegrity(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
}

export class ReplayHarness implements ReplayHarnessInterface {
  private ledger: Ledger;
  private snapshotManager: SnapshotManager;
  private jobDir: string;

  constructor(jobDir: string) {
    this.jobDir = jobDir;
    this.ledger = new Ledger(jobDir);
    this.snapshotManager = new SnapshotManager(jobDir);
  }

  /**
   * Replay all events to reconstruct current state
   */
  async replayAll(): Promise<ReplayResult> {
    return this.replayTo({});
  }

  /**
   * Replay events up to a specific point
   */
  async replayTo(options: ReplayOptions = {}): Promise<ReplayResult> {
    const state: LedgerState = {
      jobId: '',
      currentPass: 0,
      completedPasses: 0,
      renameMap: {},
      totalIdentifiersRenamed: 0,
      totalTokensUsed: 0,
      jobComplete: false,
      lastEventTimestamp: '',
    };

    const passStats = new Map<number, PassStats>();
    const snapshots = new Map<number, string>();
    const validationErrors: string[] = [];
    let eventsReplayed = 0;

    // Replay events
    for await (const event of this.ledger.replay()) {
      // Check stop conditions
      if (options.maxEvents && eventsReplayed >= options.maxEvents) {
        break;
      }

      if (
        options.stopAtTimestamp &&
        event.timestamp >= options.stopAtTimestamp
      ) {
        break;
      }

      if (
        options.stopAfterPass &&
        isPassCompletedEvent(event) &&
        event.passNumber >= options.stopAfterPass
      ) {
        // Process this event, then stop
        this.applyEvent(state, event, passStats, snapshots);
        eventsReplayed++;
        break;
      }

      // Apply event to state
      this.applyEvent(state, event, passStats, snapshots);
      eventsReplayed++;

      // Validate state if requested
      if (options.validateState) {
        const errors = this.validateState(state, event);
        validationErrors.push(...errors);
      }
    }

    return {
      state,
      eventsReplayed,
      validationErrors,
      passStats,
      snapshots,
    };
  }

  /**
   * Replay events and validate against existing snapshot
   */
  async replayAndValidate(passNumber: number): Promise<{
    match: boolean;
    expectedHash: string;
    actualState: LedgerState;
    differences: string[];
  }> {
    // Replay events up to and including this pass
    const result = await this.replayTo({ stopAfterPass: passNumber });

    // Get expected snapshot hash from events
    const expectedHash = result.snapshots.get(passNumber);
    if (!expectedHash) {
      return {
        match: false,
        expectedHash: '',
        actualState: result.state,
        differences: [`No snapshot found for pass ${passNumber}`],
      };
    }

    // Load actual snapshot
    const metadata = await this.snapshotManager.getMetadata(passNumber);
    if (!metadata) {
      return {
        match: false,
        expectedHash,
        actualState: result.state,
        differences: [`Snapshot metadata not found for pass ${passNumber}`],
      };
    }

    // Compare hashes
    const match = metadata.hash === expectedHash;
    const differences: string[] = [];

    if (!match) {
      differences.push(
        `Hash mismatch: expected ${expectedHash}, got ${metadata.hash}`
      );
    }

    // Verify rename count matches
    const expectedRenames = result.state.totalIdentifiersRenamed;
    if (metadata.renameCount !== expectedRenames) {
      differences.push(
        `Rename count mismatch: expected ${expectedRenames}, got ${metadata.renameCount}`
      );
    }

    return {
      match,
      expectedHash,
      actualState: result.state,
      differences,
    };
  }

  /**
   * Get state at specific point in history
   */
  async getStateAt(eventIndex: number): Promise<LedgerState> {
    const result = await this.replayTo({ maxEvents: eventIndex + 1 });
    return result.state;
  }

  /**
   * Verify ledger integrity
   */
  async verifyIntegrity(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Replay all events with validation
    const result = await this.replayTo({ validateState: true });
    errors.push(...result.validationErrors);

    // Check for orphaned identifiers (renamed but no PASS_STARTED)
    if (result.state.totalIdentifiersRenamed > 0 && result.state.currentPass === 0) {
      errors.push(
        'Identifiers renamed without any PASS_STARTED event'
      );
    }

    // Check for incomplete job
    if (!result.state.jobComplete && result.eventsReplayed > 0) {
      warnings.push(
        'Job not marked complete (may still be in progress)'
      );
    }

    // Verify pass sequence
    for (const [passNumber, stats] of result.passStats.entries()) {
      if (passNumber > result.state.completedPasses + 1) {
        errors.push(
          `Pass ${passNumber} stats found, but only ${result.state.completedPasses} passes completed`
        );
      }
    }

    // Verify snapshots
    for (const [passNumber, hash] of result.snapshots.entries()) {
      const metadata = await this.snapshotManager.getMetadata(passNumber);
      if (!metadata) {
        warnings.push(
          `Snapshot ${passNumber} referenced in ledger but metadata not found`
        );
      } else if (metadata.hash !== hash) {
        errors.push(
          `Snapshot ${passNumber} hash mismatch: ledger=${hash}, metadata=${metadata.hash}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Apply an event to the state
   */
  private applyEvent(
    state: LedgerState,
    event: LedgerEvent,
    passStats: Map<number, PassStats>,
    snapshots: Map<number, string>
  ): void {
    state.lastEventTimestamp = event.timestamp;

    if (isJobStartedEvent(event)) {
      state.jobId = event.jobId;
    } else if (isPassStartedEvent(event)) {
      state.currentPass = event.passNumber;
    } else if (isBatchStartedEvent(event)) {
      // Batch started - no state change
    } else if (isIdentifierRenamedEvent(event)) {
      state.renameMap[event.id] = event.newName;
      state.totalIdentifiersRenamed++;
    } else if (isBatchCompletedEvent(event)) {
      // Batch completed - stats tracked separately
    } else if (isPassCompletedEvent(event)) {
      state.completedPasses = event.passNumber;
      state.totalTokensUsed += event.stats.tokensUsed.total;
      passStats.set(event.passNumber, event.stats);
    } else if (isSnapshotCreatedEvent(event)) {
      snapshots.set(event.passNumber, event.snapshotHash);
    } else if (isJobCompletedEvent(event)) {
      state.jobComplete = true;
    }
  }

  /**
   * Validate state consistency
   */
  private validateState(state: LedgerState, event: LedgerEvent): string[] {
    const errors: string[] = [];

    // Check timestamp ordering
    if (
      state.lastEventTimestamp &&
      event.timestamp < state.lastEventTimestamp
    ) {
      errors.push(
        `Event timestamp out of order: ${event.timestamp} < ${state.lastEventTimestamp}`
      );
    }

    // Check pass sequencing
    if (isPassStartedEvent(event)) {
      if (event.passNumber !== state.currentPass + 1 && event.passNumber !== 1) {
        errors.push(
          `Pass ${event.passNumber} started, but current pass is ${state.currentPass}`
        );
      }
    }

    // Check rename map integrity
    if (isIdentifierRenamedEvent(event)) {
      if (state.currentPass === 0) {
        errors.push(
          `Identifier renamed but no pass started: ${event.id}`
        );
      }

      // Check for duplicate renames within same pass
      const existingName = state.renameMap[event.id];
      if (existingName && existingName !== event.newName) {
        // This is OK if from different passes, but warn
        // (We can't easily track per-pass here without more state)
      }
    }

    return errors;
  }

  /**
   * Export full event history as JSON
   */
  async exportHistory(): Promise<LedgerEvent[]> {
    const events: LedgerEvent[] = [];
    for await (const event of this.ledger.replay()) {
      events.push(event);
    }
    return events;
  }

  /**
   * Get summary statistics from replay
   */
  async getSummary(): Promise<{
    totalEvents: number;
    eventTypes: Record<string, number>;
    passes: number;
    identifiersRenamed: number;
    totalTokens: number;
    duration: number;
  }> {
    const result = await this.replayAll();

    const eventTypes: Record<string, number> = {};
    const events = await this.exportHistory();

    for (const event of events) {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    }

    // Calculate duration
    let duration = 0;
    if (events.length > 0) {
      const firstEvent = events[0];
      const lastEvent = events[events.length - 1];
      duration =
        new Date(lastEvent.timestamp).getTime() -
        new Date(firstEvent.timestamp).getTime();
    }

    return {
      totalEvents: result.eventsReplayed,
      eventTypes,
      passes: result.state.completedPasses,
      identifiersRenamed: result.state.totalIdentifiersRenamed,
      totalTokens: result.state.totalTokensUsed,
      duration,
    };
  }

  /**
   * Replay to specific pass and return snapshot content
   */
  async replayToPassSnapshot(passNumber: number): Promise<string | null> {
    // Replay to get state
    await this.replayTo({ stopAfterPass: passNumber });

    // Load snapshot
    return this.snapshotManager.loadSnapshot(passNumber);
  }

  /**
   * Debug helper: print event timeline
   */
  async printTimeline(): Promise<void> {
    console.log('\n[Replay Timeline]\n');

    let eventIndex = 0;
    for await (const event of this.ledger.replay()) {
      const timestamp = new Date(event.timestamp).toISOString();
      console.log(`[${eventIndex}] ${timestamp} ${event.type}`);

      if (isJobStartedEvent(event)) {
        console.log(`      Job: ${event.jobId}`);
      } else if (isPassStartedEvent(event)) {
        console.log(
          `      Pass ${event.passNumber}: ${event.passConfig.processor}:${event.passConfig.mode}`
        );
      } else if (isBatchStartedEvent(event)) {
        console.log(
          `      Batch ${event.batchNumber}: ${event.identifierIds.length} identifiers`
        );
      } else if (isIdentifierRenamedEvent(event)) {
        console.log(
          `      ${event.id}: ${event.oldName} → ${event.newName} (confidence: ${event.confidence})`
        );
      } else if (isPassCompletedEvent(event)) {
        console.log(
          `      Completed: ${event.stats.identifiersRenamed} renamed, ${event.stats.tokensUsed.total} tokens`
        );
      } else if (isSnapshotCreatedEvent(event)) {
        console.log(
          `      Snapshot: ${event.snapshotPath} (hash: ${event.snapshotHash.substring(0, 8)}...)`
        );
      }

      eventIndex++;
    }

    console.log('\n');
  }
}
