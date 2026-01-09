import { memo, useMemo } from 'react';
import { Flame, Calendar } from 'lucide-react';
import { HealthMetric } from '../../types/database';

interface StreakWidgetProps {
  metrics: HealthMetric[];
  isLoading?: boolean;
}

const StreakWidget = memo(function StreakWidget({ metrics, isLoading }: StreakWidgetProps) {
  const { current, longest } = useMemo(() => {
    if (metrics.length === 0) return { current: 0, longest: 0 };

    const today = new Date();
    const sortedMetrics = metrics
      .filter(m => m.steps > 0 || m.water_ml > 0 || m.sleep_hours || m.weight_kg)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

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
      <div 
        className="rounded-xl p-6"
        style={{
          background: 'rgba(29, 59, 83, 0.6)',
          border: '1px solid rgba(127, 219, 202, 0.1)'
        }}
      >
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg w-10 h-10" style={{ background: 'rgba(247, 140, 108, 0.2)' }} />
            <div className="h-5 w-24 rounded" style={{ background: 'rgba(95, 126, 151, 0.3)' }} />
          </div>
          <div className="h-8 w-16 rounded mb-2" style={{ background: 'rgba(95, 126, 151, 0.3)' }} />
          <div className="h-4 w-32 rounded" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
        </div>
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
    if (current >= 365) return { emoji: '👑', label: 'Legend', color: '#ffcb6b' };
    if (current >= 180) return { emoji: '💎', label: 'Diamond', color: '#c792ea' };
    if (current >= 90) return { emoji: '🏆', label: 'Champion', color: '#ffcb6b' };
    if (current >= 30) return { emoji: '🥇', label: 'Gold', color: '#ffcb6b' };
    if (current >= 14) return { emoji: '🥈', label: 'Silver', color: '#7fdbca' };
    if (current >= 7) return { emoji: '🥉', label: 'Bronze', color: '#f78c6c' };
    if (current >= 3) return { emoji: '⭐', label: 'Starter', color: '#82aaff' };
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
    <div 
      className="rounded-xl p-6 transition-all duration-300"
      style={{
        background: 'rgba(29, 59, 83, 0.6)',
        border: '1px solid rgba(127, 219, 202, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ background: 'rgba(247, 140, 108, 0.15)' }}
          >
            <Flame className="w-5 h-5" style={{ color: '#f78c6c' }} />
          </div>
          <h3 className="text-sm font-medium" style={{ color: '#5f7e97' }}>Daily Streak</h3>
        </div>
        {milestone && (
          <div 
            className="flex items-center gap-1 px-3 py-1 rounded-full"
            style={{
              background: 'rgba(247, 140, 108, 0.1)',
              border: '1px solid rgba(247, 140, 108, 0.2)'
            }}
          >
            <span className="text-lg">{milestone.emoji}</span>
            <span className="text-xs font-bold" style={{ color: milestone.color }}>{milestone.label}</span>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold mb-2" style={{ color: '#d6deeb' }}>
          {current}
          <span className="text-lg ml-1" style={{ color: '#5f7e97' }}>days</span>
        </div>
        
        <div className="text-sm mb-3" style={{ color: '#5f7e97' }}>
          {getStreakMessage()}
        </div>
        
        <div className="flex items-center justify-center gap-4 text-xs mb-3" style={{ color: '#5f7e97' }}>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Best: {longest} days</span>
          </div>
        </div>

        {nextMilestone && (
          <div 
            className="mb-3 p-3 rounded-lg"
            style={{ background: 'rgba(247, 140, 108, 0.1)' }}
          >
            <div className="text-xs font-medium mb-2" style={{ color: '#f78c6c' }}>
              Next: {nextMilestone.label} ({nextMilestone.target - current} days to go)
            </div>
            <div 
              className="w-full rounded-full h-2 overflow-hidden"
              style={{ background: 'rgba(95, 126, 151, 0.3)' }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${(current / nextMilestone.target) * 100}%`,
                  background: 'linear-gradient(90deg, #f78c6c 0%, #ffcb6b 100%)'
                }}
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
                  className="w-2 h-2 rounded-full animate-pulse-soft"
                  style={{ background: '#f78c6c' }}
                />
              ))}
              {current > 7 && (
                <span className="text-xs ml-1" style={{ color: '#f78c6c' }}>+{current - 7}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default StreakWidget;
