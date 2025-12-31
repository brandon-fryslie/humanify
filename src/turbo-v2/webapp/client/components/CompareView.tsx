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
} from "@mui/material";
import { api } from "../api";
import type { ExperimentWithResults, SampleName } from "../../shared/types";

interface CompareViewProps {
  open: boolean;
  experimentIds: string[];
  onClose: () => void;
}

export function CompareView({ open, experimentIds, onClose }: CompareViewProps) {
  const [experiments, setExperiments] = useState<ExperimentWithResults[]>([]);
  const [loading, setLoading] = useState(false);

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

  if (experiments.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Compare Experiments</DialogTitle>
        <DialogContent>
          <Typography>Loading experiments...</Typography>
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Compare Experiments</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sample</TableCell>
                {experiments.map((exp) => (
                  <TableCell key={exp.id} align="center">
                    <Box>
                      <Typography variant="subtitle2">{exp.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {exp.preset}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Typography variant="subtitle2">Delta vs First</Typography>
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
                          <Typography
                            key={exp.id}
                            variant="body2"
                            sx={{ color }}
                          >
                            {sign}
                            {delta}
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
                  <strong>Average</strong>
                </TableCell>
                {experiments.map((exp, index) => {
                  const avg = exp.averageScore;

                  return (
                    <TableCell
                      key={exp.id}
                      align="center"
                      sx={{ fontWeight: "bold" }}
                    >
                      {avg !== undefined ? `${avg.toFixed(1)}/100` : "-"}
                    </TableCell>
                  );
                })}
                <TableCell align="center">
                  {experiments.slice(1).map((exp) => {
                    const baseAvg = experiments[0].averageScore;
                    const avg = exp.averageScore;

                    if (
                      baseAvg === undefined ||
                      avg === undefined
                    )
                      return <div key={exp.id}>-</div>;

                    const delta = avg - baseAvg;
                    const color = delta > 0 ? "green" : delta < 0 ? "red" : "gray";
                    const sign = delta > 0 ? "+" : "";

                    return (
                      <Typography
                        key={exp.id}
                        variant="body2"
                        sx={{ color, fontWeight: "bold" }}
                      >
                        {sign}
                        {delta.toFixed(1)}
                      </Typography>
                    );
                  })}
                </TableCell>
              </TableRow>

              {/* Duration row */}
              <TableRow>
                <TableCell component="th" scope="row">
                  <strong>Total Duration</strong>
                </TableCell>
                {experiments.map((exp) => {
                  const duration = exp.totalDuration;

                  return (
                    <TableCell key={exp.id} align="center">
                      {duration !== undefined ? `${duration.toFixed(1)}s` : "-"}
                    </TableCell>
                  );
                })}
                <TableCell align="center">-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
