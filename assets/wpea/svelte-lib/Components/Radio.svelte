<script lang="ts">
  import type { ColorVariant, StringOrSnippet, RadioOption } from '../types';
  import { isSnippet } from '../utils/renderContent';

  type Props = {
    value?: string;
    name: string;
    options: RadioOption[];
    id?: string;
    disabled?: boolean;
    color?: ColorVariant;
    label?: StringOrSnippet;
    help?: StringOrSnippet;
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
    <span class="wpea-label">
      {#if isSnippet(label)}
        {@render label()}
      {:else}
        {label}
      {/if}
    </span>
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
        <label for="{id || name}-{i}">
          {#if isSnippet(option.label)}
            {@render option.label()}
          {:else}
            {option.label}
          {/if}
        </label>
      </div>
    {/each}
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
