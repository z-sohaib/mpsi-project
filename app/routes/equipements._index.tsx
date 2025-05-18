import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '~/components/layout/Layout';
import { Button } from '~/components/ui/Button';
import FilterGroup from '~/components/ui/FilterGroup';
import { Table } from '~/components/ui/Table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Equipement {
  id: number;
  model_reference: string | null;
  created_at: string;
  numero_serie: string;
  designation: string;
  observation: string | null;
  numero_inventaire: string | null;
  image: string | null;
}

export default function ListeEquipementsPage() {
  const navigate = useNavigate();
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch equipements from the backend
  useEffect(() => {
    const fetchEquipements = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth', { replace: true });
          return;
        }

        setLoading(true);
        const response = await fetch(
          'https://itms-mpsi.onrender.com/api/equipements/',
          {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setEquipements(data);
        } else if (response.status === 401) {
          console.warn('API returned 401. Invalid token. Logging out...');
          localStorage.removeItem('token');
          navigate('/auth', { replace: true });
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        console.error('Failed to fetch equipements:', err);
        setError('Failed to load equipment. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipements();
  }, [navigate]);

  const handleReset = () => {
    setDate(null);
    setCurrentPage(1); // Reset to first page on filter reset
  };

  const filterOptions = [
    {
      id: 'date',
      placeholder: 'Date',
      value: date,
      onChange: setDate,
      options: [{ label: '18 May 2025', value: '2025-05-18' }],
    },
  ];

  const filteredEquipements = equipements.filter((equipement) => {
    let matches = true;
    if (date) {
      matches =
        matches &&
        new Date(equipement.created_at).toISOString().split('T')[0] === date;
    }
    return matches;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEquipements.length / itemsPerPage);
  const paginatedEquipements = filteredEquipements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const columns = [
    {
      header: 'PIC',
      accessor: 'image' as const,
      cell: (value: string | null) => (
        <div className='flex justify-center'>
          <img
            width={40}
            src={value || '/equipement.png'}
            alt='Équipement'
            className='size-10 rounded-md border border-gray-200 object-cover'
          />
        </div>
      ),
    },
    { header: 'Désignation', accessor: 'designation' as const },
    { header: 'Model / référence', accessor: 'model_reference' as const },
    { header: 'Numéro de série', accessor: 'numero_serie' as const },
    { header: "N° d'inventaire", accessor: 'numero_inventaire' as const },
    {
      header: 'Observation',
      accessor: 'observation' as const,
      cell: (value: string | null) => (
        <Button variant='outline' className='border-mpsi text-mpsi'>
          {value || 'N/A'}
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className='flex min-h-screen items-center justify-center bg-gray-100'>
          <div className='text-center'>
            <div className='mx-auto mb-2 size-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600'></div>
            <p className='text-gray-600'>Chargement des équipements...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className='flex min-h-screen items-center justify-center bg-gray-100'>
          <div className='max-w-md rounded-lg bg-white p-6 shadow-lg'>
            <h2 className='mb-4 text-xl font-semibold text-red-600'>Erreur</h2>
            <p className='text-gray-700'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
            >
              Réessayer
            </button>
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

        <div className='flex flex-wrap items-center justify-between gap-4'>
          <FilterGroup filters={filterOptions} onReset={handleReset} />
          <button
            onClick={() => navigate('/equipements/new')}
            className='rounded-md bg-[#1D6BF3] px-6 py-3.5 text-base text-white hover:bg-[#155dc2]'
          >
            Ajouter un équipement
          </button>
        </div>

        <Table data={paginatedEquipements} columns={columns} />

        <div className='flex justify-between'>
          <Button
            variant='outline'
            className='flex items-center gap-2 border-mpsi text-mpsi'
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className='size-4' /> Prev. Data
          </Button>
          <Button
            variant='outline'
            className='flex items-center gap-2 border-mpsi text-mpsi'
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next Data <ChevronRight className='size-4' />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
