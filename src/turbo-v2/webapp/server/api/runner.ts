/**
 * Experiment runner API routes
 * Executes turbo-v2 experiments and scores results
 */

import { Router, Request, Response } from "express";
import { storage } from "../storage.js";
import { runExperiment } from "../run-experiment.js";
import {
  RunExperimentResponse,
  ExperimentStatusResponse,
} from "../../shared/types.js";

export const runnerRouter = Router();

// Track running experiments
const runningExperiments = new Set<string>();

/**
 * POST /api/experiments/:id/run
 * Execute experiment
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

    // Update status to running
    storage.updateExperiment(req.params.id, {
      status: "running",
      startedAt: new Date().toISOString(),
    });

    runningExperiments.add(req.params.id);

    const response: RunExperimentResponse = {
      message: "Experiment started",
      experimentId: req.params.id,
    };

    res.status(202).json(response);

    // Run experiment in background
    runExperiment(req.params.id)
      .then(() => {
        storage.updateExperiment(req.params.id, {
          status: "completed",
          completedAt: new Date().toISOString(),
        });
      })
      .catch((error) => {
        console.error(`Experiment ${req.params.id} failed:`, error);
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
