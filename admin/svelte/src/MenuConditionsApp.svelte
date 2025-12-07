<script lang="ts">
  import type { ConditionsConfig, Capability } from './menu-conditions-types';
  import ConditionsModal from './ConditionsModal.svelte';
  import type { ToastItem } from './lib/Toast.svelte';
  import Toast from './lib/Toast.svelte';

  const { apiUrl, nonce } = window.abMenuConditionsData;

  // State
  let modalOpen = $state(false);
  let currentMenuItemId = $state(0);
  let currentConditions = $state<ConditionsConfig | null>(null);
  let capabilities = $state<Capability[]>([]);
  let toasts = $state<ToastItem[]>([]);

  // Fetch capabilities on mount
  $effect(() => {
    fetchCapabilities();
    attachButtonListeners();
  });

  async function fetchCapabilities() {
    try {
      const response = await fetch(`${apiUrl}/menu-conditions/capabilities`, {
        headers: { 'X-WP-Nonce': nonce }
      });
      const data = await response.json();
      if (data.success) {
        capabilities = data.capabilities;
      }
    } catch (error) {
      console.error('Failed to fetch capabilities:', error);
      addToast('Failed to load capabilities', 'danger');
    }
  }

  function attachButtonListeners() {
    // Find all condition buttons
    const buttons = document.querySelectorAll('.ab-menu-conditions-button');

    buttons.forEach(button => {
      button.addEventListener('click', handleButtonClick);
    });
  }

  async function handleButtonClick(event: Event) {
    const button = event.currentTarget as HTMLButtonElement;
    const menuItemId = parseInt(button.dataset.menuItemId || '0', 10);

    // Fetch fresh conditions from server instead of using cached button data
    try {
      const response = await fetch(`${apiUrl}/menu-conditions/item/${menuItemId}`, {
        headers: { 'X-WP-Nonce': nonce }
      });
      const data = await response.json();

      if (data.success) {
        openModal(menuItemId, data.conditions);
      } else {
        addToast('Failed to load conditions', 'danger');
      }
    } catch (error) {
      console.error('Failed to fetch conditions:', error);
      addToast('Failed to load conditions', 'danger');
    }
  }

  function openModal(menuItemId: number, conditions: any) {
    currentMenuItemId = menuItemId;

    // Parse conditions
    if (conditions && conditions.conditions && Array.isArray(conditions.conditions)) {
      currentConditions = {
        relation: conditions.relation || 'AND',
        conditions: conditions.conditions
      };
    } else {
      currentConditions = {
        relation: 'AND',
        conditions: []
      };
    }

    modalOpen = true;
  }

  function closeModal() {
    modalOpen = false;
    currentMenuItemId = 0;
    currentConditions = null;
  }

  async function saveConditions(conditions: ConditionsConfig) {
    try {
      const response = await fetch(`${apiUrl}/menu-conditions/item/${currentMenuItemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        body: JSON.stringify(conditions)
      });

      const data = await response.json();

      if (data.success) {
        addToast('Conditions saved successfully', 'success');

        // Update button data attribute
        updateButtonData(currentMenuItemId, data.conditions);
      } else {
        addToast('Failed to save conditions', 'danger');
      }
    } catch (error) {
      console.error('Failed to save conditions:', error);
      addToast('Error saving conditions', 'danger');
    }
  }

  function updateButtonData(menuItemId: number, conditions: ConditionsConfig) {
    const button = document.querySelector(`.ab-menu-conditions-button[data-menu-item-id="${menuItemId}"]`) as HTMLButtonElement;
    if (!button) {
      return;
    }

    button.setAttribute('data-conditions', JSON.stringify(conditions));

    const hasConditions = conditions.conditions && conditions.conditions.length > 0;

    // Update button class
    if (hasConditions) {
      button.classList.add('has-conditions');
    } else {
      button.classList.remove('has-conditions');
    }

    // Update indicator
    let indicator = button.querySelector('.ab-conditions-indicator');
    if (hasConditions) {
      if (!indicator) {
        // Create new indicator
        const span = document.createElement('span');
        span.className = 'ab-conditions-indicator';
        span.textContent = ' ●';
        span.style.color = '#2271b1';
        span.style.marginLeft = '4px';

        // Find the text span (the one with "Conditions" text)
        const textSpan = button.querySelector('span');
        if (textSpan) {
          textSpan.appendChild(span);
        }
      }
    } else {
      // Remove indicator if it exists
      if (indicator) {
        indicator.remove();
      }
    }
  }

  function addToast(message: string, variant: 'success' | 'danger' | 'warning' = 'success') {
    const id = `toast-${Date.now()}`;
    toasts = [...toasts, {
      id,
      message,
      variant,
      duration: 3000
    }];
  }
</script>

{#if modalOpen}
  <ConditionsModal
    bind:open={modalOpen}
    menuItemId={currentMenuItemId}
    initialConditions={currentConditions}
    {capabilities}
    onClose={closeModal}
    onSave={saveConditions}
  />
{/if}

<Toast bind:toasts position="top-right" />
