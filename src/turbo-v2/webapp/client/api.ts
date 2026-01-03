/**
 * API client for experiments and presets
 */

import type {
  ExperimentConfig,
  ExperimentWithResults,
  CreateExperimentRequest,
  ExperimentStatusResponse,
  PresetConfig,
  CreatePresetRequest,
  UpdatePresetRequest,
  ConsoleLogEntry,
  ProcessingMode,
  SampleName,
  Run,
  RunSummary,
  RunExperimentResponse,
  PassDetail,
  IdentifierDetail,
  IdentifierContext,
  ListIdentifiersQuery,
} from "@shared/types";

const API_BASE = "/api";

export const api = {
  // ============ Experiments ============

  /**
   * List all experiments
   */
  async listExperiments(): Promise<ExperimentConfig[]> {
    const response = await fetch(`${API_BASE}/experiments`);
    const data = await response.json();
    return data.experiments || [];
  },

  /**
   * Get single experiment with results
   */
  async getExperiment(id: string): Promise<ExperimentWithResults> {
    const response = await fetch(`${API_BASE}/experiments/${id}`);
    const data = await response.json();
    return data.experiment;
  },

  /**
   * Create new experiment
   */
  async createExperiment(request: {
    name?: string;
    preset: string;
    samples: SampleName[];
    mode?: ProcessingMode;
    isBaseline?: boolean;
    tags?: string[];
    notes?: string;
  }): Promise<ExperimentConfig> {
    const response = await fetch(`${API_BASE}/experiments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return data.experiment;
  },

  /**
   * Update experiment
   */
  async updateExperiment(
    id: string,
    updates: { name?: string; notes?: string; tags?: string[] }
  ): Promise<ExperimentWithResults> {
    const response = await fetch(`${API_BASE}/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.experiment;
  },

  /**
   * Delete experiment
   */
  async deleteExperiment(id: string): Promise<void> {
    await fetch(`${API_BASE}/experiments/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Run experiment - creates a new Run
   */
  async runExperiment(id: string): Promise<RunExperimentResponse> {
    const response = await fetch(`${API_BASE}/experiments/${id}/run`, {
      method: "POST",
    });
    return response.json();
  },

  /**
   * Cancel running experiment
   */
  async cancelExperiment(id: string): Promise<void> {
    await fetch(`${API_BASE}/experiments/${id}/cancel`, {
      method: "POST",
    });
  },

  /**
   * Get experiment status
   */
  async getStatus(id: string): Promise<ExperimentStatusResponse> {
    const response = await fetch(`${API_BASE}/experiments/${id}/status`);
    return response.json();
  },

  /**
   * Set experiment as baseline
   */
  async setBaseline(id: string, isBaseline: boolean): Promise<ExperimentWithResults> {
    const response = await fetch(`${API_BASE}/experiments/${id}/baseline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBaseline }),
    });
    const data = await response.json();
    return data.experiment;
  },

  /**
   * Get experiment console logs
   */
  async getLogs(id: string, limit: number = 50): Promise<ConsoleLogEntry[]> {
    const response = await fetch(`${API_BASE}/experiments/${id}/logs?limit=${limit}`);
    const data = await response.json();
    return data.logs || [];
  },

  /**
   * Get baseline experiments
   */
  async getBaselines(): Promise<ExperimentConfig[]> {
    const response = await fetch(`${API_BASE}/experiments/baselines/list`);
    const data = await response.json();
    return data.experiments || [];
  },

  // ============ Presets ============

  /**
   * List all presets
   */
  async listPresets(): Promise<PresetConfig[]> {
    const response = await fetch(`${API_BASE}/presets`);
    const data = await response.json();
    return data.presets || [];
  },

  /**
   * Get single preset
   */
  async getPreset(id: string): Promise<PresetConfig> {
    const response = await fetch(`${API_BASE}/presets/${id}`);
    const data = await response.json();
    return data.preset;
  },

  /**
   * Create custom preset
   */
  async createPreset(request: CreatePresetRequest): Promise<PresetConfig> {
    const response = await fetch(`${API_BASE}/presets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return data.preset;
  },

  /**
   * Update custom preset
   */
  async updatePreset(id: string, updates: UpdatePresetRequest): Promise<PresetConfig> {
    const response = await fetch(`${API_BASE}/presets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.preset;
  },

  /**
   * Delete custom preset
   */
  async deletePreset(id: string): Promise<void> {
    await fetch(`${API_BASE}/presets/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Duplicate preset
   */
  async duplicatePreset(id: string, name?: string): Promise<PresetConfig> {
    const response = await fetch(`${API_BASE}/presets/${id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    return data.preset;
  },

  /**
   * Clone an experiment
   */
  async cloneExperiment(id: string, name?: string): Promise<ExperimentConfig> {
    const response = await fetch(`${API_BASE}/experiments/${id}/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    return data.experiment;
  },

  // ============ Runs ============

  /**
   * Get all runs for an experiment
   */
  async getRunsForExperiment(experimentId: string): Promise<RunSummary[]> {
    const response = await fetch(`${API_BASE}/experiments/${experimentId}/runs`);
    const data = await response.json();
    return data.runs || [];
  },

  /**
   * Get a specific run
   */
  async getRun(experimentId: string, runId: string): Promise<Run> {
    const response = await fetch(`${API_BASE}/experiments/${experimentId}/runs/${runId}`);
    const data = await response.json();
    return data.run;
  },

  /**
   * Get logs for a specific run
   */
  async getRunLogs(experimentId: string, runId: string, limit: number = 100): Promise<ConsoleLogEntry[]> {
    const response = await fetch(
      `${API_BASE}/experiments/${experimentId}/runs/${runId}/logs?limit=${limit}`
    );
    const data = await response.json();
    return data.logs || [];
  },

  // ============ Identifier Details ============

  /**
   * Get passes for a run
   */
  async getPassesForRun(experimentId: string, runId: string): Promise<PassDetail[]> {
    const response = await fetch(`${API_BASE}/experiments/${experimentId}/runs/${runId}/passes`);
    const data = await response.json();
    return data.passes || [];
  },

  /**
   * Get identifiers for a specific pass
   */
  async getIdentifiersForPass(
    experimentId: string,
    runId: string,
    passNumber: number,
    query?: ListIdentifiersQuery
  ): Promise<{
    identifiers: IdentifierDetail[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", query.page.toString());
    if (query?.limit) params.set("limit", query.limit.toString());
    if (query?.status) params.set("status", query.status);
    if (query?.sort) params.set("sort", query.sort);
    if (query?.order) params.set("order", query.order);

    const queryString = params.toString();
    const url = `${API_BASE}/experiments/${experimentId}/runs/${runId}/passes/${passNumber}/identifiers${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url);
    return response.json();
  },

  /**
   * Get context for a specific identifier
   */
  async getIdentifierContext(
    experimentId: string,
    runId: string,
    passNumber: number,
    identifierId: string
  ): Promise<IdentifierContext> {
    const response = await fetch(
      `${API_BASE}/experiments/${experimentId}/runs/${runId}/passes/${passNumber}/identifiers/${encodeURIComponent(
        identifierId
      )}/context`
    );
    const data = await response.json();
    return data.context;
  },
};
