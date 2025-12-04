/**
 * Type definitions for AB WP Bits admin app
 */

export interface Module {
  id: string;
  name: string;
  description: string;
  logo: string;
  has_settings: boolean;
  enabled: boolean;
}

export interface ABWPBitsData {
  apiUrl: string;
  nonce: string;
  modules: Module[];
}

export type SaveStatus = 'saved' | 'saving' | 'error';

// Global WordPress data injected via wp_localize_script
declare global {
  interface Window {
    abWpBitsData: ABWPBitsData;
  }
}

export {};
