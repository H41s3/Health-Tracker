import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastItem } from '../stores/useToastStore';

interface ToastProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
  autoHideDuration?: number;
}

// Night Owl toast styles
const toastStyles = {
  success: {
    background: 'rgba(173, 219, 103, 0.15)',
    border: '1px solid rgba(173, 219, 103, 0.3)',
    color: '#addb67',
    iconColor: '#addb67',
  },
  error: {
    background: 'rgba(255, 88, 116, 0.15)',
    border: '1px solid rgba(255, 88, 116, 0.3)',
    color: '#ff5874',
    iconColor: '#ff5874',
  },
  info: {
    background: 'rgba(130, 170, 255, 0.15)',
    border: '1px solid rgba(130, 170, 255, 0.3)',
    color: '#82aaff',
    iconColor: '#82aaff',
  },
};

export function Toast({ toast, onRemove, autoHideDuration = 5000 }: ToastProps) {
  useEffect(() => {
    if (toast.type !== 'error') {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.type, autoHideDuration, onRemove]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[toast.type];
  const style = toastStyles[toast.type];

  return (
    <div
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className="px-4 py-3 rounded-xl shadow-lg font-medium text-sm backdrop-blur-md transition-all duration-300"
      style={{
        background: style.background,
        border: style.border,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        animation: 'slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="flex items-start gap-3">
        <Icon 
          className="w-5 h-5 flex-shrink-0 mt-0.5" 
          style={{ color: style.iconColor }}
          aria-hidden="true" 
        />
        <p className="flex-1" style={{ color: '#d6deeb' }}>{toast.message}</p>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 rounded-lg transition-all duration-200"
          style={{ color: '#5f7e97' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(127, 219, 202, 0.1)';
            e.currentTarget.style.color = '#7fdbca';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#5f7e97';
          }}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
