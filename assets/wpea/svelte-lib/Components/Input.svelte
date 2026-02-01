<script lang="ts">
  import type { Size, StringOrSnippet } from '../types';
  import { isSnippet } from '../utils/renderContent';

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
    label?: StringOrSnippet;
    help?: StringOrSnippet;
    class?: string;
    style?: string;
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
    class: className = '',
    style,
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
      <label class="wpea-label" for={id}>
        {#if isSnippet(label)}
          {@render label()}
        {:else}
          {label}
        {/if}
      </label>
    {/if}
    <input
      class="wpea-input {sizeClass} {className}"
      {style}
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
  <input
    class="wpea-input {sizeClass} {className}"
    {style}
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
