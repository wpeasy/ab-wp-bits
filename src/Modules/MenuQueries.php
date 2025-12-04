<?php
/**
 * WP Menu Queries Module
 *
 * Adds the ability to query CPTs and Taxonomies to use as menu items
 *
 * @package AB\AB_WP_Bits
 */

namespace AB\AB_WP_Bits\Modules;

use AB\AB_WP_Bits\ModuleManager;

defined('ABSPATH') || exit;

/**
 * Menu Queries Module Class
 */
final class MenuQueries {
    /**
     * Module ID
     */
    private const MODULE_ID = 'menu-queries';

    /**
     * Initialize the module
     *
     * @return void
     */
    public static function init(): void {
        add_action('init', [__CLASS__, 'register'], 1);
    }

    /**
     * Register the module
     *
     * @return void
     */
    public static function register(): void {
        ModuleManager::register_module(self::MODULE_ID, [
            'name' => __('WP Menu Queries', 'ab-wp-bits'),
            'description' => __('Adds the ability to query CPTs and Taxonomies to use as menu items in WordPress Menus', 'ab-wp-bits'),
            'logo' => self::get_logo(),
            'has_settings' => true,
            'settings_callback' => [__CLASS__, 'render_settings'],
            'init_callback' => [__CLASS__, 'run'],
        ]);
    }

    /**
     * Run when module is enabled
     *
     * @return void
     */
    public static function run(): void {
        // Add meta box to Appearance > Menus
        add_action('admin_init', [__CLASS__, 'add_nav_menu_meta_box']);

        // Enqueue scripts for menu admin
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_menu_scripts']);

        // Enqueue scripts for Customizer
        add_action('customize_controls_enqueue_scripts', [__CLASS__, 'enqueue_customizer_scripts']);

        // Add module type to scripts
        add_filter('script_loader_tag', [__CLASS__, 'add_module_type'], 10, 3);

        // Register REST API endpoints
        add_action('rest_api_init', [__CLASS__, 'register_rest_routes']);

        // Add custom fields to menu items
        add_action('wp_nav_menu_item_custom_fields', [__CLASS__, 'add_menu_item_custom_fields'], 10, 4);

        // Save menu item custom fields
        add_action('wp_update_nav_menu_item', [__CLASS__, 'save_menu_item_custom_fields'], 10, 2);

        // Setup nav menu item
        add_filter('wp_setup_nav_menu_item', [__CLASS__, 'setup_nav_menu_item']);

        // Add AJAX handler for adding query items
        add_action('wp_ajax_add_query_menu_item', [__CLASS__, 'ajax_add_query_menu_item']);

        // Filter menu items to expand query items
        add_filter('wp_get_nav_menu_items', [__CLASS__, 'expand_query_menu_items'], 10, 3);

        // Add Customizer support
        add_action('customize_register', [__CLASS__, 'customize_register']);
    }

    /**
     * Add meta box to nav menus page
     *
     * @return void
     */
    public static function add_nav_menu_meta_box(): void {
        if (!ModuleManager::is_module_enabled(self::MODULE_ID)) {
            return;
        }

        add_meta_box(
            'add-query-items',
            __('Query Items', 'ab-wp-bits'),
            [__CLASS__, 'render_meta_box'],
            'nav-menus',
            'side',
            'default'
        );
    }

    /**
     * Render meta box content
     *
     * @return void
     */
    public static function render_meta_box(): void {
        global $nav_menu_selected_id;
        ?>
        <div id="menu-queries-meta-box" class="wpea-scope">
            <p class="wpea-text-muted">
                <?php esc_html_e('Add dynamic menu items based on custom queries.', 'ab-wp-bits'); ?>
            </p>

            <div class="button-controls">
                <input type="hidden" id="query-item-name" value="<?php esc_attr_e('Query Item', 'ab-wp-bits'); ?>" />
                <span class="add-to-menu">
                    <button type="button" id="add-query-item" class="button button-primary button-large submit-add-to-menu" style="width: 100%;">
                        <?php esc_html_e('Add to Menu', 'ab-wp-bits'); ?>
                    </button>
                    <span class="spinner"></span>
                </span>
            </div>

            <!-- Hidden app container for modal -->
            <div id="menu-queries-app"></div>
        </div>
        <?php
    }

