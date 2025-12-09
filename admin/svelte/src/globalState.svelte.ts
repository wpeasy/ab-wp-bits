/**
 * Global application state
 *
 * Usage: import { appState } from './globalState.svelte';
 * Access: appState.compactMode, appState.themeMode
 *
 * For cross-app reactivity, other apps can:
 * 1. Import this same file (if bundled together)
 * 2. Listen for 'wpea:state-change' events on window
 * 3. Access window.wpeaAppState directly (read-only recommended)
 *
 * State is automatically persisted to localStorage and hydrated on load.
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

type AppState = {
  compactMode: boolean;
  themeMode: ThemeMode;
};

const STORAGE_KEY = 'ab-wp-bits-settings';

const defaultState: AppState = {
  compactMode: false,
  themeMode: 'auto'
};

// Load state from localStorage
function loadFromStorage(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate and merge with defaults (in case new properties were added)
      return {
        compactMode: typeof parsed.compactMode === 'boolean' ? parsed.compactMode : defaultState.compactMode,
        themeMode: ['light', 'dark', 'auto'].includes(parsed.themeMode) ? parsed.themeMode : defaultState.themeMode
      };
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage:', e);
  }
  return defaultState;
}

// Save state to localStorage
function saveToStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
}

// Check if state already exists on window (from another app instance)
const existingState = (window as any).wpeaAppState as AppState | undefined;

// Initialize state: prefer window state, then localStorage, then defaults
export const appState = $state<AppState>(existingState ?? loadFromStorage());

// Expose on window for cross-app access
(window as any).wpeaAppState = appState;

// Helper to update state, persist to localStorage, and notify other apps
export function updateAppState<K extends keyof AppState>(key: K, value: AppState[K]) {
  appState[key] = value;
  saveToStorage(appState);
  window.dispatchEvent(new CustomEvent('wpea:state-change', {
    detail: { key, value, state: appState }
  }));
}

// Helper for other apps to subscribe to changes
export function onAppStateChange(callback: (detail: { key: keyof AppState; value: any; state: AppState }) => void) {
  const handler = (e: CustomEvent) => callback(e.detail);
  window.addEventListener('wpea:state-change', handler as EventListener);
  return () => window.removeEventListener('wpea:state-change', handler as EventListener);
}
