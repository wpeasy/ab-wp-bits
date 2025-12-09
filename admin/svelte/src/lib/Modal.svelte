<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';
  import { modalSlideUp } from './transitions';

  type Props = {
    open?: boolean;
    size?: 'standard' | 'large' | 'fullscreen';
    title?: string;
    onClose?: () => void;
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet;
  };

  let {
    open = $bindable(false),
    size = 'standard',
    title = '',
    onClose,
    header,
    children,
    footer
  }: Props = $props();

  const sizeClass = $derived(
    size === 'large' ? 'wpea-modal--large' :
    size === 'fullscreen' ? 'wpea-modal--fullscreen' :
    ''
  );

  // Read settings from localStorage (same key as globalState.svelte.ts)
  function getSettings() {
    try {
      const stored = localStorage.getItem('ab-wp-bits-settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Ignore errors
    }
    return { compactMode: false, themeMode: 'auto' };
  }

  // Get settings when modal opens
  let settings = $state(getSettings());

  // Refresh settings when modal opens
  $effect(() => {
    if (open) {
      settings = getSettings();
    }
  });

  // Compute color-scheme value based on theme mode
  let colorScheme = $derived(
    settings.themeMode === 'light' ? 'light only' :
    settings.themeMode === 'dark' ? 'dark only' :
    'light dark'
  );

  function handleClose() {
    open = false;
    onClose?.();
  }

  function handleBackdropClick() {
    handleClose();
  }

  function handleBackdropKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }

  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeydown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

{#if open}
  <div
    class="wpea wpea-full wpea-modal wpea-modal--open {sizeClass}"
    class:ab-wp-bits-admin--compact={settings.compactMode}
    style="font-family: var(--wpea-font-sans); color-scheme: {colorScheme}; position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5);"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="wpea-modal__backdrop"
      role="button"
      tabindex="0"
      onclick={handleBackdropClick}
      onkeydown={handleBackdropKeydown}
      aria-label="Close modal"
    ></div>
    <div
      class="wpea-modal__container"
      transition:modalSlideUp={{ duration: 300 }}
    >
      <div class="wpea-modal__header">
        {#if header}
          {@render header()}
        {:else}
          <h3 class="wpea-modal__title">{title}</h3>
        {/if}
        <button class="wpea-modal__close" onclick={handleClose} aria-label="Close">&times;</button>
      </div>

      <div class="wpea-modal__body">
        {#if children}
          {@render children()}
        {/if}
      </div>

      {#if footer}
        <div class="wpea-modal__footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Compact mode - reduce spacing and typography */
  :global(.ab-wp-bits-admin--compact) {
    --wpea-space--xs: 0.2rem;
    --wpea-space--sm: 0.35rem;
    --wpea-space--md: 0.6rem;
    --wpea-space--lg: 0.9rem;
    --wpea-space--xl: 1.2rem;
    --wpea-text--xs: 0.7rem;
    --wpea-text--sm: 0.775rem;
    --wpea-text--md: 0.85rem;
    --wpea-text--lg: 0.95rem;
    --wpea-text--xl: 1.1rem;
    font-size: var(--wpea-text--md);
    line-height: 1.4;
  }
</style>
