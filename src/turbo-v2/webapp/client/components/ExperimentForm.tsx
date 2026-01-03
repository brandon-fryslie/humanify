import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Typography,
  Switch,
  Chip,
  Alert,
} from "@mui/material";
import type { PresetConfig, ProcessingMode, SampleName } from "@shared/types";
import { api } from "../api";

interface ExperimentFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (config: {
    name?: string;
    preset: string;
    samples: SampleName[];
    mode: ProcessingMode;
    isBaseline: boolean;
  }) => void;
}

const SAMPLES: SampleName[] = ["tiny-qs", "small-axios", "medium-chart"];

export function ExperimentForm({ open, onClose, onCreate }: ExperimentFormProps) {
  const [name, setName] = useState("");
  const [autoName, setAutoName] = useState(true);
  const [preset, setPreset] = useState("fast");
  const [presets, setPresets] = useState<PresetConfig[]>([]);
  const [samples, setSamples] = useState<SampleName[]>(["tiny-qs"]);
  const [mode, setMode] = useState<ProcessingMode>("turbo-v2");
  const [isBaseline, setIsBaseline] = useState(false);

  // Load presets on mount
  useEffect(() => {
    if (open) {
      api.listPresets().then(setPresets).catch(console.error);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!autoName && !name.trim()) {
      alert("Please enter a name or enable auto-generate");
      return;
    }

    if (samples.length === 0) {
      alert("Please select at least one sample");
      return;
    }

    onCreate({
      name: autoName ? undefined : name,
      preset,
      samples,
      mode,
      isBaseline,
    });

    // Reset form
    setName("");
    setAutoName(true);
    setPreset("fast");
    setSamples(["tiny-qs"]);
    setMode("turbo-v2");
    setIsBaseline(false);
  };

  const handleSampleToggle = (sample: SampleName) => {
    if (samples.includes(sample)) {
      setSamples(samples.filter((s) => s !== sample));
    } else {
      setSamples([...samples, sample]);
    }
  };

  const selectAllSamples = () => setSamples([...SAMPLES]);
  const clearSamples = () => setSamples([]);

  const selectedPreset = presets.find((p) => p.id === preset);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Experiment</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {/* Auto-generate name toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoName}
                  onChange={(e) => setAutoName(e.target.checked)}
                />
              }
              label="Auto-generate name"
            />
          </Box>

          {/* Name field (if not auto) */}
          {!autoName && (
            <TextField
              label="Experiment Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              placeholder="e.g., baseline-sequential-test"
            />
          )}

          {autoName && (
            <Alert severity="info" sx={{ py: 0 }}>
              Name will be: <strong>{preset}-{mode}-{new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "")}</strong>
            </Alert>
          )}

          {/* Processing Mode */}
          <FormControl fullWidth>
            <InputLabel>Processing Mode</InputLabel>
            <Select
              value={mode}
              label="Processing Mode"
              onChange={(e) => setMode(e.target.value as ProcessingMode)}
            >
              <MenuItem value="turbo-v2">
                <Box>
                  <Typography variant="body2">Turbo V2 (Parallel)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Fast parallel processing with multi-pass
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="sequential">
                <Box>
                  <Typography variant="body2">Sequential (Baseline)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Original sequential processing for comparison
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Preset selector */}
          <FormControl fullWidth>
            <InputLabel>Preset</InputLabel>
            <Select
              value={preset}
              label="Preset"
              onChange={(e) => setPreset(e.target.value)}
            >
              {presets.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2">{p.name}</Typography>
                    {p.isBuiltIn && (
                      <Chip label="Built-in" size="small" variant="outlined" />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Preset description */}
          {selectedPreset?.description && (
            <Typography variant="caption" color="text.secondary">
              {selectedPreset.description}
            </Typography>
          )}

          {/* Preset passes preview */}
          {selectedPreset && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {selectedPreset.passes.map((pass, i) => (
                <Chip
                  key={i}
                  label={`${pass.processor}:${pass.mode}:${pass.concurrency}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          )}

          {/* Samples */}
          <FormControl component="fieldset">
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <InputLabel shrink>Samples</InputLabel>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button size="small" onClick={selectAllSamples}>All</Button>
                <Button size="small" onClick={clearSamples}>Clear</Button>
              </Box>
            </Box>
            <FormGroup sx={{ mt: 2 }}>
              {SAMPLES.map((sample) => (
                <FormControlLabel
                  key={sample}
                  control={
                    <Checkbox
                      checked={samples.includes(sample)}
                      onChange={() => handleSampleToggle(sample)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{sample}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sample === "tiny-qs" && "~150 identifiers, fast"}
                        {sample === "small-axios" && "~800 identifiers, medium"}
                        {sample === "medium-chart" && "~5000 identifiers, slow"}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </FormControl>

          {/* Baseline toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isBaseline}
                onChange={(e) => setIsBaseline(e.target.checked)}
                color="secondary"
              />
            }
            label={
              <Box>
                <Typography variant="body2">Mark as Baseline</Typography>
                <Typography variant="caption" color="text.secondary">
                  Baseline experiments are used for comparison
                </Typography>
              </Box>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
