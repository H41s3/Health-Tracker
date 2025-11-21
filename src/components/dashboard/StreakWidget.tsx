import { memo, useMemo } from 'react';
import { Flame, Calendar } from 'lucide-react';
import { HealthMetric } from '../../types/database';

interface StreakWidgetProps {
  metrics: HealthMetric[];
  isLoading?: boolean;
}

const StreakWidget = memo(function StreakWidget({ metrics, isLoading }: StreakWidgetProps) {
  // Calculate current streak with memoization
  const { current, longest } = useMemo(() => {
    if (metrics.length === 0) return { current: 0, longest: 0 };

    const today = new Date();
    const sortedMetrics = metrics
      .filter(m => m.steps > 0 || m.water_ml > 0 || m.sleep_hours || m.weight_kg)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak
    for (let i = 0; i < sortedMetrics.length; i++) {
      const metricDate = new Date(sortedMetrics[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (metricDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (let i = 0; i < sortedMetrics.length; i++) {
      if (i === 0 || new Date(sortedMetrics[i].date).getTime() === new Date(sortedMetrics[i - 1].date).getTime() - 24 * 60 * 60 * 1000) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return { current: currentStreak, longest: longestStreak };
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg w-10 h-10" />
          <div className="h-5 w-24 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-16 bg-gray-100 rounded mb-2" />
        <div className="h-4 w-32 bg-gray-100 rounded" />
      </div>
    );
  }

  const getStreakMessage = () => {
    if (current === 0) return "Start your streak today!";
    if (current === 1) return "Great start! Keep it up!";
    if (current < 7) return "Building momentum!";
    if (current < 30) return "Excellent consistency!";
    return "Incredible dedication!";
  };

  const getMilestone = () => {
    if (current >= 365) return { emoji: '👑', label: 'Legend', color: 'text-yellow-500' };
    if (current >= 180) return { emoji: '💎', label: 'Diamond', color: 'text-purple-500' };
    if (current >= 90) return { emoji: '🏆', label: 'Champion', color: 'text-yellow-600' };
    if (current >= 30) return { emoji: '🥇', label: 'Gold', color: 'text-yellow-500' };
    if (current >= 14) return { emoji: '🥈', label: 'Silver', color: 'text-gray-400' };
    if (current >= 7) return { emoji: '🥉', label: 'Bronze', color: 'text-orange-600' };
    if (current >= 3) return { emoji: '⭐', label: 'Starter', color: 'text-blue-500' };
    return null;
  };

  const getNextMilestone = () => {
    if (current < 3) return { target: 3, label: 'Starter' };
    if (current < 7) return { target: 7, label: 'Bronze' };
    if (current < 14) return { target: 14, label: 'Silver' };
    if (current < 30) return { target: 30, label: 'Gold' };
    if (current < 90) return { target: 90, label: 'Champion' };
    if (current < 180) return { target: 180, label: 'Diamond' };
    if (current < 365) return { target: 365, label: 'Legend' };
    return null;
  };

  const milestone = getMilestone();
  const nextMilestone = getNextMilestone();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Daily Streak</h3>
        </div>
        {milestone && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200`}>
            <span className="text-lg">{milestone.emoji}</span>
            <span className={`text-xs font-bold ${milestone.color}`}>{milestone.label}</span>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {current}
          <span className="text-lg text-gray-500 ml-1">days</span>
        </div>
        
        <div className="text-sm text-gray-600 mb-3">
          {getStreakMessage()}
        </div>
        
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Best: {longest} days</span>
          </div>
        </div>

        {/* Next Milestone Progress */}
        {nextMilestone && (
          <div className="mb-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-2">
              Next: {nextMilestone.label} ({nextMilestone.target - current} days to go)
            </div>
            <div className="w-full bg-white rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 transition-all duration-300"
                style={{ width: `${(current / nextMilestone.target) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {current > 0 && (
          <div className="flex justify-center">
            <div className="flex gap-1">
              {Array.from({ length: Math.min(current, 7) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i < current ? 'bg-orange-500 animate-pulse-soft' : 'bg-gray-200'
                  }`}
                />
              ))}
              {current > 7 && (
                <span className="text-xs text-orange-600 ml-1">+{current - 7}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default StreakWidget;
