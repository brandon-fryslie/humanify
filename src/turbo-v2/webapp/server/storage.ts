/**
 * JSON file storage for experiments and presets
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, unlinkSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { createHash } from "crypto";
import {
  ExperimentConfig,
  ExperimentWithResults,
  SampleResult,
  PresetConfig,
  PassConfig,
  ConsoleLogEntry,
  TokenUsage,
  CostBreakdown,
  BuiltInPresetName,
  Run,
  RunSummary,
  RunStatus,
  ProcessingMode,
  SampleName,
} from "../shared/types.js";

const STORAGE_DIR = ".humanify-experiments";
const EXPERIMENTS_FILE = join(STORAGE_DIR, "experiments.json");
const PRESETS_FILE = join(STORAGE_DIR, "presets.json");
const RUNS_FILE = join(STORAGE_DIR, "runs.json");

/**
 * Active job tracking for SSE progress
 */
interface ActiveJob {
  experimentId: string;
  sample: string;
  jobDir: string;
  pid?: number;
  startedAt: string;
}

/**
 * Progress tracking for an experiment
 */
interface ExperimentProgress {
  currentSample?: string;
  currentPass?: number;
  totalPasses?: number;
  completedSamples: number;
  totalSamples: number;
  progress: number; // 0-100
}

interface ExperimentsData {
  experiments: Record<string, ExperimentConfig>;
  results: Record<string, SampleResult[]>;
  consoleLogs: Record<string, ConsoleLogEntry[]>;
  activeJobs: Record<string, ActiveJob>; // key = experimentId-sample
  progress: Record<string, ExperimentProgress>; // key = experimentId
}

interface PresetsData {
  presets: Record<string, PresetConfig>;
}

interface RunsData {
  runs: Record<string, Run>;
  // Index by experiment ID for quick lookup
  byExperiment: Record<string, string[]>; // experimentId -> runIds
}

/**
 * Get current git commit SHA
 */
function getGitCommitSha(): string | undefined {
  try {
    const sha = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
    return sha;
  } catch {
    return undefined;
  }
}

/**
 * Generate parameter hash for experiment deduplication
 * Hash includes: preset, samples (sorted), mode
 */
function generateParameterHash(preset: string, samples: string[], mode: string): string {
  const sortedSamples = [...samples].sort();
  const data = JSON.stringify({ preset, samples: sortedSamples, mode });
  return createHash("sha256").update(data).digest("hex").slice(0, 16);
}

/**
 * Built-in presets that cannot be deleted
 */
const BUILT_IN_PRESETS: Record<BuiltInPresetName, PresetConfig> = {
  fast: {
    id: "fast",
    name: "Fast",
    description: "Maximum speed with good quality. 2-pass parallel rename.",
    isBuiltIn: true,
    createdAt: "2025-01-01T00:00:00Z",
    passes: [
      { processor: "rename", mode: "parallel", concurrency: 50 },
      { processor: "rename", mode: "parallel", concurrency: 50 },
    ],
  },
  balanced: {
    id: "balanced",
    name: "Balanced",
    description: "Good quality/speed trade-off with explicit refinement.",
    isBuiltIn: true,
    createdAt: "2025-01-01T00:00:00Z",
    passes: [
      { processor: "rename", mode: "parallel", concurrency: 50 },
      { processor: "refine", mode: "parallel", concurrency: 50 },
    ],
  },
  thorough: {
    id: "thorough",
    name: "Thorough",
    description: "Three-pass pipeline: rename, rename, refine.",
    isBuiltIn: true,
    createdAt: "2025-01-01T00:00:00Z",
    passes: [
      { processor: "rename", mode: "parallel", concurrency: 50 },
      { processor: "rename", mode: "parallel", concurrency: 50 },
      { processor: "refine", mode: "parallel", concurrency: 50 },
    ],
  },
  quality: {
    id: "quality",
    name: "Quality",
    description: "Maximum quality with 5 passes including analysis and sequential low-confidence.",
    isBuiltIn: true,
    createdAt: "2025-01-01T00:00:00Z",
    passes: [
      { processor: "rename", mode: "parallel", concurrency: 50 },
      { processor: "refine", mode: "parallel", concurrency: 50 },
      { processor: "analyze", mode: "parallel", concurrency: 100 },
      { processor: "rename", mode: "sequential", concurrency: 1, filter: "low-confidence" },
      { processor: "transform", mode: "parallel", concurrency: 100 },
    ],
  },
  anchor: {
    id: "anchor",
    name: "Anchor",
    description: "Anchor-first strategy for large files with clear hierarchy.",
    isBuiltIn: true,
    createdAt: "2025-01-01T00:00:00Z",
    passes: [
      { processor: "analyze", mode: "parallel", concurrency: 100 },
      { processor: "rename", mode: "sequential", concurrency: 1, filter: "anchors" },
      { processor: "rename", mode: "parallel", concurrency: 50 },
      { processor: "refine", mode: "parallel", concurrency: 50 },
    ],
  },
};

