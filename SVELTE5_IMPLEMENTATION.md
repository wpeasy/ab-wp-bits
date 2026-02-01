# Svelte 5 Implementation Guide

> Implementation patterns and conventions for Svelte 5 in the Keyboard Shortcut Generator plugin

This plugin uses **Svelte 5** for the admin UI. This guide covers key patterns and conventions specific to Svelte 5.

---

## Mounting Components

Use Svelte 5's `mount()` function instead of the legacy `new Component()` syntax:

```javascript
import { mount } from 'svelte';
import App from './App.svelte';

// Mount to a DOM element
const app = mount(App, {
  target: document.getElementById('wpea-app'),
  props: {
    initialData: { /* ... */ }
  }
});
```

**Reference:** [Svelte 5 Docs - Imperative component API](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes)

---

## Runes System

Svelte 5 replaces stores and reactive statements with **runes** - a new reactivity primitive:

### `$state` - Reactive State
```javascript
let count = $state(0);
let settings = $state({ theme: 'auto', density: 'comfy' });
let listeners = $state([]);
```

### `$derived` - Computed Values
```javascript
let doubled = $derived(count * 2);
let isDarkTheme = $derived(settings.theme === 'dark');
let activeListeners = $derived(listeners.filter(l => l.enabled));
```

### `$effect` - Side Effects (replaces onMount/afterUpdate)
```javascript
$effect(() => {
  // Runs when dependencies change
  document.documentElement.setAttribute('data-color-scheme', settings.theme);

  // Optional cleanup
  return () => {
    // Cleanup logic (e.g., remove event listeners)
  };
});
```

### `$props` - Component Props
```javascript
let { initialData, onSave } = $props();
```

