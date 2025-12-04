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
                       typeof (window as any).wp?.customize !== 'undefined';

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
  // Mount the app component for Customizer
  const container = document.createElement('div');
  container.id = 'menu-queries-app';
  document.body.appendChild(container);

  mount(MenuQueriesApp, {
    target: container,
    props: {
      onSubmit: (config: QueryConfig) => {
        saveQueryConfigCustomizer(config);
      }
    }
  });

  // Wait for wp.customize to be available
  if (typeof (window as any).wp === 'undefined' || typeof (window as any).wp.customize === 'undefined') {
    // Try again after a delay
    setTimeout(initializeCustomizer, 500);
    return;
  }

  const customize = (window as any).wp.customize;

  // Add configure button to query items in Customizer
  customize.bind('ready', () => {
    // Listen for new menu item controls being added
    customize.section.each((section: any) => {
      if (section.id && section.id.indexOf('nav_menu[') === 0) {
        // This is a menu section
        section.container.on('click', '.configure-query-button-customizer', (e: any) => {
          e.preventDefault();
          const itemId = parseInt(e.target.getAttribute('data-item-id') || '0', 10);
          if (itemId) {
            openQueryBuilderForItemCustomizer(itemId);
          }
        });
      }
    });

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
      }
    });
  });
}

function addConfigureButtonToControl(control: any) {
  // Wait a bit for the control to be fully rendered
  setTimeout(() => {
    const container = control.container[0];
    if (!container) {
      return;
    }

    // Check if button already exists
    if (container.querySelector('.configure-query-button-customizer')) {
      return;
    }

    // Check if this is a query item by looking at the setting value
    if (typeof control.setting !== 'function') {
      return;
    }

    const setting = control.setting();
    if (!setting) {
      return;
    }

    // Get the setting value using the .get() method
    const value = setting.get();

    if (!value || value.type !== 'query_item') {
      return;
    }

    // Find the item controls section
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
    const itemId = setting.id.replace('nav_menu_item[', '').replace(']', '');
    button.setAttribute('data-item-id', itemId);
    button.textContent = value.query_config ? 'Edit Query' : 'Configure Query';

    buttonContainer.appendChild(button);

    // Insert after the Navigation Label field
    const navLabelField = itemControls.querySelector('.field-nav-menu-attr');
    if (navLabelField && navLabelField.parentNode) {
      navLabelField.parentNode.insertBefore(buttonContainer, navLabelField.nextSibling);
    } else {
      itemControls.appendChild(buttonContainer);
    }
  }, 500);
}

function openQueryBuilderForItemCustomizer(itemId: number) {
  currentMenuItemId = itemId;

  const customize = (window as any).wp.customize;
  const setting = customize('nav_menu_item[' + itemId + ']');

  if (!setting) return;

  const value = setting.get();
  let existingConfig: QueryConfig | null = null;

  if (value && value.query_config) {
    try {
      existingConfig = JSON.parse(value.query_config);
    } catch (e) {
      // Failed to parse
    }
  }

  // Dispatch event to open modal
  document.dispatchEvent(new CustomEvent('menu-queries:open', {
    detail: { itemId, config: existingConfig }
  }));
}

function saveQueryConfigCustomizer(config: QueryConfig) {
  if (!currentMenuItemId) {
    return;
  }

  const customize = (window as any).wp.customize;
  const setting = customize('nav_menu_item[' + currentMenuItemId + ']');

  if (setting) {
    const value = setting.get();
    value.query_config = JSON.stringify(config);
    setting.set(value);
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
  let existingConfig: QueryConfig | null = null;

  if (configInput && configInput.value) {
    try {
      let configValue = configInput.value;

      // Try different unescape methods
      try {
        // First try: parse directly
        existingConfig = JSON.parse(configValue);
      } catch (firstError) {
        try {
          // Second try: unescape HTML entities
          const textarea = document.createElement('textarea');
          textarea.innerHTML = configValue;
          configValue = textarea.value;
          existingConfig = JSON.parse(configValue);
        } catch (secondError) {
          // Third try: manually unescape backslashes (WordPress adds these)
          configValue = configInput.value.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          existingConfig = JSON.parse(configValue);
        }
      }
    } catch (e) {
      // Silently fail parsing
    }
  }

  // Dispatch event to open modal
  document.dispatchEvent(new CustomEvent('menu-queries:open', {
    detail: { itemId, config: existingConfig }
  }));
}

/**
 * Save query config to menu item
 */
function saveQueryConfig(config: QueryConfig) {
  if (!currentMenuItemId) {
    return;
  }

  const configInput = document.getElementById(`query-config-${currentMenuItemId}`) as HTMLInputElement;
  if (configInput) {
    configInput.value = JSON.stringify(config);

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
