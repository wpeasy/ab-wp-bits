# Changelog

All notable changes to Alan Blair's WP Bits will be documented in this file.

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
