<?php
// Temporary debug file to check menu item meta
// Visit: /wp-content/plugins/ab-wp-bits/debug-menu-item.php

require_once('../../../wp-load.php');

if (!current_user_can('manage_options')) {
    die('Access denied');
}

// Get all nav menu items
$items = get_posts([
    'post_type' => 'nav_menu_item',
    'posts_per_page' => -1,
    'orderby' => 'ID',
    'order' => 'DESC'
]);

echo "<h1>Menu Item Debug</h1>";

foreach ($items as $item) {
    $is_query_item = get_post_meta($item->ID, '_menu_item_query_type', true);

    if ($is_query_item) {
        echo "<h2>Query Item ID: {$item->ID}</h2>";
        echo "<strong>Post Status:</strong> {$item->post_status}<br>";
        echo "<strong>Post Title:</strong> {$item->post_title}<br>";

        echo "<h3>All Post Meta:</h3>";
        $meta = get_post_meta($item->ID);
        echo "<pre>";
        print_r($meta);
        echo "</pre>";

        echo "<h3>wp_setup_nav_menu_item Output:</h3>";
        $setup_item = wp_setup_nav_menu_item($item);
        echo "<pre>";
        print_r($setup_item);
        echo "</pre>";

        echo "<hr>";
    }
}

// Check what filters are registered
global $wp_filter;
echo "<h2>Registered Filters for customize_nav_menu_item_setting_args</h2>";
if (isset($wp_filter['customize_nav_menu_item_setting_args'])) {
    echo "<pre>";
    print_r($wp_filter['customize_nav_menu_item_setting_args']);
    echo "</pre>";
} else {
    echo "<p>NO FILTERS REGISTERED</p>";
}

// Also test the filter directly
echo "<h2>Filter Test</h2>";
$test_args = ['test' => 'value'];
$filtered = apply_filters('customize_nav_menu_item_setting_args', $test_args, 999999);
echo "<pre>";
print_r($filtered);
echo "</pre>";
