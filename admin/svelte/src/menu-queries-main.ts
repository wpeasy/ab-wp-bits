/**
 * Main entry point for Menu Queries module
 */

import { mount } from 'svelte';
import MenuQueriesApp from './MenuQueriesApp.svelte';
import type { QueryConfig } from './menu-queries-types';

let currentMenuItemId: number | null = null;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Check if we're in the Customizer
  const isCustomizer = window.location.pathname.includes('customize.php') ||
                       window.location.search.includes('customize_theme');

  if (isCustomizer) {
    initializeCustomizer();
    return;
  }

  const container = document.getElementById('menu-queries-app');
  const addButton = document.getElementById('add-query-item');

  if (!container) {
    return;
  }

  // Mount the app component directly to body to avoid 0x0 container issues
  mount(MenuQueriesApp, {
    target: document.body,
    props: {
      onSubmit: (config: QueryConfig) => {
        saveQueryConfig(config);
      }
    }
  });

  // Handle "Add to Menu" button click
  if (addButton) {
    addButton.addEventListener('click', handleAddQueryItem);
  }

  // Handle "Configure Query" button clicks (delegated)
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('configure-query-button')) {
      const itemId = parseInt(target.getAttribute('data-item-id') || '0', 10);
      if (itemId) {
        openQueryBuilderForItem(itemId);
      }
    }
  });
}

function initializeCustomizer() {
  // Mount the app component directly to body to avoid 0x0 container issues
  mount(MenuQueriesApp, {
    target: document.body,
    props: {
      onSubmit: (config: QueryConfig) => {
        saveQueryConfigCustomizer(config);
      }
    }
  });

  // Wait for wp.customize to be available
  if (typeof (window as any).wp === 'undefined' || typeof (window as any).wp.customize === 'undefined') {
    setTimeout(initializeCustomizer, 500);
    return;
  }

  const customize = (window as any).wp.customize;

  // Add configure button to query items in Customizer
  customize.bind('ready', () => {
    // Add button to existing query item controls
    customize.control.each((control: any) => {
      if (control.params && control.params.type === 'nav_menu_item') {
        addConfigureButtonToControl(control);
      }
    });

    // Listen for new controls being added
    customize.control.bind('add', (control: any) => {
      if (control.params && control.params.type === 'nav_menu_item') {
        addConfigureButtonToControl(control);

        // Check if this is a newly added query item
        const value = control.setting ? control.setting() : null;
        if (value && value.type === 'query_item') {
          // Wait for the control container to be available and expanded
          setTimeout(() => {
            const container = control.container[0];
            if (container && container.classList.contains('menu-item-edit-active')) {
              // Already expanded - open modal immediately
              const itemId = control.id.replace('nav_menu_item[', '').replace(']', '');
              openQueryBuilderForItemCustomizer(parseInt(itemId, 10));
            }
          }, 500);
        }
      }
    });
  });
}

function addConfigureButtonToControl(control: any) {
  // Check if this is a query item by looking at the setting value
  if (typeof control.setting !== 'function') {
    return;
  }

  const value = control.setting();
  if (!value) {
    return;
  }

  // Extract item ID from control.id (format: "nav_menu_item[123]")
  const itemId = control.id.replace('nav_menu_item[', '').replace(']', '');

  // Check if this is a query item
  // Can be: type='query_item' (from Customizer Add Items)
  // OR: type='custom' with url='#query-item' (from Appearance->Menus)
  // OR: has query_config already set
  const isQueryItem = value.query_config ||
                      value.type === 'query_item' ||
                      (value.type === 'custom' && value.object === 'custom' && value.url === '#query-item');

  if (!isQueryItem) {
    return;
  }

  const container = control.container[0];
  if (!container) {
    return;
  }

  // Use MutationObserver to watch for when the container gets populated (when user expands the item)
  const observer = new MutationObserver((mutations) => {
    // Check if button already exists
    if (container.querySelector('.configure-query-button-customizer')) {
      return;
    }

    // Check if the item is expanded (edit-active class)
    if (!container.classList.contains('menu-item-edit-active')) {
      return; // Item is still collapsed
    }

    // Find the menu item settings container
    const itemControls = container.querySelector('.menu-item-settings');

    if (!itemControls) {
      return;
    }

    // Create configure button
    const buttonContainer = document.createElement('p');
    buttonContainer.className = 'field-query-config description description-wide';
    buttonContainer.style.marginTop = '10px';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button-secondary configure-query-button-customizer';
    button.setAttribute('data-item-id', itemId);
    button.textContent = value.query_config ? 'Edit Query' : 'Configure Query';

    // Add click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      openQueryBuilderForItemCustomizer(parseInt(itemId, 10));
    });

    buttonContainer.appendChild(button);

    // Find a good place to insert - look for URL field
    const urlField = itemControls.querySelector('.field-url');
    if (urlField && urlField.parentNode) {
      urlField.parentNode.insertBefore(buttonContainer, urlField.nextSibling);
    } else {
      itemControls.appendChild(buttonContainer);
    }
  });

  // Start observing the container for changes
  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,  // Watch for class changes (menu-item-edit-active)
    attributeFilter: ['class']  // Only watch class attribute
  });
}

