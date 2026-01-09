import { memo, useMemo } from 'react';
import { Trophy, Target, Zap } from 'lucide-react';
import { HealthMetric } from '../../types/database';

interface TodaySummaryProps {
  todayMetric?: HealthMetric;
  isLoading?: boolean;
}

const TodaySummary = memo(function TodaySummary({ todayMetric, isLoading }: TodaySummaryProps) {
  const summary = useMemo(() => {
    if (!todayMetric) return { score: 0, goalsCompleted: 0, totalGoals: 0, goals: [] };

    const goals = [
      { met: (todayMetric.steps || 0) >= 10000, name: 'Steps' },
      { met: (todayMetric.water_ml || 0) >= 2000, name: 'Water' },
      { met: (todayMetric.sleep_hours || 0) >= 8, name: 'Sleep' },
    ];

    const goalsCompleted = goals.filter(g => g.met).length;
    const totalGoals = goals.length;
    const score = Math.round((goalsCompleted / totalGoals) * 100);

    return { score, goalsCompleted, totalGoals, goals };
  }, [todayMetric]);

  if (isLoading) {
    return (
      <div 
        className="card-elevated p-6"
        style={{
          background: 'rgba(29, 59, 83, 0.6)',
          border: '1px solid rgba(127, 219, 202, 0.1)'
        }}
      >
        <div className="animate-pulse flex items-center justify-between">
          <div className="flex-1">
            <div className="h-6 w-32 rounded mb-2" style={{ background: 'rgba(95, 126, 151, 0.3)' }} />
            <div className="h-4 w-48 rounded" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
          </div>
          <div className="w-20 h-20 rounded-full" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
        </div>
      </div>
    );
  }

  const getScoreColor = () => {
    if (summary.score >= 100) return '#addb67';
    if (summary.score >= 66) return '#82aaff';
    if (summary.score >= 33) return '#ffcb6b';
    return '#5f7e97';
  };

  const getScoreMessage = () => {
    if (summary.score >= 100) return 'Perfect day! All goals achieved!';
    if (summary.score >= 66) return 'Great progress! Keep it up!';
    if (summary.score >= 33) return 'Good start! You can do it!';
    return 'Let\'s get started today!';
  };

  const getScoreIcon = () => {
    if (summary.score >= 100) return Trophy;
    if (summary.score >= 66) return Zap;
    return Target;
  };

  const ScoreIcon = getScoreIcon();

  return (
    <div 
      className="card-elevated p-6 overflow-hidden relative"
      style={{
        background: 'rgba(29, 59, 83, 0.6)',
        border: '1px solid rgba(127, 219, 202, 0.1)'
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"
          style={{ background: 'linear-gradient(135deg, #7fdbca 0%, #c792ea 100%)' }}
        />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ScoreIcon className="w-5 h-5" style={{ color: getScoreColor() }} />
            <h2 className="text-lg font-bold" style={{ color: '#d6deeb' }}>Today's Progress</h2>
          </div>
          <p className="text-sm mb-3" style={{ color: '#5f7e97' }}>
            {getScoreMessage()}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold" style={{ color: '#7fdbca' }}>
              {summary.goalsCompleted} of {summary.totalGoals} goals completed
            </span>
            {summary.goalsCompleted > 0 && (
              <div className="flex gap-1">
                {summary.goals.filter(g => g.met).map((_, idx) => (
                  <span key={idx} style={{ color: '#addb67' }}>✓</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Score Circle */}
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="42"
              stroke="rgba(95, 126, 151, 0.3)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="42"
              stroke="url(#scoreGradientNight)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - summary.score / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradientNight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7fdbca" />
                <stop offset="100%" stopColor="#c792ea" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: getScoreColor() }}>
              {summary.score}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TodaySummary;
