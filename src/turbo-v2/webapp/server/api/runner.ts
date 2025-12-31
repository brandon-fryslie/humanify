/**
 * Experiment runner API routes
 * Sprint 2 implementation
 */

import { Router, Request, Response } from "express";
import { storage } from "../storage.js";
import {
  RunExperimentResponse,
  ExperimentStatusResponse,
} from "../../shared/types.js";

export const runnerRouter = Router();

/**
 * POST /api/experiments/:id/run
 * Execute experiment (Sprint 2)
 */
runnerRouter.post("/:id/run", async (req: Request, res: Response) => {
  try {
    const experiment = storage.getExperiment(req.params.id);

    if (!experiment) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    // TODO Sprint 2: Implement actual runner
    const response: RunExperimentResponse = {
      message: "Experiment execution not yet implemented (Sprint 2)",
      experimentId: req.params.id,
    };

    res.status(202).json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/experiments/:id/status
 * Get experiment execution status (Sprint 2)
 */
runnerRouter.get("/:id/status", (req: Request, res: Response) => {
  try {
    const experiment = storage.getExperiment(req.params.id);

    if (!experiment) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    const response: ExperimentStatusResponse = {
      experimentId: req.params.id,
      status: experiment.status,
      completedSamples: experiment.results.length,
      totalSamples: experiment.samples.length,
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
