import ModernDropdown from './DropDown';

type Insight = {
  label: string;
  value: number;
  progress: number;
};

type SmartInsightsProps = {
  insights: Insight[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
};

export default function SmartInsights({
  insights,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}: SmartInsightsProps) {
  return (
    <div className='rounded-lg bg-white p-4 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-mpsi'>
          Aperçus intelligents
        </h2>
        <div className='flex space-x-2'>
          <ModernDropdown
            options={[
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
            ]}
            selected={selectedMonth}
            onChange={setSelectedMonth}
            label='Mois'
          />
          <ModernDropdown
            options={['2023', '2024', '2025']}
            selected={selectedYear}
            onChange={setSelectedYear}
            label='Année'
          />
        </div>
      </div>
      <div className='space-y-6'>
        {insights.map((insight, index) => (
          <div key={index}>
            <div className='mb-2 flex justify-between'>
              <span className='text-gray-700'>{insight.label}</span>
              <span className='font-semibold'>{insight.value}</span>
            </div>
            <ProgressBar value={insight.progress} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className='h-2 w-full rounded-full bg-gray-200'>
      <div
        className='h-full rounded-full bg-mpsi'
        style={{ width: `${Math.min(value, 100)}%` }}
      ></div>
    </div>
  );
}
