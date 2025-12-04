<script lang="ts">
  import type { MetaQuery } from './menu-queries-types';
  import Input from './lib/Input.svelte';
  import Select from './lib/Select.svelte';
  import Button from './lib/Button.svelte';
  import Card from './lib/Card.svelte';
  import Cluster from './lib/Cluster.svelte';
  import Stack from './lib/Stack.svelte';

  interface Props {
    metaQueries: MetaQuery[];
    relation: 'AND' | 'OR';
    onUpdate: (queries: MetaQuery[]) => void;
  }

  let { metaQueries = $bindable([]), relation = $bindable('AND'), onUpdate }: Props = $props();

  let editingTitleIndex = $state<number | null>(null);
  let titleInputRef = $state<HTMLInputElement | null>(null);

  $effect(() => {
    if (editingTitleIndex !== null && titleInputRef) {
      titleInputRef.focus();
    }
  });

  const compareOptions = [
    { value: '=', label: '=' },
    { value: '!=', label: '!=' },
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
    { value: 'LIKE', label: 'LIKE' },
    { value: 'NOT LIKE', label: 'NOT LIKE' },
    { value: 'IN', label: 'IN' },
    { value: 'NOT IN', label: 'NOT IN' },
    { value: 'BETWEEN', label: 'BETWEEN' },
    { value: 'NOT BETWEEN', label: 'NOT BETWEEN' },
    { value: 'EXISTS', label: 'EXISTS' },
    { value: 'NOT EXISTS', label: 'NOT EXISTS' }
  ];

  const typeOptions = [
    { value: 'CHAR', label: 'CHAR' },
    { value: 'NUMERIC', label: 'NUMERIC' },
    { value: 'BINARY', label: 'BINARY' },
    { value: 'DATE', label: 'DATE' },
    { value: 'DATETIME', label: 'DATETIME' },
    { value: 'DECIMAL', label: 'DECIMAL' },
    { value: 'SIGNED', label: 'SIGNED' },
    { value: 'UNSIGNED', label: 'UNSIGNED' }
  ];

  function addMetaQuery() {
    metaQueries = [...metaQueries, {
      key: '',
      value: '',
      compare: '=',
      type: 'CHAR',
      clauseName: '',
      title: ''
    }];
    onUpdate(metaQueries);
  }

  function removeMetaQuery(index: number) {
    metaQueries = metaQueries.filter((_, i) => i !== index);
    onUpdate(metaQueries);
  }

  function updateMetaQuery(index: number, field: keyof MetaQuery, value: string) {
    metaQueries[index][field] = value;
    onUpdate(metaQueries);
  }

  function startEditingTitle(index: number) {
    editingTitleIndex = index;
  }

  function finishEditingTitle(index: number) {
    editingTitleIndex = null;
    onUpdate(metaQueries);
  }

  function handleTitleKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter') {
      finishEditingTitle(index);
    } else if (event.key === 'Escape') {
      editingTitleIndex = null;
    }
  }
</script>

<Stack>
  <div style="display: flex; justify-content: space-between; align-items: center; position: relative;">
    <h3 class="wpea-heading wpea-heading--sm">Meta Queries</h3>
    {#if metaQueries.length > 1}
      <div style="position: absolute; left: 50%; transform: translateX(-50%);">
        <button
          type="button"
          class="wpea-button wpea-button--secondary"
          style="padding: 4px 12px; font-size: 13px; min-width: 50px;"
          onclick={() => relation = relation === 'AND' ? 'OR' : 'AND'}
        >
          {relation}
        </button>
      </div>
    {/if}
    <Button variant="secondary" size="s" onclick={addMetaQuery}>
      Add Meta Query
    </Button>
  </div>

  {#if metaQueries.length === 0}
    <p class="wpea-text-muted wpea-text-sm">No meta queries added. Click "Add Meta Query" to add one.</p>
  {:else}
    {#each metaQueries as query, index (index)}
      <div class="wpea-card">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 16px 0 16px;">
          {#if editingTitleIndex === index}
            <input
              type="text"
              bind:this={titleInputRef}
              bind:value={query.title}
              onblur={() => finishEditingTitle(index)}
              onkeydown={(e) => handleTitleKeydown(e, index)}
              style="font-weight: 600; font-size: 14px; border: 1px solid var(--wpea-input--border); padding: 4px 8px; border-radius: 4px; background: var(--wpea-input--bg); color: var(--wpea-surface--text);"
              placeholder="Meta Query #{index + 1}"
            />
          {:else}
            <button
              type="button"
              style="font-weight: 600; font-size: 14px; cursor: pointer; padding: 4px 0; background: transparent; border: none; color: var(--wpea-surface--text); text-align: left;"
              onclick={() => startEditingTitle(index)}
              title="Click to edit"
            >
              {query.title || `Meta Query #${index + 1}`}
            </button>
          {/if}
          <Button variant="ghost" size="s" onclick={() => removeMetaQuery(index)}>
            Remove
          </Button>
        </div>

        <div style="padding: 16px;">
          <div class="wpea-grid-2">
          <Input
            id="meta-key-{index}"
            label="Meta Key"
            bind:value={query.key}
            onchange={() => updateMetaQuery(index, 'key', query.key)}
            placeholder="e.g. _custom_field"
          />

          <Input
            id="meta-value-{index}"
            label="Meta Value"
            bind:value={query.value}
            onchange={() => updateMetaQuery(index, 'value', query.value)}
            placeholder="e.g. some value"
          />

          <Select
            id="meta-compare-{index}"
            label="Compare"
            bind:value={query.compare}
            onchange={() => updateMetaQuery(index, 'compare', query.compare)}
            options={compareOptions}
          />

          <Select
            id="meta-type-{index}"
            label="Type"
            bind:value={query.type}
            onchange={() => updateMetaQuery(index, 'type', query.type)}
            options={typeOptions}
          />

          <div style="grid-column: 1 / -1;">
            <Input
              id="meta-clause-{index}"
              label="Clause Name"
              bind:value={query.clauseName}
              onchange={() => updateMetaQuery(index, 'clauseName', query.clauseName)}
              placeholder="e.g. price_clause"
              help="Set clause name to be used as 'Order by' parameter."
            />
          </div>
        </div>
        </div>
      </div>
    {/each}
  {/if}
</Stack>

<style>
  .wpea-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--wpea-space--md);
  }
</style>
