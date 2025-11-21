import { useState } from 'react';
import { Check, Clock, Edit2, Trash2, BellOff, Bell, MoreVertical } from 'lucide-react';
import { Reminder } from '../../types/database';
import { motion, AnimatePresence } from 'framer-motion';

interface ReminderCardProps {
  reminder: Reminder;
  isCompleted: boolean;
  onComplete: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  timeLabel?: string;
  icon: string;
}

export default function ReminderCard({
  reminder,
  isCompleted,
  onComplete,
  onSnooze,
  onEdit,
  onDelete,
  onToggle,
  timeLabel,
  icon,
}: ReminderCardProps) {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const snoozeOptions = [
    { label: '5m', minutes: 5 },
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '1h', minutes: 60 },
  ];

  const getDayNames = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (!reminder.days_of_week || reminder.days_of_week.length === 0) return null;
    return reminder.days_of_week.map(d => dayNames[d]).join(', ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`card p-5 group hover:shadow-lg transition-all duration-200 ${
        isCompleted ? 'bg-emerald-50 border-emerald-200' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`text-3xl ${isCompleted ? 'grayscale opacity-50' : ''}`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-semibold text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {reminder.title}
            </h3>
            {timeLabel && (
              <span className="flex-shrink-0 px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse">
                {timeLabel}
              </span>
            )}
          </div>

          {reminder.description && (
            <p className="text-sm text-gray-600 mb-3">{reminder.description}</p>
          )}

          <div className="flex flex-wrap gap-2 text-xs mb-3">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
              🕐 {reminder.time}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium capitalize">
              {reminder.frequency}
            </span>
            {getDayNames() && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                📅 {getDayNames()}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {!isCompleted && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onComplete(reminder.id)}
                className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Check className="w-4 h-4" />
                Complete
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Snooze
                </button>

                <AnimatePresence>
                  {showSnoozeOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10 min-w-[160px]"
                    >
                      {snoozeOptions.map((option) => (
                        <button
                          key={option.minutes}
                          onClick={() => {
                            onSnooze(reminder.id, option.minutes);
                            setShowSnoozeOptions(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-amber-50 rounded transition-colors font-medium text-gray-700"
                        >
                          Snooze {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Completed Message */}
          {isCompleted && (
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <Check className="w-5 h-5" />
              <span>Completed</span>
            </div>
          )}
        </div>

        {/* Action Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10 min-w-[160px]"
              >
                <button
                  onClick={() => {
                    onEdit(reminder);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onToggle(reminder.id, reminder.is_active);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
                >
                  {reminder.is_active ? (
                    <>
                      <BellOff className="w-4 h-4" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      Enable
                    </>
                  )}
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    onDelete(reminder.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

