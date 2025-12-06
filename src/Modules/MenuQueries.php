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

        // Save query_config when Customizer saves menu items
        // Use customize_save which fires when Customizer publishes/saves
        add_action('customize_save', [__CLASS__, 'save_customizer_query_configs'], 100);

        // Setup nav menu item
        add_filter('wp_setup_nav_menu_item', [__CLASS__, 'setup_nav_menu_item']);

        // Convert query items to arrays for Customizer compatibility
        add_filter('wp_get_nav_menu_items', [__CLASS__, 'convert_query_items_to_arrays'], 999, 3);

        // Add AJAX handler for adding query items
        add_action('wp_ajax_add_query_menu_item', [__CLASS__, 'ajax_add_query_menu_item']);

        // Filter menu items to expand query items (run at priority 5, before convert_query_items_to_arrays at 999)
        add_filter('wp_get_nav_menu_items', [__CLASS__, 'expand_query_menu_items'], 5, 3);

        // Debug filter to see what items the walker receives
        add_filter('wp_nav_menu_objects', [__CLASS__, 'debug_walker_items'], 10, 2);

        // Debug filter at the very end to see what HTML is generated
        add_filter('wp_nav_menu_items', [__CLASS__, 'debug_rendered_items'], 10, 2);

        // Add Query Items support to Customizer
        add_action('customize_register', [__CLASS__, 'register_customizer_support']);

        // Register Customizer filter early - MUST be before customize_register runs
        $result = add_filter('customize_nav_menu_item_setting_args', [__CLASS__, 'customize_nav_menu_item_setting_args'], 5, 2);
        error_log('MenuQueries: Filter registration result: ' . ($result ? 'TRUE' : 'FALSE'));
        error_log('MenuQueries: Method exists: ' . (method_exists(__CLASS__, 'customize_nav_menu_item_setting_args') ? 'YES' : 'NO'));

        // Ensure query items always have required meta fields set correctly
        add_action('wp_update_nav_menu_item', [__CLASS__, 'ensure_query_item_url'], 10, 2);

        // Fix any existing query items with invalid type (one-time migration)
        add_action('init', [__CLASS__, 'fix_existing_query_items'], 999);

        // Clear menu cache early when Customizer is loading
        add_action('wp_loaded', function() {
            if (is_customize_preview() || (isset($_REQUEST['customize_theme']) || isset($_REQUEST['customize_messenger_channel']))) {
                self::clear_menu_cache_for_customizer();
            }
        }, 1);
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

        // Save query config for a menu item (used by Customizer)
        register_rest_route('ab-wp-bits/v1', '/menu-queries/save-config', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'save_query_config_via_api'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
            'args' => [
                'menu_item_id' => [
                    'required' => true,
                    'type' => 'integer',
                ],
                'query_config' => [
                    'required' => true,
                    'type' => 'string',
                ],
            ],
        ]);

        // Get query config for a menu item (used by Customizer)
        register_rest_route('ab-wp-bits/v1', '/menu-queries/get-config', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_query_config_via_api'],
            'permission_callback' => [__CLASS__, 'check_permissions'],
            'args' => [
                'menu_item_id' => [
                    'required' => true,
                    'type' => 'integer',
                ],
            ],
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
     * Save query config via REST API (used by Customizer)
     *
     * @param WP_REST_Request $request
     * @return array
     */
    public static function save_query_config_via_api($request): array {
        error_log('MenuQueries: ========== REST API SAVE START ==========');

        $menu_item_id = $request->get_param('menu_item_id');
        $query_config = $request->get_param('query_config');

        error_log("MenuQueries: menu_item_id: $menu_item_id");
        error_log("MenuQueries: query_config type: " . gettype($query_config));
        error_log("MenuQueries: query_config length: " . strlen($query_config));
        error_log("MenuQueries: query_config (first 200 chars): " . substr($query_config, 0, 200));

        // Validate it's valid JSON
        $parsed = json_decode($query_config, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("MenuQueries: ERROR - Invalid JSON: " . json_last_error_msg());
            return [
                'success' => false,
                'message' => 'Invalid JSON: ' . json_last_error_msg(),
            ];
        }

        error_log("MenuQueries: Parsed query keys: " . implode(', ', array_keys($parsed)));

        // Save the raw WP_Query JSON to post meta
        $result = update_post_meta($menu_item_id, '_menu_item_query_config', $query_config);
        error_log("MenuQueries: update_post_meta result for query_config: " . ($result ? 'SUCCESS' : 'NO_CHANGE'));

        // Also set the query_type meta
        $type_result = update_post_meta($menu_item_id, '_menu_item_query_type', 'query_item');
        error_log("MenuQueries: update_post_meta result for query_type: " . ($type_result ? 'SUCCESS' : 'NO_CHANGE'));

        // Verify what was saved
        $saved_value = get_post_meta($menu_item_id, '_menu_item_query_config', true);
        error_log("MenuQueries: Verification - saved value (first 200 chars): " . substr($saved_value, 0, 200));
        error_log("MenuQueries: Verification - values match: " . ($saved_value === $query_config ? 'YES' : 'NO'));

        error_log('MenuQueries: ========== REST API SAVE END ==========');

        return [
            'success' => true,
            'message' => __('Query configuration saved', 'ab-wp-bits'),
        ];
    }

    /**
     * Get query config via REST API (used by Customizer)
     *
     * @param WP_REST_Request $request
     * @return array
     */
    public static function get_query_config_via_api($request): array {
        $menu_item_id = $request->get_param('menu_item_id');

        error_log("MenuQueries: GET config for item $menu_item_id");

        // Get from post meta
        $query_config = get_post_meta($menu_item_id, '_menu_item_query_config', true);

        error_log("MenuQueries: Retrieved config: " . ($query_config ? substr($query_config, 0, 100) : 'EMPTY'));

        return [
            'success' => true,
            'query_config' => $query_config ?: '',
        ];
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
        // Use 'custom' type since WordPress doesn't recognize 'query_item'
        // We identify query items via the _menu_item_query_type meta instead
        $item_data = [
            'menu-item-title' => sanitize_text_field($_POST['title'] ?? __('Query Item', 'ab-wp-bits')),
            'menu-item-url' => '#query-item',
            'menu-item-status' => 'publish',
            'menu-item-type' => 'custom',
            'menu-item-object' => 'custom',
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
            // Don't use wp_slash() - update_post_meta already handles escaping
            update_post_meta($menu_item_db_id, '_menu_item_query_config', $query_config);
        } else {
            delete_post_meta($menu_item_db_id, '_menu_item_query_config');
        }
    }

    /**
     * Save menu item when saved via Customizer
     * The Customizer sends item data as an array, including our custom query_config
     *
     * @param int   $menu_item_db_id Menu item ID
     * @param array $item_data       Menu item data from Customizer
     * @return void
     */
    public static function save_customizer_query_configs($wp_customize) {
        error_log("MenuQueries: ==================== customize_save FIRED ====================");

        // Get all settings
        $settings = $wp_customize->settings();
        error_log("MenuQueries: Total settings count: " . count($settings));

        $nav_menu_item_count = 0;
        $saved_count = 0;
        $all_nav_item_ids = [];

        foreach ($settings as $setting_id => $setting) {
            // Only process nav_menu_item settings
            if (strpos($setting_id, 'nav_menu_item[') !== 0) {
                continue;
            }

            $nav_menu_item_count++;

            // Get the menu item ID
            $menu_item_db_id = $setting->post_id;
            $all_nav_item_ids[] = $menu_item_db_id;

            // Try post_value first (for changed items), then fall back to value (current state)
            $value = $setting->post_value();
            $source = 'post_value';
            if (!$value) {
                $value = $setting->value();
                $source = 'value';
            }

            if (!$value) {
                error_log("MenuQueries: Item $menu_item_db_id has no value at all");
                continue;
            }

            // Special logging for item 927
            if ($menu_item_db_id == 927) {
                error_log("MenuQueries: Item 927 found! Source: $source");
                error_log("MenuQueries: Item 927 keys: " . implode(', ', array_keys($value)));
                error_log("MenuQueries: Item 927 query_config exists: " . (isset($value['query_config']) ? 'YES' : 'NO'));
                if (isset($value['query_config'])) {
                    error_log("MenuQueries: Item 927 query_config value: " . substr($value['query_config'], 0, 100));
                }
            }

            // Check if this item has query_config
            if (isset($value['query_config']) && !empty($value['query_config'])) {
                error_log("MenuQueries: *** FOUND query_config for item $menu_item_db_id ***");
                error_log("MenuQueries: query_config value: " . substr($value['query_config'], 0, 150));

                // Save to post meta
                update_post_meta($menu_item_db_id, '_menu_item_query_config', $value['query_config']);
                update_post_meta($menu_item_db_id, '_menu_item_query_type', 'query_item');

                $saved_count++;
                error_log("MenuQueries: Successfully saved query_config for item $menu_item_db_id");
            }
        }

        error_log("MenuQueries: Processed $nav_menu_item_count nav_menu_items, saved $saved_count query_configs");
        error_log("MenuQueries: Nav item IDs found: " . implode(', ', $all_nav_item_ids));
        error_log("MenuQueries: ==================== customize_save COMPLETE ====================");
    }

    /**
     * Convert query items to arrays for Customizer compatibility
     * This runs after wp_setup_nav_menu_item and ensures query items work in Customizer
     *
     * @param array $items
     * @param object $menu
     * @param array $args
     * @return array
     */
    public static function convert_query_items_to_arrays($items, $menu, $args) {
        error_log("MenuQueries: convert_query_items_to_arrays called with " . count($items) . " items, menu=" . (is_object($menu) ? $menu->term_id : 'null'));

        if (!is_array($items)) {
            error_log("MenuQueries: Items is not an array, returning as-is");
            return $items;
        }

        $has_query_items = false;
        foreach ($items as $key => $item) {
            if (!is_object($item)) {
                error_log("MenuQueries: Item $key is not an object: " . gettype($item));
                continue;
            }

            // Log item details
            $item_id = isset($item->ID) ? $item->ID : (isset($item->db_id) ? $item->db_id : 'unknown');
            $has_query_config = isset($item->query_config);
            $meta_check = isset($item->ID) ? get_post_meta($item->ID, '_menu_item_query_type', true) : 'no-ID';

            error_log("MenuQueries: Item #$item_id - has query_config=$has_query_config, meta_check=$meta_check, type=" . (isset($item->type) ? $item->type : 'unknown'));

            $is_query_item = isset($item->query_config) || (isset($item->ID) && get_post_meta($item->ID, '_menu_item_query_type', true) === 'query_item');

            if ($is_query_item) {
                $has_query_items = true;
                error_log("MenuQueries: Converting query item #{$item->ID} to array for Customizer");

                // Cast to array first
                $item_array = (array) $item;

                // Add required Customizer properties that didn't survive the cast
                $item_array['status'] = $item->post_status;
                $item_array['position'] = $item->menu_order;
                $item_array['_invalid'] = false;

                // Ensure classes is an array (WordPress expects this)
                if (isset($item_array['classes']) && !is_array($item_array['classes'])) {
                    $item_array['classes'] = [];
                }

                // Convert back to object (stdClass, not WP_Post)
                $items[$key] = (object) $item_array;

                error_log("MenuQueries: Converted - status={$items[$key]->status}, has query_config=" . (isset($items[$key]->query_config) ? 'YES' : 'NO'));
            }
        }

        if (!$has_query_items) {
            error_log("MenuQueries: No query items found in this batch");
        }

        return $items;
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
            error_log("MenuQueries: Processing query item #{$item_post_id}");

            $menu_item->query_config = get_post_meta($item_post_id, '_menu_item_query_config', true);
            error_log("MenuQueries: Loaded query_config from DB for item #{$item_post_id}: " . substr($menu_item->query_config, 0, 100));
            $menu_item->type_label = __('Query Item', 'ab-wp-bits');

            // CRITICAL: WordPress's populate_value() doesn't run properly for our items
            // So we must manually add the Customizer-required properties
            // These will be included when WordPress casts the object to array
            $menu_item->status = $menu_item->post_status;
            $menu_item->position = $menu_item->menu_order;
            $menu_item->_invalid = false;

            // Ensure classes is an array (WordPress expects this)
            if (!is_array($menu_item->classes)) {
                $menu_item->classes = [];
            }

            error_log("MenuQueries: Added status={$menu_item->status}, position={$menu_item->position}");
        }
        return $menu_item;
    }

    /**
     * Ensure query items have the required meta fields set correctly
     * This fixes any query items that were created with invalid 'query_item' type
     *
     * @param int $menu_id         Menu ID
     * @param int $menu_item_db_id Menu item ID
     * @return void
     */
    public static function ensure_query_item_url($menu_id, $menu_item_db_id): void {
        $is_query_item = get_post_meta($menu_item_db_id, '_menu_item_query_type', true) === 'query_item';

        if ($is_query_item) {
            // Fix URL if empty
            $current_url = get_post_meta($menu_item_db_id, '_menu_item_url', true);
            if (empty($current_url)) {
                update_post_meta($menu_item_db_id, '_menu_item_url', '#query-item');
            }

            // Fix type if it's set to invalid 'query_item' - must be 'custom' for WordPress
            $current_type = get_post_meta($menu_item_db_id, '_menu_item_type', true);
            if ($current_type === 'query_item') {
                update_post_meta($menu_item_db_id, '_menu_item_type', 'custom');
            }

            // Fix object if it's set to invalid 'query_item'
            $current_object = get_post_meta($menu_item_db_id, '_menu_item_object', true);
            if ($current_object === 'query_item') {
                update_post_meta($menu_item_db_id, '_menu_item_object', 'custom');
            }
        }
    }

    /**
     * Fix existing query items that have invalid 'query_item' type
     * This is a one-time migration to fix items created before the fix
     *
     * @return void
     */
    public static function fix_existing_query_items(): void {
        // Get all nav menu items that are query items
        $query_items = get_posts([
            'post_type' => 'nav_menu_item',
            'posts_per_page' => -1,
            'meta_query' => [
                [
                    'key' => '_menu_item_query_type',
                    'value' => 'query_item'
                ]
            ],
            'fields' => 'ids'
        ]);

        if (empty($query_items)) {
            return;
        }

        error_log('MenuQueries: Fixing ' . count($query_items) . ' existing query items');

        foreach ($query_items as $item_id) {
            // Fix type if it's set to invalid 'query_item'
            $current_type = get_post_meta($item_id, '_menu_item_type', true);
            if ($current_type === 'query_item') {
                update_post_meta($item_id, '_menu_item_type', 'custom');
                error_log("MenuQueries: Fixed type for item $item_id");
            }

            // Fix object if it's set to invalid 'query_item'
            $current_object = get_post_meta($item_id, '_menu_item_object', true);
            if ($current_object === 'query_item') {
                update_post_meta($item_id, '_menu_item_object', 'custom');
                error_log("MenuQueries: Fixed object for item $item_id");
            }

            // Ensure URL is set
            $current_url = get_post_meta($item_id, '_menu_item_url', true);
            if (empty($current_url)) {
                update_post_meta($item_id, '_menu_item_url', '#query-item');
                error_log("MenuQueries: Fixed URL for item $item_id");
            }
        }
    }

    /**
     * Filter Customizer nav menu item setting args to add query item support
     *
     * @param array $args    Menu item setting arguments
     * @param int   $item_id Menu item ID
     * @return array
     */
    public static function customize_nav_menu_item_setting_args($args, $item_id): array {
        error_log('MenuQueries: Filter called for item ' . $item_id);

        // Check if this is a query item
        $is_query_item = get_post_meta($item_id, '_menu_item_query_type', true) === 'query_item';

        error_log('MenuQueries: Is query item: ' . ($is_query_item ? 'YES' : 'NO'));

        if ($is_query_item) {
            error_log('MenuQueries: Args BEFORE: ' . print_r($args, true));

            // Get the post to check its status
            $post = get_post($item_id);

            // Ensure all required properties for Customizer
            // Use 'custom' type since WordPress doesn't recognize 'query_item'
            $args['status'] = $post ? $post->post_status : 'publish';
            $args['type'] = 'custom';
            $args['object'] = 'custom';
            $args['url'] = '#query-item';
            $args['title'] = $args['title'] ?? get_the_title($item_id);
            $args['attr_title'] = $args['attr_title'] ?? '';
            $args['description'] = $args['description'] ?? '';
            $args['classes'] = $args['classes'] ?? '';
            $args['xfn'] = $args['xfn'] ?? '';
            $args['target'] = $args['target'] ?? '';

            // Add query config if available
            $query_config = get_post_meta($item_id, '_menu_item_query_config', true);
            if ($query_config) {
                $args['query_config'] = $query_config;
            }

            error_log('MenuQueries: Args AFTER: ' . print_r($args, true));
        }

        return $args;
    }

    /**
     * Clear menu cache before Customizer loads
     * This ensures query items are fresh and have all required properties
     *
     * @return void
     */
    public static function clear_menu_cache_for_customizer(): void {
        error_log('MenuQueries: Clearing menu cache for Customizer');

        // Get all menus
        $menus = wp_get_nav_menus();

        foreach ($menus as $menu) {
            // Clear the cache for each menu
            wp_cache_delete($menu->term_id, 'nav_menu_items');
            error_log("MenuQueries: Cleared cache for menu {$menu->term_id}");
        }
    }

    /**
     * Register Customizer support for Query Items
     * Adds Query Items to the "Add Items" panel in Customizer
     *
     * @param WP_Customize_Manager $wp_customize
     * @return void
     */
    public static function register_customizer_support($wp_customize): void {
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
        // Convert query_item type to custom type for proper rendering
        add_filter('customize_nav_menu_item_value', function($value, $item_type) {
            if (isset($value['type']) && $value['type'] === 'query_item') {
                // Convert to custom type so WordPress saves it correctly
                $value['type'] = 'custom';
                $value['object'] = 'custom';
                $value['type_label'] = __('Query Item', 'ab-wp-bits');

                // Ensure URL is set
                if (empty($value['url'])) {
                    $value['url'] = '#query-item';
                }
            }
            return $value;
        }, 10, 2);

        // Set meta when query items are saved via Customizer
        add_action('wp_update_nav_menu_item', function($menu_id, $menu_item_db_id, $args) {
            // Check if this is a query item (type is now 'custom' with url '#query-item')
            $is_query_item = (isset($args['menu-item-type']) && $args['menu-item-type'] === 'custom' &&
                             isset($args['menu-item-url']) && $args['menu-item-url'] === '#query-item');

            if ($is_query_item) {
                update_post_meta($menu_item_db_id, '_menu_item_query_type', 'query_item');

                // Save query config if provided
                if (isset($args['query_config']) && !empty($args['query_config'])) {
                    update_post_meta($menu_item_db_id, '_menu_item_query_config', wp_slash($args['query_config']));
                }
            }
        }, 10, 3);
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
        // Only expand on frontend or Customizer preview iframe
        // Don't expand in admin (Appearance->Menus) or Customizer controls panel

        // Simple check: is_admin() returns false in the Customizer preview iframe
        // but true in both Appearance->Menus and Customizer controls panel
        if (is_admin()) {
            return $items;
        }

        error_log("MenuQueries: EXPANDING in preview/frontend - " . count($items) . " items");

        if (!is_array($items)) {
            return $items;
        }

        $expanded_items = [];
        $item_counter = 9999; // Start counter high to avoid conflicts

        $logged_real_item = false;
        foreach ($items as $item) {
            // Use db_id which is the actual nav_menu_item post ID
            $item_post_id = $item->db_id ?? $item->ID;

            // Check if this is a query item
            $is_query_item = get_post_meta($item_post_id, '_menu_item_query_type', true) === 'query_item';

            if (!$is_query_item) {
                // Log first real menu item for comparison
                if (!$logged_real_item) {
                    error_log("MenuQueries: Real menu item - " . json_encode([
                        'ID' => $item->ID,
                        'db_id' => $item->db_id ?? 'not set',
                        'title' => $item->title,
                        'type' => $item->type,
                        'object' => $item->object,
                        'object_id' => $item->object_id,
                        'url' => $item->url,
                        'post_type' => $item->post_type ?? 'not set',
                        'post_status' => $item->post_status ?? 'not set',
                    ]));
                    $logged_real_item = true;
                }
                $expanded_items[] = $item;
                continue;
            }

            // Load query config (this IS the rawWPQuery now - single source of truth)
            $query_config_json = get_post_meta($item_post_id, '_menu_item_query_config', true);

            if (empty($query_config_json)) {
                // No config, keep the placeholder item
                $expanded_items[] = $item;
                continue;
            }

            // WordPress may have added slashes, try to unescape
            $query_args = json_decode($query_config_json, true);

            // If that fails, try stripping slashes
            if (!$query_args) {
                $query_config_json = stripslashes($query_config_json);
                $query_args = json_decode($query_config_json, true);
            }

            if (!$query_args) {
                $expanded_items[] = $item;
                continue;
            }

            // Determine query type from the args
            $query_type = isset($query_args['taxonomy']) ? 'taxonomy' : 'post';
            $hierarchical = $query_args['hierarchical'] ?? false;

            // Note: showLabelOnEmpty and emptyLabel are not in WP_Query args
            // For now, default to not showing empty labels
            $show_label_on_empty = false;
            $empty_label = '';

            // Execute query and get results
            $results = self::execute_menu_query($query_args, $query_type, $hierarchical);

            // Handle empty results
            if (empty($results)) {
                if ($show_label_on_empty && !empty($empty_label)) {
                    // Show the empty label as the menu item
                    $item->title = $empty_label;
                    $item->url = '#';
                    // Ensure Customizer properties are set
                    $item->status = $item->post_status;
                    $item->position = $item->menu_order;
                    $item->_invalid = false;
                    $expanded_items[] = $item;
                }
                // If no label, just skip this menu item entirely
                continue;
            }

            // Get post_type for post queries (needed for menu item object property)
            $post_type = $query_type === 'post' ? ($query_args['post_type'] ?? 'post') : '';

            // Convert results to menu items
            // Replace the query item with actual results (use item's parent, not the item itself)
            $menu_order_counter = null;
            $child_items = self::results_to_menu_items($results, $item, $item_counter, $query_type, 0, $item->menu_item_parent, $menu_order_counter, $post_type);
            error_log("MenuQueries: Created " . count($child_items) . " child items from query");
            $expanded_items = array_merge($expanded_items, $child_items);
        }

        error_log("MenuQueries: Returning " . count($expanded_items) . " total items (from " . count($items) . " original)");

        // Log the args to see what walker is being used
        error_log("MenuQueries: Menu args - " . print_r($args, true));

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
     * @param string $post_type Post type for post queries
     * @return array Menu items
     */
    private static function results_to_menu_items(array $results, $parent_item, &$counter, string $query_type, int $parent_id = 0, int $query_item_id = 0, &$menu_order_counter = null, string $post_type = 'post'): array {
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
            $item->object = $query_type === 'taxonomy' ? $result['taxonomy'] ?? 'category' : $post_type;
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

            // Add required Customizer properties
            $item->status = 'publish';
            $item->position = $item->menu_order;
            $item->post_status = 'publish';

            // Add WordPress post properties that might be needed for rendering
            $item->post_type = 'nav_menu_item';
            $item->post_name = sanitize_title($item->title);
            $item->post_title = $item->title;
            $item->filter = 'raw';

            // Log what we're creating
            if ($counter == 10000) {
                error_log("MenuQueries: Created first query item - " . json_encode([
                    'ID' => $item->ID,
                    'db_id' => $item->db_id,
                    'title' => $item->title,
                    'type' => $item->type,
                    'object' => $item->object,
                    'object_id' => $item->object_id,
                    'url' => $item->url,
                    'post_type' => $item->post_type,
                    'post_status' => $item->post_status,
                ]));
            }

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
                    $menu_order_counter,
                    $post_type
                );
                $menu_items = array_merge($menu_items, $child_items);
            }
        }

        return $menu_items;
    }

    /**
     * Debug filter to see what items the walker receives
     */
    public static function debug_walker_items($items, $args) {
        error_log("MenuQueries: wp_nav_menu_objects filter - Walker receiving " . count($items) . " items");

        $query_item_count = 0;
        foreach ($items as $item) {
            if (isset($item->ID) && $item->ID >= 10000) {
                $query_item_count++;
            }
        }
        error_log("MenuQueries: Walker has $query_item_count query items (IDs >= 10000)");

        return $items;
    }

    /**
     * Debug filter to see what HTML was generated
     */
    public static function debug_rendered_items($items, $args) {
        error_log("MenuQueries: wp_nav_menu_items filter - Received HTML with " . strlen($items) . " characters");

        // Count how many <li> elements (menu items) are in the HTML
        $item_count = substr_count($items, '<li');
        error_log("MenuQueries: HTML contains $item_count menu items");

        // Check if any query items are in the HTML
        $has_query_items = strpos($items, 'menu-item-10000') !== false ||
                          strpos($items, 'menu-item-type-post_type menu-item-object-page') !== false;
        error_log("MenuQueries: Query items in HTML: " . ($has_query_items ? 'YES' : 'NO'));

        // Log a snippet of HTML around the first query item if found
        $pos = strpos($items, 'menu-item-10000');
        if ($pos !== false) {
            error_log("MenuQueries: HTML snippet around query item - " . substr($items, max(0, $pos - 50), 200));
        }

        return $items;
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
