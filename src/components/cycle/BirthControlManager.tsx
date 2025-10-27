import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBirthControlStore } from '../../stores/useBirthControlStore';
import { useAuth } from '../../contexts/AuthContext';
import { Pill, Plus, AlertCircle, Check, X, Clock, Circle, Shield, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { BirthControlType } from '../../types/database';

export default function BirthControlManager() {
  const { user } = useAuth();
  const {
    activeBirthControl,
    fetchBirthControls,
    addBirthControl,
    updateBirthControl,
    deactivateBirthControl,
  } = useBirthControlStore();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'pill' as BirthControlType,
    brand_name: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    reminder_time: '09:00',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      fetchBirthControls(user.id);
    }
  }, [user, fetchBirthControls]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await addBirthControl(user.id, formData);
    resetForm();
  }, [user, formData, addBirthControl]);

  const resetForm = useCallback(() => {
    setFormData({
      type: 'pill',
      brand_name: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      reminder_time: '09:00',
      notes: '',
    });
    setShowForm(false);
  }, []);

  const handleDeactivate = useCallback(async () => {
    if (!activeBirthControl) return;
    if (confirm('Are you sure you want to stop tracking this birth control method?')) {
      await deactivateBirthControl(activeBirthControl.id);
    }
  }, [activeBirthControl, deactivateBirthControl]);

  const birthControlOptions: { value: BirthControlType; label: string; needsReminder: boolean; icon: any }[] = [
    { value: 'pill', label: 'Birth Control Pill', needsReminder: true, icon: Pill },
    { value: 'patch', label: 'Patch', needsReminder: true, icon: Activity },
    { value: 'ring', label: 'Vaginal Ring', needsReminder: true, icon: Circle },
    { value: 'injection', label: 'Injection', needsReminder: false, icon: Activity },
    { value: 'iud', label: 'IUD', needsReminder: false, icon: Circle },
    { value: 'implant', label: 'Implant', needsReminder: false, icon: Activity },
    { value: 'condom', label: 'Condom', needsReminder: false, icon: Shield },
    { value: 'other', label: 'Other', needsReminder: false, icon: Plus },
  ];

  const selectedOption = birthControlOptions.find(opt => opt.value === formData.type);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
            <Pill className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Birth Control</h3>
        </div>
        
        {!activeBirthControl && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Method
          </button>
        )}
      </div>

      {activeBirthControl && !showForm && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const option = birthControlOptions.find(opt => opt.value === activeBirthControl.type);
                    const Icon = option?.icon || Pill;
                    return (
                      <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                        <Icon className="w-6 h-6 text-purple-700" />
                      </div>
                    );
                  })()}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {activeBirthControl.brand_name || birthControlOptions.find(opt => opt.value === activeBirthControl.type)?.label}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Since {format(new Date(activeBirthControl.start_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {activeBirthControl.type === 'pill' && activeBirthControl.reminder_time && (
                  <div className="flex items-center gap-2 mt-3 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Daily reminder at {activeBirthControl.reminder_time}</span>
                  </div>
                )}

                {activeBirthControl.notes && (
                  <p className="mt-3 text-sm text-gray-600 italic bg-purple-50 p-2 rounded">
                    {activeBirthControl.notes}
                  </p>
                )}
              </div>

              <button
                onClick={handleDeactivate}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Stop tracking"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeBirthControl.type === 'pill' && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Daily pill tracking available in the cycle view below</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Method Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {birthControlOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: option.value })}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                      formData.type === option.value
                        ? 'border-purple-400 bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white shadow-xl scale-105'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${formData.type === option.value ? 'text-white' : 'text-gray-600'}`} strokeWidth={2} />
                    <div className="text-xs font-semibold">{option.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name (Optional)
            </label>
            <input
              type="text"
              value={formData.brand_name}
              onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
              className="input-field"
              placeholder="e.g., Yaz, Mirena, NuvaRing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="input-field"
              required
            />
          </div>

          {selectedOption?.needsReminder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Reminder Time
              </label>
              <input
                type="time"
                value={formData.reminder_time}
                onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
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

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">
              <Check className="w-4 h-4 mr-2 inline" />
              Save Method
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

      {!activeBirthControl && !showForm && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
            <Pill className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-600 mb-4 font-medium">No birth control method tracked</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Method
          </button>
        </div>
      )}
    </div>
  );
}
