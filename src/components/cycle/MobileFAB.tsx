import { useState } from 'react';
import { Plus, X, Calendar, Pill, Smile, Droplet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileFABProps {
  onQuickLog: (type: 'period' | 'pill' | 'mood' | 'symptom') => void;
}

export default function MobileFAB({ onQuickLog }: MobileFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'period',
      label: 'Log Period',
      icon: Calendar,
      gradient: 'from-red-500 to-rose-500',
      action: () => onQuickLog('period'),
    },
    {
      id: 'pill',
      label: 'Log Pill',
      icon: Pill,
      gradient: 'from-purple-500 to-pink-500',
      action: () => onQuickLog('pill'),
    },
    {
      id: 'mood',
      label: 'Log Mood',
      icon: Smile,
      gradient: 'from-blue-500 to-indigo-500',
      action: () => onQuickLog('mood'),
    },
    {
      id: 'symptom',
      label: 'Log Symptom',
      icon: Droplet,
      gradient: 'from-emerald-500 to-green-500',
      action: () => onQuickLog('symptom'),
    },
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    action.action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 flex flex-col gap-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleActionClick(action)}
                  className="flex items-center gap-3 group"
                >
                  {/* Label */}
                  <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{action.label}</span>
                  </div>
                  
                  {/* Button */}
                  <div className={`w-14 h-14 bg-gradient-to-r ${action.gradient} rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 ${
          isOpen ? 'rotate-45 scale-110' : 'rotate-0'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <Plus className="w-8 h-8 text-white" />
        )}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

