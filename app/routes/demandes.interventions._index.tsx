import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import FilterGroup from '~/components/ui/FilterGroup';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Layout from '~/components/layout/Layout';
import { Table } from '~/components/ui/Table';

type Status = 'En cours' | 'Terminée' | 'Irréparable';

const statusColors: Record<Status, string> = {
  'En cours': 'bg-blue-100/50 text-blue-700',
  Terminée: 'bg-green-100/50 text-green-700',
  Irréparable: 'bg-red-100/50 text-red-700',
};

interface FilterOption {
  label: string;
  value: string;
}

interface Intervention {
  id: string;
  nom: string;
  type: string;
  marque: string;
  date: string;
  numero: string;
  panne: string;
  status: Status;
}

const allInterventions: Intervention[] = [
  {
    id: 'INT-001',
    nom: 'Jean Dupont',
    type: 'Ordinateur portable',
    marque: 'Dell Latitude 5420',
    date: '2025-03-07',
    numero: 'SN-48392',
    panne: "Écran ne s'allume pas",
    status: 'En cours',
  },
  {
    id: 'INT-002',
    nom: 'Marie Martin',
    type: 'Imprimante',
    marque: 'HP LaserJet Pro',
    date: '2025-03-07',
    numero: 'SN-29187',
    panne: 'Bourrage papier fréquent',
    status: 'Terminée',
  },
  {
    id: 'INT-003',
    nom: 'Pierre Richard',
    type: 'Écran',
    marque: 'Samsung S24R350',
    date: '2025-03-08',
    numero: 'SN-39104',
    panne: 'Pixels morts',
    status: 'Irréparable',
  },
  {
    id: 'INT-004',
    nom: 'Sophie Laurent',
    type: 'Ordinateur portable',
    marque: 'Lenovo ThinkPad',
    date: '2025-03-08',
    numero: 'SN-58293',
    panne: 'Batterie ne charge plus',
    status: 'En cours',
  },
  {
    id: 'INT-005',
    nom: 'Lucas Bernard',
    type: 'Tablette',
    marque: 'iPad Pro 2022',
    date: '2025-03-08',
    numero: 'SN-67234',
    panne: 'Ne démarre plus',
    status: 'Terminée',
  },
];

export default function InterventionsPage() {
  const [date, setDate] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  const handleReset = () => {
    setDate(null);
    setStatus(null);
    setType(null);
  };

  const filterOptions: {
    id: string;
    placeholder: string;
    value: string | null;
    options: FilterOption[];
    onChange: (value: string | null) => void;
  }[] = [
    {
      id: 'date',
      placeholder: 'Date',
      value: date,
      onChange: setDate,
      options: [
        { label: '07 Mars 2025', value: '2025-03-07' },
        { label: '08 Mars 2025', value: '2025-03-08' },
      ],
    },
    {
      id: 'status',
      placeholder: 'Statut',
      value: status,
      onChange: setStatus,
      options: [
        { label: 'En cours', value: 'En cours' },
        { label: 'Terminée', value: 'Terminée' },
        { label: 'Irréparable', value: 'Irréparable' },
      ],
    },
    {
      id: 'type',
      placeholder: 'Type',
      value: type,
      onChange: setType,
      options: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ],
    },
  ];

  const filteredInterventions = allInterventions.filter((item) => {
    const matchDate = !date || item.date.includes(date);
    const matchStatus = !status || item.status === status;
    const matchType = !type || item.type === type;
    return matchDate && matchStatus && matchType;
  });

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'NOM DÉPOSANT', accessor: 'nom' as const },
    { header: 'TYPE MATÉRIEL', accessor: 'type' as const },
    { header: 'MARQUE ET ERF', accessor: 'marque' as const },
    { header: 'DATE DÉPOT', accessor: 'date' as const },
    { header: 'N°S/N°I', accessor: 'numero' as const },
    { header: 'PANNE DÉCLARÉE', accessor: 'panne' as const },
    {
      header: 'STATUS',
      accessor: 'status' as const,
      cell: (value: string) => (
        <div
          className={`w-full px-3 py-1.5 text-sm font-medium ${statusColors[value as Status]}`}
        >
          {value}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className='space-y-6 px-4 md:px-8'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h2 className='text-2xl font-semibold text-mpsi'>
            Demandes{' '}
            <span className='text-black'>/ Liste des interventions</span>
          </h2>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-4'>
          <FilterGroup filters={filterOptions} onReset={handleReset} />
          <button className='rounded-md bg-[#1D6BF3] px-6 py-3.5 text-base text-white hover:bg-[#155dc2]'>
            Ajouter une intervention
          </button>
        </div>

        <Table data={filteredInterventions} columns={columns} />

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
