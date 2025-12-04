/**
 * API utilities for AB WP Bits
 */

import type { Module } from './types';

const { apiUrl, nonce } = window.abWpBitsData;

/**
 * Fetch modules from the API
 */
export async function fetchModules(): Promise<Module[]> {
  const response = await fetch(`${apiUrl}/modules`, {
    method: 'GET',
    headers: {
      'X-WP-Nonce': nonce,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch modules');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Toggle a module's enabled status
 */
export async function toggleModule(id: string, enabled: boolean): Promise<void> {
  const response = await fetch(`${apiUrl}/modules/${id}/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
    body: JSON.stringify({ enabled }),
  });

  if (!response.ok) {
    throw new Error('Failed to toggle module');
  }
}
