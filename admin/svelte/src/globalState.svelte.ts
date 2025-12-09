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
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

type AppState = {
  compactMode: boolean;
  themeMode: ThemeMode;
};

// Check if state already exists on window (from another app instance)
const existingState = (window as any).wpeaAppState as AppState | undefined;

export const appState = $state<AppState>(existingState ?? {
  compactMode: false,
  themeMode: 'auto'
});

// Expose on window for cross-app access
(window as any).wpeaAppState = appState;

// Helper to update state and notify other apps
export function updateAppState<K extends keyof AppState>(key: K, value: AppState[K]) {
  appState[key] = value;
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
