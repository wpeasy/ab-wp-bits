import { mount } from 'svelte';
import MenuConditionsApp from './MenuConditionsApp.svelte';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Create a container for the app
  const container = document.createElement('div');
  container.id = 'ab-menu-conditions-app';
  document.body.appendChild(container);

  // Mount the app
  mount(MenuConditionsApp, {
    target: container
  });
}