**Reference:** [Svelte 5 Docs - Runes](https://svelte.dev/docs/svelte/what-are-runes)

---

## Lifecycle Methods

Svelte 5 consolidates lifecycle into `$effect`:

| Svelte 4 | Svelte 5 |
|----------|----------|
| `onMount(() => { ... })` | `$effect(() => { ... })` |
| `afterUpdate(() => { ... })` | `$effect(() => { ... })` (runs on changes) |
| `beforeUpdate(() => { ... })` | `$effect.pre(() => { ... })` |
| `onDestroy(() => { ... })` | `$effect(() => { return () => { ... } })` (cleanup) |

**Important:** `$effect` runs both on mount AND when dependencies change. For mount-only logic:

```javascript
$effect(() => {
  // This runs on mount and when dependencies change
  console.log('Reactive:', settings.theme);
});

// For mount-only (no reactivity):
$effect(() => {
  console.log('Mount only - initialize keyboard listener');
  // Don't reference any reactive state
});
```

**Reference:** [Svelte 5 Docs - $effect](https://svelte.dev/docs/svelte/$effect)

---

## Theme Integration

Apply wpea theme to the root element using `$effect`:

```javascript
let settings = $state({ theme: 'auto' });

$effect(() => {
  const root = document.documentElement;

  // Remove existing theme
  root.removeAttribute('data-color-scheme');

  if (settings.theme === 'light') {
    root.setAttribute('data-color-scheme', 'light');
  } else if (settings.theme === 'dark') {
    root.setAttribute('data-color-scheme', 'dark');
  }
  // Auto mode: no attribute - let CSS media query handle it
});
```

**Theme Modes:**
- **Auto:** No `data-color-scheme` attribute - respects OS preference via `@media (prefers-color-scheme: dark)`
- **Light:** `data-color-scheme="light"` on `<html>` element
- **Dark:** `data-color-scheme="dark"` on `<html>` element OR `.wpea-dark` class

---

## Event Handling

Svelte 5 simplifies event syntax (no `on:` prefix needed in many cases):

```svelte
<!-- Old Svelte 4 -->
<button on:click={handleClick}>Click</button>

<!-- New Svelte 5 -->
<button onclick={handleClick}>Click</button>
```

For custom events, use callbacks via props:

```svelte
<!-- Parent.svelte -->
<KeyboardDialog onShortcutCapture={(combo) => addListener(combo)} />

<!-- KeyboardDialog.svelte -->
<script>
let { onShortcutCapture } = $props();
</script>
<button onclick={() => onShortcutCapture({ key: 'K', ctrl: true })}>
  Capture
</button>
```

**Reference:** [Svelte 5 Docs - Event handlers](https://svelte.dev/docs/svelte/v5-migration-guide#Event-changes)

---

## Class Bindings

Class bindings remain similar but work better with runes:

```svelte
<div class="wpea-tab" class:wpea-tab--active={isActive}>
  Tab
</div>

<!-- With $derived -->
<script>
let isActive = $derived(activeTab === 'shortcuts');
</script>
```

---

## Conditional Rendering

Template syntax remains the same:

```svelte
{#if activeTab === 'shortcuts'}
  <div class="wpea-tab-content wpea-tab-content--active">
    Shortcuts content
  </div>
{/if}
```

**Alternative approach** (better for animations):

```svelte
<!-- All content rendered, visibility controlled by CSS -->
<div class="wpea-tab-content" class:wpea-tab-content--active={activeTab === 'shortcuts'}>
  Shortcuts content
</div>

<div class="wpea-tab-content" class:wpea-tab-content--active={activeTab === 'settings'}>
  Settings content
</div>
```

This approach enables smooth fade-in animations defined in wpea-framework.css.

---

## Common Patterns for This Plugin

### Toggle Listener State
```javascript
let listeners = $state([
  { id: 1, combo: 'Ctrl+K', enabled: true, scope: 'admin' }
]);

function toggleListener(id) {
  const listener = listeners.find(l => l.id === id);
  if (listener) listener.enabled = !listener.enabled;
}
```

### Keyboard Event Capture
```javascript
let capturedKeys = $state({ ctrl: false, shift: false, key: '' });

function handleKeyDown(e) {
  e.preventDefault();
  capturedKeys = {
    ctrl: e.ctrlKey,
    shift: e.shiftKey,
    alt: e.altKey,
    meta: e.metaKey,
    key: e.key
  };
}
```

### Auto-save Settings
```javascript
let settings = $state({ theme: 'auto', globalTester: true });
let saveStatus = $state('saved'); // 'saving' | 'saved' | 'error'

$effect(() => {
  // Watch for changes
  const settingsJson = JSON.stringify(settings);

  // Debounce and save
  saveStatus = 'saving';

  fetch('/wp-json/kbd-shortcut/v1/settings', {
    method: 'POST',
    body: settingsJson
  }).then(() => {
    saveStatus = 'saved';
  });
});
```

---

## Migration Notes

When migrating from Svelte 4 to Svelte 5:

1. Replace `let count = 0` reactive variables with `let count = $state(0)`
2. Replace `$: doubled = count * 2` with `let doubled = $derived(count * 2)`
3. Replace `onMount()`, `afterUpdate()` with `$effect()`
4. Replace `export let prop` with `let { prop } = $props()`
5. Update event handlers from `on:click` to `onclick`
6. Test all `$effect` dependencies to ensure proper reactivity

**Reference:** [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)

---

## WordPress Integration

### Enqueuing Svelte Scripts in WordPress

**IMPORTANT:** This plugin requires WordPress 6.5+ and uses ES modules via `wp_enqueue_script_module()`.

```php
// 1. Enqueue the script as an ES module
wp_enqueue_script_module(
    'my-svelte-app',
    PLUGIN_URL . 'admin/svelte/dist/main.js',
    [],
    PLUGIN_VERSION
);

// 2. Pass data via inline script (wp_localize_script does NOT work with modules)
// Modules are deferred, so inline scripts always execute first.
add_action('admin_print_footer_scripts', static function(): void {
    $data = [
        'apiUrl'  => rest_url('my-plugin/v1'),
        'nonce'   => wp_create_nonce('wp_rest'),
        'settings' => get_option('my_settings', []),
    ];
    wp_print_inline_script_tag('window.myAppData = ' . wp_json_encode($data) . ';');
}, 1);
```

**Key Points:**
- Use `wp_enqueue_script_module()` — NOT `wp_enqueue_script()` — for Svelte apps
- `wp_localize_script()` and `wp_add_inline_script()` do NOT work with script modules
- Pass data via `wp_print_inline_script_tag()` in a footer scripts hook
- ES modules are always deferred, so inline `<script>` tags in the footer execute first
- Data becomes available as `window.myAppData` in JavaScript
- For Customizer pages, use `customize_controls_print_footer_scripts` instead of `admin_print_footer_scripts`

### Build Configuration for WordPress

Use **ES module format** for code splitting and modern module loading (requires WordPress 6.5+):

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/main.ts',
      output: {
        entryFileNames: 'main.js',
        assetFileNames: '[name][extname]',
        format: 'es'
      }
    }
  }
});
```

**Why ES Modules:**
- `wp_enqueue_script_module()` (WordPress 6.5+) handles `type="module"` and import maps
- Enables automatic code splitting — lazy-loaded chunks for tabs/modals
- WordPress import maps resolve chunk paths correctly (no `?ver=` issues)
- Each module has its own entry point so disabled modules don't load unnecessary code

### Multiple Svelte Apps

For multiple entry points, create separate build configs:

```typescript
// vite.config.ts - Main app
export default defineConfig({
  /* ... */
  rollupOptions: {
    input: 'src/main.ts',
    output: {
      entryFileNames: 'main.js',
      format: 'es'
    }
  }
});

