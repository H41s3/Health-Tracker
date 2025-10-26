import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useHealthStore } from '../stores/useHealthStore';
import { useToastStore } from '../stores/useToastStore';
import { Activity, Droplet, Moon, TrendingUp, Heart } from 'lucide-react';
import { format, subDays } from 'date-fns';
import MetricCard from '../components/dashboard/MetricCard';
import StreakWidget from '../components/dashboard/StreakWidget';
import InsightsBanner from '../components/dashboard/InsightsBanner';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import QuickLog from '../components/dashboard/QuickLog';
import ActivityTrends from '../components/dashboard/ActivityTrends';
import PageWrapper from '../components/Layout/PageWrapper';
import PageHeader from '../components/Layout/PageHeader';

export default function Dashboard() {
  const { user } = useAuth();
  const { metrics, fetchMetrics, addOrUpdateMetric, getMetricForDate, loading, isSaving } = useHealthStore();
  const { show } = useToastStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (user) {
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      fetchMetrics(user.id, startDate);
    }
  }, [user, fetchMetrics]);


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
        {/* Hero Header */}
        <PageHeader
          title="Health Dashboard"
          subtitle="Track your daily health metrics and progress"
          theme="dashboard"
          icon={<Heart className="w-12 h-12 text-pink-500" />}
        />

      {/* Date Selector */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mb-6"
      >
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={format(new Date(), 'yyyy-MM-dd')}
          className="input-field max-w-xs"
        />
      </motion.div>

      {/* Insights Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <InsightsBanner todayMetric={todayMetric} isLoading={loading} />
      </motion.div>

      {/* Metrics Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="grid-metrics"
      >
        <MetricCard
          label="Steps Today"
          value={todayMetric?.steps || 0}
          goal={10000}
          icon={Activity}
          color="emerald"
          isLoading={loading}
        />
        <MetricCard
          label="Water (ml)"
          value={todayMetric?.water_ml || 0}
          goal={2000}
          icon={Droplet}
          color="sky"
          isLoading={loading}
        />
        <MetricCard
          label="Sleep (hrs)"
          value={todayMetric?.sleep_hours || 0}
          goal={8}
          icon={Moon}
          color="violet"
          isLoading={loading}
        />
        <MetricCard
          label="Weight (kg)"
          value={todayMetric?.weight_kg || 0}
          icon={TrendingUp}
          color="orange"
          isLoading={loading}
        />
      </motion.div>

      {/* Streak Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid-cards"
      >
        <StreakWidget metrics={metrics} isLoading={loading} />
      </motion.div>

      {/* Quick Log and Weekly Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="grid-content"
      >
        <QuickLog
          todayMetric={todayMetric}
          onUpdateMetric={handleQuickLog}
          isSaving={isSaving}
        />
        <WeeklyChart data={chartData} isLoading={loading} />
      </motion.div>

      {/* Activity Trends */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <ActivityTrends data={chartData} isLoading={loading} />
      </motion.div>
      </div>
    </PageWrapper>
  );
}
