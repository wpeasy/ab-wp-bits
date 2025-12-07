<script lang="ts">
  import Tabs from './lib/Tabs.svelte';
  import MenuQueriesSettings from './modules/MenuQueriesSettings.svelte';
  import MenuQueriesInstructions from './modules/MenuQueriesInstructions.svelte';

  interface Props {
    moduleId: string;
    activeSubTab: 'settings' | 'instructions';
  }

  let { moduleId, activeSubTab = $bindable('settings') }: Props = $props();

  const subTabs = [
    { id: 'settings', label: 'Settings' },
    { id: 'instructions', label: 'Instructions' }
  ];
</script>

<div class="module-settings">
  <Tabs tabs={subTabs} bind:activeTab={activeSubTab} variant="secondary" />

  <div class="module-settings__content">
    {#if moduleId === 'menu-queries'}
      {#if activeSubTab === 'settings'}
        <MenuQueriesSettings />
      {:else}
        <MenuQueriesInstructions />
      {/if}
    {/if}
  </div>
</div>

<style>
  .module-settings__content {
    margin-top: var(--wpea-space--lg);
  }
</style>
