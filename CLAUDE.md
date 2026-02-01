# Alan Blair's WP Bits — CLAUDE.md

> **Master Documentation File**: This file defines the project identity and high-level architecture. All supplementary files listed below are **required reading** when implementing code.

## Required Reading

Always reference these files alongside this one:

1. **@WP_PLUGIN.md** — WordPress plugin headers, metadata, and versioning rules
2. **@SVELTE5_IMPLEMENTATION.md** — Svelte 5 patterns, runes system, and component implementation
3. **@CODE_STANDARDS.md** — PHP, JavaScript, CSS, security, REST API, and all coding conventions
4. **@BRICKS_NOTES.md** — Bricks Builder integration, Vue state access, element/class APIs

---

## Project Identity

- **Plugin Name**: Alan Blair's WP Bits
- **Namespace**: `AB\AB_WP_Bits`
- **Constants Prefix**: `AB_WP_BITS_`
- **Text Domain**: `ab-wp-bits`

---

## Core Principles

> **DRY (Don't Repeat Yourself) is non-negotiable.** Every piece of knowledge, logic, or configuration must have a single, authoritative source in the codebase.

- **Never duplicate logic.** If the same behaviour exists in more than one place, extract it into a shared function, utility, component, or service.
- **Centralise shared code.** Helpers, API clients, state management, type definitions, and constants must live in a single shared location and be imported wherever needed.
- **Reuse before creating.** Before writing anything new, check the WPEA component library, shared utilities, and existing codebase for something that already does what you need.
- **Single source of truth.** Configuration, settings defaults, type definitions, and business rules must each be defined once and referenced everywhere else.
- **Refactor toward DRY.** When touching code that has existing duplication, consolidate it as part of the change.

---

## Purpose

Alan Blair's WP Bits is a collection of modular enhancements for WordPress.
Each module is self-contained, can be toggled on or off, and may optionally expose its own configuration panel in the admin interface.

## Functionality

### Admin Functionality
- A **tab-based dashboard** inside the WordPress Admin using Svelte 5 and WPEA.
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

## WPEA Framework

- **Source**: https://github.com/wpeasy/wpeasy-admin-framework (branch: master)
- **CSS files**: `assets/wpea/css/`
- **Upstream reference**: `assets/wpea/svelte-lib/` — read-only reference copy of upstream components
- **Working library**: `admin/svelte/src/lib/` — our own editable copies of WPEA components
- **Framework docs**: `assets/wpea/CLAUDE.md`
- Use this framework as the basis for all Admin CSS and Svelte components.
- Always check whether a Svelte component exists in the lib before creating a custom implementation.

### Component Library Copy Pattern

All WPEA components used by the application **must be copied** into `admin/svelte/src/lib/` (our working library). Application code imports from `./lib/` only — never directly from `assets/wpea/svelte-lib/`.

- **`assets/wpea/svelte-lib/`** — upstream reference only. Used to sync updates from the WPEA framework. Never imported at runtime by application code.
- **`admin/svelte/src/lib/`** — our working copies. These can be modified or extended for app-specific needs (e.g., Modal has local compact mode logic, VerticalTabs has separator support, Card has dark mode border styling).
- When syncing updates from upstream, compare upstream and local files, then merge changes while preserving any local customizations (extra props, style blocks, app-specific logic).
- Import paths differ: upstream components use `../types` and `../utils/renderContent` (from a `Components/` subdirectory), while our local copies use `./types` and `./utils/renderContent` (flat structure).

### WPEA Class Usage
- Use `.wpea-scope` for components that need access to WPEA variables/typography without layout constraints
- Use `.wpea` only for full-page layouts (sets `min-height: 100vh`, `display: flex`, etc.)
- **Meta boxes, settings sections, small UI components** → use `.wpea-scope`
- **Full admin pages** → use `.wpea` (rarely needed as WordPress provides page wrapper)