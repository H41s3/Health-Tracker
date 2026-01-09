import { useMemo } from 'react';
import { Calendar, TrendingUp, Heart, Droplet } from 'lucide-react';
import { CycleTracking } from '../../types/database';
import { differenceInDays, format } from 'date-fns';
import { PredictionResult } from '../../utils/cyclePrediction';

interface CycleOverviewProps {
  cycles: CycleTracking[];
  prediction?: PredictionResult | null;
}

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';

// Night Owl phase config
const phaseConfig = {
  menstrual: {
    label: 'Menstruation',
    emoji: '🩸',
    color1: '#ff5874',
    color2: '#ff6ac1',
    bgColor: 'rgba(255, 88, 116, 0.15)',
    textColor: '#ff6ac1',
    description: 'Your period is here',
    icon: Droplet,
  },
  follicular: {
    label: 'Follicular Phase',
    emoji: '🌱',
    color1: '#ff6ac1',
    color2: '#c792ea',
    bgColor: 'rgba(255, 106, 193, 0.15)',
    textColor: '#ff6ac1',
    description: 'Building up to ovulation',
    icon: TrendingUp,
  },
  ovulation: {
    label: 'Ovulation',
    emoji: '🌸',
    color1: '#82aaff',
    color2: '#c792ea',
    bgColor: 'rgba(130, 170, 255, 0.15)',
    textColor: '#82aaff',
    description: 'Peak fertility window',
    icon: Heart,
  },
  luteal: {
    label: 'Luteal Phase',
    emoji: '🌙',
    color1: '#c792ea',
    color2: '#82aaff',
    bgColor: 'rgba(199, 146, 234, 0.15)',
    textColor: '#c792ea',
    description: 'Preparing for next cycle',
    icon: Calendar,
  },
  unknown: {
    label: 'Track Your Cycle',
    emoji: '📊',
    color1: '#5f7e97',
    color2: '#7fdbca',
    bgColor: 'rgba(95, 126, 151, 0.15)',
    textColor: '#5f7e97',
    description: 'Start logging to see insights',
    icon: Calendar,
  },
};

