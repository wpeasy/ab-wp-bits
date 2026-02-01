<script lang="ts">
  import type { StringOrSnippet } from '../types';
  import { isSnippet } from '../utils/renderContent';

  type Props = {
    value?: string;
    id?: string;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    rows?: number;
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
    placeholder,
    disabled = false,
    readonly = false,
    required = false,
    rows = 4,
    label,
    help,
    class: className = '',
    style,
    oninput,
    onchange
  }: Props = $props();

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    value = target.value;
    oninput?.(value);
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    value = target.value;
    onchange?.(value);
  }
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
    <textarea
      class="wpea-textarea {className}"
      {style}
      {id}
      {name}
      {placeholder}
      {disabled}
      {readonly}
      {required}
      {rows}
      value={value}
      oninput={handleInput}
      onchange={handleChange}
    ></textarea>
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
  <textarea
    class="wpea-textarea {className}"
    {style}
    {id}
    {name}
    {placeholder}
    {disabled}
    {readonly}
    {required}
    {rows}
    value={value}
    oninput={handleInput}
    onchange={handleChange}
  ></textarea>
{/if}
