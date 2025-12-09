<script lang="ts">
  import type { ColorVariant } from './types';

  type Props = {
    value?: number;
    valueMin?: number;
    valueMax?: number;
    id?: string;
    name?: string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    color?: ColorVariant;
    label?: string;
    help?: string;
    showValue?: boolean;
    range?: boolean;
    class?: string;
    style?: string;
    oninput?: (value: number | [number, number]) => void;
    onchange?: (value: number | [number, number]) => void;
  };

  let {
    value = $bindable(50),
    valueMin = $bindable(25),
    valueMax = $bindable(75),
    id,
    name,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    color,
    label,
    help,
    showValue = true,
    range = false,
    class: className = '',
    style,
    oninput,
    onchange
  }: Props = $props();

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = parseFloat(target.value);
    oninput?.(value);
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    value = parseFloat(target.value);
    onchange?.(value);
  }

  function handleMinInput(event: Event) {
    const target = event.target as HTMLInputElement;
    let newVal = parseFloat(target.value);
    // Ensure min doesn't exceed max - clamp at one step before max
    const maxAllowed = valueMax - step;
    if (newVal > maxAllowed) {
      newVal = maxAllowed;
      target.value = String(newVal);
    }
    valueMin = newVal;
    oninput?.([valueMin, valueMax]);
  }

  function handleMaxInput(event: Event) {
    const target = event.target as HTMLInputElement;
    let newVal = parseFloat(target.value);
    // Ensure max doesn't go below min - clamp at one step after min
    const minAllowed = valueMin + step;
    if (newVal < minAllowed) {
      newVal = minAllowed;
      target.value = String(newVal);
    }
    valueMax = newVal;
    oninput?.([valueMin, valueMax]);
  }

  function handleMinChange(event: Event) {
    const target = event.target as HTMLInputElement;
    let newVal = parseFloat(target.value);
    const maxAllowed = valueMax - step;
    if (newVal > maxAllowed) {
      newVal = maxAllowed;
      target.value = String(newVal);
    }
    valueMin = newVal;
    onchange?.([valueMin, valueMax]);
  }

  function handleMaxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    let newVal = parseFloat(target.value);
    const minAllowed = valueMin + step;
    if (newVal < minAllowed) {
      newVal = minAllowed;
      target.value = String(newVal);
    }
    valueMax = newVal;
    onchange?.([valueMin, valueMax]);
  }

  let colorClass = $derived(color ? `wpea-range--${color}` : '');
  let progress = $derived(((value - min) / (max - min)) * 100);

  // For dual range
  let progressMin = $derived(((valueMin - min) / (max - min)) * 100);
  let progressMax = $derived(((valueMax - min) / (max - min)) * 100);
</script>

<div class="wpea-field {className}" {style}>
  {#if label || showValue}
    <div class="wpea-range__header">
      {#if label}
        <label class="wpea-label" for={id}>{label}</label>
      {/if}
      {#if showValue}
        {#if range}
          <span class="wpea-range__value">{valueMin} – {valueMax}</span>
        {:else}
          <span class="wpea-range__value">{value}</span>
        {/if}
      {/if}
    </div>
  {/if}

  {#if range}
    <div
      class="wpea-range-dual {colorClass}"
      class:wpea-range-dual--disabled={disabled}
    >
      <div class="wpea-range-dual__track"></div>
      <div class="wpea-range-dual__fill" style="left: {progressMin}%; width: {progressMax - progressMin}%"></div>
      <input
        type="range"
        class="wpea-range-dual__input wpea-range-dual__input--min"
        id="{id}-min"
        name="{name}-min"
        {min}
        {max}
        {step}
        {disabled}
        value={valueMin}
        oninput={handleMinInput}
        onchange={handleMinChange}
      />
      <input
        type="range"
        class="wpea-range-dual__input wpea-range-dual__input--max"
        id="{id}-max"
        name="{name}-max"
        {min}
        {max}
        {step}
        {disabled}
        value={valueMax}
        oninput={handleMaxInput}
        onchange={handleMaxChange}
      />
    </div>
  {:else}
    <input
      type="range"
      class="wpea-range {colorClass}"
      {id}
      {name}
      {min}
      {max}
      {step}
      {disabled}
      value={value}
      style="--wpea-range-progress: {progress}%"
      oninput={handleInput}
      onchange={handleChange}
    />
  {/if}

  {#if help}
    <span class="wpea-help">{help}</span>
  {/if}
</div>
