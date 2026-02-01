<?php
/**
 * Split Menu Nav Element
 *
 * Nestable <nav> wrapper that sits between the Split Menu root and the
 * Menu Level elements. Acts as a pure pass-through — does not modify
 * the render stack. Allows users to insert arbitrary Bricks elements
 * before/after the navigation within the Split Menu root.
 *
 * @package AB\AB_WP_Bits\Modules\BricksSplitMenu
 * @since   0.0.10-beta
 */

declare(strict_types=1);

namespace AB\AB_WP_Bits\Modules\BricksSplitMenu;

defined('ABSPATH') || exit;

/**
 * Nestable nav wrapper element: Split Menu Nav.
 */
class Element_Split_Menu_Nav extends \Bricks\Element {

    /**
     * Element category shown in Bricks panel.
     *
     * @var string
     */
    public $category = 'WP Bits - Split Menu';

    /**
     * Unique element identifier.
     *
     * @var string
     */
    public $name = 'ab-split-menu-nav';

    /**
     * Themify icon class for the Bricks element panel.
     *
     * @var string
     */
    public $icon = 'ti-layout-sidebar-left';

    /**
     * Enable nestable children.
     *
     * @var bool
     */
    public $nestable = true;

    /**
     * Default HTML tag (shown in Bricks Structure panel).
     *
     * @var string
     */
    public $tag = 'nav';

    /**
     * Frontend script handles to enqueue.
     *
     * Shares the parent's script so Bricks re-initialises the
     * menu when a child element is re-rendered in the builder.
     *
     * @var array
     */
    public $scripts = ['abSplitMenu'];

    /**
     * Get element label.
     *
     * @return string
     */
    public function get_label(): string {
        return esc_html__('Split Menu Nav', 'ab-wp-bits');
    }

    /**
     * Get search keywords.
     *
     * @return array
     */
    public function get_keywords(): array {
        return ['menu', 'navigation', 'split', 'inner', 'nav'];
    }

    /**
     * Define element controls.
     *
     * @return void
     */
    public function set_controls(): void {
        $this->controls['info'] = [
            'type'    => 'info',
            'content' => esc_html__('Navigation wrapper. Menu and interaction settings are on the parent Split Menu Wrapper element.', 'ab-wp-bits'),
        ];
    }

    /**
     * Define the blueprint for a single nestable child (Menu Level).
     *
     * @return array
     */
    public function get_nestable_item(): array {
        return [
            'name'     => 'ab-split-menu-level-wrapper',
            'label'    => esc_html__('Menu Level Wrapper', 'ab-wp-bits'),
            'settings' => [],
            'children' => [
                [
                    'name'     => 'ab-split-menu-level',
                    'label'    => esc_html__('Menu Level', 'ab-wp-bits'),
                    'settings' => [],
                ],
            ],
        ];
    }

    /**
     * Define the initial children inserted when this element is dropped.
     *
     * @return array Two Menu Level children, each containing a Menu Level Content.
     */
    public function get_nestable_children(): array {
        $children = [];

        for ($i = 0; $i < 2; $i++) {
            $children[] = [
                'name'     => 'ab-split-menu-level-wrapper',
                'label'    => sprintf(
                    /* translators: %d: level number */
                    esc_html__('Menu Level Wrapper %d', 'ab-wp-bits'),
                    $i + 1
                ),
                'settings' => [],
                'children' => [
                    [
                        'name'     => 'ab-split-menu-level',
                        'label'    => esc_html__('Menu Level', 'ab-wp-bits'),
                        'settings' => [],
                    ],
                ],
            ];
        }

        return $children;
    }

    /**
     * Render the element on the frontend (and in the builder preview).
     *
     * Outputs a <nav> landmark with aria-label set to the WordPress menu name.
     * Does not modify the render stack — acts as a pure pass-through.
     *
     * @return void
     */
    public function render(): void {
        $output  = "<nav {$this->render_attributes('_root')}>";
        $output .= \Bricks\Frontend::render_children($this);
        $output .= '</nav>';

        echo $output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }
}
