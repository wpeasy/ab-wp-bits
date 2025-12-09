import { createRawSnippet } from 'svelte';
import type { AdvancedSelectOption } from './lib/AdvancedSelect.svelte';

// =============================================================================
// App State Object - wrapping $state in an object makes it importable/mutable
// =============================================================================

export const state = $state({
  // UI State
  theme: 'auto' as 'auto' | 'light' | 'dark',
  density: 'comfy' as 'comfy' | 'compact',
  sidebarOpen: false,
  activeSection: 'alerts-badges',

  // Form State (Demo)
  searchQuery: '',
  segment: 'All',
  onlyIssues: false,
  productName: '',
  productSku: '',
  productDesc: '',
  productPrice: '59.00',
  salePrice: '',
  taxClass: 'Standard',
  requiresShipping: true,
  stock: '120',
  warehouse: 'Main',
  reorderLevel: '20',

  // Switch States (Demo)
  switchXs: true,
  switchS: true,
  switchDefault: true,
  switchM: true,
  switchL: true,
  switchNeutral: true,
  switchPrimary: true,
  switchSecondary: true,

  // Input States (Demo)
  demoText: '',
  demoPassword: '',
  demoEmail: '',
  demoNumber: '42',
  demoTextarea: '',
  demoSelect: 'option1',
  demoRadio: 'option1',

  // Range States (Demo)
  demoRangeVolume: 50,
  demoRangeRating: 50,
  demoRangeOpacity: 0.5,
  demoRangePriceMin: 20,
  demoRangePriceMax: 80,
  demoRangeAgeMin: 25,
  demoRangeAgeMax: 45,
  demoRangeTimeMin: 9,
  demoRangeTimeMax: 17,

  // Select States (Demo)
  demoMultiSelect: ['react', 'svelte'] as string[],
  demoSingleSelect: 'vue',
  demoManageableSelect: ['tag1'] as string[],
  demoManageableOptions: [
    { value: 'tag1', label: 'Locked Tag', deletable: true, locked: true },
    { value: 'tag2', label: 'Deletable Tag', deletable: true, locked: false },
    { value: 'tag3', label: 'Protected Tag', deletable: false, locked: false }
  ] as AdvancedSelectOption[],

  // Modal States (Demo)
  modalStandard: false,
  modalLarge: false,
  modalFullscreen: false,
  modalScrollable: false,

  // Misc States (Demo)
  viewMode: 'grid'
});

// =============================================================================
// Derived State
// =============================================================================

export const derived = {
  get themeLabel() {
    return state.theme === 'auto' ? 'Respect OS' : state.theme.charAt(0).toUpperCase() + state.theme.slice(1);
  }
};

// =============================================================================
// Constants (Options, Data)
// =============================================================================

export const radioOptions = [
  { value: 'option1', label: 'Option One' },
  { value: 'option2', label: 'Option Two' },
  { value: 'option3', label: 'Option Three' }
];

export const frameworkOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid', label: 'SolidJS' },
  { value: 'qwik', label: 'Qwik' }
];

export const tableColumns = [
  { key: 'order', label: 'Order' },
  { key: 'customer', label: 'Customer' },
  { key: 'status', label: 'Status' },
  { key: 'total', label: 'Total' },
  { key: 'date', label: 'Date' },
  { key: 'actions', label: '' }
];

export const tableData = [
  { order: '#10234', customer: 'Jane Cooper', status: 'Paid', statusVariant: 'success', total: '$129.00', date: '2025-10-01' },
  { order: '#10233', customer: 'Wade Warren', status: 'Pending', statusVariant: 'warning', total: '$89.00', date: '2025-09-30' },
  { order: '#10232', customer: 'Esther Howard', status: 'Failed', statusVariant: 'danger', total: '$59.00', date: '2025-09-30' },
  { order: '#10231', customer: 'Cameron Williamson', status: 'Paid', statusVariant: 'success', total: '$245.00', date: '2025-09-29' },
  { order: '#10230', customer: 'Brooklyn Simmons', status: 'Paid', statusVariant: 'success', total: '$178.00', date: '2025-09-28' }
];

// =============================================================================
// Tabs Data
// =============================================================================

export const defaultTabs = [
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

export const primaryTabs = [
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

export const secondaryTabs = [
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

// =============================================================================
// Accordion Data
// =============================================================================

export const defaultAccordion = [
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

export const primaryAccordion = [
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

export const secondaryAccordion = [
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

// =============================================================================
// Actions / Functions
// =============================================================================

export function setTheme(value: 'auto' | 'light' | 'dark') {
  state.theme = value;
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

export function toggleDensity() {
  state.density = state.density === 'compact' ? 'comfy' : 'compact';
}

export function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
}

// =============================================================================
// Toast Utilities
// =============================================================================

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

export function showToast(position: string, type: string = 'default') {
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

// =============================================================================
// AdvancedSelect Event Handlers
// =============================================================================

export function handleAdvancedSelectCreate(e: CustomEvent) {
  const { id, query } = e.detail;
  if (id === 'demo-manageable-select') {
    const slug = query.toLowerCase().replace(/\s+/g, '-');
    state.demoManageableOptions = [...state.demoManageableOptions, {
      value: slug,
      label: query,
      deletable: true,
      locked: false
    }];
    state.demoManageableSelect = [...state.demoManageableSelect, slug];
  }
}

export function handleAdvancedSelectDelete(e: CustomEvent) {
  const { id, value } = e.detail;
  if (id === 'demo-manageable-select') {
    state.demoManageableOptions = state.demoManageableOptions.filter(o => o.value !== value);
    state.demoManageableSelect = state.demoManageableSelect.filter(v => v !== value);
  }
}

export function handleAdvancedSelectLock(e: CustomEvent) {
  const { id, value } = e.detail;
  if (id === 'demo-manageable-select') {
    state.demoManageableOptions = state.demoManageableOptions.map(o =>
      o.value === value ? { ...o, locked: !o.locked } : o
    );
  }
}
