<script lang="ts">
  import type { QueryConfig } from './menu-queries-types';
  import QueryBuilderModal from './QueryBuilderModal.svelte';

  let { onSubmit }: { onSubmit: (config: QueryConfig) => void } = $props();

  let modalOpen = $state(false);
  let initialConfig = $state<QueryConfig | null>(null);

  // Listen for custom event to open modal
  $effect(() => {
    const handleOpen = (e: CustomEvent) => {
      console.log('MenuQueries: Event received in MenuQueriesApp', e.detail);
      const { config } = e.detail || {};
      initialConfig = config || null;
      console.log('MenuQueries: Setting initialConfig to:', initialConfig);
      modalOpen = true;
      console.log('MenuQueries: Modal should now be open, modalOpen =', modalOpen);
    };

    console.log('MenuQueries: Setting up event listener for menu-queries:open');
    document.addEventListener('menu-queries:open', handleOpen as EventListener);

    return () => {
      document.removeEventListener('menu-queries:open', handleOpen as EventListener);
    };
  });

  function handleClose() {
    modalOpen = false;
    // Don't reset initialConfig here - let it be set on next open
  }

  function handleSubmit(config: QueryConfig) {
    onSubmit(config);
  }
</script>

<QueryBuilderModal
  bind:open={modalOpen}
  initialConfig={initialConfig}
  onClose={handleClose}
  onSubmit={handleSubmit}
/>
