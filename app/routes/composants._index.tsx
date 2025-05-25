import { useState, useEffect, useCallback, useMemo } from 'react';
import { LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button } from '~/components/ui/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Layout from '~/components/layout/Layout';
import { Table } from '~/components/ui/Table';
import { DemandFilters } from '~/components/ui/DemandFilters';
import { requireUserId } from '~/session.server';
// Import from server-only module in loader/action
import { fetchComposants, getFilterOptions } from '~/models/composants.server';
import { Composant } from '~/types/composant';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check if user is authenticated
    const session = await requireUserId(request);

    try {
      const composants = await fetchComposants(session.access);
      const filterOptions = getFilterOptions(composants);

      return json({
        composants,
        filterOptions,
      });
    } catch (error) {
      console.error('Error fetching composants:', error);
      // Return empty data with error flag
      return json({
        composants: [],
        filterOptions: {
          dates: [],
          types: [],
          models: [],
          categories: [],
        },
        error: 'Failed to load components data. Please try again later.',
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
  composants: Composant[];
  filterOptions: {
    dates: { label: string; value: string }[];
    types: { label: string; value: string }[];
    models: { label: string; value: string }[];
    categories: { label: string; value: string }[];
  };
  error?: string;
};

export default function ComposantsIndexPage() {
  const { composants, filterOptions, error } = useLoaderData<LoaderData>();
  const [filteredComposants, setFilteredComposants] =
    useState<Composant[]>(composants);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(error || null);
  const rowsPerPage = 6;

  // Initialize filtered composants when composants change
  useEffect(() => {
    setFilteredComposants(composants);
    setLoading(false);
  }, [composants]);

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
      id: 'type',
      placeholder: 'Type',
      options: filterOptions.types,
    },
    {
      id: 'model',
      placeholder: 'Modèle',
      options: filterOptions.models,
    },
    {
      id: 'category',
      placeholder: 'Catégorie',
      options: filterOptions.categories,
    },
  ];

  // Function to handle filter changes
  const handleFiltersChange = useCallback(
    (filters: Record<string, string | null>) => {
      const filtered = composants.filter((composant) => {
        // Date filter - match the specific date
        const matchDate =
          !filters.date || composant.created_at.split('T')[0] === filters.date;

        // Type filter
        const matchType =
          !filters.type || composant.type_composant === filters.type;

        // Model filter
        const matchModel =
          !filters.model || composant.model_reference === filters.model;

        // Category filter
        const matchCategory =
          !filters.category ||
          composant.categorie_details?.designation === filters.category;

        return matchDate && matchType && matchModel && matchCategory;
      });

      setFilteredComposants(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    },
    [composants],
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredComposants.length / rowsPerPage);

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredComposants.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredComposants, currentPage]);

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
    {
      header: 'IMAGE',
      accessor: 'image_url' as const,
      cell: (value: unknown) => (
        <div className='flex justify-center'>
          <img
            src={(value as string) || '/equipement.png'}
            alt='Composant'
            className='size-10 rounded-md border border-gray-200 object-cover'
            onError={(e) => {
              e.currentTarget.src = '/equipement.png';
            }}
          />
        </div>
      ),
    },
    { header: 'DÉSIGNATION', accessor: 'designation' as const },
    { header: 'MODÈLE / REF', accessor: 'model_reference' as const },
    { header: 'N° SÉRIE', accessor: 'numero_serie' as const },
    {
      header: 'CATÉGORIE',
      accessor: (item: Composant) =>
        item.categorie_details?.designation || 'Non définie',
    },
    {
      header: 'TYPE',
      accessor: 'type_composant' as const,
      cell: (value: unknown) => (
        <div
          className={`w-full px-3 py-1.5 text-sm font-medium ${
            value === 'Nouveau'
              ? 'bg-blue-100/50 text-blue-700'
              : 'bg-gray-100/50 text-gray-700'
          }`}
        >
          {String(value)}
        </div>
      ),
    },
    {
      header: 'QUANTITÉ',
      accessor: 'quantity' as const,
      cell: (value: unknown) => (value ? String(value) : '0'),
    },
    {
      header: 'DISPONIBILITÉ',
      accessor: 'disponible' as const,
      cell: (value: unknown) => (
        <div
          className={`w-full px-3 py-1.5 text-sm font-medium ${
            value === true
              ? 'bg-green-100/50 text-green-700'
              : 'bg-red-100/50 text-red-700'
          }`}
        >
          {value === true ? 'Disponible' : 'Non disponible'}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className='space-y-6 px-4 md:px-8'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h2 className='text-2xl font-semibold text-mpsi'>
            Composants{' '}
            <span className='text-black'>/ Liste des composants</span>
          </h2>
        </div>

        <DemandFilters
          filterConfigs={filterConfigs}
          onFiltersChange={handleFiltersChange}
          addButtonLink='/composants/new'
          addButtonText='Ajouter un composant'
          showAddButton={true}
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
              linkBaseUrl='/composants'
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
                {filteredComposants.length} résultats)
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
