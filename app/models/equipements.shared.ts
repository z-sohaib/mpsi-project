/**
 * This file contains shared types and functions for equipements
 * that are safe to use on both client and server
 */

import { Equipement } from '~/types/equipement';

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
