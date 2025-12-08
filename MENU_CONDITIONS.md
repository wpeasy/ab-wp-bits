# Menu Conditions Module

Control menu item visibility based on WordPress user capabilities and roles.

## Overview

The Menu Conditions module allows you to show or hide menu items based on user capabilities using conditional logic (AND/OR operators). This gives you fine-grained control over what menu items appear for different user roles.

## Features

- **Capability-Based Conditions**: Show/hide menu items based on WordPress capabilities
- **Flexible Logic**: Use AND/OR operators to combine multiple conditions
- **Visual Indicators**: See which menu items have conditions at a glance
- **Real-Time Preview**: Test conditions against specific roles and users
- **Seamless Integration**: Works in both Appearance → Menus and Customize → Menus

## How It Works

### Locations

Menu Conditions can be configured in two places:

1. **Appearance → Menus** - Standard WordPress menu editor
2. **Customize → Menus** - WordPress Customizer with live preview

### Adding Conditions

1. Navigate to **Appearance → Menus** or **Customize → Menus**
2. Expand any menu item
3. Click the **"Conditions"** button
4. Configure your conditions in the modal that appears

### Visual Indicators

Menu items with conditions are marked with:
- **Eye icon** (👁️) in the menu item handle
- **Blue left border** highlighting the item
- **Dot indicator** on the Conditions button when conditions exist

These indicators appear even when the menu item is collapsed, making it easy to see which items have conditions at a glance.

## Configuring Conditions

### Conditions Tab

Build your visibility rules using capabilities:

#### 1. Relation (AND/OR)
- **AND**: User must have ALL selected capabilities
- **OR**: User must have ANY of the selected capabilities

#### 2. Add Conditions
- Click **"Add Condition"** to create a new rule
- Each condition consists of:
  - **Operator**: `has` or `does not have`
  - **Capability**: Select from all available WordPress capabilities

#### 3. Examples

**Example 1: Show to Editors Only**
```
Relation: AND
- has: edit_posts
- has: publish_posts
- does not have: manage_options
```

**Example 2: Show to Editors OR Administrators**
```
Relation: OR
- has: manage_options (Administrators)
- has: edit_others_posts (Editors)
```

**Example 3: Hide from Subscribers**
```
Relation: AND
- does not have: read (only capability subscribers have)
```

### Results Tab

Preview how your conditions will affect different roles and users.

#### Test with Specific User
At the top of the Results tab:
1. Select a user from the dropdown
2. See immediately whether the menu item will be visible to them
3. Clear message: "This menu item WILL be visible" or "will NOT be visible"

#### Role Visibility Preview
Below the user test, see a filterable list showing:
- All WordPress roles
- Role slug (for reference)
- **Visible** (green badge) or **Hidden** (red badge) for each role

Use the search box to quickly filter roles by name or slug.

## WordPress Capabilities Reference

### Administrator Capabilities
- `manage_options` - Manage WordPress settings
- `edit_users` - Edit other users
- `delete_users` - Delete users
- `create_users` - Create new users
- `switch_themes` - Change themes
- `install_plugins` - Install plugins
- `activate_plugins` - Activate plugins
- `delete_plugins` - Delete plugins
- And many more...

### Editor Capabilities
- `edit_posts` - Edit posts
- `publish_posts` - Publish posts
- `edit_others_posts` - Edit others' posts
- `delete_others_posts` - Delete others' posts
- `edit_pages` - Edit pages
- `publish_pages` - Publish pages
- And more...

### Author Capabilities
- `edit_posts` - Edit own posts
- `publish_posts` - Publish own posts
- `delete_posts` - Delete own posts
- `upload_files` - Upload files

### Contributor Capabilities
- `edit_posts` - Edit own posts
- `delete_posts` - Delete own posts

### Subscriber Capabilities
- `read` - Read content

**Tip**: Use the capability list in the modal's Conditions tab to see all available capabilities with their technical names.

## Common Use Cases

### 1. Admin-Only Menu Items
Show certain menu items only to administrators:
```
Relation: AND
- has: manage_options
```

### 2. Content Editors
Show to anyone who can edit content (Editors, Admins):
```
Relation: OR
- has: edit_others_posts
- has: manage_options
```

