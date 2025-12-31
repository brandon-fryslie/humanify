/**
 * JSON file storage for experiments
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, unlinkSync } from "fs";
import { join } from "path";
import { ExperimentConfig, ExperimentWithResults, SampleResult } from "../shared/types.js";

const STORAGE_DIR = ".humanify-experiments";
const STORAGE_FILE = join(STORAGE_DIR, "experiments.json");

interface StorageData {
  experiments: Record<string, ExperimentConfig>;
  results: Record<string, SampleResult[]>;
}

/**
 * Ensure storage directory exists
 */
function ensureStorageDir(): void {
  if (!existsSync(STORAGE_DIR)) {
    mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Read storage data from JSON file
 */
function readStorage(): StorageData {
  ensureStorageDir();

  if (!existsSync(STORAGE_FILE)) {
    return { experiments: {}, results: {} };
  }

  try {
    const content = readFileSync(STORAGE_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to read storage file:", error);
    return { experiments: {}, results: {} };
  }
}

/**
 * Write storage data to JSON file (atomic)
 */
function writeStorage(data: StorageData): void {
  ensureStorageDir();

  const tempFile = `${STORAGE_FILE}.tmp`;

  try {
    // Write to temp file
    writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");

    // Atomic rename
    renameSync(tempFile, STORAGE_FILE);
  } catch (error) {
    // Cleanup on error
    if (existsSync(tempFile)) {
      try {
        unlinkSync(tempFile);
      } catch {
        // Ignore cleanup errors
      }
    }
    throw error;
  }
}

/**
 * Storage API
 */
export const storage = {
  /**
   * List all experiments
   */
  listExperiments(): ExperimentConfig[] {
    const data = readStorage();
    return Object.values(data.experiments);
  },

  /**
   * Get single experiment with results
   */
  getExperiment(id: string): ExperimentWithResults | null {
    const data = readStorage();
    const experiment = data.experiments[id];

    if (!experiment) {
      return null;
    }

    const results = data.results[id] || [];
    const averageScore = results.length > 0
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length
      : undefined;
    const totalDuration = results.length > 0
      ? results.reduce((sum, r) => sum + r.duration, 0)
      : undefined;

    return {
      ...experiment,
      results,
      averageScore,
      totalDuration,
    };
  },

  /**
   * Create new experiment
   */
  createExperiment(experiment: ExperimentConfig): void {
    const data = readStorage();
    data.experiments[experiment.id] = experiment;
    data.results[experiment.id] = [];
    writeStorage(data);
  },

  /**
   * Update experiment
   */
  updateExperiment(id: string, updates: Partial<ExperimentConfig>): void {
    const data = readStorage();

    if (!data.experiments[id]) {
      throw new Error(`Experiment ${id} not found`);
    }

    data.experiments[id] = {
      ...data.experiments[id],
      ...updates,
    };

    writeStorage(data);
  },

  /**
   * Delete experiment
   */
  deleteExperiment(id: string): void {
    const data = readStorage();
    delete data.experiments[id];
    delete data.results[id];
    writeStorage(data);
  },

  /**
   * Add sample result to experiment
   */
  addSampleResult(experimentId: string, result: SampleResult): void {
    const data = readStorage();

    if (!data.experiments[experimentId]) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    if (!data.results[experimentId]) {
      data.results[experimentId] = [];
    }

    data.results[experimentId].push(result);
    writeStorage(data);
  },

  /**
   * Get sample results for experiment
   */
  getSampleResults(experimentId: string): SampleResult[] {
    const data = readStorage();
    return data.results[experimentId] || [];
  },
};
