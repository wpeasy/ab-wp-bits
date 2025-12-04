<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    variant?: 'success' | 'warning' | 'danger';
    children?: Snippet;
  };

  let {
    variant = 'success',
    children
  }: Props = $props();

  let variantClass = $derived(`wpea-alert--${variant}`);
</script>

<div class="wpea-alert {variantClass}">
  {#if children}
    {@render children()}
  {/if}
</div>
