import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
}

/**
 * Optimized animated button using hardware-accelerated transforms
 * Prevents layout thrashing and ensures 60fps animations
 * Night Owl themed
 */
export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  isLoading = false,
}: AnimatedButtonProps) {
  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
      color: '#011627',
    },
    secondary: {
      background: 'rgba(95, 126, 151, 0.2)',
      color: '#d6deeb',
    },
    success: {
      background: '#addb67',
      color: '#011627',
    },
    danger: {
      background: '#ff5874',
      color: '#011627',
    },
  };

  return (
    <motion.button
      onClick={disabled || isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
      className={`
        relative px-4 py-2 rounded-lg font-medium
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        ...variantStyles[variant],
        willChange: 'transform',
      }}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
