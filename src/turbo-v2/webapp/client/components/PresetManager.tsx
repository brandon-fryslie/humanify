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
  Chip,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { api } from "../api";
import type { PresetConfig, PassConfig } from "@shared/types";

interface PresetManagerProps {
  open: boolean;
  onClose: () => void;
}

interface PassEditorProps {
  pass: Partial<PassConfig>;
  onChange: (pass: Partial<PassConfig>) => void;
  onRemove: () => void;
}

// Help text for each field
const PROCESSOR_HELP: Record<string, string> = {
  rename: "Core LLM renaming - generates semantic variable names",
  refine: "Reviews and improves names from previous pass with full context",
  analyze: "Detects anchors, conflicts, and patterns (may not use LLM)",
  transform: "Applies consistency rules (no LLM, deterministic)",
};

const MODE_HELP: Record<string, string> = {
  parallel: "All identifiers processed concurrently (fastest)",
  sequential: "One at a time, each sees all previous (best quality)",
  streaming: "Source-order windows, local context (balanced)",
};

function PassEditor({ pass, onChange, onRemove }: PassEditorProps) {
  const processor = pass.processor || "rename";
  const mode = pass.mode || "parallel";

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 1, flexWrap: "wrap" }}>
      <Tooltip title={PROCESSOR_HELP[processor] || ""} arrow placement="top">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Processor</InputLabel>
          <Select
            value={processor}
            label="Processor"
            onChange={(e) => onChange({ ...pass, processor: e.target.value as any })}
          >
            <MenuItem value="rename">Rename</MenuItem>
            <MenuItem value="refine">Refine</MenuItem>
            <MenuItem value="analyze">Analyze</MenuItem>
            <MenuItem value="transform">Transform</MenuItem>
          </Select>
        </FormControl>
      </Tooltip>

      <Tooltip title={MODE_HELP[mode] || ""} arrow placement="top">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Mode</InputLabel>
          <Select
            value={mode}
            label="Mode"
            onChange={(e) => onChange({ ...pass, mode: e.target.value as any })}
          >
            <MenuItem value="parallel">Parallel</MenuItem>
            <MenuItem value="sequential">Sequential</MenuItem>
            <MenuItem value="streaming">Streaming</MenuItem>
          </Select>
        </FormControl>
      </Tooltip>

      <Tooltip title="Max concurrent LLM requests (1-100). Higher = faster but more API usage" arrow placement="top">
        <TextField
          size="small"
          label="Concurrency"
          type="number"
          value={pass.concurrency || 50}
          onChange={(e) => onChange({ ...pass, concurrency: parseInt(e.target.value) || 1 })}
          sx={{ width: 100 }}
          inputProps={{ min: 1, max: 100 }}
        />
      </Tooltip>

      <Tooltip title="LLM model to use (e.g., gpt-4o-mini, gpt-4o)" arrow placement="top">
        <TextField
          size="small"
          label="Model"
          value={pass.model || "gpt-4o-mini"}
          onChange={(e) => onChange({ ...pass, model: e.target.value })}
          sx={{ width: 140 }}
        />
      </Tooltip>

      <IconButton size="small" onClick={onRemove} color="error">
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export function PresetManager({ open, onClose }: PresetManagerProps) {
  const [presets, setPresets] = useState<PresetConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPreset, setEditingPreset] = useState<Partial<PresetConfig> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      loadPresets();
    }
  }, [open]);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const data = await api.listPresets();
      setPresets(data);
    } catch (error: any) {
      setError(`Failed to load presets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPreset({
      name: "",
      description: "",
      passes: [
        { processor: "rename", mode: "parallel", concurrency: 50, model: "gpt-4o-mini" },
      ],
    });
  };

  const handleEdit = (preset: PresetConfig) => {
    if (preset.isBuiltIn) {
      setError("Cannot edit built-in presets. Duplicate it first.");
      return;
    }
    setIsCreating(false);
    setEditingPreset({ ...preset });
  };

  const handleDuplicate = async (preset: PresetConfig) => {
    try {
      await api.duplicatePreset(preset.id, `${preset.name} (Copy)`);
      await loadPresets();
    } catch (error: any) {
      setError(`Failed to duplicate preset: ${error.message}`);
    }
  };

  const handleDelete = async (preset: PresetConfig) => {
    if (preset.isBuiltIn) {
      setError("Cannot delete built-in presets.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${preset.name}"?`)) {
      return;
    }

    try {
      await api.deletePreset(preset.id);
      await loadPresets();
    } catch (error: any) {
      setError(`Failed to delete preset: ${error.message}`);
    }
  };

  const handleSave = async () => {
    if (!editingPreset) return;

    if (!editingPreset.name?.trim()) {
      setError("Please enter a preset name.");
      return;
    }

    if (!editingPreset.passes || editingPreset.passes.length === 0) {
      setError("Please add at least one pass.");
      return;
    }

    // Validate passes
    for (const pass of editingPreset.passes) {
      if (!pass.processor || !pass.mode || pass.concurrency === undefined) {
        setError("Each pass requires processor, mode, and concurrency.");
        return;
      }
    }

    try {
      if (isCreating) {
        await api.createPreset({
          name: editingPreset.name,
          description: editingPreset.description,
          passes: editingPreset.passes as PassConfig[],
        });
      } else if (editingPreset.id) {
        await api.updatePreset(editingPreset.id, {
          name: editingPreset.name,
          description: editingPreset.description,
          passes: editingPreset.passes as PassConfig[],
        });
      }

      await loadPresets();
      setEditingPreset(null);
    } catch (error: any) {
      setError(`Failed to save preset: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingPreset(null);
    setIsCreating(false);
  };

  const handleAddPass = () => {
    if (!editingPreset) return;

    setEditingPreset({
      ...editingPreset,
      passes: [
        ...(editingPreset.passes || []),
        { processor: "rename", mode: "parallel", concurrency: 50, model: "gpt-4o-mini" },
      ],
    });
  };

  const handleUpdatePass = (index: number, pass: Partial<PassConfig>) => {
    if (!editingPreset) return;

    const newPasses = [...(editingPreset.passes || [])];
    newPasses[index] = pass as PassConfig;
    setEditingPreset({ ...editingPreset, passes: newPasses });
  };

  const handleRemovePass = (index: number) => {
    if (!editingPreset) return;

    const newPasses = [...(editingPreset.passes || [])];
    newPasses.splice(index, 1);
    setEditingPreset({ ...editingPreset, passes: newPasses });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6">Preset Manager</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {!editingPreset && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              New Preset
            </Button>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {editingPreset ? (
          // Edit/Create Form
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {isCreating ? "Create New Preset" : "Edit Preset"}
            </Typography>

            <TextField
              label="Name"
              value={editingPreset.name || ""}
              onChange={(e) => setEditingPreset({ ...editingPreset, name: e.target.value })}
              fullWidth
              required
              sx={{ mb: 2 }}
            />

            <TextField
              label="Description"
              value={editingPreset.description || ""}
              onChange={(e) => setEditingPreset({ ...editingPreset, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2">
                Passes ({editingPreset.passes?.length || 0})
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button size="small" startIcon={<AddIcon />} onClick={handleAddPass}>
                Add Pass
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Multi-pass processing: Each pass operates on the previous pass's output.
              Pass 2 sees all names from Pass 1, improving context and quality.
              Typical setups: 2-pass parallel (fast), rename+refine (balanced), or
              sequential anchors + parallel bulk (large files). Hover over fields for details.
            </Typography>

            {editingPreset.passes?.map((pass, index) => (
              <PassEditor
                key={index}
                pass={pass}
                onChange={(p) => handleUpdatePass(index, p)}
                onRemove={() => handleRemovePass(index)}
              />
            ))}

            <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
              <Button onClick={handleCancelEdit}>
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          // Preset List
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Passes</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {presets.map((preset) => (
                  <TableRow key={preset.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {preset.name}
                        </Typography>
                        {preset.description && (
                          <Typography variant="caption" color="text.secondary">
                            {preset.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {preset.passes.map((pass, i) => (
                          <Chip
                            key={i}
                            label={`${pass.processor}:${pass.mode}:${pass.concurrency}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={preset.isBuiltIn ? "Built-in" : "Custom"}
                        size="small"
                        color={preset.isBuiltIn ? "default" : "primary"}
                        variant={preset.isBuiltIn ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                        <Tooltip title="Duplicate">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicate(preset)}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={preset.isBuiltIn ? "Cannot edit built-in" : "Edit"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(preset)}
                              disabled={preset.isBuiltIn}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={preset.isBuiltIn ? "Cannot delete built-in" : "Delete"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(preset)}
                              disabled={preset.isBuiltIn}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
