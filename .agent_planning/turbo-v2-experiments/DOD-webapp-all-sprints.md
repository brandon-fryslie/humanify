# Definition of Done: Experiment Dashboard (All Sprints)

## Sprint 1: Foundation & Backend API

### Storage Layer
- [ ] `experiments.json` created in `.humanify-experiments/` on first write
- [ ] Read returns empty array if file doesn't exist
- [ ] Write is atomic (write to temp, rename)
- [ ] Types exported from `shared/types.ts`

### REST API
- [ ] Server starts on port 3456
- [ ] `GET /api/experiments` returns `ExperimentConfig[]`
- [ ] `POST /api/experiments` validates input, generates ID, returns created config
- [ ] `GET /api/experiments/:id` returns 404 if not found
- [ ] `DELETE /api/experiments/:id` removes from storage

### Sprint 1 Exit Criteria
```bash
npm run dev  # Server starts without error
curl localhost:3456/api/experiments  # Returns JSON array
```

---

## Sprint 2: Experiment Runner Integration

### Runner Service
- [ ] `POST /api/experiments/:id/run` returns 202 Accepted
- [ ] Status changes: pending → running → completed
- [ ] Runs turbo-v2 with experiment's preset and samples
- [ ] Captures output path per sample

### Scoring Integration
- [ ] Calls `score-semantic.ts` after each sample
- [ ] Parses score from output
- [ ] Stores in `ExperimentResult.score`

### Status Endpoint
- [ ] Returns `{ status, currentSample?, progress? }`
- [ ] Works while running and after completion

### Sprint 2 Exit Criteria
```bash
# Create and run experiment
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"test","preset":"fast","samples":["tiny-qs"]}' \
  localhost:3456/api/experiments

curl -X POST localhost:3456/api/experiments/exp-test-xxx/run
# Wait 60s...
curl localhost:3456/api/experiments/exp-test-xxx
# Returns results with scores
```

---

## Sprint 3: React Dashboard UI

### Setup
- [ ] `npm run dev` starts both server and client
- [ ] Client proxies API requests to server
- [ ] No CORS errors in browser console

### Experiment List
- [ ] Shows all experiments in MUI DataGrid
- [ ] Columns: checkbox, name, preset, status, avg score, actions
- [ ] Clicking row shows details
- [ ] Refresh button updates list

### New Experiment Form
- [ ] Dialog opens on "+ New" click
- [ ] Name field required, validates non-empty
- [ ] Preset dropdown shows: fast, balanced, thorough, quality, anchor
- [ ] Sample checkboxes for: tiny-qs, small-axios, medium-chart
- [ ] At least one sample required
- [ ] Create button calls API and closes dialog

### Run Controls
- [ ] Run button visible for pending/completed experiments
- [ ] Button disabled while running
- [ ] Status updates without page refresh

### Sprint 3 Exit Criteria
- Open browser to localhost:3456
- Create experiment via form
- Run experiment via button
- See status update to "completed" with score

---

## Sprint 4: Comparison View & Polish

### Comparison View
- [ ] Checkbox column in experiment list
- [ ] "Compare Selected" button appears when 2+ selected
- [ ] Comparison table shows:
  - Row per sample + "Average" row
  - Column per selected experiment
  - Score values in cells
  - Delta column (vs first selected)

### Visual Polish
- [ ] Green text/background for positive deltas
- [ ] Red text/background for negative deltas
- [ ] Bold the best score in each row
- [ ] Duration row shows time in seconds

### Quality of Life
- [ ] Delete shows confirmation dialog
- [ ] API errors show snackbar with message
- [ ] Loading state shows skeleton
- [ ] Empty state shows "No experiments yet"

### Sprint 4 Exit Criteria
- Select 2 completed experiments
- Click "Compare Selected"
- See comparison table with colored deltas
- Verify best scores are highlighted

---

## Final Acceptance Test

Complete this workflow without errors:

1. `just experiment-dashboard` → Server starts, browser opens
2. Click "+ New" → Create "baseline" with preset=fast, all samples
3. Click "Run" → Wait for completion
4. Click "+ New" → Create "improved" with preset=thorough, all samples
5. Click "Run" → Wait for completion
6. Select both experiments → Click "Compare Selected"
7. Verify comparison table shows score deltas
8. Refresh page → Data persists
9. Delete "baseline" → Confirm → Removed from list
