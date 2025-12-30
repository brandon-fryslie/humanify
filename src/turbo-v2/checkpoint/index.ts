/**
 * Checkpoint Module
 *
 * Provides mid-pass checkpointing and full resume to survive crashes without losing progress.
 */

export {
  CheckpointManager,
  type CheckpointManagerInterface,
  type CheckpointManagerConfig,
  type Checkpoint,
  type CheckpointStats,
} from './checkpoint-manager.js';

export {
  SnapshotManager,
  type SnapshotManagerInterface,
  type SnapshotMetadata,
  type DiffVerificationResult,
} from './snapshot-manager.js';

export {
  ResumeHandler,
  type ResumeHandlerInterface,
  type ResumeDecision,
  type ResumeOptions,
  type JobMetadata,
} from './resume-handler.js';

export {
  ReplayHarness,
  type ReplayHarnessInterface,
  type ReplayOptions,
  type ReplayResult,
} from './replay-harness.js';

export {
  ShutdownHandler,
  type ShutdownContext,
  type ShutdownHandlerOptions,
  globalShutdownHandler,
  setupGracefulShutdown,
  cleanupGracefulShutdown,
} from './shutdown-handler.js';
