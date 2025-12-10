<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ColorVariant } from './types';

  type Tab = {
    id: string;
    label: string;
    separator?: boolean;
    content?: Snippet;
  };

  type Props = {
    tabs: Tab[];
    variant?: ColorVariant;
    activeTab?: string;
    class?: string;
    style?: string;
    actions?: Snippet;
    content?: Snippet;
    onTabChange?: (tabId: string) => void;
  };

  let {
    tabs = [],
    variant,
    activeTab = $bindable(tabs[0]?.id || ''),
    class: className = '',
    style,
    actions,
    content,
    onTabChange
  }: Props = $props();

  function selectTab(tabId: string) {
    activeTab = tabId;
    onTabChange?.(tabId);
  }

  let variantClass = $derived(variant ? `wpea-vtabs--${variant}` : '');
</script>

<div class="wpea-vtabs {variantClass} {className}" {style}>
  <div class="wpea-vtabs__list" role="tablist">
    {#each tabs as tab}
      <button
        class="wpea-vtabs__tab"
        class:wpea-vtabs__tab--separator={tab.separator}
        role="tab"
        aria-selected={activeTab === tab.id}
        onclick={() => selectTab(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <div class="wpea-vtabs__content">
    {#if actions}
      <div class="wpea-vtabs__header">
        <div class="wpea-vtabs__actions">
          {@render actions()}
        </div>
      </div>
    {/if}
    {#if content}
      {@render content()}
    {:else}
      {#each tabs as tab}
        {#if tab.content}
          <div
            class="wpea-vtabs__panel"
            role="tabpanel"
            aria-hidden={activeTab !== tab.id}
          >
            {@render tab.content()}
          </div>
        {/if}
      {/each}
    {/if}
  </div>
</div>

<style>
  .wpea-vtabs__tab--separator {
    margin-bottom: var(--wpea-space--sm, 0.5rem);
    border-bottom: 1px solid var(--wpea-surface--divider, rgba(128, 128, 128, 0.2));
    padding-bottom: var(--wpea-space--sm, 0.5rem);
  }

  .wpea-vtabs__header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: var(--wpea-space--md, 0.75rem);
  }

  .wpea-vtabs__actions {
    display: flex;
    gap: var(--wpea-space--sm, 0.5rem);
  }
</style>
