/**
 * Split Menu — Frontend interaction script.
 *
 * Manages hover/click state for ab-split-menu elements.
 * Uses event delegation so listeners survive child DOM replacement
 * during Bricks builder AJAX re-renders.
 *
 * @package AB\AB_WP_Bits
 * @since   0.0.9-beta
 */
(function () {
  'use strict';

  var SELECTOR = '.brxe-ab-split-menu';

  /**
   * Initialise a single Split Menu instance.
   *
   * Uses AbortController to cleanly tear down old listeners on re-init
   * (e.g. when Bricks re-renders the element after a settings change).
   *
   * @param {HTMLElement} menu Root .brxe-ab-split-menu element.
   */
  function initSplitMenu(menu) {
    // Tear down previous listeners if re-initialising
    if (menu._abSplitMenuAbort) {
      menu._abSplitMenuAbort.abort();
    }

    var controller = new AbortController();
    var signal     = controller.signal;
    menu._abSplitMenuAbort = controller;

    var trigger              = menu.getAttribute('data-trigger') || 'hover';
    var defaultState         = menu.getAttribute('data-default-state') || 'none';
    var parentClickable      = menu.getAttribute('data-parent-clickable') === 'true';
    var deactivateOnMouseout = menu.getAttribute('data-deactivate-on-mouseout') === 'true';

    // --- Selected Label helpers -----------------------------------------------

    /**
     * Get the visible text of a menu item link, excluding submenu icon content.
     *
     * @param  {HTMLElement} item The <li> element.
     * @return {string}      Trimmed text content.
     */
    function getItemText(item) {
      var link = item.querySelector('.ab-split-menu__link');
      if (!link) {
        return '';
      }
      // Clone the link and remove icon spans to get clean text
      var clone = link.cloneNode(true);
      var icons = clone.querySelectorAll('.ab-split-menu__submenu-icon');
      for (var i = 0; i < icons.length; i++) {
        icons[i].parentNode.removeChild(icons[i]);
      }
      return (clone.textContent || '').trim();
    }

    /**
     * Get the default label text (first Level 1 item's title).
     *
     * @return {string}
     */
    function getDefaultLabelText() {
      var firstLevel = findLevel(1);
      if (!firstLevel) {
        return '';
      }
      var firstItem = firstLevel.querySelector('.ab-split-menu__item');
      return firstItem ? getItemText(firstItem) : '';
    }

    /**
     * Update all selected-label elements within this menu with transition.
     *
     * @param {string} text The new label text.
     */
    function updateSelectedLabel(text) {
      var labels = menu.querySelectorAll('.brxe-ab-split-menu-selected-label');
      for (var i = 0; i < labels.length; i++) {
        var textEl = labels[i].querySelector('.ab-split-menu-selected-label__text');
        if (!textEl) {
          continue;
        }

        // Skip if text is already the same
        if ((textEl.textContent || '').trim() === text) {
          continue;
        }

        // Cancel any in-progress transition timer
        if (textEl._abLabelTimer) {
          clearTimeout(textEl._abLabelTimer);
          textEl._abLabelTimer = null;
        }

        // Reset animation state
        textEl.classList.remove(
          'ab-split-menu-selected-label__text--out',
          'ab-split-menu-selected-label__text--in'
        );

        // Swap text immediately, then play enter animation
        textEl.textContent = text;
        void textEl.offsetWidth;
        textEl.classList.add('ab-split-menu-selected-label__text--in');

        // Clean up enter class after animation completes
        (function (el) {
          el._abLabelTimer = setTimeout(function () {
            el.classList.remove('ab-split-menu-selected-label__text--in');
            el._abLabelTimer = null;
          }, 250);
        })(textEl);
      }
    }

    // --- Helpers (query fresh DOM each time) ---------------------------------

    /**
     * Get all level elements inside this menu.
     *
     * @return {HTMLElement[]}
     */
    function getLevels() {
      return Array.prototype.slice.call(menu.querySelectorAll('[data-level]'));
    }

    /**
     * Find the level element for a given level number.
     *
     * @param  {number}           num Level number.
     * @return {HTMLElement|null}
     */
    function findLevel(num) {
      var levels = getLevels();
      for (var i = 0; i < levels.length; i++) {
        if (parseInt(levels[i].getAttribute('data-level'), 10) === num) {
          return levels[i];
        }
      }
      return null;
    }

    /**
     * Resolve the level number for a menu item by looking at its
     * closest [data-level] ancestor.
     *
     * @param  {HTMLElement}  item The <li> element.
     * @return {number|null}  1-based level number, or null.
     */
    function getLevelForItem(item) {
      var levelEl = item.closest('[data-level]');
      if (!levelEl || !menu.contains(levelEl)) {
        return null;
      }
      return parseInt(levelEl.getAttribute('data-level'), 10);
    }

    // --- Activation helpers --------------------------------------------------

    /**
     * Activate the submenu for a given item.
     *
     * @param {HTMLElement} item      The <li> that was activated.
     * @param {number}      fromLevel The level the item lives in (1-based).
     */
    function activateSubmenu(item, fromLevel) {
      var targetLevel = fromLevel + 1;
      var itemId      = item.getAttribute('data-item-id');

      // Deactivate deeper levels first (cascading close)
      deactivateFromLevel(targetLevel);

      // Mark item active (clear siblings first)
      var siblings = item.parentElement.querySelectorAll('.ab-split-menu__item--active');
      for (var i = 0; i < siblings.length; i++) {
        siblings[i].classList.remove('ab-split-menu__item--active');
        siblings[i].setAttribute('aria-expanded', 'false');
      }
      item.classList.add('ab-split-menu__item--active');
      item.setAttribute('aria-expanded', 'true');

      // Find the level element for targetLevel
      var levelEl = findLevel(targetLevel);
      if (!levelEl) {
        return;
      }

      // Show the correct group
      var groups = levelEl.querySelectorAll('.ab-split-menu__list[data-parent-id]');
      for (var g = 0; g < groups.length; g++) {
        if (groups[g].getAttribute('data-parent-id') === String(itemId)) {
          groups[g].classList.add('active');
        } else {
          groups[g].classList.remove('active');
        }
      }

      // Mark level active
      levelEl.classList.add('active');

      // Add state class to wrapper
      menu.classList.add('level' + targetLevel + '-active');

      // Update selected label with this item's text
      updateSelectedLabel(getItemText(item));
    }

    /**
     * Deactivate all levels starting from a given level.
     *
     * @param {number} fromLevel Level number to start deactivation (inclusive).
     */
    function deactivateFromLevel(fromLevel) {
      var levels = getLevels();
      for (var i = 0; i < levels.length; i++) {
        var lvl = parseInt(levels[i].getAttribute('data-level'), 10);
        if (lvl >= fromLevel) {
          levels[i].classList.remove('active');

          // Hide all groups within this level
          var groups = levels[i].querySelectorAll('.ab-split-menu__list[data-parent-id]');
          for (var g = 0; g < groups.length; g++) {
            groups[g].classList.remove('active');
          }

          // Remove active items within the previous level
          var prevLevelEl = findLevel(lvl - 1);
          if (prevLevelEl) {
            var activeItems = prevLevelEl.querySelectorAll('.ab-split-menu__item--active');
            for (var a = 0; a < activeItems.length; a++) {
              activeItems[a].classList.remove('ab-split-menu__item--active');
              activeItems[a].setAttribute('aria-expanded', 'false');
            }
          }

          // Remove wrapper state class
          menu.classList.remove('level' + lvl + '-active');
        }
      }
    }

    /**
     * Clear active state from an item's siblings.
     *
     * @param {HTMLElement} item The <li> element.
     */
    function clearSiblingActive(item) {
      var siblings = item.parentElement.querySelectorAll('.ab-split-menu__item--active');
      for (var s = 0; s < siblings.length; s++) {
        siblings[s].classList.remove('ab-split-menu__item--active');
        siblings[s].setAttribute('aria-expanded', 'false');
      }
    }

    // --- Shared activation logic -----------------------------------------------

    /**
     * Handle item activation (shared by mouse and keyboard paths).
     *
     * @param {HTMLElement} item The <li> element that was activated.
     */
    function handleItemActivation(item) {
      var levelNum = getLevelForItem(item);
      if (levelNum === null) {
        return;
      }

      if (item.classList.contains('ab-split-menu__item--has-children')) {
        activateSubmenu(item, levelNum);
      } else {
        deactivateFromLevel(levelNum + 1);
        clearSiblingActive(item);
        updateSelectedLabel(getItemText(item));
      }
    }

    // --- Delegated event binding ---------------------------------------------
    // All listeners are on the menu root so they survive child DOM replacement.

    if (trigger === 'hover') {
      // Hover: mouseover on items (mouseover bubbles, mouseenter does not)
      menu.addEventListener('mouseover', function (e) {
        var item = e.target.closest('.ab-split-menu__item');
        if (!item || !menu.contains(item)) {
          return;
        }
        handleItemActivation(item);
      }, { signal: signal });

      // Keyboard A11y: focusin mirrors hover behaviour so Tab activates items
      menu.addEventListener('focusin', function (e) {
        var item = e.target.closest('.ab-split-menu__item');
        if (!item || !menu.contains(item)) {
          return;
        }
        handleItemActivation(item);
      }, { signal: signal });
    }

    // Click handler (always attached for icon clicks and click-mode)
    menu.addEventListener('click', function (e) {
      var link = e.target.closest('.ab-split-menu__link');
      if (!link || !menu.contains(link)) {
        return;
      }

      var item = link.closest('.ab-split-menu__item');
      if (!item) {
        return;
      }

      var hasChildren = item.classList.contains('ab-split-menu__item--has-children');
      if (!hasChildren) {
        // Leaf item in click mode: deactivate deeper levels
        if (trigger === 'click') {
          var levelNum = getLevelForItem(item);
          if (levelNum !== null) {
            deactivateFromLevel(levelNum + 1);
            clearSiblingActive(item);
            updateSelectedLabel(getItemText(item));
          }
        }
        return;
      }

      // Parent item with children
      var levelNum = getLevelForItem(item);
      if (levelNum === null) {
        return;
      }

      // Submenu icon click always activates (touch device support)
      var isIconClick = !!e.target.closest('.ab-split-menu__submenu-icon');

      if (trigger === 'hover') {
        // Hover mode: icon click activates, link click prevented unless parentClickable
        if (isIconClick) {
          e.preventDefault();
          e.stopPropagation();
          activateSubmenu(item, levelNum);
        } else if (!parentClickable) {
          e.preventDefault();
        }
      } else {
        // Click mode: always activate submenu
        activateSubmenu(item, levelNum);
        if (!parentClickable) {
          e.preventDefault();
        }
      }
    }, { signal: signal });

    // Keyboard A11y: Enter/Space activates submenus in click mode
    if (trigger === 'click') {
      menu.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') {
          return;
        }

        var link = e.target.closest('.ab-split-menu__link');
        if (!link || !menu.contains(link)) {
          return;
        }

        var item = link.closest('.ab-split-menu__item');
        if (!item) {
          return;
        }

        var hasChildren = item.classList.contains('ab-split-menu__item--has-children');
        if (!hasChildren) {
          // Leaf item: let the browser follow the link naturally
          return;
        }

        // Parent item: activate submenu, prevent default navigation
        e.preventDefault();
        var levelNum = getLevelForItem(item);
        if (levelNum !== null) {
          activateSubmenu(item, levelNum);
        }
      }, { signal: signal });
    }

    // Keyboard A11y: Arrow key navigation
    menu.addEventListener('keydown', function (e) {
      if (
        e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' &&
        e.key !== 'ArrowDown' && e.key !== 'ArrowUp'
      ) {
        return;
      }

      var link = e.target.closest('.ab-split-menu__link');
      if (!link || !menu.contains(link)) {
        return;
      }

      var item = link.closest('.ab-split-menu__item');
      if (!item) {
        return;
      }

      var levelNum = getLevelForItem(item);
      if (levelNum === null) {
        return;
      }

      if (e.key === 'ArrowRight') {
        if (!item.classList.contains('ab-split-menu__item--has-children')) {
          return;
        }

        e.preventDefault();

        // Activate the submenu so the child level is visible
        activateSubmenu(item, levelNum);

        // Focus the first link in the newly-active child group
        var childLevel = findLevel(levelNum + 1);
        if (childLevel) {
          var firstLink = childLevel.querySelector(
            '.ab-split-menu__list.active .ab-split-menu__link'
          );
          if (!firstLink) {
            firstLink = childLevel.querySelector('.ab-split-menu__link');
          }
          if (firstLink) {
            firstLink.focus();
          }
        }
      } else if (e.key === 'ArrowLeft') {
        // ArrowLeft: move focus back to the active parent in the previous level
        if (levelNum <= 1) {
          return;
        }

        e.preventDefault();

        var prevLevel = findLevel(levelNum - 1);
        if (prevLevel) {
          var parentLink = prevLevel.querySelector(
            '.ab-split-menu__item--active .ab-split-menu__link'
          );
          if (parentLink) {
            parentLink.focus();
          }
        }
      } else {
        // ArrowDown / ArrowUp: navigate siblings within the current list, wrapping
        e.preventDefault();

        var list = item.closest('.ab-split-menu__list');
        if (!list) {
          return;
        }

        var items = Array.prototype.slice.call(
          list.querySelectorAll(':scope > .ab-split-menu__item')
        );
        if (items.length === 0) {
          return;
        }

        var idx = items.indexOf(item);
        if (idx === -1) {
          return;
        }

        var next;
        if (e.key === 'ArrowDown') {
          next = items[(idx + 1) % items.length];
        } else {
          next = items[(idx - 1 + items.length) % items.length];
        }

        var nextLink = next.querySelector('.ab-split-menu__link');
        if (nextLink) {
          nextLink.focus();
        }
      }
    }, { signal: signal });

    // --- Deactivate on mouseout / focusout -----------------------------------

    if (deactivateOnMouseout) {
      menu.addEventListener('mouseleave', function () {
        deactivateFromLevel(2);
        updateSelectedLabel(getDefaultLabelText());
      }, { signal: signal });

      // Mirror mouseleave for keyboard: deactivate when focus leaves the menu
      menu.addEventListener('focusout', function (e) {
        // relatedTarget is the element receiving focus. If it's outside
        // this menu (or null, e.g. tabbing out of the page), deactivate.
        if (!e.relatedTarget || !menu.contains(e.relatedTarget)) {
          deactivateFromLevel(2);
          updateSelectedLabel(getDefaultLabelText());
        }
      }, { signal: signal });
    }

    // --- Default state ------------------------------------------------------

    if (defaultState === 'first') {
      var firstLevel = findLevel(1);
      if (firstLevel) {
        var firstItem = firstLevel.querySelector('.ab-split-menu__item--has-children');
        if (firstItem) {
          activateSubmenu(firstItem, 1);
        }
      }
    }
  }

  // --- Bootstrap ------------------------------------------------------------

  /**
   * Initialise all Split Menu instances on the page.
   */
  function initAll() {
    var menus = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < menus.length; i++) {
      initSplitMenu(menus[i]);
    }
  }

  /**
   * Bricks $scripts integration.
   *
   * Bricks calls window.abSplitMenu(element) for each element instance
   * after rendering. The element may be the parent Split Menu or a child
   * Menu Level — either way we (re-)initialise the parent.
   *
   * @param {HTMLElement} [element] The rendered element node.
   */
  window.abSplitMenu = function (element) {
    if (!element) {
      initAll();
      return;
    }

    // If called on a child Menu Level, find the parent Split Menu
    var menu = element.closest(SELECTOR);
    if (menu) {
      initSplitMenu(menu);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
