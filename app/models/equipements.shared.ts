/**
 * This file contains shared types and functions for equipements
 * that are safe to use on both client and server
 */

// Equipment interface that can be shared between client and server
export interface Equipement {
  id?: number;
  model_reference: string;
  numero_serie: string;
  designation: string;
  observation: string;
  numero_inventaire: string;
  created_at: string;
  modified_at?: string;
  status?: string;
}

// Filter option type for dropdowns
export interface FilterOption {
  label: string;
  value: string;
}

/**
 * Format a date string for display
 * @param dateString - ISO date string
 * @returns Formatted date string in DD Month YYYY format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Date invalide';
  }

  // Format options for date
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  return date.toLocaleDateString('fr-FR', options);
}

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
