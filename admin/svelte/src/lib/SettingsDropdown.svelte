<script lang="ts">
  import Switch from './Switch.svelte';
  import Toggle3State from './Toggle3State.svelte';

  type ThemeMode = 'light' | 'dark' | 'auto';

  type Props = {
    compactMode?: boolean;
    themeMode?: ThemeMode;
    onCompactModeChange?: (value: boolean) => void;
    onThemeModeChange?: (value: ThemeMode) => void;
  };

  let {
    compactMode = $bindable(false),
    themeMode = $bindable<ThemeMode>('auto'),
    onCompactModeChange,
    onThemeModeChange
  }: Props = $props();

  let isOpen = $state(false);
  let dropdownRef: HTMLDivElement;

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });

  function handleCompactChange(value: boolean) {
    compactMode = value;
    onCompactModeChange?.(value);
  }

  function handleThemeChange(value: string) {
    themeMode = value as ThemeMode;
    onThemeModeChange?.(value as ThemeMode);
  }

  const themeOptions = [
    {
      value: 'light',
      label: 'Light mode',
      icon: iconLight
    },
    {
      value: 'auto',
      label: 'System preference',
      icon: iconAuto
    },
    {
      value: 'dark',
      label: 'Dark mode',
      icon: iconDark
    }
  ];
</script>

{#snippet iconLight()}
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
{/snippet}

{#snippet iconDark()}
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
{/snippet}

{#snippet iconAuto()}
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
{/snippet}

<div class="settings-dropdown" bind:this={dropdownRef}>
  <button
    type="button"
    class="settings-dropdown__trigger"
    onclick={toggleDropdown}
    aria-expanded={isOpen}
    aria-haspopup="true"
    aria-label="Settings"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  </button>

  {#if isOpen}
    <div class="settings-dropdown__menu">
      <div class="settings-dropdown__item">
        <span class="settings-dropdown__label">Compact Mode</span>
        <Switch
          checked={compactMode}
          onchange={handleCompactChange}
          size="sm"
        />
      </div>

      <div class="settings-dropdown__divider"></div>

      <div class="settings-dropdown__item settings-dropdown__item--theme">
        <span class="settings-dropdown__label">Theme</span>
        <Toggle3State
          value={themeMode}
          options={themeOptions}
          onChange={handleThemeChange}
          iconOnly={true}
          showPopover={true}
          popoverPosition="bottom"
          popoverSize="xs"
          ariaLabel="Select theme mode"
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-dropdown {
    position: relative;
  }

  .settings-dropdown__trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: var(--wpea-radius--md);
    background: transparent;
    color: var(--wpea-surface--text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .settings-dropdown__trigger:hover {
    background: var(--wpea-surface--muted);
    color: var(--wpea-surface--text);
  }

  .settings-dropdown__trigger[aria-expanded="true"] {
    background: var(--wpea-surface--muted);
    color: var(--wpea-color--primary);
  }

  .settings-dropdown__menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 200px;
    padding: var(--wpea-space--sm);
    background: var(--wpea-surface--bg);
    border: 1px solid var(--wpea-surface--border);
    border-radius: var(--wpea-radius--lg);
    box-shadow: var(--wpea-shadow--lg);
    z-index: 1000;
    animation: dropdown-open 0.15s ease;
  }

  @keyframes dropdown-open {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .settings-dropdown__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--wpea-space--sm) var(--wpea-space--xs);
    gap: var(--wpea-space--md);
  }

  .settings-dropdown__item--theme {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--wpea-space--sm);
  }

  .settings-dropdown__label {
    font-size: var(--wpea-text--sm);
    font-weight: 500;
    color: var(--wpea-surface--text);
  }

  .settings-dropdown__divider {
    height: 1px;
    margin: var(--wpea-space--xs) 0;
    background: var(--wpea-surface--divider);
  }
</style>
