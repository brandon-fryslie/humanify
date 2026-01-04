/**
 * Panel state management with localStorage persistence
 *
 * Persistence strategy:
 * - REMEMBER: Which panels are open, which tabs exist
 * - RESET: Panel positions back to defaults on each session
 */

export interface WorkspaceState {
  version: string;
  panels: {
    left: string[];      // Panel IDs
    main: string[];      // Tab IDs
    right: string[];     // Panel IDs
    bottom: string[];    // Tab IDs
  };
  collapsed: {
    left: boolean;
    right: boolean;
    bottom: boolean;
  };
}

const CURRENT_VERSION = '1.0.0';
const STORAGE_KEY = 'humanify-workspace-state';

const DEFAULT_STATE: WorkspaceState = {
  version: CURRENT_VERSION,
  panels: {
    left: ['experiment-tree'],
    main: [],
    right: ['inspector'],
    bottom: [],
  },
  collapsed: {
    left: false,
    right: false,
    bottom: true,
  },
};

export function loadWorkspaceState(): WorkspaceState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;

    const parsed = JSON.parse(stored) as WorkspaceState;

    // Version mismatch - reset to defaults
    if (parsed.version !== CURRENT_VERSION) {
      console.log('[panel-state] Version mismatch, resetting to defaults');
      return DEFAULT_STATE;
    }

    return parsed;
  } catch (error) {
    console.error('[panel-state] Failed to load state:', error);
    return DEFAULT_STATE;
  }
}

export function saveWorkspaceState(state: WorkspaceState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[panel-state] Failed to save state:', error);
  }
}

export function clearWorkspaceState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[panel-state] Failed to clear state:', error);
  }
}
