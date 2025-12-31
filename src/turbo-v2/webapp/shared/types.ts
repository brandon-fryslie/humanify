/**
 * Shared TypeScript types for Turbo-V2 Experiment Dashboard
 */

export type ExperimentStatus = "pending" | "running" | "completed" | "failed";

export type PresetName = "fast" | "balanced" | "thorough" | "quality" | "anchor";

export type SampleName = "tiny-qs" | "small-axios" | "medium-chart";

/**
 * Experiment configuration
 */
export interface ExperimentConfig {
  id: string;
  name: string;
  preset: PresetName;
  samples: SampleName[];
  status: ExperimentStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Result for a single sample in an experiment
 */
export interface SampleResult {
  sample: SampleName;
  score: number;
  duration: number; // seconds
  outputPath?: string;
  error?: string;
}

/**
 * Full experiment with results
 */
export interface ExperimentWithResults extends ExperimentConfig {
  results: SampleResult[];
  averageScore?: number;
  totalDuration?: number;
}

/**
 * API request/response types
 */
export interface CreateExperimentRequest {
  name: string;
  preset: PresetName;
  samples: SampleName[];
}

export interface CreateExperimentResponse {
  experiment: ExperimentConfig;
}

export interface ListExperimentsResponse {
  experiments: ExperimentConfig[];
}

export interface GetExperimentResponse {
  experiment: ExperimentWithResults;
}

export interface RunExperimentResponse {
  message: string;
  experimentId: string;
}

export interface ExperimentStatusResponse {
  experimentId: string;
  status: ExperimentStatus;
  currentSample?: SampleName;
  completedSamples: number;
  totalSamples: number;
}
