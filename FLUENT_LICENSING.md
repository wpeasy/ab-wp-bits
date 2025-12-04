# Licensing Implementation - FluentCart Integration

**Reference:** https://github.com/WPManageNinja/fluent-plugin-updater-example

Implement licensing using the FluentCart License activation and automatic updater system.

---

## Licensing Behavior Overview

### Local/Development Sites
- **No license required** - plugin operates with full functionality
- Automatic detection via domain/IP checks (see "Local/Dev Site Detection" section)
- No API calls to FluentCart
- Updates are disabled (local development doesn't need remote updates)

### Production Sites Without License
- **Plugin continues to work** with current settings
- **Settings are READ-ONLY** - configuration cannot be changed
- **Updates are disabled** - do update checks, but do not allow updates to install
- Separate license activation page shown
- Clear visual indicators showing read-only state and license requirement

### Production Sites With Valid License
- Full functionality
- Settings are editable
- Updates enabled

### Expired/Disabled/Refunded Licenses
- **7-day grace period** after expiration
- After grace period, behaves same as unlicensed:
  - Plugin continues to work with current settings
  - Settings become read-only
  - Updates disabled
  - Renewal notice shown

---

## Setup Instructions

### 1. Read Plugin Configuration from WP_PLUGIN.md
### 2. Read PHP Conventions from CLAUDE.md

**IMPORTANT:** Before implementing licensing, extract these values from the `CLAUDE.md` file in the plugin root:

- **Plugin Name:** Look for "Plugin Name:" in WP_PLUGIN.md
- **Namespace:** Look for "Namespace:" (e.g., `WP_Easy\RoleManager`)
- **Constants Prefix:** Look for "Constants Prefix:" (e.g., `WPE_RM_`)
- **Text Domain:** Look for "Text Domain:" (e.g., `wp-easy-role-manager`)
- **Main Plugin File:** Look for the main plugin file name (usually matches text domain with `.php`)

**Derive from these values:**
- **License Constant Prefix:** Use the Constants Prefix + `LICENSE_` (e.g., `WPE_RM_LICENSE_`)
- **License Settings Key:** Use text domain with underscores + `_license_settings` (e.g., `wpe_rm_license_settings`)
- **License Slug:** Use text domain as-is (e.g., `wpe-role-manager`)
- **Licensing Namespace:** Append `\Licensing` to the main namespace (e.g., `WP_Easy\RoleManager\Licensing`)

---

## Configuration Parameters

**IMPORTANT:** All licensing/updater settings must be defined as global constants in the main plugin file. This centralizes configuration and makes it easy to update values in one location.

### Required Constants (Define in main plugin file)

```php
// Licensing Configuration Constants
define('{PREFIX}LICENSE_ITEM_ID', '[PENDING]'); // Get from FluentCart product page
define('{PREFIX}LICENSE_API_URL', 'https://alanblair.co/');
define('{PREFIX}LICENSE_SLUG', '{text-domain}');
define('{PREFIX}LICENSE_SETTINGS_KEY', '{text_domain_with_underscores}_license_settings');
```

**Replace placeholders:**
- `{PREFIX}` = Constants Prefix from CLAUDE.md + `LICENSE_` (e.g., `WPE_RM_LICENSE_`)
- `{text-domain}` = Text Domain from CLAUDE.md (e.g., `wpe-role-manager`)
- `{text_domain_with_underscores}` = Text Domain with hyphens replaced by underscores (e.g., `wpe_rm`)

### Optional Constants (Define in main plugin file)

```php
// Optional Licensing Settings
define('{PREFIX}LICENSE_MENU_TYPE', 'submenu'); // submenu, options, or menu
define('{PREFIX}LICENSE_MENU_TITLE', 'License');
define('{PREFIX}LICENSE_PAGE_TITLE', '{Plugin Name} - License');
define('{PREFIX}LICENSE_PURCHASE_URL', 'https://wpeasy.au/{slug}/');
define('{PREFIX}LICENSE_ACCOUNT_URL', 'https://alanblair.co/my-account/');
define('{PREFIX}LICENSE_GRACE_PERIOD_DAYS', 7); // Days after expiration before read-only
```

**Replace placeholders:**
- `{PREFIX}` = Constants Prefix + `LICENSE_`
- `{Plugin Name}` = Plugin Name from CLAUDE.md
- `{slug}` = License slug (text domain without hyphens, e.g., `role-manager`)

### Constants Reference

- **{PREFIX}LICENSE_ITEM_ID**: Product ID from FluentCart (required)
- **{PREFIX}LICENSE_API_URL**: WordPress site URL hosting FluentCart (required)
- **{PREFIX}LICENSE_SLUG**: Plugin slug for identification (required)
- **{PREFIX}LICENSE_SETTINGS_KEY**: WordPress option key for storing license data (required)
- **{PREFIX}LICENSE_MENU_TYPE**: Where to add license page (`submenu`, `options`, `menu`)
- **{PREFIX}LICENSE_MENU_TITLE**: Label for license menu item
- **{PREFIX}LICENSE_PAGE_TITLE**: Browser title for license page
- **{PREFIX}LICENSE_PURCHASE_URL**: Link to purchase license
- **{PREFIX}LICENSE_ACCOUNT_URL**: Link to manage existing licenses
- **{PREFIX}LICENSE_GRACE_PERIOD_DAYS**: Days after license expiration before entering read-only mode

---

## Implementation Checklist

### 1. File Structure (PSR-4 Compliant)

```
/src/Licensing/
  - FluentLicensing.php
  - LicenseSettings.php
  - PluginUpdater.php
```

**Namespace:** `{Namespace}\Licensing` (from CLAUDE.md namespace + `\Licensing`)
**Autoloading:** PSR-4 via composer.json
**No manual requires needed** - classes are autoloaded by composer

**Download Instructions:**
1. Download the example files from https://github.com/WPManageNinja/fluent-plugin-updater-example
2. **IMPORTANT:** Place all downloaded licensing files under `/src/Licensing/` to maintain PSR-4 namespacing
3. Update the namespace in each downloaded file from the example namespace to `{Namespace}\Licensing`
4. Ensure composer.json has PSR-4 autoloading configured for your namespace:
   ```json
   "autoload": {
       "psr-4": {
           "{Namespace}\\": "src/"
       }
   }
   ```
5. Run `composer dump-autoload` after adding the files

### 2. Define Constants (in main plugin file)

Add licensing constants after existing plugin constants:

```php
// Define plugin constants (existing)
define('{PREFIX}VERSION', '1.0.0');
define('{PREFIX}PLUGIN_FILE', __FILE__);
define('{PREFIX}PLUGIN_PATH', plugin_dir_path(__FILE__));
define('{PREFIX}PLUGIN_URL', plugin_dir_url(__FILE__));
define('{PREFIX}TEXTDOMAIN', '{text-domain}');
// ... other existing constants ...

// Licensing Configuration Constants (add these)
define('{PREFIX}LICENSE_ITEM_ID', '[PENDING]'); // TODO: Get from FluentCart
define('{PREFIX}LICENSE_API_URL', 'https://alanblair.co/');
define('{PREFIX}LICENSE_SLUG', '{text-domain}');
define('{PREFIX}LICENSE_SETTINGS_KEY', '{text_domain_with_underscores}_license_settings');
define('{PREFIX}LICENSE_MENU_TYPE', 'submenu');
define('{PREFIX}LICENSE_MENU_TITLE', 'License');
define('{PREFIX}LICENSE_PAGE_TITLE', '{Plugin Name} - License');
define('{PREFIX}LICENSE_PURCHASE_URL', 'https://wpeasy.au/{slug}/');
define('{PREFIX}LICENSE_ACCOUNT_URL', 'https://alanblair.co/my-account/');
define('{PREFIX}LICENSE_GRACE_PERIOD_DAYS', 7);
```

**Replace all placeholders with actual values from CLAUDE.md**

### 3. Initialize Licensing (in main plugin file)

Add licensing initialization using the defined constants (PSR-4 autoloads the classes):

```php
// Initialize licensing on 'init' hook
add_action('init', function() {
    // Skip licensing entirely on local/dev sites
    if (is_local_dev_site()) {
        return; // No licensing required
    }

    // Check if licensing class exists (PSR-4 autoloaded from src/Licensing/)
    if (!class_exists('{Namespace}\\Licensing\\FluentLicensing')) {
        return; // Licensing files not installed
    }

    $licensing = {Namespace}\Licensing\FluentLicensing::getInstance();
    $licensing->register([
        'version' => {PREFIX}VERSION,
        'item_id' => {PREFIX}LICENSE_ITEM_ID,
        'basename' => plugin_basename(__FILE__),
        'api_url' => {PREFIX}LICENSE_API_URL,
        'slug' => {PREFIX}LICENSE_SLUG,
        'settings_key' => {PREFIX}LICENSE_SETTINGS_KEY,
    ]);

    // Initialize settings page if LicenseSettings class exists
    if (class_exists('{Namespace}\\Licensing\\LicenseSettings')) {
        $licenseSettings = new {Namespace}\Licensing\LicenseSettings();
        $licenseSettings->register($licensing, [
            'menu_title' => {PREFIX}LICENSE_MENU_TITLE,
            'page_title' => {PREFIX}LICENSE_PAGE_TITLE,
            'title' => {PREFIX}LICENSE_PAGE_TITLE,
            'purchase_url' => {PREFIX}LICENSE_PURCHASE_URL,
            'account_url' => {PREFIX}LICENSE_ACCOUNT_URL,
            'plugin_name' => '{Plugin Name}',
        ]);

        // Add the license page as submenu
        $licenseSettings->addPage([
            'type' => {PREFIX}LICENSE_MENU_TYPE,
            'page_title' => {PREFIX}LICENSE_PAGE_TITLE,
            'menu_title' => {PREFIX}LICENSE_MENU_TITLE,
            'parent_slug' => '{main-menu-slug}', // Use the main admin menu slug
            'capability' => 'manage_options',
        ]);
    }
});
```

**Replace placeholders:**
- `{Namespace}` = Full namespace from CLAUDE.md (with backslashes escaped if in string context)
- `{PREFIX}` = Constants Prefix from CLAUDE.md
- `{Plugin Name}` = Plugin Name from CLAUDE.md
- `{main-menu-slug}` = Main admin menu slug (usually text domain)

### 4. Access Control Logic

```php
// Helper function to check if settings should be read-only
function is_settings_readonly() {
    // Never read-only on local/dev sites
    if (is_local_dev_site()) {
        return false;
    }

    $licensing = {Namespace}\Licensing\FluentLicensing::getInstance();
    $status = $licensing->getStatus(); // Local check (fast)

    // Check if license is valid or within grace period
    if ($status->status === 'valid') {
        return false; // Settings are editable
    }

    if ($status->status === 'invalid' || $status->status === 'expired') {
        // Check grace period
        $grace_days = defined('{PREFIX}LICENSE_GRACE_PERIOD_DAYS')
            ? {PREFIX}LICENSE_GRACE_PERIOD_DAYS
            : 7;

        $expired_date = $status->expires ?? null;
        if ($expired_date) {
            $days_since_expiry = (time() - strtotime($expired_date)) / DAY_IN_SECONDS;
            if ($days_since_expiry <= $grace_days) {
                return false; // Still within grace period
            }
        }
    }

    return true; // Settings are read-only
}

// Example: Checking before saving settings
add_action('admin_init', function() {
    if (is_settings_readonly() && isset($_POST['save_settings'])) {
        wp_die(
            __('Settings cannot be modified without an active license.', '{text-domain}'),
            __('License Required', '{text-domain}'),
            ['back_link' => true]
        );
    }
});
```

### 5. Status Checking Strategy

- **On Admin Load**: Use `getStatus()` for fast local verification
- **Daily Cron**: Use `getStatus(true)` for remote server validation
- **Update Checks**: Completely disabled when license is not valid
- **Handle Status Values**:
  - `valid` → Full plugin access, updates enabled, settings editable
  - `invalid` → Read-only after grace period, no updates
  - `expired` → Show renewal notice, grace period countdown, then read-only + no updates
  - `disabled` → Read-only, no updates (same as unlicensed)
  - `unregistered` → Read-only, no updates, show activation form
  - `error` → Show error + allow retry

### 6. Update Check Disabling

```php
// Disable updates when unlicensed
add_filter('pre_set_site_transient_update_plugins', function($transient) {
    // Allow updates on local/dev sites or with valid license
    if (is_local_dev_site()) {
        return $transient;
    }

    $licensing = {Namespace}\Licensing\FluentLicensing::getInstance();
    $status = $licensing->getStatus();

    if ($status->status !== 'valid') {
        // Remove this plugin from update checks
        $plugin_basename = plugin_basename({PREFIX}PLUGIN_FILE);
        if (isset($transient->response[$plugin_basename])) {
            unset($transient->response[$plugin_basename]);
        }
    }

    return $transient;
});
```

### 7. Error Handling Pattern

```php
$result = $licensing->activate($license_key);

if (is_wp_error($result)) {
    // Handle error
    $error_message = $result->get_error_message();
    display_error_notice($error_message);
} else {
    // Success
    $license_data = $result;
    display_success_notice();
}
```

---

## Local/Dev Site Detection

### Detection Methods

Automatically detect local/development sites to bypass licensing:
- Domain: `localhost`, `.local`, `.test`, `.dev`, `.invalid`
- IP addresses: `127.0.0.1`, `::1`, `10.*.*.*`, `192.168.*.*`, `172.16-31.*.*`
- URLs containing: `staging`, `dev`, `development`
- WordPress constants: `WP_LOCAL_DEV === true`

### Implementation

```php
function is_local_dev_site() {
    $url = get_site_url();
    $host = parse_url($url, PHP_URL_HOST);

    if (!$host) {
        return false;
    }

    // Check TLDs
    $local_tlds = ['.local', '.test', '.dev', '.invalid', '.localhost'];
    foreach ($local_tlds as $tld) {
        if (str_ends_with($host, $tld)) {
            return true;
        }
    }

    // Check for localhost
    if ($host === 'localhost') {
        return true;
    }

    // Check IP ranges (private/reserved IPs)
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
            return true;
        }
        // Check for IPv6 localhost
        if ($host === '::1') {
            return true;
        }
    }

    // Check keywords in URL
    $dev_keywords = ['staging', 'dev', 'development'];
    foreach ($dev_keywords as $keyword) {
        if (stripos($url, $keyword) !== false) {
            return true;
        }
    }

    // Check WP constant
    if (defined('WP_LOCAL_DEV') && WP_LOCAL_DEV) {
        return true;
    }

    return false;
}
```

---

## UI/UX Requirements

### License Not Active State (Production Sites)

**Plugin Functionality:**
- **Allow:** Plugin continues to operate with current settings
- **Block:** Changing/editing any settings (read-only mode)
- **Block:** Plugin updates

**Settings Pages:**
- **Show:** All settings pages and current configuration (visible but disabled)
- **Show:** Prominent notice at top of each settings page explaining read-only state
- **Show:** Visual indicators on all form fields (disabled state, lock icons)
- **Show:** Call-to-action button "Activate License" or "Purchase License"
- **Disable:** All input fields, buttons, and interactive elements
- **Add:** CSS class `license-readonly` to settings containers for styling

**License Page (Separate):**
- Clean license activation page
- Benefits of activation
- Purchase link with pricing
- "Already have a license?" activation form
- Support link

**Notice Example:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔒 Settings are Read-Only - License Required                │
│                                                              │
│ A valid license is required to modify settings. Your        │
│ plugin continues to work with current configuration.        │
│                                                              │
│ [Purchase License]  [Activate Existing License]             │
└─────────────────────────────────────────────────────────────┘
```

### License Active State

- **Show:** Small "Licensed to: [email/name]" indicator in admin footer or settings
- **Show:** "Manage License" link in plugin settings
- **Show:** License status (active, expires on [date])
- **Allow:** Full plugin functionality
- **Enable:** All settings are editable
- **Enable:** Plugin updates

### License Expired/Disabled State (Within Grace Period)

- **Show:** Prominent renewal notice with urgency
- **Show:** Countdown: "X days remaining until settings become read-only"
- **Show:** Grace period end date
- **Allow:** Full functionality during grace period
- **Enable:** Settings remain editable during grace period
- **Prompt:** Clear renewal call-to-action

**Notice Example:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ License Expired - 5 Days Remaining                       │
│                                                              │
│ Your license expired on Jan 1, 2025. Settings will become   │
│ read-only in 5 days. Renew now to maintain full access.     │
│                                                              │
│ [Renew License]  [Manage License]                           │
└─────────────────────────────────────────────────────────────┘
```

### License Expired/Disabled State (After Grace Period)

- **Show:** Expiration notice
- **Allow:** Plugin continues to work with current settings
- **Block:** Changing/editing any settings (same as unlicensed)
- **Block:** Plugin updates
- **Show:** Same read-only UI as "License Not Active State" above
- **Prompt:** Renewal link and support options

### Local/Development Sites

- **No licensing UI shown**
- **Optional:** Small badge/notice "Development Site - No License Required"
- **Allow:** Full functionality
- **Block:** Updates (not needed on dev sites)

---

## Read-Only Implementation Examples

### Svelte Component (Read-Only State)

```svelte
<script>
    import { onMount } from 'svelte';

    let isReadOnly = $state(false);
    let licenseStatus = $state(null);

    onMount(async () => {
        const response = await fetch('/wp-json/{namespace}/v1/license-status');
        const data = await response.json();
        isReadOnly = data.readonly;
        licenseStatus = data.status;
    });
</script>

{#if isReadOnly}
<div class="notice notice-warning license-readonly-notice">
    <p>
        <strong>🔒 Settings are Read-Only - License Required</strong><br>
        A valid license is required to modify settings. Your plugin continues to work with current configuration.
    </p>
    <p>
        <a href="{licenseStatus.purchase_url}" class="button button-primary">Purchase License</a>
        <a href="{licenseStatus.activate_url}" class="button">Activate Existing License</a>
    </p>
</div>
{/if}

<div class="settings-form" class:readonly={isReadOnly}>
    <label>
        Setting Name
        <input type="text" disabled={isReadOnly} value={settingValue}>
        {#if isReadOnly}
            <span class="lock-icon">🔒</span>
        {/if}
    </label>
</div>
```

### CSS for Read-Only State

```css
.license-readonly-notice {
    border-left: 4px solid #f0ad4e;
    padding: 12px;
    margin: 20px 0;
}

.settings-form.readonly input,
.settings-form.readonly select,
.settings-form.readonly textarea,
.settings-form.readonly button {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
}

.settings-form.readonly .lock-icon {
    margin-left: 8px;
    opacity: 0.5;
}
```

### REST API Endpoint (License Status)

```php
// Register REST route for license status
add_action('rest_api_init', function() {
    register_rest_route('{namespace}/v1', '/license-status', [
        'methods' => 'GET',
        'callback' => function() {
            $is_local = is_local_dev_site();
            $is_readonly = !$is_local && is_settings_readonly();

            $licensing = {Namespace}\Licensing\FluentLicensing::getInstance();
            $status = $licensing->getStatus();

            return [
                'readonly' => $is_readonly,
                'is_local' => $is_local,
                'status' => $status->status ?? 'unregistered',
                'expires' => $status->expires ?? null,
                'grace_days_remaining' => calculate_grace_days_remaining($status),
                'purchase_url' => {PREFIX}LICENSE_PURCHASE_URL,
                'activate_url' => admin_url('admin.php?page={license-page-slug}'),
            ];
        },
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ]);
});
```

---

## Testing Checklist

- [ ] Get item_id from FluentCart product page
- [ ] Test license activation with valid key
- [ ] Test license activation with invalid key
- [ ] Test license deactivation
- [ ] Test local/dev site bypass (all detection methods: .local, .test, localhost, private IPs, staging keyword, WP_LOCAL_DEV)
- [ ] Test expired license with grace period (countdown, functionality during grace)
- [ ] Test expired license after grace period (read-only, no updates)
- [ ] Test disabled/refunded license scenario (same as unlicensed)
- [ ] Test network/API error scenarios
- [ ] Test automatic updates with active license
- [ ] Test update checks disabled without license
- [ ] Verify license status caching and refresh timing
- [ ] Test settings page read-only UI/UX (notices, disabled fields, lock icons)
- [ ] Verify plugin continues working with unlicensed/expired state
- [ ] Test settings save blocking when read-only
- [ ] Verify separate license activation page

---

## Critical Action Items

1. **Read CLAUDE.md:** Extract namespace, prefix, text domain, and plugin name
2. **Download Licensing Files:** Get files from FluentCart example repo and place under `/src/Licensing/` (PSR-4)
3. **Update Namespaces:** Change all downloaded file namespaces to `{Namespace}\Licensing`
4. **Run Composer:** Execute `composer dump-autoload` to register new classes
5. **Define Constants:** Add all `{PREFIX}LICENSE_*` constants to main plugin file after existing constants
6. **Get Item ID:** Contact FluentCart/create product to obtain item ID, then update `{PREFIX}LICENSE_ITEM_ID` constant
7. **Configure API URL:** Verify FluentCart installation URL in `{PREFIX}LICENSE_API_URL` constant
8. **Initialize Licensing:** Add licensing initialization code using the defined constants
9. **Implement Local Detection:** Add `is_local_dev_site()` function with all detection methods
10. **Implement Read-Only Logic:** Add `is_settings_readonly()` function and protect all settings endpoints
11. **Disable Updates:** Filter `pre_set_site_transient_update_plugins` to block updates when unlicensed
12. **Add UI Notices:** Show prominent read-only notices and license activation prompts
13. **Add Visual Indicators:** Disable form fields, add lock icons, apply read-only CSS
14. **Error Handling:** Implement comprehensive WP_Error handling for all licensing methods
15. **Daily Cron:** Set up `wp_schedule_event` for daily remote license validation
16. **Grace Period Logic:** Implement countdown and feature restrictions after grace period

---

## Notes

- **Use constants everywhere:** All licensing configuration must use the `{PREFIX}LICENSE_*` constants defined in the main plugin file. Never hardcode values.
- **Extract from CLAUDE.md first:** Always read plugin configuration from CLAUDE.md before implementing
- **Local/dev sites bypass all licensing:** No API calls, no restrictions on local environments
- **Plugin never stops working:** Licensing only affects settings editing and updates, never core functionality
- **Read-only, not hidden:** Settings pages remain visible but disabled when unlicensed
- License checks should be **fast** - use local `getStatus()` for regular checks
- Remote validation via `getStatus(true)` should run via cron, not on every page load
- Always use `is_wp_error()` before processing results from activate/deactivate/getStatus
- Store license data in WordPress options, not in class properties
- Use singleton pattern: `FluentLicensing::getInstance()` for access throughout plugin
- **Centralized configuration:** All licensing settings are in one place (main plugin file), making updates and maintenance simple
- **No dev override keys:** Local/dev detection is automatic and sufficient

---

## Quick Reference: Placeholder Mapping

| Placeholder | Source | Example |
|------------|--------|---------|
| `{Plugin Name}` | CLAUDE.md "Plugin Name:" | `WP Easy Role Manager` |
| `{Namespace}` | CLAUDE.md "Namespace:" | `WP_Easy\RoleManager` |
| `{PREFIX}` | CLAUDE.md "Constants Prefix:" | `WPE_RM_` |
| `{text-domain}` | CLAUDE.md "Text Domain:" | `wp-easy-role-manager` |
| `{text_domain_with_underscores}` | Text domain with `-` → `_` | `wpe_rm` |
| `{slug}` | Derived from text domain | `role-manager` |
| `{options_prefix}` | Same as text_domain_with_underscores | `wpe_rm` |
| `{main-menu-slug}` | Main admin menu slug | `wpe-role-manager` |
| `{license-page-slug}` | License page slug | `wpe-role-manager-license` |
| `{Licensing Namespace}` | Namespace + `\Licensing` | `WP_Easy\RoleManager\Licensing` |
