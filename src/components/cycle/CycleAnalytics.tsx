import { useMemo } from 'react';
import { TrendingUp, Calendar, Activity, AlertCircle } from 'lucide-react';
import { CycleTracking } from '../../types/database';
import { differenceInDays } from 'date-fns';

interface CycleAnalyticsProps {
  cycles: CycleTracking[];
}

export default function CycleAnalytics({ cycles }: CycleAnalyticsProps) {
  const analytics = useMemo(() => {
    if (cycles.length < 2) return null;

    const cycleLengths = cycles
      .filter(c => c.cycle_length_days)
      .map(c => c.cycle_length_days!);

    if (cycleLengths.length === 0) return null;

    const avgLength = cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length;
    const minLength = Math.min(...cycleLengths);
    const maxLength = Math.max(...cycleLengths);
    
    // Calculate standard deviation for regularity
    const variance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / cycleLengths.length;
    const stdDev = Math.sqrt(variance);
    
    // Determine regularity (regular if std dev < 4 days)
    let regularity: 'very_regular' | 'regular' | 'irregular';
    if (stdDev < 2) regularity = 'very_regular';
    else if (stdDev < 4) regularity = 'regular';
    else regularity = 'irregular';

    // Count symptoms frequency
    const symptomCount: Record<string, number> = {};
    cycles.forEach(cycle => {
      if (cycle.symptoms) {
        cycle.symptoms.forEach(symptom => {
          symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
        });
      }
    });

    const topSymptoms = Object.entries(symptomCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));

    // Average period length
    const periodsWithEndDate = cycles.filter(c => c.period_end_date);
    const avgPeriodLength = periodsWithEndDate.length > 0
      ? periodsWithEndDate.reduce((sum, cycle) => {
          const days = differenceInDays(
            new Date(cycle.period_end_date!),
            new Date(cycle.period_start_date)
          ) + 1;
          return sum + days;
        }, 0) / periodsWithEndDate.length
      : null;

    return {
      avgLength: Math.round(avgLength),
      minLength,
      maxLength,
      stdDev: Math.round(stdDev * 10) / 10,
      regularity,
      topSymptoms,
      avgPeriodLength: avgPeriodLength ? Math.round(avgPeriodLength * 10) / 10 : null,
      totalCycles: cycles.length,
    };
  }, [cycles]);

  if (!analytics) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-100/20 to-violet-100/20 rounded-xl">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Cycle Analytics</h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            Log at least 2 complete cycles to see analytics
          </p>
        </div>
      </div>
    );
  }

  const regularityConfig = {
    very_regular: { label: 'Very Regular', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    regular: { label: 'Regular', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    irregular: { label: 'Irregular', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  };

  const regConfig = regularityConfig[analytics.regularity];

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-100/20 to-violet-100/20 rounded-xl">
          <TrendingUp className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Cycle Analytics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Average Cycle Length */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-700 font-medium">Avg Cycle</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{analytics.avgLength}</div>
          <div className="text-xs text-gray-600">days</div>
        </div>

        {/* Regularity */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-700 font-medium">Regularity</span>
          </div>
          <div className={`text-sm font-bold ${regConfig.color}`}>
            {regConfig.label}
          </div>
          <div className="text-xs text-gray-600">±{analytics.stdDev} days</div>
        </div>

        {/* Range */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-700 font-medium">Range</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {analytics.minLength}-{analytics.maxLength}
          </div>
          <div className="text-xs text-gray-600">days</div>
        </div>

        {/* Period Length */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-700 font-medium">Avg Period</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.avgPeriodLength || '—'}
          </div>
          <div className="text-xs text-gray-600">days</div>
        </div>
      </div>

      {/* Top Symptoms */}
      {analytics.topSymptoms.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Most Common Symptoms</h4>
          <div className="space-y-2">
            {analytics.topSymptoms.map(({ symptom, count }) => {
              const percentage = Math.round((count / analytics.totalCycles) * 100);
              return (
                <div key={symptom} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-900 font-medium">{symptom}</span>
                      <span className="text-xs text-gray-600">
                        {count}/{analytics.totalCycles} cycles
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
