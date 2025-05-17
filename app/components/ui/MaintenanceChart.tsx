import { useState, useEffect } from 'react';
import {
  ComposedChart as RechartsComposedChart,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer,
  Area as RechartsArea,
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
    Line: typeof RechartsLine;
    XAxis: typeof RechartsXAxis;
    YAxis: typeof RechartsYAxis;
    Tooltip: typeof RechartsTooltip;
    ResponsiveContainer: typeof RechartsResponsiveContainer;
    Area: typeof RechartsArea;
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
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    CartesianGrid,
  } = chartLibrary;

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className='rounded bg-mpsi px-2 py-1 text-sm text-white shadow-md'>
          {label}: {payload[0].value}%
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
          domain={[0, 100]}
          ticks={[0, 20, 40, 60, 80, 100]}
          tickFormatter={(value) => `${value}%`}
          tick={{ fontSize: 12, fill: '#666' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type='monotone'
          dataKey='value'
          fill='url(#colorValue)'
          fillOpacity={1}
          stroke='none'
        />
        <Line
          type='monotone'
          dataKey='value'
          stroke='#0D6EFD'
          strokeWidth={2}
          dot={{ r: 4, fill: '#0D6EFD' }}
          activeDot={{ r: 5, fill: '#0D6EFD' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
