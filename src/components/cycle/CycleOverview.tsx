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
      : new Date(lastPeriodStart.getTime() + 5 * 24 * 60 * 60 * 1000); // Assume 5 days

    // Calculate current cycle day
    const cycleDay = differenceInDays(today, lastPeriodStart) + 1;

    // Check if currently on period
    const isOnPeriod = today >= lastPeriodStart && today <= lastPeriodEnd;

    // Calculate cycle phase
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

    // Calculate days until next period
    const daysUntilPeriod = prediction 
      ? Math.max(0, differenceInDays(prediction.nextPeriodStart, today))
      : null;

    // Calculate progress percentage
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

  const phaseConfig = {
    menstrual: {
      label: 'Menstruation',
      emoji: '🩸',
      gradient: 'from-red-500 to-rose-600',
      bg: 'from-red-50 to-rose-50',
      text: 'text-red-700',
      description: 'Your period is here',
      icon: Droplet,
    },
    follicular: {
      label: 'Follicular Phase',
      emoji: '🌱',
      gradient: 'from-pink-500 to-rose-500',
      bg: 'from-pink-50 to-rose-50',
      text: 'text-pink-700',
      description: 'Building up to ovulation',
      icon: TrendingUp,
    },
    ovulation: {
      label: 'Ovulation',
      emoji: '🌸',
      gradient: 'from-blue-500 to-indigo-500',
      bg: 'from-blue-50 to-indigo-50',
      text: 'text-blue-700',
      description: 'Peak fertility window',
      icon: Heart,
    },
    luteal: {
      label: 'Luteal Phase',
      emoji: '🌙',
      gradient: 'from-purple-500 to-violet-500',
      bg: 'from-purple-50 to-violet-50',
      text: 'text-purple-700',
      description: 'Preparing for next cycle',
      icon: Calendar,
    },
    unknown: {
      label: 'Track Your Cycle',
      emoji: '📊',
      gradient: 'from-gray-400 to-gray-500',
      bg: 'from-gray-50 to-gray-100',
      text: 'text-gray-700',
      description: 'Start logging to see insights',
      icon: Calendar,
    },
  };

  const config = phaseConfig[currentStatus.phase];
  const Icon = config.icon;

  return (
    <div className="card-elevated p-8 overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${config.gradient} rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2`} />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{config.emoji}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{config.label}</h2>
            <p className="text-sm text-gray-600">{config.description}</p>
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
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#cycleGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - currentStatus.percentComplete / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="cycleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className={`text-${currentStatus.phase === 'menstrual' ? 'red' : currentStatus.phase === 'follicular' ? 'pink' : currentStatus.phase === 'ovulation' ? 'blue' : 'purple'}-500`} stopColor="currentColor" />
                    <stop offset="100%" className={`text-${currentStatus.phase === 'menstrual' ? 'rose' : currentStatus.phase === 'follicular' ? 'rose' : currentStatus.phase === 'ovulation' ? 'indigo' : 'violet'}-600`} stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  Day {currentStatus.cycleDay}
                </span>
                {currentStatus.avgCycleLength && (
                  <span className="text-sm text-gray-600">
                    of ~{currentStatus.avgCycleLength}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Next Period Countdown */}
          <div className={`bg-gradient-to-br ${config.bg} rounded-xl p-6 border-2 border-white/50 shadow-sm`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 bg-gradient-to-br ${config.gradient} rounded-lg`}>
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Next Period</h3>
            </div>
            {currentStatus.daysUntilPeriod !== null ? (
              <>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {currentStatus.daysUntilPeriod}
                  <span className="text-xl text-gray-600 ml-2">days</span>
                </div>
                {prediction && (
                  <p className="text-sm text-gray-600">
                    Expected: {format(prediction.nextPeriodStart, 'MMM dd, yyyy')}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-600">Log more cycles for predictions</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Current Status</p>
                  <p className={`text-sm font-bold ${config.text}`}>
                    {currentStatus.isOnPeriod ? 'On Period' : config.label}
                  </p>
                </div>
                <Icon className={`w-6 h-6 ${config.text}`} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Cycles Tracked</p>
                  <p className="text-sm font-bold text-gray-900">{cycles.length}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>

            {currentStatus.avgCycleLength && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Avg Cycle</p>
                    <p className="text-sm font-bold text-gray-900">
                      {currentStatus.avgCycleLength} days
                    </p>
                  </div>
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase Progress Bar */}
        {currentStatus.phase !== 'unknown' && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Cycle Progress</span>
              <span className="text-sm text-gray-600">{Math.round(currentStatus.percentComplete)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                style={{ width: `${currentStatus.percentComplete}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

