# Menu Queries Module

Dynamically generate menu items from WordPress content using WP_Query and WP_Term_Query.

## Overview

The Menu Queries module allows you to automatically generate menu items from your WordPress content (posts, pages, custom post types) or taxonomy terms (categories, tags, custom taxonomies). Instead of manually adding individual items, create a query that generates the menu structure dynamically.

## Features

- **Dynamic Content**: Menu items update automatically as content changes
- **WP_Query Integration**: Full access to WordPress query parameters
- **Taxonomy Support**: Generate menus from categories, tags, or custom taxonomies
- **Hierarchical Menus**: Preserve parent/child relationships
- **Advanced Filtering**: Include/exclude specific items, filter by meta queries, taxonomies
- **Live Preview**: See query results before saving
- **Raw WP_Query Editor**: Direct JSON editing for advanced users
- **Seamless Integration**: Works in both Appearance → Menus and Customize → Menus

## How It Works

### Locations

Query Items can be configured in two places:

1. **Appearance → Menus** - Standard WordPress menu editor
2. **Customize → Menus** - WordPress Customizer with live preview

### Adding a Query Item

#### In Appearance → Menus
1. Navigate to **Appearance → Menus**
2. Look for the **"Query Items"** metabox in the left column
3. Click **"Add to Menu"** to create a new query item
4. Click **"Configure Query"** to set up the query
5. Save the menu

#### In Customize → Menus
1. Navigate to **Customize → Menus**
2. Click **"Add Items"**
3. Scroll to **"Query Items"**
4. Add a Query Item to your menu
5. Click **"Configure Query"** or **"Edit Query"** to set up the query
6. Click **"Publish"**

## Query Builder

The Query Builder modal has three tabs:

### 1. Builder Tab

Visual interface for constructing queries.

#### Settings Panel

**Show Default Menu Item**
- **Enabled**: Keeps the original menu item and adds generated items as children
- **Disabled**: Generated items replace the original menu item (default)

**Show Label on Empty Result**
- **Enabled**: Shows the label text when query returns no results
- **Disabled**: Hides the menu item entirely if query is empty (default)

**Empty Label Text**
- Text to display when query returns no results (only if "Show Label on Empty Result" is enabled)

#### Query Type
- **Post**: Query posts, pages, or custom post types
- **Taxonomy**: Query taxonomy terms (categories, tags, custom taxonomies)

#### Query Parameters

**Order By**
- Title, Date, Modified, Menu Order, ID, Author, Name (Slug), Random

**Order**
- Ascending (A-Z, oldest first)
- Descending (Z-A, newest first)

**Post Count**
- Number of items to return
- Use `-1` for unlimited

**Child Of**
- Show only children of a specific post/page ID
- Use `0` to show all items

**Include Children**
- Show child items in a flat list

**Hierarchical Results**
- Nest child items under parent items in the menu

#### Include / Exclude (Post Queries Only)

**Include Posts**
- Select specific posts to include
- Searchable dropdown

**Exclude Posts**
- Select specific posts to exclude

**Include Taxonomies**
- Filter posts by taxonomy terms (categories, tags, etc.)

**Exclude Taxonomies**
- Exclude posts with specific taxonomy terms

#### Include / Exclude (Taxonomy Queries Only)

**Include Terms**
- Select specific terms to include

**Exclude Terms**
- Select specific terms to exclude

#### Meta Queries

Add complex filtering based on custom field values.

**Add Meta Query**
- Click to add a new meta query condition
- Configure:
  - **Clause Name**: Identifier for this condition
  - **Meta Key**: Custom field key
  - **Compare**: Operator (=, !=, >, <, LIKE, etc.)
  - **Meta Value**: Value to compare against
  - **Type**: Data type (CHAR, NUMERIC, DATE, etc.)

**Relation**
- **AND**: All meta queries must match
- **OR**: Any meta query can match

### 2. WP_Query Tab

Advanced users can edit the raw WP_Query JSON directly.

**Features**:
- Syntax highlighting
- Auto-formatting
- Validation on save
- Full access to all WP_Query parameters

**Example Post Query**:
```json
{
  "post_type": "post",
  "posts_per_page": 10,
  "orderby": "date",
  "order": "DESC",
  "showDefaultMenuItem": false,
  "showLabelOnEmpty": false,
  "emptyLabel": ""
}
```

**Example Taxonomy Query**:
```json
{
  "taxonomy": "category",
  "number": -1,
  "orderby": "name",
  "order": "ASC",
  "hierarchical": true,
  "showDefaultMenuItem": false,
  "showLabelOnEmpty": false,
  "emptyLabel": ""
}
```

**UI-Only Properties**:
These properties control the UI behavior and are stored with the query:
- `showDefaultMenuItem` - Boolean
- `showLabelOnEmpty` - Boolean
- `emptyLabel` - String

