<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { TableColumn } from '../types';
  import { isSnippet } from '../utils/renderContent';

  type Props<T = Record<string, unknown>> = {
    columns: TableColumn<T>[];
    data: T[];
    striped?: boolean;
    hover?: boolean;
    class?: string;
    style?: string;
    thead?: Snippet;
    tbody?: Snippet;
  };

  let {
    columns = [],
    data = [],
    striped = false,
    hover = false,
    class: className = '',
    style,
    thead,
    tbody
  }: Props = $props();

  let tableClasses = $derived([
    'wpea-table',
    striped ? 'wpea-table--striped' : '',
    hover ? 'wpea-table--hover' : '',
    className
  ].filter(Boolean).join(' '));
</script>

<table class={tableClasses} {style}>
  <thead>
    {#if thead}
      {@render thead()}
    {:else}
      <tr>
        {#each columns as column}
          <th>
            {#if isSnippet(column.label)}
              {@render column.label()}
            {:else}
              {column.label}
            {/if}
          </th>
        {/each}
      </tr>
    {/if}
  </thead>
  <tbody>
    {#if tbody}
      {@render tbody()}
    {:else}
      {#each data as row}
        <tr>
          {#each columns as column}
            <td>
              {#if column.render}
                {@render column.render(row)}
              {:else}
                {row[column.key]}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    {/if}
  </tbody>
</table>
