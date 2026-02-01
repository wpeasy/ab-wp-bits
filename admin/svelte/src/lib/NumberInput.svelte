<script lang="ts">
  import type { Size, StringOrSnippet } from './types';
  import { isSnippet } from './utils/renderContent';

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
    label?: StringOrSnippet;
    help?: StringOrSnippet;
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

  // Round to avoid floating point precision issues
  function roundToPrecision(num: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  }

  // Get decimal places from step value
  function getDecimalPlaces(num: number): number {
    const str = num.toString();
    const decimal = str.indexOf('.');
    return decimal === -1 ? 0 : str.length - decimal - 1;
  }

  function increment() {
    if (disabled || readonly) return;
    const precision = getDecimalPlaces(step);
    let newValue = roundToPrecision(value + step, precision);
    if (max !== undefined && newValue > max) newValue = max;
    value = newValue;
    oninput?.(value);
    onchange?.(value);
  }

  function decrement() {
    if (disabled || readonly) return;
    const precision = getDecimalPlaces(step);
    let newValue = roundToPrecision(value - step, precision);
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
      <label class="wpea-label" for={id}>
        {#if isSnippet(label)}
          {@render label()}
        {:else}
          {label}
        {/if}
      </label>
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
      <span class="wpea-help">
        {#if isSnippet(help)}
          {@render help()}
        {:else}
          {help}
        {/if}
      </span>
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
