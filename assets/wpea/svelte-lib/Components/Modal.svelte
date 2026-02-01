<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';
  import { modalSlideUp } from '../transitions';
  import type { StringOrSnippet } from '../types';
  import { isSnippet } from '../utils/renderContent';

  type Props = {
    open?: boolean;
    size?: 'standard' | 'large' | 'fullscreen';
    title?: StringOrSnippet;
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
    style="font-family: var(--wpea-font-sans);"
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
          <h3 class="wpea-modal__title">
            {#if isSnippet(title)}
              {@render title()}
            {:else}
              {title}
            {/if}
          </h3>
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
