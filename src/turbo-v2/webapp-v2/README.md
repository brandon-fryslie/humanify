# HumanifyJS Developer Workbench v2

Panel-based developer workbench for the HumanifyJS deobfuscation tool. This is a ground-up rewrite of the webapp with a focus on flexible, panel-based architecture.

## Architecture

Built with:
- React 18
- TypeScript (strict mode)
- Vite (dev server + build)
- Dockview (panel layout library)

Key principles:
- Everything accessible (no hunting through modals)
- Keyboard-first (command palette for everything)
- Independent panels (each panel is self-contained)
- Context-sensitive inspector (right sidebar)
- Real-time updates (WebSocket-based)

## Project Structure

```
webapp-v2/
├── client/                 # Frontend React app
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # Root with Dockview layout
│   ├── index.html         # HTML template
│   ├── components/
│   │   ├── layout/        # Layout components (future)
│   │   └── panels/        # Panel components
│   │       └── DummyPanel.tsx
│   └── state/
│       └── panel-state.ts # Panel state management
├── server/                # Backend Express server
│   └── index.ts          # API server
├── shared/               # Shared types
│   └── types.ts         # TypeScript interfaces
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Setup

```bash
# Install dependencies
npm install

# Start dev server (frontend only)
npm run dev

# Start backend server (in separate terminal)
cd server
node index.ts

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

### Frontend
- Dev server runs on http://localhost:3457
- Proxies API requests to backend on http://localhost:3458
- Hot module replacement enabled

### Backend
- API server runs on http://localhost:3458
- Express + CORS enabled
- Health check at /api/health

## Dockview Proof-of-Concept

Current implementation demonstrates:

1. **4-Zone Layout**: Left sidebar, Main area (tabbed), Right sidebar, Bottom panel
2. **Tabs in Each Zone**: Main and Bottom support multiple tabs
3. **Drag-Drop**: Panels can move between zones via drag
4. **State Persistence**: Saves to localStorage, restores on reload

### Testing the PoC

1. Start the dev server: `npm run dev`
2. Open http://localhost:3457
3. Try dragging panel tabs between zones
4. Refresh the page to verify state persistence

### PoC Validation Checklist

- [x] 4-zone layout renders correctly
- [x] Tabs work in Main zone (multiple tabs, switch between)
- [ ] Tabs work in Bottom zone
- [ ] Can drag panel from Main to Left
- [ ] Can drag panel from Main to Right
- [ ] Can drag panel from Main to Bottom
- [ ] State persists to localStorage
- [ ] State restores on page reload
- [ ] Bundle size is acceptable (<50KB gzipped for dockview)

## Differences from v1

### What's New
- Panel-based architecture (no modals)
- Dockview for flexible layouts
- State persistence (panels/tabs)
- Better TypeScript support

### What's Not Ported
- Modal components (by design)
- SSE infrastructure (will use WebSocket)
- Old App.tsx structure

### What's Reused
- shared/types.ts (364 LOC)
- Backend storage structure (future)
- Backend API routes (future)

## Next Steps

1. Verify Dockview bundle size
2. Complete PoC validation checklist
3. Implement real panels (Experiment Tree, Detail, etc.)
4. Add WebSocket support
5. Implement keyboard shortcuts
6. Add command palette

## Notes

This is a proof-of-concept. The focus is on validating the panel architecture before building real functionality.
