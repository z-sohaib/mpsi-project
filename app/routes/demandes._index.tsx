import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import FilterGroup from '~/components/ui/FilterGroup';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Layout from '~/components/layout/Layout';
import { Table } from '~/components/ui/Table';

type Priority = 'Haute' | 'Moyenne' | 'Basse';

const priorityColors: Record<Priority, string> = {
  Haute: 'bg-red-100/50 text-red-700',
  Moyenne: 'bg-yellow-100/50 text-yellow-700',
  Basse: 'bg-green-100/50 text-green-700',
};

interface FilterOption {
  label: string;
  value: string;
}

interface Demande {
  id: string;
  nom: string;
  type: string;
  marque: string;
  date: string;
  numero: string;
  panne: string;
  priorite: Priority;
}

const allDemandes: Demande[] = [
  {
    id: 'DEM-001',
    nom: 'Jean Dupont',
    type: 'Ordinateur portable',
    marque: 'Dell Latitude 5420',
    date: '2025-03-07',
    numero: 'SN-48392',
    panne: "Écran ne s'allume pas",
    priorite: 'Haute',
  },
  {
    id: 'DEM-002',
    nom: 'Marie Martin',
    type: 'Imprimante',
    marque: 'HP LaserJet Pro',
    date: '2025-03-07',
    numero: 'SN-29187',
    panne: 'Bourrage papier fréquent',
    priorite: 'Basse',
  },
  {
    id: 'DEM-003',
    nom: 'Pierre Richard',
    type: 'Écran',
    marque: 'Samsung S24R350',
    date: '2025-03-08',
    numero: 'SN-39104',
    panne: 'Pixels morts',
    priorite: 'Moyenne',
  },
  {
    id: 'DEM-004',
    nom: 'Sophie Laurent',
    type: 'Ordinateur portable',
    marque: 'Lenovo ThinkPad',
    date: '2025-03-08',
    numero: 'SN-58293',
    panne: 'Batterie ne charge plus',
    priorite: 'Haute',
  },
  {
    id: 'DEM-005',
    nom: 'Lucas Bernard',
    type: 'Tablette',
    marque: 'iPad Pro 2022',
    date: '2025-03-08',
    numero: 'SN-67234',
    panne: 'Ne démarre plus',
    priorite: 'Moyenne',
  },
];

export default function NouvellesDemandesPage() {
  const [date, setDate] = useState<string | null>(null);
  const [priorite, setPriorite] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  const handleReset = () => {
    setDate(null);
    setPriorite(null);
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
      id: 'priorite',
      placeholder: 'Priorité',
      value: priorite,
      onChange: setPriorite,
      options: [
        { label: 'Haute', value: 'Haute' },
        { label: 'Moyenne', value: 'Moyenne' },
        { label: 'Basse', value: 'Basse' },
      ],
    },
    {
      id: 'type',
      placeholder: 'Type',
      value: type,
      onChange: setType,
      options: [
        { label: 'Ordinateur portable', value: 'Ordinateur portable' },
        { label: 'Imprimante', value: 'Imprimante' },
        { label: 'Écran', value: 'Écran' },
        { label: 'Tablette', value: 'Tablette' },
      ],
    },
  ];

  const filteredDemandes = allDemandes.filter((item) => {
    const matchDate = !date || item.date.includes(date);
    const matchPriorite = !priorite || item.priorite === priorite;
    const matchType = !type || item.type === type;
    return matchDate && matchPriorite && matchType;
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
      header: 'PRIORITÉ',
      accessor: 'priorite' as const,
      cell: (value: string) => (
        <div
          className={`w-full px-3 py-1.5 text-sm font-medium ${priorityColors[value as Priority]}`}
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
            Demandes <span className='text-black'>/ Nouvelles demandes</span>
          </h2>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-4'>
          <FilterGroup filters={filterOptions} onReset={handleReset} />
          <button className='rounded-md bg-[#1D6BF3] px-6 py-3.5 text-base text-white hover:bg-[#155dc2]'>
            Ajouter une demande
          </button>
        </div>

        <Table data={filteredDemandes} columns={columns} />

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
