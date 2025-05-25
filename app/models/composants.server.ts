import { Composant } from '../types/composant';

/**
 * Fetch all composants from the API
 * SERVER-ONLY function
 */
export async function fetchComposants(token: string): Promise<Composant[]> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/composants/',
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

    return (await response.json()) as Composant[];
  } catch (error) {
    console.error('Failed to fetch composants:', error);
    return [];
  }
}

/**
 * Get unique filter options from composants
 * SERVER-ONLY function
 */
export function getFilterOptions(composants: Composant[]) {
  const dates = new Set<string>();
  const types = new Set<string>();
  const models = new Set<string>();
  const categories = new Set<string>();

  composants.forEach((composant) => {
    // Format date for display
    if (composant.created_at) {
      const date = new Date(composant.created_at);
      const formattedDate = date.toISOString().split('T')[0];
      dates.add(formattedDate);
    }

    if (composant.type_composant) {
      types.add(composant.type_composant);
    }

    if (composant.model_reference) {
      models.add(composant.model_reference);
    }

    if (composant.categorie_details?.designation) {
      categories.add(composant.categorie_details.designation);
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
    types: Array.from(types).map((type) => ({ label: type, value: type })),
    models: Array.from(models).map((model) => ({ label: model, value: model })),
    categories: Array.from(categories).map((category) => ({
      label: category,
      value: category,
    })),
  };
}

/**
 * Fetch a single composant by ID
 */
export async function fetchComposantById(
  token: string,
  composantId: string,
): Promise<Composant | null> {
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/composants/${composantId}/`,
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

    return (await response.json()) as Composant;
  } catch (error) {
    console.error('Failed to fetch composant:', error);
    throw error;
  }
}
