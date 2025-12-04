<script lang="ts">
  import type { Size } from './types';

  type Props = {
    value?: string;
    id?: string;
    name?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    size?: Size;
    label?: string;
    help?: string;
    oninput?: (value: string) => void;
    onchange?: (value: string) => void;
  };

  let {
    value = $bindable(''),
    id,
    name,
    type = 'text',
    placeholder,
    disabled = false,
    readonly = false,
    required = false,
    size,
    label,
    help,
    oninput,
    onchange
  }: Props = $props();

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    oninput?.(value);
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    onchange?.(value);
  }

  let sizeClass = $derived(size ? `wpea-input--${size}` : '');
</script>

{#if label || help}
  <div class="wpea-field">
    {#if label}
      <label class="wpea-label" for={id}>{label}</label>
    {/if}
    <input
      class="wpea-input {sizeClass}"
      {type}
      {id}
      {name}
      {placeholder}
      {disabled}
      {readonly}
      {required}
      value={value}
      oninput={handleInput}
      onchange={handleChange}
    />
    {#if help}
      <span class="wpea-help">{help}</span>
    {/if}
  </div>
{:else}
  <input
    class="wpea-input {sizeClass}"
    {type}
    {id}
    {name}
    {placeholder}
    {disabled}
    {readonly}
    {required}
    value={value}
    oninput={handleInput}
    onchange={handleChange}
  />
{/if}
