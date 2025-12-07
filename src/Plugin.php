<?php
/**
 * Main Plugin Class
 *
 * @package AB\AB_WP_Bits
 */

namespace AB\AB_WP_Bits;

defined('ABSPATH') || exit;

/**
 * Main plugin initialization class
 */
final class Plugin {
    /**
     * Initialize the plugin
     *
     * @return void
     */
    public static function init(): void {
        // Register activation/deactivation hooks
        register_activation_hook(AB_WP_BITS_PLUGIN_FILE, [__CLASS__, 'activate']);
        register_deactivation_hook(AB_WP_BITS_PLUGIN_FILE, [__CLASS__, 'deactivate']);

        // Initialize core components
        add_action('plugins_loaded', [__CLASS__, 'load_textdomain']);
        add_action('init', [__CLASS__, 'initialize_components'], 0);
    }

    /**
     * Plugin activation
     *
     * @return void
     */
    public static function activate(): void {
        // Create default options
        if (!get_option('ab_wp_bits_modules')) {
            update_option('ab_wp_bits_modules', []);
        }

        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Plugin deactivation
     *
     * @return void
     */
    public static function deactivate(): void {
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Load plugin textdomain
     *
     * @return void
     */
    public static function load_textdomain(): void {
        load_plugin_textdomain(
            'ab-wp-bits',
            false,
            dirname(plugin_basename(AB_WP_BITS_PLUGIN_FILE)) . '/languages'
        );
    }

    /**
     * Initialize plugin components
     *
     * @return void
     */
    public static function initialize_components(): void {
        // Initialize Module Manager
        ModuleManager::init();

        // Initialize Admin Dashboard
        if (is_admin()) {
            Admin\Dashboard::init();
        }

        // Initialize REST API
        API\REST::init();

        // Initialize modules
        Modules\MenuQueries::init();
        Modules\MenuConditions::init();
    }
}
