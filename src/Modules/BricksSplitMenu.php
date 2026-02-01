<?php
/**
 * Bricks Split Menu Module
 *
 * Splits a WordPress Menu into separate level-based structures using
 * nested Bricks components for advanced animation and layout control.
 *
 * @package AB\AB_WP_Bits\Modules
 * @since   0.0.9-beta
 */

declare(strict_types=1);

namespace AB\AB_WP_Bits\Modules;

defined('ABSPATH') || exit;

use AB\AB_WP_Bits\ModuleManager;

/**
 * Bricks Split Menu module registration and element bootstrapping.
 */
final class BricksSplitMenu {
    /**
     * Module ID.
     */
    private const MODULE_ID = 'bricks-split-menu';

    /**
     * Initialize the module.
     *
     * @return void
     */
    public static function init(): void {
        ModuleManager::register_module(self::MODULE_ID, [
            'name'          => __('Bricks Split Menu', 'ab-wp-bits'),
            'description'   => __('Splits a WordPress Menu into separate level-based structures using nested Bricks components, allowing each menu level to be placed in independent blocks for advanced animation and layout control.', 'ab-wp-bits'),
            'logo'          => self::get_logo(),
            'category'      => __('Bricks Builder', 'ab-wp-bits'),
            'has_settings'  => false,
            'init_callback' => [__CLASS__, 'run'],
        ]);
    }

    /**
     * Run the module when enabled.
     *
     * Registers Bricks elements on the wp_loaded hook. We cannot use init:11
     * because run() is called from within init:5 (ModuleManager::load_modules)
     * and dynamically added init actions may not execute. wp_loaded fires after
     * all init callbacks (so \Bricks\Element base class is loaded) but before
     * the wp hook (where Bricks load_elements() fully initializes them).
     *
     * @return void
     */
    public static function run(): void {
        if (!defined('BRICKS_VERSION')) {
                return;
        }

        // Register elements directly. By init:5 (when this runs via ModuleManager),
        // Bricks' \Bricks\Elements class exists. The base \Bricks\Element class is
        // loaded at init:10 by Bricks' init_elements(), and load_elements() runs on wp.
        // We use init:11 to register after the base class is loaded.
        add_action('init', [__CLASS__, 'register_elements'], 11);

        // Enqueue styles in the builder preview iframe so CSS is always available.
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_editor_assets']);

    }

    /**
     * Enqueue styles in the Bricks builder preview iframe.
     *
     * The element's enqueue_scripts() only fires during frontend rendering.
     * This ensures CSS is loaded in the editor preview as well.
     *
     * @return void
     */
    public static function enqueue_editor_assets(): void {
        if (!function_exists('bricks_is_builder') || !bricks_is_builder()) {
            return;
        }

        wp_enqueue_style(
            'ab-split-menu',
            AB_WP_BITS_PLUGIN_URL . 'assets/css/split-menu.css',
            ['bricks-frontend'],
            AB_WP_BITS_VERSION
        );
    }

    /**
     * Register Bricks elements.
     *
     * @return void
     */
    public static function register_elements(): void {
        if (!class_exists('\Bricks\Elements')) {
            return;
        }

        $dir = AB_WP_BITS_PLUGIN_PATH . 'src/Modules/BricksSplitMenu/';

        \Bricks\Elements::register_element(
            $dir . 'Element_Split_Menu.php',
            'ab-split-menu',
            'AB\AB_WP_Bits\Modules\BricksSplitMenu\Element_Split_Menu'
        );

        \Bricks\Elements::register_element(
            $dir . 'Element_Split_Menu_Nav.php',
            'ab-split-menu-nav',
            'AB\AB_WP_Bits\Modules\BricksSplitMenu\Element_Split_Menu_Nav'
        );

        \Bricks\Elements::register_element(
            $dir . 'Element_Split_Menu_Level.php',
            'ab-split-menu-level-wrapper',
            'AB\AB_WP_Bits\Modules\BricksSplitMenu\Element_Split_Menu_Level'
        );

        \Bricks\Elements::register_element(
            $dir . 'Element_Split_Menu_Level_Content.php',
            'ab-split-menu-level',
            'AB\AB_WP_Bits\Modules\BricksSplitMenu\Element_Split_Menu_Level_Content'
        );

        \Bricks\Elements::register_element(
            $dir . 'Element_Split_Menu_Selected_Label.php',
            'ab-split-menu-selected-label',
            'AB\AB_WP_Bits\Modules\BricksSplitMenu\Element_Split_Menu_Selected_Label'
        );
    }

    /**
     * Get module logo SVG.
     *
     * @return string
     */
    private static function get_logo(): string {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
        </svg>';
    }
}
