import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCycleStore } from '../stores/useCycleStore';
import { Calendar, Plus, Edit2, Trash2, Sparkles } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { CycleTracking, FlowIntensity } from '../types/database';
import CycleVisualization from '../components/dashboard/CycleVisualization';
import PageWrapper from '../components/Layout/PageWrapper';
import PageHeader from '../components/Layout/PageHeader';
import BirthControlManager from '../components/cycle/BirthControlManager';
import DailyPillLogger from '../components/cycle/DailyPillLogger';
import CycleCalendar from '../components/cycle/CycleCalendar';
import DailyMoodLogger from '../components/cycle/DailyMoodLogger';
import CycleAnalytics from '../components/cycle/CycleAnalytics';
import MedicationTracker from '../components/cycle/MedicationTracker';
import { symptomCategories } from '../data/symptoms';

export default function CycleTracker() {
  const prefersReducedMotion = useReducedMotion();
  const { user } = useAuth();
  const { cycles, fetchCycles, addCycle, updateCycle, deleteCycle, predictNextPeriod } = useCycleStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCycle, setEditingCycle] = useState<CycleTracking | null>(null);
  const [formData, setFormData] = useState({
    period_start_date: format(new Date(), 'yyyy-MM-dd'),
    period_end_date: '',
    flow_intensity: 'medium' as FlowIntensity,
    symptoms: [] as string[],
    notes: '',
  });

  useEffect(() => {
    if (user) {
      fetchCycles(user.id);
    }
  }, [user, fetchCycles]);

  const prediction = predictNextPeriod();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cycleData = {
      ...formData,
      period_end_date: formData.period_end_date || null,
      cycle_length_days: formData.period_end_date
        ? differenceInDays(new Date(formData.period_end_date), new Date(formData.period_start_date)) + 1
        : null,
    };

    if (editingCycle) {
      await updateCycle(editingCycle.id, cycleData);
    } else {
      await addCycle(user.id, cycleData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      period_start_date: format(new Date(), 'yyyy-MM-dd'),
      period_end_date: '',
      flow_intensity: 'medium',
      symptoms: [],
      notes: '',
    });
    setEditingCycle(null);
    setShowForm(false);
  };

  const handleEdit = (cycle: CycleTracking) => {
    setEditingCycle(cycle);
    setFormData({
      period_start_date: cycle.period_start_date,
      period_end_date: cycle.period_end_date || '',
      flow_intensity: cycle.flow_intensity || 'medium',
      symptoms: cycle.symptoms || [],
      notes: cycle.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this cycle entry?')) {
      await deleteCycle(id);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  return (
    <PageWrapper theme="cycle">
      <div className="page-container space-section">
        {/* Hero Header */}
        <PageHeader
          title="Cycle Tracker"
          subtitle="Track your menstrual cycle and predict future periods"
          theme="cycle"
          icon={<Sparkles className="w-12 h-12 text-purple-500" />}
        />

      {/* Birth Control Section */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.05 }}
      >
        <BirthControlManager />
      </motion.div>

      {/* Daily Pill Logger */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.07 }}
      >
        <DailyPillLogger />
      </motion.div>

      {/* Daily Mood/Energy Logger */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.08 }}
      >
        <DailyMoodLogger />
      </motion.div>

      {/* Cycle Calendar */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.1 }}
      >
        <CycleCalendar 
          cycles={cycles} 
          onDateClick={setSelectedDate}
          selectedDate={selectedDate}
        />
      </motion.div>

      {/* Cycle Visualization */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.12 }}
      >
        <CycleVisualization cycles={cycles} prediction={prediction || undefined} />
      </motion.div>

      {/* Cycle Analytics */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.14 }}
      >
        <CycleAnalytics cycles={cycles} />
      </motion.div>

      {/* Medication Tracker */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.16 }}
      >
        <MedicationTracker />
      </motion.div>

      {/* Add Cycle Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary inline-flex items-center gap-2"
          whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'Log New Cycle'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
            <motion.div 
            initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, height: 'auto' }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-purple-900 mb-6">
              {editingCycle ? 'Edit Cycle' : 'New Cycle Entry'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Period Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.period_start_date}
                    onChange={(e) => setFormData({ ...formData, period_start_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Period End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.period_end_date}
                    onChange={(e) => setFormData({ ...formData, period_end_date: e.target.value })}
                    min={formData.period_start_date}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-3">Flow Intensity</label>
                <div className="flex gap-3">
                  {(['light', 'medium', 'heavy'] as FlowIntensity[]).map((intensity) => (
                    <motion.button
                      key={intensity}
                      type="button"
                      onClick={() => setFormData({ ...formData, flow_intensity: intensity })}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 capitalize transition-all duration-200 ${
                                                  formData.flow_intensity === intensity
                          ? 'border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 shadow-sm'
                          : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {intensity}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-3">Symptoms</label>
                <div className="space-y-4">
                  {Object.entries(symptomCategories).map(([key, category]) => (
                    <div key={key}>
                      <h4 className="text-xs font-semibold text-purple-600 mb-2">{category.label}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {category.symptoms.map((symptom) => (
                          <button
                            key={symptom}
                            type="button"
                            onClick={() => toggleSymptom(symptom)}
                            className={`py-2 px-3 rounded-xl border text-xs transition-all duration-200 ${
                              formData.symptoms.includes(symptom)
                                ? 'border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 shadow-sm'
                                : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700'
                            }`}
                          >
                            {symptom}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="submit"
                  className="btn-primary"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                >
                  {editingCycle ? 'Update' : 'Save'} Cycle
                </motion.button>
                <motion.button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card p-8"
      >
        <h2 className="text-2xl font-semibold text-purple-900 mb-6">Cycle History</h2>
        {cycles.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-rose-600" />
            </div>
            <p className="text-purple-600 text-lg font-medium">No cycles recorded yet. Start tracking your cycle!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {cycles.map((cycle, index) => (
              <motion.div
                key={cycle.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
                className="card p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg font-semibold text-purple-900">
                        {format(new Date(cycle.period_start_date), 'MMM dd, yyyy')}
                      </span>
                      {cycle.period_end_date && (
                        <span className="text-sm text-purple-600">
                          to {format(new Date(cycle.period_end_date), 'MMM dd, yyyy')}
                        </span>
                      )}
                      {cycle.cycle_length_days && (
                        <span className="px-3 py-1 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 text-sm font-medium rounded-full">
                          {cycle.cycle_length_days} days
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-purple-700">
                      {cycle.flow_intensity && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Flow:</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium">
                            {cycle.flow_intensity}
                          </span>
                        </div>
                      )}
                      {cycle.symptoms && cycle.symptoms.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Symptoms:</span>
                          <div className="flex flex-wrap gap-1">
                            {cycle.symptoms.map((symptom) => (
                              <span key={symptom} className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {cycle.notes && (
                        <p className="text-purple-600 italic bg-purple-50 p-3 rounded-lg">
                          {cycle.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      onClick={() => handleEdit(cycle)}
                      className="p-2 text-purple-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(cycle.id)}
                      className="p-2 text-purple-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      </div>
    </PageWrapper>
  );
}
