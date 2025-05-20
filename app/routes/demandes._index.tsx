import { useState, useEffect, useCallback } from 'react';
import { LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button } from '~/components/ui/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Layout from '~/components/layout/Layout';
import { Table } from '~/components/ui/Table';
import { DemandFilters } from '~/components/ui/DemandFilters';
import { requireUserId } from '~/session.server';
// Import from server-only module in loader/action
import { fetchDemandes, getFilterOptions } from '~/models/demandes.server';
// Import from shared module for client use
import {
  Demande,
  FilterOption,
  formatDate,
  filterDemandesByStatus,
} from '~/models/demandes.shared';

type StatusDemandeType =
  | 'Acceptee'
  | 'EnAttente'
  | 'Rejetee'
  | 'Terminee'
  | 'Nouvelle';

// Simple color mapping for status badges
const statusColors = {
  Acceptee: 'bg-green-100/50 text-green-700',
  EnAttente: 'bg-yellow-100/50 text-yellow-700',
  Rejetee: 'bg-red-100/50 text-red-700',
  Nouvelle: 'bg-yellow-100/50 text-yellow-700',
  Terminee: 'bg-green-100/50 text-green-700',
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
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const rowsPerPage = 6;

  // Define filter configurations based on the data
  const filterConfigs = [
    {
      id: 'date',
      placeholder: 'Date',
      options: filterOptions.dates,
      type: 'date' as const, // Set as date picker
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
        // Date filter - match the specific date
        const matchDate =
          !filters.date || demande.date_depot.split('T')[0] === filters.date;

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
      setCurrentPage(1); // Reset to first page when filters change
    },
    [demandes],
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredDemandes.length / rowsPerPage);

  // Get current page data
  const currentData = filteredDemandes.slice(
    (currentPage - 1) * rowsPerPage,
    (currentPage - 1) * rowsPerPage + rowsPerPage,
  );

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Define column accessors
  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'NOM DÉPOSANT', accessor: 'nom_deposant' as const },
    { header: 'TYPE MATÉRIEL', accessor: 'type_materiel' as const },
    { header: 'MARQUE', accessor: 'marque' as const },
    {
      header: 'DATE DÉPÔT',
      accessor: 'date_depot' as const,
      cell: (value: unknown) => formatDate(value as string),
    },
    { header: 'N° INVENTAIRE', accessor: 'numero_inventaire' as const },
    { header: 'PANNE DÉCLARÉE', accessor: 'panne_declaree' as const },
    {
      header: 'STATUT',
      accessor: 'status_demande' as const,
      cell: (value: unknown) => (
        <div
          className={`w-full px-3 py-1.5 text-sm font-medium ${statusColors[value as StatusDemandeType]}`}
        >
          {value === 'Acceptee'
            ? 'Acceptée'
            : value === 'EnAttente'
              ? 'En Attente'
              : value === 'Rejetee'
                ? 'Rejetée'
                : value === 'Nouvelle'
                  ? 'Nouvelle'
                  : value === 'Terminee'
                    ? 'Terminée'
                    : String(value)}
        </div>
      ),
    },
  ];

  // Modify your data fetching function to include loading and error states
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Your existing fetch logic here
        setLoading(false);
      } catch (err) {
        setErrorState(
          err instanceof Error ? err.message : 'Une erreur est survenue',
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Display error message if there was an error loading data
  if (errorState) {
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
                  <p>{errorState}</p>
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

        {loading ? (
          <div className='flex justify-center py-8'>
            <div className='size-10 animate-spin rounded-full border-b-2 border-mpsi'></div>
          </div>
        ) : error ? (
          <div className='py-8 text-center text-red-600'>
            <p>Erreur lors du chargement des données: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-2 rounded-md bg-mpsi px-4 py-2 text-white'
            >
              Réessayer
            </button>
          </div>
        ) : (
          <Table
            data={currentData}
            columns={columns}
            idField='id'
            linkBaseUrl='/demandes'
          />
        )}

        <div className='flex items-center justify-between'>
          <Button
            variant='outline'
            className='flex items-center gap-2 border-mpsi text-mpsi'
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className='size-4' /> Données préc.
          </Button>

          <div className='text-sm text-gray-600'>
            Page {currentPage} sur {totalPages || 1} ({filteredDemandes.length}{' '}
            résultats)
          </div>

          <Button
            variant='outline'
            className='flex items-center gap-2 border-mpsi text-mpsi'
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            Données suiv. <ChevronRight className='size-4' />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
