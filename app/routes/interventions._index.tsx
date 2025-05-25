import { useState, useEffect, useCallback, useMemo } from 'react';
import { LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Button } from '~/components/ui/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Layout from '~/components/layout/Layout';
import { Table } from '~/components/ui/Table';
import { DemandFilters } from '~/components/ui/DemandFilters';
import { requireUserId } from '~/session.server';
import {
  fetchInterventions,
  getInterventionFilterOptions,
} from '~/models/interventions.server';
import { Intervention } from '~/types/demande';
import { formatDate } from '~/utils/dates';

// Simple color mapping for status badges
const statusColors = {
  Termine: 'bg-green-100/50 text-green-700',
  enCours: 'bg-blue-100/50 text-blue-700',
  Irreparable: 'bg-red-100/50 text-red-700',
};

const priorityColors = {
  Haute: 'bg-red-100/50 text-red-700',
  Moyenne: 'bg-yellow-100/50 text-yellow-700',
  Basse: 'bg-blue-100/50 text-blue-700',
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check if user is authenticated
    const session = await requireUserId(request);

    try {
      const interventions = await fetchInterventions(session.access);
      const filterOptions = getInterventionFilterOptions(interventions);

      return json({
        interventions,
        filterOptions,
      });
    } catch (error) {
      console.error('Error fetching interventions:', error);
      // Return empty data with error flag
      return json({
        interventions: [],
        filterOptions: {
          dates: [],
          statuses: [],
          priorities: [],
          techniciens: [],
        },
        error: 'Failed to load interventions data. Please try again later.',
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
  interventions: Intervention[];
  filterOptions: {
    dates: { label: string; value: string }[];
    statuses: { label: string; value: string }[];
    priorities: { label: string; value: string }[];
    techniciens: { label: string; value: string }[];
  };
  error?: string;
};

export default function InterventionsIndexPage() {
  const { interventions, filterOptions, error } = useLoaderData<LoaderData>();
  const [filteredInterventions, setFilteredInterventions] =
    useState<Intervention[]>(interventions);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(error || null);
  const rowsPerPage = 6;

  // Initialize filtered interventions with all interventions when they change
  useEffect(() => {
    setFilteredInterventions(interventions);
    setLoading(false);
  }, [interventions]);

  // Use effect to handle API errors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Data is already loaded by the loader function
        setLoading(false);
      } catch (err) {
        setErrorState(
          err instanceof Error ? err.message : 'Une erreur est survenue',
        );
        setLoading(false);
      }
    };

    if (error) {
      setErrorState(error);
    } else {
      fetchData();
    }
  }, [error]);

  // Define filter configurations based on the data
  const filterConfigs = [
    {
      id: 'date',
      placeholder: 'Date',
      options: filterOptions.dates,
      type: 'date' as const,
    },
    {
      id: 'status',
      placeholder: 'Statut',
      options: filterOptions.statuses,
    },
    {
      id: 'priorite',
      placeholder: 'Priorité',
      options: filterOptions.priorities,
    },
    {
      id: 'technicien',
      placeholder: 'Technicien',
      options: filterOptions.techniciens,
    },
  ];

  // Function to handle filter changes
  const handleFiltersChange = useCallback(
    (filters: Record<string, string | null>) => {
      const filtered = interventions.filter((intervention) => {
        // Date filter - match the specific date
        const matchDate =
          !filters.date ||
          intervention.created_at.split('T')[0] === filters.date;

        // Status filter
        const matchStatus =
          !filters.status || intervention.status === filters.status;

        // Priority filter
        const matchPriority =
          !filters.priorite || intervention.priorite === filters.priorite;

        // Technician filter
        const matchTechnicien =
          !filters.technicien ||
          intervention.technicien.toString() === filters.technicien;

        return matchDate && matchStatus && matchPriority && matchTechnicien;
      });

      setFilteredInterventions(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    },
    [interventions],
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredInterventions.length / rowsPerPage);

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredInterventions.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredInterventions, currentPage]);

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
    {
      header: 'DATE CRÉATION',
      accessor: 'created_at' as const,
      cell: (value: unknown) => formatDate(value as string),
    },
    {
      header: 'N° SÉRIE',
      accessor: 'numero_serie' as const,
      cell: (value: unknown) => (value ? String(value) : 'Non définie'),
    },
    {
      header: 'PANNE TROUVÉE',
      accessor: 'panne_trouvee' as const,
      cell: (value: unknown) => (value ? String(value) : 'Non définie'),
    },
    {
      header: 'DATE SORTIE',
      accessor: 'date_sortie' as const,
      cell: (value: unknown) =>
        value ? formatDate(value as string) : 'Non définie',
    },
    {
      header: 'PRIORITÉ',
      accessor: 'priorite' as const,
      cell: (value: unknown) => (
        <div
          className={`w-full px-3 py-1.5 text-sm font-medium ${priorityColors[value as keyof typeof priorityColors] || 'bg-gray-100 text-gray-700'}`}
        >
          {String(value)}
        </div>
      ),
    },
    {
      header: 'STATUT',
      accessor: 'status' as const,
      cell: (value: unknown) => (
        <div
          className={`w-full px-3 py-1.5 text-sm font-medium ${statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}
        >
          {value === 'Termine'
            ? 'Terminé'
            : value === 'enCours'
              ? 'En cours'
              : value === 'Irreparable'
                ? 'Irréparable'
                : String(value)}
        </div>
      ),
    },
    {
      header: 'DEMANDE',
      accessor: 'demande_id' as const,
      cell: (value: unknown) => (
        <Link
          to={`/demandes/${value}`}
          className='inline-flex items-center justify-center rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100'
        >
          Voir
        </Link>
      ),
    },
  ];

  return (
    <Layout>
      <div className='space-y-6 px-4 md:px-8'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h2 className='text-2xl font-semibold text-mpsi'>
            Interventions{' '}
            <span className='text-black'>/ Liste des interventions</span>
          </h2>
        </div>

        <DemandFilters
          filterConfigs={filterConfigs}
          onFiltersChange={handleFiltersChange}
          addButtonLink='/interventions/new'
          addButtonText='Créer une intervention'
          showAddButton={false}
        />

        {loading ? (
          <div className='flex justify-center py-8'>
            <div className='size-10 animate-spin rounded-full border-b-2 border-mpsi'></div>
          </div>
        ) : errorState ? (
          <div className='py-8 text-center text-red-600'>
            <p>Erreur lors du chargement des données: {errorState}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-2 rounded-md bg-mpsi px-4 py-2 text-white'
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <Table
              data={currentData}
              columns={columns}
              idField='id'
              linkBaseUrl='/interventions'
            />

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
                Page {currentPage} sur {totalPages || 1} (
                {filteredInterventions.length} résultats)
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
          </>
        )}
      </div>
    </Layout>
  );
}
