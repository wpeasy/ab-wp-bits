<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    size?: 'sm' | 'md' | 'lg';
    children?: Snippet;
  };

  let {
    size,
    children
  }: Props = $props();

  let sizeClass = $derived(size ? `wpea-stack--${size}` : '');
</script>

<div class="wpea-stack {sizeClass}">
  {#if children}
    {@render children()}
  {/if}
</div>
