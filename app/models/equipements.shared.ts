/**
 * This file contains shared types and functions for equipements
 * that are safe to use on both client and server
 */

export interface Equipement {
  id?: number;
  model_reference: string;
  created_at: string;
  numero_serie: string;
  designation: string;
  observation: string;
  numero_inventaire: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

/**
 * Helper function for formatting dates consistently
 * Safe to use on both client and server
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR');
}
