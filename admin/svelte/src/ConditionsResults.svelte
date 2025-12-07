<script lang="ts">
  import type { ConditionsConfig, RoleEvaluationResult, Capability, UserData } from './menu-conditions-types';
  import Card from './lib/Card.svelte';
  import Toggle3State from './lib/Toggle3State.svelte';
  import Select from './lib/Select.svelte';
  import Stack from './lib/Stack.svelte';
  import Badge from './lib/Badge.svelte';

  interface Props {
    conditions: ConditionsConfig;
    capabilities: Capability[];
    onEvaluate: (conditions: ConditionsConfig) => Promise<RoleEvaluationResult[]>;
  }

  let { conditions, capabilities, onEvaluate }: Props = $props();

  const { apiUrl, nonce } = window.abMenuConditionsData;

  // State
  let viewMode = $state<'role' | 'capability'>('role');
  let selectedRole = $state('all');
  let selectedCapability = $state('all');
  let selectedUser = $state<number>(0);
  let results = $state<RoleEvaluationResult[]>([]);
  let users = $state<UserData[]>([]);
  let isLoading = $state(false);
  let userResult = $state<{ visible: boolean; message: string } | null>(null);

  // Fetch users on mount
  $effect(() => {
    fetchUsers();
  });

  // Evaluate when conditions change
  $effect(() => {
    if (conditions) {
      evaluateConditions();
    }
  });

  async function fetchUsers() {
    try {
      const response = await fetch(`${apiUrl}/menu-conditions/users`, {
        headers: { 'X-WP-Nonce': nonce }
      });
      const data = await response.json();
      if (data.success) {
        users = data.users;
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }

  async function evaluateConditions() {
    isLoading = true;
    try {
      results = await onEvaluate(conditions);
    } catch (error) {
      console.error('Failed to evaluate conditions:', error);
    } finally {
      isLoading = false;
    }
  }

  async function evaluateForUser(userId: number) {
    try {
      const response = await fetch(`${apiUrl}/menu-conditions/evaluate-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        body: JSON.stringify({
          user_id: userId,
          conditions: conditions
        })
      });

      const data = await response.json();
      if (data.success) {
        userResult = {
          visible: data.visible,
          message: data.visible
            ? 'This menu item WILL be visible to this user'
            : 'This menu item will NOT be visible to this user'
        };
      }
    } catch (error) {
      console.error('Failed to evaluate for user:', error);
    }
  }

  // Watch selected user
  $effect(() => {
    if (selectedUser > 0) {
      evaluateForUser(selectedUser);
    } else {
      userResult = null;
    }
  });

  // Get filtered results based on view mode and selection
  let filteredResults = $derived(() => {
    if (viewMode === 'role') {
      if (selectedRole === 'all') {
        return results;
      }
      return results.filter(r => r.role === selectedRole);
    } else {
      // Capability mode - filter by which roles have this capability
      if (selectedCapability === 'all') {
        return results;
      }
      // This would need backend support to know which roles have which caps
      // For now, just show all
      return results;
    }
  });

  // Role options
  let roleOptions = $derived([
    { value: 'all', label: 'All Roles' },
    ...results.map(r => ({
      value: r.role,
      label: r.role_name
    }))
  ]);

  // Capability options
  let capabilityOptions = $derived([
    { value: 'all', label: 'All Capabilities' },
    ...capabilities
  ]);

  // User options
  let userOptions = $derived([
    { value: '0', label: 'Select a user...' },
    ...users.map(u => ({
      value: u.id.toString(),
      label: `${u.name} (${u.roles.join(', ')})`
    }))
  ]);
</script>

<Stack>
  <Card title="Results Preview">
    <Stack>
      <div class="results-controls">
        <div class="view-toggle">
          <label for="view-mode">View By:</label>
          <Toggle3State
            value={viewMode}
            onChange={(value) => viewMode = value as 'role' | 'capability'}
            options={[
              { value: 'role', label: 'Role' },
              { value: 'capability', label: 'Capability' }
            ]}
            ariaLabel="View mode"
          />
        </div>

        {#if viewMode === 'role'}
          <Select
            id="filter-role"
            label="Filter by Role"
            bind:value={selectedRole}
            options={roleOptions}
          />
        {:else}
          <Select
            id="filter-capability"
            label="Filter by Capability"
            bind:value={selectedCapability}
            options={capabilityOptions}
          />
        {/if}
      </div>

      {#if isLoading}
        <p class="wpea-text-muted">Evaluating conditions...</p>
      {:else if filteredResults().length === 0}
        <p class="wpea-text-muted">No results to display.</p>
      {:else}
        <div class="results-grid">
          {#each filteredResults() as result (result.role)}
            <div class="result-row">
              <span class="result-role">{result.role_name}</span>
              <Badge variant={result.visible ? 'success' : 'danger'}>
                {result.visible ? 'Visible' : 'Hidden'}
              </Badge>
            </div>
          {/each}
        </div>
      {/if}
    </Stack>
  </Card>

  <Card title="Test with Specific User">
    <Stack>
      <Select
        id="test-user"
        label="Select User"
        value={selectedUser.toString()}
        options={userOptions}
        onchange={(value) => selectedUser = parseInt(value, 10)}
      />

      {#if userResult}
        <div class="user-result {userResult.visible ? 'user-result--visible' : 'user-result--hidden'}">
          <strong>{userResult.message}</strong>
        </div>
      {/if}
    </Stack>
  </Card>
</Stack>

<style>
  .results-controls {
    display: flex;
    flex-direction: column;
    gap: var(--wpea-space--md);
  }

  .view-toggle {
    display: flex;
    align-items: center;
    gap: var(--wpea-space--sm);
  }

  .view-toggle label {
    font-weight: 500;
  }

  .results-grid {
    display: flex;
    flex-direction: column;
    gap: var(--wpea-space--xs);
  }

  .result-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--wpea-space--sm);
    background: var(--wpea-color--surface-raised);
    border-radius: var(--wpea-radius--md);
  }

  .result-role {
    font-weight: 500;
  }

  .user-result {
    padding: var(--wpea-space--md);
    border-radius: var(--wpea-radius--md);
    border: 2px solid;
  }

  .user-result--visible {
    background: var(--wpea-color--success-bg);
    border-color: var(--wpea-color--success);
    color: var(--wpea-color--success-text);
  }

  .user-result--hidden {
    background: var(--wpea-color--danger-bg);
    border-color: var(--wpea-color--danger);
    color: var(--wpea-color--danger-text);
  }
</style>
