<script lang="ts">
  import type { ColorVariant } from './types';
  import type { Snippet } from 'svelte';

  type Tab = {
    id: string;
    label: string;
    content: any;
  };

  type Props = {
    tabs: Tab[];
    variant?: ColorVariant;
    activeTab?: string;
    class?: string;
    style?: string;
    onTabChange?: (tabId: string) => void;
    actions?: Snippet;
  };

  let {
    tabs = [],
    variant,
    activeTab = $bindable(''),
    class: className = '',
    style,
    onTabChange,
    actions
  }: Props = $props();

  // If no activeTab is set, default to first tab
  $effect(() => {
    if (!activeTab && tabs.length > 0) {
      activeTab = tabs[0].id;
    }
  });

  function selectTab(tabId: string) {
    activeTab = tabId;
    onTabChange?.(tabId);
  }

  let variantClass = $derived(variant ? `wpea-tabs--${variant}` : '');
</script>

<div class="wpea-tabs {variantClass} {className}" {style}>
  <div class="wpea-tabs__header">
    <div class="wpea-tabs__list" role="tablist">
      {#each tabs as tab}
        <button
          class="wpea-tabs__tab"
          role="tab"
          aria-selected={activeTab === tab.id}
          onclick={() => selectTab(tab.id)}
        >
          {tab.label}
        </button>
      {/each}
    </div>
    {#if actions}
      <div class="wpea-tabs__actions">
        {@render actions()}
      </div>
    {/if}
  </div>

  {#each tabs as tab}
    <div
      class="wpea-tabs__panel"
      role="tabpanel"
      aria-hidden={activeTab !== tab.id}
    >
      {@render tab.content()}
    </div>
  {/each}
</div>

<style>
  .wpea-tabs__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--wpea-surface--border);
  }

  .wpea-tabs__actions {
    display: flex;
    align-items: center;
    gap: var(--wpea-space--sm);
    padding-right: var(--wpea-space--sm);
  }
</style>
