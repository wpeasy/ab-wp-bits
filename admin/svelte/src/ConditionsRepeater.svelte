<script lang="ts">
  import type { Condition, Capability } from './menu-conditions-types';
  import Card from './lib/Card.svelte';
  import Button from './lib/Button.svelte';
  import Toggle3State from './lib/Toggle3State.svelte';
  import AdvancedSelect from './lib/AdvancedSelect.svelte';

  interface Props {
    conditions: Condition[];
    relation: 'AND' | 'OR';
    capabilities: Capability[];
    onUpdate: (conditions: Condition[]) => void;
  }

  let {
    conditions = $bindable([]),
    relation = $bindable<'AND' | 'OR'>('AND'),
    capabilities = [],
    onUpdate
  }: Props = $props();

  function addCondition() {
    conditions = [
      ...conditions,
      {
        operator: 'has',
        capability: ''
      }
    ];
    onUpdate(conditions);
  }

  function removeCondition(index: number) {
    conditions = conditions.filter((_, i) => i !== index);
    onUpdate(conditions);
  }

  function handleCapabilityChange(index: number, capability: string | string[]) {
    // AdvancedSelect with multiple={false} returns a string
    const capValue = Array.isArray(capability) ? capability[0] || '' : capability;
    conditions[index] = {
      ...conditions[index],
      capability: capValue
    };
    onUpdate(conditions);
  }

  function handleOperatorChange(index: number, operator: string) {
    conditions[index] = {
      ...conditions[index],
      operator: operator as 'has' | 'has_not'
    };
    onUpdate(conditions);
  }

  function handleRelationChange(newRelation: string) {
    relation = newRelation as 'AND' | 'OR';
  }

  // Get filtered capabilities (excluding already selected ones)
  function getFilteredCapabilities(currentIndex: number): Capability[] {
    const excludedValues = conditions
      .filter((_, i) => i !== currentIndex)
      .map(c => c.capability)
      .filter(Boolean);

    return capabilities.filter(cap => !excludedValues.includes(cap.value));
  }
</script>

<Card title="Conditions">
  <div class="conditions-repeater">
    {#if conditions.length === 0}
      <p class="wpea-text-muted wpea-text-sm">
        No conditions set. Menu item will be visible to all users.
      </p>
    {:else}
      {#each conditions as condition, index (index)}
        <div class="condition-row">
          <div class="condition-fields">
            <div class="condition-operator">
              <Toggle3State
                value={condition.operator}
                onChange={(operator) => handleOperatorChange(index, operator)}
                options={[
                  { value: 'has', label: 'Has' },
                  { value: 'has_not', label: 'Has Not' }
                ]}
                ariaLabel="Condition operator"
              />
            </div>

            <div class="condition-capability">
              <AdvancedSelect
                id="capability-{index}"
                label=""
                placeholder={condition.capability ? "Search capabilities..." : "Select a capability..."}
                value={condition.capability}
                options={getFilteredCapabilities(index)}
                multiple={false}
                searchable={true}
                clearable={false}
                onchange={(value) => handleCapabilityChange(index, value)}
              />
            </div>

            <div class="condition-remove">
              <Button
                variant="danger"
                size="s"
                onclick={() => removeCondition(index)}
              >
                Remove
              </Button>
            </div>
          </div>

          {#if index < conditions.length - 1}
            <div class="condition-relation">
              <Toggle3State
                value={relation}
                onChange={handleRelationChange}
                options={[
                  { value: 'AND', label: 'AND' },
                  { value: 'OR', label: 'OR' }
                ]}
                ariaLabel="Condition relation"
              />
            </div>
          {/if}
        </div>
      {/each}
    {/if}

    <div style="margin-top: var(--wpea-space--md);">
      <Button variant="secondary" onclick={addCondition}>
        Add Condition
      </Button>
    </div>
  </div>
</Card>

<style>
  .conditions-repeater {
    display: flex;
    flex-direction: column;
    gap: var(--wpea-space--md);
  }

  .condition-row {
    display: flex;
    flex-direction: column;
    gap: var(--wpea-space--sm);
  }

  .condition-fields {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--wpea-space--md);
    align-items: start;
  }

  .condition-operator {
    min-width: 140px;
  }

  .condition-capability {
    display: flex;
    flex-direction: column;
    gap: var(--wpea-space--xs);
    width: 100%;
  }

  .condition-relation {
    display: flex;
    justify-content: center;
    padding: var(--wpea-space--xs) 0;
  }

  @container (max-width: 600px) {
    .condition-fields {
      grid-template-columns: 1fr;
    }

    .condition-operator,
    .condition-capability,
    .condition-remove {
      width: 100%;
    }
  }
</style>
