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
  console.log('MenuQueries: initializeCustomizer() called');

  // Mount the app component directly to body to avoid 0x0 container issues
  mount(MenuQueriesApp, {
    target: document.body,
    props: {
      onSubmit: (config: QueryConfig) => {
        saveQueryConfigCustomizer(config);
      }
    }
  });

  console.log('MenuQueries: MenuQueriesApp mounted to body');

  // Wait for wp.customize to be available
  if (typeof (window as any).wp === 'undefined' || typeof (window as any).wp.customize === 'undefined') {
    setTimeout(initializeCustomizer, 500);
    return;
  }

  const customize = (window as any).wp.customize;

  // Add configure button to query items in Customizer
  customize.bind('ready', () => {
    console.log('MenuQueries: Customizer ready');

    // Add button to existing query item controls
    customize.control.each((control: any) => {
      if (control.params && control.params.type === 'nav_menu_item') {
        addConfigureButtonToControl(control);
      }
    });

    // Listen for new controls being added
    customize.control.bind('add', (control: any) => {
      if (control.params && control.params.type === 'nav_menu_item') {
        console.log('MenuQueries: New nav_menu_item control added', control.id);
        addConfigureButtonToControl(control);

        // Check if this is a newly added query item
        const value = control.setting ? control.setting() : null;
        if (value && value.type === 'query_item') {
          console.log('MenuQueries: New query item detected, will auto-open modal when expanded');

          // Wait for the control container to be available and expanded
          setTimeout(() => {
            const container = control.container[0];
            if (container && container.classList.contains('menu-item-edit-active')) {
              // Already expanded - open modal immediately
              const itemId = control.id.replace('nav_menu_item[', '').replace(']', '');
              console.log('MenuQueries: Auto-opening modal for new query item', itemId);
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

  console.log('MenuQueries: Found query item', itemId, '- setting up observer');

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

    console.log('MenuQueries: Item', itemId, 'is now expanded!');

    // Find the menu item settings container
    const itemControls = container.querySelector('.menu-item-settings');

    console.log('MenuQueries: itemControls found:', !!itemControls);

    if (!itemControls) {
      console.log('MenuQueries: .menu-item-settings not found yet');
      return;
    }

    console.log('MenuQueries: Control expanded, adding button for item', itemId);
    console.log('MenuQueries: itemControls.innerHTML =', itemControls.innerHTML.substring(0, 500));

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
      console.log('MenuQueries: Configure button clicked for item', itemId);
      openQueryBuilderForItemCustomizer(parseInt(itemId, 10));
    });

    buttonContainer.appendChild(button);

    // Find a good place to insert - look for URL field
    const urlField = itemControls.querySelector('.field-url');
    if (urlField && urlField.parentNode) {
      urlField.parentNode.insertBefore(buttonContainer, urlField.nextSibling);
      console.log('MenuQueries: Inserted button after URL field');
    } else {
      itemControls.appendChild(buttonContainer);
      console.log('MenuQueries: Appended button to controls');
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
  console.log('MenuQueries: openQueryBuilderForItemCustomizer called with itemId:', itemId);
  currentMenuItemId = itemId;

  const customize = (window as any).wp.customize;
  console.log('MenuQueries: wp.customize exists:', !!customize);

  const setting = customize('nav_menu_item[' + itemId + ']');
  console.log('MenuQueries: setting exists:', !!setting);

  if (!setting) {
    console.log('MenuQueries: No setting found, returning');
    return;
  }

  // In the Customizer API, setting() returns the value and setting.set() updates it
  const value = setting();
  console.log('MenuQueries: setting value:', value);
  console.log('MenuQueries: query_config from setting:', value?.query_config?.substring(0, 100));

  let rawWPQuery = '';

  // First try to get from Customizer setting
  if (value && value.query_config) {
    console.log('MenuQueries: Found query_config in setting');
    rawWPQuery = value.query_config
      .replace(/\\"/g, '"')   // Replace \" with "
      .replace(/\\\\/g, '\\'); // Replace \\ with \
  } else {
    // Fallback: Load from database via REST API
    // This is needed for newly added items where the setting doesn't have query_config yet
    console.log('MenuQueries: No query_config in setting, loading from database...');
    try {
      const response = await fetch(`${window.abMenuQueriesData.apiUrl}/menu-queries/get-config?menu_item_id=${itemId}`, {
        headers: {
          'X-WP-Nonce': window.abMenuQueriesData.nonce,
        },
      });
      const data = await response.json();
      if (data.success && data.query_config) {
        console.log('MenuQueries: Loaded from database:', data.query_config.substring(0, 100));
        rawWPQuery = data.query_config;
      }
    } catch (error) {
      console.error('MenuQueries: Failed to load from database:', error);
    }
  }

  console.log('MenuQueries: Final rawWPQuery:', rawWPQuery.substring(0, 200));

  // Dispatch event to open modal with rawWPQuery
  // The modal will parse this to populate the UI fields
  console.log('MenuQueries: Dispatching menu-queries:open event');
  document.dispatchEvent(new CustomEvent('menu-queries:open', {
    detail: { itemId, rawWPQuery }
  }));
  console.log('MenuQueries: Event dispatched');
}

async function saveQueryConfigCustomizer(config: QueryConfig) {
  console.log('MenuQueries: saveQueryConfigCustomizer called with:', config);
  console.log('MenuQueries: currentMenuItemId:', currentMenuItemId);

  if (!currentMenuItemId) {
    console.log('MenuQueries: No currentMenuItemId, returning');
    return;
  }

  const customize = (window as any).wp.customize;
  const setting = customize('nav_menu_item[' + currentMenuItemId + ']');

  // Save ONLY the rawWPQuery as the source of truth
  const queryToSave = config.rawWPQuery || '';

  console.log('MenuQueries: Saving via REST API, rawWPQuery:', queryToSave.substring(0, 100));

  try {
    // Save directly to database via REST API
    // This is necessary because Customizer settings don't persist on Publish
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
    console.log('MenuQueries: REST API save response:', data);

    if (data.success) {
      // ALSO update the Customizer setting so it's available when reopening
      if (setting) {
        const currentValue = setting();
        const newValue = {
          ...currentValue,
          query_config: queryToSave
        };
        setting.set(newValue);
        console.log('MenuQueries: Customizer setting updated with query_config');
      }

      // Refresh the Customizer preview to show the updated menu
      customize.previewer.refresh();
      console.log('MenuQueries: Preview refreshed');
    } else {
      console.error('MenuQueries: REST API save failed:', data);
    }
  } catch (error) {
    console.error('MenuQueries: REST API save error:', error);
  }

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
