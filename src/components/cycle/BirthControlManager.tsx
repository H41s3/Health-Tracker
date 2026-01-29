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
    <div 
      className="p-6 rounded-xl"
      style={{ background: 'rgba(29, 59, 83, 0.6)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(199, 146, 234, 0.15)' }}>
            <Pill className="w-5 h-5" style={{ color: '#c792ea' }} />
          </div>
          <h3 className="text-xl font-semibold" style={{ color: '#d6deeb' }}>Birth Control</h3>
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
          <div 
            className="rounded-xl p-4"
            style={{ 
              background: 'linear-gradient(135deg, rgba(199, 146, 234, 0.15), rgba(255, 88, 116, 0.15))',
              border: '1px solid rgba(199, 146, 234, 0.2)'
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const option = birthControlOptions.find(opt => opt.value === activeBirthControl.type);
                    const Icon = option?.icon || Pill;
                    return (
                      <div className="p-2 rounded-xl" style={{ background: 'rgba(199, 146, 234, 0.2)' }}>
                        <Icon className="w-6 h-6" style={{ color: '#c792ea' }} />
                      </div>
                    );
                  })()}
                  <div>
                    <h4 className="text-lg font-semibold" style={{ color: '#d6deeb' }}>
                      {activeBirthControl.brand_name || birthControlOptions.find(opt => opt.value === activeBirthControl.type)?.label}
                    </h4>
                    <p className="text-sm" style={{ color: '#5f7e97' }}>
                      Since {format(new Date(activeBirthControl.start_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {activeBirthControl.type === 'pill' && activeBirthControl.reminder_time && (
                  <div className="flex items-center gap-2 mt-3" style={{ color: '#d6deeb' }}>
                    <Clock className="w-4 h-4" style={{ color: '#5f7e97' }} />
                    <span className="text-sm font-medium">Daily reminder at {activeBirthControl.reminder_time}</span>
                  </div>
                )}

                {activeBirthControl.notes && (
                  <p 
                    className="mt-3 text-sm italic p-2 rounded"
                    style={{ background: 'rgba(199, 146, 234, 0.1)', color: '#c792ea' }}
                  >
                    {activeBirthControl.notes}
                  </p>
                )}
              </div>

              <button
                onClick={handleDeactivate}
                className="p-2 rounded-xl transition-all duration-200"
                style={{ color: '#5f7e97' }}
                title="Stop tracking"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeBirthControl.type === 'pill' && (
              <div 
                className="mt-4 p-3 rounded-lg"
                style={{ background: 'rgba(130, 170, 255, 0.1)', border: '1px solid rgba(130, 170, 255, 0.2)' }}
              >
                <div className="flex items-center gap-2" style={{ color: '#82aaff' }}>
                  <AlertCircle className="w-4 h-4" />
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
            <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
              Method Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {birthControlOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: option.value })}
                    className="group relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden"
                    style={isSelected ? {
                      background: 'linear-gradient(135deg, rgba(199, 146, 234, 0.2), rgba(255, 88, 116, 0.2))',
                      borderColor: '#c792ea',
                      color: '#d6deeb'
                    } : {
                      background: 'rgba(11, 41, 66, 0.5)',
                      borderColor: 'rgba(127, 219, 202, 0.2)',
                      color: '#5f7e97'
                    }}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: isSelected ? '#c792ea' : '#5f7e97' }} strokeWidth={2} />
                    <div className="text-xs font-semibold" style={{ color: isSelected ? '#d6deeb' : '#5f7e97' }}>{option.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
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
            <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
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
            <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
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
              className="px-4 py-2 rounded-xl transition-colors duration-200 font-medium"
              style={{ 
                background: 'rgba(95, 126, 151, 0.2)', 
                color: '#d6deeb' 
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!activeBirthControl && !showForm && (
        <div className="text-center py-8">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(199, 146, 234, 0.15)' }}
          >
            <Pill className="w-8 h-8" style={{ color: '#c792ea' }} />
          </div>
          <p className="mb-4 font-medium" style={{ color: '#5f7e97' }}>No birth control method tracked</p>
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
