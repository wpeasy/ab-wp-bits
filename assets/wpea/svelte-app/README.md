# WPE Admin Framework - Svelte 5 Demo App

This is a full-featured Single Page Application demo of the WPE Admin Framework built with **Svelte 5** and **Vite**.

## Features

- Built with Svelte 5 and the new runes system ($state, $derived, $effect)
- TypeScript support
- Reusable Svelte 5 components using snippets (not slots)
- Demonstrates all framework components: Alerts, Badges, Buttons, Cards, Forms, Tables, etc.
- Responsive layout with container queries
- Dark mode support using CSS light-dark() function
- Interactive theme and density switching

## Prerequisites

**Node.js version 20.19+ or 22.12+ is required.**

Check your Node.js version:
```bash
node --version
```

If you need to upgrade, download the latest LTS version from [nodejs.org](https://nodejs.org/)

## Getting Started

1. **Install dependencies:**
   ```bash
   cd svelte-app
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to the URL shown in the terminal (usually http://localhost:5173)

## Project Structure

```
svelte-app/
├── src/
│   ├── lib/                # Svelte 5 components
│   │   ├── Alert.svelte
│   │   ├── Badge.svelte
│   │   ├── Button.svelte
│   │   ├── Card.svelte
│   │   └── types.ts        # TypeScript type definitions
│   ├── App.svelte          # Main demo app
│   ├── app.css             # Demo-specific styles
│   └── main.ts             # App entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Component Usage

All components use **Svelte 5 runes** and **snippets** (not slots). Here are some examples:

### Badge Component
```svelte
<Badge variant="primary">Primary Badge</Badge>
<Badge variant="success">Success</Badge>
```

### Button Component
```svelte
<Button variant="primary" onclick={() => console.log('clicked')}>
  Click Me
</Button>
```

### Card Component with Snippets
```svelte
<Card title="Card Title" subtitle="Card subtitle">
  <p>Card content goes here</p>

  {#snippet actions()}
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Save</Button>
  {/snippet}
</Card>
```

### Alert Component
```svelte
<Alert variant="success">Operation completed successfully!</Alert>
<Alert variant="warning">Please review this action</Alert>
<Alert variant="danger">An error has occurred</Alert>
```

## Key Svelte 5 Features Used

### Runes
- $state() - Reactive local state
- $derived() - Computed values
- $effect() - Side effects and lifecycle
- $props() - Component props (replaces export let)

### Snippets
Snippets replace slots in Svelte 5:
```svelte
{#snippet actions()}
  <button>Action Button</button>
{/snippet}
```

## Theme Switching

The app supports three color schemes:
- **Respect OS**: Follows system preference
- **Light**: Force light mode
- **Dark**: Force dark mode

Theme switching is done via CSS color-scheme property:
```javascript
document.body.style.setProperty('color-scheme', 'light only');  // Light
document.body.style.setProperty('color-scheme', 'dark only');   // Dark
document.body.style.setProperty('color-scheme', 'light dark');  // Auto
```

## Building for Production

```bash
npm run build
```

The built files will be in the dist/ directory.

## Framework Reference

The app uses the WPE Admin Framework CSS from ../wpea/wpea-framework.css.

For more information about the framework, see the main documentation in ../wpea/CLAUDE.md.
