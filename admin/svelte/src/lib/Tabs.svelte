<script lang="ts">
  import type { ColorVariant } from './types';
  import type { Snippet } from 'svelte';

  type Tab = {
    id: string;
    label: string;
    content?: any;
    separator?: boolean;
  };

  type Props = {
    tabs: Tab[];
    variant?: ColorVariant;
    orientation?: 'horizontal' | 'vertical';
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    content?: Snippet;
  };

  let {
    tabs = [],
    variant,
    orientation = 'horizontal',
    activeTab = $bindable(tabs[0]?.id || ''),
    onTabChange,
    content
  }: Props = $props();

  function selectTab(tabId: string) {
    activeTab = tabId;
    onTabChange?.(tabId);
  }

  let variantClass = $derived(variant ? `wpea-tabs--${variant}` : '');
  let orientationClass = $derived(orientation === 'vertical' ? 'wpea-tabs--vertical' : '');
</script>

<div class="wpea-tabs {variantClass} {orientationClass}">
  <div class="wpea-tabs__list" role="tablist">
    {#each tabs as tab}
      <button
        class="wpea-tabs__tab"
        class:wpea-tabs__tab--separator={tab.separator}
        role="tab"
        aria-selected={activeTab === tab.id}
        onclick={() => selectTab(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  {#if orientation === 'vertical'}
    <div class="wpea-tabs__content-wrapper">
      {#if content}
        {@render content()}
      {:else if tabs[0]?.content}
        {#each tabs as tab}
          <div
            class="wpea-tabs__panel"
            role="tabpanel"
            aria-hidden={activeTab !== tab.id}
          >
            {@render tab.content()}
          </div>
        {/each}
      {/if}
    </div>
  {:else if content}
    {@render content()}
  {:else if tabs[0]?.content}
    {#each tabs as tab}
      <div
        class="wpea-tabs__panel"
        role="tabpanel"
        aria-hidden={activeTab !== tab.id}
      >
        {@render tab.content()}
      </div>
    {/each}
  {/if}
</div>

<style>
  .wpea-tabs--vertical {
    display: flex;
    flex-direction: row !important;
    gap: var(--wpea-space--lg);
    align-items: flex-start;
  }

  .wpea-tabs--vertical > .wpea-tabs__list {
    display: flex;
    flex-direction: column;
    border-bottom: none;
    min-width: 200px;
    flex-shrink: 0;
    gap: 0;
  }

  .wpea-tabs--vertical > .wpea-tabs__list > .wpea-tabs__tab {
    display: flex;
    text-align: left;
    justify-content: flex-start;
    border-bottom: none !important;
    border-left: 3px solid transparent;
    padding: var(--wpea-space--sm) var(--wpea-space--md);
    margin-bottom: 0;
  }

  .wpea-tabs--vertical > .wpea-tabs__list > .wpea-tabs__tab[aria-selected="true"] {
    border-bottom: none !important;
    border-left-color: var(--wpea-color--primary);
    background-color: var(--wpea-color--surface-raised);
    color: var(--wpea-color--primary) !important;
  }

  .wpea-tabs__content-wrapper {
    flex: 1;
    min-width: 0;
  }

  .wpea-tabs--vertical .wpea-tabs__panel {
    width: 100%;
  }

  /* Separator after Module Manager tab */
  .wpea-tabs--vertical > .wpea-tabs__list > .wpea-tabs__tab--separator {
    border-bottom: 1px solid var(--wpea-color--border);
    padding-bottom: var(--wpea-space--md);
    margin-bottom: var(--wpea-space--sm);
  }
</style>
