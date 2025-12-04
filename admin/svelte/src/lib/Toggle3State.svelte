<script lang="ts">
  import type { Snippet } from 'svelte';

  type ToggleOption = {
    value: string;
    label: string;
    icon?: Snippet;
  };

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
  };

  let {
    value = $bindable(''),
    options,
    ariaLabel = 'Toggle selection',
    onChange,
    disabled = false,
    iconOnly = false,
    showPopover = false,
    popoverPosition = 'top',
    popoverSize = 'xs'
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

<div class={containerClass} role="group" aria-label={ariaLabel}>
  {#each options as option}
    {#if showPopover && iconOnly}
      <div class="wpea-popover">
        <button
          type="button"
          class="wpea-toggle-3state__btn"
          aria-pressed={value === option.value}
          aria-label={option.label}
          disabled={disabled}
          onclick={() => handleClick(option)}
          onkeydown={(e) => handleKeydown(e, option)}
        >
          {#if option.icon}
            {@render option.icon()}
          {/if}
          <span>{option.label}</span>
        </button>
        <div class="wpea-popover__content {positionClass} {sizeClass}">
          {option.label}
        </div>
      </div>
    {:else}
      <button
        type="button"
        class="wpea-toggle-3state__btn"
        aria-pressed={value === option.value}
        aria-label={iconOnly ? option.label : undefined}
        disabled={disabled}
        onclick={() => handleClick(option)}
        onkeydown={(e) => handleKeydown(e, option)}
      >
        {#if option.icon}
          {@render option.icon()}
        {/if}
        <span>{option.label}</span>
      </button>
    {/if}
  {/each}
</div>
