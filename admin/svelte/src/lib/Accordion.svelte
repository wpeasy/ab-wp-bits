<script lang="ts">
  import type { ColorVariant, AccordionItem } from './types';
  import { isSnippet } from './utils/renderContent';

  type Props = {
    items: AccordionItem[];
    variant?: ColorVariant;
    openItems?: string[];
    multiple?: boolean;
    class?: string;
    style?: string;
    onToggle?: (itemId: string, isOpen: boolean) => void;
  };

  let {
    items = [],
    variant,
    openItems = $bindable([]),
    multiple = false,
    class: className = '',
    style,
    onToggle
  }: Props = $props();

  function toggleItem(itemId: string) {
    const isOpen = openItems.includes(itemId);

    if (isOpen) {
      openItems = openItems.filter(id => id !== itemId);
    } else {
      if (multiple) {
        openItems = [...openItems, itemId];
      } else {
        openItems = [itemId];
      }
    }

    onToggle?.(itemId, !isOpen);
  }

  let variantClass = $derived(variant ? `wpea-accordion--${variant}` : '');
</script>

<div class="wpea-accordion {variantClass} {className}" {style}>
  {#each items as item}
    {@const isOpen = openItems.includes(item.id)}
    <div class="wpea-accordion__item">
      <button
        class="wpea-accordion__header"
        aria-expanded={isOpen}
        onclick={() => toggleItem(item.id)}
      >
        <span>
          {#if isSnippet(item.title)}
            {@render item.title()}
          {:else}
            {item.title}
          {/if}
        </span>
        <span class="wpea-accordion__icon">▼</span>
      </button>
      <div
        class="wpea-accordion__content"
        aria-hidden={!isOpen}
      >
        <div class="wpea-accordion__body">
          {@render item.content()}
        </div>
      </div>
    </div>
  {/each}
</div>
