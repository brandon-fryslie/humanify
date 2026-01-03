/**
 * Experiment runner API routes
 * Executes turbo-v2 experiments and scores results
 */

import { Router, Request, Response } from "express";
import { storage, runStorage } from "../storage.js";
import { runExperiment } from "../run-experiment.js";
import {
  RunExperimentResponse,
  ExperimentStatusResponse,
} from "../../shared/types.js";

export const runnerRouter = Router();

// Track running experiments (maps experimentId to runId)
const runningExperiments = new Map<string, string>();

/**
 * POST /api/experiments/:id/run
 * Execute experiment - creates a new Run
 */
runnerRouter.post("/:id/run", async (req: Request, res: Response) => {
  try {
    const experiment = storage.getExperiment(req.params.id);

    if (!experiment) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    if (runningExperiments.has(req.params.id)) {
      res.status(409).json({ error: "Experiment is already running" });
      return;
    }

    // Create a pending Run first (so we can return its ID immediately)
    const pendingRun = runStorage.createRun(req.params.id);

    // Update status to running
    storage.updateExperiment(req.params.id, {
      status: "running",
      startedAt: new Date().toISOString(),
    });

    runStorage.updateRun(pendingRun.id, {
      status: "running",
      startedAt: new Date().toISOString(),
    });

    runningExperiments.set(req.params.id, pendingRun.id);

    const response: RunExperimentResponse = {
      message: "Experiment started",
      experimentId: req.params.id,
      runId: pendingRun.id,
      runNumber: pendingRun.runNumber,
    };

    res.status(202).json(response);

    // Run experiment in background (but skip Run creation since we already did it)
    runExperimentWithRun(req.params.id, pendingRun.id)
      .catch((error) => {
        console.error(`Experiment ${req.params.id} run ${pendingRun.id} failed:`, error);
        runStorage.updateRun(pendingRun.id, {
          status: "failed",
          completedAt: new Date().toISOString(),
        });
        storage.updateExperiment(req.params.id, {
          status: "failed",
          completedAt: new Date().toISOString(),
        });
      })
      .finally(() => {
        runningExperiments.delete(req.params.id);
      });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Internal function to run experiment with a pre-created Run
 */
async function runExperimentWithRun(experimentId: string, runId: string): Promise<void> {
  // Pass the runId so runExperiment uses the existing Run instead of creating a new one
  await runExperiment(experimentId, runId);
}

/**
 * GET /api/experiments/:id/status
 * Get experiment execution status
 */
runnerRouter.get("/:id/status", (req: Request, res: Response) => {
  try {
    const experiment = storage.getExperiment(req.params.id);

    if (!experiment) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    // Determine current sample if running
    let currentSample = undefined;
    if (experiment.status === "running") {
      const completedCount = experiment.results.length;
      if (completedCount < experiment.samples.length) {
        currentSample = experiment.samples[completedCount];
      }
    }

    const response: ExperimentStatusResponse = {
      experimentId: req.params.id,
      status: experiment.status,
      currentSample,
      completedSamples: experiment.results.length,
      totalSamples: experiment.samples.length,
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
