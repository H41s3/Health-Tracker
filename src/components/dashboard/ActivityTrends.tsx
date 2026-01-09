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
      <div 
        className="rounded-xl p-6"
        style={{
          background: 'rgba(29, 59, 83, 0.6)',
          border: '1px solid rgba(127, 219, 202, 0.1)'
        }}
      >
        <div className="h-6 w-32 rounded mb-4 animate-pulse" style={{ background: 'rgba(95, 126, 151, 0.3)' }} />
        <div className="h-[250px] rounded-lg animate-pulse" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
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
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#d6deeb' }}>Activity Trends</h2>
        <div className="h-[250px] flex flex-col items-center justify-center text-center" style={{ color: '#5f7e97' }}>
          <div className="mb-2 font-medium">No trends yet</div>
          <div className="mb-4 text-sm">Add a few days of data to see water and sleep trends.</div>
          <button
            onClick={() => document.getElementById('quick-log')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 rounded-lg transition-all duration-200"
            style={{ 
              background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
              color: '#011627'
            }}
          >
            Log today's data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl p-6"
      style={{
        background: 'rgba(29, 59, 83, 0.6)',
        border: '1px solid rgba(127, 219, 202, 0.1)'
      }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: '#d6deeb' }}>Activity Trends</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(127, 219, 202, 0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="#5f7e97" 
            tickMargin={8}
            tick={{ fill: '#5f7e97', fontSize: 12 }}
          />
          <YAxis
            stroke="#5f7e97"
            tick={{ fill: '#5f7e97', fontSize: 12 }}
            tickFormatter={(v) => `${v}`}
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
            formatter={(value, name) => {
              if (name === 'water') return [`${Number(value).toFixed(1)} L`, 'Water'];
              if (name === 'sleep') return [`${Number(value).toFixed(1)} hrs`, 'Sleep'];
              return [String(value), name];
            }}
          />
          <Line 
            type="monotone" 
            dataKey="water" 
            stroke="#82aaff" 
            strokeWidth={2} 
            name="water" 
            dot={false}
            activeDot={{ fill: '#82aaff', stroke: '#1d3b53', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="sleep" 
            stroke="#c792ea" 
            strokeWidth={2} 
            name="sleep" 
            dot={false}
            activeDot={{ fill: '#c792ea', stroke: '#1d3b53', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default ActivityTrends;
