import { Demande, DemandeStatus } from '../types/demande';

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
