import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCustomMetricsStore } from '../stores/useCustomMetricsStore';
import { useToastStore } from '../stores/useToastStore';
import { Plus, Edit2, Trash2, Activity, Target, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { CustomMetric, MetricType } from '../types/database';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import PageWrapper from '../components/Layout/PageWrapper';
import PageHeader from '../components/Layout/PageHeader';

export default function CustomMetrics() {
  const { user } = useAuth();
  const { metrics, logs, fetchMetrics, fetchLogs, addMetric, updateMetric, deleteMetric, addLog } =
    useCustomMetricsStore();
  const { show } = useToastStore();
  const [showMetricForm, setShowMetricForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingMetric, setEditingMetric] = useState<CustomMetric | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<CustomMetric | null>(null);
  const [metricForm, setMetricForm] = useState({
    metric_name: '',
    metric_type: 'number' as MetricType,
    unit: '',
    icon: 'Activity',
    color: 'emerald',
  });
  const [logForm, setLogForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    value: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      fetchMetrics(user.id);
      fetchLogs(user.id);
    }
  }, [user, fetchMetrics, fetchLogs]);

  const handleMetricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!metricForm.metric_name.trim()) {
      show('Please enter a metric name', 'error');
      return;
    }

    try {
      if (editingMetric) {
        await updateMetric(editingMetric.id, metricForm);
        show('Metric updated successfully', 'success');
      } else {
        await addMetric(user.id, metricForm);
        show('Metric created successfully', 'success');
      }
      resetMetricForm();
    } catch {
      show('Failed to save metric. Please try again.', 'error');
    }
  };

  const resetMetricForm = () => {
    setMetricForm({
      metric_name: '',
      metric_type: 'number',
      unit: '',
      icon: 'Activity',
      color: 'emerald',
    });
    setEditingMetric(null);
    setShowMetricForm(false);
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMetric) return;

    await addLog(user.id, selectedMetric.id, logForm);
    setLogForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      value: '',
      notes: '',
    });
    setShowLogForm(false);
  };

  const handleEditMetric = (metric: CustomMetric) => {
    setEditingMetric(metric);
    setMetricForm({
      metric_name: metric.metric_name,
      metric_type: metric.metric_type,
      unit: metric.unit || '',
      icon: metric.icon || 'Activity',
      color: metric.color || 'emerald',
    });
    setShowMetricForm(true);
  };

  const handleDeleteMetric = async (id: string) => {
    if (confirm('Are you sure? This will also delete all logs for this metric.')) {
      await deleteMetric(id);
      if (selectedMetric?.id === id) {
        setSelectedMetric(null);
      }
    }
  };

  const getMetricLogs = (metricId: string) => {
    return logs.filter((log) => log.metric_id === metricId).slice(0, 7).reverse();
  };

  const getChartData = (metricId: string) => {
    const metricLogs = getMetricLogs(metricId);
    return metricLogs.map((log) => ({
      date: format(new Date(log.date), 'MMM dd'),
      value: parseFloat(log.value) || 0,
    }));
  };

  const colorOptions = [
    'emerald',
    'sky',
    'violet',
    'orange',
    'pink',
    'cyan',
    'amber',
    'rose',
  ];

  return (
    <PageWrapper theme="goals">
      <div className="page-container space-section">
        {/* Hero Header */}
        <PageHeader
          title="Goals & Progress"
          subtitle="Track any health metric that matters to you"
          theme="goals"
          icon={<TrendingUp className="w-12 h-12 text-emerald-500" />}
        />

      {/* Add Metric Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={() => setShowMetricForm(!showMetricForm)}
          className="btn-primary inline-flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          {showMetricForm ? 'Cancel' : 'Create New Goal'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showMetricForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              {editingMetric ? 'Edit Goal' : 'New Health Goal'}
            </h2>
            <form onSubmit={handleMetricSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Goal Name</label>
                <input
                  type="text"
                  value={metricForm.metric_name}
                  onChange={(e) => setMetricForm({ ...metricForm, metric_name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Blood Pressure, Protein Intake, Meditation Minutes"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={metricForm.metric_type}
                    onChange={(e) => setMetricForm({ ...metricForm, metric_type: e.target.value as MetricType })}
                    className="input-field"
                  >
                    <option value="number">Number</option>
                    <option value="boolean">Yes/No</option>
                    <option value="text">Text</option>
                    <option value="scale">Scale (1-10)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unit (Optional)</label>
                  <input
                    type="text"
                    value={metricForm.unit}
                    onChange={(e) => setMetricForm({ ...metricForm, unit: e.target.value })}
                    className="input-field"
                    placeholder="e.g., mg, minutes, glasses"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Color Theme</label>
                <div className="flex gap-3 flex-wrap">
                  {colorOptions.map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      onClick={() => setMetricForm({ ...metricForm, color })}
                      className={`w-12 h-12 rounded-xl bg-${color}-500 hover:ring-2 ring-${color}-300 transition-all duration-200 ${
                        metricForm.color === color ? `ring-2 ring-${color}-300 shadow-lg` : 'hover:scale-110'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="submit"
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingMetric ? 'Update' : 'Create'} Goal
                </motion.button>
                <motion.button
                  type="button"
                  onClick={resetMetricForm}
                  className="btn-secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {metrics.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center">
            <Target className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Goals Yet</h3>
          <p className="text-slate-500">Create your first health goal to start tracking your progress!</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid-cards"
        >
          {metrics.map((metric, index) => {
            const metricLogs = getMetricLogs(metric.id);
            const chartData = getChartData(metric.id);
            const latestLog = metricLogs[metricLogs.length - 1];
            
            // Calculate progress for progress ring (example: if it's a scale 1-10, show progress)
            const getProgress = () => {
              if (metric.metric_type === 'scale' && latestLog) {
                return (parseFloat(latestLog.value) / 10) * 100;
              }
              if (metric.metric_type === 'boolean' && latestLog) {
                return latestLog.value === 'Yes' ? 100 : 0;
              }
              return 0; // For other types, we'll show a different visualization
            };

            const progress = getProgress();
            const colorMap = {
              emerald: '#10b981',
              sky: '#0ea5e9',
              violet: '#8b5cf6',
              orange: '#f59e0b',
              pink: '#ec4899',
              cyan: '#06b6d4',
              amber: '#f59e0b',
              rose: '#f43f5e'
            };

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card p-6 group hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`p-3 bg-gradient-to-br from-${metric.color || 'emerald'}-100 to-${metric.color || 'emerald'}-200 rounded-xl shadow-sm`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Activity className={`w-6 h-6 text-${metric.color || 'emerald'}-600`} />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">{metric.metric_name}</h3>
                      {metric.unit && <p className="text-sm text-slate-500">{metric.unit}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      onClick={() => handleEditMetric(metric)}
                      className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteMetric(metric.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Progress Ring or Value Display */}
                <div className="flex items-center justify-between mb-6">
                  {metric.metric_type === 'scale' || metric.metric_type === 'boolean' ? (
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="32"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="6"
                          />
                          <motion.circle
                            cx="40"
                            cy="40"
                            r="32"
                            fill="none"
                            stroke={colorMap[metric.color as keyof typeof colorMap] || '#10b981'}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 32}`}
                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress / 100)}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - progress / 100) }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-slate-900">{Math.round(progress)}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">
                          {latestLog ? latestLog.value : 'N/A'}
                        </div>
                        <div className="text-sm text-slate-500">
                          {latestLog ? format(new Date(latestLog.date), 'MMM dd') : 'No data'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-slate-900 mb-1">
                        {latestLog ? latestLog.value : 'N/A'}
                      </div>
                      <div className="text-sm text-slate-500">
                        {latestLog ? format(new Date(latestLog.date), 'MMM dd') : 'No data'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart */}
                {chartData.length > 1 && metric.metric_type === 'number' && (
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={80}>
                      <LineChart data={chartData}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={colorMap[metric.color as keyof typeof colorMap] || '#10b981'}
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Log Entry Button */}
                <motion.button
                  onClick={() => {
                    setSelectedMetric(metric);
                    setShowLogForm(true);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl transition-all duration-200 text-sm group-hover:bg-emerald-50 group-hover:text-emerald-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Log Entry
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {showLogForm && selectedMetric && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowLogForm(false);
              setSelectedMetric(null);
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="card p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 bg-${selectedMetric.color || 'emerald'}-100 rounded-lg`}>
                  <Activity className={`w-5 h-5 text-${selectedMetric.color || 'emerald'}-600`} />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Log: {selectedMetric.metric_name}
                </h2>
              </div>
              
              <form onSubmit={handleLogSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Value {selectedMetric.unit && `(${selectedMetric.unit})`}
                  </label>
                  {selectedMetric.metric_type === 'boolean' ? (
                    <select
                      value={logForm.value}
                      onChange={(e) => setLogForm({ ...logForm, value: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  ) : selectedMetric.metric_type === 'scale' ? (
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={logForm.value}
                      onChange={(e) => setLogForm({ ...logForm, value: e.target.value })}
                      className="input-field"
                      required
                    />
                  ) : selectedMetric.metric_type === 'number' ? (
                    <input
                      type="number"
                      step="0.01"
                      value={logForm.value}
                      onChange={(e) => setLogForm({ ...logForm, value: e.target.value })}
                      className="input-field"
                      required
                    />
                  ) : (
                    <input
                      type="text"
                      value={logForm.value}
                      onChange={(e) => setLogForm({ ...logForm, value: e.target.value })}
                      className="input-field"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={logForm.notes}
                    onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="submit"
                    className="flex-1 btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save Log
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowLogForm(false);
                      setSelectedMetric(null);
                      setLogForm({ date: format(new Date(), 'yyyy-MM-dd'), value: '', notes: '' });
                    }}
                    className="flex-1 btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
