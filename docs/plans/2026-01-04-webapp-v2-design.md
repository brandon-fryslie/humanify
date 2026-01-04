# HumanifyJS Developer Workbench v2 Design

**Date**: 2026-01-04
**Status**: Approved
**Target User**: Application Developer (building/testing the deobfuscation tool)

## Overview

A flexible, panel-based workspace optimized for rapid iteration on the HumanifyJS deobfuscation tool. Designed for developers who need to quickly test changes, compare results, and debug the application.

## Core Principles

1. **Everything accessible** - No hunting through modals. All functionality reachable in 1-2 actions.
2. **Keyboard-first** - Command palette (Cmd+P) for everything. Context menus as backup.
3. **Independent panels** - Each panel is self-contained. Open multiples, arrange freely.
4. **Context-sensitive inspector** - Right sidebar shows relevant details for current selection.
5. **Real-time updates** - WebSocket-based live updates during runs.
6. **Simple implementation** - Avoid component coupling. Keep panels independent.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  TOOLBAR                                                        │
├──────────┬─────────────────────────────────┬────────────────────┤
│  LEFT    │           MAIN (tabbed)         │      RIGHT         │
├──────────┴─────────────────────────────────┴────────────────────┤
│  BOTTOM (tabbed)                                                │
└─────────────────────────────────────────────────────────────────┘
```

- **4 zones**: Left Sidebar, Main (tabbed), Right Sidebar, Bottom
- **All zones support tabs**
- **Any panel can go in any zone** via drag or command palette
- **Zones are collapsible** with keyboard shortcuts

### Default Startup Layout

| Zone | Panel |
|------|-------|
| Left | Experiment Tree |
| Main | Empty (Detail tabs open on double-click) |
| Right | Inspector (context-sensitive) |
| Bottom | Collapsed |

### State Persistence

- **Remembered**: Which panels are open, which tabs exist
- **Reset each session**: Panel positions back to defaults
- **Upgrade-safe**: New panels can be added without conflicting with old state

---

## Toolbar

Slim, always-visible bar at the top. Provides quick actions and global status.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [▶ Run ▾] [Preset: hybrid ▾] [Sample: small-axios ▾]  │  ● 2 running  ○ 3 queued  │  [⌘P] [⚙]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components

| Element | Behavior |
|---------|----------|
| **Run Button** | Creates new experiment with selected preset+sample and runs it |
| **Preset Picker** | Dropdown to select preset for next run |
| **Sample Picker** | Dropdown to select sample file |
| **Status Indicator** | Display only. Shows running/queued counts |
| **Command Palette** | Button hint for Cmd+P |
| **Settings Gear** | Opens settings panel |

---

## Panels

### Priority Order

1. Experiment Tree (left sidebar)
2. Experiment Grid (main)
3. Experiment Detail (main, tabbed)
4. Metrics Dashboard (main)
5. Preset Editor (main)
6. Inspector (right sidebar)
7. Data Management (main)
8. Log Viewer (bottom, tabbed)

---

### Experiment Tree (Left Sidebar)

Hierarchical navigation with collapsible categories.

```
┌─────────────────────────────────┐
│  EXPERIMENTS            [+ New] │
├─────────────────────────────────┤
│  🔍 Search...                   │
├─────────────────────────────────┤
│  ▼ By Status                    │
│    ▼ Running (2)                │
│        exp-019                  │
│        exp-044                  │
│    ▸ Completed (12)             │
│    ▸ Failed (1)                 │
│    ▸ Pending (3)                │
│                                 │
│  ▼ By Preset                    │
│    ▸ quality-openai (5)         │
│    ▸ hybrid (4)                 │
│    ▸ local-only (6)             │
│                                 │
│  ▼ By Sample                    │
│    ▸ small-axios (8)            │
│    ▸ tiny-qs (4)                │
│    ▸ medium-chart (3)           │
└─────────────────────────────────┘
```

**Interactions:**
- Single click → select (updates Inspector)
- Double click → open Detail tab in Main zone
- Right click → context menu (Run, Clone, Delete, Mark Baseline)

---

### Experiment Grid (Main Zone)

Flat, sortable, filterable table view. Too wide for sidebar, opens in Main.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  EXPERIMENTS                                    🔍 Search...   [Filters ▾]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Name      │ Score │ Preset        │ Sample      │ Runs │ Status    │ Cost  │
│  ──────────│───────│───────────────│─────────────│──────│───────────│───────│
│  exp-023 ⭐│  96.8 │ quality-openai│ small-axios │    2 │ completed │ $0.12 │
│  exp-019   │  95.2 │ hybrid        │ small-axios │    1 │ ████░ 67% │ $0.04 │
│  exp-001   │  94.2 │ local-only    │ tiny-qs     │    3 │ completed │ FREE  │
│  exp-018   │  93.1 │ quality-openai│ medium-chart│    1 │ completed │ $0.34 │
│  exp-007   │  91.8 │ hybrid        │ small-axios │    2 │ failed    │ $0.08 │
│           ...                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Showing 18 experiments                              [◀ 1 of 2 ▶]   [25 ▾]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Sortable columns (click header)
- Pagination
- Same interactions as Tree (single click select, double click open)

---

### Experiment Detail (Main Zone, Tabbed)

Opens when double-clicking an experiment. Multiple can be open as tabs.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  exp-023                                    [▶ Run] [Clone] [Delete] [⋯]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CONFIG                                                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Preset: quality-openai          Sample: small-axios                        │
│  Created: 2024-01-04 10:23       Baseline: ⭐ Yes                           │
│                                                                             │
│  RUNS                                                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  #  │ Score │ Duration │ Tokens  │ Cost  │ Status    │ Started             │
│  ───│───────│──────────│─────────│───────│───────────│─────────────────────│
│  3  │  96.8 │     45s  │  12.4K  │ $0.04 │ completed │ 10:45:23            │
│  2  │  95.1 │     52s  │  14.2K  │ $0.05 │ completed │ 10:32:11            │
│  1  │  94.2 │     48s  │  13.1K  │ $0.04 │ completed │ 10:15:44            │
│                                                                             │
│  PASSES (Run #3)                                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  #  │ Processor │ Mode  │ Renamed │ Unchanged │ Duration │ Tokens          │
│  ───│───────────│───────│─────────│───────────│──────────│─────────────────│
│  1  │ local-llm │ turbo │      42 │        18 │     23s  │ 0 (local)       │
│  2  │ openai    │ turbo │      18 │        42 │     22s  │ 12.4K           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Sections (all collapsible):**
- **Header**: Name, action buttons (Run, Clone, Delete)
- **Config**: Preset, sample, created date, baseline status
- **Runs**: Table of all runs with key metrics
- **Passes**: Per-run breakdown, expandable

**Interactions:**
- Click Run → starts new run immediately
- Click Run row → updates Inspector, expands Passes for that run
- Click Pass row → updates Inspector
- Double-click Pass → opens log in Bottom zone

**Real-time Updates:**
- WebSocket connection per open Detail panel
- `● LIVE` indicator when connected and run active
- Metrics update as batches complete

---

### Inspector (Right Sidebar)

Context-sensitive. Updates based on current selection.

**Nothing selected:**
```
┌─────────────────────────┐
│  INSPECTOR              │
├─────────────────────────┤
│  Select an experiment,  │
│  run, pass, or          │
│  identifier to inspect  │
└─────────────────────────┘
```

**Context updates:**
- Select **experiment** → shows config, preset details, quick stats
- Select **run** → shows run metrics, token usage, cost breakdown
- Select **pass** → shows pass config, renamed count, duration
- Select **identifier** → shows original name, new name, surrounding code context

---

### Log Viewer (Bottom Zone, Tabbed)

Shows logs and output. Multiple log streams can be open as tabs.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  │ exp-019 run #2 │ exp-023 run #3 │ +                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Level ▾] [Pass ▾] 🔍 Filter...                          [Clear] [Export]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  10:45:23.123 INFO   Starting pass 2 (openai, turbo mode)                   │
│  10:45:23.456 DEBUG  Extracting context for identifier `a` (scope: fn#3)    │
│  10:45:24.012 INFO   Batch 1/5: 10 identifiers                              │
│  10:45:25.456 INFO   Renamed: a → responseData (conf: 0.94)                 │
│  10:45:25.678 WARN   Skipped: c (collision with existing name)              │
│           ...                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Level filter (DEBUG, INFO, WARN, ERROR)
- Pass filter
- Text search
- Clear / Export buttons
- Auto-scroll when at bottom
- Live via WebSocket

---

### Metrics Dashboard (Main Zone)

Visual overview of performance across experiments.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  METRICS DASHBOARD                                      [Time: All ▾]       │
├─────────────────────────────────────────────────────────────────────────────┤
│  TOTALS                          SCORE DISTRIBUTION                         │
│  Experiments: 18                      ▁▃▅▇█▇▅▂                              │
│  Total runs: 47                  80 ──────────── 100                        │
│  Tokens used: 1.2M                                                          │
│  Total cost: $4.23               COST BY PRESET                             │
│                                  quality ████████ $2.10                     │
│  SCORE OVER TIME                 hybrid  ███░░░░░ $1.80                     │
│       ╭─────────╮                local   ░░░░░░░░ FREE                      │
│      ╱          ╲╱╲                                                         │
│  ───╱──────────────────          TOP PERFORMERS                             │
│                                  1. exp-023 (96.8)                          │
│                                  2. exp-019 (95.2)                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Preset Editor (Main Zone)

Create and edit pipeline presets.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRESET EDITOR                                          [Save] [Save As]    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Name: my-hybrid-preset                                                     │
│                                                                             │
│  PASSES                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │ 1. local-llm    │ Model: 3B     │ Mode: turbo │ Conc: 1    │ [×]        │
│  └─────────────────────────────────────────────────────────────┘            │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │ 2. openai       │ Model: gpt-4o │ Mode: turbo │ Conc: 20   │ [×]        │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                             │
│  [+ Add Pass]                                                               │
│                                                                             │
│  BUILT-IN PRESETS (read-only)                                               │
│  quality-openai │ hybrid │ local-only │ fast-gemini                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Data Management (Main Zone)

Admin/utility functions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DATA MANAGEMENT                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  QUICK ACTIONS                                                              │
│  [Clear All Experiments]  [Clear Completed Only]  [Clear Failed Only]       │
│                                                                             │
│  STORAGE                                                                    │
│  Experiments: 18 (2.3 MB)                                                   │
│  Logs: 47 runs (12.1 MB)                                                    │
│  Checkpoints: 3 (890 KB)                                                    │
│                                                                             │
│  [Export All Data]  [Import Data]                                           │
│                                                                             │
│  DANGER ZONE                                                                │
│  [Reset Database]  ← Deletes everything, cannot undo                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Command Palette

Quicksilver/Raycast-style action chaining. Opens with `Cmd+P`.

### Interaction Flow

**Step 1: Select Action**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔍 run                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  → Run Experiment                                              Tab to select│
│    Run All Pending                                                          │
│    Run Failed                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Step 2: Press Tab → Submenu**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Run Experiment ▸  🔍                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│    exp-023 (quality-openai, small-axios)                                    │
│    exp-019 (hybrid, small-axios)                                            │
│    exp-001 (local-only, tiny-qs)                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ← Backspace to go back                                        Enter to run │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Keys

| Key | Action |
|-----|--------|
| Type | Filter current list |
| `Tab` or `→` | Drill into submenu |
| `Backspace` or `←` | Go back |
| `Enter` | Execute |
| `Escape` | Close |

### Example Chains

| Chain | Result |
|-------|--------|
| `Run` → Tab → `exp-023` → Enter | Runs exp-023 |
| `Open Panel` → Tab → `Metrics` → Enter | Opens Metrics Dashboard |
| `Delete` → Tab → `exp-007` → Enter | Deletes exp-007 |
| `Clear` → Tab → `Completed` → Enter | Clears completed experiments |

### Submenu Definitions

| Action | Submenu Contains |
|--------|------------------|
| Run Experiment | List of experiments |
| Open Panel | List of available panels |
| Open Logs | List of runs |
| Delete | List of experiments |
| Set Preset | List of presets |
| Clear | Completed / Failed / All |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+P` | Open command palette |
| `Cmd+N` | New experiment |
| `Cmd+Enter` | Run selected experiment |
| `Cmd+W` | Close current tab |
| `Cmd+\` | Toggle left sidebar |
| `Cmd+J` | Toggle bottom panel |
| `Cmd+Shift+E` | Open Experiment Grid |
| `Escape` | Close palette / cancel |

---

## Panel Management

- **Command palette**: `Cmd+P` → "Open Panel" → Tab → select panel
- **Right-click in zone**: Context menu to add/close panels
- **No menu bar**: Keep UI minimal

---

## Future Capabilities

### Identifier Trace Panel

Compare how a specific identifier was renamed across all configurations:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  IDENTIFIER TRACE: `a` (from small-axios)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Experiment    │ Preset        │ Run │ Pass │ Renamed To      │ Confidence │
│  ──────────────│───────────────│─────│──────│─────────────────│────────────│
│  exp-023       │ quality-openai│   3 │    1 │ responseData    │ 0.94       │
│  exp-019       │ hybrid        │   1 │    2 │ responseData    │ 0.91       │
│  exp-001       │ local-only    │   1 │    1 │ data            │ 0.65       │
└─────────────────────────────────────────────────────────────────────────────┘
```

Traces identifier renames across:
- Passes within a run
- Runs within an experiment
- Different presets
- Different experiments

---

## Implementation Notes

1. **WebSocket for real-time**: All live updates via WebSocket, not polling
2. **Panels are independent**: No cross-panel coupling. Each panel manages its own state.
3. **Toolbar is simple**: Run button always creates new experiment. No context-awareness.
4. **Partial persistence**: Remember open panels/tabs, reset positions on reload
5. **Iterate**: This design will evolve. Keep implementation flexible.
