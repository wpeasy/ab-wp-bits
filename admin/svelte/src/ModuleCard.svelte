<script lang="ts">
  import type { Module } from './types';
  import Switch from './lib/Switch.svelte';
  import Button from './lib/Button.svelte';
  import Cluster from './lib/Cluster.svelte';

  interface Props {
    module: Module;
    onToggle: (id: string, enabled: boolean) => void;
    onNavigate: (moduleId: string, tab: 'settings' | 'instructions') => void;
  }

  let { module, onToggle, onNavigate }: Props = $props();

  function handleToggle(enabled: boolean) {
    onToggle(module.id, enabled);
  }

  function navigateToSettings() {
    onNavigate(module.id, 'settings');
  }

  function navigateToInstructions() {
    onNavigate(module.id, 'instructions');
  }
</script>

<div class="wpea-module-card">
  <div class="wpea-module-switch">
    <Switch
      id="module-{module.id}"
      bind:checked={module.enabled}
      onchange={handleToggle}
    />
  </div>
  <div class="wpea-module-info">
    {#if module.logo}
      <div class="wpea-module-logo">
        {@html module.logo}
      </div>
    {/if}
    <div class="wpea-module-details">
      <h3 class="wpea-heading wpea-heading--sm">{module.name}</h3>
      <p class="wpea-text-muted wpea-text-sm">{module.description}</p>
    </div>
  </div>
  {#if module.has_settings && module.enabled}
    <Cluster>
      <Button variant="secondary" size="s" onclick={navigateToSettings}>
        Settings
      </Button>
      <Button variant="secondary" size="s" onclick={navigateToInstructions}>
        Instructions
      </Button>
    </Cluster>
  {/if}
</div>

<style>
  .wpea-module-card {
    display: flex;
    align-items: center;
    gap: var(--wpea-space--md);
    padding: var(--wpea-space--md);
    background: var(--wpea-surface--panel);
    border: 1px solid var(--wpea-color--border);
    border-radius: var(--wpea-radius--md);
  }

  .wpea-module-switch {
    flex-shrink: 0;
  }

  .wpea-module-info {
    display: flex;
    align-items: center;
    gap: var(--wpea-space--md);
    flex: 1;
  }

  .wpea-module-logo {
    width: 48px;
    height: 48px;
    border-radius: var(--wpea-radius--sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .wpea-module-logo :global(svg) {
    width: 32px;
    height: 32px;
    color: var(--wpea-color--secondary);
  }

  .wpea-module-details {
    flex: 1;
  }

  .wpea-module-details h3 {
    margin: 0 0 var(--wpea-space--xs) 0;
  }

  .wpea-module-details p {
    margin: 0;
  }
</style>
