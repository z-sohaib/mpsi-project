import { useState, useEffect } from 'react';
import {
  ComposedChart as RechartsComposedChart,
  Bar as RechartsBar,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer,
  CartesianGrid as RechartsCartesianGrid,
} from 'recharts';

type MaintenanceData = {
  name: string;
  value: number;
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
};

export default function MaintenanceChart({
  data,
}: {
  data: MaintenanceData[];
}) {
  const [chartLibrary, setChartLibrary] = useState<{
    ComposedChart: typeof RechartsComposedChart;
    Bar: typeof RechartsBar;
    XAxis: typeof RechartsXAxis;
    YAxis: typeof RechartsYAxis;
    Tooltip: typeof RechartsTooltip;
    ResponsiveContainer: typeof RechartsResponsiveContainer;
    CartesianGrid: typeof RechartsCartesianGrid;
  } | null>(null);

  useEffect(() => {
    import('recharts').then((module) => {
      setChartLibrary(module);
    });
  }, []);

  if (!chartLibrary) {
    return (
      <div className='flex h-64 items-center justify-center bg-gray-50'>
        Chargement du graphique...
      </div>
    );
  }

  const {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
  } = chartLibrary;

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className='rounded bg-mpsi px-2 py-1 text-sm text-white shadow-md'>
          {label}: {payload[0].value}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <ComposedChart data={data}>
        <defs>
          <linearGradient id='colorValue' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#E3F2FD' stopOpacity={1} />
            <stop offset='95%' stopColor='#E3F2FD' stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray='3 3' vertical={false} />
        <XAxis
          dataKey='name'
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#666' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          domain={[0, 50]}
          ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]}
          tickFormatter={(value) => `${value}`}
          tick={{ fontSize: 12, fill: '#666' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey='value' fill='#0D6EFD' fillOpacity={1} stroke='none' />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
