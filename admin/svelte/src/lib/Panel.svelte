<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    muted?: boolean;
    children?: Snippet;
  };

  let {
    muted = false,
    children
  }: Props = $props();

  let mutedClass = $derived(muted ? 'wpea-panel--muted' : '');
</script>

<div class="wpea-panel {mutedClass}">
  {#if children}
    {@render children()}
  {/if}
</div>
