import { useState, useCallback } from 'react';
import { LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button } from '~/components/ui/Button';
import { Badge } from '~/components/ui/Badge';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Layout from '~/components/layout/Layout';
import { Table, Column } from '~/components/ui/Table';
import { DemandFilters } from '~/components/ui/DemandFilters';
import { requireUserId } from '~/session.server';
// Import from server-only module in loader/action
import { fetchDemandes, getFilterOptions } from '~/models/demandes.server';
// Import from shared module for client use
import {
  Demande,
  Priority,
  FilterOption,
  formatDate,
  filterDemandesByStatus,
} from '~/models/demandes.shared';

// Simple color mapping for priority badges
const priorityColors = {
  Haute: 'bg-red-100/50 text-red-700',
  Moyenne: 'bg-yellow-100/50 text-yellow-700',
  Basse: 'bg-green-100/50 text-green-700',
  'Non définie': 'bg-gray-100 text-gray-700',
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check if user is authenticated, this will throw a redirect if not
    const session = await requireUserId(request);

    // User is authenticated, fetch demandes data
    try {
      const allDemandes = await fetchDemandes(session.access);

      // Filter demandes to only show those with status "Nouvelle"
      const nouvelleDemandes = filterDemandesByStatus(allDemandes, 'Nouvelle');

      // Generate filter options from the data
      const filterOptions = getFilterOptions(nouvelleDemandes);

      return json({
        demandes: nouvelleDemandes,
        filterOptions,
      });
    } catch (error) {
      console.error('Error fetching demandes:', error);
      // Return empty data with error flag
      return json({
        demandes: [],
        filterOptions: { dates: [], types: [], priorities: [] },
        error: 'Failed to load demandes data. Please try again later.',
      });
    }
  } catch (error) {
    // Handle authentication redirect
    if (error instanceof Response && error.status === 302) {
      throw error;
    }

    // Other errors
    console.error('Authentication error:', error);
    throw redirect('/auth');
  }
}

// Define the type returned by the loader
type LoaderData = {
  demandes: Demande[];
  filterOptions: {
    dates: FilterOption[];
    types: FilterOption[];
    priorities: FilterOption[];
  };
  error?: string;
};

export default function NouvellesDemandesPage() {
  const { demandes, filterOptions, error } = useLoaderData<LoaderData>();
  const [filteredDemandes, setFilteredDemandes] = useState<Demande[]>(demandes);

  // Define filter configurations based on the data
  const filterConfigs = [
    {
      id: 'date',
      placeholder: 'Date',
      options: filterOptions.dates,
    },
    {
      id: 'priorite',
      placeholder: 'Priorité',
      options: filterOptions.priorities,
    },
    {
      id: 'type',
      placeholder: 'Type',
      options: filterOptions.types,
    },
  ];

  // Function to handle filter changes
  const handleFiltersChange = useCallback(
    (filters: Record<string, string | null>) => {
      const filtered = demandes.filter((demande) => {
        // Date filter
        const matchDate =
          !filters.date || demande.date_depot.includes(filters.date);

        // Priority filter
        const matchPriorite =
          !filters.priorite ||
          demande.interventions.some((i) => i.priorite === filters.priorite);

        // Type filter
        const matchType =
          !filters.type || demande.type_materiel === filters.type;

        return (
          matchDate &&
          (matchPriorite || demande.interventions.length === 0) &&
          matchType
        );
      });

      setFilteredDemandes(filtered);
    },
    [demandes],
  );

  // Define column accessors as functions to fix type issues
  const columns: Column<Demande>[] = [
    {
      header: 'ID',
      accessor: (demande) => `DEM-${demande.id.toString().padStart(3, '0')}`,
    },
    {
      header: 'NOM DÉPOSANT',
      accessor: (demande) => demande.nom_deposant,
    },
    {
      header: 'TYPE MATÉRIEL',
      accessor: (demande) => demande.type_materiel,
    },
    { header: 'MARQUE ET REF', accessor: (demande) => demande.marque },
    {
      header: 'DATE DÉPÔT',
      accessor: (demande) => formatDate(demande.date_depot),
    },
    {
      header: 'N°S/N°I',
      accessor: (demande) => demande.numero_inventaire,
    },
    {
      header: 'PANNE DÉCLARÉE',
      accessor: (demande) => demande.panne_declaree,
    },
    {
      header: 'PRIORITÉ',
      accessor: (demande) => {
        if (demande.interventions.length === 0) return 'Non définie';
        return demande.interventions[0].priorite;
      },
      cell: (value: unknown) => (
        <Badge
          className={`px-3 py-1.5 ${priorityColors[value as Priority] || ''}`}
        >
          {value as string}
        </Badge>
      ),
    },
  ];

  // Display error message if there was an error loading data
  if (error) {
    return (
      <Layout>
        <div className='p-6'>
          <div className='mb-6 rounded-md bg-yellow-50 p-4'>
            <div className='flex'>
              <div className='shrink-0'>
                <svg
                  className='size-5 text-yellow-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-yellow-800'>
                  Erreur de chargement
                </h3>
                <div className='mt-2 text-sm text-yellow-700'>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
          <h2 className='text-2xl font-semibold text-mpsi'>
            Demandes <span className='text-black'>/ Nouvelles demandes</span>
          </h2>
          <div className='mt-4'>
            <Button
              onClick={() => window.location.reload()}
              className='bg-mpsi text-white'
            >
              Réessayer
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='space-y-6 px-4 md:px-8'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h2 className='text-2xl font-semibold text-mpsi'>
            Demandes <span className='text-black'>/ Nouvelles demandes</span>
          </h2>
        </div>

        <DemandFilters
          filterConfigs={filterConfigs}
          onFiltersChange={handleFiltersChange}
          addButtonLink='/demandes/new'
          addButtonText='Ajouter une demande'
        />

        {filteredDemandes.length === 0 ? (
          <div className='py-8 text-center'>
            <p className='text-gray-500'>Aucune nouvelle demande trouvée.</p>
          </div>
        ) : (
          <Table
            data={filteredDemandes}
            columns={columns}
            idField='id'
            linkBaseUrl='/demandes'
          />
        )}

        <div className='flex justify-between'>
          <Button
            variant='outline'
            className='flex items-center gap-2 border-mpsi text-mpsi'
          >
            <ChevronLeft className='size-4' /> Prev. Data
          </Button>
          <Button
            variant='outline'
            className='flex items-center gap-2 border-mpsi text-mpsi'
          >
            Next Data <ChevronRight className='size-4' />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
