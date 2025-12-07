<?php
/**
 * REST API Class
 *
 * @package AB\AB_WP_Bits
 */

namespace AB\AB_WP_Bits\API;

use AB\AB_WP_Bits\ModuleManager;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined('ABSPATH') || exit;

/**
 * Handles REST API endpoints
 */
final class REST {
    /**
     * API namespace
     */
    private const NAMESPACE = 'ab-wp-bits/v1';

    /**
     * Initialize REST API
     *
     * @return void
     */
    public static function init(): void {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    /**
     * Register REST API routes
     *
     * @return void
     */
    public static function register_routes(): void {
        // Get modules
        register_rest_route(self::NAMESPACE, '/modules', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_modules'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
        ]);

        // Toggle module
        register_rest_route(self::NAMESPACE, '/modules/(?P<id>[a-zA-Z0-9_-]+)/toggle', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'toggle_module'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
            'args' => [
                'id' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_key',
                ],
                'enabled' => [
                    'required' => true,
                    'type' => 'boolean',
                ],
            ],
        ]);

        // Get module settings
        register_rest_route(self::NAMESPACE, '/module-settings/(?P<module_id>[a-zA-Z0-9_-]+)', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_module_settings'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
            'args' => [
                'module_id' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_key',
                ],
            ],
        ]);

        // Save module settings
        register_rest_route(self::NAMESPACE, '/module-settings/(?P<module_id>[a-zA-Z0-9_-]+)', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'save_module_settings'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
            'args' => [
                'module_id' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_key',
                ],
            ],
        ]);

        // Clear module cache
        register_rest_route(self::NAMESPACE, '/module-settings/(?P<module_id>[a-zA-Z0-9_-]+)/clear-cache', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'clear_module_cache'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
            'args' => [
                'module_id' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_key',
                ],
            ],
        ]);

        // Get registered capabilities
        register_rest_route(self::NAMESPACE, '/menu-conditions/capabilities', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_capabilities'],
            'permission_callback' => [__CLASS__, 'check_menu_permissions'],
        ]);

        // Get menu item conditions
        register_rest_route(self::NAMESPACE, '/menu-conditions/item/(?P<item_id>\d+)', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_menu_item_conditions'],
            'permission_callback' => [__CLASS__, 'check_menu_permissions'],
            'args' => [
                'item_id' => [
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ],
            ],
        ]);

        // Save menu item conditions
        register_rest_route(self::NAMESPACE, '/menu-conditions/item/(?P<item_id>\d+)', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'save_menu_item_conditions'],
            'permission_callback' => [__CLASS__, 'check_menu_permissions'],
            'args' => [
                'item_id' => [
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ],
            ],
        ]);

        // Evaluate conditions for roles
        register_rest_route(self::NAMESPACE, '/menu-conditions/evaluate', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'evaluate_conditions_for_roles'],
            'permission_callback' => [__CLASS__, 'check_menu_permissions'],
        ]);

        // Get users
        register_rest_route(self::NAMESPACE, '/menu-conditions/users', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_users'],
            'permission_callback' => [__CLASS__, 'check_menu_permissions'],
        ]);

        // Evaluate conditions for specific user
        register_rest_route(self::NAMESPACE, '/menu-conditions/evaluate-user', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'evaluate_conditions_for_user'],
            'permission_callback' => [__CLASS__, 'check_menu_permissions'],
        ]);
    }

    /**
     * Check permissions and validate request
     *
     * @param WP_REST_Request $request Request object
     * @return bool|WP_Error
     */
    public static function check_permissions(WP_REST_Request $request) {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_forbidden',
                __('You do not have permission to access this resource.', 'ab-wp-bits'),
                ['status' => 403]
            );
        }

        // Same-origin enforcement
        $referer = $request->get_header('referer');
        $origin = $request->get_header('origin');

        if ($origin) {
            $site_url = get_site_url();
            if (strpos($origin, $site_url) !== 0) {
                return new WP_Error(
                    'rest_forbidden_origin',
                    __('Request origin not allowed.', 'ab-wp-bits'),
                    ['status' => 403]
                );
            }
        }

        // Verify nonce for non-GET requests
        if ($request->get_method() !== 'GET') {
            $nonce = $request->get_header('X-WP-Nonce');

            if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
                return new WP_Error(
                    'rest_invalid_nonce',
                    __('Invalid nonce.', 'ab-wp-bits'),
                    ['status' => 403]
                );
            }
        }

        return true;
    }

    /**
     * Get all modules
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response
     */
    public static function get_modules(WP_REST_Request $request): WP_REST_Response {
        $modules = ModuleManager::get_modules_for_api();

        return new WP_REST_Response([
            'success' => true,
            'data' => $modules,
        ], 200);
    }

    /**
     * Toggle module status
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error
     */
    public static function toggle_module(WP_REST_Request $request) {
        $module_id = $request->get_param('id');
        $enabled = $request->get_param('enabled');

        // Validate module ID
        $module_id = sanitize_key($module_id);
        if (empty($module_id)) {
            return new WP_Error(
                'invalid_module_id',
                __('Invalid module ID.', 'ab-wp-bits'),
                ['status' => 400]
            );
        }

        // Toggle module
        $result = $enabled
            ? ModuleManager::enable_module($module_id)
            : ModuleManager::disable_module($module_id);

        if (!$result) {
            return new WP_Error(
                'module_toggle_failed',
                __('Failed to toggle module.', 'ab-wp-bits'),
                ['status' => 500]
            );
        }

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'module_id' => $module_id,
                'enabled' => $enabled,
            ],
        ], 200);
    }

    /**
     * Get module settings
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error
     */
    public static function get_module_settings(WP_REST_Request $request) {
        $module_id = sanitize_key($request->get_param('module_id'));

        $settings = get_option("ab_wp_bits_{$module_id}_settings", []);

        return new WP_REST_Response([
            'success' => true,
            'settings' => $settings,
        ], 200);
    }

    /**
     * Save module settings
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error
     */
    public static function save_module_settings(WP_REST_Request $request) {
        $module_id = sanitize_key($request->get_param('module_id'));
        $body = $request->get_json_params();

        // Sanitize settings based on module
        $settings = [];
        if ($module_id === 'menu-queries') {
            $settings['cache_ttl'] = isset($body['cache_ttl']) ? absint($body['cache_ttl']) : 3600;
        }

        update_option("ab_wp_bits_{$module_id}_settings", $settings);

        return new WP_REST_Response([
            'success' => true,
            'settings' => $settings,
        ], 200);
    }

    /**
     * Clear module cache
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error
     */
    public static function clear_module_cache(WP_REST_Request $request) {
        $module_id = sanitize_key($request->get_param('module_id'));

        // Clear module-specific transients
        if ($module_id === 'menu-queries') {
            global $wpdb;
            $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_menu_query_%'");
            $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_menu_query_%'");
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Cache cleared successfully.', 'ab-wp-bits'),
        ], 200);
    }

    /**
     * Check menu management permissions
     *
     * @param WP_REST_Request $request Request object
     * @return bool|WP_Error
     */
    public static function check_menu_permissions(WP_REST_Request $request) {
        // Check user capabilities
        if (!current_user_can('edit_theme_options')) {
            return new WP_Error(
                'rest_forbidden',
                __('You do not have permission to manage menus.', 'ab-wp-bits'),
                ['status' => 403]
            );
        }

        // Same-origin enforcement
        $origin = $request->get_header('origin');

        if ($origin) {
            $site_url = get_site_url();
            if (strpos($origin, $site_url) !== 0) {
                return new WP_Error(
                    'rest_forbidden_origin',
                    __('Request origin not allowed.', 'ab-wp-bits'),
                    ['status' => 403]
                );
            }
        }

        // Verify nonce for non-GET requests
        if ($request->get_method() !== 'GET') {
            $nonce = $request->get_header('X-WP-Nonce');

            if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
                return new WP_Error(
                    'rest_invalid_nonce',
                    __('Invalid nonce.', 'ab-wp-bits'),
                    ['status' => 403]
                );
            }
        }

        return true;
    }

    /**
     * Get registered capabilities
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response
     */
    public static function get_capabilities(WP_REST_Request $request) {
        $capabilities = \AB\AB_WP_Bits\Modules\MenuConditions::get_capabilities_for_api();

        return new WP_REST_Response([
            'success' => true,
            'capabilities' => $capabilities,
        ], 200);
    }

    /**
     * Get menu item conditions
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response
     */
    public static function get_menu_item_conditions(WP_REST_Request $request) {
        $item_id = absint($request->get_param('item_id'));
        $conditions = get_post_meta($item_id, '_menu_item_conditions', true);

        if (empty($conditions)) {
            $conditions = [
                'relation' => 'AND',
                'conditions' => [],
            ];
        }

        return new WP_REST_Response([
            'success' => true,
            'conditions' => $conditions,
        ], 200);
    }

    /**
     * Save menu item conditions
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response
     */
    public static function save_menu_item_conditions(WP_REST_Request $request) {
        $item_id = absint($request->get_param('item_id'));
        $body = $request->get_json_params();

        // Sanitize conditions
        $conditions = [
            'relation' => isset($body['relation']) && $body['relation'] === 'OR' ? 'OR' : 'AND',
            'conditions' => [],
        ];

        if (!empty($body['conditions']) && is_array($body['conditions'])) {
            foreach ($body['conditions'] as $condition) {
                $conditions['conditions'][] = [
                    'operator' => isset($condition['operator']) && $condition['operator'] === 'has_not' ? 'has_not' : 'has',
                    'capability' => sanitize_key($condition['capability'] ?? ''),
                ];
            }
        }

        // Save or delete
        if (empty($conditions['conditions'])) {
            delete_post_meta($item_id, '_menu_item_conditions');
        } else {
            update_post_meta($item_id, '_menu_item_conditions', $conditions);
        }

        return new WP_REST_Response([
            'success' => true,
            'conditions' => $conditions,
        ], 200);
    }

    /**
     * Evaluate conditions for all roles
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response
     */
    public static function evaluate_conditions_for_roles(WP_REST_Request $request) {
        $body = $request->get_json_params();
        $conditions = $body['conditions'] ?? [];

        global $wp_roles;
        if (!isset($wp_roles)) {
            $wp_roles = wp_roles();
        }

        $results = [];

        // Test each role
        foreach ($wp_roles->get_names() as $role_slug => $role_name) {
            // Create a test user with this role
            $test_user = (object) ['roles' => [$role_slug]];

            $visible = self::evaluate_conditions_for_test_user($test_user, $conditions);

            $results[] = [
                'role' => $role_slug,
                'role_name' => translate_user_role($role_name),
                'visible' => $visible,
            ];
        }

        // Test non-logged-in user
        $test_user = (object) ['roles' => []];
        $visible = self::evaluate_conditions_for_test_user($test_user, $conditions);

        $results[] = [
            'role' => 'logged_out',
            'role_name' => __('Not Logged In', 'ab-wp-bits'),
            'visible' => $visible,
        ];

        return new WP_REST_Response([
            'success' => true,
            'results' => $results,
        ], 200);
    }

    /**
     * Evaluate conditions for a test user
     *
     * @param object $test_user Test user object with roles array
     * @param array $conditions Conditions array
     * @return bool
     */
    private static function evaluate_conditions_for_test_user(object $test_user, array $conditions): bool {
        if (empty($conditions['conditions'])) {
            return true; // No conditions means always show
        }

        $relation = $conditions['relation'] ?? 'AND';
        $condition_results = [];

        foreach ($conditions['conditions'] as $condition) {
            $capability = $condition['capability'] ?? '';
            $operator = $condition['operator'] ?? 'has';

            // Check if test user has this capability
            $has_capability = self::test_user_has_capability($test_user, $capability);

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
     * Test if a mock user has a capability
     *
     * @param object $test_user Test user object with roles array
     * @param string $capability Capability to check
     * @return bool
     */
    private static function test_user_has_capability(object $test_user, string $capability): bool {
        if (empty($test_user->roles)) {
            return false; // Not logged in
        }

        global $wp_roles;
        if (!isset($wp_roles)) {
            $wp_roles = wp_roles();
        }

        // Check if any of the user's roles has this capability
        foreach ($test_user->roles as $role_slug) {
            $role = $wp_roles->get_role($role_slug);
            if ($role && $role->has_cap($capability)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get users for testing
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response
     */
    public static function get_users(WP_REST_Request $request) {
        $users = get_users([
            'number' => 100,
            'orderby' => 'display_name',
            'order' => 'ASC',
        ]);

        $users_data = [];
        foreach ($users as $user) {
            $users_data[] = [
                'id' => $user->ID,
                'name' => $user->display_name,
                'roles' => $user->roles,
            ];
        }

        return new WP_REST_Response([
            'success' => true,
            'users' => $users_data,
        ], 200);
    }

    /**
     * Evaluate conditions for a specific user
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response
     */
    public static function evaluate_conditions_for_user(WP_REST_Request $request) {
        $body = $request->get_json_params();
        $user_id = absint($body['user_id'] ?? 0);
        $conditions = $body['conditions'] ?? [];

        if ($user_id === 0) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Invalid user ID.', 'ab-wp-bits'),
            ], 400);
        }

        $user = get_userdata($user_id);
        if (!$user) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('User not found.', 'ab-wp-bits'),
            ], 404);
        }

        // Evaluate conditions
        $visible = \AB\AB_WP_Bits\Modules\MenuConditions::user_meets_conditions($user_id, $conditions);

        return new WP_REST_Response([
            'success' => true,
            'visible' => $visible,
            'user_name' => $user->display_name,
            'user_roles' => $user->roles,
        ], 200);
    }
}
