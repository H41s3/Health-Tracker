import { useState, memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Droplet, Moon, TrendingUp } from 'lucide-react';

interface WeeklyChartProps {
  data: Array<{
    date: string;
    fullDate: string;
    steps: number;
    water: number;
    sleep: number;
    weight?: number;
  }>;
  isLoading?: boolean;
}

type MetricType = 'steps' | 'water' | 'sleep' | 'weight';

const metricConfig = {
  steps: {
    label: 'Steps',
    icon: Activity,
    color: '#10b981',
    goal: 10000,
    formatter: (value: number) => value.toLocaleString(),
  },
  water: {
    label: 'Water (L)',
    icon: Droplet,
    color: '#0ea5e9',
    goal: 2,
    formatter: (value: number) => `${value.toFixed(1)} L`,
  },
  sleep: {
    label: 'Sleep (hrs)',
    icon: Moon,
    color: '#8b5cf6',
    goal: 8,
    formatter: (value: number) => `${value.toFixed(1)} hrs`,
  },
  weight: {
    label: 'Weight (kg)',
    icon: TrendingUp,
    color: '#f97316',
    goal: null,
    formatter: (value: number) => `${value.toFixed(1)} kg`,
  },
};

const WeeklyChart = memo(function WeeklyChart({ data, isLoading }: WeeklyChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('steps');

  const currentConfig = useMemo(() => metricConfig[selectedMetric], [selectedMetric]);
  
  const weeklyAverage = useMemo(() => {
    if (data.length === 0) return 0;
    return data.reduce((sum, day) => sum + (day[selectedMetric] || 0), 0) / data.length;
  }, [data, selectedMetric]);
  
  const progressPercentage = useMemo(() => {
    if (!currentConfig.goal) return 0;
    return Math.min((weeklyAverage / currentConfig.goal) * 100, 100);
  }, [weeklyAverage, currentConfig.goal]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="h-6 w-32 bg-gray-100 rounded mb-4 animate-pulse" />
        <div className="h-[300px] rounded-lg bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Overview</h2>
        <div className="h-[300px] flex flex-col items-center justify-center text-center text-gray-500">
          <div className="mb-2 font-medium">No data yet</div>
          <div className="mb-4 text-sm">Start logging your health metrics to see your weekly overview.</div>
        </div>
      </div>
    );
  }

  const Icon = currentConfig.icon;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Overview</h2>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{currentConfig.label}</span>
        </div>
      </div>

      {/* Metric Toggle */}
      <div className="flex gap-2 mb-4">
        {Object.entries(metricConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isSelected = selectedMetric === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedMetric(key as MetricType)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            interval={0}
            tickMargin={8}
          />
          <YAxis
            stroke="#6b7280"
            tickFormatter={(v) => {
              if (selectedMetric === 'steps') {
                return v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`;
              }
              return currentConfig.formatter(v);
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            labelFormatter={(_, items) => items?.[0]?.payload?.fullDate || ''}
            formatter={(value) => [
              currentConfig.formatter(Number(value)),
              currentConfig.label,
            ]}
          />
          <Bar 
            dataKey={selectedMetric} 
            fill={currentConfig.color} 
            radius={[8, 8, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Goal Progress */}
      {currentConfig.goal && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Weekly Average</span>
            <span className="font-medium text-gray-900">
              {currentConfig.formatter(weeklyAverage)}
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default WeeklyChart;
