<script lang="ts">
  import type { Module } from './types';
  import ModuleManager from './ModuleManager.svelte';
  import ModuleSettings from './ModuleSettings.svelte';
  import VerticalTabs from './lib/VerticalTabs.svelte';
  import SettingsDropdown from './lib/SettingsDropdown.svelte';
  import { appState } from './globalState.svelte';

  // Get initial data from WordPress
  const initialModules: Module[] = window.abWpBitsData.modules;

  // Local UI state
  let modules = $state<Module[]>(initialModules);
  let activeTab = $state('modules');
  let activeModuleSubTab = $state<'settings' | 'instructions'>('settings');

  // Apply theme mode from global state
  $effect(() => {
    const root = document.documentElement;
    if (appState.themeMode === 'light') {
      root.style.setProperty('color-scheme', 'light only');
    } else if (appState.themeMode === 'dark') {
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

<div class="ab-wp-bits-admin" class:ab-wp-bits-admin--compact={appState.compactMode}>
  <VerticalTabs {tabs} bind:activeTab>
    {#snippet actions()}
      <SettingsDropdown />
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

  /* Compact mode - reduce spacing and typography */
  .ab-wp-bits-admin--compact {
    --wpea-space--xs: 0.2rem;
    --wpea-space--sm: 0.35rem;
    --wpea-space--md: 0.6rem;
    --wpea-space--lg: 0.9rem;
    --wpea-space--xl: 1.2rem;
    --wpea-text--xs: 0.7rem;
    --wpea-text--sm: 0.775rem;
    --wpea-text--md: 0.85rem;
    --wpea-text--lg: 0.95rem;
    --wpea-text--xl: 1.1rem;
    font-size: var(--wpea-text--md);
    line-height: 1.4;
  }

  .ab-wp-bits-admin--compact :global(.wpea-vtabs__tab) {
    padding: var(--wpea-space--xs) var(--wpea-space--sm);
    font-size: var(--wpea-text--sm);
  }

  .ab-wp-bits-admin--compact :global(.wpea-card) {
    padding: var(--wpea-space--sm);
  }

  .ab-wp-bits-admin--compact :global(.wpea-card__title) {
    font-size: var(--wpea-text--lg);
  }

  .ab-wp-bits-admin--compact :global(h1) {
    margin-bottom: var(--wpea-space--sm);
  }

  .ab-wp-bits-admin--compact :global(h2) {
    margin-bottom: var(--wpea-space--sm);
  }

  .ab-wp-bits-admin--compact :global(h3) {
    margin-bottom: var(--wpea-space--sm);
  }

  .ab-wp-bits-admin--compact :global(.wpea-label) {
    font-size: var(--wpea-text--sm);
  }

  .ab-wp-bits-admin--compact :global(.wpea-input),
  .ab-wp-bits-admin--compact :global(.wpea-select),
  .ab-wp-bits-admin--compact :global(.wpea-textarea) {
    padding: var(--wpea-space--xs) var(--wpea-space--sm);
    font-size: var(--wpea-text--sm);
  }

  .ab-wp-bits-admin--compact :global(.wpea-btn) {
    padding: var(--wpea-space--xs) var(--wpea-space--sm);
    font-size: var(--wpea-text--sm);
  }
</style>
