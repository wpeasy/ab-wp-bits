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
    onUpdate: (queries: MetaQuery[]) => void;
  }

  let { metaQueries = $bindable([]), onUpdate }: Props = $props();

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
      clauseName: ''
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
</script>

<Stack>
  <div class="wpea-flex wpea-justify-between wpea-align-center">
    <h3 class="wpea-heading wpea-heading--sm">Meta Queries</h3>
    <Button variant="secondary" size="s" onclick={addMetaQuery}>
      Add Meta Query
    </Button>
  </div>

  {#if metaQueries.length === 0}
    <p class="wpea-text-muted wpea-text-sm">No meta queries added. Click "Add Meta Query" to add one.</p>
  {:else}
    {#each metaQueries as query, index (index)}
      <Card>
        {#snippet header()}
          <div class="wpea-flex wpea-justify-between wpea-align-center">
            <div class="wpea-card__title">Meta Query #{index + 1}</div>
            <Button variant="ghost" size="s" onclick={() => removeMetaQuery(index)}>
              Remove
            </Button>
          </div>
        {/snippet}

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
      </Card>
    {/each}
  {/if}
</Stack>

<style>
  .wpea-flex {
    display: flex;
  }

  .wpea-justify-between {
    justify-content: space-between;
  }

  .wpea-align-center {
    align-items: center;
  }

  .wpea-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--wpea-space--md);
  }
</style>
