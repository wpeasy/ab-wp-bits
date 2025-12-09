<?php
/**
 * Admin Dashboard Class
 *
 * @package AB\AB_WP_Bits
 */

namespace AB\AB_WP_Bits\Admin;

use AB\AB_WP_Bits\ModuleManager;

defined('ABSPATH') || exit;

/**
 * Handles admin dashboard interface
 */
final class Dashboard {
    /**
     * Initialize the dashboard
     *
     * @return void
     */
    public static function init(): void {
        add_action('admin_menu', [__CLASS__, 'register_menu']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_assets']);
        add_filter('script_loader_tag', [__CLASS__, 'add_module_type'], 10, 3);
    }

    /**
     * Register admin menu
     *
     * @return void
     */
    public static function register_menu(): void {
        add_menu_page(
            __('WP Bits', 'ab-wp-bits'),
            __('WP Bits', 'ab-wp-bits'),
            'manage_options',
            'ab-wp-bits',
            [__CLASS__, 'render_dashboard'],
            'dashicons-admin-generic',
            30
        );
    }

    /**
     * Enqueue admin assets
     *
     * @param string $hook Current admin page hook
     * @return void
     */
    public static function enqueue_assets(string $hook): void {
        // Only load on our admin page
        if ($hook !== 'toplevel_page_ab-wp-bits') {
            return;
        }

        // Enqueue WPEA framework CSS
        wp_enqueue_style(
            'ab-wp-bits-wpea-resets',
            AB_WP_BITS_PLUGIN_URL . 'assets/wpea/css/wpea-wp-resets.css',
            [],
            AB_WP_BITS_VERSION
        );

        wp_enqueue_style(
            'ab-wp-bits-wpea-framework',
            AB_WP_BITS_PLUGIN_URL . 'assets/wpea/css/wpea-framework.css',
            ['ab-wp-bits-wpea-resets'],
            AB_WP_BITS_VERSION
        );

        // Enqueue custom admin CSS (if needed)
        wp_enqueue_style(
            'ab-wp-bits-admin',
            AB_WP_BITS_PLUGIN_URL . 'assets/css/admin.css',
            ['ab-wp-bits-wpea-framework'],
            AB_WP_BITS_VERSION
        );

        // CSS is bundled in the JS file, no separate CSS needed

        // Enqueue Svelte app
        wp_enqueue_script(
            'ab-wp-bits-admin-app',
            AB_WP_BITS_PLUGIN_URL . 'admin/svelte/dist/main.js',
            [],
            AB_WP_BITS_VERSION,
            true
        );

        // Localize script with data (must be after enqueue)
        wp_localize_script('ab-wp-bits-admin-app', 'abWpBitsData', [
            'apiUrl' => rest_url('ab-wp-bits/v1'),
            'nonce' => wp_create_nonce('wp_rest'),
            'modules' => ModuleManager::get_modules_for_api(),
        ]);
    }

    /**
     * Add type="module" to our scripts (not needed for IIFE format)
     *
     * @param string $tag Script tag
     * @param string $handle Script handle
     * @param string $src Script source
     * @return string Modified script tag
     */
    public static function add_module_type(string $tag, string $handle, string $src): string {
        // IIFE format doesn't need type="module"
        return $tag;
    }

    /**
     * Render dashboard page
     *
     * @return void
     */
    public static function render_dashboard(): void {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'ab-wp-bits'));
        }

        ?>
        <div class="wrap wpea-scope">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <!-- Svelte app will mount here -->
            <div id="ab-wp-bits-app"></div>
        </div>
        <?php
    }
}
