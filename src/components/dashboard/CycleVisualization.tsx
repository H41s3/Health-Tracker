import { motion } from 'framer-motion';
import { Calendar, Clock, Heart } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface CycleVisualizationProps {
  cycles: any[];
  prediction?: {
    date: Date;
    cycleLengthAvg: number;
  };
}

export default function CycleVisualization({ cycles, prediction }: CycleVisualizationProps) {
  const currentDate = new Date();
  const lastCycle = cycles[0];
  
  // Calculate cycle phase
  const getCyclePhase = () => {
    if (!lastCycle) return { phase: 'unknown', days: 0, progress: 0 };
    
    const cycleStart = new Date(lastCycle.period_start_date);
    const daysSinceStart = differenceInDays(currentDate, cycleStart);
    const avgCycleLength = cycles.length > 0 
      ? cycles.reduce((sum, cycle) => sum + (cycle.cycle_length_days || 28), 0) / cycles.length 
      : 28;
    
    let phase = 'unknown';
    let progress = 0;
    
    if (daysSinceStart <= 5) {
      phase = 'menstrual';
      progress = (daysSinceStart / 5) * 25;
    } else if (daysSinceStart <= 13) {
      phase = 'follicular';
      progress = 25 + ((daysSinceStart - 5) / 8) * 25;
    } else if (daysSinceStart <= 16) {
      phase = 'ovulation';
      progress = 50 + ((daysSinceStart - 13) / 3) * 25;
    } else {
      phase = 'luteal';
      progress = 75 + ((daysSinceStart - 16) / (avgCycleLength - 16)) * 25;
    }
    
    return { phase, days: daysSinceStart, progress: Math.min(progress, 100) };
  };

  const { phase, days, progress } = getCyclePhase();
  
  const phaseInfo = {
    menstrual: { 
      label: 'Menstrual Phase', 
      color: 'from-rose-400 to-pink-500', 
      bgColor: 'from-rose-50 to-pink-100',
      icon: Heart,
      description: 'Your period is active'
    },
    follicular: { 
      label: 'Follicular Phase', 
      color: 'from-emerald-400 to-green-500', 
      bgColor: 'from-emerald-50 to-green-100',
      icon: Calendar,
      description: 'Preparing for ovulation'
    },
    ovulation: { 
      label: 'Ovulation', 
      color: 'from-violet-400 to-purple-500', 
      bgColor: 'from-violet-50 to-purple-100',
      icon: Heart,
      description: 'Most fertile period'
    },
    luteal: { 
      label: 'Luteal Phase', 
      color: 'from-orange-400 to-amber-500', 
      bgColor: 'from-orange-50 to-amber-100',
      icon: Clock,
      description: 'Post-ovulation phase'
    },
    unknown: { 
      label: 'Track Your Cycle', 
      color: 'from-slate-400 to-gray-500', 
      bgColor: 'from-slate-50 to-gray-100',
      icon: Calendar,
      description: 'Start logging to see your cycle'
    }
  };

  const currentPhase = phaseInfo[phase as keyof typeof phaseInfo];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Circular Progress */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card p-8 flex flex-col items-center justify-center"
      >
        <div className="relative w-48 h-48 mb-6">
          {/* Background circle */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={`url(#gradient-${phase})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id={`gradient-${phase}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={phase === 'menstrual' ? '#f43f5e' : phase === 'follicular' ? '#10b981' : phase === 'ovulation' ? '#8b5cf6' : '#f59e0b'} />
                <stop offset="100%" stopColor={phase === 'menstrual' ? '#ec4899' : phase === 'follicular' ? '#059669' : phase === 'ovulation' ? '#7c3aed' : '#d97706'} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`p-4 rounded-full bg-gradient-to-br ${currentPhase.bgColor} shadow-lg`}
            >
              <currentPhase.icon className={`w-8 h-8 text-${phase === 'menstrual' ? 'rose' : phase === 'follicular' ? 'emerald' : phase === 'ovulation' ? 'violet' : 'orange'}-600`} />
            </motion.div>
            <motion.div 
              className="mt-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="text-2xl font-bold text-slate-900">{Math.round(progress)}%</div>
              <div className="text-sm text-slate-600">Complete</div>
            </motion.div>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-1">{currentPhase.label}</h3>
          <p className="text-slate-600 text-sm">{currentPhase.description}</p>
          {days > 0 && (
            <p className="text-slate-500 text-xs mt-1">Day {days} of cycle</p>
          )}
        </div>
      </motion.div>

      {/* Phase Information */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        {/* Current Phase Card */}
        <div className={`card p-6 bg-gradient-to-br ${currentPhase.bgColor} border-${phase === 'menstrual' ? 'rose' : phase === 'follicular' ? 'emerald' : phase === 'ovulation' ? 'violet' : 'orange'}-200`}>
          <div className="flex items-center gap-3 mb-3">
            <currentPhase.icon className={`w-6 h-6 text-${phase === 'menstrual' ? 'rose' : phase === 'follicular' ? 'emerald' : phase === 'ovulation' ? 'violet' : 'orange'}-600`} />
            <h4 className="font-semibold text-slate-900">Current Phase</h4>
          </div>
          <p className="text-slate-700 text-sm">{currentPhase.description}</p>
        </div>

        {/* Prediction Card */}
        {prediction && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-6 h-6 text-violet-600" />
              <h4 className="font-semibold text-slate-900">Next Period</h4>
            </div>
            <div className="space-y-2">
              <p className="text-slate-700">
                <span className="font-medium">Expected:</span> {format(prediction.date, 'MMM dd, yyyy')}
              </p>
              <p className="text-slate-600 text-sm">
                Based on {cycles.length} recorded cycles (avg: {Math.round(prediction.cycleLengthAvg)} days)
              </p>
            </div>
          </motion.div>
        )}

        {/* Cycle Stats */}
        {cycles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-sky-600" />
              <h4 className="font-semibold text-slate-900">Cycle Statistics</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{cycles.length}</div>
                <div className="text-sm text-slate-600">Cycles Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {Math.round(cycles.reduce((sum, cycle) => sum + (cycle.cycle_length_days || 28), 0) / cycles.length)}
                </div>
                <div className="text-sm text-slate-600">Avg Length (days)</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
