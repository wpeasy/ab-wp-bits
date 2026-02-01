/**
 * Global type declarations for WordPress and plugin data
 */

/** WordPress Customizer API (partial) */
interface WPCustomize {
	state: (key: string) => { set: (value: unknown) => void; get: () => unknown };
}

/** WordPress global object (partial) */
interface WP {
	customize?: WPCustomize;
}

declare const wp: WP | undefined;

/** Plugin data passed from PHP via inline scripts */
interface ABWpBitsData {
	apiUrl: string;
	nonce: string;
	modules: Array<{
		id: string;
		name: string;
		description: string;
		logo: string;
		category: string;
		enabled: boolean;
		has_settings: boolean;
	}>;
}

interface ABMenuConditionsData {
	apiUrl: string;
	nonce: string;
}

interface ABMenuQueriesData {
	apiUrl: string;
	nonce: string;
	ajaxUrl: string;
	ajaxNonce: string;
	cacheTTL: number;
}

declare interface Window {
	abWpBitsData: ABWpBitsData;
	abMenuConditionsData: ABMenuConditionsData;
	abMenuQueriesData: ABMenuQueriesData;
}
