import { useState } from 'react';
import Layout from '~/components/layout/Layout';
import { Button } from '~/components/ui/Button';
import FilterGroup from '~/components/ui/FilterGroup';
import { Table } from '~/components/ui/Table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Composant {
  pic: string;
  nom: string;
  designation: string;
  modele: string;
  numeroSerie: string;
  serieEquipement: string;
  inventaire: string;
  observation: string;
}

const composants: Composant[] = [
  {
    pic: '/equipement.png',
    nom: 'Christine Brooks',
    designation: '089 Kutch Green Apt. 448',
    modele: 'Samsung/E123V',
    numeroSerie: 'Samsung/E123V',
    serieEquipement: 'TIRIBRK13454EA',
    inventaire: '2',
    observation: 'TBD',
  },
  {
    pic: '/equipement.png',
    nom: 'Rosie Pearson',
    designation: '979 Immanuel Ferry Suite 526',
    modele: 'Samsung/E123V',
    numeroSerie: 'Samsung/E123V',
    serieEquipement: 'TIRIBRK13454EA',
    inventaire: '50',
    observation: 'TBD',
  },
  {
    pic: '/equipement.png',
    nom: 'Darrell Caldwell',
    designation: '8587 Frida Ports',
    modele: 'Samsung/E123V',
    numeroSerie: 'Samsung/E123V',
    serieEquipement: 'TIRIBRK13454EA',
    inventaire: '34',
    observation: 'TBD',
  },
  {
    pic: '/equipement.png',
    nom: 'Gilbert Johnston',
    designation: '768 Destiny Lake Suite 600',
    modele: 'Samsung/E123V',
    numeroSerie: 'Samsung/E123V',
    serieEquipement: 'TIRIBRK13454EA',
    inventaire: '23',
    observation: 'TBD',
  },
  {
    pic: '/equipement.png',
    nom: 'Alan Cain',
    designation: '042 Mylene Throughway',
    modele: 'Samsung/E123V',
    numeroSerie: 'Samsung/E123V',
    serieEquipement: 'TIRIBRK13454EA',
    inventaire: '34',
    observation: 'TBD',
  },
  {
    pic: '/equipement.png',
    nom: 'Alfred Murray',
    designation: '543 Weinmann Mountain',
    modele: 'Samsung/E123V',
    numeroSerie: 'Samsung/E123V',
    serieEquipement: 'TIRIBRK13454EA',
    inventaire: '34',
    observation: 'TBD',
  },
];

export default function ListeComposantsPage() {
  const [date, setDate] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [modele, setModele] = useState<string | null>(null);

  const handleReset = () => {
    setDate(null);
    setType(null);
    setModele(null);
  };

  const filterOptions = [
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
      id: 'type',
      placeholder: 'Type',
      value: type,
      onChange: setType,
      options: [
        { label: 'Mémoire RAM', value: 'ram' },
        { label: 'Disque dur', value: 'hdd' },
        { label: 'Carte réseau', value: 'nic' },
      ],
    },
    {
      id: 'modele',
      placeholder: 'Modèle',
      value: modele,
      onChange: setModele,
      options: [
        { label: 'Samsung', value: 'samsung' },
        { label: 'Dell', value: 'dell' },
        { label: 'HP', value: 'hp' },
      ],
    },
  ];

  const filteredComposants = composants.filter(() => {
    // Apply filters when implemented
    return true;
  });

  const columns = [
    {
      header: 'PIC',
      accessor: 'pic' as const,
      cell: (value: string) => (
        <div className='flex justify-center'>
          <img
            width={40}
            src={value}
            alt='Composant'
            className='size-10 rounded-md border border-gray-200 object-cover'
          />
        </div>
      ),
    },
    { header: 'COMPOSANT', accessor: 'nom' as const },
    { header: 'Désignation', accessor: 'designation' as const },
    { header: 'Model / référence', accessor: 'modele' as const },
    { header: 'Numéro de série', accessor: 'numeroSerie' as const },
    {
      header: 'N° série équipement source',
      accessor: 'serieEquipement' as const,
    },
    {
      header: "N° d'inventaire équipement source",
      accessor: 'inventaire' as const,
    },
    {
      header: 'Observation',
      accessor: 'observation' as const,
      cell: (value: string) => (
        <Button variant='outline' className='border-mpsi text-mpsi'>
          {value}
        </Button>
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

        <div className='flex flex-wrap items-center justify-between gap-4'>
          <FilterGroup filters={filterOptions} onReset={handleReset} />
          <button className='rounded-md bg-[#1D6BF3] px-6 py-3.5 text-base text-white hover:bg-[#155dc2]'>
            Ajouter un composant
          </button>
        </div>

        <Table data={filteredComposants} columns={columns} />

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
