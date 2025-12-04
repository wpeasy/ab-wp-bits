<script lang="ts">
  import type { Module } from './types';
  import ModuleManager from './ModuleManager.svelte';
  import Tabs from './lib/Tabs.svelte';
  import { createRawSnippet } from 'svelte';

  // Get initial data from WordPress
  const initialModules: Module[] = window.abWpBitsData.modules;

  // State
  let modules = $state<Module[]>(initialModules);

  // Create tabs with raw snippets for content
  const tabs = [
    {
      id: 'modules',
      label: 'Module Manager',
      content: createRawSnippet(() => ({
        render: () => `<div id="module-manager-content"></div>`
      }))
    }
  ];

  // Mount the module manager content after tab renders
  $effect(() => {
    const container = document.getElementById('module-manager-content');
    if (container && !container.hasChildNodes()) {
      // The content will be rendered by the ModuleManager component below
    }
  });
</script>

<div class="wpea wpea-cq ab-wp-bits-admin">
  <Tabs {tabs} />

  <!-- Module Manager is always rendered, displayed based on active tab -->
  <div class="wpea-tab-panel">
    <ModuleManager bind:modules />
  </div>
</div>

<style>
  .ab-wp-bits-admin {
    font-family: var(--wpea-font-sans);
    background: var(--wpea-color--surface);
    min-height: 400px;
  }

  .wpea-tab-panel {
    padding: var(--wpea-space--lg);
  }
</style>
