/**
 * Main entry point for AB WP Bits admin app
 */

import { mount } from 'svelte';
import App from './App.svelte';

// Mount the app when DOM is ready
const target = document.getElementById('ab-wp-bits-app');

if (target) {
  mount(App, {
    target
  });
}
