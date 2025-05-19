import { useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, data, redirect } from '@remix-run/node';
import KpiCard from '../components/ui/KpiCards';
import MaintenanceChart from '../components/ui/MaintenanceChart';
import SmartInsights from '../components/ui/SmartInsights';
import ClientOnly from '../components/ui/ClientOnly';
import ComponentsTable from '../components/ui/Tableau';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { requireUserId } from '~/session.server';
import {
  DashboardData,
  fetchDashboardData,
  mockDashboardData,
} from '~/models/dashboard.server';

const icons = {
  users: <img src='/demandes.png' alt='Demandes' className='size-6' />,
  components: <img src='/composants.png' alt='Composants' className='size-6' />,
  equipment: <img src='/icon.png' alt='Équipements' className='size-6' />,
  interventions: (
    <img src='/interventions.png' alt='Interventions' className='size-6' />
  ),
  ancien: <img src='/refuse.png' alt='Anciens Composants' className='size-6' />,
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check if user is authenticated, this will throw a redirect if not
    const session = await requireUserId(request);

    // User is authenticated, fetch dashboard data
    try {
      const dashboardData = await fetchDashboardData(session.access);
      return data({ dashboardData });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return mock data with error flag when API fails but user is authenticated
      return data({
        dashboardData: mockDashboardData,
        error: 'Failed to load dashboard data. Using sample data instead.',
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

// Type for our loader data
type LoaderData = {
  dashboardData: DashboardData;
  error?: string;
};

export default function Dashboard() {
  const { dashboardData, error: loaderError } = useLoaderData<LoaderData>();

  const [selectedAnalysisType, setSelectedAnalysisType] =
    useState('demandestats');
  const [selectedYear, setSelectedYear] = useState('2025');

  // Get available years from data for dropdowns
  const getAvailableYears = () => {
    if (!dashboardData) return ['2025'];
    const years = new Set<string>([
      ...dashboardData.demandestats.demande_years.map((y) => y.year.toString()),
      ...dashboardData.interventionsstats.intervention_years.map((y) =>
        y.year.toString(),
      ),
      ...dashboardData.composantstats.composant_years.map((y) =>
        y.year.toString(),
      ),
    ]);
    return Array.from(years).sort();
  };

  // Prepare KPI cards data from API response
  const prepareKpiCards = () => {
    if (!dashboardData || !dashboardData.totals) return [];
    return [
      {
        title: dashboardData.totals[0].name,
        value: dashboardData.totals[0].value.toLocaleString(),
        trend: {
          value: `${Math.abs(dashboardData.totals[0]['pourcentage diff'])}%`,
          direction:
            dashboardData.totals[0]['pourcentage diff'] >= 0
              ? ('up' as const)
              : ('down' as const),
          comparison:
            dashboardData.totals[0]['pourcentage diff'] >= 0
              ? 'en hausse par rapport au mois précédent'
              : 'En baisse par rapport à hier',
        },
        icon: icons.users,
      },
      {
        title: dashboardData.totals[3].name,
        value: dashboardData.totals[3].value.toLocaleString(),
        trend: {
          value: `${Math.abs(dashboardData.totals[3]['pourcentage diff'])}%`,
          direction:
            dashboardData.totals[3]['pourcentage diff'] >= 0 ? 'up' : 'down',
          comparison:
            dashboardData.totals[3]['pourcentage diff'] >= 0
              ? 'en hausse par rapport au mois précédent'
              : 'En baisse par rapport à hier',
        },
        icon: icons.components,
      },
      {
        title: dashboardData.totals[2].name,
        value: dashboardData.totals[2].value.toLocaleString(),
        trend: {
          value: `${Math.abs(dashboardData.totals[2]['pourcentage diff'])}%`,
          direction:
            dashboardData.totals[2]['pourcentage diff'] >= 0 ? 'up' : 'down',
          comparison:
            dashboardData.totals[2]['pourcentage diff'] >= 0
              ? 'en hausse par rapport au mois précédent'
              : 'En baisse par rapport à hier',
        },
        icon: icons.ancien,
      },
      {
        title: dashboardData.totals[4].name,
        value: dashboardData.totals[4].value.toLocaleString(),
        trend: {
          value: `${Math.abs(dashboardData.totals[4]['pourcentage diff'])}%`,
          direction:
            dashboardData.totals[4]['pourcentage diff'] >= 0 ? 'up' : 'down',
          comparison:
            dashboardData.totals[4]['pourcentage diff'] >= 0
              ? 'en hausse par rapport au mois précédent'
              : 'En baisse par rapport à hier',
        },
        icon: icons.equipment,
      },
      {
        title: dashboardData.totals[1].name,
        value: dashboardData.totals[1].value.toLocaleString(),
        trend: {
          value: `${Math.abs(dashboardData.totals[1]['pourcentage diff'])}%`,
          direction:
            dashboardData.totals[1]['pourcentage diff'] >= 0
              ? ('up' as const)
              : ('down' as const),
          comparison:
            dashboardData.totals[1]['pourcentage diff'] >= 0
              ? 'en hausse par rapport au mois précédent'
              : 'En baisse par rapport à hier',
        },
        icon: icons.interventions,
      },
    ];
  };

  // Prepare chart data from API response
  const getChartData = () => {
    if (!dashboardData || !dashboardData.demandes) return [];
    const selectedYearData = dashboardData.demandes.find(
      (yearData) => yearData.year === parseInt(selectedYear),
    );
    return (
      selectedYearData?.months.map((m) => ({
        name: m.month,
        value: m.value,
      })) || []
    );
  };

  // Get stats data based on selected analysis type
  const getStatsData = () => {
    if (!dashboardData) return null;
    switch (selectedAnalysisType) {
      case 'demandestats':
        return {
          total: dashboardData.demandestats.total,
          total_rejetee: dashboardData.demandestats['total rejetee'],
          total_acceptee: dashboardData.demandestats['total acceptee'],
          demande_years: dashboardData.demandestats.demande_years,
        };
      case 'interventionsstats':
        return {
          total: dashboardData.interventionsstats.total,
          total_irreparable:
            dashboardData.interventionsstats['total irreparable'],
          total_completed: dashboardData.interventionsstats['total completed'],
          total_encours: dashboardData.interventionsstats['total encours'],
          intervention_years:
            dashboardData.interventionsstats.intervention_years,
        };
      case 'composantstats':
        return {
          total: dashboardData.composantstats.total,
          total_ancien: dashboardData.composantstats['total ancien'],
          total_nouveau: dashboardData.composantstats['total nouveau'],
          composant_years: dashboardData.composantstats.composant_years,
        };
      default:
        return null;
    }
  };

  const availableYears = getAvailableYears();
  const kpiCards = prepareKpiCards();
  const chartData = getChartData();
  const statsData = getStatsData();

  // Show error notification if there was an error loading data
  if (loaderError) {
    return (
      <div className='flex min-h-screen bg-gray-100'>
        <div className='hidden lg:block'>
          <Sidebar />
        </div>
        <div className='flex flex-1 flex-col'>
          <Topbar />
          <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
            {/* Error notification */}
            <div className='mb-4 rounded-md bg-yellow-50 p-4'>
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
                  <h3 className='text-sm font-medium text-yellow-800'>Note</h3>
                  <div className='mt-2 text-sm text-yellow-700'>
                    <p>{loaderError}</p>
                  </div>
                </div>
              </div>
            </div>

            <h1 className='mb-4 text-center text-2xl font-bold text-blue-600 sm:text-3xl'>
              Tableau de bord
            </h1>

            <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
              {kpiCards.map((kpi, index) => (
                <KpiCard
                  key={index}
                  title={kpi.title}
                  value={kpi.value}
                  trend={kpi.trend}
                  icon={kpi.icon}
                />
              ))}
            </div>
            <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='relative rounded-xl border border-gray-200/50 bg-white/90 p-6 shadow-lg backdrop-blur-md'>
                <div className='absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-gray-500 to-gray-300 opacity-20' />
                <div className='mb-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between'>
                  <h2 className='text-xl font-semibold text-blue-600'>
                    Demandes de maintenance
                  </h2>
                </div>
                <div className='h-64'>
                  <ClientOnly
                    fallback={
                      <div className='flex h-full items-center justify-center bg-gray-500'>
                        Chargement du graphique...
                      </div>
                    }
                  >
                    {() => <MaintenanceChart data={chartData} />}
                  </ClientOnly>
                </div>
              </div>

              <SmartInsights
                statsData={statsData}
                selectedAnalysisType={selectedAnalysisType}
                setSelectedAnalysisType={setSelectedAnalysisType}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                availableYears={availableYears}
              />
            </div>
            <div className='mt-6 overflow-x-auto rounded-xl border border-gray-200/50 bg-white/90 p-6 shadow-lg backdrop-blur-md'>
              <ComponentsTable />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-gray-100'>
      <div className='hidden lg:block'>
        <Sidebar />
      </div>
      <div className='flex flex-1 flex-col'>
        <Topbar />
        <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
          <h1 className='mb-4 text-center text-2xl font-bold text-blue-600 sm:text-3xl'>
            Tableau de bord
          </h1>
          <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            {kpiCards.map((kpi, index) => (
              <KpiCard
                key={index}
                title={kpi.title}
                value={kpi.value}
                trend={kpi.trend}
                icon={kpi.icon}
              />
            ))}
          </div>
          <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='relative rounded-xl border border-gray-200/50 bg-white/90 p-6 shadow-lg backdrop-blur-md'>
              <div className='absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-gray-500 to-gray-300 opacity-20' />
              <div className='mb-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between'>
                <h2 className='text-xl font-semibold text-blue-600'>
                  Demandes de maintenance
                </h2>
              </div>
              <div className='h-64'>
                <ClientOnly
                  fallback={
                    <div className='flex h-full items-center justify-center bg-gray-500'>
                      Chargement du graphique...
                    </div>
                  }
                >
                  {() => <MaintenanceChart data={chartData} />}
                </ClientOnly>
              </div>
            </div>

            <SmartInsights
              statsData={statsData}
              selectedAnalysisType={selectedAnalysisType}
              setSelectedAnalysisType={setSelectedAnalysisType}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              availableYears={availableYears}
            />
          </div>
          <div className='mt-6 overflow-x-auto rounded-xl border border-gray-200/50 bg-white/90 p-6 shadow-lg backdrop-blur-md'>
            <ComponentsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
