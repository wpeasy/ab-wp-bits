<script lang="ts">
  import type { ColorVariant } from './types';
  import type { Snippet } from 'svelte';

  type Tab = {
    id: string;
    label: string;
    content?: Snippet;
    separator?: boolean;
  };

  type Props = {
    tabs: Tab[];
    variant?: ColorVariant;
    activeTab?: string;
    class?: string;
    style?: string;
    onTabChange?: (tabId: string) => void;
    actions?: Snippet;
    content?: Snippet;
  };

  let {
    tabs = [],
    variant,
    activeTab = $bindable(''),
    class: className = '',
    style,
    onTabChange,
    actions,
    content
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

  let variantClass = $derived(variant ? `wpea-vtabs--${variant}` : '');
</script>

<div class="wpea-vtabs {variantClass} {className}" {style}>
  <div class="wpea-vtabs__sidebar">
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
    {#if actions}
      <div class="wpea-vtabs__actions">
        {@render actions()}
      </div>
    {/if}
  </div>

  <div class="wpea-vtabs__content">
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
  .wpea-vtabs__sidebar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100%;
  }

  .wpea-vtabs__actions {
    padding: var(--wpea-space--sm);
    border-top: 1px solid var(--wpea-surface--divider);
  }

  .wpea-vtabs__tab--separator {
    margin-bottom: var(--wpea-space--sm);
    padding-bottom: var(--wpea-space--sm);
    border-bottom: 1px solid var(--wpea-surface--divider);
  }
</style>
