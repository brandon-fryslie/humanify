import React, { useState, useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import {
  Button,
  Chip,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import type { ExperimentConfig, ExperimentStatus, ProcessingMode } from "@shared/types";
import { api } from "../api";

interface ExperimentListProps {
  experiments: ExperimentConfig[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
  onClone: (id: string) => void;
  onRefresh: () => void;
  onViewDetails?: (id: string) => void;
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

function ModeBadge({ mode }: { mode: ProcessingMode }) {
  const isTurbo = mode === "turbo-v2";
  return (
    <Chip
      label={isTurbo ? "Turbo" : "Seq"}
      color={isTurbo ? "primary" : "default"}
      size="small"
      variant={isTurbo ? "filled" : "outlined"}
    />
  );
}

export function ExperimentList({
  experiments,
  selectedIds,
  onSelectionChange,
  onRun,
  onDelete,
  onClone,
  onRefresh,
  onViewDetails,
}: ExperimentListProps) {
  // Filter state
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modeFilter, setModeFilter] = useState<string>("");
  const [presetFilter, setPresetFilter] = useState<string>("");

  // Get unique presets from experiments
  const uniquePresets = useMemo(() => {
    const presets = new Set(experiments.map((e) => e.preset));
    return Array.from(presets).sort();
  }, [experiments]);

  // Filter experiments
  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) => {
      // Search filter (name, preset, id)
      if (searchText) {
        const search = searchText.toLowerCase();
        const matchesSearch =
          exp.name.toLowerCase().includes(search) ||
          exp.preset.toLowerCase().includes(search) ||
          exp.id.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter && exp.status !== statusFilter) return false;

      // Mode filter
      if (modeFilter && exp.mode !== modeFilter) return false;

      // Preset filter
      if (presetFilter && exp.preset !== presetFilter) return false;

      return true;
    });
  }, [experiments, searchText, statusFilter, modeFilter, presetFilter]);

  // Handle baseline toggle
  const handleBaselineToggle = async (id: string, currentlyBaseline: boolean) => {
    try {
      await api.setBaseline(id, !currentlyBaseline);
      onRefresh();
    } catch (err) {
      console.error("Failed to toggle baseline:", err);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          {onViewDetails && (
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(params.row.id);
              }}
            >
              View
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            color={params.row.status === "pending" ? "success" : "primary"}
            disabled={params.row.status === "running"}
            onClick={(e) => {
              e.stopPropagation();
              onRun(params.row.id);
            }}
          >
            Run
          </Button>
          <Tooltip title="Clone experiment">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onClone(params.row.id);
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(params.row.id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "isBaseline",
      headerName: "",
      width: 40,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title={params.row.isBaseline ? "Remove baseline" : "Mark as baseline"}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleBaselineToggle(params.row.id, params.row.isBaseline);
            }}
          >
            {params.row.isBaseline ? (
              <StarIcon color="warning" fontSize="small" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      ),
    },
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    { field: "preset", headerName: "Preset", width: 100 },
    {
      field: "mode",
      headerName: "Mode",
      width: 80,
      renderCell: (params) => <ModeBadge mode={params.value || "turbo-v2"} />,
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => <StatusBadge status={params.value} />,
    },
    {
      field: "samples",
      headerName: "Samples",
      width: 80,
      valueGetter: (params) => params.row.samples?.length || 0,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 130,
      valueGetter: (params) =>
        new Date(params.value).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  const handleSelectionChange = (model: GridRowSelectionModel) => {
    onSelectionChange(model as string[]);
  };

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setModeFilter("");
    setPresetFilter("");
  };

  const hasFilters = searchText || statusFilter || modeFilter || presetFilter;

  return (
    <Box>
      {/* Filter controls */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search experiments..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="running">Running</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Mode</InputLabel>
          <Select
            value={modeFilter}
            label="Mode"
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="turbo-v2">Turbo</MenuItem>
            <MenuItem value="sequential">Sequential</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Preset</InputLabel>
          <Select
            value={presetFilter}
            label="Preset"
            onChange={(e) => setPresetFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {uniquePresets.map((preset) => (
              <MenuItem key={preset} value={preset}>
                {preset}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasFilters && (
          <Button size="small" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Chip
          label={`${filteredExperiments.length} of ${experiments.length} experiments`}
          size="small"
          variant="outlined"
        />
      </Box>

      {/* Data grid */}
      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredExperiments}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedIds}
          onRowSelectionModelChange={handleSelectionChange}
          onRowDoubleClick={(params) => {
            if (onViewDetails) {
              onViewDetails(params.row.id);
            }
          }}
          initialState={{
            sorting: {
              sortModel: [{ field: "createdAt", sort: "desc" }],
            },
          }}
          sx={{
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
              backgroundColor: "#f5f5f5",
            },
          }}
        />
      </div>
    </Box>
  );
}
