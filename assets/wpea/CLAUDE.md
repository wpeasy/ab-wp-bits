# CLAUDE.md — WP Easy Admin Framework

## Files
- wpea-framework.css - main framework file
- wpea-framework-settings.css - configurable settings (imported by wpea-framework.css)
- wpea-wp-resets.css - resets to overcome default WP Admin styles
- svelte-app/ - Svelte 5 demo application showcasing all components

## CSS Variable Verification

**IMPORTANT:** Before using any `var(--wpea-*)` CSS variable, verify it exists in the framework. Do not hallucinate or assume variables exist.

### How to Verify Variables Exist

1. Check `wpea-framework-settings.css` for base settings (fonts, colors, spacing base values, radius, animation durations, switch sizes, input styles, popover styles)
2. Check `wpea-framework.css` :root block for computed tokens (color variants, spacing scale, text sizes, shadows, surfaces)

### Key Variable Categories

**Defined in wpea-framework-settings.css:**
- `--wpea-fs-base`, `--wpea-scale`, `--wpea-font-sans`
- `--wpea-color--*-light`, `--wpea-color--*-dark` (base palette)
- `--wpea-color--success`, `--wpea-color--warning`, `--wpea-color--danger`, `--wpea-color--info`
- `--wpea-space-base`, `--wpea-radius--*`, `--wpea-anim-duration--*`
- `--wpea-switch-*`, `--wpea-input--*`, `--wpea-popover--*`

**Computed in wpea-framework.css :root:**
- `--wpea-color--primary`, `--wpea-color--secondary`, `--wpea-color--neutral` (light-dark resolved)
- `--wpea-color--*-l-1` to `--wpea-color--*-l-10` (lightened variants)
- `--wpea-color--*-d-1` to `--wpea-color--*-d-10` (darkened variants)
- `--wpea-color--*-t-10` to `--wpea-color--*-t-100` (transparent variants)
- `--wpea-space--xs`, `--wpea-space--sm`, `--wpea-space--md`, `--wpea-space--lg`, `--wpea-space--xl`, `--wpea-space--2xl`
- `--wpea-text--xs`, `--wpea-text--sm`, `--wpea-text--md`, `--wpea-text--lg`, `--wpea-text--xl`, `--wpea-text--2xl`, `--wpea-text--3xl`, `--wpea-text--4xl`
- `--wpea-shadow--sm`, `--wpea-shadow--md`, `--wpea-shadow--lg`, `--wpea-shadow--xl`
- `--wpea-surface--bg`, `--wpea-surface--muted`, `--wpea-surface--panel`, `--wpea-surface--border`, `--wpea-surface--divider`, `--wpea-surface--text`, `--wpea-surface--text-muted`

### Base Classes

- `.wpea` - Base styling for top-level layout wrapper and modals mounted in document.body (font, colors, flex column layout)
- `.wpea-full` - Add to `.wpea` for full-screen apps/modals (adds `min-height: 100vh`)
- `.wpea-embed` - Isolated wrapper for page builders (Bricks, Elementor, etc.) - includes all resets inline

### Embedded Usage (Page Builders)

When using the framework inside page builders or other applications where you cannot load global reset CSS, use `.wpea-embed` instead of `.wpea`:

```html
<!-- Inside Bricks Builder, Elementor, etc. -->
<div class="wpea-embed">
  <!-- Your WPEA components here -->
  <div class="wpea-card">
    <h3>Settings</h3>
    <p>Content here</p>
  </div>
</div>
```

**Key differences from `.wpea`:**
- Uses `all: revert` to reset inherited styles from parent app
- Includes all typography, form, and element resets inline
- Does not require `wpea-wp-resets.css`
- Self-contained - no global CSS side effects

### List Styling

**Default behavior:** Lists (`<ul>`, `<ol>`) retain their bullets/numbers by default.

**For layout lists** (navigation, menus, tag lists), use `.wpea-list-reset`:

```html
<!-- Content list - has bullets -->
<ul>
  <li>Feature one</li>
  <li>Feature two</li>
</ul>

<!-- Layout list - no bullets -->
<ul class="wpea-list-reset">
  <li><a href="#">Home</a></li>
  <li><a href="#">About</a></li>
</ul>
```

