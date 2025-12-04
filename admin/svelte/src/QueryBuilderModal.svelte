<script lang="ts">
  import type { QueryConfig, SelectOption, MetaQuery } from './menu-queries-types';
  import Modal from './lib/Modal.svelte';
  import Stack from './lib/Stack.svelte';
  import Card from './lib/Card.svelte';
  import Select from './lib/Select.svelte';
  import Input from './lib/Input.svelte';
  import Button from './lib/Button.svelte';
  import Switch from './lib/Switch.svelte';
  import Textarea from './lib/Textarea.svelte';
  import MultiSelect from './lib/MultiSelect.svelte';
  import MetaQueryRepeater from './MetaQueryRepeater.svelte';

  interface Props {
    open: boolean;
    initialConfig?: QueryConfig | null;
    onClose: () => void;
    onSubmit: (config: QueryConfig) => void;
  }

  let { open = $bindable(false), initialConfig = null, onClose, onSubmit }: Props = $props();

  const { apiUrl, nonce } = window.abMenuQueriesData;

  // Query configuration state
  let queryType = $state<'post' | 'taxonomy'>('post');
  let postType = $state('post');
  let taxonomy = $state('category');
  let orderBy = $state('title');
  let order = $state('ASC');
  let postCount = $state(-1);
  let offset = $state(0);
  let childOf = $state(0);
  let includeChildren = $state(false);
  let hierarchical = $state(false);
  let showLabelOnEmpty = $state(false);
  let emptyLabel = $state('');
  let includePosts = $state<(string | number)[]>([]);
  let excludePosts = $state<(string | number)[]>([]);
  let includeTerms = $state<(string | number)[]>([]);
  let excludeTerms = $state<(string | number)[]>([]);
  let includeTaxonomies = $state<(string | number)[]>([]);
  let excludeTaxonomies = $state<(string | number)[]>([]);
  let metaQueries = $state<MetaQuery[]>([]);
  let metaQueryRelation = $state<'AND' | 'OR'>('AND');

  // Tab and WP_Query state
  let activeTab = $state('builder');
  let rawWPQuery = $state('');
  let showResetConfirm = $state(false);
  let queryResults = $state('');
  let isLoadingResults = $state(false);
  let resultsError = $state('');

  // Load initial config when modal opens
  $effect(() => {
    if (open) {
      if (initialConfig) {
        // Load existing config
        queryType = initialConfig.queryType || 'post';
        postType = initialConfig.postType || 'post';
        taxonomy = initialConfig.taxonomy || 'category';
        orderBy = initialConfig.orderBy || 'title';
        order = initialConfig.order || 'ASC';
        // Ensure numbers are parsed correctly (may come as strings from JSON)
        postCount = typeof initialConfig.postCount === 'string' ? parseInt(initialConfig.postCount, 10) : (initialConfig.postCount ?? -1);
        offset = typeof initialConfig.offset === 'string' ? parseInt(initialConfig.offset, 10) : (initialConfig.offset || 0);
        childOf = typeof initialConfig.childOf === 'string' ? parseInt(initialConfig.childOf, 10) : (initialConfig.childOf || 0);
        includeChildren = initialConfig.includeChildren ?? false;
        hierarchical = initialConfig.hierarchical ?? false;
        showLabelOnEmpty = initialConfig.showLabelOnEmpty ?? false;
        emptyLabel = initialConfig.emptyLabel || '';
        includePosts = initialConfig.includePosts || [];
        excludePosts = initialConfig.excludePosts || [];
        includeTerms = initialConfig.includeTerms || [];
        excludeTerms = initialConfig.excludeTerms || [];
        includeTaxonomies = initialConfig.includeTaxonomies || [];
        excludeTaxonomies = initialConfig.excludeTaxonomies || [];
        metaQueries = initialConfig.metaQueries || [];
        metaQueryRelation = initialConfig.metaQueryRelation || 'AND';
        rawWPQuery = initialConfig.rawWPQuery || '';
      } else {
        // Reset to defaults for new query
        queryType = 'post';
        postType = 'post';
        taxonomy = 'category';
        orderBy = 'title';
        order = 'ASC';
        postCount = -1;
        offset = 0;
        childOf = 0;
        includeChildren = false;
        hierarchical = false;
        showLabelOnEmpty = false;
        emptyLabel = '';
        includePosts = [];
        excludePosts = [];
        includeTerms = [];
        excludeTerms = [];
        includeTaxonomies = [];
        excludeTaxonomies = [];
        metaQueries = [];
        metaQueryRelation = 'AND';
        rawWPQuery = '';
      }
      // Reset tab to builder when opening
      activeTab = 'builder';
    }
  });

  // Parse rawWPQuery and sync to UI when it changes
  let isUpdatingFromUI = false;
  let isUpdatingFromQuery = false;

  function parseWPQueryToUI(queryJson: string) {
    if (!queryJson || isUpdatingFromUI) return;

    isUpdatingFromQuery = true;
    try {
      const args = JSON.parse(queryJson);

      // Determine query type
      if (args.taxonomy) {
        queryType = 'taxonomy';
        taxonomy = args.taxonomy || 'category';
        postCount = args.number ?? -1;

        if (args.child_of) {
          childOf = args.child_of;
          includeChildren = true;
        } else if (args.parent) {
          childOf = args.parent;
          includeChildren = false;
        } else {
          childOf = 0;
        }

        includeTerms = args.include || [];
        excludeTerms = args.exclude || [];
      } else {
        queryType = 'post';
        postType = args.post_type || 'post';
        postCount = args.posts_per_page ?? -1;

        if (args.post_parent) {
          childOf = args.post_parent;
        } else {
          childOf = 0;
        }

        includePosts = args.post__in || [];
        excludePosts = args.post__not_in || [];

        // Parse tax_query
        if (args.tax_query && Array.isArray(args.tax_query)) {
          const includeQuery = args.tax_query.find((q: any) => q.operator === 'IN');
          const excludeQuery = args.tax_query.find((q: any) => q.operator === 'NOT IN');

          if (includeQuery) {
            includeTaxonomies = includeQuery.terms || [];
            if (includeQuery.taxonomy) taxonomy = includeQuery.taxonomy;
          }
          if (excludeQuery) {
            excludeTaxonomies = excludeQuery.terms || [];
          }
        }

        // Parse meta_query
        if (args.meta_query) {
          if (Array.isArray(args.meta_query)) {
            metaQueries = args.meta_query
              .filter((mq: any) => mq.key) // Only include items with a key (exclude relation objects)
              .map((mq: any, idx: number) => ({
                key: mq.key || '',
                value: mq.value || '',
                compare: mq.compare || '=',
                type: mq.type || 'CHAR',
                clauseName: mq.clauseName || `clause_${idx + 1}`,
                title: mq.title || ''
              }));
            // Check for relation in array
            const relationItem = args.meta_query.find((item: any) => item.relation);
            if (relationItem) {
              metaQueryRelation = relationItem.relation === 'OR' ? 'OR' : 'AND';
            }
          } else if (typeof args.meta_query === 'object') {
            // Handle object format with numeric keys
            metaQueryRelation = args.meta_query.relation || 'AND';
            metaQueries = Object.keys(args.meta_query)
              .filter(key => !isNaN(Number(key))) // Only numeric keys
              .map((key, idx) => {
                const mq = args.meta_query[key];
                return {
                  key: mq.key || '',
                  value: mq.value || '',
                  compare: mq.compare || '=',
                  type: mq.type || 'CHAR',
                  clauseName: mq.clauseName || `clause_${idx + 1}`,
                  title: mq.title || ''
                };
              });
          }
        }
      }

      offset = args.offset || 0;
      orderBy = args.orderby || 'title';
      order = args.order || 'ASC';
      includeChildren = args.include_children ?? false;
      hierarchical = args.hierarchical ?? false;

    } catch (e) {
      // Silently fail parsing
    } finally {
      setTimeout(() => {
        isUpdatingFromQuery = false;
      }, 100);
    }
  }

  // Watch for manual edits to rawWPQuery
  $effect(() => {
    if (rawWPQuery && !isUpdatingFromUI) {
      parseWPQueryToUI(rawWPQuery);
    }
  });

  // Options for selects
  let postTypeOptions = $state<SelectOption[]>([]);
  let taxonomyOptions = $state<SelectOption[]>([]);
  let postOptions = $state<SelectOption[]>([]);
  let termOptions = $state<SelectOption[]>([]);

  const queryTypeOptions: SelectOption[] = [
    { value: 'post', label: 'Post' },
    { value: 'taxonomy', label: 'Taxonomy' }
  ];

  const orderByOptions: SelectOption[] = [
    { value: 'title', label: 'Title' },
    { value: 'date', label: 'Date' },
    { value: 'modified', label: 'Modified' },
    { value: 'menu_order', label: 'Menu Order' },
    { value: 'ID', label: 'ID' },
    { value: 'author', label: 'Author' },
    { value: 'name', label: 'Name (Slug)' },
    { value: 'rand', label: 'Random' }
  ];

  const orderOptions: SelectOption[] = [
    { value: 'ASC', label: 'Ascending' },
    { value: 'DESC', label: 'Descending' }
  ];

  // Fetch data on mount
  $effect(() => {
    if (open) {
      fetchPostTypes();
      fetchTaxonomies();
    }
  });

  // Fetch posts when post type changes
  $effect(() => {
    if (queryType === 'post' && postType) {
      fetchPosts();
    }
  });

  // Fetch terms when taxonomy changes
  $effect(() => {
    if (queryType === 'taxonomy' && taxonomy) {
      fetchTerms();
    }
  });

  async function fetchPostTypes() {
    try {
      const response = await fetch(`${apiUrl}/menu-queries/post-types`, {
        headers: { 'X-WP-Nonce': nonce }
      });
      postTypeOptions = await response.json();
    } catch (error) {
      // Silently fail
    }
  }

  async function fetchTaxonomies() {
    try {
      const response = await fetch(`${apiUrl}/menu-queries/taxonomies`, {
        headers: { 'X-WP-Nonce': nonce }
      });
      taxonomyOptions = await response.json();
    } catch (error) {
      // Silently fail
    }
  }

  async function fetchPosts() {
    try {
      const response = await fetch(`${apiUrl}/menu-queries/posts?post_type=${postType}`, {
        headers: { 'X-WP-Nonce': nonce }
      });
      postOptions = await response.json();
    } catch (error) {
      // Silently fail
    }
  }

  async function fetchTerms() {
    try {
      const response = await fetch(`${apiUrl}/menu-queries/terms?taxonomy=${taxonomy}`, {
        headers: { 'X-WP-Nonce': nonce }
      });
      termOptions = await response.json();
    } catch (error) {
      // Silently fail
    }
  }

  function generateWPQuery(preserveCustomProperties = true) {
    // Don't generate if we're updating from a manual query edit
    if (isUpdatingFromQuery) {
      return;
    }

    isUpdatingFromUI = true;

    // Parse existing custom properties if we want to preserve them
    let existingCustomProps: any = {};
    if (preserveCustomProperties && rawWPQuery) {
      try {
        const existing = JSON.parse(rawWPQuery);
        // Known properties that map to UI - these will be overwritten
        const knownProps = new Set([
          'post_type', 'posts_per_page', 'offset', 'orderby', 'order', 'include_children', 'hierarchical',
          'post_parent', 'post__in', 'post__not_in', 'tax_query', 'meta_query',
          'taxonomy', 'number', 'child_of', 'parent', 'include', 'exclude'
        ]);
        // Copy over any custom properties not managed by UI
        Object.keys(existing).forEach(key => {
          if (!knownProps.has(key)) {
            existingCustomProps[key] = existing[key];
          }
        });
      } catch (e) {
        // If parsing fails, ignore custom props
      }
    }

    // Build known properties first
    const args: any = {};

    if (queryType === 'post') {
      args.post_type = postType;
      args.posts_per_page = postCount;
      if (offset > 0) args.offset = offset;
      args.orderby = orderBy;
      args.order = order;
      args.include_children = includeChildren;
      args.hierarchical = hierarchical;

      if (childOf > 0) {
        args.post_parent = childOf;
      }

      const includePostsFiltered = includePosts.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id));
      if (includePostsFiltered.length > 0) args.post__in = includePostsFiltered;

      const excludePostsFiltered = excludePosts.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id));
      if (excludePostsFiltered.length > 0) args.post__not_in = excludePostsFiltered;

      const includeTaxFiltered = includeTaxonomies.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id));
      const excludeTaxFiltered = excludeTaxonomies.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id));

      if (includeTaxFiltered.length > 0 || excludeTaxFiltered.length > 0) {
        args.tax_query = [];
        if (includeTaxFiltered.length > 0) {
          args.tax_query.push({
            taxonomy: taxonomy,
            field: 'term_id',
            terms: includeTaxFiltered,
            operator: 'IN'
          });
        }
        if (excludeTaxFiltered.length > 0) {
          args.tax_query.push({
            taxonomy: taxonomy,
            field: 'term_id',
            terms: excludeTaxFiltered,
            operator: 'NOT IN'
          });
        }
      }

      if (metaQueries.length > 0) {
        // Filter out meta queries with empty key or value
        const validMetaQueries = metaQueries.filter(mq => mq.key.trim() !== '' && mq.value.trim() !== '');

        if (validMetaQueries.length > 0) {
          args.meta_query = {
            ...validMetaQueries.reduce((acc, mq, index) => {
              acc[index] = {
                key: mq.key,
                value: mq.value,
                compare: mq.compare,
                type: mq.type
              };
              if (mq.clauseName) {
                acc[index].clauseName = mq.clauseName;
              }
              if (mq.title) {
                acc[index].title = mq.title;
              }
              return acc;
            }, {} as any)
          };
          // Add relation if there are multiple meta queries
          if (validMetaQueries.length > 1) {
            args.meta_query.relation = metaQueryRelation;
          }
        }
      }
    } else {
      // Taxonomy query
      args.taxonomy = taxonomy;
      args.number = postCount;
      if (offset > 0) args.offset = offset;
      args.orderby = orderBy;
      args.order = order;
      args.include_children = includeChildren;
      args.hierarchical = hierarchical;

      if (childOf > 0) {
        if (includeChildren) {
          args.child_of = childOf;
        } else {
          args.parent = childOf;
        }
      }

      const includeTermsFiltered = includeTerms.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id));
      if (includeTermsFiltered.length > 0) args.include = includeTermsFiltered;

      const excludeTermsFiltered = excludeTerms.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id));
      if (excludeTermsFiltered.length > 0) args.exclude = excludeTermsFiltered;
    }

    // Add custom properties at the end
    Object.assign(args, existingCustomProps);

    rawWPQuery = JSON.stringify(args, null, 2);

    setTimeout(() => {
      isUpdatingFromUI = false;
    }, 100);
  }

  // Track if modal is ready for auto-generation (non-reactive)
  let autoGenEnabled = false;
  let autoGenTimeout: number | null = null;

  // Enable auto-generation after modal loads
  $effect(() => {
    if (open) {
      // Enable after delay
      if (autoGenTimeout) clearTimeout(autoGenTimeout);
      autoGenTimeout = window.setTimeout(() => {
        autoGenEnabled = true;
        autoGenTimeout = null;
      }, 300);
    } else {
      // Disable when closed
      if (autoGenTimeout) {
        clearTimeout(autoGenTimeout);
        autoGenTimeout = null;
      }
      autoGenEnabled = false;
    }
  });

  // Auto-generate when UI changes
  $effect(() => {
    // Track all UI state
    const state = {
      queryType,
      postType,
      taxonomy,
      orderBy,
      order,
      postCount,
      offset,
      childOf,
      includeChildren,
      hierarchical,
      showLabelOnEmpty,
      emptyLabel,
      includePosts,
      excludePosts,
      includeTerms,
      excludeTerms,
      includeTaxonomies,
      excludeTaxonomies,
      metaQueries
    };

    // Only generate if enabled and not updating from query
    if (autoGenEnabled && !isUpdatingFromQuery) {
      generateWPQuery(true);
    }
  });

  function handleSubmit() {
    const config: QueryConfig = {
      queryType,
      postType,
      taxonomy,
      orderBy,
      order,
      postCount: typeof postCount === 'string' ? parseInt(postCount, 10) : postCount,
      offset: typeof offset === 'string' ? parseInt(offset, 10) : offset,
      childOf: typeof childOf === 'string' ? parseInt(childOf, 10) : childOf,
      includeChildren,
      hierarchical,
      showLabelOnEmpty,
      emptyLabel,
      includePosts: includePosts.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id)),
      excludePosts: excludePosts.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id)),
      includeTerms: includeTerms.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id)),
      excludeTerms: excludeTerms.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id)),
      includeTaxonomies: includeTaxonomies.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id)),
      excludeTaxonomies: excludeTaxonomies.map(id => typeof id === 'number' ? id : parseInt(id as string, 10)).filter(id => !isNaN(id)),
      metaQueries,
      metaQueryRelation,
      rawWPQuery: rawWPQuery || undefined
    };
    onSubmit(config);
    onClose();
  }

  function handleMetaQueriesUpdate(queries: MetaQuery[]) {
    metaQueries = queries;
  }

  let resetConfirmTimeout: number | null = null;

  function handleReset() {
    if (!showResetConfirm) {
      // First click: show confirmation
      showResetConfirm = true;
      // Auto-reset confirmation after 3 seconds
      resetConfirmTimeout = window.setTimeout(() => {
        showResetConfirm = false;
      }, 3000);
    } else {
      // Second click: perform reset
      if (resetConfirmTimeout) {
        clearTimeout(resetConfirmTimeout);
        resetConfirmTimeout = null;
      }
      showResetConfirm = false;

      // Temporarily disable auto-generation
      autoGenEnabled = false;

      // Reset to defaults
      queryType = 'post';
      postType = 'post';
      taxonomy = 'category';
      orderBy = 'title';
      postCount = -1;
      offset = 0;
      childOf = 0;
      includeChildren = false;
      hierarchical = false;
      showLabelOnEmpty = false;
      emptyLabel = '';
      includePosts = [];
      excludePosts = [];
      includeTerms = [];
      excludeTerms = [];
      includeTaxonomies = [];
      excludeTaxonomies = [];
      metaQueries = [];
      metaQueryRelation = 'AND';

      // Clear WP_Query immediately
      rawWPQuery = '';

      // Re-enable auto-generation
      setTimeout(() => {
        autoGenEnabled = true;
      }, 100);
    }
  }

  // Execute query and fetch results
  async function executeQuery() {
    if (!rawWPQuery) {
      resultsError = 'No query to execute';
      return;
    }

    isLoadingResults = true;
    resultsError = '';
    queryResults = '';

    try {
      const args = JSON.parse(rawWPQuery);

      const response = await fetch(`${apiUrl}/menu-queries/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        body: JSON.stringify({ args, query_type: queryType })
      });

      const data = await response.json();

      if (data.success) {
        queryResults = JSON.stringify(data.data, null, 2);
      } else {
        resultsError = data.message || 'Error executing query';
      }
    } catch (e: any) {
      resultsError = e.message || 'Error executing query';
    } finally {
      isLoadingResults = false;
    }
  }

  // Watch for tab changes to Results tab
  $effect(() => {
    if (activeTab === 'results' && rawWPQuery) {
      executeQuery();
    }
  });

  let canSave = $derived(rawWPQuery.length > 0);
</script>

<Modal bind:open size="fullscreen" title="Query Builder">
  {#snippet children()}
    <!-- Tab Navigation -->
    <div class="wpea-tabs">
      <div class="wpea-tabs__list" role="tablist">
        <button
          class="wpea-tabs__tab"
          role="tab"
          aria-selected={activeTab === 'builder'}
          onclick={() => activeTab = 'builder'}
        >
          Builder
        </button>
        <button
          class="wpea-tabs__tab"
          role="tab"
          aria-selected={activeTab === 'query'}
          onclick={() => activeTab = 'query'}
        >
          WP_Query
        </button>
        <button
          class="wpea-tabs__tab"
          role="tab"
          aria-selected={activeTab === 'results'}
          onclick={() => activeTab = 'results'}
        >
          Results
        </button>
      </div>
    </div>

    {#if activeTab === 'builder'}
    <!-- Builder Tab -->
    <Stack>
      <Card title="Query Type">
        <div class="wpea-grid-2">
          <Select
            id="query-type"
            label="Type"
            bind:value={queryType}
            options={queryTypeOptions}
          />

          {#if queryType === 'post'}
            <Select
              id="post-type"
              label="Post Type"
              bind:value={postType}
              options={postTypeOptions}
            />
          {:else}
            <Select
              id="taxonomy"
              label="Taxonomy"
              bind:value={taxonomy}
              options={taxonomyOptions}
            />
          {/if}
        </div>
      </Card>

      <Card title="Query Parameters">
        <div class="wpea-grid-3">
          <Select
            id="order-by"
            label="Order By"
            bind:value={orderBy}
            options={orderByOptions}
          />

          <Select
            id="order"
            label="Order"
            bind:value={order}
            options={orderOptions}
          />

          <Input
            id="post-count"
            label="Post Count"
            type="number"
            bind:value={postCount}
            help="Use -1 for unlimited"
          />

          <Input
            id="child-of"
            label="Child Of"
            type="number"
            bind:value={childOf}
            help="Show only children of this ID"
          />
        </div>
        <div class="wpea-grid-2">
          <Switch
            id="include-children"
            label="Include Children"
            bind:checked={includeChildren}
          />
          <Switch
            id="hierarchical"
            label="Hierarchical Results"
            bind:checked={hierarchical}
            help="When checked, results are nested by parent/child relationships"
          />
        </div>
      </Card>

      <Card title="Empty Results">
        <Switch
          id="show-label-on-empty"
          label="Show Label on Empty Result"
          bind:checked={showLabelOnEmpty}
          help="Display a label when query returns no results"
        />
        {#if showLabelOnEmpty}
          <Input
            id="empty-label"
            label="Empty Label Text"
            bind:value={emptyLabel}
            placeholder="No items found"
          />
        {/if}
      </Card>

      {#if queryType === 'post'}
        <Card title="Include / Exclude Posts">
          <div class="wpea-grid-2">
            <MultiSelect
              id="include-posts"
              label="Include Posts"
              bind:value={includePosts}
              options={postOptions}
              placeholder="Search posts..."
            />

            <MultiSelect
              id="exclude-posts"
              label="Exclude Posts"
              bind:value={excludePosts}
              options={postOptions}
              placeholder="Search posts..."
            />
          </div>
        </Card>

        <Card title="Include / Exclude Taxonomies">
          <p class="wpea-text-muted wpea-text-sm">Filter posts by taxonomies.</p>
          <div class="wpea-grid-2">
            <MultiSelect
              id="include-taxonomies"
              label="Include Taxonomies"
              bind:value={includeTaxonomies}
              options={termOptions}
              placeholder="Search terms..."
            />

            <MultiSelect
              id="exclude-taxonomies"
              label="Exclude Taxonomies"
              bind:value={excludeTaxonomies}
              options={termOptions}
              placeholder="Search terms..."
            />
          </div>
        </Card>

        <Card>
          <MetaQueryRepeater
            bind:metaQueries
            bind:relation={metaQueryRelation}
            onUpdate={handleMetaQueriesUpdate}
          />
        </Card>
      {:else}
        <Card title="Include / Exclude Terms">
          <div class="wpea-grid-2">
            <MultiSelect
              id="include-terms"
              label="Include Terms"
              bind:value={includeTerms}
              options={termOptions}
              placeholder="Search terms..."
            />

            <MultiSelect
              id="exclude-terms"
              label="Exclude Terms"
              bind:value={excludeTerms}
              options={termOptions}
              placeholder="Search terms..."
            />
          </div>
        </Card>
      {/if}
    </Stack>
    {:else if activeTab === 'query'}
    <!-- WP_Query Tab -->
    <Stack>
      <Card title="Raw WP_Query">
        <p class="wpea-text-muted wpea-text-sm">
          Edit the generated WP_Query JSON below. This will be used to fetch items.
        </p>
        <Textarea
          id="raw-wp-query"
          bind:value={rawWPQuery}
          rows={20}
          placeholder="Click 'Build Query' in the Builder tab to generate..."
        />
      </Card>
    </Stack>
    {:else}
    <!-- Results Tab -->
    <Stack>
      <Card title="Query Results">
        {#if isLoadingResults}
          <p class="wpea-text-muted">Loading results...</p>
        {:else if resultsError}
          <p class="wpea-text-danger">{resultsError}</p>
        {:else if queryResults}
          <Textarea
            id="query-results"
            value={queryResults}
            rows={20}
            readonly={true}
          />
        {:else}
          <p class="wpea-text-muted">No results yet. Switch to this tab after creating a query.</p>
        {/if}
      </Card>
    </Stack>
    {/if}
  {/snippet}

  {#snippet footer()}
    <div style="display: flex; justify-content: space-between; width: 100%;">
      <div>
        <Button
          variant={showResetConfirm ? "danger" : "ghost"}
          onclick={handleReset}
        >
          {showResetConfirm ? "Confirm Reset?" : "Reset"}
        </Button>
      </div>
      <div style="display: flex; gap: var(--wpea-space--sm);">
        <Button variant="ghost" onclick={onClose}>
          Cancel
        </Button>
        {#if canSave}
          <Button variant="primary" onclick={handleSubmit}>
            Save Query
          </Button>
        {/if}
      </div>
    </div>
  {/snippet}
</Modal>

<style>
  /* Override fullscreen modal to be 90% viewport with max width */
  :global(.wpea-modal--fullscreen .wpea-modal__container) {
    width: 90vw !important;
    height: 90vh !important;
    max-width: 800px !important;
    max-height: 90vh !important;
  }

  .wpea-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--wpea-space--md);
    align-items: start;
  }

  .wpea-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--wpea-space--md);
    align-items: start;
  }

  /* Force dark mode colors on inputs within modal */
  :global(.wpea-modal--open .wpea-input),
  :global(.wpea-modal--open .wpea-select),
  :global(.wpea-modal--open .wpea-textarea) {
    background-color: var(--wpea-input--bg-dark);
    border-color: var(--wpea-input--border-dark);
    color: var(--wpea-color--text-dark);
  }

  :global(.wpea-modal--open .wpea-input:hover),
  :global(.wpea-modal--open .wpea-select:hover),
  :global(.wpea-modal--open .wpea-textarea:hover) {
    background-color: var(--wpea-input--bg-hover-dark);
    border-color: var(--wpea-input--border-hover-dark);
  }

  :global(.wpea-modal--open .wpea-input:focus),
  :global(.wpea-modal--open .wpea-select:focus),
  :global(.wpea-modal--open .wpea-textarea:focus) {
    background-color: var(--wpea-input--bg-focus-dark);
    border-color: var(--wpea-input--border-focus-dark);
  }

  :global(.wpea-modal--open .wpea-input::placeholder) {
    color: var(--wpea-input--placeholder-dark);
  }

  /* Fix select arrow visibility in dark mode */
  :global(.wpea-modal--open .wpea-select) {
    background-color: var(--wpea-input--bg-dark);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23e5e5e5' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 12px;
    padding-right: 2rem;
  }

  :global(.wpea-modal--open .wpea-select:hover) {
    background-color: var(--wpea-input--bg-dark) !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ba9902' d='M6 9L1 4h10z'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 0.5rem center !important;
    background-size: 12px !important;
    border-color: var(--wpea-color--primary) !important;
  }

  :global(.wpea-modal--open .wpea-select:focus) {
    background-color: var(--wpea-input--bg-focus-dark) !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23e5e5e5' d='M6 9L1 4h10z'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 0.5rem center !important;
    background-size: 12px !important;
  }

  @container (max-width: 768px) {
    .wpea-grid-2,
    .wpea-grid-3 {
      grid-template-columns: 1fr;
    }
  }
</style>
