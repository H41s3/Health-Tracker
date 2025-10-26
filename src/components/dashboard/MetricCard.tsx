import { Activity, Droplet, Moon, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
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

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="card p-6 animate-pulse"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-slate-100 rounded-xl w-12 h-12" />
          <div className="w-12 h-4 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-4 w-24 bg-slate-100 rounded-lg mb-3" />
        <div className="h-8 w-20 bg-slate-100 rounded-lg" />
        <div className="mt-4 bg-slate-100 rounded-full h-2 overflow-hidden" />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="card p-6 group"
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div 
          className={`p-3 bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-xl shadow-sm`}
          whileHover={{ rotate: 2, scale: 1.05 }}
          transition={{ duration: 0.15 }}
        >
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </motion.div>
        {goal && (
          <motion.span 
            className={`text-sm font-semibold px-2 py-1 rounded-lg ${
              isGoalMet 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-slate-100 text-slate-600'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        )}
      </div>
      
      <h3 className="text-sm font-medium text-slate-600 mb-2">{label}</h3>
      <motion.p 
        className="text-3xl font-bold text-slate-900 mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        {displayValue}
      </motion.p>
      
      {goal && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>0</span>
            <span>{goal.toLocaleString()}</span>
          </div>
          <div className="bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div
              className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-500 rounded-full transition-all duration-500 ease-out ${
                isGoalMet ? 'shadow-lg' : ''
              }`}
              style={{ width: `${percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </div>
          {isGoalMet && (
            <motion.div 
              className="text-xs text-emerald-600 font-semibold text-center flex items-center justify-center gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <span className="animate-bounce-soft">🎉</span>
              Goal achieved!
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
});

export default MetricCard;
