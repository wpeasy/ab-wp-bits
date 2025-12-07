<script lang="ts">
  import type { ConditionsConfig, Capability, RoleEvaluationResult } from './menu-conditions-types';
  import Modal from './lib/Modal.svelte';
  import Button from './lib/Button.svelte';
  import ConditionsRepeater from './ConditionsRepeater.svelte';
  import ConditionsResults from './ConditionsResults.svelte';

  interface Props {
    open: boolean;
    menuItemId: number;
    initialConditions: ConditionsConfig | null;
    capabilities: Capability[];
    onClose: () => void;
    onSave: (conditions: ConditionsConfig) => void;
  }

  let {
    open = $bindable(false),
    menuItemId,
    initialConditions = null,
    capabilities,
    onClose,
    onSave
  }: Props = $props();

  const { apiUrl, nonce } = window.abMenuConditionsData;

  // State
  let activeTab = $state('conditions');
  let relation = $state<'AND' | 'OR'>('AND');
  let conditions = $state<ConditionsConfig['conditions']>([]);

  // Load initial conditions when modal opens or menu item changes
  $effect(() => {
    if (open) {
      if (initialConditions && initialConditions.conditions && initialConditions.conditions.length > 0) {
        relation = initialConditions.relation || 'AND';
        conditions = JSON.parse(JSON.stringify(initialConditions.conditions)); // Deep copy
      } else {
        // Reset to defaults
        relation = 'AND';
        conditions = [];
      }
      // Reset to conditions tab when opening
      activeTab = 'conditions';
    }
  });

  function handleConditionsUpdate(newConditions: ConditionsConfig['conditions']) {
    conditions = newConditions;
  }

  async function handleSave() {
    const config: ConditionsConfig = {
      relation,
      conditions
    };
    await onSave(config);
    onClose();
  }

  async function evaluateConditions(conditionsConfig: ConditionsConfig): Promise<RoleEvaluationResult[]> {
    try {
      const response = await fetch(`${apiUrl}/menu-conditions/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        body: JSON.stringify({
          conditions: conditionsConfig
        })
      });

      const data = await response.json();
      if (data.success) {
        return data.results;
      }
      return [];
    } catch (error) {
      console.error('Failed to evaluate conditions:', error);
      return [];
    }
  }

  let currentConditionsConfig = $derived<ConditionsConfig>({
    relation,
    conditions
  });
</script>

<Modal bind:open size="large" title="Menu Item Conditions">
  {#snippet children()}
    <!-- Tab Navigation -->
    <div class="wpea-tabs">
      <div class="wpea-tabs__list" role="tablist">
        <button
          class="wpea-tabs__tab"
          role="tab"
          aria-selected={activeTab === 'conditions'}
          onclick={() => activeTab = 'conditions'}
        >
          Conditions
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

    {#if activeTab === 'conditions'}
      <ConditionsRepeater
        bind:conditions
        bind:relation
        {capabilities}
        onUpdate={handleConditionsUpdate}
      />
    {:else}
      <ConditionsResults
        conditions={currentConditionsConfig}
        {capabilities}
        onEvaluate={evaluateConditions}
      />
    {/if}
  {/snippet}

  {#snippet footer()}
    <div style="display: flex; justify-content: space-between; width: 100%;">
      <div>
        {#if conditions.length > 0}
          <span class="wpea-text-muted wpea-text-sm">
            {conditions.length} condition{conditions.length !== 1 ? 's' : ''} set
          </span>
        {/if}
      </div>
      <div style="display: flex; gap: var(--wpea-space--sm);">
        <Button variant="ghost" onclick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onclick={handleSave}>
          Save Conditions
        </Button>
      </div>
    </div>
  {/snippet}
</Modal>
