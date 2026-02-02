<?php
/**
 * GitHub Updater Service
 *
 * Integrates with WordPress native update system to check for plugin
 * updates from the public GitHub repository.
 *
 * @package AB\AB_WP_Bits
 * @since   0.1.0
 */

declare(strict_types=1);

namespace AB\AB_WP_Bits\Services;

defined('ABSPATH') || exit;

/**
 * Handles automatic plugin updates from GitHub releases.
 */
final class GitHubUpdater {

    /**
     * GitHub repository owner.
     *
     * @var string
     */
    private const GITHUB_OWNER = 'wpeasy';

    /**
     * GitHub repository name.
     *
     * @var string
     */
    private const GITHUB_REPO = 'ab-wp-bits';

    /**
     * GitHub API URL for latest release.
     *
     * @var string
     */
    private const GITHUB_API_URL = 'https://api.github.com/repos/wpeasy/ab-wp-bits/releases/latest';

    /**
     * Transient cache key for release data.
     *
     * @var string
     */
    private const CACHE_KEY = 'ab_wp_bits_github_release';

    /**
     * Cache TTL in seconds (12 hours).
     *
     * @var int
     */
    private const CACHE_TTL = 43200;

    /**
     * Plugin slug.
     *
     * @var string
     */
    private const PLUGIN_SLUG = 'ab-wp-bits';

    /**
     * Plugin basename (folder/file).
     *
     * @var string
     */
    private const PLUGIN_BASENAME = 'ab-wp-bits/ab-wp-bits.php';

    /**
     * Register WordPress hooks for update integration.
     *
     * @return void
     */
    public static function init(): void {
        add_filter('pre_set_site_transient_update_plugins', [self::class, 'check_for_updates']);
        add_filter('plugins_api', [self::class, 'plugin_info'], 10, 3);
        add_filter('upgrader_source_selection', [self::class, 'fix_directory_name'], 10, 4);
        add_action('upgrader_process_complete', [self::class, 'after_update'], 10, 2);
    }

    /**
     * Check GitHub for a newer release and inject into the update transient.
     *
     * @param object $transient The update_plugins transient data.
     * @return object Modified transient data.
     */
    public static function check_for_updates(object $transient): object {
        if (empty($transient->checked)) {
            return $transient;
        }

        $release = self::get_cached_release();
        if ($release === null) {
            return $transient;
        }

        $remote_version = self::normalize_version($release['tag_name'] ?? '');
        if (empty($remote_version)) {
            return $transient;
        }

        $current_version = AB_WP_BITS_VERSION;

        if (version_compare($remote_version, $current_version, '>')) {
            $download_url = self::get_zip_download_url($release);
            if ($download_url === null) {
                return $transient;
            }

            $transient->response[self::PLUGIN_BASENAME] = (object) [
                'slug'         => self::PLUGIN_SLUG,
                'plugin'       => self::PLUGIN_BASENAME,
                'new_version'  => $remote_version,
                'package'      => $download_url,
                'url'          => 'https://github.com/' . self::GITHUB_OWNER . '/' . self::GITHUB_REPO,
                'tested'       => '6.9',
                'requires_php' => '7.4',
                'icons'        => [],
            ];
        } else {
            // Report that no update is available (shows "up to date" on plugins page)
            $transient->no_update[self::PLUGIN_BASENAME] = (object) [
                'slug'        => self::PLUGIN_SLUG,
                'plugin'      => self::PLUGIN_BASENAME,
                'new_version' => $current_version,
                'url'         => 'https://github.com/' . self::GITHUB_OWNER . '/' . self::GITHUB_REPO,
            ];
        }

        return $transient;
    }

    /**
     * Provide plugin information for the "View details" popup.
     *
     * @param false|object|\WP_Error $result The result object or false.
     * @param string                 $action The API action (e.g., 'plugin_information').
     * @param object                 $args   Plugin API arguments.
     * @return false|object|\WP_Error Plugin info object or passthrough.
     */
    public static function plugin_info(false|object|\WP_Error $result, string $action, object $args): false|object|\WP_Error {
        if ($action !== 'plugin_information' || ($args->slug ?? '') !== self::PLUGIN_SLUG) {
            return $result;
        }

        $release = self::get_cached_release();
        if ($release === null) {
            return $result;
        }

        $remote_version = self::normalize_version($release['tag_name'] ?? '');
        $download_url   = self::get_zip_download_url($release);

        // Convert markdown release body to basic HTML for display
        $changelog = $release['body'] ?? '';
        $changelog = esc_html($changelog);
        $changelog = nl2br($changelog);

        return (object) [
            'name'          => "Alan Blair's WP Bits",
            'slug'          => self::PLUGIN_SLUG,
            'version'       => $remote_version,
            'author'        => '<a href="https://alanblair.co">Alan Blair</a>',
            'homepage'      => 'https://github.com/' . self::GITHUB_OWNER . '/' . self::GITHUB_REPO,
            'requires'      => '6.0',
            'requires_php'  => '7.4',
            'tested'        => '6.9',
            'download_link' => $download_url,
            'trunk'         => $download_url,
            'sections'      => [
                'description' => 'A collection of modular enhancements for WordPress with tab-based admin dashboard.',
                'changelog'   => $changelog ?: 'No changelog available for this release.',
            ],
            'banners'       => [],
        ];
    }

