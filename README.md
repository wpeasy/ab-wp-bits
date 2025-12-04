# Alan Blair's WP Bits

A collection of modular enhancements for WordPress with a modern tab-based admin dashboard.

## Description

Alan Blair's WP Bits is a WordPress plugin that provides a modular system for extending WordPress functionality. Each module is self-contained, can be toggled on or off, and may optionally expose its own configuration panel in the admin interface.

## Features

- **Modular Architecture**: Enable/disable modules as needed
- **Modern Admin UI**: Built with Svelte 5 and TypeScript
- **WPEA Framework**: Clean, modern admin interface design
- **REST API**: Secure API with nonce validation and same-origin enforcement
- **Multisite Compatible**: Full support for WordPress Multisite
- **Auto-saving**: Settings save automatically without a save button
- **Tab-based Dashboard**: Clean, organized admin interface

## Requirements

- WordPress 6.0 or higher
- PHP 7.4 or higher
- Composer (for development)
- Node.js 18+ (for development)

## Installation

### Standard Installation

1. Upload the `ab-wp-bits` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Navigate to WP Bits in the WordPress admin menu

### Development Installation

1. Clone the repository
2. Run `composer install` in the plugin directory
3. Navigate to `admin/svelte/` and run `npm install`
4. Build the Svelte app with `npm run build`
5. Activate the plugin in WordPress

## Development

### Building the Svelte Admin App

```bash
cd admin/svelte
npm install
npm run build
```

For development with hot reload:

```bash
npm run dev
```

### Project Structure

```
ab-wp-bits/
├── admin/svelte/           # Svelte 5 + TypeScript admin app
│   ├── src/
│   │   ├── App.svelte      # Main app component
│   │   ├── ModuleManager.svelte
│   │   ├── ModuleCard.svelte
│   │   ├── SaveStatus.svelte
│   │   ├── main.ts         # Entry point
│   │   ├── api.ts          # API utilities
│   │   └── types.ts        # TypeScript types
│   └── dist/               # Built files
├── assets/
│   ├── css/                # Custom CSS
│   └── wpea/               # WPEA framework files
├── src/
│   ├── Admin/              # Admin classes
│   ├── API/                # REST API classes
│   ├── Modules/            # Module classes
│   ├── Plugin.php          # Main plugin class
│   └── ModuleManager.php   # Module management
├── ab-wp-bits.php          # Main plugin file
└── composer.json           # Composer config
```

## Creating a Module

Modules can be registered using the `ModuleManager::register_module()` method:

```php
use AB\AB_WP_Bits\ModuleManager;

ModuleManager::register_module('my-module', [
    'name' => 'My Module',
    'description' => 'Description of what this module does',
    'logo' => '<svg>...</svg>',
    'has_settings' => true,
    'settings_callback' => 'my_module_settings_render',
    'init_callback' => 'my_module_init',
]);
```

## Changelog

### 0.0.1-beta
- Initial beta release
- Module Manager with enable/disable functionality
- Svelte 5 + TypeScript admin interface
- REST API with security features
- WPEA framework integration

## License

This project is licensed under the GPL v2 or later.

## Author

Alan Blair

## Support

For issues and questions, please use the GitHub issue tracker.
