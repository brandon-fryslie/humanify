/**
 * Experiments API routes
 */

import { Router, Request, Response } from "express";
import { storage } from "../storage.js";
import {
  CreateExperimentRequest,
  CreateExperimentResponse,
  ListExperimentsResponse,
  GetExperimentResponse,
  ExperimentConfig,
} from "../../shared/types.js";

export const experimentsRouter = Router();

/**
 * Generate unique experiment ID
 */
function generateExperimentId(name: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return `exp-${sanitizedName}-${timestamp}-${random}`;
}

/**
 * GET /api/experiments
 * List all experiments
 */
experimentsRouter.get("/", (_req: Request, res: Response) => {
  try {
    const experiments = storage.listExperiments();
    const response: ListExperimentsResponse = { experiments };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/experiments
 * Create new experiment
 */
experimentsRouter.post("/", (req: Request, res: Response) => {
  try {
    const body: CreateExperimentRequest = req.body;

    // Validate input
    if (!body.name || !body.preset || !body.samples || body.samples.length === 0) {
      res.status(400).json({ error: "Missing required fields: name, preset, samples" });
      return;
    }

    const experiment: ExperimentConfig = {
      id: generateExperimentId(body.name),
      name: body.name,
      preset: body.preset,
      samples: body.samples,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    storage.createExperiment(experiment);

    const response: CreateExperimentResponse = { experiment };
    res.status(201).json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/experiments/:id
 * Get single experiment with results
 */
experimentsRouter.get("/:id", (req: Request, res: Response) => {
  try {
    const experiment = storage.getExperiment(req.params.id);

    if (!experiment) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    const response: GetExperimentResponse = { experiment };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/experiments/:id
 * Delete experiment
 */
experimentsRouter.delete("/:id", (req: Request, res: Response) => {
  try {
    const experiment = storage.getExperiment(req.params.id);

    if (!experiment) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    storage.deleteExperiment(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
