/**
 * Progress SSE Endpoint
 *
 * Provides Server-Sent Events for real-time experiment progress updates.
 */

import { Router, Request, Response } from "express";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { storage } from "../storage.js";
import { watchLedger, ProgressEvent, CleanupFunction } from "../lib/ledger-watcher.js";

export const progressRouter = Router();

// Track active SSE connections
const activeConnections = new Map<string, Set<CleanupFunction>>();

// Get __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root (for resolving checkpoint paths)
// __dirname is src/turbo-v2/webapp/server/api, so go up 5 levels to project root
const PROJECT_ROOT = resolve(__dirname, "../../../../..");

/**
 * GET /api/experiments/:id/progress
 *
 * SSE endpoint for real-time experiment progress.
 * Streams progress events as the experiment runs.
 */
progressRouter.get("/:id/progress", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { sample } = req.query;

  // Get experiment
  const experiment = storage.getExperiment(id);
  if (!experiment) {
    res.status(404).json({ error: "Experiment not found" });
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

  // Send initial connection event
  sendSSE(res, { type: "connected", experimentId: id });

  // If experiment is not running, send current status and close
  if (experiment.status !== "running") {
    sendSSE(res, {
      type: experiment.status === "completed" ? "completed" : "idle",
      experimentId: id,
      status: experiment.status,
    });
    res.end();
    return;
  }

  // Determine which sample to watch
  const sampleToWatch = sample as string || experiment.samples[0];

  // Find the job directory for this sample
  const checkpointDir = join(PROJECT_ROOT, ".humanify-checkpoints");
  const experimentOutputDir = join(PROJECT_ROOT, ".humanify-experiments", id, sampleToWatch);

  // Job directories are created by executeTurboV2 with a hash-based name
  // We need to watch for any new job directory that outputs to our experiment dir
  // For now, use the experiment storage to track the active job

  const activeJob = storage.getActiveJob(id, sampleToWatch);
  if (!activeJob || !activeJob.jobDir) {
    // No active job yet - wait for it to start
    sendSSE(res, { type: "waiting", message: "Waiting for job to start..." });

    // Poll for job to appear
    const checkInterval = setInterval(() => {
      const job = storage.getActiveJob(id, sampleToWatch);
      if (job && job.jobDir) {
        clearInterval(checkInterval);
        startWatching(res, id, sampleToWatch, job.jobDir);
      }
    }, 500);

    // Cleanup on disconnect
    req.on("close", () => {
      clearInterval(checkInterval);
      removeConnection(id);
    });

    return;
  }

  // Start watching the ledger
  startWatching(res, id, sampleToWatch, activeJob.jobDir);

  // Cleanup on disconnect
  req.on("close", () => {
    removeConnection(id);
  });
});

/**
 * Start watching a ledger and streaming events
 */
function startWatching(
  res: Response,
  experimentId: string,
  sample: string,
  jobDir: string
): void {
  const cleanup = watchLedger(
    jobDir,
    (event: ProgressEvent) => {
      sendSSE(res, { ...event, experimentId, sample });

      // Close connection when job completes
      if (event.type === "completed" || event.type === "failed") {
        setTimeout(() => {
          res.end();
          removeConnection(experimentId, cleanup);
        }, 100);
      }
    },
    { pollInterval: 300 }
  );

  // Track connection for cleanup
  addConnection(experimentId, cleanup);
}

/**
 * Send an SSE event
 */
function sendSSE(res: Response, data: Record<string, any>): void {
  try {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch (error) {
    // Connection may have closed
  }
}

/**
 * Track an active connection
 */
function addConnection(experimentId: string, cleanup: CleanupFunction): void {
  if (!activeConnections.has(experimentId)) {
    activeConnections.set(experimentId, new Set());
  }
  activeConnections.get(experimentId)!.add(cleanup);
}

/**
 * Remove and cleanup connections
 */
function removeConnection(experimentId: string, specificCleanup?: CleanupFunction): void {
  const connections = activeConnections.get(experimentId);
  if (!connections) return;

  if (specificCleanup) {
    specificCleanup();
    connections.delete(specificCleanup);
  } else {
    // Cleanup all connections for this experiment
    for (const cleanup of connections) {
      cleanup();
    }
    activeConnections.delete(experimentId);
  }
}

/**
 * GET /api/experiments/:id/progress/status
 *
 * Non-SSE endpoint to get current progress status (for polling fallback)
 */
progressRouter.get("/:id/progress/status", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const experiment = storage.getExperiment(id);
  if (!experiment) {
    res.status(404).json({ error: "Experiment not found" });
    return;
  }

  // Get progress from storage
  const progress = storage.getExperimentProgress(id);

  res.json({
    experimentId: id,
    status: experiment.status,
    progress,
  });
});

/**
 * POST /api/experiments/:id/cancel
 *
 * Cancel a running experiment
 */
progressRouter.post("/:id/cancel", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const experiment = storage.getExperiment(id);
  if (!experiment) {
    res.status(404).json({ error: "Experiment not found" });
    return;
  }

  if (experiment.status !== "running") {
    res.status(400).json({ error: "Experiment is not running" });
    return;
  }

  // Cancel the experiment
  const cancelled = storage.cancelExperiment(id);

  if (cancelled) {
    // Cleanup SSE connections
    removeConnection(id);

    res.json({ message: "Experiment cancelled", experimentId: id });
  } else {
    res.status(500).json({ error: "Failed to cancel experiment" });
  }
});
