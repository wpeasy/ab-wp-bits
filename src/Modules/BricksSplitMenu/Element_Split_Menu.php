<?php
/**
 * Split Menu Parent Element
 *
 * Nestable Bricks element that wraps child menu-level elements.
 * Provides the menu selector, trigger mode, default state, and
 * passes parsed menu data to children via a static render stack.
 *
 * @package AB\AB_WP_Bits\Modules\BricksSplitMenu
 * @since   0.0.9-beta
 */

declare(strict_types=1);

namespace AB\AB_WP_Bits\Modules\BricksSplitMenu;

defined('ABSPATH') || exit;

/**
 * Parent nestable element: Split Menu.
 */
class Element_Split_Menu extends \Bricks\Element {

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
    public $name = 'ab-split-menu';

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
     * Frontend script handles to enqueue.
     *
     * @var array
     */
    public $scripts = ['abSplitMenu'];

    /**
     * Static render stack for parent-child data sharing.
     *
     * Each entry contains:
     *   'tree'     => array  Hierarchical menu items
     *   'settings' => array  Parent element settings
     *   'level'    => int    Current level counter (incremented by children)
     *
     * @var array
     */
    public static array $render_stack = [];

    /**
     * Persistent context that survives after the render stack is popped.
     *
     * During Bricks AJAX re-renders of nestable elements, child elements
     * may be rendered independently after the parent's render() has completed
     * and popped the stack. This property preserves the context so children
     * can still access the menu data within the same PHP request.
     *
     * @var array|null
     */
    public static ?array $current_context = null;

    /**
     * Get element label.
     *
     * @return string
     */
    public function get_label(): string {
        return esc_html__('Split Menu Wrapper', 'ab-wp-bits');
    }

    /**
     * Get search keywords.
     *
     * @return array
     */
    public function get_keywords(): array {
        return ['menu', 'navigation', 'split', 'level', 'submenu', 'mega'];
    }

    /**
     * Define control groups (tabs) for the Bricks panel.
     *
     * @return void
     */
    public function set_control_groups(): void {
        $this->control_groups['settings'] = [
            'title' => esc_html__('Settings', 'ab-wp-bits'),
        ];

        $this->control_groups['help'] = [
            'title' => esc_html__('Help / CSS', 'ab-wp-bits'),
        ];
    }

