import { memo, useMemo } from 'react';
import { Trophy, Target, Zap } from 'lucide-react';
import { HealthMetric } from '../../types/database';

interface TodaySummaryProps {
  todayMetric?: HealthMetric;
  isLoading?: boolean;
}

const TodaySummary = memo(function TodaySummary({ todayMetric, isLoading }: TodaySummaryProps) {
  const summary = useMemo(() => {
    if (!todayMetric) return { score: 0, goalsCompleted: 0, totalGoals: 0 };

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
      <div className="card-elevated p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  const getScoreColor = () => {
    if (summary.score >= 100) return 'from-emerald-500 to-green-500';
    if (summary.score >= 66) return 'from-blue-500 to-indigo-500';
    if (summary.score >= 33) return 'from-amber-500 to-orange-500';
    return 'from-slate-400 to-slate-500';
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
    <div className="card-elevated p-6 overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ScoreIcon className={`w-5 h-5 bg-gradient-to-r ${getScoreColor()} bg-clip-text text-transparent`} />
            <h2 className="text-lg font-bold text-slate-900">Today's Progress</h2>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            {getScoreMessage()}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-700">
              {summary.goalsCompleted} of {summary.totalGoals} goals completed
            </span>
            {summary.goalsCompleted > 0 && (
              <div className="flex gap-1">
                {summary.goals.filter(g => g.met).map((goal, idx) => (
                  <span key={idx} className="text-emerald-600">✓</span>
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
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-200"
            />
            <circle
              cx="48"
              cy="48"
              r="42"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - summary.score / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-purple-500" stopColor="currentColor" />
                <stop offset="100%" className="text-pink-500" stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor()} bg-clip-text text-transparent`}>
              {summary.score}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TodaySummary;

