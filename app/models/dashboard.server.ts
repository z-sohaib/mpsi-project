import { DashboardData } from '~/types/dashboard';

// Mock data for use when API is unavailable
export const mockDashboardData: DashboardData = {
  totals: [
    {
      name: 'Total des demandes',
      value: 30,
      'pourcentage diff': 100,
    },
    {
      name: 'Interventions actives',
      value: 4,
      'pourcentage diff': 100,
    },
    {
      name: 'Anciens composants disponibles',
      value: 20,
      'pourcentage diff': 100,
    },
    {
      name: 'Nouveaux composants disponibles',
      value: 23,
      'pourcentage diff': 100,
    },
    { name: 'Équipements total', value: 6, 'pourcentage diff': 100 },
  ],
  demandes: [{ year: 2025, months: [{ month: 'May', value: 30 }] }],
  demandestats: {
    year: 2025,
    total: 30,
    'total rejetee': 6,
    'total acceptee': 18,
    demande_years: [{ year: 2025, total: 30 }],
  },
  interventionsstats: {
    year: 2025,
    total: 18,
    'total irreparable': 6,
    'total completed': 8,
    'total encours': 4,
    intervention_years: [{ year: 2025, total: 18 }],
  },
  composantstats: {
    year: 2025,
    total: 43,
    'total ancien': 20,
    'total nouveau': 23,
    composant_years: [{ year: 2025, total: 43 }],
  },
  equipementstats: [{ year: 2025, total: 6 }],
};

/**
 * Fetch dashboard data from the API
 */
export async function fetchDashboardData(
  token: string,
): Promise<DashboardData> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/dashboard/',
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

    return (await response.json()) as DashboardData;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    // Return mock data as fallback
    return mockDashboardData;
  }
}
