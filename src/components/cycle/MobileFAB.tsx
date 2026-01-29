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
      color: '#ff5874',
      bgColor: 'rgba(255, 88, 116, 0.9)',
      action: () => onQuickLog('period'),
    },
    {
      id: 'pill',
      label: 'Log Pill',
      icon: Pill,
      color: '#c792ea',
      bgColor: 'rgba(199, 146, 234, 0.9)',
      action: () => onQuickLog('pill'),
    },
    {
      id: 'mood',
      label: 'Log Mood',
      icon: Smile,
      color: '#82aaff',
      bgColor: 'rgba(130, 170, 255, 0.9)',
      action: () => onQuickLog('mood'),
    },
    {
      id: 'symptom',
      label: 'Log Symptom',
      icon: Droplet,
      color: '#7fdbca',
      bgColor: 'rgba(127, 219, 202, 0.9)',
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
                  <div 
                    className="px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    style={{ 
                      background: 'rgba(29, 59, 83, 0.95)', 
                      border: '1px solid rgba(127, 219, 202, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: '#d6deeb' }}>{action.label}</span>
                  </div>
                  
                  {/* Button */}
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    style={{ background: action.bgColor }}
                  >
                    <Icon className="w-6 h-6" style={{ color: '#011627' }} />
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
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'rotate-45 scale-110' : 'rotate-0'
        }`}
        style={{ background: 'linear-gradient(135deg, #c792ea 0%, #ff5874 100%)' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-8 h-8" style={{ color: '#011627' }} />
        ) : (
          <Plus className="w-8 h-8" style={{ color: '#011627' }} />
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
            className="fixed inset-0 -z-10"
            style={{ background: 'rgba(1, 22, 39, 0.5)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
