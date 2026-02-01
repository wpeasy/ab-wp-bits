<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    muted?: boolean;
    class?: string;
    style?: string;
    children?: Snippet;
  };

  let {
    muted = false,
    class: className = '',
    style,
    children
  }: Props = $props();

  let mutedClass = $derived(muted ? 'wpea-panel--muted' : '');
</script>

<div class="wpea-panel {mutedClass} {className}" {style}>
  {#if children}
    {@render children()}
  {/if}
</div>
