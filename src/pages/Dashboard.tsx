import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useHealthStore } from '../stores/useHealthStore';
import { useToastStore } from '../stores/useToastStore';
import { Activity, Droplet, Moon, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import MetricCard from '../components/dashboard/MetricCard';
import StreakWidget from '../components/dashboard/StreakWidget';
import InsightsBanner from '../components/dashboard/InsightsBanner';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import QuickLog from '../components/dashboard/QuickLog';
import ActivityTrends from '../components/dashboard/ActivityTrends';

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

  const handleQuickLog = async (field: string, value: string) => {
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
  };

  const todayMetric = getMetricForDate(selectedDate);

  const weekMetrics = metrics.slice(0, 7).reverse();
  const chartData = weekMetrics.map((m) => {
    const d = new Date(m.date);
    return {
      date: format(d, 'EEE'),
      fullDate: format(d, 'MMM d, yyyy'),
      steps: m.steps || 0,
      water: (m.water_ml || 0) / 1000,
      sleep: m.sleep_hours || 0,
    };
  });


  return (
    <div className="page-container space-section">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-header"
      >
        <h1 className="page-title">Health Dashboard</h1>
        <p className="page-subtitle">Track your daily health metrics and progress</p>
      </motion.div>

      {/* Date Selector */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <InsightsBanner todayMetric={todayMetric} isLoading={loading} />
      </motion.div>

      {/* Metrics Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid-cards"
      >
        <StreakWidget metrics={metrics} isLoading={loading} />
      </motion.div>

      {/* Quick Log and Weekly Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <ActivityTrends data={chartData} isLoading={loading} />
      </motion.div>
    </div>
  );
}
