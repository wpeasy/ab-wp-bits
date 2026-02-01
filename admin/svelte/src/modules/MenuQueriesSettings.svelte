<script lang="ts">
  import Card from '../lib/Card.svelte';
  import Input from '../lib/Input.svelte';
  import Button from '../lib/Button.svelte';
  import Stack from '../lib/Stack.svelte';
  import type { ToastItem } from '../lib/Toast.svelte';
  import Toast from '../lib/Toast.svelte';

  const { apiUrl, nonce } = window.abWpBitsData;

  // State
  let cacheTTL = $state('3600'); // Default 1 hour (string for Input component)
  let isLoading = $state(false);
  let isClearingCache = $state(false);
  let toasts = $state<ToastItem[]>([]);

  // Load settings on mount
  $effect(() => {
    loadSettings();
  });

  async function loadSettings() {
    try {
      const response = await fetch(`${apiUrl}/module-settings/menu-queries`, {
        headers: { 'X-WP-Nonce': nonce }
      });
      const data = await response.json();
      if (data.success && data.settings) {
        cacheTTL = String(data.settings.cache_ttl || 3600);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function saveSettings() {
    isLoading = true;
    try {
      const response = await fetch(`${apiUrl}/module-settings/menu-queries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        body: JSON.stringify({
          cache_ttl: Number(cacheTTL)
        })
      });

      const data = await response.json();
      if (data.success) {
        addToast('Settings saved successfully', 'success');
      } else {
        addToast('Failed to save settings', 'danger');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      addToast('Error saving settings', 'danger');
    } finally {
      isLoading = false;
    }
  }

  async function clearCache() {
    isClearingCache = true;
    try {
      const response = await fetch(`${apiUrl}/module-settings/menu-queries/clear-cache`, {
        method: 'POST',
        headers: {
          'X-WP-Nonce': nonce
        }
      });

      const data = await response.json();
      if (data.success) {
        addToast('Cache cleared successfully', 'success');
      } else {
        addToast('Failed to clear cache', 'danger');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      addToast('Error clearing cache', 'danger');
    } finally {
      isClearingCache = false;
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

  // Auto-save when cache TTL changes
  let debounceTimer: number | null = null;
  $effect(() => {
    // Track cacheTTL changes
    const ttl = cacheTTL;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = window.setTimeout(() => {
      saveSettings();
    }, 1000);
  });
</script>

<Stack>
  <Card title="Cache Settings">
    <Stack>
      <div class="cache-ttl-input">
        <Input
          id="cache-ttl"
          label="Cache TTL (seconds)"
          type="number"
          bind:value={cacheTTL}
          help="How long to cache query results. Default is 3600 seconds (1 hour)."
        />
      </div>

      <div>
        <Button
          variant="secondary"
          onclick={clearCache}
          disabled={isClearingCache}
        >
          {isClearingCache ? 'Clearing...' : 'Clear Cache'}
        </Button>
      </div>

      <p class="wpea-text-muted wpea-text-sm">
        Settings are saved automatically.
      </p>
    </Stack>
  </Card>
</Stack>

<Toast bind:toasts position="top-right" />

<style>
  .cache-ttl-input {
    max-width: 150px;
  }
</style>
