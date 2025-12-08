/**
 * Menu Conditions - Customizer Integration
 *
 * Adds Conditions button to menu items in the Customizer using MutationObserver
 */

(function($) {
    'use strict';

    if (typeof wp === 'undefined' || typeof wp.customize === 'undefined') {
        return;
    }

    const processedControls = new Set();

    wp.customize.bind('ready', function() {
        // Wait for controls to be fully rendered
        setTimeout(function() {
            // Watch for menu item controls being expanded
            wp.customize.control.each(function(control) {
                if (control.params.type === 'nav_menu_item') {
                    setupControlObserver(control);
                }
            });
        }, 500);

        // Watch for new controls being added
        wp.customize.control.bind('add', function(control) {
            if (control.params.type === 'nav_menu_item') {
                // Also delay for new controls
                setTimeout(function() {
                    setupControlObserver(control);
                }, 100);
            }
        });
    });

    function setupControlObserver(control) {
        const menuItemId = control.params.menu_item_id;
        const controlId = control.id;

        // Skip if already processed
        if (processedControls.has(controlId)) {
            return;
        }

        const container = control.container[0];
        if (!container) {
            return;
        }

        // Fetch conditions immediately to apply header styling even when collapsed
        fetchAndApplyHeaderStyling(control, container, menuItemId);

        let buttonRequested = false;

        // In Customizer, menu-item-settings doesn't exist until the item is expanded
        // Watch for it to be created
        const observer = new MutationObserver(function(mutations) {
            const settings = container.querySelector('.menu-item-settings');

            if (settings) {
                // Check if it's visible and we haven't added a button yet
                if (settings.offsetParent !== null && !buttonRequested && !settings.querySelector('.ab-menu-conditions-button')) {
                    buttonRequested = true;
                    addConditionButton(control, settings, menuItemId);
                }
            }
        });

        // Watch the entire container for child nodes being added
        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        // Also check immediately in case it's already there
        const settings = container.querySelector('.menu-item-settings');
        if (settings) {
            if (settings.offsetParent !== null && !settings.querySelector('.ab-menu-conditions-button')) {
                buttonRequested = true;
                addConditionButton(control, settings, menuItemId);
            }
        }

        processedControls.add(controlId);
    }

    function fetchAndApplyHeaderStyling(control, container, menuItemId) {
        const { apiUrl, nonce } = window.abMenuConditionsData;

        fetch(`${apiUrl}/menu-conditions/item/${menuItemId}`, {
            headers: { 'X-WP-Nonce': nonce }
        })
        .then(response => response.json())
        .then(data => {
            const conditions = data.success && data.conditions ? data.conditions : { relation: 'AND', conditions: [] };
            const hasConditions = conditions.conditions && conditions.conditions.length > 0;

            if (hasConditions) {
                // Wait for DOM to be ready, then apply styling
                // The control might not be fully rendered when fetch completes
                const applyClass = () => {
                    const handle = document.querySelector(`#customize-control-nav_menu_item-${menuItemId} .menu-item-handle`);

                    if (handle) {
                        handle.classList.add('has-menu-conditions');
                    } else {
                        // Retry after a short delay if handle not found
                        setTimeout(applyClass, 100);
                    }
                };

                // Start trying to apply the class
                applyClass();
            }
        })
        .catch(error => {
            console.error('Failed to fetch conditions for header styling:', error);
        });
    }

    function addConditionButton(control, settingsElement, menuItemId) {
        // Check if button already exists
        if (settingsElement.querySelector('.ab-menu-conditions-button')) {
            return;
        }

        // Fetch conditions from server (Customizer doesn't have settings for custom meta)
        const { apiUrl, nonce } = window.abMenuConditionsData;

        fetch(`${apiUrl}/menu-conditions/item/${menuItemId}`, {
            headers: { 'X-WP-Nonce': nonce }
        })
        .then(response => response.json())
        .then(data => {
            const conditions = data.success && data.conditions ? data.conditions : { relation: 'AND', conditions: [] };
            const hasConditions = conditions.conditions && conditions.conditions.length > 0;

            // Double-check button doesn't exist (in case of race condition)
            if (!settingsElement.querySelector('.ab-menu-conditions-button')) {
                createButton(control, settingsElement, menuItemId, conditions, hasConditions);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            // On error, create button without conditions
            const conditions = { relation: 'AND', conditions: [] };
            if (!settingsElement.querySelector('.ab-menu-conditions-button')) {
                createButton(control, settingsElement, menuItemId, conditions, false);
            }
        });
    }

    function createButton(control, settingsElement, menuItemId, conditions, hasConditions) {
        // Create button element
        const wrapper = document.createElement('div');
        wrapper.className = 'ab-menu-conditions-button-wrapper';
        wrapper.style.margin = '10px 0';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'button button-secondary ab-menu-conditions-button';
        if (hasConditions) {
            button.classList.add('has-conditions');
        }
        button.dataset.menuItemId = menuItemId;
        button.dataset.conditions = JSON.stringify(conditions);

        // Create SVG icon
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z');
        svg.appendChild(path);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '3');
        svg.appendChild(circle);

        button.appendChild(svg);

        // Create text span
        const textSpan = document.createElement('span');
        textSpan.style.marginLeft = '5px';
        textSpan.textContent = 'Conditions';

        if (hasConditions) {
            const indicator = document.createElement('span');
            indicator.className = 'ab-conditions-indicator';
            indicator.style.color = '#2271b1';
            indicator.style.marginLeft = '4px';
            indicator.textContent = '●';
            textSpan.appendChild(indicator);
        }

        button.appendChild(textSpan);
        wrapper.appendChild(button);

        // Find the description field and add button after it
        const descriptionField = settingsElement.querySelector('.field-description');
        if (descriptionField) {
            descriptionField.parentNode.insertBefore(wrapper, descriptionField.nextSibling);
        } else {
            // Fallback: add to the bottom of settings
            settingsElement.appendChild(wrapper);
        }

        // Apply styling to the menu item header if it has conditions
        if (hasConditions) {
            const handle = control.container[0].querySelector('.menu-item-handle');
            if (handle) {
                handle.classList.add('has-menu-conditions');
            }
        }

        // Dispatch event to notify MenuConditionsApp
        setTimeout(function() {
            const event = new CustomEvent('menu-conditions-buttons-added');
            document.dispatchEvent(event);
        }, 100);
    }

})(jQuery);
