/**
 * This file contains shared types and functions for interventions
 * that are safe to use on both client and server
 */

import { Composant } from './composant.server';

export interface Intervention {
  id: number;
  composants_utilises: Composant[];
  created_at: string;
  numero_serie: string;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
  panne_trouvee: string;
  status: 'Termine' | 'enCours' | 'Irreparable';
  date_sortie: string | null;
  demande_id: number;
  technicien: number;
}

/**
 * Helper function for formatting dates consistently
 * Safe to use on both client and server
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR');
}
