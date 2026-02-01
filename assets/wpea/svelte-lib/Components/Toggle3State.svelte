<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ToggleOption } from '../types';
  import { isSnippet } from '../utils/renderContent';

  type Props = {
    value?: string;
    options: ToggleOption[];
    ariaLabel?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    iconOnly?: boolean;
    showPopover?: boolean;
    popoverPosition?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right';
    popoverSize?: 'xs' | 's' | 'm';
    class?: string;
    style?: string;
  };

  // Helper to get string label for aria (falls back to value if Snippet)
  function getAriaLabel(option: ToggleOption): string {
    return typeof option.label === 'string' ? option.label : option.value;
  }

  let {
    value = $bindable(''),
    options,
    ariaLabel = 'Toggle selection',
    onChange,
    disabled = false,
    iconOnly = false,
    showPopover = false,
    popoverPosition = 'top',
    popoverSize = 'xs',
    class: className = '',
    style
  }: Props = $props();

  function handleClick(option: ToggleOption) {
    if (disabled) return;
    value = option.value;
    onChange?.(option.value);
  }

  function handleKeydown(e: KeyboardEvent, option: ToggleOption) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(option);
    }
  }

  const containerClass = $derived(
    iconOnly ? 'wpea-toggle-3state wpea-toggle-3state--icon-only' : 'wpea-toggle-3state'
  );

  const positionClass = $derived(`wpea-popover__content--${popoverPosition}`);
  const sizeClass = $derived(`wpea-popover__content--${popoverSize}`);
</script>

<div class="{containerClass} {className}" {style} role="group" aria-label={ariaLabel}>
  {#each options as option}
    {#if showPopover && iconOnly}
      <div class="wpea-popover">
        <button
          type="button"
          class="wpea-toggle-3state__btn"
          aria-pressed={value === option.value}
          aria-label={getAriaLabel(option)}
          disabled={disabled}
          onclick={() => handleClick(option)}
          onkeydown={(e) => handleKeydown(e, option)}
        >
          {#if option.icon}
            {@render option.icon()}
          {/if}
          <span>
            {#if isSnippet(option.label)}
              {@render option.label()}
            {:else}
              {option.label}
            {/if}
          </span>
        </button>
        <div class="wpea-popover__content {positionClass} {sizeClass}">
          {getAriaLabel(option)}
        </div>
      </div>
    {:else}
      <button
        type="button"
        class="wpea-toggle-3state__btn"
        aria-pressed={value === option.value}
        aria-label={iconOnly ? getAriaLabel(option) : undefined}
        disabled={disabled}
        onclick={() => handleClick(option)}
        onkeydown={(e) => handleKeydown(e, option)}
      >
        {#if option.icon}
          {@render option.icon()}
        {/if}
        <span>
          {#if isSnippet(option.label)}
            {@render option.label()}
          {:else}
            {option.label}
          {/if}
        </span>
      </button>
    {/if}
  {/each}
</div>
