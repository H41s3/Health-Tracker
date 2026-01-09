import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRemindersStore } from '../stores/useRemindersStore';
import { Bell, Plus, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Reminder, ReminderType, Frequency } from '../types/database';
import { useToastStore } from '../stores/useToastStore';
import RemindersOverview from '../components/reminders/RemindersOverview';
import QuickTemplates from '../components/reminders/QuickTemplates';
import ReminderCard from '../components/reminders/ReminderCard';
import PageWrapper from '../components/Layout/PageWrapper';
import PageHeader from '../components/Layout/PageHeader';

// Night Owl form styles
const inputStyle = {
  background: 'rgba(11, 41, 66, 0.8)',
  border: '1px solid rgba(127, 219, 202, 0.2)',
  color: '#d6deeb',
};

export default function Reminders() {
  const { user } = useAuth();
  const { reminders, fetchReminders, addReminder, updateReminder, deleteReminder, toggleReminder } =
    useRemindersStore();
  const { show } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_type: 'custom' as ReminderType,
    time: '09:00',
    frequency: 'daily' as Frequency,
    days_of_week: [] as number[],
  });

  useEffect(() => {
    if (user) {
      fetchReminders(user.id);
    }
  }, [user, fetchReminders]);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`completed_reminders_${today}`);
    if (stored) {
      setCompletedToday(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingReminder) {
        await updateReminder(editingReminder.id, formData);
        show('Reminder updated successfully', 'success');
      } else {
        await addReminder(user.id, formData);
        show('Reminder created successfully', 'success');
      }
      resetForm();
    } catch {
      show('Failed to save reminder', 'error');
    }
  };

  const handleComplete = (id: string) => {
    const updated = [...completedToday, id];
    setCompletedToday(updated);
    const today = new Date().toDateString();
    localStorage.setItem(`completed_reminders_${today}`, JSON.stringify(updated));
    show('Reminder completed! Great job! 🎉', 'success');
  };

  const handleSnooze = (id: string, minutes: number) => {
    show(`Reminder snoozed for ${minutes} minutes`, 'success');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reminder_type: 'custom',
      time: '09:00',
      frequency: 'daily',
      days_of_week: [],
    });
    setEditingReminder(null);
    setShowForm(false);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      reminder_type: reminder.reminder_type,
      time: reminder.time,
      frequency: reminder.frequency,
      days_of_week: reminder.days_of_week || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      await deleteReminder(id);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await toggleReminder(id, !isActive);
    show(isActive ? 'Reminder disabled' : 'Reminder enabled', 'success');
  };

  const handleSelectTemplate = (template: {
    title: string;
    type: ReminderType;
    time: string;
    frequency: Frequency;
    days_of_week?: number[];
  }) => {
    setFormData({
      ...formData,
      title: template.title,
      reminder_type: template.type,
      time: template.time,
      frequency: template.frequency,
      days_of_week: template.days_of_week || [],
    });
    setShowForm(true);
    show('Template loaded! Customize and save', 'success');
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day].sort(),
    }));
  };

  const reminderTypeOptions: { value: ReminderType; label: string; icon: string }[] = [
    { value: 'hydration', label: 'Hydration', icon: '💧' },
    { value: 'medication', label: 'Medication', icon: '💊' },
    { value: 'workout', label: 'Workout', icon: '🏋️' },
    { value: 'sleep', label: 'Sleep', icon: '😴' },
    { value: 'custom', label: 'Custom', icon: '🔔' },
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const organizedReminders = useMemo(() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const today = now.getDay();

    const active = reminders.filter(r => r.is_active);

    const todaysReminders = active.filter(reminder => {
      if (reminder.frequency === 'daily') return true;
      if (reminder.frequency === 'weekly' && reminder.days_of_week) {
        return reminder.days_of_week.includes(today);
      }
      if (reminder.frequency === 'custom' && reminder.days_of_week) {
        return reminder.days_of_week.includes(today);
      }
      return false;
    });

    const groups = {
      now: [] as Reminder[],
      soon: [] as Reminder[],
      today: [] as Reminder[],
      inactive: reminders.filter(r => !r.is_active),
    };

    todaysReminders.forEach(reminder => {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const reminderTime = hours * 60 + minutes;
      const diffMinutes = reminderTime - currentTime;

      if (completedToday.includes(reminder.id)) {
        return;
      }

      if (diffMinutes <= 0 && diffMinutes > -30) {
        groups.now.push(reminder);
      } else if (diffMinutes > 0 && diffMinutes <= 60) {
        groups.soon.push(reminder);
      } else if (diffMinutes > 60) {
        groups.today.push(reminder);
      }
    });

    return groups;
  }, [reminders, completedToday]);

  return (
    <PageWrapper theme="settings">
      <div className="page-container space-section">
        <PageHeader
          title="Reminders"
          subtitle="Stay on track with your health goals"
          theme="settings"
          icon={<Bell className="w-12 h-12" style={{ color: '#82aaff' }} />}
        />

        <RemindersOverview reminders={reminders} completedToday={completedToday} />

        {!showForm && (
          <QuickTemplates onSelectTemplate={handleSelectTemplate} />
        )}

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            style={{ 
              background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
              color: '#011627'
            }}
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancel' : 'Create Custom Reminder'}
          </button>
        </div>

      {showForm && (
        <div 
          className="p-8 mb-8 rounded-xl"
          style={{
            background: 'rgba(29, 59, 83, 0.6)',
            border: '1px solid rgba(127, 219, 202, 0.1)'
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#d6deeb' }}>
            {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Type</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {reminderTypeOptions.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, reminder_type: type.value })}
                    className="py-3 px-4 rounded-lg transition-all duration-200"
                    style={formData.reminder_type === type.value ? {
                      background: 'rgba(127, 219, 202, 0.15)',
                      border: '2px solid rgba(127, 219, 202, 0.5)',
                      color: '#7fdbca'
                    } : {
                      background: 'rgba(95, 126, 151, 0.1)',
                      border: '2px solid rgba(95, 126, 151, 0.2)',
                      color: '#5f7e97'
                    }}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5f7e97' }}>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                style={inputStyle}
                placeholder="e.g., Drink water, Take vitamins"
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
              <label className="block text-sm font-medium mb-1" style={{ color: '#5f7e97' }}>Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 resize-none"
                style={inputStyle}
                placeholder="Additional details..."
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#5f7e97' }}>Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                <label className="block text-sm font-medium mb-1" style={{ color: '#5f7e97' }}>Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Frequency })}
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
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom Days</option>
                </select>
              </div>
            </div>

            {(formData.frequency === 'weekly' || formData.frequency === 'custom') && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Days of Week</label>
                <div className="flex gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className="flex-1 py-2 rounded-lg transition-all duration-200"
                      style={formData.days_of_week.includes(index) ? {
                        background: 'rgba(127, 219, 202, 0.15)',
                        border: '2px solid rgba(127, 219, 202, 0.5)',
                        color: '#7fdbca'
                      } : {
                        background: 'rgba(95, 126, 151, 0.1)',
                        border: '2px solid rgba(95, 126, 151, 0.2)',
                        color: '#5f7e97'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                style={{ 
                  background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                  color: '#011627'
                }}
              >
                {editingReminder ? 'Update' : 'Create'} Reminder
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                style={{ 
                  background: 'rgba(95, 126, 151, 0.2)',
                  border: '1px solid rgba(127, 219, 202, 0.2)',
                  color: '#d6deeb'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Time-Based Reminder Groups */}
      <div className="space-y-6">
        {/* NOW - Urgent */}
        {organizedReminders.now.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5" style={{ color: '#ff5874' }} />
              <h2 className="text-xl font-bold" style={{ color: '#d6deeb' }}>Now</h2>
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(255, 88, 116, 0.15)', color: '#ff5874' }}
              >
                {organizedReminders.now.length} urgent
              </span>
            </div>
            <div className="space-y-3">
              {organizedReminders.now.map((reminder) => {
                const typeOption = reminderTypeOptions.find((t) => t.value === reminder.reminder_type);
                return (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    isCompleted={completedToday.includes(reminder.id)}
                    onComplete={handleComplete}
                    onSnooze={handleSnooze}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    timeLabel="NOW"
                    icon={typeOption?.icon || '🔔'}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* SOON - Next Hour */}
        {organizedReminders.soon.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" style={{ color: '#ffcb6b' }} />
              <h2 className="text-xl font-bold" style={{ color: '#d6deeb' }}>Coming Soon</h2>
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(255, 203, 107, 0.15)', color: '#ffcb6b' }}
              >
                Next hour
              </span>
            </div>
            <div className="space-y-3">
              {organizedReminders.soon.map((reminder) => {
                const typeOption = reminderTypeOptions.find((t) => t.value === reminder.reminder_type);
                return (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    isCompleted={completedToday.includes(reminder.id)}
                    onComplete={handleComplete}
                    onSnooze={handleSnooze}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    icon={typeOption?.icon || '🔔'}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* TODAY - Later */}
        {organizedReminders.today.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5" style={{ color: '#82aaff' }} />
              <h2 className="text-xl font-bold" style={{ color: '#d6deeb' }}>Later Today</h2>
            </div>
            <div className="space-y-3">
              {organizedReminders.today.map((reminder) => {
                const typeOption = reminderTypeOptions.find((t) => t.value === reminder.reminder_type);
                return (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    isCompleted={completedToday.includes(reminder.id)}
                    onComplete={handleComplete}
                    onSnooze={handleSnooze}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    icon={typeOption?.icon || '🔔'}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* INACTIVE */}
        {organizedReminders.inactive.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#d6deeb' }}>Inactive Reminders</h2>
            <div className="space-y-3 opacity-60">
              {organizedReminders.inactive.map((reminder) => {
                const typeOption = reminderTypeOptions.find((t) => t.value === reminder.reminder_type);
                return (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    isCompleted={false}
                    onComplete={handleComplete}
                    onSnooze={handleSnooze}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    icon={typeOption?.icon || '🔔'}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {reminders.length === 0 && (
          <div 
            className="p-12 text-center rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <Bell className="w-16 h-16 mx-auto mb-4" style={{ color: '#5f7e97' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#d6deeb' }}>No reminders yet</h3>
            <p className="mb-6" style={{ color: '#5f7e97' }}>Start with a template or create a custom reminder</p>
          </div>
        )}
      </div>
      </div>
    </PageWrapper>
  );
}
