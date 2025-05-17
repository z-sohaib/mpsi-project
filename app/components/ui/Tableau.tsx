// Fixed Tableau.tsx
import { useState } from 'react';
import ModernDropdown from './DropDown';

type Component = {
  id: string;
  name: string;
  designation: string;
  serialNumber: string;
  inventoryNumber: number;
  assignedService: string;
  observation: 'Delivered' | 'Pending' | 'In Progress';
};

// Sample data for the components table
const componentsData: Record<string, Component[]> = {
  Janvier: [
    {
      id: '1',
      name: 'RAM 8gb',
      designation: 'HX432C16FB3AK2/8',
      serialNumber: '1393A021',
      inventoryNumber: 2,
      assignedService: 'Service réseaux',
      observation: 'Delivered',
    },
    {
      id: '2',
      name: 'RAM 8gb',
      designation: 'HX432C16FB3AK2/8',
      serialNumber: '1393A021',
      inventoryNumber: 2,
      assignedService: 'Service réseaux',
      observation: 'Delivered',
    },
    {
      id: '3',
      name: 'CPU i7',
      designation: 'Intel Core i7-10700K',
      serialNumber: '2489B032',
      inventoryNumber: 5,
      assignedService: 'Service développement',
      observation: 'Delivered',
    },
  ],
  Février: [
    {
      id: '4',
      name: 'SSD 500GB',
      designation: 'Samsung 970 EVO Plus',
      serialNumber: '2572C103',
      inventoryNumber: 8,
      assignedService: 'Service données',
      observation: 'Delivered',
    },
    {
      id: '5',
      name: 'GPU RTX 3060',
      designation: 'NVIDIA RTX 3060 Ti',
      serialNumber: '3861D104',
      inventoryNumber: 3,
      assignedService: 'Service AI',
      observation: 'Delivered',
    },
  ],
  Mars: [
    {
      id: '6',
      name: 'Carte mère Z590',
      designation: 'ASUS ROG STRIX Z590-E',
      serialNumber: '4729E205',
      inventoryNumber: 4,
      assignedService: 'Service réseaux',
      observation: 'Delivered',
    },
    {
      id: '7',
      name: 'RAM 16gb',
      designation: 'Corsair Vengeance RGB Pro',
      serialNumber: '5812F306',
      inventoryNumber: 6,
      assignedService: 'Service développement',
      observation: 'Delivered',
    },
  ],
  Avril: [
    {
      id: '8',
      name: 'NVMe 1TB',
      designation: 'WD Black SN850',
      serialNumber: '6927G407',
      inventoryNumber: 7,
      assignedService: 'Service données',
      observation: 'Delivered',
    },
  ],
  Mai: [
    {
      id: '9',
      name: 'Refroidisseur CPU',
      designation: 'Noctua NH-D15',
      serialNumber: '7038H508',
      inventoryNumber: 9,
      assignedService: 'Service AI',
      observation: 'Delivered',
    },
  ],
  Juin: [
    {
      id: '10',
      name: 'Alimentation 850W',
      designation: 'Corsair RM850x',
      serialNumber: '8149I609',
      inventoryNumber: 10,
      assignedService: 'Service réseaux',
      observation: 'Delivered',
    },
  ],
  Juillet: [
    {
      id: '11',
      name: 'Boîtier ATX',
      designation: 'Fractal Design Meshify 2',
      serialNumber: '9250J710',
      inventoryNumber: 11,
      assignedService: 'Service développement',
      observation: 'Delivered',
    },
  ],
  Août: [
    {
      id: '12',
      name: 'Ventilateur 140mm',
      designation: 'be quiet! Silent Wings 3',
      serialNumber: '1036K811',
      inventoryNumber: 12,
      assignedService: 'Service données',
      observation: 'Delivered',
    },
  ],
  Septembre: [
    {
      id: '13',
      name: 'SSD 1TB',
      designation: 'Crucial MX500',
      serialNumber: '1147L912',
      inventoryNumber: 13,
      assignedService: 'Service AI',
      observation: 'Delivered',
    },
  ],
  Octobre: [
    {
      id: '14',
      name: 'RAM 32gb',
      designation: 'G.Skill Trident Z Neo',
      serialNumber: '1258M013',
      inventoryNumber: 14,
      assignedService: 'Service réseaux',
      observation: 'Delivered',
    },
  ],
  Novembre: [
    {
      id: '15',
      name: 'CPU i9',
      designation: 'Intel Core i9-11900K',
      serialNumber: '1369N114',
      inventoryNumber: 15,
      assignedService: 'Service développement',
      observation: 'Delivered',
    },
  ],
  Décembre: [
    {
      id: '16',
      name: 'Carte mère B550',
      designation: 'MSI MAG B550 TOMAHAWK',
      serialNumber: '1470O215',
      inventoryNumber: 16,
      assignedService: 'Service données',
      observation: 'Delivered',
    },
  ],
};

// List of months for the dropdown
const months = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export default function ComponentsTable() {
  const [selectedMonth, setSelectedMonth] = useState<string>('Octobre');

  // Get components for the selected month
  const components = componentsData[selectedMonth] || [];

  return (
    <div className='mb-8 rounded-xl bg-white p-4 shadow-md'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-blue-600'>
          Détails des composants
        </h2>
        <ModernDropdown
          options={months}
          selected={selectedMonth}
          onChange={setSelectedMonth}
          label='Mois'
        />
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full'>
          <thead>
            <tr className='bg-mpsi text-white'>
              <th className='px-4 py-3 text-left'>Composant</th>
              <th className='px-4 py-3 text-left'>Désignation</th>
              <th className='px-4 py-3 text-left'>Numéro de serie</th>
              <th className='px-4 py-3 text-left'>N° inventaire</th>
              <th className='px-4 py-3 text-left'>
                Service d&apos;affectation
              </th>
              <th className='px-4 py-3 text-left'>Observation</th>
            </tr>
          </thead>
          <tbody>
            {components.map((component) => (
              <tr key={component.id} className='border-b hover:bg-gray-50'>
                <td className='flex items-center px-4 py-3'>
                  <img
                    src='/comp.png'
                    alt='Component'
                    className='mr-2 h-8 w-10'
                  />
                  {component.name}
                </td>
                <td className='px-4 py-3'>{component.designation}</td>
                <td className='px-4 py-3'>{component.serialNumber}</td>
                <td className='px-4 py-3'>{component.inventoryNumber}</td>
                <td className='px-4 py-3'>{component.assignedService}</td>
                <td className='px-4 py-3'>
                  <span
                    className={`rounded-full px-3 py-1 text-white ${
                      component.observation === 'Delivered'
                        ? 'bg-[#00B69B]'
                        : component.observation === 'Pending'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                    }`}
                  >
                    {component.observation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
