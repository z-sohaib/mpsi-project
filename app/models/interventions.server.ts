import { Intervention } from './interventions.shared';

/**
 * Fetch all interventions from the API
 */
export async function fetchInterventions(
  token: string,
): Promise<Intervention[]> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/interventions/',
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

    return (await response.json()) as Intervention[];
  } catch (error) {
    console.error('Failed to fetch interventions:', error);
    return [];
  }
}

/**
 * Get unique filter options from interventions
 */
export function getInterventionFilterOptions(interventions: Intervention[]) {
  const dates = new Set<string>();
  const statuses = new Set<string>();
  const priorities = new Set<string>();
  const techniciens = new Set<string>();

  interventions.forEach((intervention) => {
    // Format date for display
    if (intervention.created_at) {
      const date = new Date(intervention.created_at);
      const formattedDate = date.toISOString().split('T')[0];
      dates.add(formattedDate);
    }

    if (intervention.status) {
      statuses.add(intervention.status);
    }

    if (intervention.priorite) {
      priorities.add(intervention.priorite);
    }

    if (intervention.technicien) {
      techniciens.add(intervention.technicien.toString());
    }
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
    statuses: Array.from(statuses).map((status) => ({
      label:
        status === 'Termine'
          ? 'Terminé'
          : status === 'enCours'
            ? 'En cours'
            : status === 'Irreparable'
              ? 'Irréparable'
              : status,
      value: status,
    })),
    priorities: Array.from(priorities).map((priority) => ({
      label: priority,
      value: priority,
    })),
    techniciens: Array.from(techniciens).map((technicien) => ({
      // Replace with actual technician names when available
      label: `Technicien ${technicien}`,
      value: technicien,
    })),
  };
}

/**
 * Fetch a single intervention by ID
 */
export async function fetchInterventionById(
  token: string,
  interventionId: string,
): Promise<Intervention | null> {
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/interventions/${interventionId}/`,
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

    return (await response.json()) as Intervention;
  } catch (error) {
    console.error('Failed to fetch intervention:', error);
    throw error;
  }
}

/**
 * Create a new intervention based on a demande
 */
export async function createInterventionFromDemande(
  token: string,
  demandeId: number,
  data: {
    panne_trouvee?: string;
  },
): Promise<Intervention> {
  try {
    // Default values for required fields
    const payload = {
      demande_id: demandeId,
      panne_trouvee: data.panne_trouvee || '',
      composants_utilises: [], // No components used initially
    };

    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/interventions/',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        // Try to parse error as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.detail || `API Error: ${response.status}`);
      } catch (e) {
        // If can't parse as JSON, use text directly
        throw new Error(
          `API Error: ${response.status} - ${errorText || 'Unknown error'}`,
        );
      }
    }

    return (await response.json()) as Intervention;
  } catch (error) {
    console.error('Failed to create intervention:', error);
    throw error;
  }
}

/**
 * Update an intervention by ID
 */
export async function updateInterventionById(
  token: string,
  interventionId: string,
  updates: {
    panne_trouvee?: string;
    priorite?: 'Haute' | 'Moyenne' | 'Basse';
    status?: 'Termine' | 'enCours' | 'Irreparable';
    date_sortie?: string | null;
    technicien?: number;
    composants_utilises?: unknown[];
  },
): Promise<Intervention | null> {
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/interventions/${interventionId}/`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      console.error('Failed to update intervention:', response.statusText);
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as Intervention;
  } catch (error) {
    console.error('Failed to update intervention:', error);
    throw error;
  }
}
