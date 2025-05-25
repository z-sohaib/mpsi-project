import { Equipement } from '~/types/equipement';

/**
 * Fetch all equipements from the API
 * SERVER-ONLY function
 */
export async function fetchEquipements(token: string): Promise<Equipement[]> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/equipements/',
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

    return (await response.json()) as Equipement[];
  } catch (error) {
    console.error('Failed to fetch equipements:', error);
    return [];
  }
}

/**
 * Get unique filter options from equipements
 * SERVER-ONLY function
 */
export function getFilterOptions(equipements: Equipement[]) {
  const dates = new Set<string>();
  const models = new Set<string>();
  const inventories = new Set<string>();

  equipements.forEach((equipement) => {
    // Format date for display (YYYY-MM-DDT00:00:00 → YYYY-MM-DD)
    if (equipement.created_at) {
      const date = new Date(equipement.created_at);
      const formattedDate = date.toISOString().split('T')[0];
      dates.add(formattedDate);
    }

    if (equipement.model_reference) {
      models.add(equipement.model_reference);
    }

    if (equipement.numero_inventaire) {
      inventories.add(equipement.numero_inventaire);
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
    models: Array.from(models).map((model) => ({ label: model, value: model })),
    inventories: Array.from(inventories).map((inventory) => ({
      label: inventory,
      value: inventory,
    })),
  };
}

/**
 * Fetch a single equipement by ID
 */
export async function fetchEquipementById(
  token: string,
  equipementId: string,
): Promise<Equipement | null> {
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/equipements/${equipementId}/`,
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

    return (await response.json()) as Equipement;
  } catch (error) {
    console.error('Failed to fetch equipement:', error);
    throw error;
  }
}

/**
 * Create a new equipement
 */
export async function createEquipement(
  token: string,
  equipementData: {
    model_reference: string;
    numero_serie: string;
    designation: string;
    observation: string;
    numero_inventaire: string;
  },
): Promise<Equipement> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/equipements/',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(equipementData),
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

    return (await response.json()) as Equipement;
  } catch (error) {
    console.error('Failed to create equipement:', error);
    throw error;
  }
}

/**
 * Update an equipement by ID
 */
/**
 * Update an equipement by ID
 * This is an example of a function to be used in server code
 */
export async function updateEquipementById(
  token: string,
  id: string,
  data: Partial<Equipement>,
): Promise<Equipement> {
  const response = await fetch(
    `https://itms-mpsi.onrender.com/api/equipements/${id}/`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update equipment: ${errorText}`);
  }

  return await response.json();
}
