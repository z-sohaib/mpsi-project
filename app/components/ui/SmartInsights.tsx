import { useState, useEffect } from 'react';
import { TrendingUp, BarChart2, PieChart, Calendar } from 'lucide-react';

// Define types for different stats
type DemandeStats = {
  total: number;
  total_rejetee: number;
  total_acceptee: number;
};

type InterventionsStats = {
  total: number;
  total_irreparable: number;
  total_completed: number;
  total_encours: number;
};

type ComposantStats = {
  total: number;
  total_ancien: number;
  total_nouveau: number;
};

// Union type for stats data
type StatsData = DemandeStats | InterventionsStats | ComposantStats;

// Props for the SmartInsights component
type SmartInsightsProps = {
  statsData: StatsData | null;
  selectedAnalysisType: string;
  setSelectedAnalysisType: (type: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
};

// Modern dropdown component
function ModernDropdown({
  options,
  selected,
  onChange,
  label,
  icon,
}: {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  label: string;
  icon?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    option: string,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChange(option);
      setIsOpen(false);
    }
  };

  return (
    <div className='relative'>
      <label className='mb-1 block text-xs font-medium text-gray-500'>
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
      >
        <div className='flex items-center gap-2'>
          {icon && <span className='text-blue-500'>{icon}</span>}
          <span className='truncate'>{selected}</span>
        </div>
        <svg
          className={`size-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 opacity-100  shadow-lg transition-opacity duration-200 ease-in-out'>
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              onKeyDown={(e) => handleKeyDown(e, option)}
              tabIndex={0}
              role='option'
              aria-selected={selected === option}
              className={`cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-blue-50 ${
                selected === option
                  ? 'bg-blue-50/50 font-medium text-blue-600'
                  : 'text-gray-700'
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Function to calculate progress percentage
const calculateProgress = (value: number, total: number) => {
  return total > 0 ? (value / total) * 100 : 0;
};

export default function SmartInsights({
  statsData,
  selectedAnalysisType,
  setSelectedAnalysisType,
  selectedYear,
  setSelectedYear,
}: SmartInsightsProps) {
  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  // For stats change animation
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    setAnimateStats(true);
    const timer = setTimeout(() => setAnimateStats(false), 500);
    return () => clearTimeout(timer);
  }, [selectedAnalysisType, selectedYear]);

  // Map analysis types to labels and icons for display
  const analysisOptions = [
    {
      value: 'demandestats',
      label: 'Statistiques des Demandes',
      icon: <BarChart2 size={16} />,
    },
    {
      value: 'interventionsstats',
      label: 'Statistiques des Interventions',
      icon: <TrendingUp size={16} />,
    },
    {
      value: 'composantstats',
      label: 'Statistiques des Composants',
      icon: <PieChart size={16} />,
    },
  ];

  const yearOptions = ['2024', '2025'];

  // Get the appropriate icon for the selected analysis type
  const getSelectedIcon = () => {
    const selectedOption = analysisOptions.find(
      (opt) => opt.value === selectedAnalysisType,
    );
    return selectedOption ? selectedOption.icon : <BarChart2 size={16} />;
  };

  // Determine which stats to display based on selectedAnalysisType
  const renderStats = () => {
    if (!statsData) {
      return (
        <div className='flex h-40 flex-col items-center justify-center text-gray-400'>
          <BarChart2 size={32} className='mb-2 opacity-50' />
          <p className='text-center'>Aucune donnée disponible.</p>
        </div>
      );
    }

    switch (selectedAnalysisType) {
      case 'demandestats': {
        const demandeStats = statsData as DemandeStats;
        return (
          <div className='space-y-4'>
            <StatCard
              label='Total des Demandes'
              value={demandeStats.total}
              progress={100}
              color='blue'
            />
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <StatCard
                label='Demandes Acceptées'
                value={demandeStats.total_acceptee}
                progress={calculateProgress(
                  demandeStats.total_acceptee,
                  demandeStats.total,
                )}
                color='green'
              />
              <StatCard
                label='Demandes Rejetées'
                value={demandeStats.total_rejetee}
                progress={calculateProgress(
                  demandeStats.total_rejetee,
                  demandeStats.total,
                )}
                color='red'
              />
            </div>
          </div>
        );
      }

      case 'interventionsstats': {
        const interventionsStats = statsData as InterventionsStats;
        return (
          <div className='space-y-4'>
            <StatCard
              label='Total des Interventions'
              value={interventionsStats.total}
              progress={100}
              color='blue'
            />
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <StatCard
                label='Interventions Terminées'
                value={interventionsStats.total_completed}
                progress={calculateProgress(
                  interventionsStats.total_completed,
                  interventionsStats.total,
                )}
                color='green'
              />
              <StatCard
                label='Interventions en Cours'
                value={interventionsStats.total_encours}
                progress={calculateProgress(
                  interventionsStats.total_encours,
                  interventionsStats.total,
                )}
                color='yellow'
              />
              <StatCard
                label='Interventions Irréparables'
                value={interventionsStats.total_irreparable}
                progress={calculateProgress(
                  interventionsStats.total_irreparable,
                  interventionsStats.total,
                )}
                color='red'
              />
            </div>
          </div>
        );
      }

      case 'composantstats': {
        const composantStats = statsData as ComposantStats;
        return (
          <div className='space-y-4'>
            <StatCard
              label='Total des Composants'
              value={composantStats.total}
              progress={100}
              color='blue'
            />
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <StatCard
                label='Composants Nouveaux'
                value={composantStats.total_nouveau}
                progress={calculateProgress(
                  composantStats.total_nouveau,
                  composantStats.total,
                )}
                color='green'
              />
              <StatCard
                label='Composants Anciens'
                value={composantStats.total_ancien}
                progress={calculateProgress(
                  composantStats.total_ancien,
                  composantStats.total,
                )}
                color='orange'
              />
            </div>
          </div>
        );
      }

      default:
        return (
          <div className='flex h-40 flex-col items-center justify-center text-gray-400'>
            <BarChart2 size={32} className='mb-2 opacity-50' />
            <p className='text-center'>Sélectionnez un type d&apos;analyse.</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 shadow-xl transition-all duration-700 
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
    >
      {/* Accent border */}
      <div className='absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600' />

      {/* Header Section with Title */}
      <div className='mb-6'>
        <div className='mb-1 flex items-center justify-center'>
          <TrendingUp className='mr-2 text-blue-500' size={20} />
          <h2 className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent'>
            Aper&ccedil;us Intelligents
          </h2>
        </div>
        <p className='mb-6 text-center text-sm text-gray-500'>
          Analysez les performances et tendances avec des insights
          d&eacute;taill&eacute;s
        </p>

        {/* Filters */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-center'>
          <div className='w-full sm:w-64'>
            <ModernDropdown
              options={analysisOptions.map((option) => option.label)}
              selected={
                analysisOptions.find(
                  (opt) => opt.value === selectedAnalysisType,
                )?.label || 'Sélectionner un type'
              }
              onChange={(label) => {
                const selectedOption = analysisOptions.find(
                  (opt) => opt.label === label,
                );
                if (selectedOption)
                  setSelectedAnalysisType(selectedOption.value);
              }}
              label="Type d'Analyse"
              icon={getSelectedIcon()}
            />
          </div>
          <div className='w-full sm:w-36'>
            <ModernDropdown
              options={yearOptions}
              selected={selectedYear}
              onChange={setSelectedYear}
              label='Année'
              icon={<Calendar size={16} />}
            />
          </div>
        </div>
      </div>

      {/* Stats Display */}
      <div
        className={`rounded-lg bg-white p-5 shadow-sm transition-all duration-500 
          ${animateStats ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
      >
        {renderStats()}
      </div>
    </div>
  );
}

// Enhanced stat card component with color variants
function StatCard({
  label,
  value,
  progress,
  color,
}: {
  label: string;
  value: number;
  progress: number;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'orange';
}) {
  // Color mappings
  const colorMap = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    red: 'from-red-400 to-red-600',
    yellow: 'from-yellow-400 to-amber-500',
    orange: 'from-orange-400 to-orange-600',
  };

  const bgColorMap = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    yellow: 'bg-amber-50',
    orange: 'bg-orange-50',
  };

  const textColorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-amber-600',
    orange: 'text-orange-600',
  };

  return (
    <div
      className={`group rounded-lg ${bgColorMap[color]} p-4 shadow-sm transition-all duration-300 hover:shadow-md`}
    >
      <div className='mb-2 flex items-center justify-between'>
        <span className={`text-sm font-medium ${textColorMap[color]}`}>
          {label}
        </span>
        <span className='text-lg font-bold text-gray-800'>
          {value.toLocaleString()}
        </span>
      </div>
      <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
