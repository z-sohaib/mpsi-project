/**
 * This file contains shared types and functions for interventions
 * that are safe to use on both client and server
 */

import { Composant } from './composant.server';

export type PrioriteType = 'Haute' | 'Moyenne' | 'Basse';
export type StatusInterventionType = 'Termine' | 'enCours' | 'Irreparable';

export interface Intervention {
  id: number;
  composants_utilises: Composant[];
  created_at: string;
  numero_serie: string;
  priorite: PrioriteType;
  panne_trouvee: string;
  status: StatusInterventionType;
  date_sortie: string | null;
  demande_id: number;
  technicien: number;
}

export interface FilterOption {
  label: string;
  value: string;
}

/**
 * Helper function for formatting dates consistently
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Non définie';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Filter interventions by status
 */
export function filterInterventionsByStatus(
  interventions: Intervention[],
  status: StatusInterventionType,
): Intervention[] {
  return interventions.filter((intervention) => intervention.status === status);
}
