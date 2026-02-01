# Bricks Builder Integration Notes

Technical notes for integrating with Bricks Builder's internal state and APIs.

## Accessing Bricks Data

### Static Data (`window.bricksData`)

The `bricksData` object contains static configuration and page data:

```javascript
// Page elements (flat array with parent/children references)
bricksData.loadData.content

// Global CSS classes (id -> name mapping)
bricksData.loadData.globalClasses

// Page settings
bricksData.loadData.pageSettings

// Available keys in loadData:
// breakpoints, permissions, themeStyles, colorPalette, globalVariables,
// globalClasses, globalClassesCategories, pseudoClasses, globalSettings,
// content, templateType, elementsHtml, etc.
```

**Important:** `bricksData.elements` is NOT the page elements - it's element type definitions/schemas (e.g., `{container: {...}, section: {...}, heading: {...}}`).

### Vue State (Active Element)

Bricks uses Vue.js. To access reactive state (like the currently selected element):

```javascript
// Get Vue state
const vueState = document.querySelector('.brx-body')
    .__vue_app__
    .config
    .globalProperties
    .$_state;

// Currently selected element
vueState.activeElement          // { id: "abc123", name: "block", ... }
vueState.activeElement.id       // Element ID
vueState.activeElement.cid      // Component ID (if element is inside a component)

// Multiple selected elements (bulk edit)
vueState.selectedElements       // Array of selected elements

// Other useful state
vueState.activePanel            // Current panel: "element", "class", etc.
vueState.activeClass            // Currently active global class
vueState.globalClasses          // All global classes
vueState.breakpointActive       // Current responsive breakpoint
vueState.pseudoClassActive      // Active pseudo-class (:hover, :focus, etc.)
```

### Vue Global Properties (Helper Methods)

```javascript
const vueGlobalProp = document.querySelector('.brx-body')
    .__vue_app__
    .config
    .globalProperties;

// Get element object by ID (with fallback for older Bricks versions)
// $_getElementObject exists in newer versions
// $_getDynamicElementById is the fallback for older versions
function getElementObject(id) {
    if (typeof vueGlobalProp.$_getElementObject === 'function') {
        return vueGlobalProp.$_getElementObject(id);
    }
    if (typeof vueGlobalProp.$_getDynamicElementById === 'function') {
        const el = vueGlobalProp.$_getDynamicElementById(id);
        // If element is in a component, get component element instead
        if (el?.cid) {
            return vueGlobalProp.$_getComponentElementById(el.cid);
        }
        return el;
    }
    return null;
}

// Get component element
vueGlobalProp.$_getComponentElementById(componentId)

// Get global class data
vueGlobalProp.$_getGlobalClass(classId)

// Generate unique ID
vueGlobalProp.$_generateId()

// Show UI message
vueGlobalProp.$_showMessage(message)

// Check if mobile-first mode
vueGlobalProp.$_isMobileFirst._value
```

## Element Structure

Elements in `bricksData.loadData.content` are stored as a flat array:

```javascript
{
    id: "abc123",           // Unique element ID
    name: "block",          // Element type (block, heading, text, etc.)
    parent: "xyz789",       // Parent element ID (0 for root)
    children: ["def456"],   // Array of child element IDs
    label: "Card",          // Custom label (optional)
    settings: {
        _cssGlobalClasses: ["classId1", "classId2"],  // Global class IDs (not names!)
        _cssId: "my-custom-id",                        // Custom CSS ID
        _cssCustom: "...",                             // Custom CSS
        text: "...",                                   // Element content
        tag: "div",                                    // HTML tag
        // ... other element-specific settings
    }
}
```

## Global Classes

Global classes use ID references, not names directly:

```javascript
// Element has class IDs
element.settings._cssGlobalClasses = ["certko", "ywyfdl"]

// Map IDs to names via globalClasses
bricksData.loadData.globalClasses = [
    { id: "certko", name: "card", settings: {} },
    { id: "ywyfdl", name: "card__header", settings: {} },
    // ...
]
```

To resolve class names:

```javascript
function getClassNames(element) {
    const classIds = element.settings?._cssGlobalClasses || [];
    const globalClasses = bricksData.loadData.globalClasses || [];

    return classIds.map(id =>
        globalClasses.find(gc => gc.id === id)?.name
    ).filter(Boolean);
}
```

