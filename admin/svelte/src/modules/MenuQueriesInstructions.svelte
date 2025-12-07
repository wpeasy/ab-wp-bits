<script lang="ts">
  import Card from '../lib/Card.svelte';
  import Stack from '../lib/Stack.svelte';
</script>

<Stack>
  <Card title="Menu Queries - Instructions">
    <div class="instructions">
      <h3>Overview</h3>
      <p>
        The Menu Queries module allows you to dynamically populate WordPress menus with posts, pages, custom post types, and taxonomy terms using WP_Query.
      </p>

      <h3>Usage</h3>

      <h4>In Appearance → Menus</h4>
      <ol>
        <li>Navigate to <strong>Appearance → Menus</strong></li>
        <li>Find the "Query Items" meta box on the left sidebar</li>
        <li>Click <strong>"Add to Menu"</strong> to add a new Query Item</li>
        <li>Expand the menu item and click <strong>"Configure Query"</strong></li>
        <li>Build your query using the visual builder or write custom WP_Query JSON</li>
        <li>Click <strong>"Save Query"</strong> and then save your menu</li>
      </ol>

      <h4>In Customizer</h4>
      <ol>
        <li>Go to <strong>Appearance → Customize</strong></li>
        <li>Navigate to <strong>Menus</strong> and select a menu</li>
        <li>Click <strong>"Add Items"</strong> and find <strong>"Query Item"</strong></li>
        <li>Add a Query Item to your menu</li>
        <li>Expand the item and click <strong>"Configure Query"</strong></li>
        <li>Build your query and save</li>
        <li>Click <strong>"Publish"</strong> to save changes</li>
      </ol>

      <h3>Query Builder</h3>
      <p>The query builder has three tabs:</p>

      <h4>Builder Tab</h4>
      <ul>
        <li><strong>Query Type:</strong> Choose between Post or Taxonomy queries</li>
        <li><strong>Post Type/Taxonomy:</strong> Select which post type or taxonomy to query</li>
        <li><strong>Order:</strong> Control sorting (by title, date, menu order, etc.)</li>
        <li><strong>Post Count:</strong> Limit results (-1 for unlimited)</li>
        <li><strong>Offset:</strong> Skip a number of results</li>
        <li><strong>Child Of:</strong> Show only children of a specific post/term ID</li>
        <li><strong>Include/Exclude:</strong> Specify exact posts or terms to include/exclude</li>
        <li><strong>Taxonomy Filters:</strong> Filter posts by taxonomy terms</li>
        <li><strong>Meta Queries:</strong> Advanced filtering by custom field values</li>
        <li><strong>Hierarchical:</strong> Maintain parent/child relationships in results</li>
      </ul>

      <h4>WP_Query Tab</h4>
      <p>
        View and manually edit the raw WP_Query JSON. This is the single source of truth for the query.
        Any changes made in the Builder tab update this JSON, and vice versa.
      </p>

      <h4>Results Tab</h4>
      <p>
        Preview the results of your query. This shows exactly what posts/terms will appear in the menu
        based on your current query configuration.
      </p>

      <h3>Advanced Features</h3>

      <h4>Meta Queries</h4>
      <p>
        Filter posts by custom field values. You can add multiple meta queries with AND/OR relationships.
        Useful for filtering products, events, or any posts with custom fields.
      </p>

      <h4>Hierarchical Results</h4>
      <p>
        When enabled, maintains parent/child relationships. Child items will appear as sub-menu items
        under their parents in the menu structure.
      </p>

      <h4>Empty Results Label</h4>
      <p>
        Optionally display a label when the query returns no results. Useful for menus that may have
        no items at certain times (e.g., "No products available").
      </p>

      <h3>Caching</h3>
      <p>
        Query results are cached to improve performance. You can configure the cache duration in the
        Settings tab and manually clear the cache when needed.
      </p>

      <h3>Tips</h3>
      <ul>
        <li>Use the Results tab to test your query before saving</li>
        <li>Start with the Builder tab, then fine-tune in the WP_Query tab if needed</li>
        <li>The preview in the Customizer updates live as you modify the query</li>
        <li>Query Items work in both regular menus and the Customizer</li>
        <li>Include/Exclude arrays are cleared when changing post types to avoid conflicts</li>
      </ul>

      <h3>Troubleshooting</h3>

      <h4>Menu items not showing</h4>
      <ul>
        <li>Check the Results tab to verify your query returns items</li>
        <li>Ensure the post type/taxonomy still exists</li>
        <li>Verify include/exclude filters aren't too restrictive</li>
        <li>Try clearing the cache in Settings</li>
      </ul>

      <h4>Query not updating</h4>
      <ul>
        <li>In Customizer: Click "Publish" to save changes</li>
        <li>In Appearance→Menus: Click "Save Menu" after configuring</li>
        <li>Clear the cache if results seem stale</li>
      </ul>
    </div>
  </Card>
</Stack>

<style>
  .instructions {
    line-height: 1.6;
  }

  .instructions h3 {
    margin-top: var(--wpea-space--lg);
    margin-bottom: var(--wpea-space--md);
    color: var(--wpea-color--text);
  }

  .instructions h4 {
    margin-top: var(--wpea-space--md);
    margin-bottom: var(--wpea-space--sm);
    color: var(--wpea-color--text-muted);
  }

  .instructions p {
    margin-bottom: var(--wpea-space--md);
  }

  .instructions ul,
  .instructions ol {
    margin-bottom: var(--wpea-space--md);
    padding-left: var(--wpea-space--lg);
  }

  .instructions li {
    margin-bottom: var(--wpea-space--xs);
  }

  .instructions strong {
    color: var(--wpea-color--text);
  }
</style>
