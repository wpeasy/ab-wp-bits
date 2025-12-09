<script lang="ts">
  import type { Size } from './types';

  type Props = {
    value?: number;
    id?: string;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    size?: Size;
    label?: string;
    help?: string;
    class?: string;
    style?: string;
    oninput?: (value: number) => void;
    onchange?: (value: number) => void;
  };

  let {
    value = $bindable(0),
    id,
    name,
    placeholder,
    disabled = false,
    readonly = false,
    required = false,
    min,
    max,
    step = 1,
    size,
    label,
    help,
    class: className = '',
    style,
    oninput,
    onchange
  }: Props = $props();

  let inputRef = $state<HTMLInputElement | null>(null);

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = parseFloat(target.value) || 0;
    oninput?.(value);
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    value = parseFloat(target.value) || 0;
    onchange?.(value);
  }

  function increment() {
    if (disabled || readonly) return;
    let newValue = value + step;
    if (max !== undefined && newValue > max) newValue = max;
    value = newValue;
    oninput?.(value);
    onchange?.(value);
  }

  function decrement() {
    if (disabled || readonly) return;
    let newValue = value - step;
    if (min !== undefined && newValue < min) newValue = min;
    value = newValue;
    oninput?.(value);
    onchange?.(value);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      increment();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      decrement();
    }
  }

  let sizeClass = $derived(size ? `wpea-input--${size}` : '');
</script>

{#if label || help}
  <div class="wpea-field">
    {#if label}
      <label class="wpea-label" for={id}>{label}</label>
    {/if}
    <div class="wpea-number-wrapper">
      <input
        bind:this={inputRef}
        class="wpea-input {sizeClass} {className}"
        {style}
        type="number"
        {id}
        {name}
        {placeholder}
        {disabled}
        {readonly}
        {required}
        {min}
        {max}
        {step}
        value={value}
        oninput={handleInput}
        onchange={handleChange}
        onkeydown={handleKeydown}
      />
      <div class="wpea-number-wrapper__controls">
        <button
          type="button"
          class="wpea-number-wrapper__btn"
          onclick={increment}
          disabled={disabled || readonly || (max !== undefined && value >= max)}
          aria-label="Increase value"
          tabindex="-1"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M2 8L6 4L10 8" />
          </svg>
        </button>
        <button
          type="button"
          class="wpea-number-wrapper__btn"
          onclick={decrement}
          disabled={disabled || readonly || (min !== undefined && value <= min)}
          aria-label="Decrease value"
          tabindex="-1"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M2 4L6 8L10 4" />
          </svg>
        </button>
      </div>
    </div>
    {#if help}
      <span class="wpea-help">{help}</span>
    {/if}
  </div>
{:else}
  <div class="wpea-number-wrapper">
    <input
      bind:this={inputRef}
      class="wpea-input {sizeClass} {className}"
      {style}
      type="number"
      {id}
      {name}
      {placeholder}
      {disabled}
      {readonly}
      {required}
      {min}
      {max}
      {step}
      value={value}
      oninput={handleInput}
      onchange={handleChange}
      onkeydown={handleKeydown}
    />
    <div class="wpea-number-wrapper__controls">
      <button
        type="button"
        class="wpea-number-wrapper__btn"
        onclick={increment}
        disabled={disabled || readonly || (max !== undefined && value >= max)}
        aria-label="Increase value"
        tabindex="-1"
      >
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M2 8L6 4L10 8" />
        </svg>
      </button>
      <button
        type="button"
        class="wpea-number-wrapper__btn"
        onclick={decrement}
        disabled={disabled || readonly || (min !== undefined && value <= min)}
        aria-label="Decrease value"
        tabindex="-1"
      >
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M2 4L6 8L10 4" />
        </svg>
      </button>
    </div>
  </div>
{/if}
