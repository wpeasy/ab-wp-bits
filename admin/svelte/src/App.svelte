<script lang="ts">
  import type { Module } from './types';
  import ModuleManager from './ModuleManager.svelte';
  import ModuleSettings from './ModuleSettings.svelte';
  import VerticalTabs from './lib/VerticalTabs.svelte';
  import SettingsDropdown from './lib/SettingsDropdown.svelte';

  // Get initial data from WordPress
  const initialModules: Module[] = window.abWpBitsData.modules;

  // State
  let modules = $state<Module[]>(initialModules);
  let activeTab = $state('modules');
  let activeModuleSubTab = $state<'settings' | 'instructions'>('settings');

  // Settings state
  let compactMode = $state(false);
  let themeMode = $state<'light' | 'dark' | 'auto'>('auto');

  // Apply theme mode
  $effect(() => {
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.style.setProperty('color-scheme', 'light only');
    } else if (themeMode === 'dark') {
      root.style.setProperty('color-scheme', 'dark only');
    } else {
      root.style.setProperty('color-scheme', 'light dark');
    }
  });

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

<div class="ab-wp-bits-admin" class:ab-wp-bits-admin--compact={compactMode}>
  <VerticalTabs {tabs} bind:activeTab>
    {#snippet actions()}
      <SettingsDropdown
        bind:compactMode
        bind:themeMode
      />
    {/snippet}
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
  </VerticalTabs>
</div>

<style>
  .ab-wp-bits-admin {
    font-family: var(--wpea-font-sans);
    background: var(--wpea-surface--bg);
    min-height: 400px;
  }

  .ab-wp-bits-admin--compact {
    font-size: 0.9em;
  }

  .ab-wp-bits-admin--compact :global(.wpea-vtabs__tab) {
    padding: var(--wpea-space--xs) var(--wpea-space--sm);
  }

  .ab-wp-bits-admin--compact :global(.wpea-card) {
    padding: var(--wpea-space--sm);
  }
</style>