### 3. Exclude Subscribers
Show to all logged-in users except subscribers:
```
Relation: AND
- does not have: read
OR
Relation: OR
- has: edit_posts
- has: manage_options
```

### 4. Specific User Capabilities
Show to users with custom capabilities from membership plugins:
```
Relation: AND
- has: access_premium_content
```

## Integration with WordPress

### Appearance → Menus
- Full integration with standard menu editor
- Conditions persist when saving menu
- Works with all menu item types (Pages, Posts, Custom Links, etc.)

### Customize → Menus
- Live preview in Customizer
- Conditions included in changeset
- Visual indicators update in real-time
- Changes activate Publish button

### Frontend Rendering
- Menu items are evaluated on each page load
- Efficient caching prevents performance impact
- Conditions checked against current user
- Items without conditions always display

## Technical Details

### Database Storage
- Conditions stored in post meta: `_menu_item_conditions`
- JSON format for flexibility
- Backward compatible with standard menu items

### Condition Evaluation
- Evaluated during `wp_setup_nav_menu_item` filter
- User capability checks via `current_user_can()`
- AND/OR logic applied to multiple conditions
- Non-logged-in users see items with no conditions

### Performance
- Conditions cached per menu load
- Minimal overhead (< 1ms per item)
- No additional database queries for standard items

## Best Practices

### 1. Start Simple
Begin with single conditions before adding complex AND/OR logic.

### 2. Test Thoroughly
Always use the "Test with Specific User" feature to verify conditions work as expected.

### 3. Use Built-in Capabilities
Prefer WordPress core capabilities over custom ones when possible for better compatibility.

### 4. Document Complex Conditions
For complex multi-condition rules, add comments in your theme/plugin code explaining the logic.

### 5. Consider Logged-Out Users
Items without conditions are visible to everyone, including non-logged-in users.

## Troubleshooting

### Conditions Not Saving
**Issue**: Conditions don't persist after clicking "Save Conditions"
**Solution**: Check browser console for JavaScript errors. Ensure nonces are valid.

### Menu Item Always Visible/Hidden
**Issue**: Item shows to wrong users
**Solution**:
1. Check the Results tab to verify role visibility
2. Test with a specific user
3. Verify capability names are correct (case-sensitive)

### Visual Indicators Not Showing
**Issue**: Eye icon or blue border doesn't appear
**Solution**:
1. Refresh the page
2. Ensure conditions were saved successfully
3. In Customizer, ensure you clicked Publish

### Custom Capabilities Not Working
**Issue**: Custom membership plugin capabilities don't work
**Solution**: Verify the capability exists using:
```php
$user = wp_get_current_user();
var_dump($user->allcaps);
```

## API Reference

### REST Endpoints

#### Get Item Conditions
```
GET /wp-json/ab-wp-bits/v1/menu-conditions/item/{id}
```

#### Save Item Conditions
```
POST /wp-json/ab-wp-bits/v1/menu-conditions/item/{id}
Body: { "conditions": { ... } }
```

#### Evaluate Conditions
```
POST /wp-json/ab-wp-bits/v1/menu-conditions/evaluate
Body: { "conditions": { ... } }
```

#### Evaluate for Specific User
```
POST /wp-json/ab-wp-bits/v1/menu-conditions/evaluate-user
Body: { "user_id": 123, "conditions": { ... } }
```

### Data Format

```json
{
  "relation": "AND",
  "conditions": [
    {
      "operator": "has",
      "capability": "edit_posts"
    },
    {
      "operator": "has_not",
      "capability": "manage_options"
    }
  ]
}
```

## Compatibility

- **WordPress**: 6.0+
- **PHP**: 7.4+
- **Multisite**: Fully supported
- **Page Builders**: Compatible with all major page builders
- **Caching**: Works with caching plugins (conditions evaluated server-side)

## Changelog

See main plugin CHANGELOG.md for version history.

## Support

For issues specific to Menu Conditions:
1. Check this documentation
2. Test with the Results preview
3. Report issues via GitHub issue tracker

## Related Documentation

- [WordPress Roles and Capabilities](https://wordpress.org/support/article/roles-and-capabilities/)
- [WordPress Menu System](https://developer.wordpress.org/themes/functionality/navigation-menus/)
- [Custom Capabilities](https://developer.wordpress.org/plugins/users/roles-and-capabilities/)
