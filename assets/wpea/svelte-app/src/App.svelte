<script lang="ts">
  import { createRawSnippet } from 'svelte';
  import Alert from './lib/Alert.svelte';
  import Badge from './lib/Badge.svelte';
  import Button from './lib/Button.svelte';
  import Card from './lib/Card.svelte';
  import Switch from './lib/Switch.svelte';
  import Input from './lib/Input.svelte';
  import Select from './lib/Select.svelte';
  import Textarea from './lib/Textarea.svelte';
  import Panel from './lib/Panel.svelte';
  import Tabs from './lib/Tabs.svelte';
  import Accordion from './lib/Accordion.svelte';
  import Table from './lib/Table.svelte';
  import Stack from './lib/Stack.svelte';
  import Cluster from './lib/Cluster.svelte';
  import Modal from './lib/Modal.svelte';
  import Toggle3State from './lib/Toggle3State.svelte';
  import DoubleOptInButton from './lib/DoubleOptInButton.svelte';
  import Popover from './lib/Popover.svelte';

  let theme = $state<'auto' | 'light' | 'dark'>('auto');
  let density = $state<'comfy' | 'compact'>('comfy');
  let sidebarOpen = $state(false);
  let activeSection = $state('alerts-badges');

  // Form state
  let searchQuery = $state('');
  let segment = $state('All');
  let onlyIssues = $state(false);
  let productName = $state('');
  let productSku = $state('');
  let productDesc = $state('');
  let productPrice = $state('59.00');
  let salePrice = $state('');
  let taxClass = $state('Standard');
  let requiresShipping = $state(true);
  let stock = $state('120');
  let warehouse = $state('Main');
  let reorderLevel = $state('20');

  // Switch states
  let switchXs = $state(true);
  let switchS = $state(true);
  let switchDefault = $state(true);
  let switchM = $state(true);
  let switchL = $state(true);
  let switchNeutral = $state(true);
  let switchPrimary = $state(true);
  let switchSecondary = $state(true);

  // Modal states
  let modalStandard = $state(false);
  let modalLarge = $state(false);
  let modalFullscreen = $state(false);
  let modalScrollable = $state(false);

  // 3-state toggle and double opt-in button states
  let viewMode = $state('grid');

  const themeLabel = $derived(
    theme === 'auto' ? 'Respect OS' : theme.charAt(0).toUpperCase() + theme.slice(1)
  );

  function setTheme(value: 'auto' | 'light' | 'dark') {
    theme = value;
    const body = document.body;
    switch(value) {
      case 'light':
        body.style.setProperty('color-scheme', 'light only');
        break;
      case 'dark':
        body.style.setProperty('color-scheme', 'dark only');
        break;
      case 'auto':
      default:
        body.style.setProperty('color-scheme', 'light dark');
        break;
    }
  }

  function toggleDensity() {
    density = density === 'compact' ? 'comfy' : 'compact';
  }

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function handleOverlayKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSidebar();
    }
  }

  function showToast(position: string, type: string = 'default') {
    const container = getToastContainer(position);
    const toast = document.createElement('div');
    toast.className = `wpea-toast${type !== 'default' ? ' wpea-toast--' + type : ''}`;

    const messages: Record<string, string> = {
      default: 'This is a default notification',
      success: 'Operation completed successfully!',
      warning: 'Please review this action',
      danger: 'An error has occurred',
      info: 'Here is some useful information'
    };

    toast.innerHTML = `
      <div class="wpea-toast__content">
        <div class="wpea-toast__title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div class="wpea-toast__message">${messages[type] || messages.default}</div>
      </div>
      <button class="wpea-toast__close" aria-label="Close">&times;</button>
    `;

    const closeBtn = toast.querySelector('.wpea-toast__close');
    closeBtn?.addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);

    setTimeout(() => {
      removeToast(toast);
    }, 3000);
  }

  const toastContainers: Record<string, HTMLElement> = {};
  function getToastContainer(position: string) {
    if (!toastContainers[position]) {
      const container = document.createElement('div');
      container.className = `wpea-toast-container wpea-toast-container--${position}`;
      document.body.appendChild(container);
      toastContainers[position] = container;
    }
    return toastContainers[position];
  }

  function removeToast(toast: HTMLElement) {
    toast.classList.add('wpea-toast--closing');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  // Table data
  const tableColumns = [
    { key: 'order', label: 'Order' },
    { key: 'customer', label: 'Customer' },
    { key: 'status', label: 'Status' },
    { key: 'total', label: 'Total' },
    { key: 'date', label: 'Date' },
    { key: 'actions', label: '' }
  ];

  const tableData = [
    { order: '#10234', customer: 'Jane Cooper', status: 'Paid', statusVariant: 'success', total: '$129.00', date: '2025-10-01' },
    { order: '#10233', customer: 'Wade Warren', status: 'Pending', statusVariant: 'warning', total: '$89.00', date: '2025-09-30' },
    { order: '#10232', customer: 'Esther Howard', status: 'Failed', statusVariant: 'danger', total: '$59.00', date: '2025-09-30' }
  ];

  // Tabs data
  const defaultTabs = [
    {
      id: 'tab1',
      label: 'Overview',
      content: createRawSnippet(() => ({
        render: () => `<div class="wpea-stack"><p>This is the overview tab content. Tabs provide a clean way to organize related content into separate views.</p><p>Click on the other tabs to see the content change.</p></div>`
      }))
    },
    {
      id: 'tab2',
      label: 'Features',
      content: createRawSnippet(() => ({
        render: () => `<div class="wpea-stack"><p>This tab shows the features. Tabs are fully accessible with ARIA attributes.</p><ul><li>Smooth transitions</li><li>Keyboard navigation</li><li>Multiple color variants</li></ul></div>`
      }))
    },
    {
      id: 'tab3',
      label: 'Settings',
      content: createRawSnippet(() => ({
        render: () => `<div class="wpea-stack"><p>Settings tab content goes here. You can put any content inside tab panels.</p></div>`
      }))
    }
  ];

  const primaryTabs = [
    {
      id: 'tab4',
      label: 'Dashboard',
      content: createRawSnippet(() => ({
        render: () => `<p>Dashboard content with primary color accent.</p>`
      }))
    },
    {
      id: 'tab5',
      label: 'Analytics',
      content: createRawSnippet(() => ({
        render: () => `<p>Analytics data and charts would go here.</p>`
      }))
    },
    {
      id: 'tab6',
      label: 'Reports',
      content: createRawSnippet(() => ({
        render: () => `<p>Reports and export options.</p>`
      }))
    }
  ];

  const secondaryTabs = [
    {
      id: 'tab7',
      label: 'Account',
      content: createRawSnippet(() => ({
        render: () => `<p>Account settings with secondary color accent.</p>`
      }))
    },
    {
      id: 'tab8',
      label: 'Security',
      content: createRawSnippet(() => ({
        render: () => `<p>Security and privacy settings.</p>`
      }))
    },
    {
      id: 'tab9',
      label: 'Billing',
      content: createRawSnippet(() => ({
        render: () => `<p>Billing information and payment methods.</p>`
      }))
    }
  ];

  // Accordion data
  const defaultAccordion = [
    {
      id: 'acc1',
      title: 'What is the WPE Admin Framework?',
      content: createRawSnippet(() => ({
        render: () => `<p>WPE Admin Framework is a modern, lightweight CSS framework designed specifically for WordPress admin interfaces. It provides a comprehensive set of components and utilities.</p>`
      }))
    },
    {
      id: 'acc2',
      title: 'How do I customize the theme?',
      content: createRawSnippet(() => ({
        render: () => `<p>The framework uses CSS custom properties (variables) for easy theming. You can override the color tokens to match your brand.</p>`
      }))
    },
    {
      id: 'acc3',
      title: 'Is it responsive?',
      content: createRawSnippet(() => ({
        render: () => `<p>Yes! The framework uses container queries for responsive layouts, making it perfect for modern WordPress admin interfaces.</p>`
      }))
    }
  ];

  const primaryAccordion = [
    {
      id: 'acc4',
      title: 'Features Overview',
      content: createRawSnippet(() => ({
        render: () => `<ul><li>Modern component library</li><li>Dark mode support with light-dark()</li><li>Container-based responsive design</li><li>Accessible components</li></ul>`
      }))
    },
    {
      id: 'acc5',
      title: 'Browser Support',
      content: createRawSnippet(() => ({
        render: () => `<p>Works in all modern browsers including Chrome, Firefox, Safari, and Edge.</p>`
      }))
    }
  ];

  const secondaryAccordion = [
    {
      id: 'acc6',
      title: 'Getting Started',
      content: createRawSnippet(() => ({
        render: () => `<p>Include the framework CSS file in your WordPress plugin or theme, then start using the components!</p>`
      }))
    },
    {
      id: 'acc7',
      title: 'Documentation',
      content: createRawSnippet(() => ({
        render: () => `<p>Full documentation is available in the claude.md file included with the framework.</p>`
      }))
    }
  ];

  $effect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (id) activeSection = id;
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = document.querySelectorAll('.demo-section');
    sections.forEach(section => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  });
