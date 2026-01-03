/**
 * Shared TypeScript types for Turbo-V2 Experiment Dashboard
 */

export type ExperimentStatus = "pending" | "running" | "completed" | "failed";

export type RunStatus = "pending" | "running" | "completed" | "failed";

export type SampleName = "tiny-qs" | "small-axios" | "medium-chart";

/**
 * Processing mode for experiments
 */
export type ProcessingMode = "turbo-v2" | "sequential";

/**
 * Token usage tracking
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Cost tracking (in USD)
 */
export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

/**
 * Custom preset configuration
 */
export interface PresetConfig {
  id: string;
  name: string;
  description?: string;
  passes: PassConfig[];
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Pass configuration within a preset
 */
export interface PassConfig {
  processor: "rename" | "refine" | "analyze" | "transform";
  mode: "parallel" | "streaming" | "sequential";
  concurrency: number;
  model?: string;
  filter?: string;
}

/**
 * Built-in preset names
 */
export type BuiltInPresetName = "fast" | "balanced" | "thorough" | "quality" | "anchor";

/**
 * Experiment configuration
 * An Experiment is a unique combination of parameters.
 * Experiments can be run multiple times, each creating a new Run.
 */
export interface ExperimentConfig {
  id: string;
  name: string;
  preset: string; // Can be built-in name or custom preset ID
  presetConfig?: PresetConfig; // Snapshot of preset at creation time
  samples: SampleName[];
  mode: ProcessingMode;
  isBaseline: boolean;
  createdAt: string;
  tags?: string[];
  notes?: string;
  // Git commit SHA when experiment was created
  gitCommitSha?: string;
  // Hash of parameters for deduplication (preset + samples + mode)
  parameterHash: string;
  // Run tracking
  runCount: number;
  lastRunId?: string;
  lastRunAt?: string;
  // Aggregate stats across all runs (for quick display)
  bestScore?: number;
  averageScore?: number;
}

/**
 * A Run is a single execution of an Experiment
 */
export interface Run {
  id: string;
  experimentId: string;
  runNumber: number; // 1, 2, 3, etc.
  status: RunStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  // Git commit SHA when this run was executed
  gitCommitSha?: string;
  // Job directory for this run (for ledger access)
  jobDir?: string;
  // Results for this specific run
  results: SampleResult[];
  averageScore?: number;
  totalDuration?: number;
  totalTokens?: TokenUsage;
  totalCost?: CostBreakdown;
  // Logs for this run
  consoleLogs?: ConsoleLogEntry[];
}

/**
 * Run summary for list views
 */
export interface RunSummary {
  id: string;
  runNumber: number;
  status: RunStatus;
  createdAt: string;
  completedAt?: string;
  averageScore?: number;
  totalDuration?: number;
  totalCost?: CostBreakdown;
  gitCommitSha?: string;
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
  tokens?: TokenUsage;
  cost?: CostBreakdown;
  identifiersProcessed?: number;
  identifiersRenamed?: number;
  explanation?: string;
}

/**
 * Console log entry during execution
 */
export interface ConsoleLogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  sample?: SampleName;
  pass?: number;
}

/**
 * Full experiment with runs
 */
export interface ExperimentWithRuns extends ExperimentConfig {
  runs: RunSummary[];
}

/**
 * Legacy: Full experiment with results (for backward compatibility during migration)
 * @deprecated Use ExperimentWithRuns and Run instead
 */
export interface ExperimentWithResults extends ExperimentConfig {
  results: SampleResult[];
  averageScore?: number;
  totalDuration?: number;
  totalTokens?: TokenUsage;
  totalCost?: CostBreakdown;
  consoleLogs?: ConsoleLogEntry[];
  // New fields for Run support
  runs?: RunSummary[];
  status: ExperimentStatus; // Derived from latest run
}

/**
 * API request/response types
 */
export interface CreateExperimentRequest {
  name?: string; // Optional - auto-generate if not provided
  preset: string;
  samples: SampleName[];
  mode?: ProcessingMode;
  isBaseline?: boolean;
  tags?: string[];
  notes?: string;
}

export interface CreateExperimentResponse {
  experiment: ExperimentConfig;
  // True if we found an existing experiment with the same parameters
  existing: boolean;
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
  runId: string;
  runNumber: number;
}

/**
 * Run-related API types
 */
export interface GetRunResponse {
  run: Run;
}

export interface ListRunsResponse {
  runs: RunSummary[];
}

export interface ExperimentStatusResponse {
  experimentId: string;
  status: ExperimentStatus;
  currentSample?: SampleName;
  currentPass?: number;
  totalPasses?: number;
  completedSamples: number;
  totalSamples: number;
  progress?: number; // 0-100
  recentLogs?: ConsoleLogEntry[];
}

/**
 * Preset CRUD types
 */
export interface CreatePresetRequest {
  name: string;
  description?: string;
  passes: PassConfig[];
}

export interface UpdatePresetRequest {
  name?: string;
  description?: string;
  passes?: PassConfig[];
}

export interface ListPresetsResponse {
  presets: PresetConfig[];
}

/**
 * Filter options for experiment list
 */
export interface ExperimentFilters {
  status?: ExperimentStatus[];
  preset?: string[];
  mode?: ProcessingMode[];
  isBaseline?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/**
 * Comparison data for charts
 */
export interface ComparisonChartData {
  samples: SampleName[];
  experiments: {
    id: string;
    name: string;
    isBaseline: boolean;
    scores: Record<SampleName, number | null>;
    durations: Record<SampleName, number | null>;
    costs: Record<SampleName, number | null>;
  }[];
}

/**
 * ============================================================
 * IDENTIFIER-LEVEL DETAILS (Option E: Index into Vault)
 * ============================================================
 */

/**
 * Identifier detail with status and metadata
 */
export interface IdentifierDetail {
  id: string; // Stable identifier ID (binding + location)
  oldName: string;
  newName: string;
  status: "renamed" | "unchanged" | "skipped";
  confidence?: number; // 0-1 confidence score
  batchNumber: number;
  passNumber: number;
  vaultHash?: string; // For context lookup (if available)
}

/**
 * Pass summary with identifier counts
 */
export interface PassDetail {
  passNumber: number;
  processor: string;
  mode: string;
  concurrency: number;
  identifierCount: number;
  renamedCount: number;
  unchangedCount: number;
  skippedCount: number;
  duration?: number; // milliseconds
  tokensUsed?: number;
  batches: number;
}

/**
 * Identifier context from vault
 */
export interface IdentifierContext {
  context: string; // Surrounding code sent to LLM
  prompt: string; // Full prompt sent to LLM
  response: string; // Full response from LLM
  available: boolean; // False if vault entry was evicted
  model?: string;
  timestamp?: string;
}

/**
 * API responses for identifier details
 */
export interface ListPassesResponse {
  passes: PassDetail[];
}

export interface ListIdentifiersResponse {
  identifiers: IdentifierDetail[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface GetIdentifierContextResponse {
  context: IdentifierContext;
}

/**
 * Query parameters for identifier listing
 */
export interface ListIdentifiersQuery {
  page?: number;
  limit?: number;
  status?: "renamed" | "unchanged" | "skipped" | "all";
  sort?: "id" | "oldName" | "newName" | "confidence";
  order?: "asc" | "desc";
}
