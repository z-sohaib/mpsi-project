export interface Composant {
  id: number;
  nom: string;
  quantite: number;
  ref: string;
  categorie: string;
  description?: string;
  type: 'Nouveau' | 'Ancien';
  image?: string;
  date_achat?: string;
}

/**
 * Fetch all composants from the API
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