The `.wpea-list-reset` class:
- Removes `list-style`
- Removes left padding
- Works on the element itself and nested `<ul>`/`<ol>`

### Layout Pattern: Content Containers with Gap

**IMPORTANT:** When creating content areas that contain multiple cards, sections, or info boxes, the parent container MUST use flex column with gap:

```css
.my-content-area {
  display: flex;
  flex-direction: column;
  gap: var(--wpea-space--lg);
}
```

The framework provides this pattern in:
- `.wpea-vtabs__content` - Vertical tabs content area
- `.wpea-tabs__panel` - Horizontal tabs panel

If creating custom containers for cards/sections, always include flex column with gap to ensure proper spacing.

## Light/Dark Mode Usage

The framework now uses the CSS `light-dark()` function for automatic light/dark mode support. This modern approach eliminates the need for separate dark mode classes or media queries.

### How It Works

The `light-dark()` function automatically selects the appropriate color value based on the page's `color-scheme` property:

```css
/* Automatically picks the right color based on the active color scheme */
--wpea-surface--bg: light-dark(#ffffff, #0f1115);
/* Light mode: #ffffff, Dark mode: #0f1115 */
```

### Controlling the Color Scheme

Set the `color-scheme` CSS property on your root element (typically `<body>` or `:root`):

**Respect OS Preference (Default):**
```html
<body style="color-scheme: light dark;">
```
or
```css
:root { color-scheme: light dark; }
```

**Force Light Mode:**
```html
<body style="color-scheme: light only;">
```
or
```css
:root { color-scheme: light only; }
```

**Force Dark Mode:**
```html
<body style="color-scheme: dark only;">
```
or
```css
:root { color-scheme: dark only; }
```

### JavaScript Example

To dynamically switch between color schemes:

```javascript
// Respect OS preference
document.body.style.setProperty('color-scheme', 'light dark');

// Force light mode
document.body.style.setProperty('color-scheme', 'light only');

// Force dark mode
document.body.style.setProperty('color-scheme', 'dark only');
```

See `test-ui.html` for a complete working example with a theme selector dropdown.

### Benefits of light-dark()

1. **No class toggles required** - No need for `.dark` or `.wpea-dark` classes
2. **No duplicate CSS** - Define colors once instead of in multiple media queries
3. **Automatic OS sync** - Respects user's OS preference by default
4. **Better performance** - Browser handles the switching natively
5. **Cleaner code** - Single source of truth for color definitions

### Browser Support

The `light-dark()` function is supported in:
- Chrome/Edge 123+
- Safari 17.5+
- Firefox 120+

For older browsers, consider adding a fallback or polyfill.

## Svelte 5 Differences

This project uses **Svelte 5 exclusively**. Below are the key differences from Svelte 4 that you must be aware of.

### Runes (New Reactivity System)

Svelte 5 introduces **runes** - a new reactivity system that replaces many Svelte 4 patterns. Runes are enabled by default in Svelte 5.

#### `$props()` - Replaces export let

**Svelte 4:**
```svelte
<script>
  export let variant = 'primary';
  export let disabled = false;
</script>
```

**Svelte 5:**
```svelte
<script lang="ts">
  type Props = {
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
  };

  let { variant = 'primary', disabled = false }: Props = $props();
</script>
```

#### `$state()` - Replaces let for reactive state

**Svelte 4:**
```svelte
<script>
  let count = 0;

  function increment() {
    count += 1;
  }
</script>
```

**Svelte 5:**
```svelte
<script>
  let count = $state(0);

  function increment() {
    count += 1;
  }
</script>
```

#### `$derived()` - Replaces reactive declarations ($:)

**Svelte 4:**
```svelte
<script>
  export let firstName;
  export let lastName;

  $: fullName = `${firstName} ${lastName}`;
  $: greeting = `Hello, ${fullName}!`;
</script>
```

**Svelte 5:**
```svelte
<script>
  let { firstName, lastName } = $props();

  let fullName = $derived(`${firstName} ${lastName}`);
  let greeting = $derived(`Hello, ${fullName}!`);
</script>
```

