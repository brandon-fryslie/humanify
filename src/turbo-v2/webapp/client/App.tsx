import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  CssBaseline,
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { ExperimentList } from "./components/ExperimentList";
import { ExperimentForm } from "./components/ExperimentForm";
import { CompareView } from "./components/CompareView";
import { api } from "./api";
import type { ExperimentConfig } from "../shared/types";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
  },
});

function App() {
  const [experiments, setExperiments] = useState<ExperimentConfig[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load experiments
  const loadExperiments = async () => {
    try {
      const data = await api.listExperiments();
      setExperiments(data);
    } catch (err: any) {
      setError(`Failed to load experiments: ${err.message}`);
    }
  };

  useEffect(() => {
    loadExperiments();
  }, [refreshKey]);

  const handleCreate = async (name: string, preset: string, samples: string[]) => {
    try {
      await api.createExperiment({
        name,
        preset: preset as any,
        samples: samples as any,
      });
      setFormOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setError(`Failed to create experiment: ${err.message}`);
    }
  };

  const handleRun = async (id: string) => {
    try {
      await api.runExperiment(id);
      // Start polling for status
      const pollInterval = setInterval(async () => {
        const status = await api.getStatus(id);
        if (status.status !== "running") {
          clearInterval(pollInterval);
          setRefreshKey((k) => k + 1);
        }
      }, 2000);
    } catch (err: any) {
      setError(`Failed to run experiment: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this experiment?")) {
      return;
    }

    try {
      await api.deleteExperiment(id);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setError(`Failed to delete experiment: ${err.message}`);
    }
  };

  const handleCompare = () => {
    if (selectedIds.length < 2) {
      setError("Select at least 2 experiments to compare");
      return;
    }
    setCompareOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Turbo-V2 Experiment Dashboard
          </Typography>
          <Button color="inherit" onClick={() => setFormOpen(true)}>
            + New Experiment
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={selectedIds.length < 2}
            onClick={handleCompare}
          >
            Compare Selected ({selectedIds.length})
          </Button>
        </Box>

        <ExperimentList
          experiments={experiments}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRun={handleRun}
          onDelete={handleDelete}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
      </Container>

      <ExperimentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreate}
      />

      <CompareView
        open={compareOpen}
        experimentIds={selectedIds}
        onClose={() => setCompareOpen(false)}
      />

      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
