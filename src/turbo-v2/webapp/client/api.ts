/**
 * API client for experiments
 */

import {
  ExperimentConfig,
  ExperimentWithResults,
  CreateExperimentRequest,
  ExperimentStatusResponse,
} from "../shared/types";

const API_BASE = "/api";

export const api = {
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
  async createExperiment(
    request: CreateExperimentRequest
  ): Promise<ExperimentConfig> {
    const response = await fetch(`${API_BASE}/experiments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
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
   * Run experiment
   */
  async runExperiment(id: string): Promise<void> {
    await fetch(`${API_BASE}/experiments/${id}/run`, {
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
};
