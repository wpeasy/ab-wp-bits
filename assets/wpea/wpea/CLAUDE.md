# CLAUDE.md — WP Easy Admin Framework

## Files
- wpea-framework.css - main framework file
- wpea-wp-resets.css - resets to overcome default WP Admin styles
- test-ui.html - Sample HTML for usage of the framework for admin UI

## ⚠️ CRITICAL: CSS Variable Usage

**NEVER invent or hallucinate CSS variable names. ONLY use variables that are actually defined in wpea-framework.css.**

### How to Use CSS Variables Correctly

1. **Before using ANY CSS variable**, verify it exists in `wpea-framework.css`
2. **Search the framework file** for the exact variable name
3. **If a variable doesn't exist**, use one of these alternatives:
   - Find a similar existing variable
   - Use `color-mix()` to create derived colors (see examples below)
   - Ask the user for clarification

### Common Mistakes to AVOID

❌ **DO NOT invent these (they don't exist):**
- `--wpea-color--surface` (use `--wpea-surface--bg`)
- `--wpea-color--surface-raised` (use `--wpea-surface--panel`)
- `--wpea-color--border` (use `--wpea-surface--border`)
- `--wpea-color--border-subtle` (use `--wpea-surface--divider`)
- `--wpea-color--success-bg` (use `color-mix()` - see below)
- `--wpea-color--success-text` (use `--wpea-surface--text`)
- `--wpea-color--danger-bg` (use `color-mix()` - see below)
- `--wpea-color--danger-text` (use `--wpea-surface--text`)

### Available Variable Categories

**Surface Colors:**
- `--wpea-surface--bg` - Background color
- `--wpea-surface--panel` - Raised panel/card background
- `--wpea-surface--muted` - Muted background
- `--wpea-surface--border` - Border color
- `--wpea-surface--divider` - Subtle divider line
- `--wpea-surface--text` - Text color on surfaces
- `--wpea-surface--text-muted` - Muted text color
- `--wpea-surface--elev-1`, `--wpea-surface--elev-2`, `--wpea-surface--elev-3` - Elevation levels

**Brand Colors:**
- `--wpea-color--primary` - Primary brand color
- `--wpea-color--secondary` - Secondary brand color
- `--wpea-color--neutral` - Neutral color

**Semantic Colors:**
- `--wpea-color--success` - Success color
- `--wpea-color--warning` - Warning color
- `--wpea-color--danger` - Danger/error color
- `--wpea-color--info` - Info color

**Text Colors:**
- `--wpea-color--text` - Main text color
- `--wpea-color--text-muted` - Muted text
- `--wpea-color--heading` - Heading text

**Input Colors:**
- `--wpea-input--bg` - Input background
- `--wpea-input--border` - Input border
- `--wpea-input--border-hover` - Input border on hover
- `--wpea-input--border-focus` - Input border on focus
- `--wpea-input--placeholder` - Placeholder text

**Spacing:**
- `--wpea-space--xs`, `--wpea-space--sm`, `--wpea-space--md`, `--wpea-space--lg`, `--wpea-space--xl`, `--wpea-space--2xl`

**Radius:**
- `--wpea-radius--sm`, `--wpea-radius--md`, `--wpea-radius--lg`, `--wpea-radius--xl`

### Using color-mix() for Derived Colors

When you need a tinted background (like alert boxes), use `color-mix()` instead of inventing variables:

**✅ CORRECT - Using color-mix():**
```css
.alert-success {
  background: color-mix(in oklab, var(--wpea-color--success), transparent 85%);
  border-color: var(--wpea-color--success);
  color: var(--wpea-surface--text);
}

.alert-danger {
  background: color-mix(in oklab, var(--wpea-color--danger), transparent 85%);
  border-color: var(--wpea-color--danger);
  color: var(--wpea-surface--text);
}
```

**❌ WRONG - Inventing variables:**
```css
.alert-success {
  background: var(--wpea-color--success-bg); /* DOESN'T EXIST */
  color: var(--wpea-color--success-text); /* DOESN'T EXIST */
}
```

### Verification Checklist

Before writing ANY CSS variable:

1. ✅ Open `wpea-framework.css`
2. ✅ Search for the exact variable name (e.g., `--wpea-surface--border`)
3. ✅ Confirm it exists in the file
4. ✅ If it doesn't exist, use an alternative or `color-mix()`
5. ✅ Never assume a variable exists based on naming patterns

## Class Usage

### `.wpea` vs `.wpea-scope`

**Use `.wpea-scope` when:**
- You need access to WPEA CSS variables and typography
- You're building meta boxes, settings sections, or small UI components
- You don't want layout constraints (`min-height: 100vh`, `display: flex`)

**Use `.wpea` when:**
- You're building a full-page layout
- You want the page to fill the viewport (`min-height: 100vh`)
- You want flexbox column layout (`display: flex; flex-direction: column`)

**Example:**
```html
<!-- Meta box - use .wpea-scope -->
<div id="my-meta-box" class="wpea-scope">
  <p class="wpea-text-muted">Settings for this feature</p>
  <button class="wpea-btn wpea-btn--primary">Save</button>
</div>

<!-- Full page - use .wpea -->
<div class="wpea">
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</div>
```

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
