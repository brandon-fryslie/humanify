import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryIcon from "@mui/icons-material/History";
import { api } from "../api";
import { useExperimentProgress, formatTokens as formatProgressTokens } from "../hooks/useExperimentProgress";
import { PassDetailView } from "./PassDetailView";
import type {
  ExperimentWithResults,
  ConsoleLogEntry,
  ProcessingMode,
  ExperimentStatus,
  RunSummary,
  RunStatus,
  Run,
} from "@shared/types";

interface ExperimentDetailProps {
  open: boolean;
  experimentId: string | null;
  onClose: () => void;
  onRun: (id: string) => void;
  onRefresh: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function StatusBadge({ status }: { status: ExperimentStatus }) {
  const colorMap: Record<ExperimentStatus, "default" | "info" | "success" | "error"> = {
    pending: "default",
    running: "info",
    completed: "success",
    failed: "error",
  };

  return <Chip label={status} color={colorMap[status]} size="small" />;
}

function ModeBadge({ mode }: { mode?: ProcessingMode }) {
  const isTurbo = mode === "turbo-v2";
  return (
    <Chip
      label={isTurbo ? "Turbo V2" : "Sequential"}
      color={isTurbo ? "primary" : "default"}
      size="small"
      variant={isTurbo ? "filled" : "outlined"}
    />
  );
}

function RunStatusBadge({ status }: { status: RunStatus }) {
  const colorMap: Record<RunStatus, "default" | "info" | "success" | "error"> = {
    pending: "default",
    running: "info",
    completed: "success",
    failed: "error",
  };

  return <Chip label={status} color={colorMap[status]} size="small" />;
}

function LogLevelBadge({ level }: { level: string }) {
  const colorMap: Record<string, "default" | "info" | "success" | "error" | "warning"> = {
    info: "info",
    warn: "warning",
    error: "error",
    debug: "default",
    log: "default",
  };

  return (
    <Chip
      label={level}
      color={colorMap[level] || "default"}
      size="small"
      variant="outlined"
      sx={{ minWidth: 50 }}
    />
  );
}

/**
 * Real-time progress display component
 */
function ProgressDisplay({
  experimentId,
  isRunning,
  onComplete,
}: {
  experimentId: string | null;
  isRunning: boolean;
  onComplete: () => void;
}) {
  const { progress, isConnected } = useExperimentProgress(
    isRunning ? experimentId : null,
    {
      onComplete: () => {
        onComplete();
      },
    }
  );

  if (!isRunning || progress.status === "idle") {
    return null;
  }

  const passPercent = progress.totalPasses > 0
    ? Math.round((progress.currentPass / progress.totalPasses) * 100)
    : 0;

  const batchPercent = progress.totalBatches > 0
    ? Math.round((progress.currentBatch / progress.totalBatches) * 100)
    : 0;

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: "#f5f5f5" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Chip
          label={isConnected ? "Live" : "Connecting..."}
          color={isConnected ? "success" : "warning"}
          size="small"
          variant="outlined"
        />
        <Typography variant="subtitle2">
          {progress.currentSample && `Processing: ${progress.currentSample}`}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="caption" color="text.secondary">
          {progress.progress}% complete
        </Typography>
      </Box>

      {/* Pass Progress */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2">
            Pass {progress.currentPass}/{progress.totalPasses}
            {progress.passProcessor && ` (${progress.passProcessor})`}
          </Typography>
          <Typography variant="body2">{passPercent}%</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={passPercent}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>

      {/* Batch Progress (if available) */}
      {progress.totalBatches > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="body2">
              Batch {progress.currentBatch}/{progress.totalBatches}
            </Typography>
            <Typography variant="body2">{batchPercent}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={batchPercent}
            color="secondary"
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>
      )}

      {/* Live Stats */}
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Identifiers
          </Typography>
          <Typography variant="body2">
            {progress.identifiersRenamed.toLocaleString()} / {progress.identifiersProcessed.toLocaleString()}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Tokens Used
          </Typography>
          <Typography variant="body2">
            {formatProgressTokens(progress.tokensUsed)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Duration
          </Typography>
          <Typography variant="body2">
            {(progress.durationMs / 1000).toFixed(1)}s
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export function ExperimentDetail({
  open,
  experimentId,
  onClose,
  onRun,
  onRefresh,
}: ExperimentDetailProps) {
  const [experiment, setExperiment] = useState<ExperimentWithResults | null>(null);
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [logs, setLogs] = useState<ConsoleLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && experimentId) {
      loadExperiment();
      loadRuns();
      loadLogs();
    }
  }, [open, experimentId]);

