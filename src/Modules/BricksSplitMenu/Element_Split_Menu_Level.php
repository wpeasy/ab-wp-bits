<?php
/**
 * Split Menu Level Element
 *
 * Nestable Bricks element that wraps one level of the menu hierarchy.
 * Auto-detects its level based on position among siblings, increments
 * the render stack level counter, and delegates item rendering to its
 * child Menu Level Content element.
 *
 * @package AB\AB_WP_Bits\Modules\BricksSplitMenu
 * @since   0.0.9-beta
 */

declare(strict_types=1);

namespace AB\AB_WP_Bits\Modules\BricksSplitMenu;

defined('ABSPATH') || exit;

/**
 * Nestable child element: one level of the split menu.
 */
class Element_Split_Menu_Level extends \Bricks\Element {

    use SplitMenuContextTrait;

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
    public $name = 'ab-split-menu-level-wrapper';

    /**
     * Themify icon class for the Bricks element panel.
     *
     * @var string
     */
    public $icon = 'ti-layout-list-thumb';

    /**
     * Enable nestable children.
     *
     * @var bool
     */
    public $nestable = true;

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
     * Default HTML tag.
     *
     * @var string
     */
    public $tag = 'div';

    /**
     * Get element label.
     *
     * @return string
     */
    public function get_label(): string {
        return esc_html__('Menu Level Wrapper', 'ab-wp-bits');
    }

    /**
     * Get search keywords.
     *
     * @return array
     */
    public function get_keywords(): array {
        return ['menu', 'level', 'submenu', 'split'];
    }

    /**
     * Level is auto-detected. Info control only.
     *
     * @return void
     */
    public function set_controls(): void {
        $this->controls['info'] = [
            'type'    => 'info',
            'content' => esc_html__('Level is auto-detected from position inside Split Menu Nav. First child = Level 1, second = Level 2, etc. Add Bricks elements before/after the Menu Level child.', 'ab-wp-bits'),
        ];
    }

    /**
     * Define the blueprint for a single nestable child (Menu Level Content).
     *
     * @return array
     */
    public function get_nestable_item(): array {
        return [
            'name'     => 'ab-split-menu-level',
            'label'    => esc_html__('Menu Level', 'ab-wp-bits'),
            'settings' => [],
        ];
    }

    /**
     * Define the initial children inserted when this element is dropped.
     *
     * @return array One Menu Level Content child by default.
     */
    public function get_nestable_children(): array {
        return [
            $this->get_nestable_item(),
        ];
    }

    /**
     * Render the menu level on the frontend (and builder preview).
     *
     * Resolves the level, sets data-level, and renders children.
     * The actual menu item rendering is handled by Menu Level Content.
     *
     * @return void
     */
    public function render(): void {
        $level = $this->resolve_level();

        if ($level !== null) {
            $this->set_attribute('_root', 'data-level', (string) $level);
        }

        $output  = "<div {$this->render_attributes('_root')}>";
        $output .= \Bricks\Frontend::render_children($this);
        $output .= '</div>';

        echo $output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }

    /**
     * Resolve this element's 1-based level number.
     *
     * Two resolution paths:
     * 1. Render stack — increments the level counter (fastest)
     * 2. Elements lookup — counts position among siblings (fallback)
     *
     * @return int|null Level number, or null if context not available.
     */
    private function resolve_level(): ?int {
        // Path 1: render stack (populated by parent Split Menu)
        $stack = &Element_Split_Menu::$render_stack;
        if (!empty($stack)) {
            $ctx = &$stack[count($stack) - 1];
            $ctx['level']++;
            return $ctx['level'];
        }

        // Path 2: persistent context (survives after stack pop during AJAX re-renders)
        if (Element_Split_Menu::$current_context !== null) {
            Element_Split_Menu::$current_context['level']++;
            return Element_Split_Menu::$current_context['level'];
        }

        // Path 3/4: elements lookup
        $elements = $this->get_elements_lookup();
        if (empty($elements)) {
            return null;
        }

        return $this->determine_level_from_elements($elements);
    }

    /**
     * Determine level by counting position among ab-split-menu-level siblings
     * within the parent container (Split Menu Inner or Split Menu).
     *
     * @param array $elements Elements lookup keyed by ID.
     * @return int 1-based level number.
     */
    private function determine_level_from_elements(array $elements): int {
        $my_id = $this->element['id'] ?? '';

        // Find the container: Split Menu Inner (preferred) or Split Menu
        $container = $this->find_ancestor_by_name($elements, 'ab-split-menu-nav');
        if (!$container) {
            $container = $this->find_split_menu_ancestor($elements);
        }

        if (!$container) {
            return 1;
        }

        $children = $container['children'] ?? [];
        $level    = 0;

        foreach ($children as $child_id) {
            $child = $elements[$child_id] ?? null;
            if (!$child) {
                continue;
            }

            if (($child['name'] ?? '') === 'ab-split-menu-level-wrapper') {
                $level++;
                if ($child_id === $my_id) {
                    return $level;
                }
            }
        }

        return 1;
    }
}
