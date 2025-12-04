<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ColorVariant } from './types';

  type Props = {
    variant?: ColorVariant;
    children?: Snippet;
  };

  let {
    variant,
    children
  }: Props = $props();

  let variantClass = $derived(variant ? `badge--${variant}` : '');
</script>

<span class="badge {variantClass}">
  {#if children}
    {@render children()}
  {/if}
</span>
