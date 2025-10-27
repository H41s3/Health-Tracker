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

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Flame className="w-5 h-5 text-orange-600" />
        </div>
        <h3 className="text-sm font-medium text-gray-600">Daily Streak</h3>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {current}
          <span className="text-lg text-gray-500 ml-1">days</span>
        </div>
        
        <div className="text-sm text-gray-600 mb-3">
          {getStreakMessage()}
        </div>
        
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Best: {longest} days</span>
          </div>
        </div>
        
        {current > 0 && (
          <div className="mt-3 flex justify-center">
            <div className="flex gap-1">
              {Array.from({ length: Math.min(current, 7) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < current ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default StreakWidget;
