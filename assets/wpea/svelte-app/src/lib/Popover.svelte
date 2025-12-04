<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    content: string;
    position?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right';
    size?: 'xs' | 's' | 'm';
    visible?: boolean;
    children?: Snippet;
  };

  let {
    content,
    position = 'top',
    size = 'm',
    visible = false,
    children
  }: Props = $props();

  const positionClass = $derived(`wpea-popover__content--${position}`);
  const sizeClass = $derived(`wpea-popover__content--${size}`);
  const visibleClass = $derived(visible ? 'wpea-popover__content--visible' : '');

  const contentClass = $derived(
    `wpea-popover__content ${positionClass} ${sizeClass} ${visibleClass}`.trim()
  );
</script>

<div class="wpea-popover">
  {#if children}
    {@render children()}
  {/if}
  <div class={contentClass}>
    {content}
  </div>
</div>
