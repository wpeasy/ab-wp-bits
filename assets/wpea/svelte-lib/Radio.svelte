<script lang="ts">
  import type { ColorVariant } from './types';

  type Option = {
    value: string;
    label: string;
    disabled?: boolean;
  };

  type Props = {
    value?: string;
    name: string;
    options: Option[];
    id?: string;
    disabled?: boolean;
    color?: ColorVariant;
    label?: string;
    help?: string;
    inline?: boolean;
    class?: string;
    style?: string;
    onchange?: (value: string) => void;
  };

  let {
    value = $bindable(''),
    name,
    options = [],
    id,
    disabled = false,
    color,
    label,
    help,
    inline = false,
    class: className = '',
    style,
    onchange
  }: Props = $props();

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    onchange?.(value);
  }

  let colorClass = $derived(color ? `wpea-radio--${color}` : '');
</script>

<div class="wpea-field {className}" {style}>
  {#if label}
    <span class="wpea-label">{label}</span>
  {/if}
  <div class="wpea-radio-group {inline ? 'wpea-radio-group--inline' : ''}">
    {#each options as option, i}
      <div class="wpea-control">
        <label class="wpea-radio {colorClass}" for="{id || name}-{i}">
          <input
            type="radio"
            id="{id || name}-{i}"
            {name}
            value={option.value}
            checked={value === option.value}
            disabled={disabled || option.disabled}
            onchange={handleChange}
          />
          <span class="wpea-radio__indicator"></span>
        </label>
        <label for="{id || name}-{i}">{option.label}</label>
      </div>
    {/each}
  </div>
  {#if help}
    <span class="wpea-help">{help}</span>
  {/if}
</div>