#### `$effect()` - Replaces reactive statements ($: {...})

**Svelte 4:**
```svelte
<script>
  export let value;

  $: {
    console.log('Value changed:', value);
    localStorage.setItem('value', value);
  }
</script>
```

**Svelte 5:**
```svelte
<script>
  let { value } = $props();

  $effect(() => {
    console.log('Value changed:', value);
    localStorage.setItem('value', value);
  });
</script>
```

### Snippets - Replace Slots

**Svelte 4:**
```svelte
<!-- Parent.svelte -->
<Child>
  <div slot="header">Header Content</div>
  <p>Default slot content</p>
</Child>

<!-- Child.svelte -->
<div class="child">
  <slot name="header" />
  <slot />
</div>
```

**Svelte 5:**
```svelte
<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
</script>

<Child>
  {#snippet header()}
    <div>Header Content</div>
  {/snippet}

  {#snippet children()}
    <p>Default slot content</p>
  {/snippet}
</Child>

<!-- Child.svelte -->
<script>
  import type { Snippet } from 'svelte';

  type Props = {
    header?: Snippet;
    children?: Snippet;
  };

  let { header, children }: Props = $props();
</script>

<div class="child">
  {#if header}
    {@render header()}
  {/if}

  {#if children}
    {@render children()}
  {/if}
</div>
```

### Event Handling

**Svelte 4:**
```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('click', { value: 42 });
  }
</script>

<button on:click={handleClick}>Click</button>

<!-- Parent -->
<Child on:click={(e) => console.log(e.detail)} />
```

**Svelte 5:**
```svelte
<script>
  type Props = {
    onclick?: (event: CustomEvent<{ value: number }>) => void;
  };

  let { onclick }: Props = $props();

  function handleClick() {
    onclick?.(new CustomEvent('click', { detail: { value: 42 } }));
  }
</script>

<button onclick={handleClick}>Click</button>

<!-- Parent -->
<Child onclick={(e) => console.log(e.detail)} />
```

Or use callback props directly:
```svelte
<script>
  type Props = {
    onSubmit?: (value: string) => void;
  };

  let { onSubmit }: Props = $props();
</script>

<button onclick={() => onSubmit?.('hello')}>Submit</button>
```

### Lifecycle Functions

**Svelte 4:**
```svelte
<script>
  import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte';

  onMount(() => {
    console.log('mounted');
    return () => console.log('cleanup');
  });

  onDestroy(() => console.log('destroyed'));
  beforeUpdate(() => console.log('before update'));
  afterUpdate(() => console.log('after update'));
</script>
```

**Svelte 5:**
```svelte
<script>
  import { onMount } from 'svelte';

  // onMount still exists and works the same
  onMount(() => {
    console.log('mounted');
    return () => console.log('cleanup');
  });

  // For other lifecycle needs, use $effect()
  $effect(() => {
    console.log('component updated');

    return () => {
      console.log('cleanup before next effect or destruction');
    };
  });

  // $effect runs after DOM updates (like afterUpdate)
  // Use $effect.pre() for beforeUpdate-like behavior
  $effect.pre(() => {
    console.log('before DOM update');
  });
</script>
```

### Component Binding

**Svelte 4:**
```svelte
<script>
  let inputValue = '';
</script>

<input bind:value={inputValue} />
```

**Svelte 5:**
```svelte
<script>
  let inputValue = $state('');
</script>

<input bind:value={inputValue} />
```

Binding still works the same, but the variable must be `$state()` for reactivity.

### Stores (Still Supported)

Stores still work in Svelte 5, but for component-local state, runes are preferred:

**Svelte 4 & 5 (Stores):**
```svelte
<script>
  import { writable } from 'svelte/store';
  const count = writable(0);
</script>

<button onclick={() => $count++}>
  Count: {$count}
</button>
```

**Svelte 5 (Preferred - Runes):**
```svelte
<script>
  let count = $state(0);
</script>

<button onclick={() => count++}>
  Count: {count}
</button>
```

Use stores for shared state across components. Use runes for local component state.

### Key Takeaways

