import { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import KpiCard from '../components/ui/KpiCards';
import MaintenanceChart from '../components/ui/MaintenanceChart';
import SmartInsights from '../components/ui/SmartInsights';
import ClientOnly from '../components/ui/ClientOnly';
import ComponentsTable from '../components/ui/Tableau';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

// Type definitions for the API response
type Total = {
  name: string;
  value: number;
  'pourcentage diff': number;
};

type MonthlyData = {
  month: string;
  value: number;
};

type YearlyData = {
  year: number;
  months: MonthlyData[];
};

type YearTotal = {
  year: number;
  total: number;
};

type DemandeStats = {
  year: number;
  total: number;
  'total rejetee': number;
  'total acceptee': number;
  demande_years: YearTotal[];
};

type InterventionsStats = {
  year: number;
  total: number;
  'total irreparable': number;
  'total completed': number;
  'total encours': number;
  intervention_years: YearTotal[];
};

type ComposantStats = {
  year: number;
  total: number;
  'total ancien': number;
  'total nouveau': number;
  composant_years: YearTotal[];
};

type EquipementStats = {
  year: number;
  total: number;
};

type DashboardData = {
  totals: Total[];
  demandes: YearlyData[];
  demandestats: DemandeStats;
  interventionsstats: InterventionsStats;
  composantstats: ComposantStats;
  equipementstats: EquipementStats[];
};

const icons = {
  users: <img src='/demandes.png' alt='Demandes' className='size-6' />,
  components: <img src='/composants.png' alt='Composants' className='size-6' />,
  equipment: <img src='/icon.png' alt='Équipements' className='size-6' />,
  interventions: (
    <img src='/interventions.png' alt='Interventions' className='size-6' />
  ),
  ancien: <img src='/refuse.png' alt='Anciens Composants' className='size-6' />,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
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

  // Fetch dashboard data with proper authentication header
  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (mounted) navigate('/auth', { replace: true });
          return;
        }

        setLoading(true);
        const response = await fetch(
          'https://itms-mpsi.onrender.com/api/dashboard/',
          {
            headers: {
              Authorization: `Token ${token}`, // Changed to match Django TokenAuthentication
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (mounted) setDashboardData(data);
        } else if (response.status === 401) {
          console.warn(
            `API returned ${response.status}. Invalid token. Logging out...`,
          );
          localStorage.removeItem('token');
          if (mounted) navigate('/auth', { replace: true });
        } else {
          console.warn(
            `API returned ${response.status}. Using mock data instead.`,
          );
          const mockData: DashboardData = {
            totals: [
              {
                name: 'Total des demandes',
                value: 30,
                'pourcentage diff': 100,
              },
              {
                name: 'Interventions actives',
                value: 4,
                'pourcentage diff': 100,
              },
              {
                name: 'Anciens composants disponibles',
                value: 20,
                'pourcentage diff': 100,
              },
              {
                name: 'Nouveaux composants disponibles',
                value: 23,
                'pourcentage diff': 100,
              },
              { name: 'Équipements total', value: 6, 'pourcentage diff': 100 },
            ],
            demandes: [{ year: 2025, months: [{ month: 'May', value: 30 }] }],
            demandestats: {
              year: 2025,
              total: 30,
              'total rejetee': 6,
              'total acceptee': 18,
              demande_years: [{ year: 2025, total: 30 }],
            },
            interventionsstats: {
              year: 2025,
              total: 18,
              'total irreparable': 6,
              'total completed': 8,
              'total encours': 4,
              intervention_years: [{ year: 2025, total: 18 }],
            },
            composantstats: {
              year: 2025,
              total: 43,
              'total ancien': 20,
              'total nouveau': 23,
              composant_years: [{ year: 2025, total: 43 }],
            },
            equipementstats: [{ year: 2025, total: 6 }],
          };
          if (mounted) setDashboardData(mockData);
        }
      } catch (err) {
        console.error('API fetch failed:', err);
        if (mounted) {
          setError('Failed to load dashboard data. Using mock data.');
          const mockData: DashboardData = {
            totals: [
              {
                name: 'Total des demandes',
                value: 30,
                'pourcentage diff': 100,
              },
              {
                name: 'Interventions actives',
                value: 4,
                'pourcentage diff': 100,
              },
              {
                name: 'Anciens composants disponibles',
                value: 20,
                'pourcentage diff': 100,
              },
              {
                name: 'Nouveaux composants disponibles',
                value: 23,
                'pourcentage diff': 100,
              },
              { name: 'Équipements total', value: 6, 'pourcentage diff': 100 },
            ],
            demandes: [{ year: 2025, months: [{ month: 'May', value: 30 }] }],
            demandestats: {
              year: 2025,
              total: 30,
              'total rejetee': 6,
              'total acceptee': 18,
              demande_years: [{ year: 2025, total: 30 }],
            },
            interventionsstats: {
              year: 2025,
              total: 18,
              'total irreparable': 6,
              'total completed': 8,
              'total encours': 4,
              intervention_years: [{ year: 2025, total: 18 }],
            },
            composantstats: {
              year: 2025,
              total: 43,
              'total ancien': 20,
              'total nouveau': 23,
              composant_years: [{ year: 2025, total: 43 }],
            },
            equipementstats: [{ year: 2025, total: 6 }],
          };
          if (mounted) setDashboardData(mockData);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, [navigate]);

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
            dashboardData.totals[0]['pourcentage diff'] >= 0 ? 'up' : 'down',
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
            dashboardData.totals[1]['pourcentage diff'] >= 0 ? 'up' : 'down',
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

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <div className='mx-auto mb-2 size-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600'></div>
          <p className='text-gray-600'>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
              availableYears={availableYears} // Pass availableYears to SmartInsights
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
