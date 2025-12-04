<script lang="ts">
  import type { ColorVariant } from './types';

  type AccordionItem = {
    id: string;
    title: string;
    content: any;
  };

  type Props = {
    items: AccordionItem[];
    variant?: ColorVariant;
    openItems?: string[];
    multiple?: boolean;
    onToggle?: (itemId: string, isOpen: boolean) => void;
  };

  let {
    items = [],
    variant,
    openItems = $bindable([]),
    multiple = false,
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

<div class="wpea-accordion {variantClass}">
  {#each items as item}
    {@const isOpen = openItems.includes(item.id)}
    <div class="wpea-accordion__item">
      <button
        class="wpea-accordion__header"
        aria-expanded={isOpen}
        onclick={() => toggleItem(item.id)}
      >
        <span>{item.title}</span>
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
