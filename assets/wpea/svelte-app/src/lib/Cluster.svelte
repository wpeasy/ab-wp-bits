<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    size?: 'md' | 'lg';
    children?: Snippet;
  };

  let {
    size,
    children
  }: Props = $props();

  let sizeClass = $derived(size ? `wpea-cluster--${size}` : '');
</script>

<div class="wpea-cluster {sizeClass}">
  {#if children}
    {@render children()}
  {/if}
</div>
