import { useState } from 'react';
import Layout from '~/components/layout/Layout';
import { Button } from '~/components/ui/Button';
import FilterGroup from '~/components/ui/FilterGroup';
import { Table } from '~/components/ui/Table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Equipement {
  pic: string;
  nom: string;
  designation: string;
  modele: string;
  numeroSerie: string;
  serviceAffectation: string;
  inventaire: string;
  observation: string;
}

const equipements: Equipement[] = [
  {
    pic: '/equipement.png',
    nom: 'Imprimante Laser',
    designation: 'Imprimante bureautique monochrome',
    modele: 'HP LaserJet Pro M404dn',
    numeroSerie: 'HPLJP45892X',
    serviceAffectation: 'Service Administratif',
    inventaire: 'INV-2021-078',
    observation: 'TBD',
  },
  {
    pic: '/equipement.png',
    nom: 'Ordinateur portable',
    designation: 'Portable professionnel 14"',
    modele: 'Dell Latitude 5420',
    numeroSerie: 'DL5420-78954',
    serviceAffectation: 'Service Informatique',
    inventaire: 'INV-2022-103',
    observation: 'TBD',
  },
  {
    pic: '/equipement.png',
    nom: 'Écran',
    designation: 'Écran 24" Full HD',
    modele: 'Samsung S24R350',
    numeroSerie: 'SASR24-32587',
    serviceAffectation: 'Service Pédagogique',
    inventaire: 'INV-2021-145',
    observation: 'TBD',
  },
  {
    pic: '/equipement.png',
    nom: 'Station de travail',
    designation: 'PC fixe haute performance',
    modele: 'HP Z2 Tower G5',
    numeroSerie: 'HPZ2G5-98732',
    serviceAffectation: 'Service Technique',
    inventaire: 'INV-2023-012',
    observation: 'TBD',
  },
  {
    pic: '/equipement.png',
    nom: 'Tablette',
    designation: 'iPad Pro 11 pouces',
    modele: 'Apple iPad Pro 2022',
    numeroSerie: 'APLIPAD-45621',
    serviceAffectation: 'Service Pédagogique',
    inventaire: 'INV-2022-089',
    observation: 'TBD',
  },
  {
    pic: '/equipement.png',
    nom: 'Serveur',
    designation: 'Serveur rack 1U',
    modele: 'Dell PowerEdge R440',
    numeroSerie: 'DLPE-772145',
    serviceAffectation: 'Service Informatique',
    inventaire: 'INV-2021-003',
    observation: 'TBD',
  },
];

export default function ListeEquipementsPage() {
  const [date, setDate] = useState<string | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  const handleReset = () => {
    setDate(null);
    setService(null);
    setType(null);
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
      id: 'service',
      placeholder: 'Service',
      value: service,
      onChange: setService,
      options: [
        { label: 'Service Informatique', value: 'informatique' },
        { label: 'Service Administratif', value: 'administratif' },
        { label: 'Service Pédagogique', value: 'pedagogique' },
        { label: 'Service Technique', value: 'technique' },
      ],
    },
    {
      id: 'type',
      placeholder: 'Type',
      value: type,
      onChange: setType,
      options: [
        { label: 'Imprimante', value: 'imprimante' },
        { label: 'Ordinateur portable', value: 'portable' },
        { label: 'Écran', value: 'ecran' },
        { label: 'Station de travail', value: 'station' },
        { label: 'Tablette', value: 'tablette' },
        { label: 'Serveur', value: 'serveur' },
      ],
    },
  ];

  const filteredEquipements = equipements.filter(() => {
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
            alt='Équipement'
            className='size-10 rounded-md border border-gray-200 object-cover'
          />
        </div>
      ),
    },
    { header: 'Équipement', accessor: 'nom' as const },
    { header: 'Désignation', accessor: 'designation' as const },
    { header: 'Model / référence', accessor: 'modele' as const },
    { header: 'Numéro de série', accessor: 'numeroSerie' as const },
    {
      header: "Service d'affectation",
      accessor: 'serviceAffectation' as const,
    },
    { header: "N° d'inventaire", accessor: 'inventaire' as const },
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
            Équipements{' '}
            <span className='text-black'>/ Liste des équipements</span>
          </h2>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-4'>
          <FilterGroup filters={filterOptions} onReset={handleReset} />
          <button className='rounded-md bg-[#1D6BF3] px-6 py-3.5 text-base text-white hover:bg-[#155dc2]'>
            Ajouter un équipement
          </button>
        </div>

        <Table data={filteredEquipements} columns={columns} />

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
