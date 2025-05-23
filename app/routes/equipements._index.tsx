import { useState, useEffect, useCallback } from 'react';
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { Button } from '~/components/ui/Button';
import { ChevronRight, ChevronLeft, Mail, Download } from 'lucide-react';
import Layout from '~/components/layout/Layout';
import { Table } from '~/components/ui/Table';
import { DemandFilters } from '~/components/ui/DemandFilters';
import { requireUserId } from '~/session.server';
// Import from server-only module in loader/action
import {
  fetchEquipements,
  getFilterOptions,
} from '~/models/equipements.server';
// Import from shared module for client use
import { Equipement, formatDate } from '~/models/equipements.shared';
// Import the new email functions
import {
  sendEquipmentsListEmail,
  downloadEquipmentsPdf,
} from '~/utils/email.server';

type ActionData = {
  success: boolean;
  message?: string;
  actionType?: 'sendEmail' | 'downloadPdf';
  base64Data?: string;
  contentType?: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check if user is authenticated, this will throw a redirect if not
    const session = await requireUserId(request);

    // User is authenticated, fetch equipements data
    try {
      const equipements = await fetchEquipements(session.access);

      // Generate filter options from the data
      const filterOptions = getFilterOptions(equipements);

      return json({
        equipements,
        filterOptions,
      });
    } catch (error) {
      console.error('Error fetching equipements:', error);
      // Return empty data with error flag
      return json({
        equipements: [],
        filterOptions: { dates: [], models: [], inventories: [] },
        error: 'Failed to load equipements data. Please try again later.',
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

// Add action function to handle button clicks
export async function action({ request }: ActionFunctionArgs) {
  try {
    const session = await requireUserId(request);
    const formData = await request.formData();
    const actionType = formData.get('actionType') as string;

    if (actionType === 'sendEmail') {
      const result = await sendEquipmentsListEmail(
        session.access,
        'js_zouambia@esi.dz', // Hardcoded email as per requirements
      );

      return json<ActionData>({
        success: result.success,
        message: result.message,
        actionType: 'sendEmail',
      });
    } else if (actionType === 'downloadPdf') {
      const result = await downloadEquipmentsPdf(session.access);

      if (result.success && result.blob) {
        // Convert Blob to base64 for downloading from the client
        const arrayBuffer = await result.blob.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        return json<ActionData>({
          success: true,
          base64Data,
          contentType: result.blob.type,
          actionType: 'downloadPdf',
        });
      }

      return json<ActionData>({
        success: false,
        message: result.message,
        actionType: 'downloadPdf',
      });
    }

    return json<ActionData>({ success: false, message: 'Action non reconnue' });
  } catch (error) {
    console.error('Action error:', error);
    return json<ActionData>({
      success: false,
      message:
        error instanceof Error ? error.message : 'Une erreur est survenue',
    });
  }
}

export default function EquipementsIndexPage() {
  const { equipements, filterOptions, error } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();
  const [filteredEquipements, setFilteredEquipements] =
    useState<Equipement[]>(equipements);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>(
    'success',
  );
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
      id: 'model',
      placeholder: 'Modèle',
      options: filterOptions.models,
    },
    {
      id: 'inventaire',
      placeholder: 'N° Inventaire',
      options: filterOptions.inventories,
    },
  ];

  // Function to handle filter changes
  const handleFiltersChange = useCallback(
    (filters: Record<string, string | null>) => {
      const filtered = equipements.filter((equipement) => {
        // Date filter - match the specific date
        const matchDate =
          !filters.date ||
          (equipement.created_at &&
            equipement.created_at.split('T')[0] === filters.date);

        // Model filter
        const matchModel =
          !filters.model || equipement.model_reference === filters.model;

        // Inventory number filter
        const matchInventaire =
          !filters.inventaire ||
          equipement.numero_inventaire === filters.inventaire;

        return matchDate && matchModel && matchInventaire;
      });

      setFilteredEquipements(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    },
    [equipements],
  );

  // Initialize filtered equipements with all equipements when they change
  useEffect(() => {
    setFilteredEquipements(equipements);
    setLoading(false);
  }, [equipements]);

  // Handle action responses
  useEffect(() => {
    if (fetcher.data) {
      if (
        fetcher.data.actionType === 'downloadPdf' &&
        fetcher.data.success &&
        fetcher.data.base64Data
      ) {
        // Create a download link for the PDF
        const linkElement = document.createElement('a');
        const blob = base64ToBlob(
          fetcher.data.base64Data,
          fetcher.data.contentType || 'application/pdf',
        );
        const url = URL.createObjectURL(blob);

        linkElement.href = url;
        linkElement.download = `equipements-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);

        setNotificationMessage('Liste des équipements téléchargée avec succès');
        setNotificationType('success');
        setShowNotification(true);
      } else if (fetcher.data.success) {
        setNotificationMessage(fetcher.data.message || 'Opération réussie');
        setNotificationType('success');
        setShowNotification(true);
      } else if (fetcher.data.message) {
        setNotificationMessage(fetcher.data.message);
        setNotificationType('error');
        setShowNotification(true);
      }
    }
  }, [fetcher.data]);

  // Hide notification after a delay
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64: string, contentType: string): Blob => {
    try {
      const byteCharacters = atob(base64);
      const byteArrays: Uint8Array[] = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: contentType });
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      return new Blob([], { type: contentType });
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredEquipements.length / rowsPerPage);

  // Get current page data
  const currentData = filteredEquipements.slice(
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
    { header: 'RÉFÉRENCE', accessor: 'model_reference' as const },
    {
      header: 'DATE CRÉATION',
      accessor: 'created_at' as const,
      cell: (value: unknown) => formatDate(value as string),
    },
    { header: 'N° SÉRIE', accessor: 'numero_serie' as const },
    { header: 'DÉSIGNATION', accessor: 'designation' as const },
    { header: 'N° INVENTAIRE', accessor: 'numero_inventaire' as const },
    { header: 'OBSERVATION', accessor: 'observation' as const },
  ];

  // Handle sending email with equipment list
  const handleSendEmail = () => {
    const formData = new FormData();
    formData.append('actionType', 'sendEmail');
    fetcher.submit(formData, { method: 'post' });
  };

  // Handle downloading equipment list as PDF
  const handleDownloadPdf = () => {
    const formData = new FormData();
    formData.append('actionType', 'downloadPdf');
    fetcher.submit(formData, { method: 'post' });
  };

  // Modify your data fetching function to include loading and error states
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // The actual data is already loaded by the loader
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
            Équipements{' '}
            <span className='text-black'>/ Liste des équipements</span>
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
            Équipements{' '}
            <span className='text-black'>/ Liste des équipements</span>
          </h2>
        </div>

        <DemandFilters
          filterConfigs={filterConfigs}
          onFiltersChange={handleFiltersChange}
          addButtonLink='/equipements/new'
          addButtonText='Ajouter un équipement'
          showAddButton={true}
        />

        {/* Add the new buttons row */}
        <div className='flex flex-wrap justify-end gap-3'>
          <Button
            onClick={handleSendEmail}
            className='flex items-center gap-2 bg-green-600 text-white hover:bg-green-700'
            disabled={fetcher.state !== 'idle'}
          >
            <Mail className='size-4' />
            {fetcher.state !== 'idle' &&
            fetcher.formData?.get('actionType') === 'sendEmail'
              ? 'Envoi en cours...'
              : 'Envoyer la liste au service inventaire'}
          </Button>
          <Button
            onClick={handleDownloadPdf}
            className='flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700'
            disabled={fetcher.state !== 'idle'}
          >
            <Download className='size-4' />
            {fetcher.state !== 'idle' &&
            fetcher.formData?.get('actionType') === 'downloadPdf'
              ? 'Téléchargement...'
              : 'Télécharger la liste'}
          </Button>
        </div>

        {/* Notification toast */}
        {showNotification && (
          <div
            className={`fixed bottom-4 right-4 z-50 rounded-md px-4 py-2 text-white shadow-lg ${
              notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {notificationMessage}
            <button
              className='ml-2 font-bold'
              onClick={() => setShowNotification(false)}
            >
              ×
            </button>
          </div>
        )}

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
            linkBaseUrl='/equipements'
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
            Page {currentPage} sur {totalPages || 1} (
            {filteredEquipements.length} résultats)
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
