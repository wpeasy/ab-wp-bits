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
    activeTab = $bindable(''),
    class: className = '',
    style,
    onTabChange
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
