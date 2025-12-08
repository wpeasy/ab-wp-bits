<script lang="ts">
  import type { Module } from './types';
  import ModuleManager from './ModuleManager.svelte';
  import ModuleSettings from './ModuleSettings.svelte';
  import Tabs from './lib/Tabs.svelte';

  // Get initial data from WordPress
  const initialModules: Module[] = window.abWpBitsData.modules;

  // State
  let modules = $state<Module[]>(initialModules);
  let activeTab = $state('modules');
  let activeModuleSubTab = $state<'settings' | 'instructions'>('settings');

  // Compute enabled modules for tabs (sorted alphabetically)
  let enabledModules = $derived(
    modules
      .filter(m => m.enabled && m.has_settings)
      .toSorted((a, b) => a.name.localeCompare(b.name))
  );

  // Build tabs dynamically (Module Manager first, then alphabetically sorted modules)
  let tabs = $derived([
    {
      id: 'modules',
      label: 'Module Manager',
      separator: true // Add separator after this tab
    },
    ...enabledModules.map(module => ({
      id: `module-${module.id}`,
      label: module.name
    }))
  ]);

  function handleNavigate(moduleId: string, tab: 'settings' | 'instructions') {
    activeTab = `module-${moduleId}`;
    activeModuleSubTab = tab;
  }

  // Extract module ID from active tab
  let activeModuleId = $derived(
    activeTab.startsWith('module-') ? activeTab.replace('module-', '') : null
  );
</script>

<div class="ab-wp-bits-admin">
  <Tabs {tabs} bind:activeTab orientation="vertical">
    {#snippet content()}
      {#if activeTab === 'modules'}
        <ModuleManager bind:modules onNavigate={handleNavigate} />
      {:else if activeModuleId}
        <ModuleSettings
          moduleId={activeModuleId}
          bind:activeSubTab={activeModuleSubTab}
        />
      {/if}
    {/snippet}
  </Tabs>
</div>

<style>
  .ab-wp-bits-admin {
    font-family: var(--wpea-font-sans);
    background: var(--wpea-color--surface);
    min-height: 400px;
  }
</style>