    /**
     * Define element controls for the Bricks panel.
     *
     * @return void
     */
    public function set_controls(): void {
        // Menu selector
        $menus   = wp_get_nav_menus();
        $options = [];
        foreach ($menus as $menu) {
            $options[$menu->term_id] = $menu->name;
        }

        $this->controls['menu'] = [
            'label'       => esc_html__('Menu', 'ab-wp-bits'),
            'type'        => 'select',
            'options'     => $options,
            'placeholder' => esc_html__('Select a menu', 'ab-wp-bits'),
            'group'       => 'settings',
        ];

        // Trigger mode
        $this->controls['trigger'] = [
            'label'   => esc_html__('Trigger', 'ab-wp-bits'),
            'type'    => 'select',
            'options' => [
                'hover' => esc_html__('Hover', 'ab-wp-bits'),
                'click' => esc_html__('Click', 'ab-wp-bits'),
            ],
            'default' => 'hover',
            'group'   => 'settings',
        ];

        // Default state
        $this->controls['defaultState'] = [
            'label'   => esc_html__('Default State', 'ab-wp-bits'),
            'type'    => 'select',
            'options' => [
                'none'  => esc_html__('None', 'ab-wp-bits'),
                'first' => esc_html__('First Item Active', 'ab-wp-bits'),
            ],
            'default' => 'none',
            'group'   => 'settings',
        ];

        // Parent items clickable
        $this->controls['parentClickable'] = [
            'label'   => esc_html__('Parent Items Clickable', 'ab-wp-bits'),
            'type'    => 'checkbox',
            'inline'  => true,
            'small'   => true,
            'default' => false,
            'group'   => 'settings',
        ];

        // Deactivate all on mouseout
        $this->controls['deactivateOnMouseout'] = [
            'label'   => esc_html__('Deactivate All on Mouseout', 'ab-wp-bits'),
            'type'    => 'checkbox',
            'inline'  => true,
            'small'   => true,
            'default' => false,
            'group'   => 'settings',
        ];

        // Show all levels (for styling)
        $this->controls['showAllLevels'] = [
            'label'       => esc_html__('Show All Levels', 'ab-wp-bits'),
            'type'        => 'checkbox',
            'inline'      => true,
            'small'       => true,
            'default'     => false,
            'description' => esc_html__('For styling purposes', 'ab-wp-bits'),
            'group'       => 'settings',
        ];

        // Has-submenu icon (font icon or SVG)
        $this->controls['submenuIcon'] = [
            'label' => esc_html__('Submenu Icon', 'ab-wp-bits'),
            'type'  => 'icon',
            'group' => 'settings',
        ];

        // --- Help / CSS Reference tab ----------------------------------------

        $this->controls['helpUsage'] = [
            'type'    => 'info',
            'group'   => 'help',
            'content' => '<strong>Split Menu</strong> splits a WordPress menu into separate level-based structures using nested Bricks elements.<br><br>'
                . '<strong>Structure:</strong><br>'
                . 'Split Menu Wrapper (<code>&lt;div&gt;</code>)<br>'
                . '&nbsp;&nbsp;├─ Selected Item Label (<code>&lt;h3&gt;</code> default, configurable tag)<br>'
                . '&nbsp;&nbsp;└─ Split Menu Nav (<code>&lt;nav&gt;</code>)<br>'
                . '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─ Menu Level Wrapper (<code>&lt;div&gt;</code>, nestable)<br>'
                . '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;├─ <em>[your Bricks elements]</em><br>'
                . '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;├─ Menu Level (renders items)<br>'
                . '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;└─ <em>[your Bricks elements]</em><br>'
                . '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ Menu Level Wrapper<br>'
                . '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ Menu Level<br><br>'
                . '<strong>Setup:</strong><br>'
                . '1. Select a WordPress menu in <em>Settings &gt; Menu</em><br>'
                . '2. Each <strong>Menu Level Wrapper</strong> wraps one depth — add Bricks elements before/after the Menu Level<br>'
                . '3. Level is auto-detected from position: first = Level 1, second = Level 2, etc.<br>'
                . '4. Add elements outside <strong>Split Menu Nav</strong> for content around the nav<br><br>'
                . '<strong>Controls:</strong><br>'
                . '&bull; <strong>Trigger</strong> — Hover or Click to open submenus<br>'
                . '&bull; <strong>Default State</strong> — None, or activate the first item on page load<br>'
                . '&bull; <strong>Parent Items Clickable</strong> — Allow parent item links to navigate (otherwise they only open submenus)<br>'
                . '&bull; <strong>Deactivate All on Mouseout</strong> — Close all submenus when the cursor leaves the menu<br>'
                . '&bull; <strong>Submenu Icon</strong> — Icon appended to items that have children<br><br>'
                . '<strong>JS State Classes:</strong><br>'
                . '&bull; <code>.ab-split-menu__item--active</code> — on the hovered/clicked parent item<br>'
                . '&bull; <code>.active</code> — on the level div and the visible UL group<br>'
                . '&bull; <code>.level2-active</code>, <code>.level3-active</code> — on the root wrapper<br>',
        ];

        $this->controls['helpCss'] = [
            'type'    => 'info',
            'group'   => 'help',
            'content' => '<strong>CSS Reference</strong> — All styles are in <code>@layer ab-split-menu</code> so they are easy to override.<br>'
                . '<code>.brxe-*</code> classes are Bricks-generated element wrappers. Other classes are custom BEM selectors on inner markup.<br><br>'
                . '<div style="position:relative;">'
                . '<button onclick="var p=this.parentElement.querySelector(\'pre\');navigator.clipboard.writeText(p.textContent).then(function(){var b=event.target;b.textContent=\'Copied!\';setTimeout(function(){b.textContent=\'Copy\'},1500)})" style="position:absolute;top:6px;right:6px;background:var(--builder-bg-3,#333);color:var(--builder-color,#d4d4d4);border:none;border-radius:3px;padding:3px 8px;font-size:10px;cursor:pointer;">Copy</button>'
                . '<pre id="ab-split-menu-css-ref" style="font-size:11px;line-height:1.5;background:#1e1e1e;color:#d4d4d4;padding:10px;padding-right:50px;border-radius:4px;overflow-x:auto;white-space:pre;margin:0;">'
                . "/* ---- Bricks element wrappers ---- */\n\n"
                . "/* Split Menu Wrapper (root div) */\n"
                . ".brxe-ab-split-menu {}\n\n"
                . "/* Split Menu Nav (nav, auto-fit grid) */\n"
                . ".brxe-ab-split-menu-nav {}\n\n"
                . "/* Menu Level Wrapper (nestable div) */\n"
                . ".brxe-ab-split-menu-level-wrapper {}\n"
                . ".brxe-ab-split-menu-level-wrapper[data-level=\"1\"] {}\n"
                . ".brxe-ab-split-menu-level-wrapper:not([data-level=\"1\"]) {}\n"
                . ".brxe-ab-split-menu-level-wrapper.active {}\n\n"
                . "/* Menu Level (renders items) */\n"
                . ".brxe-ab-split-menu-level {}\n\n"
                . "/* Selected Item Label (h3 default) */\n"
                . ".brxe-ab-split-menu-selected-label {}\n\n"
                . "/* ---- Inner markup (BEM) ---- */\n\n"
                . "/* Menu list (ul) */\n"
                . ".ab-split-menu__list {}\n"
                . ".ab-split-menu__list[data-parent-id] {}\n"
                . ".ab-split-menu__list[data-parent-id].active {}\n\n"
                . "/* Menu item (li) */\n"
                . ".ab-split-menu__item {}\n"
                . ".ab-split-menu__item--has-children {}\n"
                . ".ab-split-menu__item--active {}\n"
                . ".ab-split-menu__item.current-menu-item {}\n\n"
                . "/* Menu link (a) */\n"
                . ".ab-split-menu__link {}\n\n"
                . "/* Submenu icon */\n"
                . ".ab-split-menu__submenu-icon {}\n"
                . ".ab-split-menu__submenu-icon svg {}\n\n"
                . "/* Selected Item Label inner elements */\n"
                . ".ab-split-menu-selected-label__icon {}\n"
                . ".ab-split-menu-selected-label__text {}\n"
                . ".ab-split-menu-selected-label__text--out {}\n"
                . ".ab-split-menu-selected-label__text--in {}\n"
                . '</pre>'
                . '</div>',
        ];
    }

