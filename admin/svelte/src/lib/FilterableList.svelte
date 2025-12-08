<script lang="ts" generics="T extends { value: string | number; label: string }">
  import type { Snippet } from 'svelte';

  type Props = {
    items?: T[];
    placeholder?: string;
    emptyMessage?: string;
    children?: Snippet<[T]>;
  };

  let {
    items = [],
    placeholder = 'Search...',
    emptyMessage = 'No items found',
    children
  }: Props = $props();

  let searchTerm = $state('');

  // Filter items based on search term (matches any part of the label or value)
  let filteredItems = $derived(
    items.filter(item =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
</script>

<div class="wpea-filterable-list">
  <div class="wpea-filterable-list__search">
    <input
      type="text"
      class="wpea-input"
      bind:value={searchTerm}
      {placeholder}
    />
  </div>

  <div class="wpea-filterable-list__items">
    {#if filteredItems.length === 0}
      <div class="wpea-filterable-list__empty">
        {emptyMessage}
      </div>
    {:else}
      {#each filteredItems as item (item.value)}
        <div class="wpea-filterable-list__item">
          {#if children}
            {@render children(item)}
          {:else}
            {item.label}
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .wpea-filterable-list {
    display: flex;
    flex-direction: column;
    gap: var(--wpea-space--sm);
    border: 1px solid var(--wpea-surface--border);
    border-radius: var(--wpea-radius--md);
    background: var(--wpea-surface--bg);
  }

  .wpea-filterable-list__search {
    padding: var(--wpea-space--sm);
    border-bottom: 1px solid var(--wpea-surface--border);
  }

  .wpea-filterable-list__items {
    max-height: 300px;
    overflow-y: auto;
  }

  .wpea-filterable-list__item {
    padding: var(--wpea-space--sm) var(--wpea-space--md);
    border-bottom: 1px solid var(--wpea-surface--divider);
  }

  .wpea-filterable-list__item:last-child {
    border-bottom: none;
  }

  .wpea-filterable-list__item:hover {
    background: var(--wpea-surface--panel);
  }

  .wpea-filterable-list__empty {
    padding: var(--wpea-space--md);
    text-align: center;
    color: var(--wpea-color--text-muted);
  }
</style>
