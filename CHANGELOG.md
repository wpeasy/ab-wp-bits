# Changelog

All notable changes to Alan Blair's WP Bits will be documented in this file.

## [1.0.1] - 2026-02-03

### Added
- **Split Menu - Default Label**: New text control to set default text for Selected Item Label when no menu item is active
- **Split Menu - Top Level Label Only**: New switch to only update the label for Level 1 items; deeper levels keep the parent label
- **Split Menu - data-current-label**: Root element now has `data-current-label` attribute reflecting active item text (removed when no item active)

### Changed
- **Split Menu Controls**: Reorganized control order for better UX (Default Label first, Trigger after Show All Levels)

### Removed
- **Split Menu - Default State**: Removed unused control that auto-activated first item on page load

---

## [1.0.0] - 2026-02-02

### Official Release

First stable release of Alan Blair's WP Bits.

### Added
- **GitHub Auto-Updates**: Automatic plugin updates from the public GitHub repository via WordPress native update system
  - Checks GitHub releases API for newer versions (12-hour cache)
  - Integrates with Plugins page "View details" popup with changelog
  - Fixes GitHub ZIP directory naming for seamless upgrades
  - No authentication required (public repo)

---

## [0.0.9-beta] - 2026-02-01

### Added
- **Bricks Split Menu Module**: New 5-element nestable architecture for splitting WordPress menus into separate level-based structures
  - **Split Menu Wrapper**: Root element with all settings (menu selection, trigger mode, submenu icon)
  - **Split Menu Nav**: Nestable `<nav>` wrapper for layout flexibility
  - **Menu Level Wrapper**: Nestable wrapper per menu depth level with slide-in transitions
  - **Menu Level**: Renders `<ul>/<li>/<a>` items with full ARIA menu roles
  - **Selected Item Label**: Displays active item text with configurable HTML tag (h1-h6, div, span, p), optional icon, and animated transitions
- **Keyboard Accessibility (A11y)**:
  - Hover mode: focus-visible activates items the same as mouse hover
  - Click mode: Enter/Space activates submenus on parent items
  - Arrow Right/Left navigates between menu levels (into child, back to parent)
  - Arrow Up/Down navigates siblings within a level with wrapping
  - Focus-out deactivation mirrors mouse-leave behaviour
- **Show All Levels**: Toggle to make all menu levels visible for styling in the builder
- **CSS Visibility**: Menu Levels with no active children are hidden with `visibility: hidden` to preserve grid layout
- **WPEA Library**: Restructured upstream reference into `Components/` and `Icons/` subdirectories with shared trait pattern
- **Documentation**: Added BRICKS_NOTES.md, CODE_STANDARDS.md, and module definition files

### Changed
- **WPEA Svelte Components**: Migrated all components from flat upstream copies to app-specific working library in `admin/svelte/src/lib/`
- **Svelte Build**: Updated Vite configs and TypeScript configuration for improved module builds
- **Dashboard**: Updated module registration to include Bricks Split Menu

### Fixed
- **Show All Levels**: Fixed specificity conflict where CSS `:has()` rule overrode the toggle — scoped hiding rule to `:not([data-show-all-levels])`
- **Builder Preview**: Removed unconditional builder overrides that prevented Show All Levels toggle from working correctly
- **AJAX Re-renders**: Added persistent static context so child elements survive Bricks builder AJAX re-renders without showing placeholders

## [0.0.8-beta] - 2025-12-10

### Fixed
- **WPEA Library Update**: Updated CSS and Svelte components from latest framework
- **TypeScript Errors**: Fixed type mismatches in QueryBuilderModal:
  - Changed `SelectOption.value` from `string | number` to `string`
  - Added `danger` variant to `ButtonVariant` type
  - Replaced `Input type="number"` with `NumberInput` component
  - Fixed array type conversions for include/exclude fields
- **Switch Component**: Added `help` prop support with display
- **VerticalTabs**: Fixed content not rendering after framework update
- **Settings Dropdown Position**: Moved to top-right of content area
- **Include/Exclude Taxonomies**: Fixed empty dropdown by fetching terms for all query types

### Changed
- **Shadow Variables**: Added `--wpea-shadow--sm` and `--wpea-shadow--lg` aliases in framework CSS
- **Dark Mode CSS**: Removed outdated dark mode CSS from QueryBuilderModal (now handled by `light-dark()` function)

## [0.0.7-beta] - 2025-12-09

### Added
- **Settings Dropdown**: New settings gear icon in admin panel header with:
  - Compact Mode toggle for reduced spacing/typography
  - Theme toggle (Light/Dark/Auto) with icon-only buttons and popovers
- **Global State**: Settings persist to localStorage and sync across app instances
- **Dark Mode Support**: Full dark mode support for all admin components including modals

### Fixed
- **Customizer Modals**: Fixed modals not opening in Customize → Menus after framework update
- **Input Focus States**: Fixed input fields not respecting dark mode in focused/selected state
- **Card Borders**: Ensured card borders are visible in dark mode
- **Toggle3State Popovers**: Fixed popovers persisting after click (now hover-only)
- **Query Builder Modal**: Changed from fullscreen to large size to restore proper border styling

