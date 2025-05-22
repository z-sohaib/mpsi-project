/**
 * This file contains shared types and functions for composants
 * that are safe to use on both client and server
 */

export interface CategorieDetails {
  id_categorie: number;
  designation: string;
}

export interface Composant {
  id: number;
  type_composant: string;
  model_reference: string | null;
  numero_serie: string;
  designation: string;
  observation: string | null;
  categorie_details: CategorieDetails | null;
  numero_serie_eq_source: string | null;
  numero_inventaire_eq_source: string | null;
  status: string | null;
  quantity: number | null;
  disponible: boolean | null;
  image: string | null;
  created_at: string;
  image_url: string | null;
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