1. **Always use `$props()`** instead of `export let`
2. **Use `$state()`** for reactive local variables
3. **Use `$derived()`** instead of `$:` for computed values
4. **Use `$effect()`** instead of `$: { ... }` for side effects
5. **Use snippets** instead of slots for component composition
6. **Use callback props** instead of `createEventDispatcher`
7. **Runes are enabled by default** - don't configure `runes: true` in svelte.config.js
8. **TypeScript is recommended** for better type safety with props and snippets

### Configuration

In `svelte.config.js`, do NOT add `runes: true` to compilerOptions - runes are enabled by default in Svelte 5:

```javascript
/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {}
};

export default config;
```
- note that these components are intended for a UI. All Svelte  state should be Global, with teh exception of local state for Component status
- ensure all code you create for this app are based on Svelte 5 patterns.
- before creating new Svelte functionality, always check our library first to see if a suitable component already exists.

## StringOrSnippet Pattern

Components support flexible content through the `StringOrSnippet` type - props can accept either a plain string or a Svelte 5 Snippet for rich content.

### Available Types (from `src/lib/types.ts`)

```typescript
import type { Snippet } from 'svelte';

// Union type for flexible content
export type StringOrSnippet = string | Snippet;

// Option types for form controls
export type SelectOption = { value: string; label: StringOrSnippet };
export type SelectOptionWithDisabled = SelectOption & { disabled?: boolean };
export type RadioOption = SelectOptionWithDisabled;
export type ToggleOption = { value: string; label: StringOrSnippet; icon?: Snippet };

// Navigation types
export type TabItem = { id: string; label: StringOrSnippet; content: Snippet };
export type AccordionItem = { id: string; title: StringOrSnippet; content: Snippet };
```

### Usage Examples

**Simple string (backwards compatible):**
```svelte
<Input label="Email Address" help="We'll never share your email" />
<Card title="Settings" subtitle="Configure your preferences" />
```

**Snippet for rich content:**
```svelte
<Input>
  {#snippet label()}
    <span>Email <span class="required">*</span></span>
  {/snippet}
</Input>

<Card>
  {#snippet title()}
    <span class="icon">⚙️</span> Settings
  {/snippet}
</Card>
```

**Options with Snippets:**
```svelte
<script>
  const options = [
    { value: 'home', label: 'Home' },
    { value: 'settings', label: settingsSnippet }
  ];
</script>

{#snippet settingsSnippet()}
  <span class="icon">⚙️</span> Settings
{/snippet}

<Radio name="nav" {options} />
```

### Components Supporting StringOrSnippet

**Form Components:**
- `Input`, `NumberInput`, `Textarea`: `label`, `help`
- `Switch`: `label`
- `Range`: `label`, `help`
- `Select`, `MultiSelect`, `AdvancedSelect`: `label`, `help`, `options[].label`
- `Radio`: `label`, `help`, `options[].label`
- `Toggle3State`: `options[].label`

**Container Components:**
- `Card`: `title`, `subtitle`
- `Modal`: `title`
- `Popover`: `content`

**Navigation Components:**
- `Tabs`, `VerticalTabs`: `tabs[].label`
- `Accordion`: `items[].title`

**Data Display:**
- `Table`: `columns[].label`
- `Toast`: `toasts[].title`, `toasts[].message`

**Action Components:**
- `DoubleOptInButton`: `defaultLabel`, `confirmLabel`

### Helper Utility

Use `isSnippet()` to check content type:

```typescript
import { isSnippet } from './utils/renderContent';

// In template:
{#if isSnippet(label)}
  {@render label()}
{:else}
  {label}
{/if}
```

### Notes

- **Backwards compatible**: Existing string usage works unchanged
- **Native `<select>` limitation**: Option labels in `Select.svelte` fall back to `value` when Snippets are used (native `<option>` cannot contain HTML). Use `AdvancedSelect` for rich option labels.
- **Search filtering**: In searchable components (MultiSelect, AdvancedSelect), search only works on string labels. Snippet labels are not searchable.
- **Accessibility**: Aria labels automatically fall back to string values or the option's `value` when Snippets are used.