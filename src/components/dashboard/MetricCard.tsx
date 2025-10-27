import { Activity, Droplet, Moon, TrendingUp } from 'lucide-react';
import { memo, useMemo } from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  goal?: number;
  icon: typeof Activity | typeof Droplet | typeof Moon | typeof TrendingUp;
  color: 'emerald' | 'sky' | 'violet' | 'orange';
  isLoading?: boolean;
}

const MetricCard = memo(function MetricCard({ label, value, goal, icon: Icon, color, isLoading }: MetricCardProps) {
  const percentage = useMemo(() => goal ? Math.min((value / goal) * 100, 100) : 0, [value, goal]);
  const isGoalMet = useMemo(() => goal ? value >= goal : false, [value, goal]);
  const displayValue = useMemo(() => 
    value.toFixed(label.includes('Sleep') || label.includes('Weight') ? 1 : 0), 
    [value, label]
  );

  // Color class mappings to avoid dynamic Tailwind classes
  const colorClasses = {
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
      text: 'text-emerald-600',
      bar: 'bg-gradient-to-r from-emerald-400 to-emerald-500'
    },
    sky: {
      bg: 'bg-gradient-to-br from-sky-100 to-sky-200',
      text: 'text-sky-600',
      bar: 'bg-gradient-to-r from-sky-400 to-sky-500'
    },
    violet: {
      bg: 'bg-gradient-to-br from-violet-100 to-violet-200',
      text: 'text-violet-600',
      bar: 'bg-gradient-to-r from-violet-400 to-violet-500'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-100 to-orange-200',
      text: 'text-orange-600',
      bar: 'bg-gradient-to-r from-orange-400 to-orange-500'
    }
  };

  const colorClass = colorClasses[color];

  if (isLoading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-slate-100 rounded-xl w-12 h-12" />
          <div className="w-12 h-4 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-4 w-24 bg-slate-100 rounded-lg mb-3" />
        <div className="h-8 w-20 bg-slate-100 rounded-lg" />
        <div className="mt-4 bg-slate-100 rounded-full h-2 overflow-hidden" />
      </div>
    );
  }

  return (
    <div className="card p-6 group transition-transform hover:-translate-y-1 duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${colorClass.bg} rounded-xl shadow-sm transition-transform hover:scale-105 hover:rotate-2 duration-150`}>
          <Icon className={`w-6 h-6 ${colorClass.text}`} />
        </div>
        {goal && (
          <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
            isGoalMet 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      
      <h3 className="text-sm font-medium text-slate-600 mb-2">{label}</h3>
      <p className="text-3xl font-bold text-slate-900 mb-4">
        {displayValue}
      </p>
      
      {goal && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>0</span>
            <span>{goal.toLocaleString()}</span>
          </div>
          <div className="bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full ${colorClass.bar} rounded-full transition-all duration-300 ease-out ${
                isGoalMet ? 'shadow-lg' : ''
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {isGoalMet && (
            <div className="text-xs text-emerald-600 font-semibold text-center flex items-center justify-center gap-1">
              <span>🎉</span>
              Goal achieved!
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default MetricCard;
