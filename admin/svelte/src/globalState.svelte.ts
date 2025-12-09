/**
 * Global application state
 *
 * Usage: import { appState } from './globalState.svelte';
 * Access: appState.compactMode, appState.themeMode
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

export const appState = $state({
  compactMode: false,
  themeMode: 'auto' as ThemeMode
});
