import React, { useState } from "react";
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
} from "@mui/material";

interface ExperimentFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, preset: string, samples: string[]) => void;
}

const PRESETS = ["fast", "balanced", "thorough", "quality", "anchor"];
const SAMPLES = ["tiny-qs", "small-axios", "medium-chart"];

export function ExperimentForm({ open, onClose, onCreate }: ExperimentFormProps) {
  const [name, setName] = useState("");
  const [preset, setPreset] = useState("fast");
  const [samples, setSamples] = useState<string[]>(["tiny-qs"]);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    if (samples.length === 0) {
      alert("Please select at least one sample");
      return;
    }

    onCreate(name, preset, samples);

    // Reset form
    setName("");
    setPreset("fast");
    setSamples(["tiny-qs"]);
  };

  const handleSampleToggle = (sample: string) => {
    if (samples.includes(sample)) {
      setSamples(samples.filter((s) => s !== sample));
    } else {
      setSamples([...samples, sample]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Experiment</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Experiment Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />

          <FormControl fullWidth>
            <InputLabel>Preset</InputLabel>
            <Select
              value={preset}
              label="Preset"
              onChange={(e) => setPreset(e.target.value)}
            >
              {PRESETS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl component="fieldset">
            <InputLabel shrink>Samples</InputLabel>
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
                  label={sample}
                />
              ))}
            </FormGroup>
          </FormControl>
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
