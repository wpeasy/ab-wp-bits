<?php
/**
 * Split Menu Context Trait
 *
 * Shared context resolution methods used by child elements that need
 * to find their parent Split Menu ancestor and resolve menu data.
 *
 * @package AB\AB_WP_Bits\Modules\BricksSplitMenu
 * @since   0.0.10-beta
 */

declare(strict_types=1);

namespace AB\AB_WP_Bits\Modules\BricksSplitMenu;

defined('ABSPATH') || exit;

/**
 * Provides ancestor lookup and menu tree resolution for Split Menu child elements.
 *
 * Requires that the using class extends \Bricks\Element (for $this->element, $this->post_id).
 */
trait SplitMenuContextTrait {

    /**
     * Walk up the element tree to find the closest ab-split-menu ancestor.
     *
     * @param array $elements Elements lookup keyed by ID.
     * @return array|null The parent Split Menu element data, or null if not found.
     */
    private function find_split_menu_ancestor(array $elements): ?array {
        return $this->find_ancestor_by_name($elements, 'ab-split-menu');
    }

    /**
     * Walk up the element tree to find the closest ancestor with a given name.
     *
     * Starts from this element's parent.
     *
     * @param array  $elements Elements lookup keyed by ID.
     * @param string $name     Element name to search for.
     * @return array|null The ancestor element data, or null if not found.
     */
    private function find_ancestor_by_name(array $elements, string $name): ?array {
        $current_id = $this->element['parent'] ?? '';
        return $this->walk_ancestors($elements, $name, $current_id);
    }

    /**
     * Walk up the element tree from a specific element to find an ancestor by name.
     *
     * Starts from the specified element's parent (not the element itself).
     *
     * @param array  $elements Elements lookup keyed by ID.
     * @param string $name     Element name to search for.
     * @param string $start_id Element ID to start walking up from (its parent is checked first).
     * @return array|null The ancestor element data, or null if not found.
     */
    private function find_ancestor_by_name_from(array $elements, string $name, string $start_id): ?array {
        $start_el   = $elements[$start_id] ?? null;
        $current_id = $start_el['parent'] ?? '';
        return $this->walk_ancestors($elements, $name, $current_id);
    }

    /**
     * Walk up the element tree from a given ID to find an ancestor by name.
     *
     * @param array  $elements   Elements lookup keyed by ID.
     * @param string $name       Element name to search for.
     * @param string $current_id Starting element ID to check.
     * @return array|null The ancestor element data, or null if not found.
     */
    private function walk_ancestors(array $elements, string $name, string $current_id): ?array {
        for ($i = 0; $i < 20 && $current_id !== ''; $i++) {
            $el = $elements[$current_id] ?? null;
            if (!$el) {
                break;
            }

            if (($el['name'] ?? '') === $name) {
                return $el;
            }

            $current_id = $el['parent'] ?? '';
        }

        return null;
    }

    /**
     * Load page elements from the database and build a lookup keyed by element ID.
     *
     * Used as a fallback when Frontend::$elements is not populated
     * (e.g. during Bricks builder AJAX re-renders).
     *
     * @return array Elements keyed by ID, or empty array.
     */
    private function load_elements_from_database(): array {
        if (!class_exists('\Bricks\Database')) {
            return [];
        }

        $post_id = $this->post_id ?? get_the_ID();
        if (!$post_id) {
            return [];
        }

        $content = \Bricks\Database::get_data($post_id);
        if (!is_array($content) || empty($content)) {
            return [];
        }

        $lookup = [];
        foreach ($content as $el) {
            if (isset($el['id'])) {
                $lookup[$el['id']] = $el;
            }
        }

        return $lookup;
    }

    /**
     * Get elements lookup: Frontend::$elements with database fallback.
     *
     * @return array Elements keyed by ID, or empty array.
     */
    private function get_elements_lookup(): array {
        $elements = \Bricks\Frontend::$elements;

        if (empty($elements)) {
            $elements = $this->load_elements_from_database();
        }

        return $elements;
    }

    /**
     * Build menu tree from a parent Split Menu element's settings.
     *
     * @param array $settings The parent Split Menu element settings.
     * @return array Nested tree structure.
     */
    private function build_menu_tree_from_settings(array $settings): array {
        $menu_id = !empty($settings['menu']) ? (int) $settings['menu'] : 0;

        if (!$menu_id) {
            return [];
        }

        $items = wp_get_nav_menu_items($menu_id);
        if (!is_array($items)) {
            return [];
        }

        return Element_Split_Menu::build_menu_tree($items);
    }
}
