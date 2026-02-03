<?php
/**
 * Split Menu Selected Item Label Element
 *
 * Child Bricks element that displays the text of the currently active
 * menu item, with optional icon and animated text transitions.
 *
 * @package AB\AB_WP_Bits\Modules\BricksSplitMenu
 * @since   0.0.9-beta
 */

declare(strict_types=1);

namespace AB\AB_WP_Bits\Modules\BricksSplitMenu;

defined('ABSPATH') || exit;

/**
 * Child element: selected item label for the split menu.
 */
class Element_Split_Menu_Selected_Label extends \Bricks\Element {

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
    public $name = 'ab-split-menu-selected-label';

    /**
     * Themify icon class for the Bricks element panel.
     *
     * @var string
     */
    public $icon = 'ti-text';

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
    public $tag = 'h3';

    /**
     * Get element label.
     *
     * @return string
     */
    public function get_label(): string {
        return esc_html__('Selected Item Label', 'ab-wp-bits');
    }

    /**
     * Get search keywords.
     *
     * @return array
     */
    public function get_keywords(): array {
        return ['menu', 'label', 'selected', 'active', 'split'];
    }

    /**
     * Define element controls.
     *
     * @return void
     */
    public function set_controls(): void {
        $this->controls['tag'] = [
            'label'       => esc_html__('HTML Tag', 'ab-wp-bits'),
            'type'        => 'select',
            'options'     => [
                'h1'   => 'H1',
                'h2'   => 'H2',
                'h3'   => 'H3',
                'h4'   => 'H4',
                'h5'   => 'H5',
                'h6'   => 'H6',
                'div'  => 'div',
                'span' => 'span',
                'p'    => 'p',
            ],
            'default'     => 'h3',
            'inline'      => true,
        ];

        $this->controls['icon'] = [
            'label' => esc_html__('Icon', 'ab-wp-bits'),
            'type'  => 'icon',
        ];

        $this->controls['iconPosition'] = [
            'label'   => esc_html__('Icon Position', 'ab-wp-bits'),
            'type'    => 'select',
            'options' => [
                'left'  => esc_html__('Left', 'ab-wp-bits'),
                'right' => esc_html__('Right', 'ab-wp-bits'),
            ],
            'default' => 'left',
            'required' => ['icon', '!=', ''],
        ];
    }

    /**
     * Render the selected item label on the frontend (and builder preview).
     *
     * @return void
     */
    public function render(): void {
        $context  = $this->resolve_context();
        $settings = $this->settings;
        $tag      = $settings['tag'] ?? 'h3';

        // Whitelist allowed tags
        $allowed_tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p'];
        if (!in_array($tag, $allowed_tags, true)) {
            $tag = 'h3';
        }

        if (!$context) {
            // If we have a parent, the element is correctly placed but context
            // is unavailable (e.g. Bricks AJAX re-render before save). Show a
            // placeholder with proper BEM classes so user styling applies.
            // Only show the orphan error when truly parentless.
            if (!empty($this->element['parent'])) {
                echo "<{$tag} {$this->render_attributes('_root')}>";
                echo '<span class="ab-split-menu-selected-label__text" aria-live="polite">';
                echo esc_html__('Selected Item', 'ab-wp-bits');
                echo '</span>';
                echo "</{$tag}>";
                return;
            }

            echo "<{$tag} {$this->render_attributes('_root')}>";
            echo '<p style="padding:12px;color:#888;">' . esc_html__('Place inside a Split Menu Wrapper element.', 'ab-wp-bits') . '</p>';
            echo "</{$tag}>";
            return;
        }

        $parent_settings = $context['settings'] ?? [];

        // Determine default text from parent's defaultLabel setting
        $default_text = $parent_settings['defaultLabel'] ?? '';

        // Icon settings
        $icon          = $settings['icon'] ?? [];
        $icon_position = $settings['iconPosition'] ?? 'left';
        $has_icon      = !empty($icon);

        // Set data attribute for icon position (CSS flex-direction control)
        $this->set_attribute('_root', 'data-icon-position', esc_attr($icon_position));

        echo "<{$tag} {$this->render_attributes('_root')}>";

        // Render icon
        if ($has_icon) {
            $icon_html = self::render_icon($icon);
            if ($icon_html) {
                echo '<span class="ab-split-menu-selected-label__icon" aria-hidden="true">' . $icon_html . '</span>';
            }
        }

        // Render text with aria-live for screen reader announcements
        echo '<span class="ab-split-menu-selected-label__text" aria-live="polite">' . esc_html($default_text) . '</span>';

        echo "</{$tag}>";
    }

    /**
     * Resolve parent context: find the Split Menu ancestor and its menu tree.
     *
     * Three resolution paths, tried in order:
     * 1. Render stack (fastest -- populated by parent during Frontend::render_children)
     * 2. Frontend::$elements (works when Bricks has populated the static array)
     * 3. Database fallback (reads saved elements -- reliable during builder AJAX re-renders)
     *
     * Unlike Menu Level, this element does NOT increment the level counter.
     *
     * @return array|null Context array with 'tree' and 'settings', or null.
     */
    private function resolve_context(): ?array {
        // Path 1: render stack (populated by parent during Frontend::render_children)
        $stack = &Element_Split_Menu::$render_stack;
        if (!empty($stack)) {
            $ctx = &$stack[count($stack) - 1];
            // Note: does NOT increment $ctx['level'] — this element is not a Menu Level
            return [
                'tree'     => $ctx['tree'],
                'settings' => $ctx['settings'],
            ];
        }

        // Path 2: persistent context (survives after stack pop during AJAX re-renders)
        if (Element_Split_Menu::$current_context !== null) {
            return [
                'tree'     => Element_Split_Menu::$current_context['tree'],
                'settings' => Element_Split_Menu::$current_context['settings'],
            ];
        }

        // Path 3/4: elements lookup
        $elements = $this->get_elements_lookup();
        if (empty($elements)) {
            return null;
        }

        $parent_data = $this->find_split_menu_ancestor($elements);
        if (!$parent_data) {
            return null;
        }

        $parent_settings = $parent_data['settings'] ?? [];

        return [
            'tree'     => $this->build_menu_tree_from_settings($parent_settings),
            'settings' => $parent_settings,
        ];
    }
}
