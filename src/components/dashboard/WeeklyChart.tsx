import { useState, memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Droplet, Moon, TrendingUp, Target } from 'lucide-react';

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
    color: '#7fdbca',
    goal: 10000,
    formatter: (value: number) => value.toLocaleString(),
  },
  water: {
    label: 'Water (L)',
    icon: Droplet,
    color: '#82aaff',
    goal: 2,
    formatter: (value: number) => `${value.toFixed(1)} L`,
  },
  sleep: {
    label: 'Sleep (hrs)',
    icon: Moon,
    color: '#c792ea',
    goal: 8,
    formatter: (value: number) => `${value.toFixed(1)} hrs`,
  },
  weight: {
    label: 'Weight (kg)',
    icon: TrendingUp,
    color: '#f78c6c',
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

  const daysAboveGoal = useMemo(() => {
    if (!currentConfig.goal) return 0;
    return data.filter(d => (d[selectedMetric] || 0) >= (currentConfig.goal || 0)).length;
  }, [data, selectedMetric, currentConfig.goal]);

  if (isLoading) {
    return (
      <div 
        className="rounded-xl p-6"
        style={{
          background: 'rgba(29, 59, 83, 0.6)',
          border: '1px solid rgba(127, 219, 202, 0.1)'
        }}
      >
        <div className="h-6 w-32 rounded mb-4 animate-pulse" style={{ background: 'rgba(95, 126, 151, 0.3)' }} />
        <div className="h-[300px] rounded-lg animate-pulse" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div 
        className="rounded-xl p-6"
        style={{
          background: 'rgba(29, 59, 83, 0.6)',
          border: '1px solid rgba(127, 219, 202, 0.1)'
        }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#d6deeb' }}>Weekly Overview</h2>
        <div className="h-[300px] flex flex-col items-center justify-center text-center" style={{ color: '#5f7e97' }}>
          <div className="mb-2 font-medium">No data yet</div>
          <div className="mb-4 text-sm">Start logging your health metrics to see your weekly overview.</div>
        </div>
      </div>
    );
  }

  const Icon = currentConfig.icon;

  return (
    <div 
      className="rounded-xl p-6 transition-all duration-300"
      style={{
        background: 'rgba(29, 59, 83, 0.6)',
        border: '1px solid rgba(127, 219, 202, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#d6deeb' }}>Weekly Overview</h2>
          {currentConfig.goal && daysAboveGoal > 0 && (
            <p className="text-xs flex items-center gap-1 mt-1" style={{ color: '#addb67' }}>
              <Target className="w-3 h-3" />
              {daysAboveGoal} of {data.length} days hit goal
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: '#5f7e97' }} />
          <span className="text-sm" style={{ color: '#5f7e97' }}>{currentConfig.label}</span>
        </div>
      </div>

      {/* Metric Toggle */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(metricConfig).map(([key, config]) => {
          const MetricIcon = config.icon;
          const isSelected = selectedMetric === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedMetric(key as MetricType)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={isSelected ? {
                background: 'rgba(127, 219, 202, 0.15)',
                border: '1px solid rgba(127, 219, 202, 0.3)',
                color: '#7fdbca'
              } : {
                background: 'rgba(95, 126, 151, 0.2)',
                border: '1px solid transparent',
                color: '#5f7e97'
              }}
            >
              <MetricIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(127, 219, 202, 0.1)" />
          <XAxis
            dataKey="date"
            stroke="#5f7e97"
            interval={0}
            tickMargin={8}
            tick={{ fill: '#5f7e97', fontSize: 12 }}
          />
          <YAxis
            stroke="#5f7e97"
            tick={{ fill: '#5f7e97', fontSize: 12 }}
            tickFormatter={(v) => {
              if (selectedMetric === 'steps') {
                return v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`;
              }
              return currentConfig.formatter(v);
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1d3b53',
              border: '1px solid rgba(127, 219, 202, 0.2)',
              borderRadius: '12px',
              color: '#d6deeb',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
            labelStyle={{ color: '#7fdbca' }}
            itemStyle={{ color: '#d6deeb' }}
            labelFormatter={(_, items) => items?.[0]?.payload?.fullDate || ''}
            formatter={(value) => [
              currentConfig.formatter(Number(value)),
              currentConfig.label,
            ]}
          />
          {/* Goal Reference Line */}
          {currentConfig.goal && (
            <ReferenceLine 
              y={currentConfig.goal} 
              stroke="#ffcb6b" 
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Goal: ${currentConfig.formatter(currentConfig.goal)}`,
                position: 'right',
                fill: '#ffcb6b',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          )}
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
        <div 
          className="mt-4 p-3 rounded-lg"
          style={{ background: 'rgba(11, 41, 66, 0.5)' }}
        >
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: '#5f7e97' }}>Weekly Average</span>
            <span className="font-medium" style={{ color: '#d6deeb' }}>
              {currentConfig.formatter(weeklyAverage)}
            </span>
          </div>
          <div 
            className="mt-2 rounded-full h-2"
            style={{ background: 'rgba(95, 126, 151, 0.3)' }}
          >
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${progressPercentage}%`,
                background: 'linear-gradient(90deg, #7fdbca 0%, #addb67 100%)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default WeeklyChart;