// vite.secondary.config.ts - Secondary app
export default defineConfig({
  /* ... */
  build: {
    emptyOutDir: false,  // Don't clear dist folder
    rollupOptions: {
      input: 'src/secondary-main.ts',
      output: {
        entryFileNames: 'secondary.js',
        format: 'es'
      }
    }
  }
});
```

Update `package.json`:
```json
{
  "scripts": {
    "build": "vite build && vite build --config vite.secondary.config.ts"
  }
}
```

### Accessing WordPress Data in Svelte

```typescript
// main.ts
const { apiUrl, nonce, settings } = window.myAppData;

// Use in components
fetch(`${apiUrl}/endpoint`, {
  headers: {
    'X-WP-Nonce': nonce
  }
});
```

---

## Common Pitfalls

### ❌ DON'T: Use wp_enqueue_script for ES modules
```php
// WRONG - wp_enqueue_script doesn't add type="module"
wp_enqueue_script('my-app', 'path/to/app.js', [], '1.0', true);
```

### ✅ DO: Use wp_enqueue_script_module
```php
// CORRECT - WordPress 6.5+ handles module loading and import maps
wp_enqueue_script_module('my-app', 'path/to/app.js', [], '1.0');
```

### ❌ DON'T: Use wp_localize_script with modules
```php
// WRONG - wp_localize_script does NOT work with wp_enqueue_script_module
wp_enqueue_script_module('my-app', 'path/to/app.js', [], '1.0');
wp_localize_script('my-app', 'myAppData', ['key' => 'value']);
```

### ✅ DO: Use inline script tags for module data
```php
// CORRECT - output data before modules execute
wp_enqueue_script_module('my-app', 'path/to/app.js', [], '1.0');
add_action('admin_print_footer_scripts', static function(): void {
    wp_print_inline_script_tag('window.myAppData = ' . wp_json_encode(['key' => 'value']) . ';');
}, 1);
```

### ❌ DON'T: Use runes in TypeScript files
```typescript
// main.ts - WRONG
let modalOpen = $state(false);  // Error: $state is not defined
```

**Why:** Svelte runes (`$state`, `$derived`, `$effect`, `$props`) only work inside `.svelte` files. They're compile-time syntax that gets transformed by the Svelte compiler.

### ✅ DO: Use runes in .svelte files and communicate via events
```svelte
<!-- App.svelte - CORRECT -->
<script lang="ts">
  let modalOpen = $state(false);  // Works in .svelte files

  // Listen for custom events from TypeScript
  $effect(() => {
    const handleOpen = () => { modalOpen = true; };
    document.addEventListener('my-app:open', handleOpen);
    return () => document.removeEventListener('my-app:open', handleOpen);
  });
</script>
```

```typescript
// main.ts - CORRECT
import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });

// Trigger actions via custom events
document.getElementById('btn').addEventListener('click', () => {
  document.dispatchEvent(new CustomEvent('my-app:open'));
});
```
