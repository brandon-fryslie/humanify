# Turbo-V2 Experiment Dashboard: Full Roadmap

**Total Estimate:** 4 sprints (can compress to 2-3 with focused effort)

---

## Sprint 1: Foundation & Backend API

**Goal:** Working backend that can store and retrieve experiments

### Deliverables

1. **Project Scaffolding**
   - [ ] Create `src/turbo-v2/webapp/` directory structure
   - [ ] Initialize package.json with dependencies
   - [ ] Configure TypeScript, Vite, Express
   - [ ] Shared types in `shared/types.ts`

2. **Storage Layer**
   - [ ] `ExperimentConfig` type (id, name, preset, samples, createdAt)
   - [ ] `ExperimentResult` type (experimentId, sample, score, duration, completedAt)
   - [ ] JSON file read/write to `.humanify-experiments/experiments.json`
   - [ ] Auto-create directory if missing

3. **REST API Endpoints**
   - [ ] `GET /api/experiments` - List all experiments
   - [ ] `POST /api/experiments` - Create new experiment
   - [ ] `GET /api/experiments/:id` - Get single experiment with results
   - [ ] `DELETE /api/experiments/:id` - Delete experiment

**Acceptance Test:**
```bash
curl http://localhost:3456/api/experiments  # Returns []
curl -X POST -d '{"name":"test","preset":"fast","samples":["tiny-qs"]}' http://localhost:3456/api/experiments
curl http://localhost:3456/api/experiments  # Returns [{ id: "exp-test-...", ... }]
```

---

## Sprint 2: Experiment Runner Integration

**Goal:** Ability to execute experiments from the API

### Deliverables

1. **Runner Service**
   - [ ] Import turbo-v2 execution code programmatically
   - [ ] `POST /api/experiments/:id/run` endpoint
   - [ ] Track status: pending → running → completed/failed
   - [ ] Store results per sample

2. **Scoring Integration**
   - [ ] Call semantic scoring after each sample completes
   - [ ] Store score in results
   - [ ] Calculate average score across samples

3. **Status Polling**
   - [ ] `GET /api/experiments/:id/status` returns current state
   - [ ] Include progress: { sample: "tiny-qs", status: "running" }

**Acceptance Test:**
```bash
curl -X POST http://localhost:3456/api/experiments/exp-test-123/run
# Wait...
curl http://localhost:3456/api/experiments/exp-test-123
# Returns { status: "completed", results: [{ sample: "tiny-qs", score: 75 }] }
```

---

## Sprint 3: React Dashboard UI

**Goal:** Visual interface for managing experiments

### Deliverables

1. **React + Vite Setup**
   - [ ] Vite config with proxy to Express backend
   - [ ] MUI theme setup (light mode)
   - [ ] Basic layout with AppBar

2. **Experiment List Component**
   - [ ] MUI DataGrid showing all experiments
   - [ ] Columns: checkbox, name, preset, status, avg score, actions
   - [ ] Status badges (chip: pending/running/completed/failed)
   - [ ] Refresh button

3. **New Experiment Dialog**
   - [ ] MUI Dialog triggered by "+ New" button
   - [ ] Form: name TextField, preset Select, samples Checkboxes
   - [ ] Create button calls POST /api/experiments
   - [ ] Optional: "Create & Run" button

4. **Run Controls**
   - [ ] Run button in actions column
   - [ ] Disable while running
   - [ ] Poll status every 2s while running

**Acceptance Test:**
- Open http://localhost:3456
- Click "+ New", fill form, click "Create"
- See new experiment in list
- Click "Run", see status change to "Running"
- Wait, see status change to "Completed" with score

---

## Sprint 4: Comparison View & Polish

**Goal:** Compare experiments side-by-side

### Deliverables

1. **Comparison View**
   - [ ] Checkbox selection in experiment list
   - [ ] "Compare Selected" button (enabled when 2+ selected)
   - [ ] Comparison dialog/page with MUI Table
   - [ ] Rows: each sample + average + duration
   - [ ] Columns: each selected experiment
   - [ ] Delta column vs first selected

2. **Visual Polish**
   - [ ] Color coding: green (+), red (-), gray (=)
   - [ ] Bold best score per row
   - [ ] Sort by name or date

3. **Quality of Life**
   - [ ] Delete confirmation dialog
   - [ ] Error snackbar for API failures
   - [ ] Loading states (Skeleton)
   - [ ] justfile recipe: `just experiment-dashboard`

**Acceptance Test:**
- Select "baseline" and "multi-prompt" experiments
- Click "Compare Selected"
- See table with scores and deltas
- Green highlight on better scores

---

## File Structure (Final)

```
src/turbo-v2/webapp/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── server/
│   ├── index.ts              # Express app
│   ├── storage.ts            # JSON persistence
│   └── api/
│       ├── experiments.ts    # CRUD routes
│       └── runner.ts         # Execution logic
├── client/
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── theme.ts
│   ├── api.ts                # Fetch helpers
│   └── components/
│       ├── Layout.tsx
│       ├── ExperimentList.tsx
│       ├── ExperimentForm.tsx
│       ├── StatusBadge.tsx
│       └── CompareView.tsx
└── shared/
    └── types.ts
```

---

## Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mui/material": "^5.15.0",
    "@mui/x-data-grid": "^6.18.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "@types/express": "^4.17.21",
    "@types/react": "^18.2.0",
    "concurrently": "^8.2.0"
  }
}
```

---

## Quick Start (After Implementation)

```bash
# Start development
just experiment-dashboard

# Or manually:
cd src/turbo-v2/webapp
npm install
npm run dev
# Opens http://localhost:3456
```