    /**
     * Define the blueprint for a single nestable child (Split Menu Inner).
     *
     * @return array
     */
    public function get_nestable_item(): array {
        return [
            'name'     => 'ab-split-menu-nav',
            'label'    => esc_html__('Split Menu Nav', 'ab-wp-bits'),
            'settings' => [],
            'children' => [
                [
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
                ],
            ],
        ];
    }

    /**
     * Define the initial children inserted when this element is dropped.
     *
     * @return array Selected Item Label + Split Menu Inner with 2 Menu Levels.
     */
    public function get_nestable_children(): array {
        $menu_levels = [];

        for ($i = 0; $i < 2; $i++) {
            $menu_levels[] = [
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

        return [
            [
                'name'     => 'ab-split-menu-selected-label',
                'label'    => esc_html__('Selected Item Label', 'ab-wp-bits'),
                'settings' => [],
            ],
            [
                'name'     => 'ab-split-menu-nav',
                'label'    => esc_html__('Split Menu Nav', 'ab-wp-bits'),
                'settings' => [],
                'children' => $menu_levels,
            ],
        ];
    }

    /**
     * Enqueue frontend scripts and styles.
     *
     * @return void
     */
    public function enqueue_scripts(): void {
        wp_enqueue_script(
            'abSplitMenu',
            AB_WP_BITS_PLUGIN_URL . 'assets/js/split-menu.js',
            [],
            AB_WP_BITS_VERSION,
            true
        );

        wp_enqueue_style(
            'ab-split-menu',
            AB_WP_BITS_PLUGIN_URL . 'assets/css/split-menu.css',
            ['bricks-frontend'],
            AB_WP_BITS_VERSION
        );
    }

    /**
     * Render the element on the frontend (and in the builder preview).
     *
     * @return void
     */
    public function render(): void {
        $settings = $this->settings;
        $menu_id  = !empty($settings['menu']) ? (int) $settings['menu'] : 0;
        $trigger  = $settings['trigger'] ?? 'hover';
        $default  = $settings['defaultState'] ?? 'none';

        // Build menu tree
        $tree = [];
        if ($menu_id) {
            $items = wp_get_nav_menu_items($menu_id);
            if (is_array($items)) {
                $tree = self::build_menu_tree($items);
            }
        }

        // Persist context so children rendered after stack pop (AJAX re-renders) can access it
        self::$current_context = [
            'tree'     => $tree,
            'settings' => $settings,
            'level'    => 0,
        ];

        // Push context onto the render stack so children can read it
        self::$render_stack[] = [
            'tree'     => $tree,
            'settings' => $settings,
            'level'    => 0,
        ];

        // Data attributes for the frontend JS
        $this->set_attribute('_root', 'data-trigger', esc_attr($trigger));
        $this->set_attribute('_root', 'data-default-state', esc_attr($default));

        if (!empty($settings['parentClickable'])) {
            $this->set_attribute('_root', 'data-parent-clickable', 'true');
        }

        if (!empty($settings['deactivateOnMouseout'])) {
            $this->set_attribute('_root', 'data-deactivate-on-mouseout', 'true');
        }

        if (!empty($settings['showAllLevels'])) {
            $this->set_attribute('_root', 'data-show-all-levels', 'true');
        }

        $output  = "<div {$this->render_attributes('_root')}>";
        $output .= \Bricks\Frontend::render_children($this);
        $output .= '</div>';

        echo $output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

        // Pop the stack after children have rendered
        array_pop(self::$render_stack);
    }

    /**
     * Build a hierarchical tree from the flat wp_get_nav_menu_items() array.
     *
     * @param array $items Flat array of WP_Post menu-item objects.
     * @return array Nested tree structure.
     */
    public static function build_menu_tree(array $items): array {
        $lookup = [];
        $tree   = [];

        // Index items by ID
        foreach ($items as $item) {
            $lookup[$item->ID] = [
                'id'       => $item->ID,
                'title'    => $item->title,
                'url'      => $item->url,
                'classes'  => is_array($item->classes) ? $item->classes : [],
                'object_id' => (int) $item->object_id,
                'children' => [],
            ];
        }

        // Build tree using parent references
        foreach ($items as $item) {
            $parent_id = (int) $item->menu_item_parent;

            if ($parent_id && isset($lookup[$parent_id])) {
                $lookup[$parent_id]['children'][] = &$lookup[$item->ID];
            } else {
                $tree[] = &$lookup[$item->ID];
            }
        }

        return $tree;
    }

    /**
     * Get items at a specific depth from the menu tree.
     *
     * For level 1 this returns the top-level items.
     * For level 2+ this returns items grouped by their parent ID.
     *
     * @param array $tree  Full menu tree.
     * @param int   $level Target depth (1-based).
     * @return array For level 1: flat list of items.
     *               For level 2+: array keyed by parent item ID.
     */
    public static function get_items_at_level(array $tree, int $level): array {
        if ($level === 1) {
            return $tree;
        }

        // Collect items at the target depth, grouped by parent
        $groups = [];
        self::collect_at_depth($tree, 1, $level, $groups);

        return $groups;
    }

    /**
     * Recursively collect items at a target depth, grouped by parent.
     *
     * @param array $items        Current level items.
     * @param int   $current_depth Current depth (1-based).
     * @param int   $target_depth  Target depth to collect.
     * @param array &$groups       Collected groups keyed by parent ID.
     * @return void
     */
    private static function collect_at_depth(array $items, int $current_depth, int $target_depth, array &$groups): void {
        foreach ($items as $item) {
            if ($current_depth + 1 === $target_depth && !empty($item['children'])) {
                $groups[$item['id']] = $item['children'];
            } elseif (!empty($item['children'])) {
                self::collect_at_depth($item['children'], $current_depth + 1, $target_depth, $groups);
            }
        }
    }
}
