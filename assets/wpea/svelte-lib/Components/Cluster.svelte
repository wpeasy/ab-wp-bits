<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    size?: 'md' | 'lg';
    class?: string;
    style?: string;
    children?: Snippet;
  };

  let {
    size,
    class: className = '',
    style,
    children
  }: Props = $props();

  let sizeClass = $derived(size ? `wpea-cluster--${size}` : '');
</script>

<div class="wpea-cluster {sizeClass} {className}" {style}>
  {#if children}
    {@render children()}
  {/if}
</div>
