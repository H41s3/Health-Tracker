import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastItem } from '../stores/useToastStore';

interface ToastProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
  autoHideDuration?: number;
}

export function Toast({ toast, onRemove, autoHideDuration = 5000 }: ToastProps) {
  useEffect(() => {
    if (toast.type !== 'error') {
      // Errors don't auto-dismiss, user must close them
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

  const colors = {
    success: 'border-green-500 bg-green-50 text-green-800',
    error: 'border-red-500 bg-red-50 text-red-800',
    info: 'border-blue-500 bg-blue-50 text-blue-800',
  };

  const Icon = icons[toast.type];

  return (
    <div
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`px-4 py-3 rounded-lg shadow-lg border font-medium text-sm bg-white backdrop-blur-sm transition-all duration-300 ${
        colors[toast.type]
      }`}
      style={{
        animation: 'slide-in-right 0.3s ease-out',
      }}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="flex-1">{toast.message}</p>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

