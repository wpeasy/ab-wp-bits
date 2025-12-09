<script lang="ts">
  import type { Snippet } from 'svelte';

  type Column<T = any> = {
    key: string;
    label: string;
    render?: (row: T) => any;
  };

  type Props<T = any> = {
    columns: Column<T>[];
    data: T[];
    striped?: boolean;
    class?: string;
    style?: string;
    thead?: Snippet;
    tbody?: Snippet;
  };

  let {
    columns = [],
    data = [],
    striped = false,
    class: className = '',
    style,
    thead,
    tbody
  }: Props = $props();
</script>

<table class="wpea-table {striped ? 'wpea-table--striped' : ''} {className}" {style}>
  <thead>
    {#if thead}
      {@render thead()}
    {:else}
      <tr>
        {#each columns as column}
          <th>{column.label}</th>
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
