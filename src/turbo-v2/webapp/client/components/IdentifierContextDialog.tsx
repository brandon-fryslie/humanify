import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { api } from "../api";
import type { IdentifierDetail, IdentifierContext } from "@shared/types";

interface IdentifierContextDialogProps {
  open: boolean;
  experimentId: string;
  runId: string;
  passNumber: number;
  identifier: IdentifierDetail | null;
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

export function IdentifierContextDialog({
  open,
  experimentId,
  runId,
  passNumber,
  identifier,
  onClose,
}: IdentifierContextDialogProps) {
  const [context, setContext] = useState<IdentifierContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open && identifier) {
      loadContext();
    } else {
      setContext(null);
      setError(null);
      setTabValue(0);
    }
  }, [open, identifier, experimentId, runId, passNumber]);

  async function loadContext() {
    if (!identifier) return;

    try {
      setLoading(true);
      setError(null);
      const ctx = await api.getIdentifierContext(
        experimentId,
        runId,
        passNumber,
        identifier.id
      );
      setContext(ctx);
    } catch (err: any) {
      setError(err.message || "Failed to load context");
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(_event: React.SyntheticEvent, newValue: number) {
    setTabValue(newValue);
  }

  if (!identifier) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">Identifier Details</Typography>
          <Box sx={{ mt: 1, display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
              {identifier.id}
            </Typography>
            <Chip
              label={identifier.status}
              size="small"
              color={
                identifier.status === "renamed"
                  ? "success"
                  : identifier.status === "skipped"
                  ? "warning"
                  : "default"
              }
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !context || !context.available ? (
          <Alert severity="info">
            Context is not available. The vault entry may have been evicted or no vault index exists for this identifier.
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Rename Information
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Old Name:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {identifier.oldName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    New Name:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {identifier.newName}
                  </Typography>

                  {identifier.confidence !== undefined && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Confidence:
                      </Typography>
                      <Typography variant="body2">
                        {(identifier.confidence * 100).toFixed(0)}%
                      </Typography>
                    </>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    Pass:
                  </Typography>
                  <Typography variant="body2">{identifier.passNumber}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Batch:
                  </Typography>
                  <Typography variant="body2">{identifier.batchNumber}</Typography>

                  {context.model && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Model:
                      </Typography>
                      <Typography variant="body2">{context.model}</Typography>
                    </>
                  )}

                  {context.timestamp && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Timestamp:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(context.timestamp).toLocaleString()}
                      </Typography>
                    </>
                  )}
                </Box>
              </Paper>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Context" />
                <Tab label="Prompt" />
                <Tab label="Response" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  maxHeight: "400px",
                  overflow: "auto",
                  bgcolor: "grey.50",
                }}
              >
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    m: 0,
                  }}
                >
                  {context.context}
                </Typography>
              </Paper>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  maxHeight: "400px",
                  overflow: "auto",
                  bgcolor: "grey.50",
                }}
              >
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    m: 0,
                  }}
                >
                  {context.prompt}
                </Typography>
              </Paper>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  maxHeight: "400px",
                  overflow: "auto",
                  bgcolor: "grey.50",
                }}
              >
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    m: 0,
                  }}
                >
                  {context.response}
                </Typography>
              </Paper>
            </TabPanel>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
