import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  className?: string;
}

const ProgressRing = memo(function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#10b981',
  backgroundColor = '#e2e8f0',
  showPercentage = true,
  className = ''
}: ProgressRingProps) {
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const strokeDashoffset = useMemo(() => circumference - (progress / 100) * circumference, [circumference, progress]);

  return (
    <div className={`progress-ring ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      
      {/* Center content */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-slate-900">{Math.round(progress)}%</div>
          </motion.div>
        </div>
      )}
    </div>
  );
});

export default ProgressRing;
