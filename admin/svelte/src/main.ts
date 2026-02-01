/**
 * Main entry point for AB WP Bits admin app
 */

import { mount } from 'svelte';
import App from './App.svelte';

// Guard against double mount — WordPress adds ?ver= to the module URL,
// but lazy chunks import from the bare path, which the browser may treat
// as a separate module identity, executing this file twice.
const target = document.getElementById('ab-wp-bits-app');

if (target && !target.dataset.mounted) {
  target.dataset.mounted = 'true';
  mount(App, {
    target
  });
}
