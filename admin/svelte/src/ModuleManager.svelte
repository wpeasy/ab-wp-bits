<script lang="ts">
  import type { Module } from './types';
  import type { ToastItem } from './lib/Toast.svelte';
  import { toggleModule } from './api';
  import ModuleCard from './ModuleCard.svelte';
  import Stack from './lib/Stack.svelte';
  import Card from './lib/Card.svelte';
  import Toast from './lib/Toast.svelte';

  let { modules = $bindable([]) }: { modules: Module[] } = $props();
  let toasts = $state<ToastItem[]>([]);

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

  <Stack>
    {#if modules.length === 0}
      <p class="wpea-text-muted">No modules registered yet.</p>
    {:else}
      {#each modules as module (module.id)}
        <ModuleCard {module} onToggle={handleToggle} />
      {/each}
    {/if}
  </Stack>
</Card>

<Toast bind:toasts position="top-right" />
