import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHealthStore } from '../stores/useHealthStore';
import { useGoalsStore } from '../stores/useGoalsStore';
import { useProfileStore } from '../stores/useProfileStore';
import { useToastStore } from '../stores/useToastStore';
import { Activity, Droplet, Moon, TrendingUp, Heart } from 'lucide-react';
import { format, subDays } from 'date-fns';
import MetricCard from '../components/dashboard/MetricCard';
import StreakWidget from '../components/dashboard/StreakWidget';
import InsightsBanner from '../components/dashboard/InsightsBanner';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import QuickLog from '../components/dashboard/QuickLog';
import ActivityTrends from '../components/dashboard/ActivityTrends';
import TodaySummary from '../components/dashboard/TodaySummary';
import BMICard from '../components/dashboard/BMICard';
import PageWrapper from '../components/Layout/PageWrapper';
import PageHeader from '../components/Layout/PageHeader';
import AppProfiler from '../utils/Profiler';

export default function Dashboard() {
  const { user } = useAuth();
  const { metrics, fetchMetrics, addOrUpdateMetric, getMetricForDate, loading, isSaving } = useHealthStore();
  const { goals, fetchGoals } = useGoalsStore();
  const { profile, fetchProfile } = useProfileStore();
  const { show } = useToastStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (user) {
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      fetchMetrics(user.id, startDate);
      fetchGoals(user.id);
      fetchProfile(user.id);
    }
  }, [user, fetchMetrics, fetchGoals, fetchProfile]);


  // persist last-selected date
  useEffect(() => {
    const saved = localStorage.getItem('dashboard:selectedDate');
    if (saved) setSelectedDate(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('dashboard:selectedDate', selectedDate);
  }, [selectedDate]);

  const handleQuickLog = useCallback(async (field: string, value: string) => {
    if (!user) return;

    const numValue = value === '' ? null : parseFloat(value);
    try {
      await addOrUpdateMetric(user.id, selectedDate, {
        [field]: numValue,
      });
      show('Saved successfully', 'success');
    } catch {
      show('Failed to save. Please try again.', 'error');
    }
  }, [user, selectedDate, addOrUpdateMetric, show]);

  const todayMetric = useMemo(() => getMetricForDate(selectedDate), [getMetricForDate, selectedDate]);

  // Calculate previous day's metric for trend comparison
  const previousDayMetric = useMemo(() => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    return getMetricForDate(format(prevDate, 'yyyy-MM-dd'));
  }, [getMetricForDate, selectedDate]);

  const chartData = useMemo(() => {
    const weekMetrics = metrics.slice(0, 7).reverse();
    return weekMetrics.map((m) => {
      const d = new Date(m.date);
      return {
        date: format(d, 'EEE'),
        fullDate: format(d, 'MMM d, yyyy'),
        steps: m.steps || 0,
        water: (m.water_ml || 0) / 1000,
        sleep: m.sleep_hours || 0,
      };
    });
  }, [metrics]);


  return (
    <PageWrapper theme="dashboard">
      <div className="page-container space-section">
        {/* Hero Header with Date Selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <PageHeader
            title="Health Dashboard"
            subtitle="Track your daily health metrics and progress"
            theme="dashboard"
            icon={<Heart className="w-12 h-12 text-pink-500" />}
          />
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-white/80 mb-2">Viewing Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="input-field w-full md:w-auto shadow-lg border-2 border-white/20 hover:border-white/40 transition-colors"
            />
          </div>
        </div>

      {/* Today's Summary */}
      <AppProfiler id="TodaySummary">
        <div className="mb-6">
          <TodaySummary todayMetric={todayMetric} goals={goals} isLoading={loading} />
        </div>
      </AppProfiler>

      {/* Insights Banner */}
      <AppProfiler id="InsightsBanner">
        <div>
          <InsightsBanner todayMetric={todayMetric} isLoading={loading} />
        </div>
      </AppProfiler>

      {/* Metrics Grid */}
      <AppProfiler id="MetricsGrid">
        <div className="grid-metrics">
          <MetricCard
          label="Steps Today"
          value={todayMetric?.steps || 0}
          goal={goals.steps}
          icon={Activity}
          color="emerald"
          isLoading={loading}
          previousValue={previousDayMetric?.steps ?? undefined}
          />
          <MetricCard
          label="Water (ml)"
          value={todayMetric?.water_ml || 0}
          goal={goals.water_ml}
          icon={Droplet}
          color="sky"
          isLoading={loading}
          previousValue={previousDayMetric?.water_ml ?? undefined}
          />
          <MetricCard
          label="Sleep (hrs)"
          value={todayMetric?.sleep_hours || 0}
          goal={goals.sleep_hours}
          icon={Moon}
          color="violet"
          isLoading={loading}
          previousValue={previousDayMetric?.sleep_hours ?? undefined}
          />
          <MetricCard
          label="Weight (kg)"
          value={todayMetric?.weight_kg || 0}
          icon={TrendingUp}
          color="orange"
          isLoading={loading}
          previousValue={previousDayMetric?.weight_kg ?? undefined}
          />
        </div>
      </AppProfiler>

      {/* Streak Widget and BMI Card */}
      <AppProfiler id="StreakWidget">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <StreakWidget metrics={metrics} isLoading={loading} />
          <BMICard 
            heightCm={profile?.height_cm ?? null}
            currentWeight={todayMetric?.weight_kg ?? null}
            previousWeight={previousDayMetric?.weight_kg ?? null}
            isLoading={loading}
          />
        </div>
      </AppProfiler>

      {/* Quick Log and Weekly Chart */}
      <AppProfiler id="QuickLog">
        <div className="grid-content">
          <QuickLog
          todayMetric={todayMetric}
          onUpdateMetric={handleQuickLog}
          isSaving={isSaving}
          />
          <AppProfiler id="WeeklyChart">
            <WeeklyChart data={chartData} goals={goals} isLoading={loading} />
          </AppProfiler>
        </div>
      </AppProfiler>

      {/* Activity Trends */}
      <AppProfiler id="ActivityTrends">
        <div>
          <ActivityTrends data={chartData} isLoading={loading} />
        </div>
      </AppProfiler>
      </div>
    </PageWrapper>
  );
}