export default function CycleOverview({ cycles, prediction }: CycleOverviewProps) {
  const currentStatus = useMemo(() => {
    if (cycles.length === 0) {
      return {
        phase: 'unknown' as CyclePhase,
        cycleDay: 0,
        daysUntilPeriod: null,
        isOnPeriod: false,
        percentComplete: 0,
      };
    }

    const today = new Date();
    const lastCycle = cycles[0];
    const lastPeriodStart = new Date(lastCycle.period_start_date);
    const lastPeriodEnd = lastCycle.period_end_date 
      ? new Date(lastCycle.period_end_date)
      : new Date(lastPeriodStart.getTime() + 5 * 24 * 60 * 60 * 1000);

    const cycleDay = differenceInDays(today, lastPeriodStart) + 1;
    const isOnPeriod = today >= lastPeriodStart && today <= lastPeriodEnd;
    let phase: CyclePhase = 'unknown';
    const avgCycleLength = prediction?.averageCycleLength || 28;

    if (isOnPeriod) {
      phase = 'menstrual';
    } else if (cycleDay <= 13) {
      phase = 'follicular';
    } else if (cycleDay >= 14 && cycleDay <= 16) {
      phase = 'ovulation';
    } else if (cycleDay > 16) {
      phase = 'luteal';
    }

    const daysUntilPeriod = prediction 
      ? Math.max(0, differenceInDays(prediction.nextPeriodStart, today))
      : null;

    const percentComplete = Math.min((cycleDay / avgCycleLength) * 100, 100);

    return {
      phase,
      cycleDay: Math.max(1, cycleDay),
      daysUntilPeriod,
      isOnPeriod,
      percentComplete,
      avgCycleLength,
    };
  }, [cycles, prediction]);

  const config = phaseConfig[currentStatus.phase];
  const Icon = config.icon;

  return (
    <div 
      className="p-8 overflow-hidden relative rounded-xl"
      style={{
        background: 'rgba(29, 59, 83, 0.6)',
        border: '1px solid rgba(127, 219, 202, 0.1)'
      }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"
          style={{ background: `linear-gradient(135deg, ${config.color1} 0%, ${config.color2} 100%)` }}
        />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{config.emoji}</span>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#d6deeb' }}>{config.label}</h2>
            <p className="text-sm" style={{ color: '#5f7e97' }}>{config.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cycle Day */}
          <div className="relative">
            <div className="flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="8"
                  fill="none"
                  stroke="rgba(95, 126, 151, 0.3)"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={`url(#cycleGradient-${currentStatus.phase})`}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - currentStatus.percentComplete / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id={`cycleGradient-${currentStatus.phase}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={config.color1} />
                    <stop offset="100%" stopColor={config.color2} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: '#d6deeb' }}>
                  Day {currentStatus.cycleDay}
                </span>
                {currentStatus.avgCycleLength && (
                  <span className="text-sm" style={{ color: '#5f7e97' }}>
                    of ~{currentStatus.avgCycleLength}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Next Period Countdown */}
          <div 
            className="rounded-xl p-6"
            style={{
              background: config.bgColor,
              border: `1px solid ${config.textColor}30`
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="p-2 rounded-lg"
                style={{ background: `linear-gradient(135deg, ${config.color1} 0%, ${config.color2} 100%)` }}
              >
                <Calendar className="w-5 h-5" style={{ color: '#011627' }} />
              </div>
              <h3 className="font-semibold" style={{ color: '#d6deeb' }}>Next Period</h3>
            </div>
            {currentStatus.daysUntilPeriod !== null ? (
              <>
                <div className="text-4xl font-bold mb-2" style={{ color: '#d6deeb' }}>
                  {currentStatus.daysUntilPeriod}
                  <span className="text-xl ml-2" style={{ color: '#5f7e97' }}>days</span>
                </div>
                {prediction && (
                  <p className="text-sm" style={{ color: '#5f7e97' }}>
                    Expected: {format(prediction.nextPeriodStart, 'MMM dd, yyyy')}
                  </p>
                )}
              </>
            ) : (
              <p style={{ color: '#5f7e97' }}>Log more cycles for predictions</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <div 
              className="rounded-xl p-4"
              style={{
                background: 'rgba(11, 41, 66, 0.5)',
                border: '1px solid rgba(127, 219, 202, 0.1)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: '#5f7e97' }}>Current Status</p>
                  <p className="text-sm font-bold" style={{ color: config.textColor }}>
                    {currentStatus.isOnPeriod ? 'On Period' : config.label}
                  </p>
                </div>
                <Icon className="w-6 h-6" style={{ color: config.textColor }} />
              </div>
            </div>

            <div 
              className="rounded-xl p-4"
              style={{
                background: 'rgba(11, 41, 66, 0.5)',
                border: '1px solid rgba(127, 219, 202, 0.1)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: '#5f7e97' }}>Cycles Tracked</p>
                  <p className="text-sm font-bold" style={{ color: '#d6deeb' }}>{cycles.length}</p>
                </div>
                <TrendingUp className="w-6 h-6" style={{ color: '#7fdbca' }} />
              </div>
            </div>

            {currentStatus.avgCycleLength && (
              <div 
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(11, 41, 66, 0.5)',
                  border: '1px solid rgba(127, 219, 202, 0.1)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#5f7e97' }}>Avg Cycle</p>
                    <p className="text-sm font-bold" style={{ color: '#d6deeb' }}>
                      {currentStatus.avgCycleLength} days
                    </p>
                  </div>
                  <Calendar className="w-6 h-6" style={{ color: '#c792ea' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase Progress Bar */}
        {currentStatus.phase !== 'unknown' && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#7fdbca' }}>Cycle Progress</span>
              <span className="text-sm" style={{ color: '#5f7e97' }}>{Math.round(currentStatus.percentComplete)}%</span>
            </div>
            <div 
              className="w-full rounded-full h-3 overflow-hidden"
              style={{ background: 'rgba(95, 126, 151, 0.3)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${currentStatus.percentComplete}%`,
                  background: `linear-gradient(90deg, ${config.color1} 0%, ${config.color2} 100%)`
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
