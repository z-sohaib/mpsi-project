import { Intervention } from './interventions.shared';

/**
 * Fetch all interventions from the API
 * SERVER-ONLY function
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
 * Get unique filter options from interventions
 * SERVER-ONLY function
 */
export function getInterventionFilterOptions(interventions: Intervention[]) {
  const dates = new Set<string>();
  const statuses = new Set<string>();
  const priorities = new Set<string>();
  const techniciens = new Set<string>();

  interventions.forEach((intervention) => {
    // Format date for display (YYYY-MM-DDT00:00:00 → YYYY-MM-DD)
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
      label: `Technicien ${technicien}`,
      value: technicien,
    })),
  };
}

/**
 * Update an intervention by ID
 */
export async function updateInterventionById(
  token: string,
  interventionId: string,
  updates: Partial<Intervention>,
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

// Re-export from shared module for convenience
export { filterInterventionsByStatus } from './interventions.shared';