</script>

<div class="wpea wpea-cq demo-shell" style="--wpea-density: {density}; font-size: {density === 'compact' ? 'calc(var(--wpea-fs-base) * 0.875)' : 'var(--wpea-fs-base)'}; font-family: var(--wpea-font-sans);">
  <!-- HEADER -->
  <header class="demo-header">
    <Cluster>
      <button
        class="hamburger {sidebarOpen ? 'active' : ''}"
        onclick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <strong class="wpea-text-lg">WPE_Admin</strong>
      <Badge variant="primary">Svelte 5</Badge>
    </Cluster>
    <Cluster>
      <Button variant="ghost" onclick={toggleDensity} class="wpea-hide-md-down">
        Compact
      </Button>
      <Button variant="secondary">New Item</Button>
      <select
        class="wpea-select"
        style="width: auto;"
        bind:value={theme}
        onchange={(e) => setTheme(e.currentTarget.value as 'auto' | 'light' | 'dark')}
      >
        <option value="auto">Respect OS</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </Cluster>
  </header>

  <!-- Sidebar overlay -->
  <div
    class="sidebar-overlay {sidebarOpen ? 'open' : ''}"
    role="button"
    tabindex={sidebarOpen ? 0 : -1}
    onclick={toggleSidebar}
    onkeydown={handleOverlayKeydown}
    aria-label="Close sidebar"
  ></div>

  <!-- SIDEBAR -->
  <aside class="demo-sidebar {sidebarOpen ? 'open' : ''}">
    <nav class="demo-nav">
      <div class="demo-nav__section">Components</div>
      <a href="#alerts-badges" class={activeSection === 'alerts-badges' ? 'active' : ''}>Alerts & Badges</a>
      <a href="#toasts" class={activeSection === 'toasts' ? 'active' : ''}>Toasts</a>
      <a href="#typography" class={activeSection === 'typography' ? 'active' : ''}>Typography</a>
      <a href="#buttons" class={activeSection === 'buttons' ? 'active' : ''}>Buttons</a>
      <a href="#forms-inputs" class={activeSection === 'forms-inputs' ? 'active' : ''}>Forms & Inputs</a>
      <a href="#tables" class={activeSection === 'tables' ? 'active' : ''}>Tables</a>
      <a href="#tabs" class={activeSection === 'tabs' ? 'active' : ''}>Tabs</a>
      <a href="#accordions" class={activeSection === 'accordions' ? 'active' : ''}>Accordions</a>
      <a href="#cards-panels" class={activeSection === 'cards-panels' ? 'active' : ''}>Cards & Panels</a>
      <a href="#modals" class={activeSection === 'modals' ? 'active' : ''}>Modals</a>
    </nav>
  </aside>

  <!-- MAIN -->
  <main class="demo-main">
    <!-- ALERTS & BADGES -->
    <section id="alerts-badges" class="demo-section">
      <h2 class="demo-section__title">Alerts & Badges</h2>

      <Stack>
        <Card title="Alerts">
          <Stack>
            <Alert variant="success">All systems nominal.</Alert>
            <Alert variant="warning">2 integrations need attention.</Alert>
            <Alert variant="danger">API rate limit nearing quota.</Alert>
          </Stack>
        </Card>

        <Card title="Badges">
          <Cluster>
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </Cluster>
        </Card>

        <Card title="Framework Info">
          <div class="wpea-text-muted">Svelte 5 SPA with runes — resize to see container queries.</div>
          <hr class="wpea-divider" />
          <Cluster>
            <Badge variant="primary">Svelte 5</Badge>
            <Badge>Density: {density}</Badge>
            <Badge>Theme: {themeLabel}</Badge>
          </Cluster>
        </Card>
      </Stack>
    </section>

    <!-- TOASTS -->
    <section id="toasts" class="demo-section">
      <h2 class="demo-section__title">Toasts</h2>

      <Stack>
        <Card title="Toast Positions">
          <Cluster>
            <Button variant="primary" onclick={() => showToast('top-left')}>Top Left</Button>
            <Button variant="primary" onclick={() => showToast('top-center')}>Top Center</Button>
            <Button variant="primary" onclick={() => showToast('top-right')}>Top Right</Button>
            <Button variant="primary" onclick={() => showToast('bottom-left')}>Bottom Left</Button>
            <Button variant="primary" onclick={() => showToast('bottom-center')}>Bottom Center</Button>
            <Button variant="primary" onclick={() => showToast('bottom-right')}>Bottom Right</Button>
            <Button variant="primary" onclick={() => showToast('center')}>Center</Button>
          </Cluster>
        </Card>

        <Card title="Toast Types">
          <Cluster>
            <Button variant="secondary" onclick={() => showToast('top-right', 'default')}>Default</Button>
            <Button variant="secondary" onclick={() => showToast('top-right', 'success')}>Success</Button>
            <Button variant="secondary" onclick={() => showToast('top-right', 'warning')}>Warning</Button>
            <Button variant="secondary" onclick={() => showToast('top-right', 'danger')}>Danger</Button>
            <Button variant="secondary" onclick={() => showToast('top-right', 'info')}>Info</Button>
          </Cluster>
        </Card>
      </Stack>
    </section>

    <!-- TYPOGRAPHY -->
    <section id="typography" class="demo-section">
      <h2 class="demo-section__title">Typography</h2>

      <Stack>
        <Card title="Text Sizes">
          <Stack>
            <div class="wpea-text-4xl">Text 4XL</div>
            <div class="wpea-text-3xl">Text 3XL</div>
            <div class="wpea-text-2xl">Text 2XL</div>
            <div class="wpea-text-xl">Text XL</div>
            <div class="wpea-text-lg">Text LG</div>
            <div class="wpea-text-md">Text MD (base)</div>
            <div class="wpea-text-sm">Text SM</div>
            <div class="wpea-text-xs">Text XS</div>
          </Stack>
        </Card>

        <Card title="Headings">
          <Stack>
            <div class="wpea-heading wpea-heading--lg">Large Heading</div>
            <div class="wpea-heading wpea-heading--md">Medium Heading</div>
            <div class="wpea-heading wpea-heading--sm">Small Heading</div>
            <div class="wpea-heading">Default Heading</div>
            <div class="wpea-heading wpea-heading--muted">Muted Heading</div>
          </Stack>
        </Card>

        <Card title="Color Variables">
          <Stack>
            <div style="color: var(--wpea-color--heading);">Heading Color (--wpea-color--heading)</div>
            <div style="color: var(--wpea-color--text);">Text Color (--wpea-color--text)</div>
            <div style="color: var(--wpea-color--text-muted);">Muted Text (--wpea-color--text-muted)</div>
          </Stack>
        </Card>
      </Stack>
    </section>

    <!-- BUTTONS -->
    <section id="buttons" class="demo-section">
      <h2 class="demo-section__title">Buttons</h2>

      <Stack>
        <Card title="Button Variants">
          <Cluster>
            <button class="wpea-btn">Default</button>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </Cluster>
        </Card>

        <Card title="Button Sizes">
          <Cluster>
            <Button variant="primary" size="s">Small</Button>
            <Button variant="primary">Default</Button>
            <Button variant="primary" size="l">Large</Button>
          </Cluster>
        </Card>
      </Stack>
    </section>

    <!-- FORMS & INPUTS -->
    <section id="forms-inputs" class="demo-section">
      <h2 class="demo-section__title">Forms & Inputs</h2>

      <Stack>
        <Card title="Switches">
        <Stack>
          <div>
            <strong>Size Variants</strong>
            <Cluster style="margin-top: 12px;">
              <Switch id="sw-xs" size="xs" bind:checked={switchXs} label="Extra Small" />
              <Switch id="sw-s" size="s" bind:checked={switchS} label="Small" />
              <Switch id="sw-default" bind:checked={switchDefault} label="Default" />
              <Switch id="sw-m" size="m" bind:checked={switchM} label="Medium" />
              <Switch id="sw-l" size="l" bind:checked={switchL} label="Large" />
            </Cluster>
          </div>
          <hr class="wpea-divider">
          <div>
            <strong>Color Variants</strong>
            <Cluster style="margin-top: 12px;">
              <Switch id="sw-neutral" color="neutral" bind:checked={switchNeutral} label="Neutral" />
              <Switch id="sw-primary" color="primary" bind:checked={switchPrimary} label="Primary" />
              <Switch id="sw-secondary" color="secondary" bind:checked={switchSecondary} label="Secondary" />
            </Cluster>
          </div>
        </Stack>
      </Card>

      <Card title="3-State Toggle Button">
        <Stack>
          <div>
            <strong>Theme Selector</strong>
            <div style="margin-top: 12px;">
              <Toggle3State
                bind:value={theme}
                ariaLabel="Theme selection"
                onChange={(value) => setTheme(value as 'auto' | 'light' | 'dark')}
                options={[
                  {
                    value: 'light',
                    label: 'Light',
                    icon: createRawSnippet(() => ({
                      render: () => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="4" stroke-width="2"/><path stroke-width="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/></svg>`
                    }))
                  },
                  {
                    value: 'dark',
                    label: 'Dark',
                    icon: createRawSnippet(() => ({
                      render: () => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`
                    }))
                  },
                  {
                    value: 'auto',
                    label: 'Auto',
                    icon: createRawSnippet(() => ({
                      render: () => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`
                    }))
                  }
                ]}
              />
            </div>
          </div>
          <hr class="wpea-divider">
          <div>
            <strong>View Mode Selector</strong>
            <div style="margin-top: 12px;">
              <Toggle3State
                bind:value={viewMode}
                ariaLabel="View mode selection"
                options={[
                  {
                    value: 'grid',
                    label: 'Grid',
                    icon: createRawSnippet(() => ({
                      render: () => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>`
                    }))
                  },
                  {
                    value: 'list',
                    label: 'List',
                    icon: createRawSnippet(() => ({
                      render: () => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>`
                    }))
                  },
                  {
                    value: 'table',
                    label: 'Table',
                    icon: createRawSnippet(() => ({
                      render: () => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`
                    }))
                  }
                ]}
              />
            </div>
          </div>
          <hr class="wpea-divider">
          <div>
            <strong>Icon Only (with popovers)</strong>
            <div style="margin-top: 12px;">
              <Toggle3State
                bind:value={theme}
                ariaLabel="Theme selection"
                iconOnly={true}
                showPopover={true}
                popoverPosition="top"
                popoverSize="xs"
                onChange={(value) => setTheme(value as 'auto' | 'light' | 'dark')}
                options={[
                  {
                    value: 'light',
                    label: 'Light',
                    icon: createRawSnippet(() => ({
                      render: () => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="4" stroke-width="2"/><path stroke-width="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/></svg>`
                    }))
                  },
                  {
                    value: 'dark',
                    label: 'Dark',
                    icon: createRawSnippet(() => ({
                      render: () => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`
                    }))
                  },
                  {
                    value: 'auto',
                    label: 'Auto',
                    icon: createRawSnippet(() => ({
                      render: () => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`
                    }))
                  }
                ]}
              />
            </div>
          </div>
        </Stack>
      </Card>

      <Card title="Double Opt-In Button">
        <Stack>
          <div>
            <strong>Delete Action (Danger)</strong>
            <div style="margin-top: 12px;">
              <DoubleOptInButton
                defaultLabel="Delete"
                confirmLabel="Confirm?"
                timeout={2000}
                onClick={() => showToast('center', 'danger')}
              >
                {#snippet defaultIcon()}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                {/snippet}
                {#snippet confirmIcon()}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                {/snippet}
              </DoubleOptInButton>
            </div>
          </div>
          <hr class="wpea-divider">
          <div>
            <strong>Archive Action (Success variant)</strong>
            <div style="margin-top: 12px;">
              <DoubleOptInButton
                defaultLabel="Archive"
                confirmLabel="Confirm?"
                timeout={3000}
                variant="success"
                onClick={() => showToast('center', 'success')}
              >
                {#snippet defaultIcon()}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                  </svg>
                {/snippet}
                {#snippet confirmIcon()}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                {/snippet}
              </DoubleOptInButton>
            </div>
          </div>
          <hr class="wpea-divider">
          <div>
            <strong>Icon Only (with popovers)</strong>
            <Cluster style="margin-top: 12px;">
              <Popover content="Delete" position="top" size="xs">
                {#snippet children()}
                  <DoubleOptInButton
                    iconOnly={true}
                    ariaLabel="Delete"
                    timeout={2000}
                    onClick={() => showToast('center', 'danger')}
                  >
                    {#snippet defaultIcon()}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    {/snippet}
                    {#snippet confirmIcon()}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    {/snippet}
                  </DoubleOptInButton>
                {/snippet}
              </Popover>
              <Popover content="Archive" position="top" size="xs">
                {#snippet children()}
                  <DoubleOptInButton
                    iconOnly={true}
                    ariaLabel="Archive"
                    timeout={3000}
                    variant="success"
                    onClick={() => showToast('center', 'success')}
                  >
                    {#snippet defaultIcon()}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                      </svg>
                    {/snippet}
                    {#snippet confirmIcon()}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    {/snippet}
                  </DoubleOptInButton>
                {/snippet}
              </Popover>
            </Cluster>
          </div>
        </Stack>
      </Card>

      <Panel>
        <div class="wpea-panel__header">
          <div class="wpea-heading wpea-heading--sm">Quick Filters</div>
        </div>
        <Stack>
          <Input
            id="q"
            label="Search"
            placeholder="Type to filter…"
            bind:value={searchQuery}
          />
          <Select
            id="seg"
            label="Segment"
            bind:value={segment}
            options={[
              { value: 'All', label: 'All' },
              { value: 'Active', label: 'Active' },
              { value: 'Churn risk', label: 'Churn risk' }
            ]}
          />
          <Switch id="sw-issues" bind:checked={onlyIssues} label="Only with issues" />
        </Stack>
      </Panel>

      <Panel>
        <div class="wpea-panel__header">
          <div class="wpea-heading wpea-heading--md">Edit Product</div>
          <Cluster>
            <Button variant="ghost">Discard</Button>
            <Button variant="primary">Save</Button>
          </Cluster>
        </div>

        <div class="wpea-grid-responsive">
          <Card>
            <div class="wpea-heading wpea-heading--sm">Basic Info</div>
            <Stack>
              <Input
                id="name"
                label="Name"
                placeholder="e.g. Cozy Hoodie"
                help="Shown to customers."
                bind:value={productName}
              />
              <Input
                id="sku"
                label="SKU"
                placeholder="SKU-001"
                bind:value={productSku}
              />
              <Textarea
                id="desc"
                label="Description"
                rows={4}
                placeholder="Write a short description…"
                bind:value={productDesc}
              />
            </Stack>
          </Card>

          <Card>
            <div class="wpea-heading wpea-heading--sm">Pricing</div>
            <div class="wpea-grid-2">
              <Input
                id="price"
                label="Price"
                type="number"
                bind:value={productPrice}
              />
              <Input
                id="sale"
                label="Sale Price"
                type="number"
                bind:value={salePrice}
              />
            </div>
            <Select
              id="tax"
              label="Tax Class"
              bind:value={taxClass}
              options={[
                { value: 'Standard', label: 'Standard' },
                { value: 'Reduced', label: 'Reduced' },
                { value: 'Zero', label: 'Zero' }
              ]}
            />
            <Switch id="sw-shipping" bind:checked={requiresShipping} label="Requires shipping" />
          </Card>

          <Card>
            <div class="wpea-heading wpea-heading--sm">Inventory</div>
            <div class="wpea-grid-3">
              <Input
                id="stock"
                label="In Stock"
                type="number"
                bind:value={stock}
              />
              <Select
                id="wh"
                label="Warehouse"
                bind:value={warehouse}
                options={[
                  { value: 'Main', label: 'Main' },
                  { value: 'EU', label: 'EU' }
                ]}
              />
              <Input
                id="reorder"
                label="Reorder Level"
                type="number"
                bind:value={reorderLevel}
              />
            </div>
          </Card>
        </div>
      </Panel>
      </Stack>
    </section>

    <!-- TABLES -->
    <section id="tables" class="demo-section">
      <h2 class="demo-section__title">Tables</h2>

      <Card>
        {#snippet header()}
          <div class="wpea-card__title">Recent Orders</div>
        {/snippet}
        {#snippet actions()}
          <Cluster>
            <Button variant="ghost">Refresh</Button>
            <Button variant="secondary">Export CSV</Button>
          </Cluster>
        {/snippet}

        <Table columns={tableColumns} data={tableData}>
          {#snippet tbody()}
            {#each tableData as row}
              <tr>
                <td>{row.order}</td>
                <td>{row.customer}</td>
                <td><Badge variant={row.statusVariant as any}>{row.status}</Badge></td>
                <td>{row.total}</td>
                <td class="wpea-hide-md-down">{row.date}</td>
                <td style="text-align:end;">
                  <Cluster>
                    <Button variant="ghost">View</Button>
                    {#if row.status === 'Paid'}
                      <Button variant="primary">Refund</Button>
                    {:else if row.status === 'Pending'}
                      <Button variant="secondary">Capture</Button>
                    {:else}
                      <Button variant="ghost">Retry</Button>
                    {/if}
                  </Cluster>
                </td>
              </tr>
            {/each}
          {/snippet}
        </Table>
      </Card>
    </section>

    <!-- TABS -->
    <section id="tabs" class="demo-section">
      <h2 class="demo-section__title">Tabs</h2>

      <Stack>
        <Card title="Default Tabs">
          <Tabs tabs={defaultTabs} />
        </Card>

        <Card title="Primary Tabs">
          <Tabs tabs={primaryTabs} variant="primary" />
        </Card>

        <Card title="Secondary Tabs">
          <Tabs tabs={secondaryTabs} variant="secondary" />
        </Card>
      </Stack>
    </section>

    <!-- ACCORDIONS -->
    <section id="accordions" class="demo-section">
      <h2 class="demo-section__title">Accordions</h2>

      <Stack>
        <Card title="Default Accordion">
          <Accordion items={defaultAccordion} />
        </Card>

        <Card title="Primary Accordion">
          <Accordion items={primaryAccordion} variant="primary" />
        </Card>

        <Card title="Secondary Accordion">
          <Accordion items={secondaryAccordion} variant="secondary" />
        </Card>
      </Stack>
    </section>

    <!-- CARDS & PANELS -->
    <section id="cards-panels" class="demo-section">
      <h2 class="demo-section__title">Cards & Panels</h2>

      <Stack>
        <Card title="Simple Card" subtitle="This is a basic card with title and subtitle.">
          {#snippet actions()}
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary">Confirm</Button>
          {/snippet}
        </Card>

        <div class="wpea-grid-responsive">
          <Card title="Revenue" subtitle="Last 30 days">
            <div class="wpea-heading wpea-heading--lg">$84,120</div>
            {#snippet actions()}
              <Button variant="ghost">Details</Button>
              <Button variant="secondary">Export</Button>
            {/snippet}
          </Card>
          <Card title="Active Users" subtitle="+4.1% WoW">
            <div class="wpea-heading wpea-heading--lg">12,431</div>
            {#snippet actions()}
              <Button variant="ghost">Details</Button>
            {/snippet}
          </Card>
          <Card title="Errors" subtitle="Last 24h" hover={true}>
            <div class="wpea-heading wpea-heading--lg">37</div>
            {#snippet actions()}
              <Button variant="primary">Investigate</Button>
            {/snippet}
          </Card>
          <Card title="NPS" subtitle="Good">
            <div class="wpea-heading wpea-heading--lg">58</div>
            {#snippet actions()}
              <Button variant="ghost">Breakdown</Button>
            {/snippet}
          </Card>
        </div>

        <Panel>
          <div class="wpea-panel__header">
            <div class="wpea-heading wpea-heading--sm">Panel Example</div>
          </div>
          <p>Panels are useful for grouping related content with a subtle background.</p>
          <Cluster>
            <Button variant="ghost">Learn More</Button>
            <Button variant="secondary">Get Started</Button>
          </Cluster>
        </Panel>

        <Card title="Need help?" subtitle="Check the docs or contact support.">
          {#snippet actions()}
            <Button variant="ghost">Documentation</Button>
            <Button variant="secondary">Contact Support</Button>
          {/snippet}
        </Card>
      </Stack>
    </section>

    <!-- MODALS -->
    <section id="modals" class="demo-section">
      <h2 class="demo-section__title">Modals</h2>

      <Stack>
        <Card title="Modal Sizes">
          <Cluster>
            <Button variant="primary" onclick={() => modalStandard = true}>Standard Modal</Button>
            <Button variant="secondary" onclick={() => modalLarge = true}>Large Modal</Button>
            <Button variant="ghost" onclick={() => modalFullscreen = true}>Fullscreen Modal</Button>
          </Cluster>
        </Card>

        <Card title="Scrollable Content">
          <p class="wpea-text-muted">Modals with content that exceeds viewport height will have scrollable bodies with custom styled scrollbars.</p>
          <Button variant="primary" onclick={() => modalScrollable = true}>Scrollable Modal</Button>
        </Card>
      </Stack>
    </section>
  </main>
</div>

<!-- Modal Components -->
<!-- Standard Modal -->
<Modal bind:open={modalStandard} title="Standard Modal" size="standard">
  {#snippet children()}
    <p>This is a standard modal dialog. It's perfect for confirmations, short forms, or displaying concise information.</p>
    <Stack>
      <Input
        id="svelte-modal-input"
        label="Your Name"
        placeholder="Enter your name"
      />
      <Select
        id="svelte-modal-select"
        label="Choose an option"
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
          { value: '3', label: 'Option 3' }
        ]}
      />
    </Stack>
  {/snippet}
  {#snippet footer()}
    <Button variant="ghost" onclick={() => modalStandard = false}>Cancel</Button>
    <Button variant="primary">Save Changes</Button>
  {/snippet}
</Modal>

<!-- Large Modal -->
<Modal bind:open={modalLarge} title="Large Modal" size="large">
  {#snippet children()}
    <p>This is a large modal, perfect for more complex forms or detailed content displays.</p>
    <div class="wpea-grid-2">
      <Card title="Section 1">
        <p>Content for the first section of your large modal.</p>
      </Card>
      <Card title="Section 2">
        <p>Content for the second section of your large modal.</p>
      </Card>
    </div>
    <div style="margin-top: var(--wpea-space--lg);">
      <Textarea
        id="svelte-modal-textarea"
        label="Description"
        rows={4}
        placeholder="Enter a description..."
      />
    </div>
  {/snippet}
  {#snippet footer()}
    <Button variant="ghost" onclick={() => modalLarge = false}>Cancel</Button>
    <Button variant="secondary">Save Draft</Button>
    <Button variant="primary">Publish</Button>
  {/snippet}
</Modal>

<!-- Fullscreen Modal -->
<Modal bind:open={modalFullscreen} title="Fullscreen Modal" size="fullscreen">
  {#snippet children()}
    <p>This is a fullscreen modal, taking up the entire viewport. Great for immersive experiences or complex workflows.</p>
    <div class="wpea-grid-3" style="margin-top: var(--wpea-space--lg);">
      <Card title="Feature 1">
        <p>Description of the first feature.</p>
        {#snippet actions()}
          <Button variant="primary">Learn More</Button>
        {/snippet}
      </Card>
      <Card title="Feature 2">
        <p>Description of the second feature.</p>
        {#snippet actions()}
          <Button variant="primary">Learn More</Button>
        {/snippet}
      </Card>
      <Card title="Feature 3">
        <p>Description of the third feature.</p>
        {#snippet actions()}
          <Button variant="primary">Learn More</Button>
        {/snippet}
      </Card>
    </div>
  {/snippet}
  {#snippet footer()}
    <Button variant="ghost" onclick={() => modalFullscreen = false}>Close</Button>
  {/snippet}
</Modal>

<!-- Scrollable Modal -->
<Modal bind:open={modalScrollable} title="Scrollable Content Modal" size="standard">
  {#snippet children()}
    <div class="wpea-heading wpea-heading--sm">Custom Scrollbars</div>
    <p>This modal demonstrates custom styled scrollbars. The scrollbar has a neutral background and primary color thumb.</p>

    <div class="wpea-heading wpea-heading--sm" style="margin-top: var(--wpea-space--lg);">Lorem Ipsum</div>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>

    <div class="wpea-heading wpea-heading--sm" style="margin-top: var(--wpea-space--lg);">More Content</div>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

    <div class="wpea-heading wpea-heading--sm" style="margin-top: var(--wpea-space--lg);">Additional Section</div>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.</p>

    <div class="wpea-heading wpea-heading--sm" style="margin-top: var(--wpea-space--lg);">Even More Content</div>
    <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>

    <div class="wpea-heading wpea-heading--sm" style="margin-top: var(--wpea-space--lg);">Final Section</div>
    <p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.</p>

    <Alert variant="success" style="margin-top: var(--wpea-space--lg);">
      Scroll down to see the custom scrollbar styling!
    </Alert>

    <p style="margin-top: var(--wpea-space--lg);">More content to make this modal scrollable. The scrollbar should be thin with a neutral background and primary color thumb that becomes more opaque on hover.</p>
  {/snippet}
  {#snippet footer()}
    <Button variant="primary" onclick={() => modalScrollable = false}>Got it!</Button>
  {/snippet}
</Modal>
