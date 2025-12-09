<?php
/**
 * Menu Conditions Module
 *
 * @package AB\AB_WP_Bits\Modules
 */

namespace AB\AB_WP_Bits\Modules;

defined('ABSPATH') || exit;

use AB\AB_WP_Bits\ModuleManager;

/**
 * Adds ability-based conditional display for menu items
 */
final class MenuConditions {
    /**
     * Module ID
     */
    private const MODULE_ID = 'menu-conditions';

    /**
     * Registered capabilities
     *
     * @var array
     */
    private static array $capabilities = [];

    /**
     * Initialize the module
     *
     * @return void
     */
    public static function init(): void {
        // Register the module
        ModuleManager::register_module(self::MODULE_ID, [
            'name' => __('WP Menu Conditions', 'ab-wp-bits'),
            'description' => __('Conditionally display menu items based on WordPress user capabilities', 'ab-wp-bits'),
            'logo' => self::get_logo(),
            'category' => __('General WordPress', 'ab-wp-bits'),
            'has_settings' => true,
            'init_callback' => [__CLASS__, 'run'],
        ]);
    }

    /**
     * Run the module (called when enabled)
     *
     * @return void
     */
    public static function run(): void {
        // Register core WordPress capabilities
        self::register_core_capabilities();

        // Admin hooks
        if (is_admin()) {
            add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_admin_assets']);
            add_action('wp_nav_menu_item_custom_fields', [__CLASS__, 'add_condition_button'], 10, 2);
            add_action('admin_head', [__CLASS__, 'add_menu_item_styles']);
        }

        // Customizer hooks
        add_action('customize_controls_enqueue_scripts', [__CLASS__, 'enqueue_customizer_assets']);
        add_action('customize_controls_print_styles', [__CLASS__, 'add_customizer_styles']);

        // Frontend hooks
        add_filter('wp_nav_menu_objects', [__CLASS__, 'filter_menu_items'], 10, 2);
    }

    /**
     * Check if a user has a capability
     *
     * @param int $user_id User ID (0 for current user)
     * @param string $capability Capability name
     * @return bool
     */
    public static function user_has_capability(int $user_id, string $capability): bool {
        if ($user_id === 0) {
            $user_id = get_current_user_id();
        }

        if ($user_id === 0) {
            return false; // Not logged in
        }

        return user_can($user_id, $capability);
    }

    /**
     * Get all WordPress capabilities
     *
     * @return array
     */
    public static function get_capabilities(): array {
        return self::$capabilities;
    }

    /**
     * Get capabilities for REST API
     *
     * @return array
     */
    public static function get_capabilities_for_api(): array {
        $capabilities_list = [];

        foreach (self::$capabilities as $cap) {
            $capabilities_list[] = [
                'value' => $cap,
                'label' => ucwords(str_replace(['_', '-'], ' ', $cap)),
            ];
        }

        // Sort alphabetically by label
        usort($capabilities_list, function($a, $b) {
            return strcmp($a['label'], $b['label']);
        });

        return $capabilities_list;
    }

    /**
     * Register core WordPress capabilities
     *
     * @return void
     */
    private static function register_core_capabilities(): void {
        global $wp_roles;

        if (!isset($wp_roles)) {
            $wp_roles = wp_roles();
        }

        $all_caps = [];

        // Collect all unique capabilities from all roles
        foreach ($wp_roles->roles as $role) {
            if (isset($role['capabilities'])) {
                $all_caps = array_merge($all_caps, array_keys($role['capabilities']));
            }
        }

        // Remove duplicates and sort
        self::$capabilities = array_unique($all_caps);
        sort(self::$capabilities);
    }

