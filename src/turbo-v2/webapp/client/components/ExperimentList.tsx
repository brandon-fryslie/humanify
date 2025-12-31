import React from "react";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { Button, Chip, Box } from "@mui/material";
import type { ExperimentConfig, ExperimentStatus } from "../../shared/types";

interface ExperimentListProps {
  experiments: ExperimentConfig[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
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

export function ExperimentList({
  experiments,
  selectedIds,
  onSelectionChange,
  onRun,
  onDelete,
}: ExperimentListProps) {
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
    { field: "preset", headerName: "Preset", width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => <StatusBadge status={params.value} />,
    },
    {
      field: "samples",
      headerName: "Samples",
      width: 150,
      valueGetter: (params) => params.row.samples?.length || 0,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 180,
      valueGetter: (params) =>
        new Date(params.value).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            disabled={params.row.status === "running"}
            onClick={(e) => {
              e.stopPropagation();
              onRun(params.row.id);
            }}
          >
            Run
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(params.row.id);
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const handleSelectionChange = (model: GridRowSelectionModel) => {
    onSelectionChange(model as string[]);
  };

  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={experiments}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={selectedIds}
        onRowSelectionModelChange={handleSelectionChange}
        initialState={{
          sorting: {
            sortModel: [{ field: "createdAt", sort: "desc" }],
          },
        }}
      />
    </div>
  );
}
