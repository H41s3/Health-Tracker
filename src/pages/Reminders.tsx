import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRemindersStore } from '../stores/useRemindersStore';
import { Bell, Plus, Edit2, Trash2, BellOff } from 'lucide-react';
import { Reminder, ReminderType, Frequency } from '../types/database';

export default function Reminders() {
  const { user } = useAuth();
  const { reminders, fetchReminders, addReminder, updateReminder, deleteReminder, toggleReminder } =
    useRemindersStore();
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
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
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingReminder) {
      await updateReminder(editingReminder.id, formData);
    } else {
      await addReminder(user.id, formData);
    }

    resetForm();
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

  const activeReminders = reminders.filter((r) => r.is_active);
  const inactiveReminders = reminders.filter((r) => !r.is_active);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reminders</h1>
        <p className="text-gray-600">Set up reminders to stay on track with your health goals</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'Create Reminder'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingReminder ? 'Edit Reminder' : 'New Reminder'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {reminderTypeOptions.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, reminder_type: type.value })}
                    className={`py-3 px-4 rounded-lg border-2 transition ${
                      formData.reminder_type === type.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="e.g., Drink water, Take vitamins"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                placeholder="Additional details..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Frequency })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom Days</option>
                </select>
              </div>
            </div>

            {(formData.frequency === 'weekly' || formData.frequency === 'custom') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                <div className="flex gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`flex-1 py-2 rounded-lg border-2 transition ${
                        formData.days_of_week.includes(index)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
              >
                {editingReminder ? 'Update' : 'Create'} Reminder
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {activeReminders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Reminders</h2>
            <div className="space-y-3">
              {activeReminders.map((reminder) => {
                const typeOption = reminderTypeOptions.find((t) => t.value === reminder.reminder_type);
                return (
                  <div
                    key={reminder.id}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{typeOption?.icon || '🔔'}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{reminder.title}</h3>
                        {reminder.description && (
                          <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {reminder.time}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                            {reminder.frequency}
                          </span>
                          {reminder.days_of_week && reminder.days_of_week.length > 0 && (
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {reminder.days_of_week.map((d) => dayNames[d]).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggle(reminder.id, reminder.is_active)}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="Disable reminder"
                        >
                          <BellOff className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(reminder)}
                          className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {inactiveReminders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inactive Reminders</h2>
            <div className="space-y-3">
              {inactiveReminders.map((reminder) => {
                const typeOption = reminderTypeOptions.find((t) => t.value === reminder.reminder_type);
                return (
                  <div
                    key={reminder.id}
                    className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-200 opacity-60"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl grayscale">{typeOption?.icon || '🔔'}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{reminder.title}</h3>
                        {reminder.description && (
                          <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-gray-200 rounded">
                            {reminder.time}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 rounded capitalize">
                            {reminder.frequency}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggle(reminder.id, reminder.is_active)}
                          className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Enable reminder"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {reminders.length === 0 && (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">No reminders set yet. Create your first reminder!</p>
          </div>
        )}
      </div>
    </div>
  );
}