    /**
     * Enqueue scripts for menu admin pages
     *
     * @param string $hook Current admin page hook
     * @return void
     */
    public static function enqueue_menu_scripts(string $hook): void {
        if (!ModuleManager::is_module_enabled(self::MODULE_ID)) {
            return;
        }

        // Only load on nav-menus.php and customize.php
        if ($hook !== 'nav-menus.php' && $hook !== 'customize.php') {
            return;
        }

        // Enqueue WPEA framework CSS
        wp_enqueue_style(
            'ab-wp-bits-wpea-resets',
            AB_WP_BITS_PLUGIN_URL . 'assets/wpea/wpea/wpea-wp-resets.css',
            [],
            AB_WP_BITS_VERSION
        );

        wp_enqueue_style(
            'ab-wp-bits-wpea-framework',
            AB_WP_BITS_PLUGIN_URL . 'assets/wpea/wpea/wpea-framework.css',
            ['ab-wp-bits-wpea-resets'],
            AB_WP_BITS_VERSION
        );

        // CSS is bundled in the JS file, no separate CSS needed

        // Enqueue Query Builder app
        wp_enqueue_script(
            'ab-menu-queries-app',
            AB_WP_BITS_PLUGIN_URL . 'admin/svelte/dist/menu-queries.js',
            [],
            AB_WP_BITS_VERSION,
            true
        );

        // Localize script with data (must be after enqueue)
        wp_localize_script('ab-menu-queries-app', 'abMenuQueriesData', [
            'apiUrl' => rest_url('ab-wp-bits/v1'),
            'nonce' => wp_create_nonce('wp_rest'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'ajaxNonce' => wp_create_nonce('add-query-menu-item'),
            'cacheTTL' => self::get_cache_ttl(),
        ]);

        // Add modal container for Customizer
        if ($hook === 'customize.php') {
            add_action('admin_footer', function() {
                echo '<div id="menu-queries-app"></div>';
            });
        }
    }

    /**
     * Enqueue scripts specifically for Customizer
     *
     * @return void
     */
    public static function enqueue_customizer_scripts(): void {
        if (!ModuleManager::is_module_enabled(self::MODULE_ID)) {
            return;
        }

        // Enqueue WPEA framework CSS
        wp_enqueue_style(
            'ab-wp-bits-wpea-resets',
            AB_WP_BITS_PLUGIN_URL . 'assets/wpea/wpea/wpea-wp-resets.css',
            [],
            AB_WP_BITS_VERSION
        );

        wp_enqueue_style(
            'ab-wp-bits-wpea-framework',
            AB_WP_BITS_PLUGIN_URL . 'assets/wpea/wpea/wpea-framework.css',
            ['ab-wp-bits-wpea-resets'],
            AB_WP_BITS_VERSION
        );

        // Enqueue Query Builder app
        wp_enqueue_script(
            'ab-menu-queries-app',
            AB_WP_BITS_PLUGIN_URL . 'admin/svelte/dist/menu-queries.js',
            [],
            AB_WP_BITS_VERSION,
            true
        );

        // Localize script with data
        wp_localize_script('ab-menu-queries-app', 'abMenuQueriesData', [
            'apiUrl' => rest_url('ab-wp-bits/v1'),
            'nonce' => wp_create_nonce('wp_rest'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'ajaxNonce' => wp_create_nonce('add-query-menu-item'),
            'cacheTTL' => self::get_cache_ttl(),
        ]);
    }

    /**
     * Add type="module" to our scripts (not needed for IIFE format)
     *
     * @param string $tag Script tag
     * @param string $handle Script handle
     * @param string $src Script source
     * @return string Modified script tag
     */
    public static function add_module_type(string $tag, string $handle, string $src): string {
        // IIFE format doesn't need type="module"
        return $tag;
    }

    /**
     * Register REST API routes
     *
     * @return void
     */
    public static function register_rest_routes(): void {
        if (!ModuleManager::is_module_enabled(self::MODULE_ID)) {
            return;
        }

        // Get post types
        register_rest_route('ab-wp-bits/v1', '/menu-queries/post-types', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_post_types'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
        ]);

        // Get taxonomies
        register_rest_route('ab-wp-bits/v1', '/menu-queries/taxonomies', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_taxonomies'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
        ]);

        // Get posts
        register_rest_route('ab-wp-bits/v1', '/menu-queries/posts', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_posts'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
        ]);

