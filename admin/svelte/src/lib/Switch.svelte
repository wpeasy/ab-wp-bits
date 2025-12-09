<script lang="ts">
  import type { Size, ColorVariant } from './types';

  type Props = {
    checked?: boolean;
    id?: string;
    disabled?: boolean;
    size?: Size;
    color?: ColorVariant;
    label?: string;
    help?: string;
    class?: string;
    style?: string;
    onchange?: (checked: boolean) => void;
  };

  let {
    checked = $bindable(false),
    id,
    disabled = false,
    size,
    color,
    label,
    help,
    class: className = '',
    style,
    onchange
  }: Props = $props();

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }

  let sizeClass = $derived(size ? `wpea-switch--${size}` : '');
  let colorClass = $derived(color ? `wpea-switch--${color}` : '');
</script>

{#if help}
  <div class="wpea-field {className}" {style}>
    <div class="wpea-control">
      <label class="wpea-switch {sizeClass} {colorClass}" for={id}>
        <input
          type="checkbox"
          {id}
          {disabled}
          checked={checked}
          onchange={handleChange}
        />
        <span class="wpea-switch__slider"></span>
      </label>
      {#if label}
        <label for={id}>{label}</label>
      {/if}
    </div>
    <span class="wpea-help">{help}</span>
  </div>
{:else}
  <div class="wpea-control {className}" {style}>
    <label class="wpea-switch {sizeClass} {colorClass}" for={id}>
      <input
        type="checkbox"
        {id}
        {disabled}
        checked={checked}
        onchange={handleChange}
      />
      <span class="wpea-switch__slider"></span>
    </label>
    {#if label}
      <label for={id}>{label}</label>
    {/if}
  </div>
{/if}
