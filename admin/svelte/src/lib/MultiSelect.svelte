<script lang="ts">
  import type { SelectOption } from '../menu-queries-types';

  type Props = {
    value?: (string | number)[];
    id?: string;
    label?: string;
    help?: string;
    options?: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    onchange?: (value: (string | number)[]) => void;
  };

  let {
    value = $bindable([]),
    id,
    label,
    help,
    options = [],
    placeholder = 'Search...',
    disabled = false,
    onchange
  }: Props = $props();

  let searchTerm = $state('');
  let isOpen = $state(false);
  let dropdownRef: HTMLDivElement | null = null;

  // Filter options based on search and exclude already selected
  let filteredOptions = $derived(
    (options || []).filter(option => {
      const isSelected = (value || []).includes(option.value);
      const matchesSearch = option.label.toLowerCase().includes(searchTerm.toLowerCase());
      return !isSelected && matchesSearch;
    })
  );

  // Get selected option labels
  let selectedOptions = $derived(
    (value || []).map(val => (options || []).find(opt => opt.value === val)).filter(Boolean) as SelectOption[]
  );

  function toggleOption(optionValue: string | number) {
    if (value.includes(optionValue)) {
      value = value.filter(v => v !== optionValue);
    } else {
      value = [...value, optionValue];
    }
    searchTerm = '';
    onchange?.(value);
  }

  function removeOption(optionValue: string | number) {
    value = value.filter(v => v !== optionValue);
    onchange?.(value);
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="wpea-field">
  {#if label}
    <label class="wpea-label" for={id}>{label}</label>
  {/if}

  <div class="multiselect" bind:this={dropdownRef}>
    <!-- Selected tags -->
    <div class="multiselect__tags">
      {#each selectedOptions as option}
        <span class="multiselect__tag">
          {option.label}
          <button
            type="button"
            class="multiselect__tag-remove"
            onclick={() => removeOption(option.value)}
            disabled={disabled}
            aria-label="Remove {option.label}"
          >
            ×
          </button>
        </span>
      {/each}

      <!-- Search input -->
      <input
        type="text"
        class="multiselect__input"
        bind:value={searchTerm}
        onfocus={() => (isOpen = true)}
        {placeholder}
        {disabled}
        {id}
      />
    </div>

    <!-- Dropdown -->
    {#if isOpen && filteredOptions.length > 0}
      <div class="multiselect__dropdown">
        {#each filteredOptions as option}
          <button
            type="button"
            class="multiselect__option"
            onclick={() => toggleOption(option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  {#if help}
    <span class="wpea-help">{help}</span>
  {/if}
</div>

<style>
  .multiselect {
    position: relative;
  }

  .multiselect__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    padding: 0.5rem;
    background: var(--wpea-input--bg);
    border: 1px solid var(--wpea-input--border);
    border-radius: var(--wpea-radius--sm);
    min-height: 2.5rem;
    cursor: text;
    transition: box-shadow var(--wpea-anim-duration--fast), border-color var(--wpea-anim-duration--fast);
  }

  .multiselect__tags:focus-within {
    border-color: var(--wpea-input--border-focus);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--wpea-color--primary), transparent 80%);
  }

  .multiselect__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: var(--wpea-color--primary);
    color: white;
    border-radius: var(--wpea-radius);
    font-size: 0.875rem;
  }

  .multiselect__tag-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    padding: 0;
    background: transparent;
    border: none;
    color: white;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0.8;
  }

  .multiselect__tag-remove:hover {
    opacity: 1;
  }

  .multiselect__input {
    flex: 1;
    min-width: 120px;
    border: none;
    background: transparent;
    outline: none;
    font-family: inherit;
    font-size: inherit;
    color: var(--wpea-surface--text);
  }

  .multiselect__input::placeholder {
    color: var(--wpea-input--placeholder);
  }

  .multiselect__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.25rem;
    max-height: 200px;
    overflow-y: auto;
    background: var(--wpea-input--bg);
    border: 1px solid var(--wpea-input--border);
    border-radius: var(--wpea-radius--sm);
    box-shadow: var(--wpea-shadow--lg);
    z-index: 1000;
  }

  .multiselect__option {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    text-align: left;
    font-family: inherit;
    font-size: inherit;
    color: var(--wpea-surface--text);
    cursor: pointer;
  }

  .multiselect__option:hover {
    background: color-mix(in oklab, var(--wpea-color--primary), transparent 90%);
  }

  .multiselect__option:focus {
    outline: 2px solid var(--wpea-color--primary);
    outline-offset: -2px;
  }
</style>
