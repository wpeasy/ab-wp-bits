<script lang="ts">
  import { onMount } from 'svelte';
  import type { ConditionsConfig, RoleEvaluationResult, UserData } from './menu-conditions-types';
  import Card from './lib/Card.svelte';
  import AdvancedSelect from './lib/AdvancedSelect.svelte';
  import FilterableList from './lib/FilterableList.svelte';
  import Stack from './lib/Stack.svelte';
  import Badge from './lib/Badge.svelte';

  interface Props {
    conditions: ConditionsConfig;
    onEvaluate: (conditions: ConditionsConfig) => Promise<RoleEvaluationResult[]>;
  }

  let { conditions, onEvaluate }: Props = $props();

  const { apiUrl, nonce } = window.abMenuConditionsData;

  // State
  let selectedUser = $state<number>(0);
  let results = $state<RoleEvaluationResult[]>([]);
  let users = $state<UserData[]>([]);
  let isLoading = $state(false);
  let userResult = $state<{ visible: boolean; message: string } | null>(null);

  // Fetch users on mount
  onMount(() => {
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

  // Convert results to SelectOption format for FilterableList
  let roleItems = $derived(
    results.map(r => ({
      value: r.role,
      label: r.role_name,
      visible: r.visible
    }))
  );

  // User options (without placeholder since AdvancedSelect handles that)
  let userOptions = $derived(
    users.map(u => ({
      value: u.id.toString(),
      label: `${u.name} (${u.roles.join(', ')})`
    }))
  );
</script>

<Stack>
  <Card title="Test with Specific User">
    <Stack>
      <AdvancedSelect
        id="test-user"
        label="Select User"
        value={selectedUser.toString()}
        options={userOptions}
        onchange={(value) => selectedUser = parseInt(value as string, 10)}
        multiple={false}
        searchable={true}
        clearable={true}
        placeholder="Select a user..."
      />

      {#if userResult}
        <div class="user-result {userResult.visible ? 'user-result--visible' : 'user-result--hidden'}">
          <strong>{userResult.message}</strong>
        </div>
      {/if}
    </Stack>
  </Card>

  <Card title="Results Preview">
    <Stack>
      {#if isLoading}
        <p class="wpea-text-muted">Evaluating conditions...</p>
      {:else if roleItems.length === 0}
        <p class="wpea-text-muted">No results to display.</p>
      {:else}
        <FilterableList
          items={roleItems}
          placeholder="Search roles..."
          emptyMessage="No roles found"
        >
          {#snippet children(role)}
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div>
                <span style="font-weight: 500;">{role.label}</span>
                <span style="color: var(--wpea-color--text-muted); font-size: 0.875rem; margin-left: var(--wpea-space--xs);">
                  ({role.value})
                </span>
              </div>
              <Badge variant={role.visible ? 'success' : 'danger'}>
                {role.visible ? 'Visible' : 'Hidden'}
              </Badge>
            </div>
          {/snippet}
        </FilterableList>
      {/if}
    </Stack>
  </Card>
</Stack>

<style>
  .user-result {
    padding: var(--wpea-space--md);
    border-radius: var(--wpea-radius--md);
    border: 2px solid;
  }

  .user-result--visible {
    background: color-mix(in oklab, var(--wpea-color--success), transparent 85%);
    border-color: var(--wpea-color--success);
    color: var(--wpea-surface--text);
  }

  .user-result--hidden {
    background: color-mix(in oklab, var(--wpea-color--danger), transparent 85%);
    border-color: var(--wpea-color--danger);
    color: var(--wpea-surface--text);
  }
</style>
