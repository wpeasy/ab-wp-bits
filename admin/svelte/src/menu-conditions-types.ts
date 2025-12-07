/**
 * Type definitions for Menu Conditions module
 */

export interface Capability {
  value: string;
  label: string;
}

export interface Condition {
  operator: 'has' | 'has_not';
  capability: string;
}

export interface ConditionsConfig {
  relation: 'AND' | 'OR';
  conditions: Condition[];
}

export interface RoleEvaluationResult {
  role: string;
  role_name: string;
  visible: boolean;
}

export interface UserData {
  id: number;
  name: string;
  roles: string[];
}

export interface MenuConditionsData {
  apiUrl: string;
  nonce: string;
}

// Global WordPress data injected via wp_localize_script
declare global {
  interface Window {
    abMenuConditionsData: MenuConditionsData;
  }
}

export {};
