<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    value?: string;
    id?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    help?: string;
    class?: string;
    style?: string;
    options?: Array<{ value: string; label: string }>;
    children?: Snippet;
    onchange?: (value: string) => void;
  };

  let {
    value = $bindable(''),
    id,
    name,
    disabled = false,
    required = false,
    label,
    help,
    class: className = '',
    style,
    options = [],
    children,
    onchange
  }: Props = $props();

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    value = target.value;
    onchange?.(value);
  }
</script>

{#if label || help}
  <div class="wpea-field">
    {#if label}
      <label class="wpea-label" for={id}>{label}</label>
    {/if}
    <select
      class="wpea-select {className}"
      {style}
      {id}
      {name}
      {disabled}
      {required}
      value={value}
      onchange={handleChange}
    >
      {#if children}
        {@render children()}
      {:else}
        {#each options as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      {/if}
    </select>
    {#if help}
      <span class="wpea-help">{help}</span>
    {/if}
  </div>
{:else}
  <select
    class="wpea-select {className}"
    {style}
    {id}
    {name}
    {disabled}
    {required}
    value={value}
    onchange={handleChange}
  >
    {#if children}
      {@render children()}
    {:else}
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    {/if}
  </select>
{/if}
