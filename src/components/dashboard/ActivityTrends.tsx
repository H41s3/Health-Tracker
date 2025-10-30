import { memo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ActivityTrendsProps {
  data: Array<{
    date: string;
    fullDate: string;
    steps: number;
    water: number;
    sleep: number;
  }>;
  isLoading?: boolean;
}

const ActivityTrends = memo(function ActivityTrends({ data, isLoading }: ActivityTrendsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="h-6 w-32 bg-gray-100 rounded mb-4 animate-pulse" />
        <div className="h-[250px] rounded-lg bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Trends</h2>
        <div className="h-[250px] flex flex-col items-center justify-center text-center text-gray-500">
          <div className="mb-2 font-medium">No trends yet</div>
          <div className="mb-4 text-sm">Add a few days of data to see water and sleep trends.</div>
          <button
            onClick={() => document.getElementById('quick-log')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
          >
            Log today's data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Trends</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#6b7280" tickMargin={8} />
          <YAxis
            stroke="#6b7280"
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            labelFormatter={(_, items) => items?.[0]?.payload?.fullDate || ''}
            formatter={(value, name) => {
              if (name === 'water') return [`${Number(value).toFixed(1)} L`, 'Water'];
              if (name === 'sleep') return [`${Number(value).toFixed(1)} hrs`, 'Sleep'];
              return [String(value), name];
            }}
          />
          <Line 
            type="monotone" 
            dataKey="water" 
            stroke="#0ea5e9" 
            strokeWidth={2} 
            name="water" 
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="sleep" 
            stroke="#8b5cf6" 
            strokeWidth={2} 
            name="sleep" 
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default ActivityTrends;
