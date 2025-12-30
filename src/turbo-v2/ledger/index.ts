/**
 * Ledger Module - Append-Only Event Log
 *
 * Exports all ledger-related types and classes for Turbo V2
 */

export { Ledger, LedgerInterface, LedgerState } from "./ledger.js";

export {
  // Event types
  LedgerEvent,
  JobStartedEvent,
  PassStartedEvent,
  BatchStartedEvent,
  IdentifierRenamedEvent,
  BatchCompletedEvent,
  PassCompletedEvent,
  SnapshotCreatedEvent,
  JobCompletedEvent,

  // Configuration types
  JobConfig,
  PassConfig,
  TokenStats,
  BatchStats,
  PassStats,

  // Type guards
  isJobStartedEvent,
  isPassStartedEvent,
  isBatchStartedEvent,
  isIdentifierRenamedEvent,
  isBatchCompletedEvent,
  isPassCompletedEvent,
  isSnapshotCreatedEvent,
  isJobCompletedEvent,

  // Utilities
  validateEvent,
  serializeEvent,
  deserializeEvent,
} from "./events.js";
