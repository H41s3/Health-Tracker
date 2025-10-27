import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMedicationStore } from '../../stores/useMedicationStore';
import { useAuth } from '../../contexts/AuthContext';
import { Pill, Plus, Clock, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export default function MedicationTracker() {
  const { user } = useAuth();
  const { medications, fetchMedications, addMedication, deactivateMedication, logMedication, getTodaysLog } = useMedicationStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily' as 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed',
    time_of_day: '09:00',
    reminder_enabled: true,
    notes: '',
  });

  useEffect(() => {
    if (user) {
      fetchMedications(user.id);
    }
  }, [user, fetchMedications]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await addMedication(user.id, {
      ...formData,
      start_date: format(new Date(), 'yyyy-MM-dd'),
    });
    resetForm();
  }, [user, formData, addMedication]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'daily',
      time_of_day: '09:00',
      reminder_enabled: true,
      notes: '',
    });
    setShowForm(false);
  }, []);

  const handleLog = useCallback(async (medicationId: string, taken: boolean) => {
    if (!user) return;
    await logMedication(medicationId, user.id, format(new Date(), 'yyyy-MM-dd'), taken);
  }, [user, logMedication]);

  const frequencyLabels = useMemo(() => ({
    daily: 'Once daily',
    twice_daily: 'Twice daily',
    three_times_daily: '3× daily',
    weekly: 'Weekly',
    as_needed: 'As needed',
  }), []);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-100/20 to-orange-100/20 rounded-xl">
            <Pill className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Medications</h3>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Medication
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medication Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Ibuprofen, Vitamin D"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosage
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="input-field"
                placeholder="e.g., 200mg, 1 tablet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="input-field"
              >
                <option value="daily">Once daily</option>
                <option value="twice_daily">Twice daily</option>
                <option value="three_times_daily">Three times daily</option>
                <option value="weekly">Weekly</option>
                <option value="as_needed">As needed</option>
              </select>
            </div>
          </div>

          {formData.frequency !== 'as_needed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time of Day
              </label>
              <input
                type="time"
                value={formData.time_of_day}
                onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="input-field resize-none"
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              <Check className="w-4 h-4 mr-2 inline" />
              Save Medication
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {medications.length === 0 && !showForm ? (
        <div className="text-center py-8">
          <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
          <p className="text-gray-600 font-medium">No active medications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => {
            const todaysLog = getTodaysLog(med.id);
            return (
              <div
                key={med.id}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{med.name}</h4>
                    {med.dosage && (
                      <p className="text-sm text-gray-700">{med.dosage}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                      <span className="font-medium">📅 {frequencyLabels[med.frequency]}</span>
                      {med.time_of_day && (
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {med.time_of_day}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deactivateMedication(med.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Today's log */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLog(med.id, true)}
                    disabled={todaysLog?.taken}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      todaysLog?.taken
                        ? 'bg-emerald-500 text-white cursor-default'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                    }`}
                  >
                    {todaysLog?.taken ? '✓ Taken' : 'Mark as Taken'}
                  </button>
                  <button
                    onClick={() => handleLog(med.id, false)}
                    disabled={todaysLog?.skipped}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      todaysLog?.skipped
                        ? 'bg-gray-400 text-white cursor-default'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {todaysLog?.skipped ? 'Skipped' : 'Skip Today'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