### Changed
- **VerticalTabs**: Restructured to support actions area in header (for settings dropdown)
- **Modal Component**: Now reads settings from localStorage for theme/compact mode support in separate bundles

### Technical Notes
- Global state uses `ab-wp-bits-settings` localStorage key
- Cross-app state sharing via `window.wpeaAppState` and custom events
- Modal reads localStorage directly to avoid bundling issues with globalState import

## [0.0.6-beta] - 2025-12-08

### Fixed
- **Select2 Isolation**: Added isolation for external Select2 conflicts (WIP)
- **Add Condition Error**: Fixed error by replacing MultiSelect with AdvancedSelect
- **Select Styling**: Replaced native Select with AdvancedSelect for better styling
- **WPEA Framework**: Updated to latest version
- **Select/Number Input**: Fixed dropdown and number input visibility issues

## [0.0.5-beta] - 2025-12-08

### Added
- **Menu Queries**: "Include This ID" feature - when "Child of" field has a value > 0, displays a switch to include the parent item as the first menu item with query results as children
- **Menu Queries**: New `get_parent_item_data()` method to fetch parent post/term details dynamically
- **UI**: Modal border-radius added to Query Builder modal for visual consistency with other modals

### Changed
- **Compatibility**: Updated "Tested up to" from 6.7 to 6.9 (latest WordPress version)

### Technical Details
- New `includeParentItem` boolean property in QueryConfig TypeScript type
- Conditional Switch component in Svelte that only displays when childOf > 0
- PHP backend extracts `includeParentItem` from query configuration
- Creates proper WordPress nav menu structure with parent-child relationships
- Handles both post type and taxonomy queries

## [0.0.4-beta] - 2025-12-08

### Fixed
- **Critical**: Menu Queries meta box now visible in Appearance → Menus on fresh installations
- **Menu Queries**: Changed hook from `admin_menu` to `load-nav-menus.php` for proper meta box registration
- **Menu Queries**: Removed `hide-if-js` class via JavaScript to make meta box visible by default
- **Menu Queries**: Cleared description field to prevent query config JSON from displaying in frontend menus
- **Hook Timing**: Moved hook registration from `run()` to `register()` method for earlier execution

### Technical Notes
- WordPress requires nav menu meta boxes to use `load-nav-menus.php` hook, not `admin_menu`
- Custom nav menu meta boxes have `hide-if-js` class by default (controlled by Screen Options)
- Query configuration stored in description field is now cleared before frontend rendering

## [0.0.3-beta] - 2025-12-08

### Added
- **Dashboard**: Alphabetical sorting for module tabs and module lists
- **Dashboard**: Visual separator under Module Manager tab
- **Documentation**: Comprehensive CSS variable validation rules in WPEA CLAUDE.md
- **Documentation**: Complete list of available WPEA CSS variables with examples

### Changed
- **Dashboard**: Module Manager always appears first with underline separator
- **Dashboard**: All modules sorted alphabetically by name
- **WPEA Integration**: Changed from `.wpea` to `.wpea-scope` for proper variable inheritance

### Fixed
- **Critical**: Fixed all 8 hallucinated CSS variables (--wpea-color--surface, --wpea-color--border, etc.)
- **Critical**: Replaced invented variables with actual WPEA framework variables
- **CSS Variables**: --wpea-color--surface → --wpea-surface--bg
- **CSS Variables**: --wpea-color--surface-raised → --wpea-surface--panel
- **CSS Variables**: --wpea-color--border → --wpea-surface--border
- **CSS Variables**: --wpea-color--border-subtle → --wpea-surface--divider
- **CSS Variables**: Success/danger backgrounds now use color-mix() with actual variables
- **Svelte 5**: Fixed state mutation error by using .toSorted() instead of .sort()
- **Tab Separator**: Added !important and higher specificity to ensure visibility

## [0.0.2-beta] - 2025-12-08

### Added
- **Menu Queries**: "Show Default Menu Item" setting - keeps original menu item and makes generated items children
- **Menu Queries**: "Show Label on Empty Results" setting - control label visibility when query returns no results
- **Menu Conditions**: Instructions tab with comprehensive in-app documentation
- **Dashboard**: Lazy loading for module Settings/Instructions to keep DOM clean
- **Documentation**: Created MENU_CONDITIONS.md with complete module documentation
- **Documentation**: Created MENU_QUERIES.md with complete module documentation

### Changed
- **Menu Queries**: Moved "Empty Results" panel to top of Query Builder and renamed to "Settings"
- **Menu Queries**: Navigation Label preservation - only auto-generates title when it's "Query Item" or empty
- **Dashboard**: Module icons now use secondary color instead of primary color

### Fixed
- **Menu Queries**: Settings switches (Show Label on Empty, Show Default Menu Item) now persist correctly after Publish/Reload
- **Menu Queries**: UI-only properties now properly saved and loaded from rawWPQuery JSON
- **Menu Conditions**: Module now appears in dashboard tabs with Settings/Instructions buttons

## [0.0.1-beta] - Initial Release

### Added
- Initial plugin structure with modular architecture
- Module Manager with enable/disable functionality
- Menu Queries module for dynamic menu generation
- Menu Conditions module for capability-based menu visibility
- Svelte 5 admin interface with wpea framework
- WordPress Customizer integration