## Element Traversal

To traverse element hierarchy:

```javascript
function collectDescendants(elementId, elementMap) {
    const element = elementMap.get(elementId);
    if (!element?.children) return [];

    const descendants = [];
    for (const childId of element.children) {
        descendants.push(childId);
        descendants.push(...collectDescendants(childId, elementMap));
    }
    return descendants;
}

// Build element map for quick lookup
const elementMap = new Map();
for (const el of bricksData.loadData.content) {
    elementMap.set(el.id, el);
}
```

## Preview Iframe

The Bricks preview canvas is in an iframe:

```javascript
const iframe = document.querySelector('#bricks-builder-iframe');
const iframeDoc = iframe?.contentDocument;

// Find element in preview by ID
const previewElement = iframeDoc.querySelector(`[data-id="${elementId}"]`);
```

## Component Elements

When an element is inside a Bricks component, it has a `cid` property:

```javascript
if (vueState.activeElement?.cid) {
    // Element is inside a component
    const componentElement = vueGlobalProp.$_getComponentElementById(
        vueState.activeElement.cid
    );
}
```

## CSS Selectors

Bricks generates CSS selectors based on element configuration:

```javascript
// Default selector uses element ID
`.brxe-${element.id}`

// With custom CSS ID
`#${element.settings._cssId}`

// With global class
`.${globalClassName}`
```

## Useful Patterns

### Check if Element is Active

```javascript
function isElementActive() {
    const vueState = getBricksVueState();
    return typeof vueState?.activeElement === 'object'
        && vueState.activeElement?.id;
}
```

### Check if Class is Active (vs Element)

```javascript
function isClassActive() {
    const vueState = getBricksVueState();
    return vueState?.activePanel === 'class'
        && typeof vueState?.activeClass === 'object';
}
```

### Get Final Active Object (Element or Class)

```javascript
function getActiveObject() {
    const vueState = getBricksVueState();
    const vueGlobalProp = getVueGlobalProp();

    // Check if class is active
    if (isClassActive()) {
        return vueState.globalClasses.find(
            gc => gc.id === vueState.activeClass.id
        );
    }

    // Check if component element
    if (vueState.activeElement?.cid) {
        return vueGlobalProp.$_getComponentElementById(
            vueState.activeElement.cid
        );
    }

    // Regular element
    if (vueState.activeElement?.id) {
        return vueGlobalProp.$_getElementObject(
            vueState.activeElement.id
        );
    }

    return null;
}
```

## Element Creation & Clipboard Operations

### Vue Global Methods for Elements

```javascript
const props = document.querySelector('.brx-body')
    .__vue_app__
    .config
    .globalProperties;

// Create a new element object (does not add to page)
const element = props.$_createElement({ name: 'heading' });

// Add element to page (after currently selected element)
// shiftKey: true = add as child of selected, false = add as sibling
props.$_addNewElement(
    { element },
    { shiftKey: false },
    true  // flag (always true)
);

// Set active/selected element
props.$_setActiveElement(element);

// Delete an element - takes FULL element object, not just ID
// Signature: function(e) { vm.userHasPermission("delete_elements") && vm.deleteElement(e) }
props.$_deleteElement(elementObject);
```

### Clipboard Operations (Copy/Paste)

Bricks has its own internal clipboard separate from the system clipboard:

```javascript
// Write elements to Bricks internal clipboard
// source: the clipboard key (e.g., "bricksCopiedElements")
// content: array of BricksElement objects
await props.$_writeToClipboard('bricksCopiedElements', elementsArray);

// Read from Bricks internal clipboard
const data = await props.$_readFromClipboard('bricksCopiedElements');

// Paste from Bricks clipboard (inserts after selected element)
// This reads from internal clipboard, NOT system clipboard
props.$_pasteElements();

// Copy selected elements to clipboard
props.$_copyElements(['elementId1', 'elementId2']);
```

### Bricks Clipboard Format

When copying elements, Bricks uses this JSON structure:

```javascript
{
    content: [
        {
            id: "abcdef",
            name: "heading",
            parent: 0,           // 0 = root level, or parent element ID
            children: [],
            settings: { text: "Hello", tag: "h2" }
        },
        // ... more elements
    ],
    source: "bricksCopiedElements",
    sourceUrl: "https://example.com/page",
    version: "2.1.4"  // Bricks version
}
```

**Important:** When using `$_writeToClipboard`, pass only the `content` array - it builds the wrapper object internally:

```javascript
// CORRECT - pass key and content array separately
await props.$_writeToClipboard('bricksCopiedElements', clipboardData.content);

