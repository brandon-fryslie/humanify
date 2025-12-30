/**
 * Graceful Shutdown Handler
 *
 * Handles SIGINT and SIGTERM signals to save progress before exiting.
 *
 * Features:
 * - SIGINT (Ctrl+C) handler saves progress and exits cleanly
 * - SIGTERM handler saves progress and exits cleanly
 * - Message: "Safe to exit. Resume with same command."
 * - No data loss on interrupt
 * - Cleanup lock files on exit
 *
 * Design:
 * - Single handler for both SIGINT and SIGTERM
 * - Timeout mechanism to prevent hanging
 * - Idempotent (safe to call multiple times)
 * - Async save operations
 */

import { CheckpointManager, Checkpoint } from './checkpoint-manager.js';
import { ResumeHandler } from './resume-handler.js';

export interface ShutdownContext {
  /** Job ID for cleanup */
  jobId: string;
  /** Checkpoint manager for saving state */
  checkpointManager: CheckpointManager;
  /** Resume handler for lock cleanup */
  resumeHandler: ResumeHandler;
  /** Current checkpoint state to save */
  getCurrentCheckpoint: () => Checkpoint;
  /** Callback after save completes */
  onSaved?: () => void | Promise<void>;
}

export interface ShutdownHandlerOptions {
  /** Maximum time to wait for save (ms) */
  timeout?: number;
  /** Enable verbose logging */
  verbose?: boolean;
}

export class ShutdownHandler {
  private context: ShutdownContext | null = null;
  private isShuttingDown = false;
  private handlers: Array<() => void> = [];
  private options: ShutdownHandlerOptions;

  constructor(options: ShutdownHandlerOptions = {}) {
    this.options = {
      timeout: options.timeout ?? 5000, // 5 second timeout
      verbose: options.verbose ?? false,
    };
  }

  /**
   * Register shutdown handlers
   */
  register(context: ShutdownContext): void {
    this.context = context;

    // Create handler functions
    const sigintHandler = this.createHandler('SIGINT');
    const sigtermHandler = this.createHandler('SIGTERM');

    // Store for cleanup
    this.handlers.push(sigintHandler, sigtermHandler);

    // Register with process
    process.on('SIGINT', sigintHandler);
    process.on('SIGTERM', sigtermHandler);

    if (this.options.verbose) {
      console.log('[shutdown] Handlers registered for SIGINT and SIGTERM');
    }
  }

  /**
   * Unregister shutdown handlers
   */
  unregister(): void {
    if (this.handlers.length === 0) {
      return;
    }

    // Remove handlers
    process.removeListener('SIGINT', this.handlers[0]);
    process.removeListener('SIGTERM', this.handlers[1]);

    this.handlers = [];
    this.context = null;

    if (this.options.verbose) {
      console.log('[shutdown] Handlers unregistered');
    }
  }

  /**
   * Create shutdown handler for signal
   */
  private createHandler(signal: 'SIGINT' | 'SIGTERM'): () => void {
    return () => {
      this.handleShutdown(signal).catch((error) => {
        console.error(`[shutdown] Error during ${signal} handling:`, error);
        process.exit(1);
      });
    };
  }

  /**
   * Handle shutdown signal
   */
  private async handleShutdown(signal: 'SIGINT' | 'SIGTERM'): Promise<void> {
    // Prevent multiple simultaneous shutdowns
    if (this.isShuttingDown) {
      if (this.options.verbose) {
        console.log(`\n[shutdown] Already shutting down, ignoring ${signal}`);
      }
      return;
    }

    this.isShuttingDown = true;

    console.log(`\n[turbo-v2] ${signal} received, saving checkpoint...`);

    if (!this.context) {
      console.log('[turbo-v2] No active job to save');
      process.exit(0);
      return;
    }

    try {
      // Save checkpoint with timeout
      await this.saveWithTimeout();

      // Call user callback
      if (this.context.onSaved) {
        await this.context.onSaved();
      }

      // Cleanup lock
      await this.cleanupLock();

      console.log('[turbo-v2] Safe to exit. Resume with same command.');
      process.exit(0);
    } catch (error) {
      console.error('[turbo-v2] Error saving checkpoint:', error);
      console.error('[turbo-v2] Some progress may be lost');
      process.exit(1);
    }
  }

  /**
   * Save checkpoint with timeout
   */
  private async saveWithTimeout(): Promise<void> {
    if (!this.context) {
      throw new Error('No shutdown context');
    }

    const checkpoint = this.context.getCurrentCheckpoint();

    // Create promise that resolves when save completes
    const savePromise = this.context.checkpointManager.saveCheckpoint(
      checkpoint
    );

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Save timeout after ${this.options.timeout}ms`));
      }, this.options.timeout);
    });

    // Race save against timeout
    await Promise.race([savePromise, timeoutPromise]);

    if (this.options.verbose) {
      console.log(
        `[shutdown] Checkpoint saved: ${checkpoint.completedIds.length} identifiers`
      );
    }
  }

  /**
   * Cleanup lock file
   */
  private async cleanupLock(): Promise<void> {
    if (!this.context) {
      return;
    }

    try {
      await this.context.resumeHandler.releaseLock(this.context.jobId);
      if (this.options.verbose) {
        console.log('[shutdown] Lock file released');
      }
    } catch (error) {
      // Log but don't fail shutdown
      console.warn('[shutdown] Failed to release lock:', error);
    }
  }

  /**
   * Get shutdown status
   */
  isActive(): boolean {
    return this.handlers.length > 0;
  }

  /**
   * Force shutdown (for testing)
   */
  async forceShutdown(signal: 'SIGINT' | 'SIGTERM' = 'SIGINT'): Promise<void> {
    await this.handleShutdown(signal);
  }
}

/**
 * Global shutdown handler instance
 * Use this for convenient access across the application
 */
export const globalShutdownHandler = new ShutdownHandler();

/**
 * Helper function to setup graceful shutdown
 */
export function setupGracefulShutdown(
  context: ShutdownContext,
  options?: ShutdownHandlerOptions
): ShutdownHandler {
  const handler = new ShutdownHandler(options);
  handler.register(context);
  return handler;
}

/**
 * Helper function to cleanup graceful shutdown
 */
export function cleanupGracefulShutdown(handler: ShutdownHandler): void {
  handler.unregister();
}
