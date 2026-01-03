/**
 * Experiments API routes
 */

import { Router, Request, Response } from "express";
import { storage, runStorage } from "../storage.js";
import { readLedgerLogs, readLedgerLogsForRun, getPassesForRun, getIdentifiersForPass, getVaultHashForIdentifier } from "../lib/ledger-reader.js";
import { Vault } from "../../../../turbo-v2/vault/vault.js";
import {
  CreateExperimentRequest,
  CreateExperimentResponse,
  ListExperimentsResponse,
  GetExperimentResponse,
  GetRunResponse,
  ListRunsResponse,
  ListPassesResponse,
  ListIdentifiersResponse,
  GetIdentifierContextResponse,
  ListIdentifiersQuery,
} from "../../shared/types.js";

export const experimentsRouter = Router();

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
 * Create new experiment (or return existing one with same parameters)
 */
experimentsRouter.post("/", (req: Request, res: Response) => {
  try {
    const body: CreateExperimentRequest = req.body;

    // Validate input - name is now optional (auto-generated)
    if (!body.preset || !body.samples || body.samples.length === 0) {
      res.status(400).json({ error: "Missing required fields: preset, samples" });
      return;
    }

    const { experiment, existing } = storage.createExperiment(body.preset, body.samples, {
      name: body.name,
      mode: body.mode,
      isBaseline: body.isBaseline,
      tags: body.tags,
      notes: body.notes,
    });

    const response: CreateExperimentResponse = { experiment, existing };
    // Return 200 if existing, 201 if new
    res.status(existing ? 200 : 201).json(response);
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
 * PATCH /api/experiments/:id
 * Update experiment (notes, tags, etc.)
 */
experimentsRouter.patch("/:id", (req: Request, res: Response) => {
  try {
    const experiment = storage.getExperiment(req.params.id);

    if (!experiment) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    const { notes, tags, name } = req.body;
    storage.updateExperiment(req.params.id, { notes, tags, name });

    const updated = storage.getExperiment(req.params.id);
    res.json({ experiment: updated });
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

/**
 * POST /api/experiments/:id/baseline
 * Set or unset experiment as baseline
 */
experimentsRouter.post("/:id/baseline", (req: Request, res: Response) => {
  try {
    const experiment = storage.getExperiment(req.params.id);

    if (!experiment) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    const { isBaseline } = req.body;
    storage.setBaseline(req.params.id, isBaseline !== false);

    const updated = storage.getExperiment(req.params.id);
    res.json({ experiment: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/experiments/:id/logs
 * Get ledger events as log entries for experiment
 */
experimentsRouter.get("/:id/logs", (req: Request, res: Response) => {
  try {
    const experiment = storage.getExperiment(req.params.id);

    if (!experiment) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 100;

    // Read ledger events and transform to log entries
    const logs = readLedgerLogs(req.params.id, limit);

    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/baselines
 * Get all baseline experiments
 */
experimentsRouter.get("/baselines/list", (_req: Request, res: Response) => {
  try {
    const baselines = storage.getBaselines();
    res.json({ experiments: baselines });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/experiments/:id/clone
 * Clone an experiment (creates a new pending experiment with same configuration)
 * Note: With deduplication, this will return the existing experiment if parameters match
 */
experimentsRouter.post("/:id/clone", (req: Request, res: Response) => {
  try {
    const original = storage.getExperiment(req.params.id);

    if (!original) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    const { name } = req.body;
    const newName = name || `${original.name} (Clone)`;

    // Create a new experiment with same configuration
    // Note: This will return the existing experiment if parameters match (deduplication)
    const { experiment: cloned, existing } = storage.createExperiment(
      original.preset,
      original.samples,
      {
        name: newName,
        mode: original.mode,
        notes: original.notes,
        tags: original.tags,
      }
    );

    res.status(existing ? 200 : 201).json({ experiment: cloned, existing });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/experiments/:id/runs
 * Get all runs for an experiment
 */
experimentsRouter.get("/:id/runs", (req: Request, res: Response) => {
  try {
    const experiment = storage.getExperiment(req.params.id);

    if (!experiment) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    const runs = runStorage.getRunsForExperiment(req.params.id);
    const response: ListRunsResponse = { runs };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/experiments/:id/runs/:runId
 * Get a specific run
 */
experimentsRouter.get("/:id/runs/:runId", (req: Request, res: Response) => {
  try {
    const run = runStorage.getRun(req.params.runId);

    if (!run || run.experimentId !== req.params.id) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    const response: GetRunResponse = { run };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/experiments/:id/runs/:runId/logs
 * Get logs for a specific run
 */
experimentsRouter.get("/:id/runs/:runId/logs", (req: Request, res: Response) => {
  try {
    const run = runStorage.getRun(req.params.runId);

    if (!run || run.experimentId !== req.params.id) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 100;

    // First try to read from the run's job directory (ledger events)
    if (run.jobDir) {
      const logs = readLedgerLogsForRun(run.jobDir, limit);
      if (logs.length > 0) {
        res.json({ logs });
        return;
      }
    }

    // Fall back to stored console logs
    const logs = runStorage.getConsoleLogs(req.params.runId, limit);
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/experiments/:id/runs/:runId/passes
 * Get list of passes for a run with summary stats
 */
experimentsRouter.get("/:id/runs/:runId/passes", (req: Request, res: Response) => {
  try {
    const run = runStorage.getRun(req.params.runId);

    if (!run || run.experimentId !== req.params.id) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    if (!run.jobDir) {
      res.status(404).json({ error: "Job directory not found for this run" });
      return;
    }

    const passes = getPassesForRun(run.jobDir);
    const response: ListPassesResponse = { passes };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/experiments/:id/runs/:runId/passes/:passNumber/identifiers
 * Get paginated list of identifiers for a specific pass
 */
experimentsRouter.get("/:id/runs/:runId/passes/:passNumber/identifiers", (req: Request, res: Response) => {
  try {
    const run = runStorage.getRun(req.params.runId);

    if (!run || run.experimentId !== req.params.id) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    if (!run.jobDir) {
      res.status(404).json({ error: "Job directory not found for this run" });
      return;
    }

    const passNumber = parseInt(req.params.passNumber);

    if (isNaN(passNumber) || passNumber < 1) {
      res.status(400).json({ error: "Invalid pass number" });
      return;
    }

    // Build query from request params
    const query: ListIdentifiersQuery = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 100,
      status: (req.query.status as any) || "all",
      sort: (req.query.sort as any) || "id",
      order: (req.query.order as any) || "asc",
    };

    const { identifiers, total } = getIdentifiersForPass(run.jobDir, passNumber, query);

    const response: ListIdentifiersResponse = {
      identifiers,
      total,
      page: query.page!,
      limit: query.limit!,
      hasMore: (query.page! * query.limit!) < total,
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/experiments/:id/runs/:runId/passes/:passNumber/identifiers/:identifierId/context
 * Get context for a specific identifier via vault lookup
 */
experimentsRouter.get("/:id/runs/:runId/passes/:passNumber/identifiers/:identifierId/context", async (req: Request, res: Response) => {
  try {
    const run = runStorage.getRun(req.params.runId);

    if (!run || run.experimentId !== req.params.id) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    if (!run.jobDir) {
      res.status(404).json({ error: "Job directory not found for this run" });
      return;
    }

    const passNumber = parseInt(req.params.passNumber);
    const identifierId = req.params.identifierId;

    if (isNaN(passNumber) || passNumber < 1) {
      res.status(400).json({ error: "Invalid pass number" });
      return;
    }

    // Get vault hash for this identifier
    const vaultHash = getVaultHashForIdentifier(run.jobDir, passNumber, identifierId);

    if (!vaultHash) {
      // Vault index not found - return unavailable context
      const response: GetIdentifierContextResponse = {
        context: {
          context: "",
          prompt: "",
          response: "",
          available: false,
        },
      };
      res.json(response);
      return;
    }

    // Load vault entry
    const vault = new Vault();
    const entry = await vault.get(vaultHash);

    if (!entry) {
      // Vault entry was evicted - return unavailable context
      const response: GetIdentifierContextResponse = {
        context: {
          context: "",
          prompt: "",
          response: "",
          available: false,
        },
      };
      res.json(response);
      return;
    }

    // Return context from vault
    const response: GetIdentifierContextResponse = {
      context: {
        context: entry.request.prompt, // The surrounding code is in the prompt
        prompt: entry.request.prompt,
        response: entry.response.content,
        available: true,
        model: entry.request.model,
        timestamp: entry.response.timestamp,
      },
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
