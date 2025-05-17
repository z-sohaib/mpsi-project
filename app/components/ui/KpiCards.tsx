import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/solid';

type KpiCardProps = {
  title: string;
  value: string | number;
  trend: {
    value: string;
    direction: 'up' | 'down';
    comparison: string;
  };
  icon: React.ReactNode;
};

export default function KpiCard({ title, value, trend, icon }: KpiCardProps) {
  return (
    <div className='flex flex-col rounded-lg border border-mpsi bg-white p-4 shadow-md transition-transform hover:scale-105'>
      <div className='mb-2 flex items-start justify-between'>
        <span className='text-sm text-gray-600'>{title}</span>
        <div className={`rounded-lg p-2 ${iconBgColor(title)}`}>{icon}</div>
      </div>
      <div className='mb-2 text-3xl font-bold'>{value}</div>
      <div className='flex items-center'>
        {trend.direction === 'up' ? (
          <ArrowTrendingUpIcon className='mr-1 size-4 text-green-500' />
        ) : (
          <ArrowTrendingDownIcon className='mr-1 size-4 text-red-500' />
        )}
        <span
          className={
            trend.direction === 'up'
              ? 'font-semibold text-green-500'
              : 'font-semibold text-red-500'
          }
        >
          {trend.value}
        </span>
        <span className='ml-1 text-sm text-black'>{trend.comparison}</span>
      </div>
    </div>
  );
}

// Mapping titles to Tailwind background color utility classes
function iconBgColor(title: string): string {
  switch (title) {
    case 'Total des demandes':
      return 'bg-purple-100';
    case 'Total des composants':
      return 'bg-yellow-100';
    case 'Total des équipements':
      return 'bg-green-100';
    case 'Interventions actives':
      return 'bg-blue-100';
    case 'Demandes rejetées':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
}
