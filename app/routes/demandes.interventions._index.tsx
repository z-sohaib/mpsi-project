import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@remix-run/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import FilterGroup from '../components/ui/FilterGroup';
import { Table } from '../components/ui/Table';

// Types adaptés aux données de l'API
type PrioriteType = 'Haute' | 'Moyenne' | 'Basse';
type StatusDemandeType = 'Acceptee' | 'EnAttente' | 'Rejetee' | 'Terminee';

const statusColors = {
  Acceptee: 'bg-green-100/50 text-green-700',
  EnAttente: 'bg-yellow-100/50 text-yellow-700',
  Rejetee: 'bg-red-100/50 text-red-700',
  Nouvelle: 'bg-yellow-100/50 text-yellow-700',
  Terminee: 'bg-green-100/50 text-green-700',
};

interface Intervention {
  id: number;
  composants_utilises: number[]; // Assuming an array of component IDs
  created_at: string;
  numero_serie: string;
  priorite: PrioriteType;
  panne_trouvee: string;
  status: string;
  date_sortie: string | null;
  demande_id: number;
  technicien: number;
}

interface Demande {
  id: number;
  interventions: Intervention[];
  type_materiel: string;
  marque: string;
  numero_inventaire: string;
  service_affectation: string;
  date_depot: string;
  nom_deposant: string;
  numero_telephone: string;
  email: string;
  status: string;
  panne_declaree: string;
  status_demande: StatusDemandeType;
}

interface FilterOption {
  label: string;
  value: string;
}

export default function NouvellesDemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const navigate = useNavigate();

  // Récupération des données depuis l'API
  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://itms-mpsi.onrender.com/api/demandes/',
        );

        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`);
        }

        const data = await response.json();
        setDemandes(data);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Une erreur est survenue',
        );
        setLoading(false);
      }
    };

    fetchDemandes();
  }, []);

  // Function to remove duplicates based on a key
  const getUniqueOptions = <T,>(
    items: T[],
    keyExtractor: (item: T) => string,
    labelFormatter?: (value: string) => string,
  ): FilterOption[] => {
    const uniqueMap = new Map<string, string>();

    items.forEach((item) => {
      const key = keyExtractor(item);
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, key);
      }
    });

    return Array.from(uniqueMap.entries())
      .map(([value]) => ({
        label: labelFormatter ? labelFormatter(value) : value,
        value,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // Extraction des options de filtrage à partir des données avec élimination des doublons
  const filterOptions = useMemo(() => {
    if (demandes.length === 0) {
      return {
        dateOptions: [],
        typeOptions: [],
        statusOptions: [
          { label: 'Acceptée', value: 'Acceptee' },
          { label: 'Nouvelle', value: 'Nouvelle' },
          { label: 'Rejetée', value: 'Rejetee' },
          { label: 'Terminée', value: 'Terminee' },
        ],
      };
    }

    // Format date for display
    const formatDateLabel = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    };

    // Get unique dates (using only the date part without time)
    const dateOptions = getUniqueOptions(
      demandes,
      (d) => d.date_depot.split('T')[0],
      formatDateLabel,
    );

    // Get unique types
    const typeOptions = getUniqueOptions(demandes, (d) => d.type_materiel);

    return {
      dateOptions,
      typeOptions,
      statusOptions: [
        { label: 'Acceptée', value: 'Acceptee' },
        { label: 'Nouvelle', value: 'Nouvelle' },
        { label: 'Rejetée', value: 'Rejetee' },
        { label: 'Terminée', value: 'Terminee' },
      ],
    };
  }, [demandes]);

  const handleReset = () => {
    setDate(null);
    setStatus(null);
    setType(null);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleRowClick = (demande: Demande) => {
    navigate(`/demandes/${demande.id}`);
  };

  // Filters setup
  const filtersConfig = [
    {
      id: 'date',
      placeholder: 'Date',
      value: date,
      onChange: (value: string | null) => {
        setDate(value);
        setCurrentPage(1); // Reset to first page when filter changes
      },
      options: filterOptions.dateOptions,
    },
    {
      id: 'status',
      placeholder: 'Statut',
      value: status,
      onChange: (value: string | null) => {
        setStatus(value);
        setCurrentPage(1); // Reset to first page when filter changes
      },
      options: filterOptions.statusOptions,
    },
    {
      id: 'type',
      placeholder: 'Type',
      value: type,
      onChange: (value: string | null) => {
        setType(value);
        setCurrentPage(1); // Reset to first page when filter changes
      },
      options: filterOptions.typeOptions,
    },
  ];

  // Apply filters
  const filteredDemandes = useMemo(() => {
    return demandes.filter((item) => {
      const matchDate = !date || item.date_depot.split('T')[0] === date;
      const matchStatus = !status || item.status_demande === status;
      const matchType = !type || item.type_materiel === type;
      return matchDate && matchStatus && matchType;
    });
  }, [demandes, date, status, type]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDemandes.length / rowsPerPage);

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredDemandes.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredDemandes, currentPage]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'NOM DÉPOSANT', accessor: 'nom_deposant' as const },
    { header: 'TYPE MATÉRIEL', accessor: 'type_materiel' as const },
    { header: 'MARQUE', accessor: 'marque' as const },
    {
      header: 'DATE DÉPÔT',
      accessor: 'date_depot' as const,
      cell: (value: string) => formatDate(value),
    },
    { header: 'N° INVENTAIRE', accessor: 'numero_inventaire' as const },
    { header: 'PANNE DÉCLARÉE', accessor: 'panne_declaree' as const },
    {
      header: 'STATUT',
      accessor: 'status_demande' as const,
      cell: (value: StatusDemandeType) => (
        <div
          className={`w-full px-3 py-1.5 text-sm font-medium ${statusColors[value]}`}
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
                    : value}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className='space-y-6 px-4 md:px-8'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h2 className='text-2xl font-semibold text-mpsi'>
            Demandes <span className='text-black'>/ Liste Des Demandes</span>
          </h2>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-4'>
          <FilterGroup filters={filtersConfig} onReset={handleReset} />
          <button
            onClick={() => navigate('/demandes/new')}
            className='rounded-md bg-[#1D6BF3] px-6 py-3.5 text-base text-white hover:bg-[#155dc2]'
          >
            Ajouter une demande
          </button>
        </div>

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
          <>
            <Table
              data={currentData}
              columns={columns}
              onRowClick={handleRowClick}
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
                {filteredDemandes.length} résultats)
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
