<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ColorVariant } from './types';

  type Props = {
    variant?: ColorVariant;
    class?: string;
    style?: string;
    children?: Snippet;
  };

  let {
    variant,
    class: className = '',
    style,
    children
  }: Props = $props();

  let variantClass = $derived(variant ? `badge--${variant}` : '');
</script>

<span class="badge {variantClass} {className}" {style}>
  {#if children}
    {@render children()}
  {/if}
</span>