### 3. Results Tab

Preview the results of your query before saving.

**Features**:
- Live preview of query results
- Shows number of items found
- Displays actual titles/names that will appear in menu
- Updates automatically as you change query parameters

## Common Use Cases

### 1. Recent Blog Posts
Generate a menu of the 5 most recent blog posts:

```
Query Type: Post
Post Type: post
Order By: Date
Order: Descending
Post Count: 5
```

### 2. All Pages (Hierarchical)
Create a hierarchical menu of all pages:

```
Query Type: Post
Post Type: page
Order By: Menu Order
Order: Ascending
Post Count: -1
Hierarchical Results: ✓
```

### 3. Portfolio Items by Category
Show portfolio items from a specific category:

```
Query Type: Post
Post Type: portfolio
Order By: Date
Order: Descending
Include Taxonomies: [Select category]
```

### 4. Product Categories
Generate menu from product categories:

```
Query Type: Taxonomy
Taxonomy: product_cat
Order By: Name
Order: Ascending
Hierarchical Results: ✓
```

### 5. Child Pages of Specific Parent
Show all child pages of page ID 42:

```
Query Type: Post
Post Type: page
Child Of: 42
Include Children: ✓
Order By: Menu Order
```

### 6. Custom Field Filtering
Show posts with a specific custom field value:

```
Query Type: Post
Post Type: post
Meta Queries:
  - Key: featured
    Compare: =
    Value: yes
    Type: CHAR
```

## Settings Explained

### Show Default Menu Item

This setting controls whether the original menu item is preserved:

**Disabled (Default)**:
```
Menu
└─ Generated Item 1
└─ Generated Item 2
└─ Generated Item 3
```

**Enabled**:
```
Menu
└─ Services (original item)
   ├─ Service 1 (generated)
   ├─ Service 2 (generated)
   └─ Service 3 (generated)
```

**Use Case**: Enable when you want the query label to act as a parent menu item with the generated items as children.

### Show Label on Empty Result

Controls what happens when the query returns no results:

**Disabled (Default)**:
- Menu item disappears entirely
- No placeholder shown

**Enabled**:
- Shows the Empty Label Text as a menu item
- Provides user feedback that the section exists but is empty

**Use Case**: Enable for sections that might temporarily have no content (e.g., "Featured Products" when no products are featured).

## Advanced Techniques

### Complex Meta Queries

Combine multiple meta queries with AND/OR logic:

```json
{
  "post_type": "event",
  "meta_query": {
    "relation": "AND",
    "0": {
      "key": "event_date",
      "value": "2024-01-01",
      "compare": ">=",
      "type": "DATE"
    },
    "1": {
      "key": "event_status",
      "value": "published",
      "compare": "=",
      "type": "CHAR"
    }
  }
}
```

### Taxonomy Filtering

Include posts from multiple taxonomies:

```json
{
  "post_type": "post",
  "tax_query": {
    "relation": "OR",
    "0": {
      "taxonomy": "category",
      "field": "term_id",
      "terms": [1, 2, 3]
    },
    "1": {
      "taxonomy": "post_tag",
      "field": "slug",
      "terms": ["featured"]
    }
  }
}
```

### Post Status

Query drafts, pending, or private posts (if user has permission):

```json
{
  "post_type": "post",
  "post_status": ["publish", "private"],
  "posts_per_page": 10
}
```

## Performance Considerations

### Caching
- Query results are cached for 15 minutes by default
- Cache is automatically cleared when:
  - Menu is saved
  - Posts/terms are published/updated
  - Customizer is published

### Query Optimization Tips

1. **Limit Results**: Use reasonable `posts_per_page` values instead of `-1` when possible
2. **Specific Post Types**: Query specific post types rather than 'any'
3. **Avoid Complex Meta Queries**: Simple queries perform better
4. **Use Hierarchical Wisely**: Hierarchical queries are more complex

### Cache Configuration

Developers can modify cache TTL via filter:

```php
add_filter('ab_wp_bits_menu_queries_cache_ttl', function($ttl) {
    return 3600; // 1 hour in seconds
});
```

## Integration with WordPress

### Appearance → Menus
- Full integration with drag-and-drop menu editor
- Query items can be reordered like regular items
- Can be nested under other menu items
- Configuration persists when duplicating menus

### Customize → Menus
- Live preview updates as you configure queries
- Changes included in Customizer changeset
- Preview shows actual generated menu items
- Publish applies all changes atomically

### Frontend Rendering
- Queries executed during menu rendering
- Results injected as standard menu items
- Works with all menu walkers and themes
- Compatible with page builders and mega menus

## Customization for Developers

### Filters

**Modify Query Arguments**
```php
add_filter('ab_wp_bits_menu_query_args', function($args, $query_type, $menu_item_id) {
    // Modify $args before query executes
    return $args;
}, 10, 3);
```

