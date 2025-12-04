<?php
/**
 * Module Manager Class
 *
 * @package AB\AB_WP_Bits
 */

namespace AB\AB_WP_Bits;

defined('ABSPATH') || exit;

/**
 * Manages module registration and lifecycle
 */
final class ModuleManager {
    /**
     * Registered modules
     *
     * @var array
     */
    private static array $modules = [];

    /**
     * Initialize the Module Manager
     *
     * @return void
     */
    public static function init(): void {
        add_action('init', [__CLASS__, 'load_modules'], 5);
    }

    /**
     * Register a module
     *
     * @param string $id Module unique identifier
     * @param array $args {
     *     Module configuration
     *
     *     @type string $name Module name
     *     @type string $description Module description
     *     @type string $logo Module logo URL or SVG
     *     @type bool $has_settings Whether module has settings page
     *     @type callable|null $settings_callback Callback for settings page render
     *     @type callable|null $init_callback Callback to run when module is enabled
     * }
     * @return bool True on success, false on failure
     */
    public static function register_module(string $id, array $args): bool {
        // Validate required fields
        if (empty($id) || empty($args['name'])) {
            return false;
        }

        // Set defaults
        $module = wp_parse_args($args, [
            'name' => '',
            'description' => '',
            'logo' => '',
            'has_settings' => false,
            'settings_callback' => null,
            'init_callback' => null,
        ]);

        // Store module
        self::$modules[$id] = $module;

        return true;
    }

    /**
     * Get all registered modules
     *
     * @return array
     */
    public static function get_modules(): array {
        return self::$modules;
    }

    /**
     * Get enabled modules
     *
     * @return array
     */
    public static function get_enabled_modules(): array {
        $enabled = get_option('ab_wp_bits_modules', []);
        return is_array($enabled) ? $enabled : [];
    }

    /**
     * Check if a module is enabled
     *
     * @param string $id Module ID
     * @return bool
     */
    public static function is_module_enabled(string $id): bool {
        $enabled = self::get_enabled_modules();
        return isset($enabled[$id]) && $enabled[$id] === true;
    }

    /**
     * Enable a module
     *
     * @param string $id Module ID
     * @return bool
     */
    public static function enable_module(string $id): bool {
        if (!isset(self::$modules[$id])) {
            return false;
        }

        $enabled = self::get_enabled_modules();
        $enabled[$id] = true;
        update_option('ab_wp_bits_modules', $enabled);

        // Run init callback if provided
        if (isset(self::$modules[$id]['init_callback']) && is_callable(self::$modules[$id]['init_callback'])) {
            call_user_func(self::$modules[$id]['init_callback']);
        }

        return true;
    }

    /**
     * Disable a module
     *
     * @param string $id Module ID
     * @return bool
     */
    public static function disable_module(string $id): bool {
        $enabled = self::get_enabled_modules();
        $enabled[$id] = false;
        update_option('ab_wp_bits_modules', $enabled);

        return true;
    }

    /**
     * Load enabled modules
     *
     * @return void
     */
    public static function load_modules(): void {
        $enabled = self::get_enabled_modules();

        foreach ($enabled as $module_id => $is_enabled) {
            if ($is_enabled && isset(self::$modules[$module_id])) {
                $module = self::$modules[$module_id];

                // Run init callback if provided
                if (isset($module['init_callback']) && is_callable($module['init_callback'])) {
                    call_user_func($module['init_callback']);
                }
            }
        }
    }

    /**
     * Get module data for REST API
     *
     * @return array
     */
    public static function get_modules_for_api(): array {
        $enabled = self::get_enabled_modules();
        $modules_data = [];

        foreach (self::$modules as $id => $module) {
            $modules_data[] = [
                'id' => $id,
                'name' => $module['name'],
                'description' => $module['description'],
                'logo' => $module['logo'],
                'has_settings' => $module['has_settings'],
                'enabled' => isset($enabled[$id]) && $enabled[$id] === true,
            ];
        }

        return $modules_data;
    }
}
