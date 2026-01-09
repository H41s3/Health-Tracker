import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCustomMetricsStore } from '../stores/useCustomMetricsStore';
import { useToastStore } from '../stores/useToastStore';
import { Plus, Edit2, Trash2, Activity, Target, TrendingUp, X } from 'lucide-react';
import { format } from 'date-fns';
import { CustomMetric, MetricType } from '../types/database';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import PageWrapper from '../components/Layout/PageWrapper';
import PageHeader from '../components/Layout/PageHeader';

// Night Owl color mapping
const colorMap: Record<string, string> = {
  emerald: '#7fdbca',
  sky: '#82aaff',
  violet: '#c792ea',
  orange: '#f78c6c',
  pink: '#ff6ac1',
  cyan: '#7fdbca',
  amber: '#ffcb6b',
  rose: '#ff5874'
};

const inputStyle = {
  background: 'rgba(11, 41, 66, 0.8)',
  border: '1px solid rgba(127, 219, 202, 0.2)',
  color: '#d6deeb',
};

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
        <PageHeader
          title="Goals & Progress"
          subtitle="Track any health metric that matters to you"
          theme="goals"
          icon={<TrendingUp className="w-12 h-12" style={{ color: '#7fdbca' }} />}
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
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
          style={{ 
            background: 'linear-gradient(135deg, #7fdbca 0%, #addb67 100%)',
            color: '#011627'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showMetricForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
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
            className="p-8 mb-8 rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <h2 className="text-2xl font-semibold mb-6" style={{ color: '#d6deeb' }}>
              {editingMetric ? 'Edit Goal' : 'New Health Goal'}
            </h2>
            <form onSubmit={handleMetricSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Goal Name</label>
                <input
                  type="text"
                  value={metricForm.metric_name}
                  onChange={(e) => setMetricForm({ ...metricForm, metric_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                  style={inputStyle}
                  placeholder="e.g., Blood Pressure, Protein Intake, Meditation Minutes"
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7fdbca';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Type</label>
                  <select
                    value={metricForm.metric_type}
                    onChange={(e) => setMetricForm({ ...metricForm, metric_type: e.target.value as MetricType })}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="number">Number</option>
                    <option value="boolean">Yes/No</option>
                    <option value="text">Text</option>
                    <option value="scale">Scale (1-10)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Unit (Optional)</label>
                  <input
                    type="text"
                    value={metricForm.unit}
                    onChange={(e) => setMetricForm({ ...metricForm, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    placeholder="e.g., mg, minutes, glasses"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#5f7e97' }}>Color Theme</label>
                <div className="flex gap-3 flex-wrap">
                  {colorOptions.map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      onClick={() => setMetricForm({ ...metricForm, color })}
                      className="w-12 h-12 rounded-xl transition-all duration-200"
                      style={{ 
                        background: colorMap[color],
                        boxShadow: metricForm.color === color ? `0 0 0 3px ${colorMap[color]}50` : 'none'
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{ 
                    background: 'linear-gradient(135deg, #7fdbca 0%, #addb67 100%)',
                    color: '#011627'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingMetric ? 'Update' : 'Create'} Goal
                </motion.button>
                <motion.button
                  type="button"
                  onClick={resetMetricForm}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{ 
                    background: 'rgba(95, 126, 151, 0.2)',
                    border: '1px solid rgba(127, 219, 202, 0.2)',
                    color: '#d6deeb'
                  }}
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
          className="p-12 text-center rounded-xl"
          style={{
            background: 'rgba(29, 59, 83, 0.6)',
            border: '1px solid rgba(127, 219, 202, 0.1)'
          }}
        >
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(127, 219, 202, 0.15)' }}
          >
            <Target className="w-8 h-8" style={{ color: '#7fdbca' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#d6deeb' }}>No Goals Yet</h3>
          <p style={{ color: '#5f7e97' }}>Create your first health goal to start tracking your progress!</p>
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
            const metricColor = colorMap[metric.color as keyof typeof colorMap] || '#7fdbca';
            
            const getProgress = () => {
              if (metric.metric_type === 'scale' && latestLog) {
                return (parseFloat(latestLog.value) / 10) * 100;
              }
              if (metric.metric_type === 'boolean' && latestLog) {
                return latestLog.value === 'Yes' ? 100 : 0;
              }
              return 0;
            };

            const progress = getProgress();

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6 group rounded-xl transition-all duration-300"
                style={{
                  background: 'rgba(29, 59, 83, 0.6)',
                  border: '1px solid rgba(127, 219, 202, 0.1)'
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="p-3 rounded-xl"
                      style={{ background: `${metricColor}20` }}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Activity className="w-6 h-6" style={{ color: metricColor }} />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: '#d6deeb' }}>{metric.metric_name}</h3>
                      {metric.unit && <p className="text-sm" style={{ color: '#5f7e97' }}>{metric.unit}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      onClick={() => handleEditMetric(metric)}
                      className="p-2 rounded-xl transition-all duration-200"
                      style={{ color: '#5f7e97' }}
                      whileHover={{ scale: 1.1, color: '#7fdbca', backgroundColor: 'rgba(127, 219, 202, 0.1)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteMetric(metric.id)}
                      className="p-2 rounded-xl transition-all duration-200"
                      style={{ color: '#5f7e97' }}
                      whileHover={{ scale: 1.1, color: '#ff5874', backgroundColor: 'rgba(255, 88, 116, 0.1)' }}
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
                            stroke="rgba(95, 126, 151, 0.3)"
                            strokeWidth="6"
                          />
                          <motion.circle
                            cx="40"
                            cy="40"
                            r="32"
                            fill="none"
                            stroke={metricColor}
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
                          <span className="text-lg font-bold" style={{ color: '#d6deeb' }}>{Math.round(progress)}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>
                          {latestLog ? latestLog.value : 'N/A'}
                        </div>
                        <div className="text-sm" style={{ color: '#5f7e97' }}>
                          {latestLog ? format(new Date(latestLog.date), 'MMM dd') : 'No data'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold mb-1" style={{ color: '#d6deeb' }}>
                        {latestLog ? latestLog.value : 'N/A'}
                      </div>
                      <div className="text-sm" style={{ color: '#5f7e97' }}>
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
                          stroke={metricColor}
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
                  className="w-full px-4 py-3 font-medium rounded-xl transition-all duration-200 text-sm"
                  style={{
                    background: 'rgba(127, 219, 202, 0.1)',
                    border: '1px solid rgba(127, 219, 202, 0.2)',
                    color: '#7fdbca'
                  }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(127, 219, 202, 0.2)' }}
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
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: 'rgba(1, 22, 39, 0.8)', backdropFilter: 'blur(8px)' }}
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
              className="p-8 max-w-md w-full rounded-xl"
              style={{
                background: '#1d3b53',
                border: '1px solid rgba(127, 219, 202, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="p-2 rounded-lg"
                  style={{ background: `${colorMap[selectedMetric.color as keyof typeof colorMap] || '#7fdbca'}20` }}
                >
                  <Activity 
                    className="w-5 h-5" 
                    style={{ color: colorMap[selectedMetric.color as keyof typeof colorMap] || '#7fdbca' }} 
                  />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: '#d6deeb' }}>
                  Log: {selectedMetric.metric_name}
                </h2>
              </div>
              
              <form onSubmit={handleLogSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Date</label>
                  <input
                    type="date"
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    required
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
                    Value {selectedMetric.unit && `(${selectedMetric.unit})`}
                  </label>
                  {selectedMetric.metric_type === 'boolean' ? (
                    <select
                      value={logForm.value}
                      onChange={(e) => setLogForm({ ...logForm, value: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                      style={inputStyle}
                      required
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#7fdbca';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
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
                      className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                      style={inputStyle}
                      required
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#7fdbca';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  ) : selectedMetric.metric_type === 'number' ? (
                    <input
                      type="number"
                      step="0.01"
                      value={logForm.value}
                      onChange={(e) => setLogForm({ ...logForm, value: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                      style={inputStyle}
                      required
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#7fdbca';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={logForm.value}
                      onChange={(e) => setLogForm({ ...logForm, value: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                      style={inputStyle}
                      required
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#7fdbca';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Notes (Optional)</label>
                  <textarea
                    value={logForm.notes}
                    onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 resize-none"
                    style={inputStyle}
                    placeholder="Add any additional notes..."
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                    style={{ 
                      background: 'linear-gradient(135deg, #7fdbca 0%, #addb67 100%)',
                      color: '#011627'
                    }}
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
                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                    style={{ 
                      background: 'rgba(95, 126, 151, 0.2)',
                      border: '1px solid rgba(127, 219, 202, 0.2)',
                      color: '#d6deeb'
                    }}
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
