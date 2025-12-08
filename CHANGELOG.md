# Changelog

All notable changes to Alan Blair's WP Bits will be documented in this file.

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