**Modify Query Results**
```php
add_filter('ab_wp_bits_menu_query_results', function($results, $args, $query_type) {
    // Modify results before converting to menu items
    return $results;
}, 10, 3);
```

**Modify Generated Menu Items**
```php
add_filter('ab_wp_bits_menu_query_items', function($items, $original_item) {
    // Modify menu items after generation
    return $items;
}, 10, 2);
```

### Actions

**Before Query Execution**
```php
add_action('ab_wp_bits_before_menu_query', function($args, $query_type, $menu_item_id) {
    // Log queries, modify global state, etc.
}, 10, 3);
```

**After Query Execution**
```php
add_action('ab_wp_bits_after_menu_query', function($results, $args, $query_type) {
    // Log results, trigger other actions, etc.
}, 10, 3);
```

## Troubleshooting

### Query Returns No Results

**Check**:
1. Post status - are posts published?
2. Post type - is it correct and registered?
3. Permissions - can current user view these posts?
4. Filters - are include/exclude filters too restrictive?

**Debug**:
Enable WordPress debugging and check the query in Results tab.

### Menu Items Not Updating

**Issue**: Menu doesn't reflect new content
**Solution**:
1. Clear cache (save menu or publish Customizer)
2. Check if posts meet query criteria
3. Verify hierarchical settings aren't hiding items

### Hierarchical Menu Not Working

**Issue**: Parent/child relationships not showing
**Solution**:
1. Ensure "Hierarchical Results" is checked
2. Verify posts/terms have proper parent relationships
3. Check that parent items meet query criteria

### Custom Post Type Not Showing

**Issue**: Custom post type not in dropdown
**Solution**:
1. Verify CPT is registered with `show_in_nav_menus => true`
2. Refresh admin page after registering CPT
3. Check CPT slug is correct (case-sensitive)

### Performance Issues

**Issue**: Menu loads slowly
**Solution**:
1. Reduce `posts_per_page` count
2. Simplify meta queries
3. Disable hierarchical if not needed
4. Increase cache TTL
5. Use object caching (Redis, Memcached)

## Best Practices

### 1. Use Descriptive Labels
Give query items clear Navigation Labels (e.g., "Recent Blog Posts", "Product Categories")

### 2. Test Queries in Results Tab
Always preview results before saving to verify the query works as expected

### 3. Limit Result Counts
Use reasonable limits to avoid performance issues and overwhelming menus

### 4. Enable Show Default Menu Item for Sub-Menus
When creating dropdown menus, enable this setting so the parent label is clickable

### 5. Use Empty Labels for User Feedback
Enable "Show Label on Empty Result" with helpful text like "No recent posts" for better UX

### 6. Combine with Menu Conditions
Use Menu Conditions module to show different query menus to different user roles

## API Reference

### REST Endpoints

#### Save Query Config
```
POST /wp-json/ab-wp-bits/v1/menu-queries/save-config
Body: {
  "menu_item_id": 123,
  "query_config": "{...json...}"
}
```

#### Get Query Config
```
GET /wp-json/ab-wp-bits/v1/menu-queries/get-config?menu_item_id=123
```

### Data Format

The query config is stored as JSON in post meta `_menu_item_query_config`.

**Structure**:
```json
{
  "post_type": "post",
  "posts_per_page": 10,
  "orderby": "date",
  "order": "DESC",
  "showDefaultMenuItem": false,
  "showLabelOnEmpty": false,
  "emptyLabel": "",
  "include_children": false,
  "hierarchical": false
}
```

## Compatibility

- **WordPress**: 6.0+
- **PHP**: 7.4+
- **Multisite**: Fully supported
- **Page Builders**: Compatible with all major page builders
- **Menu Plugins**: Works with mega menu plugins
- **Caching Plugins**: Compatible (server-side generation)

## Known Limitations

1. **Maximum Items**: Large queries (1000+ items) may impact performance
2. **Real-time Updates**: Cache means new content takes up to 15 minutes to appear (unless cache cleared)
3. **Customizer Preview**: Some themes may not refresh menu preview automatically

## Changelog

See main plugin CHANGELOG.md for version history.

## Support

For issues specific to Menu Queries:
1. Check this documentation
2. Test with the Results preview tab
3. Enable WordPress debugging
4. Report issues via GitHub issue tracker

## Related Documentation

- [WP_Query Documentation](https://developer.wordpress.org/reference/classes/wp_query/)
- [WP_Term_Query Documentation](https://developer.wordpress.org/reference/classes/wp_term_query/)
- [WordPress Menu System](https://developer.wordpress.org/themes/functionality/navigation-menus/)
- [Custom Post Types](https://developer.wordpress.org/plugins/post-types/)
- [Custom Taxonomies](https://developer.wordpress.org/plugins/taxonomies/)
