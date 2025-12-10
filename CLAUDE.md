# Alan Blair's WP Bits — CLAUDE.md

> **Master Documentation File**: This file contains all coding standards, conventions, and project requirements. When implementing code, always reference this file along with the supplementary documentation specified below.

## Documentation Structure

**This is the master file.** When creating plugin code, also reference:

1. **@WP_PLUGIN.md** — WordPress plugin headers and metadata specifications
2. **@SVELTE5_IMPLEMENTATION.md** — Svelte 5 patterns, runes system, and component implementation

## Purpose
Alan Blair's WP Bits is a collection of modular enhancements for WordPress.
Each module is self-contained, can be toggled on or off, and may optionally expose its own configuration panel in the admin interface.

## Functionality

### Admin Functionality
- A **tab-based dashboard** inside the WordPress Admin using Svelte5 and wpea.
- First tab: **Module Manager**
  - Lists all registered modules.
  - Modules include:
    - Name
    - Description
    - Logo
    - Settings (boolean or null if no settings exist)
  - Toggle: Enable/Disable each module.
- If a module registers settings, the plugin automatically creates a **new tab** for that module's settings page.

### Frontend Functionality
_No frontend functionality at this stage._

---

## Code Style Guidelines

### General
1. All libraries are to be downloaded and served locally.

### PHP Conventions
1. **Namespace**: All classes use the defined namespace: `AB\AB_WP_Bits`
2. **Loading**: Use PSR-4 autoloading with Composer.
3. **Class Structure**:  
   - Classes should be `final`.  
   - WordPress hooks registered only via **static methods**.
4. **Security**:  
   - Every file begins with `defined('ABSPATH') || exit;`
5. **Sanitization**:  
   - Always use appropriate WordPress sanitization functions.
6. **Nonces**:  
   - WordPress nonces for all privileged actions.  
   - Custom nonces for REST API.
7. **Constants**:  
   Prefix: `AB_WP_BITS_`  
   - `AB_WP_BITS_PLUGIN_PATH`  
   - `AB_WP_BITS_PLUGIN_URL`

### Method Patterns
- `init()`: Static method for registering WordPress hooks.
- `render()`, `handle_*()`:  
  Methods responsible for HTML output or request handling.
- Private helpers: prefixed with `_`.
- Comprehensive parameter checking and type validation.

### JavaScript Conventions
1. All JS libraries downloaded and served locally.
2. Use **AlpineJS** where appropriate — initialise via Alpine's `init` event.
3. **Svelte v5** for any advanced reactive admin UI.
   - See **@SVELTE5_IMPLEMENTATION.md** for complete Svelte 5 patterns
   - Use runes system: `$state`, `$derived`, `$effect`, `$props`
   - Mount components with `mount()` function (not `new Component()`)
4. Use **native ES6 only** — never jQuery.
5. For Admin UIs:
   - Tab switching done via JS/CSS (no reloads).
   - Auto-saving of settings on change (no Save button).
   - Status indicator showing save state (Saving… / Saved ✔ / Error).

### CSS
1. Use `@layer` for all **frontend** generated CSS.
   Never use `@layer` in the admin interface.
2. Use nested CSS selectors when appropriate.
3. Prefer **Container Queries** over traditional media queries.
4. WPEA Framework location: https://github.com/wpeasy/wpeasy-admin-framework (branch: master)
   - CSS files are in `assets/wpea/css/`
   - Svelte components are in `assets/wpea/svelte-lib/` (reference library, actual components copied to `admin/svelte/src/lib/`)
   - Use this framework as the basis for all Admin CSS and Svelte components.
5. **WPEA Class Usage:**
   - Use `.wpea-scope` for components that need access to WPEA variables/typography without layout constraints
   - Use `.wpea` only for full-page layouts (sets `min-height: 100vh`, `display: flex`, etc.)
   - **Meta boxes, settings sections, small UI components** → use `.wpea-scope`
   - **Full admin pages** → use `.wpea` (rarely needed as WordPress provides page wrapper)
---

## Security Practices
- REST API: Strict same-origin enforcement.
- Nonce validation on all endpoints.
- **Same-origin enforcement** in REST API.
- Full sanitisation of all user inputs.

---

## WordPress Plugin

**Key Plugin Details:**
- **Plugin Name**: Alan Blair's WP Bits
- **Text Domain**: `ab-wp-bits` (used for all translations)
- **Version**: 0.0.1-beta
- **Namespace**: `AB\AB_WP_Bits`
- **Constants Prefix**: `AB_WP_BITS_`
- **Multisite**: Fully supported from the start (Network: true)
- **Min Requirements**: WordPress 6.0+, PHP 7.4+
- **License**: GPL v2 or later

## WordPress Integration
- Follows full WP Coding Standards.
- Uses WordPress APIs extensively:
  - Settings API  
  - REST API  
  - Custom Post Types  
- Translation-ready (textdomain: `ab-wp-bits`).  
- Hooks into WordPress media library where relevant.
- Fully compatible with WordPress Multisite.
- All code must support Multisite from the start.

---

## Development Features
- CodeMirror 6 integration for CSS editing fields.
- Composer autoloading (PSR-4).
- Graceful UI fallbacks:
  - Alpine optional
  - CSS Editor fallback to textarea
- Extensive error handling and validation throughout.

- always check to see is a Svelte component exists in th eLib before create a custom implementation.