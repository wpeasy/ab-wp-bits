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
}