// WRONG - don't pass the full object
await props.$_writeToClipboard('bricksCopiedElements', fullClipboardObject);
```

### Element ID Generation

```javascript
// Bricks IDs are 6 random lowercase letters
function generateBricksId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
```

## Custom Tags (HTML Tag Override)

Bricks elements have a default HTML tag, but can be overridden with custom tags:

```javascript
// Default: element renders as its default tag (e.g., heading = h2, div = div)
element.settings = { text: "Title" };

// Override with standard tag options
element.settings = {
    text: "Title",
    tag: "h3"  // Use h3 instead of default h2
};

// Override with ANY custom tag (dl, dt, dd, article, etc.)
element.settings = {
    text: "Term",
    tag: "custom",           // Must be "custom" to enable customTag
    customTag: "dt"          // The actual HTML tag to use
};
```

This allows creating semantic HTML like definition lists:

```javascript
// <dl> container
{ name: "div", settings: { tag: "custom", customTag: "dl" } }

// <dt> term (as heading)
{ name: "heading", settings: { text: "Term", tag: "custom", customTag: "dt" } }

// <dd> description (as text-basic)
{ name: "text-basic", settings: { text: "Description", tag: "custom", customTag: "dd" } }
```

## Element Labels

Elements can have custom labels shown in the Structure panel. The label is a **top-level property** on the element object, NOT inside settings:

```javascript
// CORRECT - label at top level
element.label = "Hero Title";  // Shows "Hero Title" instead of "Heading"

// WRONG - settings._label does NOT work
element.settings._label = "Hero Title";  // This will be ignored
```

When generating HTML for Bricks conversion, use `data-el-label` attributes:

```html
<h2 class="brxe-heading" data-el-label="title">Title</h2>
<p class="brxe-text-basic" data-el-label="description">Description</p>
```

These labels are used for:
- Better organization in Structure panel
- BEM class naming (e.g., `block__title`, `block__description`)

## CSS Variables

The Bricks Builder editor uses CSS custom properties for theming. When styling custom UI elements inside the Bricks editor (not the preview iframe), use these variables to match the Bricks design:

### Background Colors

```css
--builder-bg-1           /* Darkest background */
--builder-bg-2           /* Secondary background */
--builder-bg-3           /* Tertiary background */
--builder-bg-4           /* Lightest background */
```

### Text Colors

```css
--builder-color          /* Primary text */
--builder-color-2        /* Secondary text (muted) */
--builder-color-dark     /* Dark text (for light backgrounds) */
--builder-color-light    /* Light text (for dark backgrounds) */
```

### Accent & State Colors

```css
--builder-color-accent      /* Primary accent color (orange) */
--builder-color-success     /* Success state */
--builder-color-warning     /* Warning state */
--builder-color-danger      /* Error/danger state */
--builder-color-info        /* Info state */
```

### Control Colors

```css
--builder-control-bg        /* Form control background */
--builder-control-color     /* Form control text color */
```

### Example Usage

```css
/* Custom button in Bricks editor */
.my-custom-button {
    background: var(--builder-bg-3);
    color: var(--builder-color);
    border: none;
    border-radius: 3px;
    padding: 6px 10px;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
}

.my-custom-button:hover {
    background: var(--builder-color-accent);
    color: white;
}

/* Error state */
.my-custom-button.error {
    background: var(--builder-color-danger);
    color: white;
}
```

## Creating and Applying Global Classes

To programmatically create a global class and apply it to an element, you must modify the reactive Vue state directly.

### CRITICAL: Access Vue State from Main Document

**Important:** Access `.brx-body` from the **main document**, NOT the iframe. The main document controls the builder state:

```javascript
// CORRECT - main document first (like Advanced Themer does)
const vueState = document.querySelector('.brx-body')
    .__vue_app__
    .config
    .globalProperties
    .$_state;

