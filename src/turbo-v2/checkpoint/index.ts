/**
 * Checkpoint Module
 *
 * Provides mid-pass checkpointing to survive crashes without losing progress.
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