async function openQueryBuilderForItemCustomizer(itemId: number) {
  currentMenuItemId = itemId;

  const customize = (window as any).wp.customize;

  const setting = customize('nav_menu_item[' + itemId + ']');

  if (!setting) {
    return;
  }

  // In the Customizer API, setting() returns the value and setting.set() updates it
  const value = setting();

  let rawWPQuery = '';

  // First try to get from Customizer setting
  if (value && value.query_config) {
    rawWPQuery = value.query_config
      .replace(/\\"/g, '"')   // Replace \" with "
      .replace(/\\\\/g, '\\'); // Replace \\ with \
  } else {
    // Fallback: Load from database via REST API
    // This is needed for newly added items where the setting doesn't have query_config yet
    try {
      const response = await fetch(`${window.abMenuQueriesData.apiUrl}/menu-queries/get-config?menu_item_id=${itemId}`, {
        headers: {
          'X-WP-Nonce': window.abMenuQueriesData.nonce,
        },
      });
      const data = await response.json();
      if (data.success && data.query_config) {
        rawWPQuery = data.query_config;
      }
    } catch (error) {
      console.error('Failed to load query config from database:', error);
    }
  }

  // Dispatch event to open modal with rawWPQuery
  // The modal will parse this to populate the UI fields
  document.dispatchEvent(new CustomEvent('menu-queries:open', {
    detail: { itemId, rawWPQuery }
  }));
}

async function saveQueryConfigCustomizer(config: QueryConfig) {
  if (!currentMenuItemId) {
    return;
  }

  const customize = (window as any).wp.customize;
  const setting = customize('nav_menu_item[' + currentMenuItemId + ']');

  // Save ONLY the rawWPQuery as the source of truth
  const queryToSave = config.rawWPQuery || '';

  // Check if this is a temporary ID (negative number = unsaved item)
  const isTempId = currentMenuItemId < 0;

  // ALWAYS update the Customizer setting first
  if (setting) {
    const currentValue = setting();

    // Only generate title from query config if it's still the default "Query Item"
    let title = currentValue.title || 'Query Item';
    if (title === 'Query Item' || !title) {
      try {
        const parsed = JSON.parse(queryToSave);
        const postType = parsed.post_type || '';
        const taxonomy = parsed.taxonomy || '';
        const newTitle = taxonomy ? `Query: ${taxonomy}` : `Query: ${postType}`;

        if (newTitle && newTitle !== 'Query: ') {
          title = newTitle;
        }
      } catch (e) {
        // Keep existing title
      }
    }

    // CRITICAL: Store query_config in the description field (which IS whitelisted)
    // WordPress's sanitization strips query_config, but preserves description
    // We Base64 encode it to ensure it passes sanitization safely
    const encodedConfig = btoa(queryToSave);

    const newValue = {
      ...currentValue,
      query_config: queryToSave,  // Will be stripped by sanitization, but needed for preview
      description: encodedConfig,  // Survives sanitization!
      title: title
    };
    setting.set(newValue);
  }

  // Only save to database if this is a real post ID (positive number)
  if (!isTempId) {
    try {
      const response = await fetch(`${window.abMenuQueriesData.apiUrl}/menu-queries/save-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.abMenuQueriesData.nonce,
        },
        body: JSON.stringify({
          menu_item_id: currentMenuItemId,
          query_config: queryToSave,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error('Failed to save query config to database:', data);
      }
    } catch (error) {
      console.error('Error saving query config to database:', error);
    }
  }

  // Refresh the Customizer preview to show the updated menu
  // Add a small delay to ensure setting is updated first
  setTimeout(() => {
    customize.previewer.refresh();
  }, 100);

  currentMenuItemId = null;
}

/**
 * Handle "Add to Menu" button click
 */
function handleAddQueryItem(e: Event) {
  e.preventDefault();

  const { ajaxUrl, ajaxNonce } = window.abMenuQueriesData;
  const menuId = getSelectedMenuId();

  if (!menuId) {
    alert('Please select a menu first.');
    return;
  }

  const button = e.target as HTMLButtonElement;
  const spinner = button.parentElement?.querySelector('.spinner') as HTMLElement;

  // Show spinner
  if (spinner) {
    spinner.classList.add('is-active');
  }
  button.disabled = true;

  const formData = new FormData();
  formData.append('action', 'add_query_menu_item');
  formData.append('nonce', ajaxNonce);
  formData.append('menu', menuId.toString());
  formData.append('title', 'Query Item');

  fetch(ajaxUrl, {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data?.menu_item_html) {
        // Add the menu item to the menu structure
        addMenuItemToDOM(data.data.menu_item_html);
      } else {
        alert(data.data?.message || 'Error adding query item');
      }
    })
    .catch(error => {
      console.error('Error adding query item:', error);
      alert('Error adding query item. Please try again.');
    })
    .finally(() => {
      // Hide spinner
      if (spinner) {
        spinner.classList.remove('is-active');
      }
      button.disabled = false;
    });
}

/**
 * Add menu item HTML to the menu structure
 */
function addMenuItemToDOM(html: string) {
  const menuList = document.getElementById('menu-to-edit');
  if (!menuList) {
    return;
  }

  // Create a temporary container to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const menuItem = temp.firstElementChild;

  if (menuItem) {
    // Append to menu
    menuList.appendChild(menuItem);

    // Trigger WordPress menu initialization for the new item
    if (typeof (window as any).wpNavMenu !== 'undefined') {
      (window as any).wpNavMenu.refreshKeyboardAccessibility();
      (window as any).wpNavMenu.refreshAdvancedAccessibility();
    }
  }
}

/**
 * Open query builder modal for a specific menu item
 */
function openQueryBuilderForItem(itemId: number) {
  currentMenuItemId = itemId;

  // Load existing config if available
  const configInput = document.getElementById(`query-config-${itemId}`) as HTMLInputElement;
  let rawWPQuery = '';

  if (configInput && configInput.value) {
    try {
      let configValue = configInput.value;

      // Try different unescape methods
      let parsed: any = null;
      try {
        // First try: parse directly
        parsed = JSON.parse(configValue);
      } catch (firstError) {
        try {
          // Second try: unescape HTML entities
          const textarea = document.createElement('textarea');
          textarea.innerHTML = configValue;
          configValue = textarea.value;
          parsed = JSON.parse(configValue);
        } catch (secondError) {
          // Third try: manually unescape backslashes (WordPress adds these)
          configValue = configInput.value.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          parsed = JSON.parse(configValue);
        }
      }

      // Detect format: if it has WP_Query properties (snake_case), it's the rawWPQuery
      // Otherwise it's the legacy full config object
      if (parsed && (parsed.post_type || parsed.taxonomy)) {
        // New format: this IS the rawWPQuery
        rawWPQuery = JSON.stringify(parsed);
      } else if (parsed && parsed.rawWPQuery) {
        // Legacy format: extract rawWPQuery
        rawWPQuery = parsed.rawWPQuery;
      }
    } catch (e) {
      // Silently fail parsing
    }
  }

  // Dispatch event to open modal with rawWPQuery
  document.dispatchEvent(new CustomEvent('menu-queries:open', {
    detail: { itemId, rawWPQuery }
  }));
}

/**
 * Save query config to menu item (regular admin)
 */
function saveQueryConfig(config: QueryConfig) {
  if (!currentMenuItemId) {
    return;
  }

  // Save ONLY the rawWPQuery as the source of truth
  const queryToSave = config.rawWPQuery || '';

  const configInput = document.getElementById(`query-config-${currentMenuItemId}`) as HTMLInputElement;
  if (configInput) {
    configInput.value = queryToSave;

    // Trigger change event so WordPress knows to save
    const event = new Event('change', { bubbles: true });
    configInput.dispatchEvent(event);
  }

  currentMenuItemId = null;
}

/**
 * Get the currently selected menu ID
 */
function getSelectedMenuId(): number | null {
  const selectElement = document.getElementById('menu') as HTMLSelectElement;
  if (selectElement && selectElement.value) {
    return parseInt(selectElement.value, 10);
  }
  return null;
}
