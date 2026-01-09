import { Activity, Droplet, Moon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { memo, useMemo } from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  goal?: number;
  icon: typeof Activity | typeof Droplet | typeof Moon | typeof TrendingUp;
  color: 'emerald' | 'sky' | 'violet' | 'orange';
  isLoading?: boolean;
  previousValue?: number;
}

// Night Owl color mappings
const colorClasses = {
  emerald: {
    bg: 'rgba(127, 219, 202, 0.15)',
    bgGradient: 'linear-gradient(135deg, rgba(127, 219, 202, 0.2) 0%, rgba(127, 219, 202, 0.05) 100%)',
    text: '#7fdbca',
    bar: 'linear-gradient(90deg, #7fdbca 0%, #addb67 100%)',
    glow: '0 0 20px rgba(127, 219, 202, 0.3)'
  },
  sky: {
    bg: 'rgba(130, 170, 255, 0.15)',
    bgGradient: 'linear-gradient(135deg, rgba(130, 170, 255, 0.2) 0%, rgba(130, 170, 255, 0.05) 100%)',
    text: '#82aaff',
    bar: 'linear-gradient(90deg, #82aaff 0%, #7fdbca 100%)',
    glow: '0 0 20px rgba(130, 170, 255, 0.3)'
  },
  violet: {
    bg: 'rgba(199, 146, 234, 0.15)',
    bgGradient: 'linear-gradient(135deg, rgba(199, 146, 234, 0.2) 0%, rgba(199, 146, 234, 0.05) 100%)',
    text: '#c792ea',
    bar: 'linear-gradient(90deg, #c792ea 0%, #82aaff 100%)',
    glow: '0 0 20px rgba(199, 146, 234, 0.3)'
  },
  orange: {
    bg: 'rgba(247, 140, 108, 0.15)',
    bgGradient: 'linear-gradient(135deg, rgba(247, 140, 108, 0.2) 0%, rgba(247, 140, 108, 0.05) 100%)',
    text: '#f78c6c',
    bar: 'linear-gradient(90deg, #f78c6c 0%, #ffcb6b 100%)',
    glow: '0 0 20px rgba(247, 140, 108, 0.3)'
  }
};

const MetricCard = memo(function MetricCard({ label, value, goal, icon: Icon, color, isLoading, previousValue }: MetricCardProps) {
  const percentage = useMemo(() => goal ? Math.min((value / goal) * 100, 100) : 0, [value, goal]);
  const isGoalMet = useMemo(() => goal ? value >= goal : false, [value, goal]);
  const displayValue = useMemo(() => 
    value.toFixed(label.includes('Sleep') || label.includes('Weight') ? 1 : 0), 
    [value, label]
  );

  const change = useMemo(() => {
    if (!previousValue || previousValue === 0) return null;
    const diff = value - previousValue;
    const percentChange = (diff / previousValue) * 100;
    return { diff, percentChange: Math.abs(percentChange) };
  }, [value, previousValue]);

  const TrendIcon = useMemo(() => {
    if (!change || Math.abs(change.diff) < 0.01) return Minus;
    return change.diff > 0 ? TrendingUp : TrendingDown;
  }, [change]);

  const trendColor = useMemo(() => {
    if (!change || Math.abs(change.diff) < 0.01) return '#5f7e97';
    return change.diff > 0 ? '#addb67' : '#ff5874';
  }, [change]);

  const colorStyle = colorClasses[color];

  if (isLoading) {
    return (
      <div 
        className="card p-6"
        style={{
          background: 'rgba(29, 59, 83, 0.6)',
          border: '1px solid rgba(127, 219, 202, 0.1)'
        }}
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl w-12 h-12" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
            <div className="w-12 h-4 rounded-lg" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
          </div>
          <div className="h-4 w-24 rounded-lg mb-3" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
          <div className="h-8 w-20 rounded-lg" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
          <div className="mt-4 rounded-full h-2 overflow-hidden" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="card p-6 group transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'rgba(29, 59, 83, 0.6)',
        border: '1px solid rgba(127, 219, 202, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${colorStyle.text}40`;
        e.currentTarget.style.boxShadow = colorStyle.glow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="p-3 rounded-xl transition-transform duration-200 group-hover:scale-105"
          style={{ background: colorStyle.bgGradient }}
        >
          <Icon className="w-6 h-6" style={{ color: colorStyle.text }} />
        </div>
        {goal && (
          <span 
            className="text-sm font-semibold px-3 py-1 rounded-lg transition-all duration-200"
            style={{ 
              background: isGoalMet ? 'rgba(173, 219, 103, 0.2)' : 'rgba(95, 126, 151, 0.2)',
              color: isGoalMet ? '#addb67' : '#5f7e97',
              border: isGoalMet ? '1px solid rgba(173, 219, 103, 0.3)' : '1px solid transparent'
            }}
          >
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      
      <h3 className="text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>{label}</h3>
      <div className="flex items-baseline gap-2 mb-4">
        <p className="text-3xl font-bold" style={{ color: '#d6deeb' }}>
          {displayValue}
        </p>
        {change && (
          <div className="flex items-center gap-0.5 text-xs font-medium" style={{ color: trendColor }}>
            <TrendIcon className="w-3 h-3" />
            <span>{change.percentChange.toFixed(0)}%</span>
          </div>
        )}
      </div>
      
      {goal && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-medium" style={{ color: '#5f7e97' }}>
            <span>0</span>
            <span>{goal.toLocaleString()}</span>
          </div>
          <div 
            className="rounded-full h-2 overflow-hidden"
            style={{ background: 'rgba(95, 126, 151, 0.2)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${percentage}%`,
                background: colorStyle.bar,
                boxShadow: isGoalMet ? colorStyle.glow : 'none'
              }}
            />
          </div>
          {isGoalMet && (
            <div 
              className="text-xs font-semibold text-center flex items-center justify-center gap-1"
              style={{ color: '#addb67' }}
            >
              <span className="text-base">🎉</span>
              Goal achieved!
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default MetricCard;
