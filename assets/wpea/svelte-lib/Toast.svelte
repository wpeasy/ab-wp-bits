<script lang="ts">
  import type { ColorVariant } from './types';

  type ToastPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'center';

  export type ToastItem = {
    id: string;
    title?: string;
    message: string;
    variant?: ColorVariant;
    duration?: number;
  };

  type Props = {
    toasts?: ToastItem[];
    position?: ToastPosition;
    class?: string;
    style?: string;
    onClose?: (id: string) => void;
  };

  let {
    toasts = $bindable([]),
    position = 'top-right',
    class: className = '',
    style,
    onClose
  }: Props = $props();

  let closingToasts = $state<Set<string>>(new Set());

  function closeToast(id: string) {
    closingToasts.add(id);
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      closingToasts.delete(id);
      onClose?.(id);
    }, 300);
  }

  $effect(() => {
    toasts.forEach(toast => {
      if (toast.duration) {
        const timeout = setTimeout(() => {
          closeToast(toast.id);
        }, toast.duration);

        return () => clearTimeout(timeout);
      }
    });
  });

  let positionClass = $derived(`wpea-toast-container--${position}`);
</script>

<div class="wpea-toast-container {positionClass} {className}" {style}>
  {#each toasts as toast (toast.id)}
    {@const isClosing = closingToasts.has(toast.id)}
    {@const variantClass = toast.variant ? `wpea-toast--${toast.variant}` : ''}
    <div class="wpea-toast {variantClass}" class:wpea-toast--closing={isClosing}>
      <div class="wpea-toast__content">
        {#if toast.title}
          <div class="wpea-toast__title">{toast.title}</div>
        {/if}
        <div class="wpea-toast__message">{toast.message}</div>
      </div>
      <button
        class="wpea-toast__close"
        onclick={() => closeToast(toast.id)}
      >
        ×
      </button>
    </div>
  {/each}
</div>