/**
 * Ensure storage directory exists
 */
function ensureStorageDir(): void {
  if (!existsSync(STORAGE_DIR)) {
    mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Read experiments data from JSON file
 */
function readExperiments(): ExperimentsData {
  ensureStorageDir();

  if (!existsSync(EXPERIMENTS_FILE)) {
    return { experiments: {}, results: {}, consoleLogs: {}, activeJobs: {}, progress: {} };
  }

  try {
    const content = readFileSync(EXPERIMENTS_FILE, "utf-8");
    const data = JSON.parse(content);
    // Add missing fields (migration)
    if (!data.consoleLogs) {
      data.consoleLogs = {};
    }
    if (!data.activeJobs) {
      data.activeJobs = {};
    }
    if (!data.progress) {
      data.progress = {};
    }
    return data;
  } catch (error) {
    console.error("Failed to read experiments file:", error);
    return { experiments: {}, results: {}, consoleLogs: {}, activeJobs: {}, progress: {} };
  }
}

/**
 * Write experiments data to JSON file (atomic)
 */
function writeExperiments(data: ExperimentsData): void {
  ensureStorageDir();

  const tempFile = `${EXPERIMENTS_FILE}.tmp`;

  try {
    writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    renameSync(tempFile, EXPERIMENTS_FILE);
  } catch (error) {
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
 * Read presets data from JSON file
 */
function readPresets(): PresetsData {
  ensureStorageDir();

  if (!existsSync(PRESETS_FILE)) {
    return { presets: {} };
  }

  try {
    const content = readFileSync(PRESETS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to read presets file:", error);
    return { presets: {} };
  }
}

/**
 * Write presets data to JSON file (atomic)
 */
function writePresets(data: PresetsData): void {
  ensureStorageDir();

  const tempFile = `${PRESETS_FILE}.tmp`;

  try {
    writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    renameSync(tempFile, PRESETS_FILE);
  } catch (error) {
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
 * Read runs data from JSON file
 */
function readRuns(): RunsData {
  ensureStorageDir();

  if (!existsSync(RUNS_FILE)) {
    return { runs: {}, byExperiment: {} };
  }

  try {
    const content = readFileSync(RUNS_FILE, "utf-8");
    const data = JSON.parse(content);
    if (!data.byExperiment) {
      data.byExperiment = {};
    }
    return data;
  } catch (error) {
    console.error("Failed to read runs file:", error);
    return { runs: {}, byExperiment: {} };
  }
}

/**
 * Write runs data to JSON file (atomic)
 */
function writeRuns(data: RunsData): void {
  ensureStorageDir();

  const tempFile = `${RUNS_FILE}.tmp`;

  try {
    writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    renameSync(tempFile, RUNS_FILE);
  } catch (error) {
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
 * Generate auto experiment name
 */
function generateExperimentName(preset: string, mode: string): string {
  const timestamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
  return `${preset}-${mode}-${timestamp}`;
}

/**
 * Aggregate token usage from results
 */
function aggregateTokens(results: SampleResult[]): TokenUsage | undefined {
  const withTokens = results.filter((r) => r.tokens);
  if (withTokens.length === 0) return undefined;

  return {
    promptTokens: withTokens.reduce((sum, r) => sum + (r.tokens?.promptTokens || 0), 0),
    completionTokens: withTokens.reduce((sum, r) => sum + (r.tokens?.completionTokens || 0), 0),
    totalTokens: withTokens.reduce((sum, r) => sum + (r.tokens?.totalTokens || 0), 0),
  };
}

/**
 * Aggregate costs from results
 */
function aggregateCosts(results: SampleResult[]): CostBreakdown | undefined {
  const withCosts = results.filter((r) => r.cost);
  if (withCosts.length === 0) return undefined;

  return {
    inputCost: withCosts.reduce((sum, r) => sum + (r.cost?.inputCost || 0), 0),
    outputCost: withCosts.reduce((sum, r) => sum + (r.cost?.outputCost || 0), 0),
    totalCost: withCosts.reduce((sum, r) => sum + (r.cost?.totalCost || 0), 0),
  };
}

/**
 * Storage API for experiments
 */
export const storage = {
  /**
   * List all experiments
   */
  listExperiments(): ExperimentConfig[] {
    const data = readExperiments();
    return Object.values(data.experiments).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Get single experiment with results
   */
  getExperiment(id: string): ExperimentWithResults | null {
    const data = readExperiments();
    const experiment = data.experiments[id];

    if (!experiment) {
      return null;
    }

    const results = data.results[id] || [];
    const consoleLogs = data.consoleLogs[id] || [];

    const validScores = results.filter((r) => r.score > 0);
    const averageScore = validScores.length > 0
      ? validScores.reduce((sum, r) => sum + r.score, 0) / validScores.length
      : undefined;
    const totalDuration = results.length > 0
      ? results.reduce((sum, r) => sum + r.duration, 0)
      : undefined;

    return {
      ...experiment,
      results,
      averageScore,
      totalDuration,
      totalTokens: aggregateTokens(results),
      totalCost: aggregateCosts(results),
      consoleLogs,
    };
  },

  /**
   * Create new experiment (or return existing one with same parameters)
   * Returns { experiment, existing } where existing=true if we found a duplicate
   */
  createExperiment(
    preset: string,
    samples: string[],
    options: {
      name?: string;
      mode?: "turbo-v2" | "sequential";
      isBaseline?: boolean;
      tags?: string[];
      notes?: string;
    } = {}
  ): { experiment: ExperimentConfig; existing: boolean } {
    const data = readExperiments();
    const mode = options.mode || "turbo-v2";
    const parameterHash = generateParameterHash(preset, samples, mode);

    // Check for existing experiment with same parameters
    const existingExperiment = Object.values(data.experiments).find(
      (exp) => exp.parameterHash === parameterHash
    );

    if (existingExperiment) {
      // Return existing experiment - no duplicate creation
      return { experiment: existingExperiment, existing: true };
    }

    // Create new experiment
    const id = `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const name = options.name || generateExperimentName(preset, mode);

    // Get preset config snapshot
    const presetConfig = presetStorage.getPreset(preset);

    const experiment: ExperimentConfig = {
      id,
      name,
      preset,
      presetConfig: presetConfig || undefined,
      samples: samples as SampleName[],
      mode,
      isBaseline: options.isBaseline || false,
      createdAt: new Date().toISOString(),
      tags: options.tags,
      notes: options.notes,
      gitCommitSha: getGitCommitSha(),
      parameterHash,
      runCount: 0,
    };

    data.experiments[id] = experiment;
    data.results[id] = [];
    data.consoleLogs[id] = [];
    writeExperiments(data);

    return { experiment, existing: false };
  },

  /**
   * Update experiment
   */
  updateExperiment(id: string, updates: Partial<ExperimentConfig>): void {
    const data = readExperiments();

    if (!data.experiments[id]) {
      throw new Error(`Experiment ${id} not found`);
    }

    data.experiments[id] = {
      ...data.experiments[id],
      ...updates,
    };

    writeExperiments(data);
  },

  /**
   * Delete experiment
   */
  deleteExperiment(id: string): void {
    const data = readExperiments();
    delete data.experiments[id];
    delete data.results[id];
    delete data.consoleLogs[id];
    writeExperiments(data);
  },

  /**
   * Add sample result to experiment
   */
  addSampleResult(experimentId: string, result: SampleResult): void {
    const data = readExperiments();

    if (!data.experiments[experimentId]) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    if (!data.results[experimentId]) {
      data.results[experimentId] = [];
    }

    data.results[experimentId].push(result);
    writeExperiments(data);
  },

  /**
   * Add console log entry
   */
  addConsoleLog(experimentId: string, entry: ConsoleLogEntry): void {
    const data = readExperiments();

    if (!data.consoleLogs[experimentId]) {
      data.consoleLogs[experimentId] = [];
    }

    data.consoleLogs[experimentId].push(entry);

    // Keep only last 1000 logs per experiment
    if (data.consoleLogs[experimentId].length > 1000) {
      data.consoleLogs[experimentId] = data.consoleLogs[experimentId].slice(-1000);
    }

    writeExperiments(data);
  },

  /**
   * Get recent console logs
   */
  getRecentLogs(experimentId: string, limit: number = 50): ConsoleLogEntry[] {
    const data = readExperiments();
    const logs = data.consoleLogs[experimentId] || [];
    return logs.slice(-limit);
  },

  /**
   * Get sample results for experiment
   */
  getSampleResults(experimentId: string): SampleResult[] {
    const data = readExperiments();
    return data.results[experimentId] || [];
  },

  /**
   * Set experiment as baseline
   */
  setBaseline(id: string, isBaseline: boolean): void {
    const data = readExperiments();

    if (!data.experiments[id]) {
      throw new Error(`Experiment ${id} not found`);
    }

    data.experiments[id].isBaseline = isBaseline;
    writeExperiments(data);
  },

  /**
   * Get baseline experiments
   */
  getBaselines(): ExperimentConfig[] {
    const data = readExperiments();
    return Object.values(data.experiments).filter((e) => e.isBaseline);
  },

  /**
   * Set active job for an experiment/sample
   */
  setActiveJob(experimentId: string, sample: string, jobDir: string, pid?: number): void {
    const data = readExperiments();
    const key = `${experimentId}-${sample}`;

    data.activeJobs[key] = {
      experimentId,
      sample,
      jobDir,
      pid,
      startedAt: new Date().toISOString(),
    };

    writeExperiments(data);
  },

  /**
   * Get active job for an experiment/sample
   */
  getActiveJob(experimentId: string, sample: string): ActiveJob | null {
    const data = readExperiments();
    const key = `${experimentId}-${sample}`;
    return data.activeJobs[key] || null;
  },

  /**
   * Clear active job for an experiment/sample
   */
  clearActiveJob(experimentId: string, sample: string): void {
    const data = readExperiments();
    const key = `${experimentId}-${sample}`;
    delete data.activeJobs[key];
    writeExperiments(data);
  },

  /**
   * Clear all active jobs for an experiment
   */
  clearAllActiveJobs(experimentId: string): void {
    const data = readExperiments();

    // Find all jobs for this experiment
    for (const key of Object.keys(data.activeJobs)) {
      if (key.startsWith(`${experimentId}-`)) {
        delete data.activeJobs[key];
      }
    }

    writeExperiments(data);
  },

  /**
   * Update experiment progress
   */
  updateProgress(experimentId: string, progress: Partial<ExperimentProgress>): void {
    const data = readExperiments();

    if (!data.progress[experimentId]) {
      data.progress[experimentId] = {
        completedSamples: 0,
        totalSamples: 0,
        progress: 0,
      };
    }

    data.progress[experimentId] = {
      ...data.progress[experimentId],
      ...progress,
    };

    writeExperiments(data);
  },

  /**
   * Get experiment progress
   */
  getExperimentProgress(experimentId: string): ExperimentProgress | null {
    const data = readExperiments();
    return data.progress[experimentId] || null;
  },

  /**
   * Clear experiment progress
   */
  clearProgress(experimentId: string): void {
    const data = readExperiments();
    delete data.progress[experimentId];
    writeExperiments(data);
  },

  /**
   * Cancel a running experiment
   */
  cancelExperiment(experimentId: string): boolean {
    const data = readExperiments();
    const experiment = data.experiments[experimentId];

    if (!experiment || experiment.status !== "running") {
      return false;
    }

    // Update status
    experiment.status = "failed";
    experiment.completedAt = new Date().toISOString();

    // Clear active jobs
    for (const key of Object.keys(data.activeJobs)) {
      if (key.startsWith(`${experimentId}-`)) {
        const job = data.activeJobs[key];
        // Note: Actual process killing would need to be done by the caller
        // since we don't have direct access to the running process here
        delete data.activeJobs[key];
      }
    }

    // Clear progress
    delete data.progress[experimentId];

    writeExperiments(data);
    return true;
  },
};

/**
 * Storage API for presets
 */
export const presetStorage = {
  /**
   * List all presets (built-in + custom)
   */
  listPresets(): PresetConfig[] {
    const customData = readPresets();
    const builtIn = Object.values(BUILT_IN_PRESETS);
    const custom = Object.values(customData.presets);
    return [...builtIn, ...custom];
  },

  /**
   * Get preset by ID
   */
  getPreset(id: string): PresetConfig | null {
    // Check built-in first
    if (id in BUILT_IN_PRESETS) {
      return BUILT_IN_PRESETS[id as BuiltInPresetName];
    }

    // Check custom
    const data = readPresets();
    return data.presets[id] || null;
  },

  /**
   * Create custom preset
   */
  createPreset(
    name: string,
    passes: PassConfig[],
    description?: string
  ): PresetConfig {
    const data = readPresets();
    const id = `preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const preset: PresetConfig = {
      id,
      name,
      description,
      passes,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    };

    data.presets[id] = preset;
    writePresets(data);

    return preset;
  },

  /**
   * Update custom preset
   */
  updatePreset(
    id: string,
    updates: { name?: string; description?: string; passes?: PassConfig[] }
  ): PresetConfig {
    // Cannot update built-in presets
    if (id in BUILT_IN_PRESETS) {
      throw new Error("Cannot modify built-in presets");
    }

    const data = readPresets();

    if (!data.presets[id]) {
      throw new Error(`Preset ${id} not found`);
    }

    data.presets[id] = {
      ...data.presets[id],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    writePresets(data);
    return data.presets[id];
  },

  /**
   * Delete custom preset
   */
  deletePreset(id: string): void {
    // Cannot delete built-in presets
    if (id in BUILT_IN_PRESETS) {
      throw new Error("Cannot delete built-in presets");
    }

    const data = readPresets();
    delete data.presets[id];
    writePresets(data);
  },

  /**
   * Get built-in presets only
   */
  getBuiltInPresets(): PresetConfig[] {
    return Object.values(BUILT_IN_PRESETS);
  },
};

/**
 * Storage API for runs
 */
export const runStorage = {
  /**
   * Create a new run for an experiment
   */
  createRun(experimentId: string): Run {
    const expData = readExperiments();
    const experiment = expData.experiments[experimentId];

    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const runsData = readRuns();

    // Calculate run number
    const existingRuns = runsData.byExperiment[experimentId] || [];
    const runNumber = existingRuns.length + 1;

    const runId = `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const run: Run = {
      id: runId,
      experimentId,
      runNumber,
      status: "pending",
      createdAt: new Date().toISOString(),
      gitCommitSha: getGitCommitSha(),
      results: [],
    };

    runsData.runs[runId] = run;

    // Update index
    if (!runsData.byExperiment[experimentId]) {
      runsData.byExperiment[experimentId] = [];
    }
    runsData.byExperiment[experimentId].push(runId);

    writeRuns(runsData);

    // Update experiment run count
    experiment.runCount = runNumber;
    experiment.lastRunId = runId;
    experiment.lastRunAt = run.createdAt;
    expData.experiments[experimentId] = experiment;
    writeExperiments(expData);

    return run;
  },

  /**
   * Get a run by ID
   */
  getRun(runId: string): Run | null {
    const data = readRuns();
    return data.runs[runId] || null;
  },

  /**
   * Get all runs for an experiment
   */
  getRunsForExperiment(experimentId: string): RunSummary[] {
    const data = readRuns();
    const runIds = data.byExperiment[experimentId] || [];

    return runIds
      .map((id) => {
        const run = data.runs[id];
        if (!run) return null;

        return {
          id: run.id,
          runNumber: run.runNumber,
          status: run.status,
          createdAt: run.createdAt,
          completedAt: run.completedAt,
          averageScore: run.averageScore,
          totalDuration: run.totalDuration,
          totalCost: run.totalCost,
          gitCommitSha: run.gitCommitSha,
        } as RunSummary;
      })
      .filter((r): r is RunSummary => r !== null)
      .sort((a, b) => b.runNumber - a.runNumber); // Most recent first
  },

  /**
   * Update a run
   */
  updateRun(runId: string, updates: Partial<Run>): void {
    const data = readRuns();

    if (!data.runs[runId]) {
      throw new Error(`Run ${runId} not found`);
    }

    data.runs[runId] = {
      ...data.runs[runId],
      ...updates,
    };

    writeRuns(data);

    // Update experiment aggregate stats if this run completed
    if (updates.status === "completed" && updates.averageScore !== undefined) {
      const run = data.runs[runId];
      const expData = readExperiments();
      const experiment = expData.experiments[run.experimentId];

      if (experiment) {
        // Update best score
        if (!experiment.bestScore || updates.averageScore > experiment.bestScore) {
          experiment.bestScore = updates.averageScore;
        }

        // Calculate new average across all completed runs
        const allRuns = runStorage.getRunsForExperiment(run.experimentId);
        const completedRuns = allRuns.filter((r) => r.status === "completed" && r.averageScore !== undefined);
        if (completedRuns.length > 0) {
          experiment.averageScore =
            completedRuns.reduce((sum, r) => sum + (r.averageScore || 0), 0) / completedRuns.length;
        }

        expData.experiments[run.experimentId] = experiment;
        writeExperiments(expData);
      }
    }
  },

  /**
   * Add sample result to a run
   */
  addSampleResult(runId: string, result: SampleResult): void {
    const data = readRuns();
    const run = data.runs[runId];

    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    run.results.push(result);

    // Update aggregates
    const validScores = run.results.filter((r) => r.score > 0);
    run.averageScore =
      validScores.length > 0 ? validScores.reduce((sum, r) => sum + r.score, 0) / validScores.length : undefined;
    run.totalDuration = run.results.reduce((sum, r) => sum + r.duration, 0);
    run.totalTokens = aggregateTokens(run.results);
    run.totalCost = aggregateCosts(run.results);

    writeRuns(data);
  },

  /**
   * Add console log to a run
   */
  addConsoleLog(runId: string, entry: ConsoleLogEntry): void {
    const data = readRuns();
    const run = data.runs[runId];

    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    if (!run.consoleLogs) {
      run.consoleLogs = [];
    }

    run.consoleLogs.push(entry);

    // Keep only last 1000 logs per run
    if (run.consoleLogs.length > 1000) {
      run.consoleLogs = run.consoleLogs.slice(-1000);
    }

    writeRuns(data);
  },

  /**
   * Get console logs for a run
   */
  getConsoleLogs(runId: string, limit: number = 100): ConsoleLogEntry[] {
    const data = readRuns();
    const run = data.runs[runId];

    if (!run) {
      return [];
    }

    const logs = run.consoleLogs || [];
    return logs.slice(-limit);
  },

  /**
   * Get latest run for an experiment
   */
  getLatestRun(experimentId: string): Run | null {
    const data = readRuns();
    const runIds = data.byExperiment[experimentId] || [];

    if (runIds.length === 0) return null;

    // Find the run with highest runNumber
    let latestRun: Run | null = null;
    for (const id of runIds) {
      const run = data.runs[id];
      if (run && (!latestRun || run.runNumber > latestRun.runNumber)) {
        latestRun = run;
      }
    }

    return latestRun;
  },
};
