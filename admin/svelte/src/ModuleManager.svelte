<script lang="ts">
  import type { Module } from './types';
  import type { ToastItem } from './lib/Toast.svelte';
  import { toggleModule } from './api';
  import ModuleCard from './ModuleCard.svelte';
  import Stack from './lib/Stack.svelte';
  import Card from './lib/Card.svelte';
  import Toast from './lib/Toast.svelte';
  import Tabs from './lib/Tabs.svelte';

  interface Props {
    modules: Module[];
    onNavigate: (moduleId: string, tab: 'settings' | 'instructions') => void;
  }

  let { modules = $bindable([]), onNavigate }: Props = $props();
  let toasts = $state<ToastItem[]>([]);
  let activeCategory = $state('all');

  // Extract unique categories from modules
  let categories = $derived(['all', ...new Set(modules.map(m => m.category))]);

  // Build category tabs
  let categoryTabs = $derived(
    categories.map(cat => ({
      id: cat,
      label: cat === 'all' ? 'All' : cat
    }))
  );

  // Filter modules by category and sort alphabetically
  let filteredModules = $derived(
    (activeCategory === 'all'
      ? modules
      : modules.filter(m => m.category === activeCategory)
    ).toSorted((a, b) => a.name.localeCompare(b.name))
  );

  function addToast(message: string, variant: 'success' | 'danger' | 'warning' = 'success') {
    const id = `toast-${Date.now()}`;
    toasts = [...toasts, {
      id,
      message,
      variant,
      duration: 3000
    }];
  }

  async function handleToggle(id: string, enabled: boolean) {
    try {
      await toggleModule(id, enabled);

      // Update local state
      const moduleIndex = modules.findIndex(m => m.id === id);
      if (moduleIndex !== -1) {
        modules[moduleIndex].enabled = enabled;
      }

      addToast('Settings saved', 'success');
    } catch (error) {
      addToast('Error saving settings', 'danger');
    }
  }
</script>

<Card>
  {#snippet header()}
    <div class="wpea-card__title">Module Manager</div>
  {/snippet}

  <div class="module-manager">
    <Tabs tabs={categoryTabs} bind:activeTab={activeCategory} variant="secondary" />

    <Stack>
      {#if filteredModules.length === 0}
        <p class="wpea-text-muted">No modules in this category.</p>
      {:else}
        {#each filteredModules as module (module.id)}
          <ModuleCard {module} onToggle={handleToggle} {onNavigate} />
        {/each}
      {/if}
    </Stack>
  </div>
</Card>

<Toast bind:toasts position="top-right" />

<style>
  .module-manager {
    display: flex;
    flex-direction: column;
    gap: var(--wpea-space--lg);
  }
</style>
