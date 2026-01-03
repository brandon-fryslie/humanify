import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Collapse,
  LinearProgress,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoIcon from "@mui/icons-material/Info";
import { api } from "../api";
import type {
  PassDetail,
  IdentifierDetail,
} from "@shared/types";
import { IdentifierContextDialog } from "./IdentifierContextDialog";

interface PassDetailViewProps {
  experimentId: string;
  runId: string;
}

interface ExpandedPass {
  passNumber: number;
  identifiers: IdentifierDetail[];
  total: number;
  page: number;
  hasMore: boolean;
  loading: boolean;
  statusFilter: "all" | "renamed" | "unchanged" | "skipped";
}

export function PassDetailView({ experimentId, runId }: PassDetailViewProps) {
  const [passes, setPasses] = useState<PassDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPasses, setExpandedPasses] = useState<Map<number, ExpandedPass>>(new Map());
  const [contextDialog, setContextDialog] = useState<{
    open: boolean;
    passNumber: number;
    identifier: IdentifierDetail | null;
  }>({ open: false, passNumber: 0, identifier: null });

  useEffect(() => {
    loadPasses();
  }, [experimentId, runId]);

  async function loadPasses() {
    try {
      setLoading(true);
      setError(null);
      const passData = await api.getPassesForRun(experimentId, runId);
      setPasses(passData);
    } catch (err: any) {
      setError(err.message || "Failed to load passes");
    } finally {
      setLoading(false);
    }
  }

  async function togglePass(passNumber: number) {
    const isExpanded = expandedPasses.has(passNumber);

    if (isExpanded) {
      // Collapse
      const newExpanded = new Map(expandedPasses);
      newExpanded.delete(passNumber);
      setExpandedPasses(newExpanded);
    } else {
      // Expand and load identifiers
      const newExpanded = new Map(expandedPasses);
      newExpanded.set(passNumber, {
        passNumber,
        identifiers: [],
        total: 0,
        page: 1,
        hasMore: false,
        loading: true,
        statusFilter: "all",
      });
      setExpandedPasses(newExpanded);

      await loadIdentifiers(passNumber, 1, "all");
    }
  }

  async function loadIdentifiers(
    passNumber: number,
    page: number,
    statusFilter: "all" | "renamed" | "unchanged" | "skipped"
  ) {
    try {
      const response = await api.getIdentifiersForPass(experimentId, runId, passNumber, {
        page,
        limit: 50,
        status: statusFilter,
        sort: "id",
        order: "asc",
      });

      const newExpanded = new Map(expandedPasses);
      newExpanded.set(passNumber, {
        passNumber,
        identifiers: response.identifiers,
        total: response.total,
        page: response.page,
        hasMore: response.hasMore,
        loading: false,
        statusFilter,
      });
      setExpandedPasses(newExpanded);
    } catch (err) {
      console.error("Failed to load identifiers:", err);
      const newExpanded = new Map(expandedPasses);
      newExpanded.set(passNumber, {
        passNumber,
        identifiers: [],
        total: 0,
        page,
        hasMore: false,
        loading: false,
        statusFilter,
      });
      setExpandedPasses(newExpanded);
    }
  }

  async function handlePageChange(passNumber: number, newPage: number) {
    const expanded = expandedPasses.get(passNumber);
    if (!expanded) return;

    await loadIdentifiers(passNumber, newPage, expanded.statusFilter);
  }

  async function handleStatusFilterChange(
    passNumber: number,
    newFilter: "all" | "renamed" | "unchanged" | "skipped"
  ) {
    await loadIdentifiers(passNumber, 1, newFilter);
  }

  function openContextDialog(passNumber: number, identifier: IdentifierDetail) {
    setContextDialog({
      open: true,
      passNumber,
      identifier,
    });
  }

  function closeContextDialog() {
    setContextDialog({
      open: false,
      passNumber: 0,
      identifier: null,
    });
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (passes.length === 0) {
    return <Alert severity="info">No pass data available</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pass Details
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="50px"></TableCell>
              <TableCell>Pass</TableCell>
              <TableCell>Processor</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell align="right">Concurrency</TableCell>
              <TableCell align="right">Identifiers</TableCell>
              <TableCell align="right">Renamed</TableCell>
              <TableCell align="right">Unchanged</TableCell>
              <TableCell align="right">Skipped</TableCell>
              <TableCell align="right">Duration</TableCell>
              <TableCell align="right">Tokens</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {passes.map((pass) => {
              const expanded = expandedPasses.get(pass.passNumber);
              const isExpanded = !!expanded;

              return (
                <React.Fragment key={pass.passNumber}>
                  <TableRow hover sx={{ cursor: "pointer" }}>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => togglePass(pass.passNumber)}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell onClick={() => togglePass(pass.passNumber)}>
                      {pass.passNumber}
                    </TableCell>
                    <TableCell onClick={() => togglePass(pass.passNumber)}>
                      <Chip label={pass.processor} size="small" />
                    </TableCell>
                    <TableCell onClick={() => togglePass(pass.passNumber)}>
                      <Chip label={pass.mode} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right" onClick={() => togglePass(pass.passNumber)}>
                      {pass.concurrency}
                    </TableCell>
                    <TableCell align="right" onClick={() => togglePass(pass.passNumber)}>
                      {pass.identifierCount.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" onClick={() => togglePass(pass.passNumber)}>
                      <Chip
                        label={pass.renamedCount.toLocaleString()}
                        size="small"
                        color="success"
                      />
                    </TableCell>
                    <TableCell align="right" onClick={() => togglePass(pass.passNumber)}>
                      <Chip
                        label={pass.unchangedCount.toLocaleString()}
                        size="small"
                        color="default"
                      />
                    </TableCell>
                    <TableCell align="right" onClick={() => togglePass(pass.passNumber)}>
                      <Chip
                        label={pass.skippedCount.toLocaleString()}
                        size="small"
                        color="warning"
                      />
                    </TableCell>
                    <TableCell align="right" onClick={() => togglePass(pass.passNumber)}>
                      {pass.duration
                        ? `${(pass.duration / 1000).toFixed(1)}s`
                        : "-"}
                    </TableCell>
                    <TableCell align="right" onClick={() => togglePass(pass.passNumber)}>
                      {pass.tokensUsed ? pass.tokensUsed.toLocaleString() : "-"}
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={11} sx={{ py: 0, bgcolor: "grey.50" }}>
                        <Collapse in={isExpanded}>
                          <Box sx={{ p: 2 }}>
                            {expanded.loading ? (
                              <LinearProgress />
                            ) : (
                              <>
                                <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <Typography variant="subtitle2">
                                    Identifiers ({expanded.total.toLocaleString()})
                                  </Typography>
                                  <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Filter</InputLabel>
                                    <Select
                                      value={expanded.statusFilter}
                                      label="Filter"
                                      onChange={(e) =>
                                        handleStatusFilterChange(
                                          pass.passNumber,
                                          e.target.value as any
                                        )
                                      }
                                    >
                                      <MenuItem value="all">All</MenuItem>
                                      <MenuItem value="renamed">Renamed</MenuItem>
                                      <MenuItem value="unchanged">Unchanged</MenuItem>
                                      <MenuItem value="skipped">Skipped</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>

                                {expanded.identifiers.length === 0 ? (
                                  <Typography variant="body2" color="text.secondary">
                                    No identifiers found
                                  </Typography>
                                ) : (
                                  <>
                                    <TableContainer>
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Old Name</TableCell>
                                            <TableCell>New Name</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Confidence</TableCell>
                                            <TableCell>Batch</TableCell>
                                            <TableCell align="center">Context</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {expanded.identifiers.map((id) => (
                                            <TableRow key={id.id} hover>
                                              <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                                {id.id.substring(0, 20)}...
                                              </TableCell>
                                              <TableCell sx={{ fontFamily: "monospace" }}>
                                                {id.oldName}
                                              </TableCell>
                                              <TableCell sx={{ fontFamily: "monospace" }}>
                                                {id.newName}
                                              </TableCell>
                                              <TableCell>
                                                <Chip
                                                  label={id.status}
                                                  size="small"
                                                  color={
                                                    id.status === "renamed"
                                                      ? "success"
                                                      : id.status === "skipped"
                                                      ? "warning"
                                                      : "default"
                                                  }
                                                />
                                              </TableCell>
                                              <TableCell>
                                                {id.confidence !== undefined
                                                  ? (id.confidence * 100).toFixed(0) + "%"
                                                  : "-"}
                                              </TableCell>
                                              <TableCell>{id.batchNumber}</TableCell>
                                              <TableCell align="center">
                                                {id.vaultHash !== undefined && (
                                                  <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                      openContextDialog(pass.passNumber, id)
                                                    }
                                                  >
                                                    <InfoIcon />
                                                  </IconButton>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>

                                    <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                                      <Pagination
                                        count={Math.ceil(expanded.total / 50)}
                                        page={expanded.page}
                                        onChange={(_, page) =>
                                          handlePageChange(pass.passNumber, page)
                                        }
                                        color="primary"
                                      />
                                    </Box>
                                  </>
                                )}
                              </>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <IdentifierContextDialog
        open={contextDialog.open}
        experimentId={experimentId}
        runId={runId}
        passNumber={contextDialog.passNumber}
        identifier={contextDialog.identifier}
        onClose={closeContextDialog}
      />
    </Box>
  );
}