  // Auto-refresh when experiment is running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (autoRefresh && experiment?.status === "running") {
      interval = setInterval(() => {
        loadExperiment();
        loadLogs();
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, experiment?.status]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current && tabValue === 4) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, tabValue]);

  const loadExperiment = async () => {
    if (!experimentId) return;
    setLoading(true);
    try {
      const data = await api.getExperiment(experimentId);
      setExperiment(data);
      // Auto-enable refresh when running
      if (data.status === "running") {
        setAutoRefresh(true);
      } else {
        setAutoRefresh(false);
      }
    } catch (error) {
      console.error("Failed to load experiment:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    if (!experimentId) return;
    try {
      const data = await api.getLogs(experimentId, 100);
      setLogs(data);
    } catch (error) {
      console.error("Failed to load logs:", error);
    }
  };

  const loadRuns = async () => {
    if (!experimentId) return;
    try {
      const data = await api.getRunsForExperiment(experimentId);
      setRuns(data);
    } catch (error) {
      console.error("Failed to load runs:", error);
    }
  };

  const handleRunClick = async (runSummary: RunSummary) => {
    if (!experimentId) return;
    try {
      const runData = await api.getRun(experimentId, runSummary.id);
      setSelectedRun(runData);
      setRunDialogOpen(true);
    } catch (error) {
      console.error("Failed to load run details:", error);
    }
  };

  const handleRunDialogClose = () => {
    setRunDialogOpen(false);
    setSelectedRun(null);
  };

  const handleCopyId = () => {
    if (experiment) {
      navigator.clipboard.writeText(experiment.id);
    }
  };

  const handleCancel = async () => {
    if (!experimentId) return;
    setCancelling(true);
    try {
      await api.cancelExperiment(experimentId);
      loadExperiment();
      onRefresh();
    } catch (error) {
      console.error("Failed to cancel experiment:", error);
    } finally {
      setCancelling(false);
    }
  };

  const handleProgressComplete = () => {
    // Refresh experiment data when SSE reports completion
    loadExperiment();
    onRefresh();
  };

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined) return "-";
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs.toFixed(0)}s`;
  };

  const formatCost = (cost?: number) => {
    if (cost === undefined || cost === 0) return "-";
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (tokens?: number) => {
    if (tokens === undefined || tokens === 0) return "-";
    if (tokens > 1000000) return `${(tokens / 1000000).toFixed(2)}M`;
    if (tokens > 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!experiment) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Experiment Details</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 4 }}>
            <LinearProgress />
            <Typography sx={{ mt: 2, textAlign: "center" }}>Loading...</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {experiment.isBaseline && <StarIcon color="warning" />}
          <Typography variant="h6" component="span">
            {experiment.name}
          </Typography>
          <StatusBadge status={experiment.status} />
          <ModeBadge mode={experiment.mode} />
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Copy ID">
            <IconButton size="small" onClick={handleCopyId}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={loadExperiment}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {experiment.status === "pending" && (
            <Button
              size="small"
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => {
                onRun(experiment.id);
                setAutoRefresh(true);
              }}
            >
              Run
            </Button>
          )}
          {experiment.status === "running" && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel"}
            </Button>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Real-time Progress Display */}
        <ProgressDisplay
          experimentId={experimentId}
          isRunning={experiment.status === "running"}
          onComplete={handleProgressComplete}
        />

        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label="Overview" />
          <Tab label="Runs" icon={<HistoryIcon />} iconPosition="start" />
          <Tab label="Results" />
          <Tab label="Passes" />
          <Tab label="Processing Log" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          {/* Quick Summary - always visible */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: "#f5f9ff" }}>
            <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box><StatusBadge status={experiment.status} /></Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Runs</Typography>
                <Typography variant="h6">{experiment.runCount || 0}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Best Score</Typography>
                <Typography variant="h6">
                  {experiment.bestScore !== undefined ? `${experiment.bestScore.toFixed(1)}` : "-"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Avg Score</Typography>
                <Typography variant="h6">
                  {experiment.averageScore !== undefined ? `${experiment.averageScore.toFixed(1)}` : "-"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Git Commit</Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {experiment.gitCommitSha?.slice(0, 7) || "-"}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Collapsible sections */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                <Box>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>ID</strong></TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                              {experiment.id}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Preset</strong></TableCell>
                          <TableCell>{experiment.preset}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Mode</strong></TableCell>
                          <TableCell><ModeBadge mode={experiment.mode} /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Baseline</strong></TableCell>
                          <TableCell>{experiment.isBaseline ? "Yes" : "No"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Created</strong></TableCell>
                          <TableCell>{new Date(experiment.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                        {experiment.gitCommitSha && (
                          <TableRow>
                            <TableCell><strong>Git SHA</strong></TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                {experiment.gitCommitSha}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Samples
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    {experiment.samples.map((sample) => (
                      <Chip key={sample} label={sample} variant="outlined" size="small" />
                    ))}
                  </Box>
                  {experiment.tags && experiment.tags.length > 0 && (
                    <>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Tags
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {experiment.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" color="secondary" />
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
              {experiment.notes && (
                <Box sx={{ mt: 2, p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    {experiment.notes}
                  </Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Preset Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {experiment.presetConfig ? (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    <strong>{experiment.presetConfig.name}</strong>
                    {experiment.presetConfig.description && (
                      <Typography component="span" color="text.secondary"> — {experiment.presetConfig.description}</Typography>
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {experiment.presetConfig.passes.length} pass{experiment.presetConfig.passes.length !== 1 ? "es" : ""}
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Processor</TableCell>
                          <TableCell>Mode</TableCell>
                          <TableCell>Concurrency</TableCell>
                          <TableCell>Filter</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {experiment.presetConfig.passes.map((pass, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <Chip label={pass.processor} size="small" />
                            </TableCell>
                            <TableCell>{pass.mode}</TableCell>
                            <TableCell>{pass.concurrency}</TableCell>
                            <TableCell>{pass.filter || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Preset configuration not available
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Performance & Cost Summary</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Performance
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Duration</strong></TableCell>
                        <TableCell>{formatDuration(experiment.totalDuration)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Average Score</strong></TableCell>
                        <TableCell>
                          {experiment.averageScore !== undefined
                            ? `${experiment.averageScore.toFixed(1)}/100`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tokens & Cost
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Prompt Tokens</strong></TableCell>
                        <TableCell>{formatTokens(experiment.totalTokens?.promptTokens)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Completion Tokens</strong></TableCell>
                        <TableCell>{formatTokens(experiment.totalTokens?.completionTokens)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Total Tokens</strong></TableCell>
                        <TableCell>{formatTokens(experiment.totalTokens?.totalTokens)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Total Cost</strong></TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {formatCost(experiment.totalCost?.totalCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* Runs Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="subtitle1">
              {runs.length} Run{runs.length !== 1 ? "s" : ""}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Refresh runs">
              <IconButton size="small" onClick={loadRuns}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {runs.length === 0 ? (
            <Alert severity="info">
              No runs yet. Click "Run" to execute this experiment.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell><strong>#</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Score</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell><strong>Cost</strong></TableCell>
                    <TableCell><strong>Git SHA</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {runs.map((run) => (
                    <TableRow
                      key={run.id}
                      hover
                      onClick={() => handleRunClick(run)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#e3f2fd" },
                        bgcolor: run.status === "running" ? "#fff3e0" : "inherit",
                      }}
                    >
                      <TableCell>
                        <strong>Run #{run.runNumber}</strong>
                      </TableCell>
                      <TableCell>
                        <RunStatusBadge status={run.status} />
                      </TableCell>
                      <TableCell>
                        {run.averageScore !== undefined
                          ? `${run.averageScore.toFixed(1)}/100`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {run.totalDuration !== undefined
                          ? formatDuration(run.totalDuration)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {formatCost(run.totalCost?.totalCost)}
                      </TableCell>
                      <TableCell>
                        {run.gitCommitSha ? (
                          <Tooltip title={run.gitCommitSha}>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                            >
                              {run.gitCommitSha.slice(0, 7)}
                            </Typography>
                          </Tooltip>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(run.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Results Tab */}
        <TabPanel value={tabValue} index={2}>
          {/* Show error summary if any results have errors */}
          {experiment.results.some((r) => r.error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Errors occurred during execution:
              </Typography>
              {experiment.results
                .filter((r) => r.error)
                .map((r) => (
                  <Typography key={r.sample} variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                    <strong>{r.sample}:</strong> {r.error}
                  </Typography>
                ))}
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><strong>Sample</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Score</strong></TableCell>
                  <TableCell align="center"><strong>Duration</strong></TableCell>
                  <TableCell align="center"><strong>Identifiers</strong></TableCell>
                  <TableCell align="center"><strong>Tokens</strong></TableCell>
                  <TableCell align="center"><strong>Cost</strong></TableCell>
                </TableRow>
                {experiment.results.map((result) => (
                  <TableRow
                    key={result.sample}
                    sx={{ bgcolor: result.error ? "#ffebee" : "inherit" }}
                  >
                    <TableCell>
                      <strong>{result.sample}</strong>
                    </TableCell>
                    <TableCell align="center">
                      {result.error ? (
                        <Tooltip title={result.error}>
                          <Chip label="Error" color="error" size="small" />
                        </Tooltip>
                      ) : (
                        <Chip label="OK" color="success" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={result.score !== undefined ? `${result.score}/100` : "-"}
                        color={result.score !== undefined && result.score >= 80 ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {formatDuration(result.duration)}
                    </TableCell>
                    <TableCell align="center">
                      {result.identifiersProcessed?.toLocaleString() || "-"}
                    </TableCell>
                    <TableCell align="center">
                      {formatTokens(result.tokens?.totalTokens)}
                    </TableCell>
                    <TableCell align="center">
                      {formatCost(result.cost?.totalCost)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Totals row */}
                <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell align="center">
                    {experiment.results.some((r) => r.error) && (
                      <Typography variant="caption" color="error">
                        {experiment.results.filter((r) => r.error).length} failed
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <strong>
                      {experiment.averageScore !== undefined
                        ? `${experiment.averageScore.toFixed(1)}/100 avg`
                        : "-"}
                    </strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{formatDuration(experiment.totalDuration)}</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>
                      {experiment.results
                        .reduce((sum, r) => sum + (r.identifiersProcessed || 0), 0)
                        .toLocaleString() || "-"}
                    </strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{formatTokens(experiment.totalTokens?.totalTokens)}</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{formatCost(experiment.totalCost?.totalCost)}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Passes Tab */}
        <TabPanel value={tabValue} index={3}>
          {selectedRun ? (
            <PassDetailView
              experimentId={experimentId!}
              runId={selectedRun.id}
            />
          ) : (
            <Alert severity="info">
              Select a run from the "Runs" tab to view pass details
            </Alert>
          )}
        </TabPanel>

        {/* Processing Log Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle2">
              Processing Events ({logs.length} entries)
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Refresh logs">
              <IconButton size="small" onClick={loadLogs}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Paper
            sx={{
              p: 2,
              bgcolor: "#1e1e1e",
              color: "#d4d4d4",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            {logs.length === 0 ? (
              <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                No processing events yet. Run the experiment to see pass and batch progress.
              </Typography>
            ) : (
              logs.map((log, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    gap: 1,
                    py: 0.5,
                    borderBottom: "1px solid #333",
                    "&:hover": { bgcolor: "#2d2d2d" },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      color: "#888",
                      minWidth: 80,
                      fontSize: "0.7rem",
                    }}
                  >
                    {formatTimestamp(log.timestamp)}
                  </Typography>
                  <Box sx={{ minWidth: 50 }}>
                    <LogLevelBadge level={log.level} />
                  </Box>
                  <Typography
                    component="span"
                    sx={{
                      color:
                        log.level === "error"
                          ? "#f48771"
                          : log.level === "warn"
                          ? "#cca700"
                          : "#d4d4d4",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {log.message}
                  </Typography>
                </Box>
              ))
            )}
            <div ref={logsEndRef} />
          </Paper>

          {experiment.status === "running" && (
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <LinearProgress sx={{ flexGrow: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Auto-refreshing...
              </Typography>
            </Box>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      {/* Run Detail Dialog */}
      <Dialog
        open={runDialogOpen}
        onClose={handleRunDialogClose}
        maxWidth="md"
        fullWidth
      >
        {selectedRun && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6">Run #{selectedRun.runNumber}</Typography>
                <RunStatusBadge status={selectedRun.status} />
                <Box sx={{ flexGrow: 1 }} />
                {selectedRun.gitCommitSha && (
                  <Tooltip title={selectedRun.gitCommitSha}>
                    <Chip
                      label={selectedRun.gitCommitSha.slice(0, 7)}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: "monospace" }}
                    />
                  </Tooltip>
                )}
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* Run Summary */}
              <Paper sx={{ p: 2, mb: 2, bgcolor: "#f5f9ff" }}>
                <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Score</Typography>
                    <Typography variant="h6">
                      {selectedRun.averageScore !== undefined
                        ? `${selectedRun.averageScore.toFixed(1)}/100`
                        : "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                    <Typography variant="h6">
                      {formatDuration(selectedRun.totalDuration)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Tokens</Typography>
                    <Typography variant="h6">
                      {formatTokens(selectedRun.totalTokens?.totalTokens)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Cost</Typography>
                    <Typography variant="h6">
                      {formatCost(selectedRun.totalCost?.totalCost)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Run Results by Sample */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Sample Results</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {selectedRun.results.length === 0 ? (
                    <Typography color="text.secondary">No results yet</Typography>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Sample</strong></TableCell>
                            <TableCell align="center"><strong>Score</strong></TableCell>
                            <TableCell align="center"><strong>Duration</strong></TableCell>
                            <TableCell align="center"><strong>Identifiers</strong></TableCell>
                            <TableCell align="center"><strong>Tokens</strong></TableCell>
                            <TableCell align="center"><strong>Cost</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedRun.results.map((result) => (
                            <TableRow
                              key={result.sample}
                              sx={{ bgcolor: result.error ? "#ffebee" : "inherit" }}
                            >
                              <TableCell>
                                <strong>{result.sample}</strong>
                                {result.error && (
                                  <Tooltip title={result.error}>
                                    <Chip
                                      label="Error"
                                      color="error"
                                      size="small"
                                      sx={{ ml: 1 }}
                                    />
                                  </Tooltip>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {result.score !== undefined ? `${result.score}/100` : "-"}
                              </TableCell>
                              <TableCell align="center">
                                {formatDuration(result.duration)}
                              </TableCell>
                              <TableCell align="center">
                                {result.identifiersProcessed?.toLocaleString() || "-"}
                              </TableCell>
                              <TableCell align="center">
                                {formatTokens(result.tokens?.totalTokens)}
                              </TableCell>
                              <TableCell align="center">
                                {formatCost(result.cost?.totalCost)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </AccordionDetails>
              </Accordion>

              {/* Timing Details */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Timing Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Created</strong></TableCell>
                        <TableCell>{new Date(selectedRun.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                      {selectedRun.startedAt && (
                        <TableRow>
                          <TableCell><strong>Started</strong></TableCell>
                          <TableCell>{new Date(selectedRun.startedAt).toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      {selectedRun.completedAt && (
                        <TableRow>
                          <TableCell><strong>Completed</strong></TableCell>
                          <TableCell>{new Date(selectedRun.completedAt).toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      {selectedRun.gitCommitSha && (
                        <TableRow>
                          <TableCell><strong>Git Commit</strong></TableCell>
                          <TableCell>
                            <Typography sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                              {selectedRun.gitCommitSha}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleRunDialogClose}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Dialog>
  );
}
