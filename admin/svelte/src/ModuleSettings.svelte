<script lang="ts">
  import { type Component } from 'svelte';
  import Tabs from './lib/Tabs.svelte';

  interface Props {
    moduleId: string;
    activeSubTab: 'settings' | 'instructions';
  }

  let { moduleId, activeSubTab = $bindable('settings') }: Props = $props();

  const subTabs = [
    { id: 'settings', label: 'Settings' },
    { id: 'instructions', label: 'Instructions' }
  ];

  // Track which component is currently loaded
  let currentComponent = $state<Component | null>(null);
  let isLoading = $state(false);
  let hasError = $state(false);

  // Load component dynamically based on moduleId and activeSubTab
  async function loadComponent() {
    isLoading = true;
    hasError = false;
    currentComponent = null;

    try {
      // Determine which component to load
      const componentKey = `${moduleId}-${activeSubTab}`;

      switch (componentKey) {
        case 'menu-queries-settings':
          const mqSettings = await import('./modules/MenuQueriesSettings.svelte');
          currentComponent = mqSettings.default;
          break;

        case 'menu-queries-instructions':
          const mqInstructions = await import('./modules/MenuQueriesInstructions.svelte');
          currentComponent = mqInstructions.default;
          break;

        case 'menu-conditions-settings':
          // Menu Conditions has no settings component, set to null
          currentComponent = null;
          break;

        case 'menu-conditions-instructions':
          const mcInstructions = await import('./modules/MenuConditionsInstructions.svelte');
          currentComponent = mcInstructions.default;
          break;

        default:
          // Unknown module or tab
          currentComponent = null;
      }
    } catch (error) {
      console.error('Failed to load component:', error);
      hasError = true;
    } finally {
      isLoading = false;
    }
  }

  // Reload component when moduleId or activeSubTab changes
  $effect(() => {
    loadComponent();
  });
</script>

<div class="module-settings">
  <Tabs tabs={subTabs} bind:activeTab={activeSubTab} variant="secondary" />

  <div class="module-settings__content">
    {#if isLoading}
      <p class="wpea-text-muted">Loading...</p>
    {:else if hasError}
      <p class="wpea-text-danger">Failed to load content. Please try again.</p>
    {:else if currentComponent}
      {@const Component = currentComponent}
      <Component />
    {:else if moduleId === 'menu-conditions' && activeSubTab === 'settings'}
      <p class="wpea-text-muted">This module has no configurable settings.</p>
    {:else}
      <p class="wpea-text-muted">No content available.</p>
    {/if}
  </div>
</div>

<style>
  .module-settings__content {
    margin-top: var(--wpea-space--lg);
  }
</style>
