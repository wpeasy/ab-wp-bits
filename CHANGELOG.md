# Changelog

All notable changes to Alan Blair's WP Bits will be documented in this file.

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