    /**
     * Enqueue admin assets
     *
     * @param string $hook Current admin page hook
     * @return void
     */
    public static function enqueue_admin_assets(string $hook): void {
        // Only load on nav-menus.php (Appearance > Menus)
        if ($hook !== 'nav-menus.php') {
            return;
        }

        wp_enqueue_script(
            'ab-wp-bits-menu-conditions',
            AB_WP_BITS_PLUGIN_URL . 'admin/svelte/dist/menu-conditions.js',
            [],
            AB_WP_BITS_VERSION,
            true
        );

        wp_localize_script('ab-wp-bits-menu-conditions', 'abMenuConditionsData', [
            'apiUrl' => rest_url('ab-wp-bits/v1'),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);
    }

    /**
     * Enqueue Customizer assets
     *
     * @return void
     */
    public static function enqueue_customizer_assets(): void {
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

        // Enqueue Customizer button injector (must load before main app)
        wp_enqueue_script(
            'ab-wp-bits-menu-conditions-customizer',
            AB_WP_BITS_PLUGIN_URL . 'admin/js/menu-conditions-customizer.js',
            ['jquery', 'customize-controls'],
            AB_WP_BITS_VERSION,
            true
        );

        // Enqueue Conditions app
        wp_enqueue_script(
            'ab-wp-bits-menu-conditions',
            AB_WP_BITS_PLUGIN_URL . 'admin/svelte/dist/menu-conditions.js',
            ['ab-wp-bits-menu-conditions-customizer'],
            AB_WP_BITS_VERSION,
            true
        );

        wp_localize_script('ab-wp-bits-menu-conditions', 'abMenuConditionsData', [
            'apiUrl' => rest_url('ab-wp-bits/v1'),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);
    }

    /**
     * Add styles for Customizer
     *
     * @return void
     */
    public static function add_customizer_styles(): void {
        ?>
        <style>
            /* Highlight menu items with conditions in Customizer */
            .menu-item-handle.has-menu-conditions {
                background: linear-gradient(to right, #e8f4f8 0%, #ffffff 50%) !important;
                border-left: 3px solid #2271b1 !important;
            }

            /* Add eye icon to menu item title in Customizer */
            .menu-item-handle.has-menu-conditions .item-title::before {
                content: '';
                display: inline-block;
                width: 14px;
                height: 14px;
                margin-right: 6px;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232271b1"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>');
                background-size: contain;
                background-repeat: no-repeat;
                vertical-align: middle;
                position: relative;
                top: -1px;
            }
        </style>
        <?php
    }

    /**
     * Add condition button to menu items
     *
     * @param int $item_id Menu item ID
     * @param object $item Menu item object
     * @return void
     */
    public static function add_condition_button(int $item_id, object $item): void {
        // Get existing conditions
        $conditions = get_post_meta($item_id, '_menu_item_conditions', true);

        // Ensure proper structure
        if (empty($conditions) || !isset($conditions['conditions'])) {
            $conditions = [
                'relation' => 'AND',
                'conditions' => [],
            ];
        }

        $has_conditions = !empty($conditions['conditions']);

        ?>
        <div class="ab-menu-conditions-button-wrapper" style="margin: 10px 0;">
            <button
                type="button"
                class="button button-secondary ab-menu-conditions-button <?php echo $has_conditions ? 'has-conditions' : ''; ?>"
                data-menu-item-id="<?php echo esc_attr($item_id); ?>"
                data-conditions="<?php echo esc_attr(wp_json_encode($conditions)); ?>"
            >
                <?php echo self::get_logo(); ?>
                <span style="margin-left: 5px;">
                    <?php esc_html_e('Conditions', 'ab-wp-bits'); ?>
                    <?php if ($has_conditions): ?>
                        <span class="ab-conditions-indicator" style="color: #2271b1;">●</span>
                    <?php endif; ?>
                </span>
            </button>
        </div>
        <?php
    }

    /**
     * Add styles to highlight menu items with conditions
     *
     * @return void
     */
    public static function add_menu_item_styles(): void {
        $screen = get_current_screen();
        if (!$screen || $screen->id !== 'nav-menus') {
            return;
        }

        ?>
        <style>
            /* Highlight menu items with conditions using :has() selector */
            /* The button is inside .menu-item-settings, which is a sibling of .menu-item-bar */
            .menu-item:has(.ab-menu-conditions-button.has-conditions) > .menu-item-bar {
                background: linear-gradient(to right, #e8f4f8 0%, #ffffff 50%) !important;
                border-left: 3px solid #2271b1 !important;
            }

            /* Add eye icon to menu item title */
            .menu-item:has(.ab-menu-conditions-button.has-conditions) > .menu-item-bar .menu-item-title::before {
                content: '';
                display: inline-block;
                width: 14px;
                height: 14px;
                margin-right: 6px;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232271b1"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>');
                background-size: contain;
                background-repeat: no-repeat;
                vertical-align: middle;
                position: relative;
                top: -1px;
            }
        </style>
        <?php
    }

    /**
     * Filter menu items based on conditions
     *
     * @param array $sorted_menu_items Menu items
     * @param object $args Menu arguments
     * @return array
     */
    public static function filter_menu_items(array $sorted_menu_items, object $args): array {
        $user_id = get_current_user_id();

        foreach ($sorted_menu_items as $key => $item) {
            $conditions = get_post_meta($item->ID, '_menu_item_conditions', true);

            if (empty($conditions) || !is_array($conditions)) {
                continue;
            }

            // Check if user meets conditions
            if (!self::evaluate_conditions($user_id, $conditions)) {
                // Remove item from menu
                unset($sorted_menu_items[$key]);
            }
        }

        return array_values($sorted_menu_items);
    }

    /**
     * Check if user meets conditions (public API)
     *
     * @param int $user_id User ID
     * @param array $conditions Conditions array
     * @return bool
     */
    public static function user_meets_conditions(int $user_id, array $conditions): bool {
        return self::evaluate_conditions($user_id, $conditions);
    }

    /**
     * Evaluate conditions for a user
     *
     * @param int $user_id User ID
     * @param array $conditions Conditions array
     * @return bool
     */
    private static function evaluate_conditions(int $user_id, array $conditions): bool {
        if (empty($conditions['conditions'])) {
            return true; // No conditions means always show
        }

        $relation = $conditions['relation'] ?? 'AND';
        $condition_results = [];

        foreach ($conditions['conditions'] as $condition) {
            $has_capability = self::user_has_capability(
                $user_id,
                $condition['capability'] ?? ''
            );

            $operator = $condition['operator'] ?? 'has';
            $result = ($operator === 'has') ? $has_capability : !$has_capability;

            $condition_results[] = $result;
        }

        // Evaluate with relation
        if ($relation === 'OR') {
            return in_array(true, $condition_results, true);
        }

        // AND relation
        return !in_array(false, $condition_results, true);
    }

    /**
     * Get module logo SVG
     *
     * @return string
     */
    private static function get_logo(): string {
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle;">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
        </svg>';
    }
}
