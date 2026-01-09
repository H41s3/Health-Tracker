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
      className="p-5 group rounded-xl transition-all duration-200"
      style={isCompleted ? {
        background: 'rgba(173, 219, 103, 0.1)',
        border: '1px solid rgba(173, 219, 103, 0.2)'
      } : {
        background: 'rgba(29, 59, 83, 0.6)',
        border: '1px solid rgba(127, 219, 202, 0.1)'
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`text-3xl ${isCompleted ? 'grayscale opacity-50' : ''}`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 
              className={`font-semibold ${isCompleted ? 'line-through' : ''}`}
              style={{ color: isCompleted ? '#5f7e97' : '#d6deeb' }}
            >
              {reminder.title}
            </h3>
            {timeLabel && (
              <span 
                className="flex-shrink-0 px-2 py-1 text-xs font-bold rounded-full animate-pulse"
                style={{ 
                  background: 'linear-gradient(135deg, #ff5874 0%, #f78c6c 100%)',
                  color: '#011627'
                }}
              >
                {timeLabel}
              </span>
            )}
          </div>

          {reminder.description && (
            <p className="text-sm mb-3" style={{ color: '#5f7e97' }}>{reminder.description}</p>
          )}

          <div className="flex flex-wrap gap-2 text-xs mb-3">
            <span 
              className="px-2 py-1 rounded font-medium"
              style={{ background: 'rgba(95, 126, 151, 0.2)', color: '#7fdbca' }}
            >
              🕐 {reminder.time}
            </span>
            <span 
              className="px-2 py-1 rounded font-medium capitalize"
              style={{ background: 'rgba(95, 126, 151, 0.2)', color: '#7fdbca' }}
            >
              {reminder.frequency}
            </span>
            {getDayNames() && (
              <span 
                className="px-2 py-1 rounded font-medium"
                style={{ background: 'rgba(95, 126, 151, 0.2)', color: '#7fdbca' }}
              >
                📅 {getDayNames()}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {!isCompleted && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onComplete(reminder.id)}
                className="flex-1 min-w-[120px] px-4 py-2 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, #7fdbca 0%, #addb67 100%)',
                  color: '#011627'
                }}
              >
                <Check className="w-4 h-4" />
                Complete
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                  className="px-4 py-2 font-semibold rounded-lg transition-colors flex items-center gap-2"
                  style={{ 
                    background: 'rgba(255, 203, 107, 0.15)',
                    color: '#ffcb6b'
                  }}
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
                      className="absolute top-full left-0 mt-2 rounded-lg p-2 z-10 min-w-[160px]"
                      style={{
                        background: '#1d3b53',
                        border: '1px solid rgba(127, 219, 202, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      {snoozeOptions.map((option) => (
                        <button
                          key={option.minutes}
                          onClick={() => {
                            onSnooze(reminder.id, option.minutes);
                            setShowSnoozeOptions(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm rounded transition-colors font-medium"
                          style={{ color: '#d6deeb' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 203, 107, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
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
            <div className="flex items-center gap-2 font-semibold" style={{ color: '#addb67' }}>
              <Check className="w-5 h-5" />
              <span>Completed</span>
            </div>
          )}
        </div>

        {/* Action Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#5f7e97' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(127, 219, 202, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 rounded-lg py-1 z-10 min-w-[160px]"
                style={{
                  background: '#1d3b53',
                  border: '1px solid rgba(127, 219, 202, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}
              >
                <button
                  onClick={() => {
                    onEdit(reminder);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2"
                  style={{ color: '#d6deeb' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(127, 219, 202, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onToggle(reminder.id, reminder.is_active);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2"
                  style={{ color: '#d6deeb' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(127, 219, 202, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
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
                <div style={{ borderTop: '1px solid rgba(127, 219, 202, 0.1)', margin: '4px 0' }} />
                <button
                  onClick={() => {
                    onDelete(reminder.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2"
                  style={{ color: '#ff5874' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 88, 116, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
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
