<script lang="ts">
  import type { ColorVariant } from './types';

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
  };

  let {
    tabs = [],
    variant,
    activeTab = $bindable(tabs[0]?.id || ''),
    class: className = '',
    style,
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
        role="tab"
        aria-selected={activeTab === tab.id}
        onclick={() => selectTab(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <div class="wpea-vtabs__content">
    {#each tabs as tab}
      <div
        class="wpea-vtabs__panel"
        role="tabpanel"
        aria-hidden={activeTab !== tab.id}
      >
        {@render tab.content()}
      </div>
    {/each}
  </div>
</div>
