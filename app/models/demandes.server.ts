import { Demande, DemandeStatus } from './demandes.shared';

/**
 * Fetch all demandes from the API
 * SERVER-ONLY function
 */
export async function fetchDemandes(token: string): Promise<Demande[]> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/demandes/',
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as Demande[];
  } catch (error) {
    console.error('Failed to fetch demandes:', error);
    return [];
  }
}

/**
 * Get unique filter options from demandes
 * SERVER-ONLY function
 */
export function getFilterOptions(demandes: Demande[]) {
  const dates = new Set<string>();
  const types = new Set<string>();
  const priorities = new Set<string>(['Haute', 'Moyenne', 'Basse']);

  demandes.forEach((demande) => {
    // Format date for display (YYYY-MM-DD → DD MMM YYYY)
    if (demande.date_depot) {
      const date = new Date(demande.date_depot);
      const formattedDate = date.toISOString().split('T')[0];
      dates.add(formattedDate);
    }

    if (demande.type_materiel) {
      types.add(demande.type_materiel);
    }

    // Add priorities from interventions
    demande.interventions.forEach((intervention) => {
      if (intervention.priorite) {
        priorities.add(intervention.priorite);
      }
    });
  });

  return {
    dates: Array.from(dates).map((dateString) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('fr-FR', { month: 'long' });
      const year = date.getFullYear();
      return {
        label: `${day} ${month} ${year}`,
        value: dateString,
      };
    }),
    types: Array.from(types).map((type) => ({ label: type, value: type })),
    priorities: Array.from(priorities).map((priority) => ({
      label: priority,
      value: priority,
    })),
  };
}

/**
 * Fetch a single demande by ID
 */
export async function fetchDemandeById(
  token: string,
  demandeId: string,
): Promise<Demande | null> {
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/demandes/${demandeId}/`,
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as Demande;
  } catch (error) {
    console.error('Failed to fetch demande:', error);
    throw error;
  }
}

/**
 * Update a demande by ID
 */
export async function updateDemandeById(
  token: string,
  demandeId: string,
  updates: {
    panne_trouvee?: string;
    materiels_installes?: string;
    status_demande?: DemandeStatus;
    rejection_reason?: string | null;
  },
): Promise<Demande | null> {
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/demandes/${demandeId}/`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as Demande;
  } catch (error) {
    console.error('Failed to update demande:', error);
    throw error;
  }
}

// Re-export from shared module for convenience
export { filterDemandesByStatus } from './demandes.shared';
