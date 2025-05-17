import { useState } from 'react';
import KpiCard from '../components/ui/KpiCards';
import MaintenanceChart from '../components/ui/MaintenanceChart';
import SmartInsights from '../components/ui/SmartInsights';
import ClientOnly from '../components/ui/ClientOnly';
import ModernDropdown from '../components/ui/DropDown';
import ComponentsTable from '../components/ui/Tableau';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

type MaintenanceData = {
  name: string;
  value: number;
};

type MaintenanceDataSet = {
  month: string;
  year: number;
  data: MaintenanceData[];
};

type InsightDataSet = {
  month: string;
  year: number;
  insights: { label: string; value: number; progress: number }[];
};

// Sample data sets for maintenance chart and insights
const maintenanceDataSets: MaintenanceDataSet[] = [
  {
    month: 'Janvier',
    year: 2025,
    data: [
      { name: '5k', value: 15 },
      { name: '10k', value: 25 },
      { name: '15k', value: 30 },
      { name: '20k', value: 70 },
    ],
  },
  {
    month: 'Février',
    year: 2025,
    data: [
      { name: '5k', value: 20 },
      { name: '10k', value: 30 },
      { name: '15k', value: 35 },
      { name: '20k', value: 85 },
    ],
  },
  {
    month: 'Mars',
    year: 2025,
    data: [
      { name: '5k', value: 18 },
      { name: '10k', value: 28 },
      { name: '15k', value: 32 },
      { name: '20k', value: 75 },
    ],
  },
  // Add more months/years as needed
];

const insightDataSets: InsightDataSet[] = [
  {
    month: 'Janvier',
    year: 2025,
    insights: [
      { label: 'Prédiction des demandes', value: 9500, progress: 80 },
      { label: 'Prédiction des composants', value: 10, progress: 55 },
    ],
  },
  {
    month: 'Février',
    year: 2025,
    insights: [
      { label: 'Prédiction des demandes', value: 10245, progress: 85 },
      { label: 'Prédiction des composants', value: 12, progress: 60 },
    ],
  },
  {
    month: 'Mars',
    year: 2025,
    insights: [
      { label: 'Prédiction des demandes', value: 9800, progress: 82 },
      { label: 'Prédiction des composants', value: 11, progress: 58 },
    ],
  },
  // Add more months/years as needed
];

const icons = {
  users: <img src='/demandes.png' alt='Demandes' className='size-6' />,
  components: <img src='/composants.png' alt='Composants' className='size-6' />,
  equipment: <img src='/icon.png' alt='Équipements' className='size-6' />,
  interventions: (
    <img src='/interventions.png' alt='Interventions' className='size-6' />
  ),
  rejected: <img src='/refuse.png' alt='Refusées' className='size-6' />,
};

const kpis = [
  {
    title: 'Total des demandes',
    value: '40 689',
    trend: {
      value: '8,5%',
      direction: 'up',
      comparison: 'En hausse par rapport à hier',
    },
    icon: icons.users,
  },
  {
    title: 'Total des composants',
    value: '10 293',
    trend: {
      value: '1,3%',
      direction: 'up',
      comparison: 'En hausse par rapport à la semaine dernière',
    },
    icon: icons.components,
  },
  {
    title: 'Total des équipements',
    value: '8 901',
    trend: {
      value: '4,3%',
      direction: 'down',
      comparison: 'En baisse par rapport à hier',
    },
    icon: icons.equipment,
  },
  {
    title: 'Interventions actives',
    value: '24',
    trend: {
      value: '1,8%',
      direction: 'up',
      comparison: 'En hausse par rapport à hier',
    },
    icon: icons.interventions,
  },
  {
    title: 'Demandes rejetées',
    value: '2 040',
    trend: {
      value: '1,8%',
      direction: 'up',
      comparison: 'En hausse par rapport à hier',
    },
    icon: icons.rejected,
  },
];

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
const years = ['2023', '2024', '2025'];

export default function Dashboard() {
  const [selectedMonthChart, setSelectedMonthChart] =
    useState<string>('Février');
  const [selectedYearChart, setSelectedYearChart] = useState<string>('2025');
  const [selectedMonthInsights, setSelectedMonthInsights] =
    useState<string>('Février');
  const [selectedYearInsights, setSelectedYearInsights] =
    useState<string>('2025');

  // Filter data based on selections with a default empty array fallback
  const chartData =
    maintenanceDataSets.find(
      (set) =>
        set.month === selectedMonthChart &&
        set.year === parseInt(selectedYearChart),
    )?.data || [];

  const insightsData =
    insightDataSets.find(
      (set) =>
        set.month === selectedMonthInsights &&
        set.year === parseInt(selectedYearInsights),
    )?.insights || [];

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar */}
      <Sidebar />

      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Topbar */}
        <Topbar />

        {/* Main Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          <h1 className='mb-6 text-3xl font-bold text-mpsi'>Tableau de bord</h1>

          <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5'>
            {kpis.map((kpi, index) => (
              <KpiCard
                key={index}
                title={kpi.title}
                value={kpi.value}
                trend={kpi.trend}
                icon={kpi.icon}
              />
            ))}
          </div>

          <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3'>
            <div className='rounded-xl bg-white p-4 shadow-md lg:col-span-2'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-xl font-semibold'>
                  Demandes de maintenance
                </h2>
                <div className='flex space-x-2'>
                  <ModernDropdown
                    options={months}
                    selected={selectedMonthChart}
                    onChange={setSelectedMonthChart}
                    label='Mois'
                  />
                  <ModernDropdown
                    options={years}
                    selected={selectedYearChart}
                    onChange={setSelectedYearChart}
                    label='Année'
                  />
                </div>
              </div>
              <div className='h-64'>
                <ClientOnly
                  fallback={
                    <div className='flex h-64 items-center justify-center bg-gray-50'>
                      Chargement du graphique...
                    </div>
                  }
                >
                  {() => <MaintenanceChart data={chartData} />}
                </ClientOnly>
              </div>
            </div>

            <SmartInsights
              insights={insightsData}
              selectedMonth={selectedMonthInsights}
              setSelectedMonth={setSelectedMonthInsights}
              selectedYear={selectedYearInsights}
              setSelectedYear={setSelectedYearInsights}
            />
          </div>

          {/* Components Table */}
          <ComponentsTable />
        </div>
      </div>
    </div>
  );
}
