/**
 * This file contains shared types and functions that are safe to use on both client and server
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

export interface Demande {
  id: number;
  interventions: Intervention[];
  type_materiel: string;
  marque: string;
  numero_inventaire: string;
  service_affectation: string;
  date_depot: string;
  nom_deposant: string;
  numero_telephone: string;
  email: string;
  status: string;
  panne_declaree: string;
  status_demande: 'Nouvelle' | 'Acceptee' | 'Rejetee';
}

export type DemandeStatus =
  | 'Acceptee'
  | 'EnAttente'
  | 'Rejetee'
  | 'Terminee'
  | 'Nouvelle';
export type Priority = 'Haute' | 'Moyenne' | 'Basse' | 'Non définie';

export interface FilterOption {
  label: string;
  value: string;
}

export interface UpdateFields {
  panne_trouvee?: string;
  materiels_installes?: string;
  status_demande?: DemandeStatus;
  rejection_reason?: string | null;
}

/**
 * Helper function for formatting dates consistently
 * Safe to use on both client and server
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR');
}

/**
 * Filter demandes by status
 * Safe to use on both client and server
 */
export function filterDemandesByStatus(
  demandes: Demande[],
  status: DemandeStatus,
): Demande[] {
  return demandes.filter((demande) => demande.status_demande === status);
}
