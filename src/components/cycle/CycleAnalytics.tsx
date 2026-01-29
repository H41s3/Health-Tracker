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
      <div 
        className="p-6 rounded-xl"
        style={{ background: 'rgba(29, 59, 83, 0.6)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(130, 170, 255, 0.15)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#82aaff' }} />
          </div>
          <h3 className="text-xl font-semibold" style={{ color: '#d6deeb' }}>Cycle Analytics</h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#5f7e97' }} />
          <p className="font-medium" style={{ color: '#5f7e97' }}>
            Log at least 2 complete cycles to see analytics
          </p>
        </div>
      </div>
    );
  }

  const regularityConfig = {
    very_regular: { label: 'Very Regular', color: '#addb67' },
    regular: { label: 'Regular', color: '#82aaff' },
    irregular: { label: 'Irregular', color: '#f78c6c' },
  };

  const regConfig = regularityConfig[analytics.regularity];

  return (
    <div 
      className="p-6 rounded-xl"
      style={{ background: 'rgba(29, 59, 83, 0.6)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl" style={{ background: 'rgba(130, 170, 255, 0.15)' }}>
          <TrendingUp className="w-5 h-5" style={{ color: '#82aaff' }} />
        </div>
        <h3 className="text-xl font-semibold" style={{ color: '#d6deeb' }}>Cycle Analytics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Average Cycle Length */}
        <div 
          className="rounded-xl p-4"
          style={{ background: 'rgba(11, 41, 66, 0.5)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" style={{ color: '#5f7e97' }} />
            <span className="text-xs font-medium" style={{ color: '#5f7e97' }}>Avg Cycle</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>{analytics.avgLength}</div>
          <div className="text-xs" style={{ color: '#5f7e97' }}>days</div>
        </div>

        {/* Regularity */}
        <div 
          className="rounded-xl p-4"
          style={{ background: 'rgba(11, 41, 66, 0.5)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4" style={{ color: '#5f7e97' }} />
            <span className="text-xs font-medium" style={{ color: '#5f7e97' }}>Regularity</span>
          </div>
          <div className="text-sm font-bold" style={{ color: regConfig.color }}>
            {regConfig.label}
          </div>
          <div className="text-xs" style={{ color: '#5f7e97' }}>±{analytics.stdDev} days</div>
        </div>

        {/* Range */}
        <div 
          className="rounded-xl p-4"
          style={{ background: 'rgba(11, 41, 66, 0.5)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#5f7e97' }} />
            <span className="text-xs font-medium" style={{ color: '#5f7e97' }}>Range</span>
          </div>
          <div className="text-lg font-bold" style={{ color: '#d6deeb' }}>
            {analytics.minLength}-{analytics.maxLength}
          </div>
          <div className="text-xs" style={{ color: '#5f7e97' }}>days</div>
        </div>

        {/* Period Length */}
        <div 
          className="rounded-xl p-4"
          style={{ background: 'rgba(11, 41, 66, 0.5)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" style={{ color: '#5f7e97' }} />
            <span className="text-xs font-medium" style={{ color: '#5f7e97' }}>Avg Period</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>
            {analytics.avgPeriodLength || '—'}
          </div>
          <div className="text-xs" style={{ color: '#5f7e97' }}>days</div>
        </div>
      </div>

      {/* Top Symptoms */}
      {analytics.topSymptoms.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3" style={{ color: '#d6deeb' }}>Most Common Symptoms</h4>
          <div className="space-y-2">
            {analytics.topSymptoms.map(({ symptom, count }) => {
              const percentage = Math.round((count / analytics.totalCycles) * 100);
              return (
                <div key={symptom} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: '#d6deeb' }}>{symptom}</span>
                      <span className="text-xs" style={{ color: '#5f7e97' }}>
                        {count}/{analytics.totalCycles} cycles
                      </span>
                    </div>
                    <div 
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: 'rgba(95, 126, 151, 0.3)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          background: 'linear-gradient(90deg, #c792ea 0%, #ff5874 100%)'
                        }}
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