    /**
     * Fix the extracted directory name after download.
     *
     * GitHub ZIPs extract to a directory like `ab-wp-bits-v0.0.9-beta/` or
     * `ab-wp-bits-0.0.9-beta/`. WordPress expects `ab-wp-bits/`.
     *
     * @param string       $source        Path to the extracted source directory.
     * @param string       $remote_source Path to the remote source (parent of $source).
     * @param \WP_Upgrader $upgrader      WP_Upgrader instance.
     * @param array        $hook_extra    Extra arguments passed to the upgrader.
     * @return string|\WP_Error Corrected source path or WP_Error on failure.
     */
    public static function fix_directory_name(string $source, string $remote_source, \WP_Upgrader $upgrader, array $hook_extra): string|\WP_Error {
        // Only act on our plugin
        if (!isset($hook_extra['plugin']) || $hook_extra['plugin'] !== self::PLUGIN_BASENAME) {
            return $source;
        }

        global $wp_filesystem;

        $expected_dir = trailingslashit($remote_source) . self::PLUGIN_SLUG . '/';

        // If the source already matches, no fix needed
        if (trailingslashit($source) === $expected_dir) {
            return $source;
        }

        // Rename the extracted directory to the expected slug
        if ($wp_filesystem->move($source, $expected_dir, true)) {
            return $expected_dir;
        }

        return new \WP_Error(
            'rename_failed',
            __('Unable to rename the update directory.', 'ab-wp-bits')
        );
    }

    /**
     * Clear the cached release data after a successful update.
     *
     * @param \WP_Upgrader $upgrader WP_Upgrader instance.
     * @param array        $options  Update options including type and plugins.
     * @return void
     */
    public static function after_update(\WP_Upgrader $upgrader, array $options): void {
        if (
            ($options['action'] ?? '') === 'update'
            && ($options['type'] ?? '') === 'plugin'
            && isset($options['plugins'])
            && is_array($options['plugins'])
            && in_array(self::PLUGIN_BASENAME, $options['plugins'], true)
        ) {
            delete_transient(self::CACHE_KEY);
        }
    }

    /**
     * Get release data from cache or fetch fresh from GitHub.
     *
     * @return array|null Release data array or null on failure.
     */
    private static function get_cached_release(): ?array {
        $cached = get_transient(self::CACHE_KEY);

        if (is_array($cached) && !empty($cached)) {
            return $cached;
        }

        $release = self::fetch_latest_release();
        if ($release === null) {
            return null;
        }

        set_transient(self::CACHE_KEY, $release, self::CACHE_TTL);

        return $release;
    }

    /**
     * Fetch the latest release from the GitHub API.
     *
     * @return array|null Decoded release data or null on failure.
     */
    private static function fetch_latest_release(): ?array {
        $response = wp_remote_get(self::GITHUB_API_URL, [
            'timeout' => 10,
            'headers' => [
                'Accept'     => 'application/vnd.github+json',
                'User-Agent' => 'AB-WP-Bits/' . AB_WP_BITS_VERSION,
            ],
        ]);

        if (is_wp_error($response)) {
            return null;
        }

        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 200) {
            return null;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!is_array($data) || empty($data['tag_name'])) {
            return null;
        }

        return $data;
    }

    /**
     * Normalize a version string by stripping a leading v/V prefix.
     *
     * @param string $version Raw version string (e.g., "v0.0.9-beta").
     * @return string Normalized version (e.g., "0.0.9-beta").
     */
    private static function normalize_version(string $version): string {
        return ltrim($version, 'vV');
    }

    /**
     * Find the ZIP download URL from a release's assets.
     *
     * @param array $release GitHub release data.
     * @return string|null Browser download URL for the ZIP, or null if not found.
     */
    private static function get_zip_download_url(array $release): ?string {
        $assets = $release['assets'] ?? [];

        foreach ($assets as $asset) {
            $name = $asset['name'] ?? '';
            if (str_ends_with($name, '.zip')) {
                return $asset['browser_download_url'] ?? null;
            }
        }

        // Fallback: use GitHub's auto-generated zipball
        return $release['zipball_url'] ?? null;
    }
}
