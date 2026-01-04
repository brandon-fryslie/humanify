/**
 * Root App component with Dockview 4-zone layout
 * Proof-of-concept for panel-based architecture
 */

import { useEffect, useRef, useState } from 'react';
import {
  DockviewReact,
  DockviewReadyEvent,
  DockviewApi,
  IDockviewPanelProps,
} from 'dockview';
import 'dockview/dist/styles/dockview.css';
import { DummyPanel } from './components/panels/DummyPanel';
import { loadWorkspaceState, saveWorkspaceState } from './state/panel-state';

// Component registry
const components = {
  dummy: (props: IDockviewPanelProps) => (
    <DummyPanel params={props.params as { title?: string; color?: string }} />
  ),
};

export function App() {
  const apiRef = useRef<DockviewApi | null>(null);
  const [isReady, setIsReady] = useState(false);

  const onReady = (event: DockviewReadyEvent) => {
    apiRef.current = event.api;

    // Load persisted state
    const state = loadWorkspaceState();
    console.log('[app] Loaded workspace state:', state);

    // Create 4-zone layout with dummy panels for PoC
    // Left sidebar
    event.api.addPanel({
      id: 'experiment-tree',
      component: 'dummy',
      title: 'Experiments',
      params: { title: 'Experiment Tree', color: '#10b981' },
      position: { direction: 'left' },
    });

    // Main area with tabs
    event.api.addPanel({
      id: 'detail-1',
      component: 'dummy',
      title: 'exp-001',
      params: { title: 'Experiment exp-001', color: '#3b82f6' },
    });
    event.api.addPanel({
      id: 'detail-2',
      component: 'dummy',
      title: 'exp-002',
      params: { title: 'Experiment exp-002', color: '#6366f1' },
    });

    // Right sidebar (Inspector)
    event.api.addPanel({
      id: 'inspector',
      component: 'dummy',
      title: 'Inspector',
      params: { title: 'Inspector', color: '#8b5cf6' },
      position: { direction: 'right' },
    });

    // Bottom panel (Logs)
    event.api.addPanel({
      id: 'logs',
      component: 'dummy',
      title: 'Logs',
      params: { title: 'Log Viewer', color: '#f59e0b' },
      position: { direction: 'below' },
    });

    setIsReady(true);

    // Persist state on panel changes
    event.api.onDidAddPanel(() => {
      persistState();
    });
    event.api.onDidRemovePanel(() => {
      persistState();
    });
  };

  const persistState = () => {
    if (!apiRef.current) return;

    // Get current panel layout (simplified for PoC)
    const currentState = loadWorkspaceState();
    saveWorkspaceState(currentState);
    console.log('[app] Persisted workspace state');
  };

  // Save state on unmount
  useEffect(() => {
    return () => {
      persistState();
    };
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar placeholder */}
      <div
        style={{
          height: '48px',
          backgroundColor: '#1f2937',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '16px',
          borderBottom: '1px solid #374151',
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>HumanifyJS Developer Workbench v2</div>
        <div style={{ fontSize: '14px', color: '#9ca3af' }}>
          {isReady ? 'Ready' : 'Loading...'}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#9ca3af' }}>
          Dockview PoC - Drag panels between zones
        </div>
      </div>

      {/* Dockview workspace */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <DockviewReact
          className="dockview-theme-light"
          onReady={onReady}
          components={components}
        />
      </div>
    </div>
  );
}
