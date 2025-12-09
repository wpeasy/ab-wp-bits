<script lang="ts">
  import type { ColorVariant } from './types';

  export type AdvancedSelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
    deletable?: boolean;
    locked?: boolean;
  };

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
    label?: string;
    help?: string;
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
  const listboxId = `wpea-select2-listbox-${Math.random().toString(36).slice(2, 9)}`;

  // Normalize value to always work with arrays internally
  let internalValue = $derived(
    Array.isArray(value) ? value : (value ? [value] : [])
  );

  let filteredOptions = $derived(
    searchQuery
      ? options.filter(opt =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
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
    options.some(opt => opt.label.toLowerCase() === searchQuery.toLowerCase())
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

  let colorClass = $derived(color ? `wpea-select2--${color}` : '');
</script>

<div class="wpea-field">
  {#if label}
    <label class="wpea-label" for={id}>{label}</label>
  {/if}
  <div
    class="wpea-select2 {colorClass}"
    class:wpea-select2--open={isOpen}
    class:wpea-select2--disabled={disabled}
    class:wpea-select2--has-value={internalValue.length > 0}
    class:wpea-select2--single={!multiple}
    bind:this={containerRef}
  >
    <div
      class="wpea-select2__control"
      onclick={toggleDropdown}
      onkeydown={handleKeydown}
      role="combobox"
      aria-controls={listboxId}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      tabindex={disabled ? -1 : 0}
    >
      <div class="wpea-select2__value-container">
        {#if multiple}
          {#each selectedOptions as option}
            <span class="wpea-select2__tag">
              <span class="wpea-select2__tag-label">{option.label}</span>
              <button
                type="button"
                class="wpea-select2__tag-remove"
                onclick={(e) => removeOption(option.value, e)}
                tabindex="-1"
                aria-label="Remove {option.label}"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </span>
          {/each}
        {:else if selectedOptions.length > 0 && !isOpen}
          <span class="wpea-select2__single-value">{selectedOptions[0].label}</span>
        {/if}
        {#if searchable && isOpen}
          <input
            type="text"
            class="wpea-select2__input"
            bind:this={searchInputRef}
            bind:value={searchQuery}
            onkeydown={handleKeydown}
            onclick={(e) => e.stopPropagation()}
            placeholder={internalValue.length === 0 ? placeholder : (multiple ? '' : placeholder)}
            {disabled}
          />
        {:else if internalValue.length === 0}
          <span class="wpea-select2__placeholder">{placeholder}</span>
        {/if}
      </div>
      <div class="wpea-select2__indicators">
        {#if clearable && internalValue.length > 0}
          <button
            type="button"
            class="wpea-select2__clear"
            onclick={clearAll}
            tabindex="-1"
            aria-label="Clear all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        {/if}
        <span class="wpea-select2__separator"></span>
        <span class="wpea-select2__dropdown-indicator">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>
    </div>

    {#if isOpen}
      <div class="wpea-select2__menu" role="listbox" aria-multiselectable={multiple} id={listboxId}>
        <div class="wpea-select2__menu-list">
          {#each filteredOptions as option, i}
            <div
              class="wpea-select2__option"
              class:wpea-select2__option--selected={internalValue.includes(option.value)}
              class:wpea-select2__option--highlighted={i === highlightedIndex}
              class:wpea-select2__option--disabled={!canAddMore && !internalValue.includes(option.value)}
              role="option"
              tabindex="-1"
              aria-selected={internalValue.includes(option.value)}
              onclick={() => selectOption(option)}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectOption(option); }}
              onmouseenter={() => highlightedIndex = i}
            >
              <span class="wpea-select2__option-label">{option.label}</span>

              {#if manageable}
                <div class="wpea-select2__option-actions">
                  {#if option.deletable === true}
                    <button
                      type="button"
                      class="wpea-select2__option-lock"
                      class:wpea-select2__option-lock--locked={option.locked}
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
                      class="wpea-select2__option-delete"
                      class:wpea-select2__option-delete--disabled={option.locked}
                      onclick={(e) => handleDelete(option, e)}
                      disabled={option.locked}
                      aria-label="Delete {option.label}"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </button>
                  {:else if option.deletable === false}
                    <span class="wpea-select2__option-protected" aria-label="Protected">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M4.93 4.93l14.14 14.14"/>
                      </svg>
                    </span>
                  {/if}
                </div>
              {:else if internalValue.includes(option.value)}
                <svg class="wpea-select2__option-check" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              {/if}
            </div>
          {:else}
            {#if !showCreateOption}
              <div class="wpea-select2__no-options">No options</div>
            {/if}
          {/each}

          {#if showCreateOption}
            <div
              class="wpea-select2__option wpea-select2__option--create"
              class:wpea-select2__option--highlighted={highlightedIndex === filteredOptions.length}
              role="option"
              tabindex="-1"
              aria-selected="false"
              onclick={handleCreate}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCreate(); }}
              onmouseenter={() => highlightedIndex = filteredOptions.length}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: 6px;">
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
    <span class="wpea-help">{help}</span>
  {/if}
</div>
