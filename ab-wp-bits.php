<?php
/**
 * Plugin Name: Alan Blair's WP Bits
 * Plugin URI: https://github.com/wpeasy/ab-wp-bits
 * Description: A collection of modular enhancements for WordPress with tab-based admin dashboard
 * Version: 0.0.7-beta
 * Requires at least: 6.0
 * Tested up to: 6.9
 * Requires PHP: 7.4
 * Author: Alan Blair
 * Author URI: https://alanblair.co
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ab-wp-bits
 * Domain Path: /languages
 * Network: true
 * Update URI: https://github.com/wpeasy/ab-wp-bits
 */

defined('ABSPATH') || exit;

// Define plugin constants
define('AB_WP_BITS_VERSION', '0.0.7-beta');
define('AB_WP_BITS_PLUGIN_FILE', __FILE__);
define('AB_WP_BITS_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('AB_WP_BITS_PLUGIN_URL', plugin_dir_url(__FILE__));

// Require Composer autoloader
if (file_exists(AB_WP_BITS_PLUGIN_PATH . 'vendor/autoload.php')) {
    require_once AB_WP_BITS_PLUGIN_PATH . 'vendor/autoload.php';
} else {
    // Display admin notice if autoloader is missing
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p>';
        echo '<strong>Alan Blair\'s WP Bits:</strong> Composer autoloader not found. ';
        echo 'Please run <code>composer install</code> in the plugin directory.';
        echo '</p></div>';
    });
    return;
}

// Initialize the plugin
AB\AB_WP_Bits\Plugin::init();
