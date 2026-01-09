import { Calendar, Clock, Heart } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { memo, useMemo } from 'react';
import { CycleTracking } from '../../types/database';

interface CycleVisualizationProps {
  cycles: CycleTracking[];
  prediction?: {
    nextPeriodStart: Date;
    nextPeriodEnd: Date;
    fertileStart?: Date;
    fertileEnd?: Date;
    averageCycleLength: number;
    stdDevDays: number;
    confidence: 'low' | 'medium' | 'high';
  };
}

// Night Owl phase colors
const phaseConfig = {
  menstrual: { 
    label: 'Menstrual Phase', 
    color1: '#ff6ac1',
    color2: '#ff5874',
    bgColor: 'rgba(255, 106, 193, 0.15)',
    textColor: '#ff6ac1',
    icon: Heart,
    description: 'Your period is active'
  },
  follicular: { 
    label: 'Follicular Phase', 
    color1: '#7fdbca',
    color2: '#addb67',
    bgColor: 'rgba(127, 219, 202, 0.15)',
    textColor: '#7fdbca',
    icon: Calendar,
    description: 'Preparing for ovulation'
  },
  ovulation: { 
    label: 'Ovulation', 
    color1: '#c792ea',
    color2: '#82aaff',
    bgColor: 'rgba(199, 146, 234, 0.15)',
    textColor: '#c792ea',
    icon: Heart,
    description: 'Most fertile period'
  },
  luteal: { 
    label: 'Luteal Phase', 
    color1: '#f78c6c',
    color2: '#ffcb6b',
    bgColor: 'rgba(247, 140, 108, 0.15)',
    textColor: '#f78c6c',
    icon: Clock,
    description: 'Post-ovulation phase'
  },
  unknown: { 
    label: 'Track Your Cycle', 
    color1: '#5f7e97',
    color2: '#7fdbca',
    bgColor: 'rgba(95, 126, 151, 0.15)',
    textColor: '#5f7e97',
    icon: Calendar,
    description: 'Start logging to see your cycle'
  }
};

const CycleVisualization = memo(function CycleVisualization({ cycles, prediction }: CycleVisualizationProps) {
  const currentDate = useMemo(() => new Date(), []);
  const lastCycle = cycles[0];
  
  const cyclePhase = useMemo(() => {
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
  }, [lastCycle, currentDate, cycles]);

  const { phase, days, progress } = cyclePhase;
  const currentPhase = phaseConfig[phase as keyof typeof phaseConfig] || phaseConfig.unknown;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Circular Progress */}
      <div 
        className="p-8 flex flex-col items-center justify-center rounded-xl"
        style={{
          background: 'rgba(29, 59, 83, 0.6)',
          border: '1px solid rgba(127, 219, 202, 0.1)'
        }}
      >
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(95, 126, 151, 0.3)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={`url(#gradient-${phase})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
            <defs>
              <linearGradient id={`gradient-${phase}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={currentPhase.color1} />
                <stop offset="100%" stopColor={currentPhase.color2} />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div 
              className="p-4 rounded-full shadow-lg"
              style={{ background: currentPhase.bgColor }}
            >
              <currentPhase.icon className="w-8 h-8" style={{ color: currentPhase.textColor }} />
            </div>
            <div className="mt-2 text-center">
              <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>{Math.round(progress)}%</div>
              <div className="text-sm" style={{ color: '#5f7e97' }}>Complete</div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-1" style={{ color: '#d6deeb' }}>{currentPhase.label}</h3>
          <p className="text-sm" style={{ color: '#5f7e97' }}>{currentPhase.description}</p>
          {days > 0 && (
            <p className="text-xs mt-1" style={{ color: '#5f7e97' }}>Day {days} of cycle</p>
          )}
        </div>
      </div>

      {/* Phase Information */}
      <div className="space-y-6">
        {/* Current Phase Card */}
        <div 
          className="p-6 rounded-xl"
          style={{
            background: currentPhase.bgColor,
            border: `1px solid ${currentPhase.textColor}30`
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <currentPhase.icon className="w-6 h-6" style={{ color: currentPhase.textColor }} />
            <h4 className="font-semibold" style={{ color: '#d6deeb' }}>Current Phase</h4>
          </div>
          <p className="text-sm" style={{ color: '#7fdbca' }}>{currentPhase.description}</p>
        </div>

        {/* Prediction Card */}
        {prediction && (
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-6 h-6" style={{ color: '#c792ea' }} />
              <h4 className="font-semibold" style={{ color: '#d6deeb' }}>Next Period</h4>
            </div>
            <div className="space-y-2">
              <p style={{ color: '#d6deeb' }}>
                <span className="font-medium">Likely window:</span>{' '}
                {format(prediction.nextPeriodStart, 'MMM dd')} – {format(prediction.nextPeriodEnd, 'MMM dd, yyyy')}
                <span 
                  className="ml-2 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: prediction.confidence === 'high' 
                      ? 'rgba(173, 219, 103, 0.2)' 
                      : prediction.confidence === 'low' 
                      ? 'rgba(255, 203, 107, 0.2)' 
                      : 'rgba(95, 126, 151, 0.2)',
                    color: prediction.confidence === 'high' 
                      ? '#addb67' 
                      : prediction.confidence === 'low' 
                      ? '#ffcb6b' 
                      : '#5f7e97'
                  }}
                >
                  {prediction.confidence} confidence
                </span>
              </p>
              <p className="text-sm" style={{ color: '#5f7e97' }}>
                Based on {cycles.length} recorded cycles (avg: {Math.round(prediction.averageCycleLength)} days, sd: {prediction.stdDevDays}d)
              </p>
              {prediction.fertileStart && prediction.fertileEnd && (
                <p className="text-sm" style={{ color: '#5f7e97' }}>
                  Fertile window: {format(prediction.fertileStart, 'MMM dd')} – {format(prediction.fertileEnd, 'MMM dd')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cycle Stats */}
        {cycles.length > 0 && (
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6" style={{ color: '#82aaff' }} />
              <h4 className="font-semibold" style={{ color: '#d6deeb' }}>Cycle Statistics</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>{cycles.length}</div>
                <div className="text-sm" style={{ color: '#5f7e97' }}>Cycles Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>
                  {Math.round(cycles.reduce((sum, cycle) => sum + (cycle.cycle_length_days || 28), 0) / cycles.length)}
                </div>
                <div className="text-sm" style={{ color: '#5f7e97' }}>Avg Length (days)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default CycleVisualization;
