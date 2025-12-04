# WP Menu Queries

**Name**: WP Menu Queries
**Description**: Adds the ability to query CPTs and Taxonomies to use as menu items in WordPress Menus
**Settings**:
 - Default cache TTL ( default to 300 seconds)
 - Button to clear cache immediately
 **Logo**: Create a basic square logo for testing

 # Admin Functionality
 Adds a custom item to the WordPress Menus "Query Items" where the user can click a button to open a modal.
 The Modal will have a Query Builder based on WP_Query where they can select:
  - Post / Taxonomy as the type
  - Post Type - if Post is selected
  - Order By
  - Post Count default to -1 (unlimited)
  - Offset
  - Child Of
  - Include - Multi select for specific Posts/Taxonomies 
  - Exclude - Multi select for specific Posts/Taxonomies 
  - If Post is the Type
    - Include - Multi select for specific Taxonomies 
    - Exclude - Multi select for specific Taxonomies 
  - Repeater to add Meta Queries
    - Meta Key
    - Meta Value
    - Compare
    - Type
    - Clause name."Set clause name to be used as "Order by" parameter."