<script lang="ts">
  import Card from '../lib/Card.svelte';
  import Stack from '../lib/Stack.svelte';
</script>

<Stack>
  <Card title="Menu Conditions - Instructions">
    <div class="instructions">
      <h3>Overview</h3>
      <p>
        The Menu Conditions module allows you to show or hide menu items based on WordPress user capabilities and roles.
        Control who sees what in your menus using flexible conditional logic.
      </p>

      <h3>Getting Started</h3>
      <h4>1. Navigate to Menus</h4>
      <p>You can configure conditions in two locations:</p>
      <ul>
        <li><strong>Appearance → Menus</strong> - Standard WordPress menu editor</li>
        <li><strong>Customize → Menus</strong> - WordPress Customizer with live preview</li>
      </ul>

      <h4>2. Add Conditions to Menu Items</h4>
      <ol>
        <li>Expand any menu item</li>
        <li>Click the <strong>"Conditions"</strong> button</li>
        <li>Configure your visibility rules</li>
        <li>Save your changes</li>
      </ol>

      <h4>3. Visual Indicators</h4>
      <p>Menu items with conditions are marked with:</p>
      <ul>
        <li><strong>Eye icon (👁️)</strong> in the menu item handle</li>
        <li><strong>Blue left border</strong> highlighting the item</li>
        <li><strong>Dot on Conditions button</strong> when conditions exist</li>
      </ul>
      <p>These indicators appear even when collapsed, making it easy to see which items have conditions.</p>

      <h3>Configuring Conditions</h3>

      <h4>Conditions Tab</h4>
      <p><strong>Relation (AND/OR)</strong></p>
      <ul>
        <li><strong>AND:</strong> User must have ALL selected capabilities</li>
        <li><strong>OR:</strong> User must have ANY of the selected capabilities</li>
      </ul>

      <p><strong>Add Conditions</strong></p>
      <p>Click "Add Condition" to create rules. Each condition has:</p>
      <ul>
        <li><strong>Operator:</strong> "has" or "does not have"</li>
        <li><strong>Capability:</strong> Select from WordPress capabilities</li>
      </ul>

      <h4>Results Tab</h4>
      <p>Preview how your conditions affect users:</p>
      <ul>
        <li><strong>Test with Specific User:</strong> Select a user and see if the item will be visible</li>
        <li><strong>Role Preview:</strong> See which roles can see the menu item</li>
        <li><strong>Search:</strong> Filter roles to quickly find specific ones</li>
      </ul>

      <h3>Common Examples</h3>

      <h4>Show to Administrators Only</h4>
      <pre><code>Relation: AND
- has: manage_options</code></pre>

      <h4>Show to Editors OR Administrators</h4>
      <pre><code>Relation: OR
- has: manage_options (Administrators)
- has: edit_others_posts (Editors)</code></pre>

      <h4>Hide from Subscribers</h4>
      <pre><code>Relation: AND
- does not have: read</code></pre>

      <h4>Show to Content Editors</h4>
      <pre><code>Relation: OR
- has: edit_posts
- has: edit_pages</code></pre>

      <h3>WordPress Capabilities</h3>

      <h4>Administrator</h4>
      <ul>
        <li><code>manage_options</code> - Manage settings</li>
        <li><code>edit_users</code> - Edit users</li>
        <li><code>switch_themes</code> - Change themes</li>
        <li><code>install_plugins</code> - Install plugins</li>
      </ul>

      <h4>Editor</h4>
      <ul>
        <li><code>edit_posts</code> - Edit posts</li>
        <li><code>publish_posts</code> - Publish posts</li>
        <li><code>edit_others_posts</code> - Edit others' posts</li>
        <li><code>edit_pages</code> - Edit pages</li>
      </ul>

      <h4>Author</h4>
      <ul>
        <li><code>edit_posts</code> - Edit own posts</li>
        <li><code>publish_posts</code> - Publish own posts</li>
        <li><code>upload_files</code> - Upload files</li>
      </ul>

      <h4>Contributor</h4>
      <ul>
        <li><code>edit_posts</code> - Edit own posts</li>
        <li><code>delete_posts</code> - Delete own posts</li>
      </ul>

      <h4>Subscriber</h4>
      <ul>
        <li><code>read</code> - Read content</li>
      </ul>

      <h3>Best Practices</h3>
      <ul>
        <li><strong>Start Simple:</strong> Begin with single conditions before adding complex AND/OR logic</li>
        <li><strong>Test Thoroughly:</strong> Use "Test with Specific User" to verify conditions</li>
        <li><strong>Use Core Capabilities:</strong> Prefer WordPress core capabilities for better compatibility</li>
        <li><strong>Consider Logged-Out Users:</strong> Items without conditions are visible to everyone</li>
      </ul>

      <h3>Troubleshooting</h3>

      <h4>Conditions Not Saving</h4>
      <ul>
        <li>Check browser console for JavaScript errors</li>
        <li>Ensure you're clicking "Save Conditions" in the modal</li>
        <li>In Customizer, ensure you click "Publish"</li>
      </ul>

      <h4>Menu Item Always Visible/Hidden</h4>
      <ul>
        <li>Check the Results tab to verify role visibility</li>
        <li>Test with a specific user</li>
        <li>Verify capability names are correct (case-sensitive)</li>
      </ul>

      <h4>Visual Indicators Not Showing</h4>
      <ul>
        <li>Refresh the page</li>
        <li>Ensure conditions were saved successfully</li>
        <li>In Customizer, ensure you clicked Publish</li>
      </ul>

      <h3>Full Documentation</h3>
      <p>
        For complete documentation including technical details, API reference, and advanced use cases,
        see <code>MENU_CONDITIONS.md</code> in the plugin directory.
      </p>
    </div>
  </Card>
</Stack>

<style>
  .instructions {
    line-height: 1.6;
  }

  .instructions h3 {
    margin-top: var(--wpea-space--lg);
    margin-bottom: var(--wpea-space--sm);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--wpea-color--text);
  }

  .instructions h3:first-child {
    margin-top: 0;
  }

  .instructions h4 {
    margin-top: var(--wpea-space--md);
    margin-bottom: var(--wpea-space--xs);
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--wpea-color--text);
  }

  .instructions p {
    margin-bottom: var(--wpea-space--sm);
  }

  .instructions ul,
  .instructions ol {
    margin-bottom: var(--wpea-space--sm);
    padding-left: var(--wpea-space--lg);
  }

  .instructions li {
    margin-bottom: var(--wpea-space--xs);
  }

  .instructions strong {
    font-weight: 600;
  }

  .instructions code {
    background: var(--wpea-surface--panel);
    padding: 0.125rem 0.375rem;
    border-radius: var(--wpea-radius--sm);
    font-family: 'Courier New', monospace;
    font-size: 0.875em;
  }

  .instructions pre {
    background: var(--wpea-surface--panel);
    padding: var(--wpea-space--sm);
    border-radius: var(--wpea-radius--md);
    overflow-x: auto;
    margin-bottom: var(--wpea-space--sm);
  }

  .instructions pre code {
    background: none;
    padding: 0;
  }
</style>
