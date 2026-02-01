<?php
/**
 * Split Menu Level Content Element
 *
 * Non-nestable element that renders the <ul>/<li>/<a> markup for one
 * level of the menu hierarchy. Reads the level counter from the render
 * stack without incrementing it (the parent Menu Level handles that).
 *
 * @package AB\AB_WP_Bits\Modules\BricksSplitMenu
 * @since   0.0.10-beta
 */

declare(strict_types=1);

namespace AB\AB_WP_Bits\Modules\BricksSplitMenu;

defined('ABSPATH') || exit;

/**
 * Child element: renders menu items for one level of the split menu.
 */
class Element_Split_Menu_Level_Content extends \Bricks\Element {

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
    public $name = 'ab-split-menu-level';

    /**
     * Themify icon class for the Bricks element panel.
     *
     * @var string
     */
    public $icon = 'ti-menu';

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
        return esc_html__('Menu Level', 'ab-wp-bits');
    }

    /**
     * Get search keywords.
     *
     * @return array
     */
    public function get_keywords(): array {
        return ['menu', 'level', 'content', 'items', 'split'];
    }

    /**
     * No user controls — content is driven by the parent Split Menu settings.
     *
     * @return void
     */
    public function set_controls(): void {
        $this->controls['info'] = [
            'type'    => 'info',
            'content' => esc_html__('Renders menu items for this level. Settings are on the parent Split Menu Wrapper element.', 'ab-wp-bits'),
        ];
    }

    /**
     * Render the menu level content on the frontend (and builder preview).
     *
     * @return void
     */
    public function render(): void {
        $context = $this->resolve_context();

        if (!$context) {
            // If we have a parent, the element is correctly placed but context
            // is unavailable (e.g. Bricks AJAX re-render before save). Show
            // sample items with proper BEM classes so user styling applies.
            // Only show the orphan error when truly parentless.
            if (!empty($this->element['parent'])) {
                echo '<div ' . $this->render_attributes('_root') . '>';
                echo '<ul class="ab-split-menu__list" role="menubar">';
                echo '<li class="ab-split-menu__item ab-split-menu__item--has-children" data-item-id="sample-1" role="none">';
                echo '<a class="ab-split-menu__link" href="#" role="menuitem">' . esc_html__('Sample Item 1', 'ab-wp-bits') . '</a>';
                echo '</li>';
                echo '<li class="ab-split-menu__item" data-item-id="sample-2" role="none">';
                echo '<a class="ab-split-menu__link" href="#" role="menuitem">' . esc_html__('Sample Item 2', 'ab-wp-bits') . '</a>';
                echo '</li>';
                echo '</ul>';
                echo '</div>';
                return;
            }

            echo '<div ' . $this->render_attributes('_root') . '>';
            echo '<p style="padding:12px;color:#888;">' . esc_html__('Place inside a Menu Level Wrapper element.', 'ab-wp-bits') . '</p>';
            echo '</div>';
            return;
        }

        $is_builder = function_exists('bricks_is_builder') && bricks_is_builder();

        $level            = $context['level'];
        $tree             = $context['tree'];
        $submenu_icon     = $context['submenu_icon'];
        $parent_clickable = $context['parent_clickable'];

        $current_url = $is_builder ? '' : trailingslashit((string) wp_parse_url(get_permalink(), PHP_URL_PATH));

        // Level 1: render as <div> wrapping a single <ul>
        if ($level === 1) {
            $items = Element_Split_Menu::get_items_at_level($tree, 1);

            if (empty($items) && !$is_builder) {
                echo '<div ' . $this->render_attributes('_root') . '></div>';
                return;
            }

            echo '<div ' . $this->render_attributes('_root') . '>';
            echo '<ul class="ab-split-menu__list" role="menubar">';

            if (empty($items) && $is_builder) {
                echo '<li class="ab-split-menu__item ab-split-menu__item--has-children" data-item-id="sample-1" role="none">';
                echo '<a class="ab-split-menu__link" href="#" role="menuitem">' . esc_html__('Sample Item 1', 'ab-wp-bits') . '</a>';
                echo '</li>';
                echo '<li class="ab-split-menu__item" data-item-id="sample-2" role="none">';
                echo '<a class="ab-split-menu__link" href="#" role="menuitem">' . esc_html__('Sample Item 2', 'ab-wp-bits') . '</a>';
                echo '</li>';
            } else {
                foreach ($items as $item) {
                    $this->render_item($item, $submenu_icon, $current_url, $parent_clickable);
                }
            }

            echo '</ul>';
            echo '</div>';
            return;
        }

        // Level 2+: render grouped <ul> lists inside a wrapper <div>
        $groups = Element_Split_Menu::get_items_at_level($tree, $level);

        echo '<div ' . $this->render_attributes('_root') . '>';

        if (empty($groups) && $is_builder) {
            echo '<ul class="ab-split-menu__list" role="menu" data-parent-id="sample-1">';
            echo '<li class="ab-split-menu__item" data-item-id="sample-child-1" role="none">';
            echo '<a class="ab-split-menu__link" href="#" role="menuitem">' . esc_html__('Sub-item 1', 'ab-wp-bits') . '</a>';
            echo '</li>';
            echo '<li class="ab-split-menu__item" data-item-id="sample-child-2" role="none">';
            echo '<a class="ab-split-menu__link" href="#" role="menuitem">' . esc_html__('Sub-item 2', 'ab-wp-bits') . '</a>';
            echo '</li>';
            echo '</ul>';
        } else {
            foreach ($groups as $parent_id => $children) {
                echo '<ul class="ab-split-menu__list" role="menu" data-parent-id="' . esc_attr((string) $parent_id) . '">';

                foreach ($children as $child) {
                    $this->render_item($child, $submenu_icon, $current_url, $parent_clickable);
                }

                echo '</ul>';
            }
        }

        echo '</div>';
    }

    /**
     * Resolve parent context: find the Split Menu ancestor, its settings, and the level.
     *
     * Three resolution paths, tried in order:
     * 1. Render stack (fastest — reads level without incrementing)
     * 2. Frontend::$elements (works when Bricks has populated the static array)
     * 3. Database fallback (reads saved elements — reliable during builder AJAX re-renders)
     *
     * @return array|null Context with 'level', 'tree', 'submenu_icon', 'parent_clickable', or null.
     */
    private function resolve_context(): ?array {
        // Path 1: render stack (reads level without incrementing — Menu Level already did that)
        $stack = &Element_Split_Menu::$render_stack;
        if (!empty($stack)) {
            $ctx = &$stack[count($stack) - 1];
            return [
                'level'            => $ctx['level'],
                'tree'             => $ctx['tree'],
                'submenu_icon'     => $ctx['settings']['submenuIcon'] ?? false,
                'parent_clickable' => !empty($ctx['settings']['parentClickable']),
            ];
        }

        // Path 2: persistent context (survives after stack pop during AJAX re-renders)
        if (Element_Split_Menu::$current_context !== null) {
            $ctx = Element_Split_Menu::$current_context;
            return [
                'level'            => $ctx['level'],
                'tree'             => $ctx['tree'],
                'submenu_icon'     => $ctx['settings']['submenuIcon'] ?? false,
                'parent_clickable' => !empty($ctx['settings']['parentClickable']),
            ];
        }

        // Path 3/4: elements lookup
        $elements = $this->get_elements_lookup();
        if (empty($elements)) {
            return null;
        }

        return $this->resolve_context_from_elements($elements);
    }

    /**
     * Resolve context by walking the element tree.
     *
     * Finds the Split Menu ancestor for settings/tree, then determines
     * the level by finding the parent Menu Level and counting its position.
     *
     * @param array $elements Elements lookup keyed by ID.
     * @return array|null Context array, or null if ancestors not found.
     */
    private function resolve_context_from_elements(array $elements): ?array {
        // Find the Split Menu root for settings and tree
        $split_menu_data = $this->find_split_menu_ancestor($elements);
        if (!$split_menu_data) {
            return null;
        }

        $parent_settings = $split_menu_data['settings'] ?? [];
        $tree            = $this->build_menu_tree_from_settings($parent_settings);

        // Determine level: find parent Menu Level element, then count its position
        $level = $this->determine_level_from_elements($elements, $split_menu_data);

        return [
            'level'            => $level,
            'tree'             => $tree,
            'submenu_icon'     => $parent_settings['submenuIcon'] ?? false,
            'parent_clickable' => !empty($parent_settings['parentClickable']),
        ];
    }

    /**
     * Determine the level by finding the parent Menu Level and counting its position
     * among its siblings within Split Menu Inner (or Split Menu).
     *
     * @param array $elements        Elements lookup keyed by ID.
     * @param array $split_menu_data The Split Menu root element data.
     * @return int 1-based level number.
     */
    private function determine_level_from_elements(array $elements, array $split_menu_data): int {
        // Find parent Menu Level element
        $menu_level_data = $this->find_ancestor_by_name($elements, 'ab-split-menu-level-wrapper');
        if (!$menu_level_data) {
            return 1;
        }

        $menu_level_id = $menu_level_data['id'] ?? '';

        // Find the container that holds Menu Levels (Split Menu Inner or Split Menu)
        $container = $this->find_ancestor_by_name_from($elements, 'ab-split-menu-nav', $menu_level_id);
        if (!$container) {
            // Fallback: look for Split Menu directly (in case of legacy structure)
            $container = $split_menu_data;
        }

        // Count Menu Level position among siblings
        $children = $container['children'] ?? [];
        $level    = 0;

        foreach ($children as $child_id) {
            $child = $elements[$child_id] ?? null;
            if (!$child) {
                continue;
            }

            if (($child['name'] ?? '') === 'ab-split-menu-level-wrapper') {
                $level++;
                if ($child_id === $menu_level_id) {
                    return $level;
                }
            }
        }

        return 1;
    }

    /**
     * Render a single menu item <li>.
     *
     * @param array      $item             Menu item data from the tree.
     * @param array|bool $submenu_icon     Bricks icon data (font icon or SVG) or false.
     * @param string     $current_url      Current page path for active-item matching.
     * @param bool       $parent_clickable Whether parent items should navigate to their URL.
     * @return void
     */
    private function render_item(array $item, $submenu_icon, string $current_url, bool $parent_clickable): void {
        $has_children = !empty($item['children']);
        $classes      = ['ab-split-menu__item'];

        if ($has_children) {
            $classes[] = 'ab-split-menu__item--has-children';
        }

        // Current page detection
        $item_path = trailingslashit((string) wp_parse_url($item['url'], PHP_URL_PATH));
        if ($current_url !== '' && $item_path === $current_url) {
            $classes[] = 'current-menu-item';
        }

        // Merge any existing WP classes from the menu item
        if (!empty($item['classes'])) {
            foreach ($item['classes'] as $cls) {
                $cls = trim($cls);
                if ($cls !== '' && !in_array($cls, $classes, true)) {
                    $classes[] = $cls;
                }
            }
        }

        // Parent items use real URL when parentClickable is on, otherwise #
        $href = ($has_children && !$parent_clickable) ? '#' : esc_url($item['url']);

        // ARIA attributes for items that control submenus
        $aria_attrs = '';
        if ($has_children) {
            $aria_attrs = ' aria-haspopup="true" aria-expanded="false"';
        }

        // Current page: aria-current
        $aria_current = '';
        if (in_array('current-menu-item', $classes, true)) {
            $aria_current = ' aria-current="page"';
        }

        echo '<li class="' . esc_attr(implode(' ', $classes)) . '" data-item-id="' . esc_attr((string) $item['id']) . '"' . $aria_attrs . ' role="none">';
        echo '<a class="ab-split-menu__link" href="' . $href . '" role="menuitem"' . $aria_current . '>';
        echo esc_html($item['title']);

        if ($has_children && $submenu_icon) {
            $icon_html = self::render_icon($submenu_icon);
            if ($icon_html) {
                echo '<span class="ab-split-menu__submenu-icon" aria-hidden="true">' . $icon_html . '</span>';
            }
        }

        echo '</a>';
        echo '</li>';
    }
}
