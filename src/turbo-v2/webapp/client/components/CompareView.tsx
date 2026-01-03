import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Chip,
  Divider,
  LinearProgress,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { api } from "../api";
import type { ExperimentWithResults, SampleName, ProcessingMode } from "@shared/types";

interface CompareViewProps {
  open: boolean;
  experimentIds: string[];
  onClose: () => void;
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

// Simple bar chart component using CSS
function BarChart({
  data,
  maxValue,
  label,
  color = "#1976d2",
}: {
  data: { name: string; value: number; isBaseline?: boolean }[];
  maxValue: number;
  label: string;
  color?: string;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      {data.map((item, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="caption" sx={{ minWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.name}
            </Typography>
            {item.isBaseline && <StarIcon fontSize="small" color="warning" />}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ flexGrow: 1, position: "relative", height: 20, bgcolor: "#e0e0e0", borderRadius: 1 }}>
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${(item.value / maxValue) * 100}%`,
                  bgcolor: item.isBaseline ? "#ff9800" : color,
                  borderRadius: 1,
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ minWidth: 50 }}>
              {item.value.toFixed(1)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function CompareView({ open, experimentIds, onClose }: CompareViewProps) {
  const [experiments, setExperiments] = useState<ExperimentWithResults[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open && experimentIds.length > 0) {
      loadExperiments();
    }
  }, [open, experimentIds]);

  const loadExperiments = async () => {
    setLoading(true);
    try {
      const data = await Promise.all(
        experimentIds.map((id) => api.getExperiment(id))
      );
      setExperiments(data);
    } catch (error) {
      console.error("Failed to load experiments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || experiments.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Compare Experiments</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 4 }}>
            <LinearProgress />
            <Typography sx={{ mt: 2, textAlign: "center" }}>Loading experiments...</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Get all unique samples
  const allSamples = Array.from(
    new Set(experiments.flatMap((e) => e.samples))
  );

  // Get score for a specific experiment and sample
  const getScore = (experiment: ExperimentWithResults, sample: SampleName) => {
    const result = experiment.results.find((r) => r.sample === sample);
    return result?.score ?? null;
  };

  // Get result for specific experiment and sample
  const getResult = (experiment: ExperimentWithResults, sample: SampleName) => {
    return experiment.results.find((r) => r.sample === sample);
  };

  // Calculate delta compared to first experiment
  const getDelta = (sample: SampleName, score: number | null, index: number) => {
    if (index === 0 || score === null) return null;

    const baseScore = getScore(experiments[0], sample);
    if (baseScore === null) return null;

    return score - baseScore;
  };

  // Color coding for cells
  const getCellStyle = (sample: SampleName, score: number | null, index: number) => {
    if (score === null) return {};

    const delta = getDelta(sample, score, index);
    if (delta === null) return {};

    if (delta > 0) {
      return { backgroundColor: "#e8f5e9", fontWeight: "bold" };
    } else if (delta < 0) {
      return { backgroundColor: "#ffebee" };
    }
    return {};
  };

  // Find best score for each sample
  const getBestScore = (sample: SampleName) => {
    const scores = experiments
      .map((e) => getScore(e, sample))
      .filter((s): s is number => s !== null);
    return scores.length > 0 ? Math.max(...scores) : null;
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (seconds === undefined) return "-";
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs.toFixed(0)}s`;
  };

  // Format cost
  const formatCost = (cost?: number) => {
    if (cost === undefined || cost === 0) return "-";
    return `$${cost.toFixed(4)}`;
  };

  // Format tokens
  const formatTokens = (tokens?: number) => {
    if (tokens === undefined || tokens === 0) return "-";
    if (tokens > 1000000) return `${(tokens / 1000000).toFixed(2)}M`;
    if (tokens > 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  // Get mode badge
  const ModeBadge = ({ mode }: { mode?: ProcessingMode }) => {
    const isTurbo = mode === "turbo-v2";
    return (
      <Chip
        label={isTurbo ? "Turbo" : "Seq"}
        color={isTurbo ? "primary" : "default"}
        size="small"
        variant={isTurbo ? "filled" : "outlined"}
        sx={{ ml: 1 }}
      />
    );
  };

  // Chart data preparation
  const scoreChartData = experiments.map((exp) => ({
    name: exp.name.slice(0, 15),
    value: exp.averageScore || 0,
    isBaseline: exp.isBaseline,
  }));
  const maxScore = Math.max(...scoreChartData.map((d) => d.value), 100);

  const durationChartData = experiments.map((exp) => ({
    name: exp.name.slice(0, 15),
    value: exp.totalDuration || 0,
    isBaseline: exp.isBaseline,
  }));
  const maxDuration = Math.max(...durationChartData.map((d) => d.value), 1);

  const costChartData = experiments.map((exp) => ({
    name: exp.name.slice(0, 15),
    value: (exp.totalCost?.totalCost || 0) * 1000, // Convert to millicents for visibility
    isBaseline: exp.isBaseline,
  }));
  const maxCost = Math.max(...costChartData.map((d) => d.value), 0.001);

  const tokenChartData = experiments.map((exp) => ({
    name: exp.name.slice(0, 15),
    value: exp.totalTokens?.totalTokens || 0,
    isBaseline: exp.isBaseline,
  }));
  const maxTokens = Math.max(...tokenChartData.map((d) => d.value), 1);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Compare Experiments
        <Typography variant="body2" color="text.secondary">
          {experiments.length} experiments selected
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label="Scores" />
          <Tab label="Performance" />
          <Tab label="Charts" />
        </Tabs>

        {/* Scores Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sample</TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {exp.isBaseline && <StarIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />}
                        <Box>
                          <Typography variant="subtitle2">{exp.name}</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography variant="caption" color="text.secondary">
                              {exp.preset}
                            </Typography>
                            <ModeBadge mode={exp.mode} />
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Typography variant="subtitle2">Delta</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allSamples.map((sample) => {
                  const bestScore = getBestScore(sample);

                  return (
                    <TableRow key={sample}>
                      <TableCell component="th" scope="row">
                        <strong>{sample}</strong>
                      </TableCell>
                      {experiments.map((exp, index) => {
                        const score = getScore(exp, sample);
                        const isBest = score === bestScore && score !== null;

                        return (
                          <TableCell
                            key={exp.id}
                            align="center"
                            sx={{
                              ...getCellStyle(sample, score, index),
                              fontWeight: isBest ? "bold" : "normal",
                            }}
                          >
                            {score !== null ? `${score}/100` : "-"}
                          </TableCell>
                        );
                      })}
                      <TableCell align="center">
                        {experiments.slice(1).map((exp, index) => {
                          const score = getScore(exp, sample);
                          const delta = getDelta(sample, score, index + 1);

                          if (delta === null) return <div key={exp.id}>-</div>;

                          const color = delta > 0 ? "green" : delta < 0 ? "red" : "gray";
                          const sign = delta > 0 ? "+" : "";

                          return (
                            <Typography key={exp.id} variant="body2" sx={{ color }}>
                              {sign}{delta}
                            </Typography>
                          );
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Average row */}
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell component="th" scope="row">
                    <strong>Average Score</strong>
                  </TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center" sx={{ fontWeight: "bold" }}>
                      {exp.averageScore !== undefined ? `${exp.averageScore.toFixed(1)}/100` : "-"}
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    {experiments.slice(1).map((exp) => {
                      const baseAvg = experiments[0].averageScore;
                      const avg = exp.averageScore;

                      if (baseAvg === undefined || avg === undefined) return <div key={exp.id}>-</div>;

                      const delta = avg - baseAvg;
                      const color = delta > 0 ? "green" : delta < 0 ? "red" : "gray";
                      const sign = delta > 0 ? "+" : "";

                      return (
                        <Typography key={exp.id} variant="body2" sx={{ color, fontWeight: "bold" }}>
                          {sign}{delta.toFixed(1)}
                        </Typography>
                      );
                    })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Performance Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {exp.isBaseline && <StarIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />}
                        <Typography variant="subtitle2">{exp.name}</Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Mode */}
                <TableRow>
                  <TableCell><strong>Mode</strong></TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center">
                      <ModeBadge mode={exp.mode} />
                    </TableCell>
                  ))}
                </TableRow>

                {/* Preset */}
                <TableRow>
                  <TableCell><strong>Preset</strong></TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center">{exp.preset}</TableCell>
                  ))}
                </TableRow>

                {/* Duration */}
                <TableRow>
                  <TableCell><strong>Total Duration</strong></TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center">
                      {formatDuration(exp.totalDuration)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Tokens */}
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell colSpan={experiments.length + 1}>
                    <strong>Token Usage</strong>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pl: 4 }}>Prompt Tokens</TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center">
                      {formatTokens(exp.totalTokens?.promptTokens)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pl: 4 }}>Completion Tokens</TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center">
                      {formatTokens(exp.totalTokens?.completionTokens)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pl: 4 }}><strong>Total Tokens</strong></TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center" sx={{ fontWeight: "bold" }}>
                      {formatTokens(exp.totalTokens?.totalTokens)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Costs */}
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell colSpan={experiments.length + 1}>
                    <strong>Cost Breakdown</strong>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pl: 4 }}>Prompt Cost</TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center">
                      {formatCost(exp.totalCost?.inputCost)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pl: 4 }}>Completion Cost</TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center">
                      {formatCost(exp.totalCost?.outputCost)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pl: 4 }}><strong>Total Cost</strong></TableCell>
                  {experiments.map((exp) => (
                    <TableCell key={exp.id} align="center" sx={{ fontWeight: "bold" }}>
                      {formatCost(exp.totalCost?.totalCost)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Identifiers */}
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell colSpan={experiments.length + 1}>
                    <strong>Identifiers</strong>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pl: 4 }}>Total Processed</TableCell>
                  {experiments.map((exp) => {
                    const total = exp.results.reduce((sum, r) => sum + (r.identifiersProcessed || 0), 0);
                    return (
                      <TableCell key={exp.id} align="center">
                        {total > 0 ? total.toLocaleString() : "-"}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Efficiency Metrics */}
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell colSpan={experiments.length + 1}>
                    <strong>Efficiency</strong>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pl: 4 }}>Score per Second</TableCell>
                  {experiments.map((exp) => {
                    if (!exp.averageScore || !exp.totalDuration) {
                      return <TableCell key={exp.id} align="center">-</TableCell>;
                    }
                    const efficiency = exp.averageScore / exp.totalDuration;
                    return (
                      <TableCell key={exp.id} align="center">
                        {efficiency.toFixed(2)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pl: 4 }}>Score per $1</TableCell>
                  {experiments.map((exp) => {
                    if (!exp.averageScore || !exp.totalCost?.totalCost || exp.totalCost.totalCost === 0) {
                      return <TableCell key={exp.id} align="center">-</TableCell>;
                    }
                    const efficiency = exp.averageScore / exp.totalCost.totalCost;
                    return (
                      <TableCell key={exp.id} align="center">
                        {efficiency.toFixed(0)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Charts Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <BarChart
              data={scoreChartData}
              maxValue={maxScore}
              label="Average Score (0-100)"
              color="#4caf50"
            />
            <BarChart
              data={durationChartData}
              maxValue={maxDuration}
              label="Duration (seconds)"
              color="#f44336"
            />
            <BarChart
              data={tokenChartData}
              maxValue={maxTokens}
              label="Total Tokens"
              color="#2196f3"
            />
            <BarChart
              data={costChartData}
              maxValue={maxCost}
              label="Cost (millicents)"
              color="#9c27b0"
            />
          </Box>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