// WRONG - iframe may have a different/disconnected Vue instance
const iframe = document.querySelector('#bricks-builder-iframe');
const vueState = iframe.contentDocument.querySelector('.brx-body')
    .__vue_app__  // Different Vue app instance!
    ...
```

### Creating a Global Class

```javascript
const vueState = getVueState();
const vueGlobalProp = getVueGlobalProp();

// Generate unique ID (6 lowercase letters)
const classId = vueGlobalProp.$_generateId();

// Add to reactive globalClasses array
vueState.globalClasses.push({
    id: classId,
    name: 'my-class-name',
    settings: {},
});
```

### Applying Global Class to Element

```javascript
// Get the element object (must be the reactive reference)
const element = vueGlobalProp.$_getDynamicElementById(elementId);

// AT pattern: Set as activeElement first, then modify
vueState.activeElement = element;

// Now modify activeElement.settings directly
if (!vueState.activeElement.settings._cssGlobalClasses) {
    vueState.activeElement.settings._cssGlobalClasses = [];
}
vueState.activeElement.settings._cssGlobalClasses.push(classId);

// Trigger UI re-render
vueState.rerenderControls = Date.now();
```

### Selecting/Reselecting an Element

```javascript
const vueGlobalProp = getVueGlobalProp();
const element = vueGlobalProp.$_getDynamicElementById(elementId);

// Set as active element (updates UI selection)
vueGlobalProp.$_setActiveElement(element);
```

### Check for Trashed Classes

Before creating a class, check if it exists in the trash:

```javascript
const isTrashed = vueState.globalClassesTrash?.some(
    gc => gc.name === 'my-class-name'
);

if (isTrashed) {
    // Class is in trash - user must restore or delete it first
    console.warn('Class exists in trash');
}
```

## CodeMirror Editors

Bricks uses CodeMirror 5 for code editing (Custom CSS, Custom JS, Code element, etc.). Important behavior to note:

### DOM Recreation

**Bricks recreates CodeMirror DOM elements when the user switches between elements or panels.** This means:

- Element references captured during initialization become stale
- The original `.CodeMirror` DOM node is removed and a new one is created
- The new CodeMirror instance has a different `element.CodeMirror` object

### Finding the Current Editor

When adding UI that interacts with CodeMirror (e.g., toolbar buttons), **always traverse the DOM to find the current CodeMirror instance** rather than using cached references:

```javascript
// BAD - cached reference becomes stale
const editor = element.CodeMirror;  // May be empty/disconnected

// GOOD - traverse DOM from the button's context
btn.addEventListener('click', () => {
    const actionsBar = btn.closest('.actions');
    const controlCode = actionsBar?.closest('.control-code');
    const cmWrapper = controlCode?.querySelector('.CodeMirror');
    const editor = cmWrapper?.CodeMirror;  // Current active editor

    if (editor) {
        const content = editor.getValue();  // Now has actual content
    }
});
```

### CodeMirror Structure in Bricks

```
.control-code
├── .actions              ← Toolbar (copy, expand buttons)
└── .codemirror-wrapper
    └── .CodeMirror       ← The CodeMirror instance (element.CodeMirror)
```

### Accessing CodeMirror Instance

```javascript
const cmElement = document.querySelector('.CodeMirror');

// Method 1: Direct property
const editor = cmElement.CodeMirror;

// Method 2: Via Vue (less common)
const vueEl = cmElement.__vue__;
const editor = vueEl?.codemirror || vueEl?.cm || vueEl?.editor;
```

## Notes

- Always check for undefined/null when accessing nested properties
- Vue state is reactive - values update automatically when selection changes
- The `__vue_app__` property is Vue 3 specific (Vue 2 used `__vue__`)
- Element IDs are alphanumeric strings (e.g., "ztdadf", "abc123")
- Class IDs are also alphanumeric, separate from class names
- When adding elements programmatically, use `$_writeToClipboard` + `$_pasteElements` for proper Structure panel integration
- Direct element creation with `$_addNewElement` may not always update the Structure panel correctly
- Focus the iframe before clipboard operations to avoid "Document not focused" errors
- **Vue state must be accessed from main document, not iframe** - the iframe may have a disconnected Vue instance
- **CodeMirror elements are recreated on panel/element switches** - don't cache element references
