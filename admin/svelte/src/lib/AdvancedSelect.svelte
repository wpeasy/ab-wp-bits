<script lang="ts">
  import type { ColorVariant, StringOrSnippet, AdvancedSelectOption as AdvancedSelectOptionType } from './types';
  import { isSnippet } from './utils/renderContent';

  // Re-export for backwards compatibility
  export type AdvancedSelectOption = AdvancedSelectOptionType;

  export type AdvancedSelectEventDetail = {
    component: HTMLDivElement;
    id: string | undefined;
    value: string;
    option?: AdvancedSelectOption;
    query?: string;
  };

  type Props = {
    value?: string | string[];
    id?: string;
    name?: string;
    options?: AdvancedSelectOption[];
    placeholder?: string;
    disabled?: boolean;
    color?: ColorVariant;
    label?: StringOrSnippet;
    help?: StringOrSnippet;
    searchable?: boolean;
    clearable?: boolean;
    maxItems?: number;
    multiple?: boolean;
    creatable?: boolean;
    manageable?: boolean;
    onchange?: (value: string | string[]) => void;
  };

  let {
    value = $bindable([]),
    id,
    name,
    options = [],
    placeholder = 'Select...',
    disabled = false,
    color,
    label,
    help,
    searchable = true,
    clearable = true,
    maxItems,
    multiple = true,
    creatable = false,
    manageable = false,
    onchange
  }: Props = $props();

  let isOpen = $state(false);
  let searchQuery = $state('');
  let highlightedIndex = $state(-1);
  let containerRef: HTMLDivElement;
  let searchInputRef = $state<HTMLInputElement | null>(null);

  // Generate unique ID for aria-controls
  const listboxId = `wpea-multiselect-listbox-${Math.random().toString(36).slice(2, 9)}`;

  // Helper to get string label for searching (falls back to value if Snippet)
  function getSearchableLabel(opt: AdvancedSelectOption): string {
    return typeof opt.label === 'string' ? opt.label : opt.value;
  }

  // Normalize value to always work with arrays internally
  let internalValue = $derived(
    Array.isArray(value) ? value : (value ? [value] : [])
  );

  let filteredOptions = $derived(
    searchQuery
      ? options.filter(opt =>
          getSearchableLabel(opt).toLowerCase().includes(searchQuery.toLowerCase()) &&
          !opt.disabled
        )
      : options.filter(opt => !opt.disabled)
  );

  let selectedOptions = $derived(
    internalValue.map(v => options.find(o => o.value === v)).filter(Boolean) as AdvancedSelectOption[]
  );

  let canAddMore = $derived(
    multiple ? (!maxItems || internalValue.length < maxItems) : true
  );

  // Check if current search query matches any existing option
  let hasExactMatch = $derived(
    options.some(opt => getSearchableLabel(opt).toLowerCase() === searchQuery.toLowerCase())
  );

  // Show create option when creatable, has search query, no exact match, and can add more
  let showCreateOption = $derived(
    creatable && searchQuery.trim() !== '' && !hasExactMatch && canAddMore
  );

  function dispatchEvent(eventName: string, detail: Partial<AdvancedSelectEventDetail>) {
    const event = new CustomEvent(`AdvancedSelect:${eventName}`, {
      bubbles: true,
      detail: {
        component: containerRef,
        id,
        ...detail
      }
    });
    containerRef?.dispatchEvent(event);
  }

  function updateValue(newInternalValue: string[]) {
    if (multiple) {
      value = newInternalValue;
      onchange?.(newInternalValue);
    } else {
      value = newInternalValue[0] || '';
      onchange?.(newInternalValue[0] || '');
    }
  }

  function toggleDropdown() {
    if (disabled) return;
    isOpen = !isOpen;
    if (isOpen) {
      searchQuery = '';
      highlightedIndex = -1;
      setTimeout(() => searchInputRef?.focus(), 10);
    }
  }

  function selectOption(option: AdvancedSelectOption) {
    if (!canAddMore && !internalValue.includes(option.value)) return;

    let newValue: string[];
    if (multiple) {
      if (internalValue.includes(option.value)) {
        newValue = internalValue.filter(v => v !== option.value);
      } else {
        newValue = [...internalValue, option.value];
      }
    } else {
      // Single select mode - replace value and close dropdown
      newValue = [option.value];
      isOpen = false;
    }

    searchQuery = '';
    updateValue(newValue);
  }

  function removeOption(optionValue: string, event?: Event) {
    event?.stopPropagation();
    const newValue = internalValue.filter(v => v !== optionValue);
    updateValue(newValue);
  }

  function clearAll(event: Event) {
    event.stopPropagation();
    updateValue([]);
  }

  function handleCreate() {
    if (!searchQuery.trim()) return;
    dispatchEvent('create', {
      value: searchQuery.trim(),
      query: searchQuery.trim()
    });
    searchQuery = '';
  }

  function handleDelete(option: AdvancedSelectOption, event: Event) {
    event.stopPropagation();
    if (!option.deletable || option.locked) return;
    dispatchEvent('delete', {
      value: option.value,
      option
    });
  }

  function handleLock(option: AdvancedSelectOption, event: Event) {
    event.stopPropagation();
    dispatchEvent('lock', {
      value: option.value,
      option
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        isOpen = false;
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          isOpen = true;
        } else {
          const maxIndex = filteredOptions.length + (showCreateOption ? 0 : -1);
          highlightedIndex = Math.min(highlightedIndex + 1, maxIndex);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (showCreateOption && (highlightedIndex === filteredOptions.length || filteredOptions.length === 0)) {
          handleCreate();
        } else if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          selectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Backspace':
        if (searchQuery === '' && internalValue.length > 0) {
          removeOption(internalValue[internalValue.length - 1]);
        }
        break;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (containerRef && !containerRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });

  let colorClass = $derived(color ? `wpea-multiselect--${color}` : '');
</script>

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
  <div
    class="wpea-multiselect {colorClass}"
    class:wpea-multiselect--open={isOpen}
    class:wpea-multiselect--disabled={disabled}
    class:wpea-multiselect--has-value={internalValue.length > 0}
    class:wpea-multiselect--single={!multiple}
    bind:this={containerRef}
  >
    <div
      class="wpea-multiselect__control"
      onclick={toggleDropdown}
      onkeydown={handleKeydown}
      role="combobox"
      aria-controls={listboxId}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      tabindex={disabled ? -1 : 0}
    >
      <div class="wpea-multiselect__value-container">
        {#if multiple}
          {#each selectedOptions as option}
            <span class="wpea-multiselect__tag">
              <span class="wpea-multiselect__tag-label">
                {#if isSnippet(option.label)}
                  {@render option.label()}
                {:else}
                  {option.label}
                {/if}
              </span>
              <button
                type="button"
                class="wpea-multiselect__tag-remove"
                onclick={(e) => removeOption(option.value, e)}
                tabindex="-1"
                aria-label="Remove {getSearchableLabel(option)}"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </span>
          {/each}
        {:else if selectedOptions.length > 0 && !isOpen}
          <span class="wpea-multiselect__single-value">
            {#if isSnippet(selectedOptions[0].label)}
              {@render selectedOptions[0].label()}
            {:else}
              {selectedOptions[0].label}
            {/if}
          </span>
        {/if}
        {#if searchable && isOpen}
          <input
            type="text"
            class="wpea-multiselect__input"
            bind:this={searchInputRef}
            bind:value={searchQuery}
            onkeydown={handleKeydown}
            onclick={(e) => e.stopPropagation()}
            placeholder={internalValue.length === 0 ? placeholder : (multiple ? '' : placeholder)}
            {disabled}
          />
        {:else if internalValue.length === 0}
          <span class="wpea-multiselect__placeholder">{placeholder}</span>
        {/if}
      </div>
      <div class="wpea-multiselect__indicators">
        {#if clearable && internalValue.length > 0}
          <button
            type="button"
            class="wpea-multiselect__clear"
            onclick={clearAll}
            tabindex="-1"
            aria-label="Clear all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        {/if}
        <span class="wpea-multiselect__separator"></span>
        <span class="wpea-multiselect__dropdown-indicator">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>
    </div>

    {#if isOpen}
      <div class="wpea-multiselect__menu" role="listbox" aria-multiselectable={multiple} id={listboxId}>
        <div class="wpea-multiselect__menu-list">
          {#each filteredOptions as option, i}
            <div
              class="wpea-multiselect__option"
              class:wpea-multiselect__option--selected={internalValue.includes(option.value)}
              class:wpea-multiselect__option--highlighted={i === highlightedIndex}
              class:wpea-multiselect__option--disabled={!canAddMore && !internalValue.includes(option.value)}
              role="option"
              tabindex="-1"
              aria-selected={internalValue.includes(option.value)}
              onclick={() => selectOption(option)}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectOption(option); }}
              onmouseenter={() => highlightedIndex = i}
            >
              <span class="wpea-multiselect__option-label">
                {#if isSnippet(option.label)}
                  {@render option.label()}
                {:else}
                  {option.label}
                {/if}
              </span>

              {#if manageable}
                <div class="wpea-multiselect__option-actions">
                  {#if option.deletable === true}
                    <button
                      type="button"
                      class="wpea-multiselect__option-lock"
                      class:wpea-multiselect__option-lock--locked={option.locked}
                      onclick={(e) => handleLock(option, e)}
                      aria-label={option.locked ? "Unlock" : "Lock"}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        {#if option.locked}
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        {:else}
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                        {/if}
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="wpea-multiselect__option-delete"
                      class:wpea-multiselect__option-delete--disabled={option.locked}
                      onclick={(e) => handleDelete(option, e)}
                      disabled={option.locked}
                      aria-label="Delete {getSearchableLabel(option)}"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </button>
                  {:else if option.deletable === false}
                    <span class="wpea-multiselect__option-protected" aria-label="Protected">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M4.93 4.93l14.14 14.14"/>
                      </svg>
                    </span>
                  {/if}
                </div>
              {:else if internalValue.includes(option.value)}
                <svg class="wpea-multiselect__option-check" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              {/if}
            </div>
          {:else}
            {#if !showCreateOption}
              <div class="wpea-multiselect__no-options">No options</div>
            {/if}
          {/each}

          {#if showCreateOption}
            <div
              class="wpea-multiselect__option wpea-multiselect__option--create"
              class:wpea-multiselect__option--highlighted={highlightedIndex === filteredOptions.length}
              role="option"
              tabindex="-1"
              aria-selected="false"
              onclick={handleCreate}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCreate(); }}
              onmouseenter={() => highlightedIndex = filteredOptions.length}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: var(--wpea-space--xs);">
                <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Create "{searchQuery}"
            </div>
          {/if}
        </div>
      </div>
    {/if}
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

<style>
  /* Ensure input inherits color-scheme for proper dark mode support */
  :global(.wpea-multiselect__input) {
    color-scheme: inherit;
    background: transparent !important;
    color: inherit !important;
  }
</style>
