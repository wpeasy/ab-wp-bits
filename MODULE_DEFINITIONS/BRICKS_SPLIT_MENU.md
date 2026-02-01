# Bricks Split Menu

**Name**: Bricks Split Menu
**Description**: Splits a WordPress Menu into separate level-based structures using nested Bricks components, allowing each menu level to be placed in independent blocks for advanced animation and layout control
**Settings**: None
**Logo**: Create a basic square logo for testing

# Bricks Elements

## Parent Element: Split Menu (`ab-split-menu`)

The container element where the WordPress Menu is selected. All child elements inherit the menu data.

### Controls
- **Menu**: WordPress Menu selector (dropdown of registered menus)
- **Trigger**: Hover or Click (how submenu activation is triggered)
- **Default State**: None or First Item Active (whether the first top-level item's submenu is shown on page load)
- **Has Submenu SVG**: SVG code input — an icon appended after the link text of any menu item that has children (e.g., a chevron/arrow indicator). If empty, no indicator is rendered.

### Behaviour
- Renders as a wrapper `<div>` with class `ab-split-menu`
- Passes the full parsed menu tree to child elements via a shared context
- Adds state classes to itself based on which submenu levels are active:
  - `level2-active` — a level 2 submenu is visible
  - `level3-active` — a level 3 submenu is visible
  - `levelN-active` — and so on for deeper levels

## Child Element: Menu Level (`ab-split-menu-level`)

Each child element represents one level of the menu hierarchy. Multiple children are nested inside the parent, one per level.

### Controls
- **Level**: Auto-detected based on nesting depth (1 = top-level items, 2 = sub-items, etc.)
  - Level is determined by the element's position in the nested component hierarchy, not manually set

### Behaviour
- Renders semantic markup: `<nav>` (level 1 only) wrapping `<ul>` / `<li>` / `<a>` elements
- Level 2+ renders `<ul>` / `<li>` / `<a>` without an outer `<nav>`
- Each `<li>` gets:
  - `ab-split-menu__item`
  - `ab-split-menu__item--has-children` if it has sub-items
  - `ab-split-menu__item--active` when it is the currently selected/hovered item
  - `current-menu-item` when the item matches the current page (standard WordPress class)
- Each `<a>` gets:
  - `ab-split-menu__link`
  - If the item has children and the parent's **Has Submenu SVG** is set, a `<span class="ab-split-menu__submenu-icon">` containing the SVG is appended inside the `<a>` after the link text

# Frontend Functionality

## Interaction Model

- **Trigger: Hover** — hovering over a menu item that has children activates its submenu level. The submenu icon (`ab-split-menu__submenu-icon`) is always clickable regardless of trigger mode, so touch devices can activate submenus even when the trigger is set to hover.
- **Trigger: Click** — clicking a menu item that has children activates its submenu level
- Parent menu items with children do **not** navigate to their URL — they only reveal the submenu
- Parent menu items without children navigate normally

## State Management (JavaScript)

A lightweight vanilla JS script manages the active state across levels:

1. When a menu item with children is activated (hover or click depending on trigger setting):
   - The corresponding submenu level element gets:
     - `visibility: visible`
     - `opacity: 1`
     - Class `active` added
   - The activated menu item gets class `ab-split-menu__item--active`
   - The parent `ab-split-menu` element gets `levelN-active` class (where N = the submenu's level)

2. When deactivated:
   - The submenu level element gets:
     - `visibility: hidden`
     - `opacity: 0`
     - Class `active` removed
   - The item loses `ab-split-menu__item--active`
   - The parent loses the corresponding `levelN-active` class
   - All deeper levels are also deactivated (cascading close)

3. **Default State** options:
   - **None**: All sub-levels start hidden
   - **First Item Active**: The first top-level item's submenu chain is shown on page load

## CSS Classes Summary

| Class | Applied To | When |
|-------|-----------|------|
| `ab-split-menu` | Parent wrapper | Always |
| `level2-active` | Parent wrapper | A level 2 submenu is visible |
| `level3-active` | Parent wrapper | A level 3 submenu is visible |
| `levelN-active` | Parent wrapper | A level N submenu is visible |
| `ab-split-menu__item` | `<li>` | Always |
| `ab-split-menu__item--has-children` | `<li>` | Item has sub-items |
| `ab-split-menu__item--active` | `<li>` | Item's submenu is currently shown |
| `ab-split-menu__link` | `<a>` | Always |
| `ab-split-menu__submenu-icon` | `<span>` inside `<a>` | Item has children and SVG is set |
| `active` | Menu Level element | Its level is currently visible |
| `current-menu-item` | `<li>` | Standard WordPress current page class |

## Rendering

- Menu data is fetched server-side via `wp_get_nav_menu_items()` and structured into a tree
- Each Menu Level element filters the tree for its depth and renders only the relevant items
- Level 2+ elements only render items that are children of the currently active item at the previous level
- The frontend JS is enqueued only when the Split Menu element is present on the page

# Scope

- **Bricks Editor**: Elements appear in the Bricks element panel, preview shows all levels for editing
- **Frontend**: Full interactive behaviour with hover/click triggers and state classes
