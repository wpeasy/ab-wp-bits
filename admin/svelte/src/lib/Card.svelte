<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    muted?: boolean;
    hover?: boolean;
    title?: string;
    subtitle?: string;
    class?: string;
    style?: string;
    header?: Snippet;
    actions?: Snippet;
    children?: Snippet;
  };

  let {
    muted = false,
    hover = false,
    title,
    subtitle,
    class: className = '',
    style,
    header,
    actions,
    children
  }: Props = $props();

  let mutedClass = $derived(muted ? 'wpea-card--muted' : '');
  let hoverClass = $derived(hover ? 'wpea-card--hover' : '');
  let hasHeader = $derived(title || subtitle || header || actions);
</script>

<div class="wpea-card {mutedClass} {hoverClass} {className}" {style}>
  {#if hasHeader}
    <div class="wpea-card__header">
      <div>
        {#if header}
          {@render header()}
        {:else}
          {#if title}
            <div class="wpea-card__title">{title}</div>
          {/if}
          {#if subtitle}
            <div class="wpea-card__sub">{subtitle}</div>
          {/if}
        {/if}
      </div>
      {#if actions}
        <div class="wpea-card__actions">
          {@render actions()}
        </div>
      {/if}
    </div>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  /* Ensure card border is visible in dark mode */
  :global(.wpea-card) {
    border: 1px solid var(--wpea-surface--border, rgba(255, 255, 255, 0.16));
  }
</style>