        // Get terms
        register_rest_route('ab-wp-bits/v1', '/menu-queries/terms', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_terms'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
        ]);

        // Execute query (will return false for now)
        register_rest_route('ab-wp-bits/v1', '/menu-queries/execute', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'execute_query'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
        ]);
    }

    /**
     * Check permissions
     *
     * @return bool
     */
    public static function check_permissions(): bool {
        return current_user_can('edit_theme_options');
    }

    /**
     * Get post types for REST API
     *
     * @return array
     */
    public static function get_post_types(): array {
        $post_types = get_post_types(['public' => true], 'objects');
        $result = [];

        foreach ($post_types as $post_type) {
            $result[] = [
                'value' => $post_type->name,
                'label' => $post_type->label,
            ];
        }

        return $result;
    }

    /**
     * Get taxonomies for REST API
     *
     * @return array
     */
    public static function get_taxonomies(): array {
        $taxonomies = get_taxonomies(['public' => true], 'objects');
        $result = [];

        foreach ($taxonomies as $taxonomy) {
            $result[] = [
                'value' => $taxonomy->name,
                'label' => $taxonomy->label,
            ];
        }

        return $result;
    }

    /**
     * Get posts for REST API
     *
     * @param \WP_REST_Request $request
     * @return array
     */
    public static function get_posts($request): array {
        $post_type = $request->get_param('post_type') ?: 'post';
        $search = $request->get_param('search') ?: '';

        $args = [
            'post_type' => sanitize_key($post_type),
            'posts_per_page' => 50,
            'orderby' => 'title',
            'order' => 'ASC',
        ];

        if ($search) {
            $args['s'] = sanitize_text_field($search);
        }

        $posts = get_posts($args);
        $result = [];

        foreach ($posts as $post) {
            $result[] = [
                'value' => $post->ID,
                'label' => $post->post_title,
            ];
        }

        return $result;
    }

    /**
     * Get terms for REST API
     *
     * @param \WP_REST_Request $request
     * @return array
     */
    public static function get_terms($request): array {
        $taxonomy = $request->get_param('taxonomy') ?: 'category';
        $search = $request->get_param('search') ?: '';

        $args = [
            'taxonomy' => sanitize_key($taxonomy),
            'hide_empty' => false,
            'number' => 50,
        ];

        if ($search) {
            $args['search'] = sanitize_text_field($search);
        }

        $terms = get_terms($args);
        $result = [];

        if (!is_wp_error($terms)) {
            foreach ($terms as $term) {
                $result[] = [
                    'value' => $term->term_id,
                    'label' => $term->name,
                ];
            }
        }

        return $result;
    }

    /**
     * Execute query and return results
     *
     * @param \WP_REST_Request $request
     * @return array
     */
    public static function execute_query($request): array {
        $args = $request->get_param('args');
        $query_type = $request->get_param('query_type') ?: 'post';

        if (empty($args)) {
            return [
                'success' => false,
                'message' => __('No query arguments provided', 'ab-wp-bits'),
            ];
        }

        // Extract custom flags and remove from args (not WP_Query/get_terms parameters)
        $hierarchical = !empty($args['hierarchical']);
        $include_children = !empty($args['include_children']);
        $orderby = $args['orderby'] ?? 'title';
        $order = $args['order'] ?? 'ASC';
        unset($args['hierarchical']);

        try {
            if ($query_type === 'taxonomy') {
                // For taxonomy queries, child_of already gets ALL descendants
                // parent gets only direct children
                if ($include_children && isset($args['child_of'])) {
                    // child_of already includes all descendants
                } else if (!$include_children && isset($args['parent'])) {
                    // parent only gets direct children
                }

                $terms = get_terms($args);

                if (is_wp_error($terms)) {
                    return [
                        'success' => false,
                        'message' => $terms->get_error_message(),
                    ];
                }

                // Convert terms to array format for JSON
                $results = array_map(function($term) {
                    return [
                        'term_id' => $term->term_id,
                        'name' => $term->name,
                        'slug' => $term->slug,
                        'taxonomy' => $term->taxonomy,
                        'description' => $term->description,
                        'count' => $term->count,
                        'parent' => $term->parent,
                    ];
                }, $terms);

                // Build hierarchical structure if requested
                if ($hierarchical) {
                    $results = self::build_term_hierarchy($results, 0, $orderby, $order);
                }

                return [
                    'success' => true,
                    'data' => [
                        'query_type' => 'taxonomy',
                        'count' => count($terms),
                        'results' => $results,
                    ],
                ];
            } else {
                // Execute post query
                // For posts with include_children, we need to get ALL descendants
                $parent_id = isset($args['post_parent']) ? absint($args['post_parent']) : 0;
                unset($args['include_children']);

                if ($include_children && $parent_id > 0) {
                    // Get all descendants of the parent
                    $descendant_ids = self::get_all_post_descendants($parent_id, $args['post_type']);
                    $descendant_ids[] = $parent_id; // Include the parent itself

                    // Modify query to get all descendants
                    unset($args['post_parent']);
                    $args['post__in'] = $descendant_ids;
                    $args['posts_per_page'] = -1; // Get all descendants
                }

                $query = new \WP_Query($args);

                if ($query->have_posts()) {
                    $results = [];
                    while ($query->have_posts()) {
                        $query->the_post();
                        $post_id = get_the_ID();
                        $results[] = [
                            'ID' => $post_id,
                            'post_title' => get_the_title(),
                            'post_name' => get_post_field('post_name', $post_id),
                            'post_type' => get_post_type(),
                            'post_status' => get_post_status(),
                            'post_date' => get_the_date('c'),
                            'post_author' => get_the_author(),
                            'post_parent' => wp_get_post_parent_id($post_id),
                            'permalink' => get_permalink(),
                        ];
                    }
                    wp_reset_postdata();

                    // Build hierarchical structure if requested
                    if ($hierarchical) {
                        // Find the root parent ID for hierarchy building
                        $root_parent = $parent_id > 0 ? $parent_id : 0;
                        $results = self::build_post_hierarchy($results, $root_parent, $orderby, $order);
                    }

                    return [
                        'success' => true,
                        'data' => [
                            'query_type' => 'post',
                            'found_posts' => $query->found_posts,
                            'max_num_pages' => $query->max_num_pages,
                            'count' => count($results),
                            'results' => $results,
                        ],
                    ];
                } else {
                    wp_reset_postdata();
                    return [
                        'success' => true,
                        'data' => [
                            'query_type' => 'post',
                            'found_posts' => 0,
                            'count' => 0,
                            'results' => [],
                        ],
                    ];
                }
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all descendant post IDs recursively
     *
     * @param int    $parent_id Parent post ID
     * @param string $post_type Post type to query
     * @return array Array of descendant post IDs
     */
    private static function get_all_post_descendants(int $parent_id, string $post_type): array {
        $descendants = [];

        // Get direct children
        $children = get_posts([
            'post_type' => $post_type,
            'post_parent' => $parent_id,
            'posts_per_page' => -1,
            'fields' => 'ids',
        ]);

        foreach ($children as $child_id) {
            $descendants[] = $child_id;
            // Recursively get descendants of this child
            $child_descendants = self::get_all_post_descendants($child_id, $post_type);
            $descendants = array_merge($descendants, $child_descendants);
        }

        return $descendants;
    }

    /**
     * Build hierarchical post structure with scoped ordering
     *
     * @param array  $posts Flat array of posts
     * @param int    $parent_id Parent ID to start from
     * @param string $orderby Field to order by
     * @param string $order Order direction (ASC/DESC)
     * @return array Hierarchical array
     */
    private static function build_post_hierarchy(array $posts, int $parent_id = 0, string $orderby = 'title', string $order = 'ASC'): array {
        $branch = [];

        foreach ($posts as $post) {
            if ($post['post_parent'] == $parent_id) {
                $children = self::build_post_hierarchy($posts, $post['ID'], $orderby, $order);
                if ($children) {
                    $post['children'] = $children;
                }
                $branch[] = $post;
            }
        }

        // Sort this level by the specified orderby field
        $branch = self::sort_posts_by_field($branch, $orderby, $order);

        return $branch;
    }

    /**
     * Build hierarchical term structure with scoped ordering
     *
     * @param array  $terms Flat array of terms
     * @param int    $parent_id Parent ID to start from
     * @param string $orderby Field to order by
     * @param string $order Order direction (ASC/DESC)
     * @return array Hierarchical array
     */
    private static function build_term_hierarchy(array $terms, int $parent_id = 0, string $orderby = 'name', string $order = 'ASC'): array {
        $branch = [];

        foreach ($terms as $term) {
            if ($term['parent'] == $parent_id) {
                $children = self::build_term_hierarchy($terms, $term['term_id'], $orderby, $order);
                if ($children) {
                    $term['children'] = $children;
                }
                $branch[] = $term;
            }
        }

        // Sort this level by the specified orderby field
        $branch = self::sort_terms_by_field($branch, $orderby, $order);

        return $branch;
    }

    /**
     * Sort posts array by field
     *
     * @param array  $posts Posts to sort
     * @param string $orderby Field to order by
     * @param string $order Order direction (ASC/DESC)
     * @return array Sorted posts
     */
    private static function sort_posts_by_field(array $posts, string $orderby, string $order): array {
        usort($posts, function($a, $b) use ($orderby, $order) {
            $val_a = $a[$orderby] ?? '';
            $val_b = $b[$orderby] ?? '';

            // Map WordPress orderby values to post array keys
            $field_map = [
                'title' => 'post_title',
                'date' => 'post_date',
                'name' => 'post_name',
                'author' => 'post_author',
                'ID' => 'ID',
            ];

            $field = $field_map[$orderby] ?? $orderby;
            $val_a = $a[$field] ?? '';
            $val_b = $b[$field] ?? '';

            // Natural comparison for strings, numeric for numbers
            if (is_numeric($val_a) && is_numeric($val_b)) {
                $comparison = $val_a <=> $val_b;
            } else {
                $comparison = strcasecmp((string)$val_a, (string)$val_b);
            }

            return $order === 'DESC' ? -$comparison : $comparison;
        });

        return $posts;
    }

    /**
     * Sort terms array by field
     *
     * @param array  $terms Terms to sort
     * @param string $orderby Field to order by
     * @param string $order Order direction (ASC/DESC)
     * @return array Sorted terms
     */
    private static function sort_terms_by_field(array $terms, string $orderby, string $order): array {
        usort($terms, function($a, $b) use ($orderby, $order) {
            // Map WordPress orderby values to term array keys
            $field_map = [
                'name' => 'name',
                'slug' => 'slug',
                'count' => 'count',
                'term_id' => 'term_id',
                'id' => 'term_id',
            ];

            $field = $field_map[$orderby] ?? 'name';
            $val_a = $a[$field] ?? '';
            $val_b = $b[$field] ?? '';

            // Natural comparison for strings, numeric for numbers
            if (is_numeric($val_a) && is_numeric($val_b)) {
                $comparison = $val_a <=> $val_b;
            } else {
                $comparison = strcasecmp((string)$val_a, (string)$val_b);
            }

            return $order === 'DESC' ? -$comparison : $comparison;
        });

        return $terms;
    }

    /**
     * AJAX handler to add query menu item
     *
     * @return void
     */
    public static function ajax_add_query_menu_item(): void {
        check_ajax_referer('add-query-menu-item', 'nonce');

        if (!current_user_can('edit_theme_options')) {
            wp_send_json_error(['message' => __('Insufficient permissions', 'ab-wp-bits')]);
        }

        $menu_id = absint($_POST['menu'] ?? 0);
        if (!$menu_id) {
            wp_send_json_error(['message' => __('No menu specified', 'ab-wp-bits')]);
        }

        // Create menu item
        $item_data = [
            'menu-item-title' => sanitize_text_field($_POST['title'] ?? __('Query Item', 'ab-wp-bits')),
            'menu-item-url' => '#query-item',
            'menu-item-status' => 'publish',
            'menu-item-type' => 'query_item',
            'menu-item-object' => 'query_item',
        ];

        $item_id = wp_update_nav_menu_item($menu_id, 0, $item_data);

        if (is_wp_error($item_id)) {
            wp_send_json_error(['message' => $item_id->get_error_message()]);
        }

        // Add marker meta to identify this as a query item
        update_post_meta($item_id, '_menu_item_query_type', 'query_item');

        // Get the menu item object
        $menu_item = wp_setup_nav_menu_item(get_post($item_id));

        // Render the menu item HTML using WordPress's walker
        ob_start();
        require_once ABSPATH . 'wp-admin/includes/nav-menu.php';
        $walker = new \Walker_Nav_Menu_Edit();
        echo walk_nav_menu_tree(
            [$menu_item],
            0,
            (object) ['walker' => $walker]
        );
        $menu_item_html = ob_get_clean();

        wp_send_json_success([
            'item_id' => $item_id,
            'menu_item_html' => $menu_item_html,
            'message' => __('Query item added to menu', 'ab-wp-bits'),
        ]);
    }

    /**
     * Add custom fields to menu items
     *
     * @param int    $item_id  Menu item ID
     * @param object $item     Menu item data object
     * @param int    $depth    Depth of menu item
     * @param array  $args     Menu item args
     * @return void
     */
    public static function add_menu_item_custom_fields($item_id, $item, $depth, $args): void {
        // Only show for query items
        $is_query_item = get_post_meta($item_id, '_menu_item_query_type', true) === 'query_item';
        if (!$is_query_item) {
            return;
        }

        $query_config = get_post_meta($item_id, '_menu_item_query_config', true);
        $has_config = !empty($query_config);
        ?>
        <p class="field-query-config description description-wide">
            <label>
                <?php esc_html_e('Query Configuration', 'ab-wp-bits'); ?><br />
                <button type="button"
                        class="button configure-query-button"
                        data-item-id="<?php echo esc_attr($item_id); ?>">
                    <?php echo $has_config ?
                        esc_html__('Edit Query', 'ab-wp-bits') :
                        esc_html__('Configure Query', 'ab-wp-bits'); ?>
                </button>
                <?php if ($has_config): ?>
                    <span class="wpea-badge wpea-badge--success" style="margin-left: 8px;">
                        <?php esc_html_e('Configured', 'ab-wp-bits'); ?>
                    </span>
                <?php endif; ?>
            </label>
            <input type="hidden"
                   name="menu-item-query-config[<?php echo esc_attr($item_id); ?>]"
                   id="query-config-<?php echo esc_attr($item_id); ?>"
                   value="<?php echo esc_attr($query_config); ?>" />
        </p>
        <?php
    }

    /**
     * Save menu item custom fields
     *
     * @param int $menu_id         Menu ID
     * @param int $menu_item_db_id Menu item ID
     * @return void
     */
    public static function save_menu_item_custom_fields($menu_id, $menu_item_db_id): void {
        if (!isset($_POST['menu-item-query-config'][$menu_item_db_id])) {
            return;
        }

        $query_config = $_POST['menu-item-query-config'][$menu_item_db_id];

        if (!empty($query_config)) {
            update_post_meta($menu_item_db_id, '_menu_item_query_config', wp_slash($query_config));
        } else {
            delete_post_meta($menu_item_db_id, '_menu_item_query_config');
        }
    }

    /**
     * Setup nav menu item
     *
     * @param object $menu_item
     * @return object
     */
    public static function setup_nav_menu_item($menu_item) {
        // Use db_id if available (it's the nav_menu_item post ID)
        $item_post_id = $menu_item->db_id ?? $menu_item->ID;

        // Load query config if this is a query item
        $is_query_item = get_post_meta($item_post_id, '_menu_item_query_type', true) === 'query_item';
        if ($is_query_item) {
            $menu_item->query_config = get_post_meta($item_post_id, '_menu_item_query_config', true);
            $menu_item->type_label = __('Query Item', 'ab-wp-bits');
        }
        return $menu_item;
    }

    /**
     * Register Customizer support for Query Items
     *
     * @param WP_Customize_Manager $wp_customize
     * @return void
     */
    public static function customize_register($wp_customize): void {
        // Add Query Items to the available menu items in Customizer
        // This requires using the nav_menus component which handles this automatically
        // We just need to make sure our query items are recognized as a valid item type

        // Register custom item type for Customizer
        add_filter('customize_nav_menu_available_item_types', function($item_types) {
            $item_types[] = [
                'type' => 'query_item',
                'object' => 'query_item',
                'title' => __('Query Items', 'ab-wp-bits'),
            ];
            return $item_types;
        });

        // Provide available query items
        add_filter('customize_nav_menu_available_items', function($items, $type, $object, $page) {
            if ('query_item' === $type) {
                $items[] = [
                    'id' => 'query_item',
                    'title' => __('Query Item', 'ab-wp-bits'),
                    'type' => 'query_item',
                    'type_label' => __('Query Item', 'ab-wp-bits'),
                    'object' => 'query_item',
                    'object_id' => 0,
                    'url' => '#query-item',
                ];
            }
            return $items;
        }, 10, 4);

        // Handle saving query items in Customizer
        add_filter('customize_nav_menu_item_value', function($value, $item_type) {
            if (isset($value['type']) && $value['type'] === 'query_item') {
                $value['type_label'] = __('Query Item', 'ab-wp-bits');
            }
            return $value;
        }, 10, 2);

        // Set meta when query items are saved via Customizer
        add_action('wp_update_nav_menu_item', function($menu_id, $menu_item_db_id, $args) {
            if (isset($args['menu-item-type']) && $args['menu-item-type'] === 'query_item') {
                update_post_meta($menu_item_db_id, '_menu_item_query_type', 'query_item');

                // Save query config if provided
                if (isset($args['query_config']) && !empty($args['query_config'])) {
                    update_post_meta($menu_item_db_id, '_menu_item_query_config', wp_slash($args['query_config']));
                }
            }
        }, 10, 3);

        // Load query_config in Customizer menu item settings
        // Run at priority 100 to ensure WordPress has already set up all base properties
        add_filter('customize_nav_menu_item_setting_args', function($args, $item_id) {
            // Skip if args are empty or invalid
            if (empty($args) || !is_array($args)) {
                return $args;
            }

            // Skip if this filter already ran (prevent double processing)
            if (isset($args['_query_config_loaded'])) {
                return $args;
            }

            // Only add query_config if this is a query item
            $is_query_item = get_post_meta($item_id, '_menu_item_query_type', true) === 'query_item';
            if ($is_query_item) {
                $query_config = get_post_meta($item_id, '_menu_item_query_config', true);
                if ($query_config) {
                    $args['query_config'] = $query_config;
                }
            }

            // Mark as processed
            $args['_query_config_loaded'] = true;

            return $args;
        }, 100, 2);
    }

    /**
     * Expand query menu items into actual menu items
     *
     * @param array $items  Menu items
     * @param object $menu  Menu object
     * @param array  $args  Menu arguments
     * @return array Modified menu items
     */
    public static function expand_query_menu_items($items, $menu, $args): array {
        // Don't expand in admin at all (including Customizer controls panel)
        // Only expand on actual frontend or preview iframe
        if (is_admin()) {
            return $items;
        }

        // Also check if we're in Customizer preview (this is the iframe)
        // vs Customizer controls (the left panel)
        global $wp_customize;
        if (isset($wp_customize) && !is_customize_preview()) {
            return $items;
        }

        if (!is_array($items)) {
            return $items;
        }

        $expanded_items = [];
        $item_counter = 9999; // Start counter high to avoid conflicts

        foreach ($items as $item) {
            // Use db_id which is the actual nav_menu_item post ID
            $item_post_id = $item->db_id ?? $item->ID;

            // Check if this is a query item
            $is_query_item = get_post_meta($item_post_id, '_menu_item_query_type', true) === 'query_item';

            if (!$is_query_item) {
                $expanded_items[] = $item;
                continue;
            }

            // Load query config
            $query_config_json = get_post_meta($item_post_id, '_menu_item_query_config', true);

            if (empty($query_config_json)) {
                // No config, keep the placeholder item
                $expanded_items[] = $item;
                continue;
            }

            // WordPress may have added slashes, try to unescape
            $config = json_decode($query_config_json, true);

            // If that fails, try stripping slashes
            if (!$config) {
                $query_config_json = stripslashes($query_config_json);
                $config = json_decode($query_config_json, true);
            }

            if (!$config) {
                $expanded_items[] = $item;
                continue;
            }

            if (!isset($config['rawWPQuery']) || empty($config['rawWPQuery'])) {
                $expanded_items[] = $item;
                continue;
            }

            // Execute the query
            $query_args = json_decode($config['rawWPQuery'], true);
            if (!$query_args) {
                $expanded_items[] = $item;
                continue;
            }

            $query_type = $config['queryType'] ?? 'post';
            $hierarchical = $config['hierarchical'] ?? false;
            $show_label_on_empty = $config['showLabelOnEmpty'] ?? false;
            $empty_label = $config['emptyLabel'] ?? '';

            // Execute query and get results
            $results = self::execute_menu_query($query_args, $query_type, $hierarchical);

            // Handle empty results
            if (empty($results)) {
                if ($show_label_on_empty && !empty($empty_label)) {
                    // Show the empty label as the menu item
                    $item->title = $empty_label;
                    $item->url = '#';
                    $expanded_items[] = $item;
                }
                // If no label, just skip this menu item entirely
                continue;
            }

            // Convert results to menu items
            // Replace the query item with actual results (use item's parent, not the item itself)
            $child_items = self::results_to_menu_items($results, $item, $item_counter, $query_type, 0, $item->menu_item_parent);
            $expanded_items = array_merge($expanded_items, $child_items);
        }

        return $expanded_items;
    }

    /**
     * Execute menu query and return results
     *
     * @param array  $args Query arguments
     * @param string $query_type Query type (post/taxonomy)
     * @param bool   $hierarchical Whether to build hierarchy
     * @return array Results
     */
    private static function execute_menu_query(array $args, string $query_type, bool $hierarchical): array {
        $orderby = $args['orderby'] ?? 'title';
        $order = $args['order'] ?? 'ASC';
        $include_children = !empty($args['include_children']);

        unset($args['hierarchical']);
        unset($args['include_children']);

        try {
            if ($query_type === 'taxonomy') {
                $terms = get_terms($args);
                if (is_wp_error($terms)) {
                    return [];
                }

                $results = array_map(function($term) {
                    return [
                        'term_id' => $term->term_id,
                        'name' => $term->name,
                        'slug' => $term->slug,
                        'taxonomy' => $term->taxonomy,
                        'parent' => $term->parent,
                        'url' => get_term_link($term),
                    ];
                }, $terms);

                if ($hierarchical) {
                    $results = self::build_term_hierarchy($results, 0, $orderby, $order);
                }

                return $results;
            } else {
                // Post query
                $parent_id = isset($args['post_parent']) ? absint($args['post_parent']) : 0;

                if ($include_children && $parent_id > 0) {
                    $descendant_ids = self::get_all_post_descendants($parent_id, $args['post_type']);
                    $descendant_ids[] = $parent_id;
                    unset($args['post_parent']);
                    $args['post__in'] = $descendant_ids;
                    $args['posts_per_page'] = -1;
                }

                $query = new \WP_Query($args);
                $results = [];

                if ($query->have_posts()) {
                    while ($query->have_posts()) {
                        $query->the_post();
                        $post_id = get_the_ID();
                        $results[] = [
                            'ID' => $post_id,
                            'post_title' => get_the_title(),
                            'post_parent' => wp_get_post_parent_id($post_id),
                            'url' => get_permalink(),
                        ];
                    }
                    wp_reset_postdata();

                    if ($hierarchical) {
                        $root_parent = $parent_id > 0 ? $parent_id : 0;
                        $results = self::build_post_hierarchy($results, $root_parent, $orderby, $order);
                    }
                }

                return $results;
            }
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Convert query results to menu items
     *
     * @param array  $results Query results
     * @param object $parent_item Parent menu item
     * @param int    &$counter Item ID counter
     * @param string $query_type Query type
     * @param int    $parent_id Parent menu item ID (0 for top level)
     * @param int    $query_item_id The query item's db_id (used for first level)
     * @param int    &$menu_order_counter Menu order counter
     * @return array Menu items
     */
    private static function results_to_menu_items(array $results, $parent_item, &$counter, string $query_type, int $parent_id = 0, int $query_item_id = 0, &$menu_order_counter = null): array {
        $menu_items = [];

        // Initialize menu order counter if not set
        if ($menu_order_counter === null) {
            $menu_order_counter = $parent_item->menu_order;
        }

        foreach ($results as $result) {
            $item = new \stdClass();
            $item->ID = ++$counter;
            $item->db_id = $counter;
            // For first level (parent_id=0), use query_item_id; for children use parent_id
            $item->menu_item_parent = $parent_id > 0 ? $parent_id : $query_item_id;
            $item->menu_order = ++$menu_order_counter;
            $item->post_parent = 0;
            $item->object_id = $query_type === 'taxonomy' ? $result['term_id'] : $result['ID'];
            $item->object = $query_type === 'taxonomy' ? $result['taxonomy'] ?? 'category' : 'page';
            $item->type = $query_type === 'taxonomy' ? 'taxonomy' : 'post_type';
            $item->type_label = $query_type === 'taxonomy' ? __('Taxonomy', 'ab-wp-bits') : __('Post', 'ab-wp-bits');
            $item->title = $query_type === 'taxonomy' ? $result['name'] : $result['post_title'];
            $item->url = $result['url'];
            $item->target = '';
            $item->attr_title = '';
            $item->description = '';
            $item->classes = ['menu-item'];
            $item->xfn = '';
            $item->current = false;
            $item->current_item_ancestor = false;
            $item->current_item_parent = false;
            $item->_invalid = false;

            $menu_items[] = $item;

            // Handle children if hierarchical
            if (isset($result['children']) && !empty($result['children'])) {
                $child_items = self::results_to_menu_items(
                    $result['children'],
                    $parent_item,
                    $counter,
                    $query_type,
                    $item->ID,
                    $query_item_id,
                    $menu_order_counter
                );
                $menu_items = array_merge($menu_items, $child_items);
            }
        }

        return $menu_items;
    }

    /**
     * Render settings page
     *
     * @return void
     */
    public static function render_settings(): void {
        if (!current_user_can('manage_options')) {
            return;
        }

        // Handle form submission
        if (isset($_POST['ab_menu_queries_settings_nonce']) &&
            wp_verify_nonce($_POST['ab_menu_queries_settings_nonce'], 'ab_menu_queries_settings')) {

            $cache_ttl = absint($_POST['cache_ttl'] ?? 300);
            update_option('ab_menu_queries_cache_ttl', $cache_ttl);

            if (isset($_POST['clear_cache'])) {
                self::clear_cache();
                echo '<div class="notice notice-success"><p>' .
                     esc_html__('Cache cleared successfully.', 'ab-wp-bits') . '</p></div>';
            } else {
                echo '<div class="notice notice-success"><p>' .
                     esc_html__('Settings saved.', 'ab-wp-bits') . '</p></div>';
            }
        }

        $cache_ttl = self::get_cache_ttl();
        ?>
        <div class="wrap wpea-scope">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <form method="post" action="">
                <?php wp_nonce_field('ab_menu_queries_settings', 'ab_menu_queries_settings_nonce'); ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="cache_ttl"><?php esc_html_e('Cache TTL (seconds)', 'ab-wp-bits'); ?></label>
                        </th>
                        <td>
                            <input type="number"
                                   id="cache_ttl"
                                   name="cache_ttl"
                                   value="<?php echo esc_attr($cache_ttl); ?>"
                                   min="0"
                                   class="regular-text" />
                            <p class="description">
                                <?php esc_html_e('How long to cache query results (default: 300 seconds).', 'ab-wp-bits'); ?>
                            </p>
                        </td>
                    </tr>
                </table>

                <p class="submit">
                    <?php submit_button(__('Save Settings', 'ab-wp-bits'), 'primary', 'submit', false); ?>
                    <?php submit_button(__('Clear Cache', 'ab-wp-bits'), 'secondary', 'clear_cache', false); ?>
                </p>
            </form>
        </div>
        <?php
    }

    /**
     * Get cache TTL
     *
     * @return int
     */
    private static function get_cache_ttl(): int {
        return absint(get_option('ab_menu_queries_cache_ttl', 300));
    }

    /**
     * Clear cache
     *
     * @return void
     */
    private static function clear_cache(): void {
        // Will implement cache clearing later
    }

    /**
     * Get module logo SVG
     *
     * @return string
     */
    private static function get_logo(): string {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
        </svg>';
    }
}
