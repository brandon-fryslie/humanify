/**
 * Presets API routes
 */

import { Router, Request, Response } from "express";
import { presetStorage } from "../storage.js";
import {
  CreatePresetRequest,
  UpdatePresetRequest,
  ListPresetsResponse,
} from "../../shared/types.js";

export const presetsRouter = Router();

/**
 * GET /api/presets
 * List all presets (built-in + custom)
 */
presetsRouter.get("/", (_req: Request, res: Response) => {
  try {
    const presets = presetStorage.listPresets();
    const response: ListPresetsResponse = { presets };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/presets/:id
 * Get single preset
 */
presetsRouter.get("/:id", (req: Request, res: Response) => {
  try {
    const preset = presetStorage.getPreset(req.params.id);

    if (!preset) {
      res.status(404).json({ error: "Preset not found" });
      return;
    }

    res.json({ preset });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/presets
 * Create custom preset
 */
presetsRouter.post("/", (req: Request, res: Response) => {
  try {
    const body: CreatePresetRequest = req.body;

    // Validate input
    if (!body.name || !body.passes || body.passes.length === 0) {
      res.status(400).json({ error: "Missing required fields: name, passes" });
      return;
    }

    // Validate passes
    for (const pass of body.passes) {
      if (!pass.processor || !pass.mode || pass.concurrency === undefined) {
        res.status(400).json({
          error: "Each pass requires: processor, mode, concurrency"
        });
        return;
      }
    }

    const preset = presetStorage.createPreset(body.name, body.passes, body.description);
    res.status(201).json({ preset });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/presets/:id
 * Update custom preset
 */
presetsRouter.patch("/:id", (req: Request, res: Response) => {
  try {
    const preset = presetStorage.getPreset(req.params.id);

    if (!preset) {
      res.status(404).json({ error: "Preset not found" });
      return;
    }

    if (preset.isBuiltIn) {
      res.status(403).json({ error: "Cannot modify built-in presets" });
      return;
    }

    const body: UpdatePresetRequest = req.body;
    const updated = presetStorage.updatePreset(req.params.id, body);

    res.json({ preset: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/presets/:id
 * Delete custom preset
 */
presetsRouter.delete("/:id", (req: Request, res: Response) => {
  try {
    const preset = presetStorage.getPreset(req.params.id);

    if (!preset) {
      res.status(404).json({ error: "Preset not found" });
      return;
    }

    if (preset.isBuiltIn) {
      res.status(403).json({ error: "Cannot delete built-in presets" });
      return;
    }

    presetStorage.deletePreset(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/presets/:id/duplicate
 * Duplicate a preset (creates a custom copy)
 */
presetsRouter.post("/:id/duplicate", (req: Request, res: Response) => {
  try {
    const preset = presetStorage.getPreset(req.params.id);

    if (!preset) {
      res.status(404).json({ error: "Preset not found" });
      return;
    }

    const { name } = req.body;
    const newName = name || `${preset.name} (Copy)`;

    const duplicate = presetStorage.createPreset(
      newName,
      [...preset.passes],
      preset.description
    );

    res.status(201).json({ preset: duplicate });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
