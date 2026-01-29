import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export default function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  animate = true
}: SkeletonProps) {
  const baseStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgba(95, 126, 151, 0.2) 0%, rgba(95, 126, 151, 0.35) 50%, rgba(95, 126, 151, 0.2) 100%)',
    backgroundSize: '200% 100%',
    width: width,
    height: height,
  };

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  };

  if (animate) {
    return (
      <motion.div
        className={`${variantClasses[variant]} ${className}`}
        style={baseStyle}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    );
  }

  return (
    <div
      className={`${variantClasses[variant]} ${className} animate-pulse`}
      style={{ ...baseStyle, background: 'rgba(95, 126, 151, 0.2)' }}
    />
  );
}

// Preset skeleton layouts for common use cases
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`p-6 rounded-xl ${className}`}
      style={{ background: 'rgba(29, 59, 83, 0.6)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" className="w-32 h-5 mb-2" />
          <Skeleton variant="text" className="w-24 h-3" />
        </div>
      </div>
      <Skeleton variant="rounded" className="w-full h-24" />
    </div>
  );
}

export function SkeletonMetricCard() {
  return (
    <div 
      className="p-6 rounded-xl"
      style={{ background: 'rgba(29, 59, 83, 0.6)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" className="w-16 h-4" />
      </div>
      <Skeleton variant="text" className="w-20 h-8 mb-2" />
      <Skeleton variant="text" className="w-full h-3 mb-3" />
      <Skeleton variant="rounded" className="w-full h-2" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div 
      className="p-6 rounded-xl"
      style={{ background: 'rgba(29, 59, 83, 0.6)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" className="w-32 h-6" />
        <div className="flex gap-2">
          <Skeleton variant="rounded" className="w-20 h-8" />
          <Skeleton variant="rounded" className="w-20 h-8" />
        </div>
      </div>
      <div className="flex items-end gap-2 h-64">
        {[0.4, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7].map((h, i) => (
          <Skeleton 
            key={i} 
            variant="rounded" 
            className="flex-1" 
            height={`${h * 100}%`}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className="p-4 rounded-xl flex items-center gap-4"
          style={{ background: 'rgba(11, 41, 66, 0.5)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton variant="text" className="w-3/4 h-4 mb-2" />
            <Skeleton variant="text" className="w-1/2 h-3" />
          </div>
          <Skeleton variant="rounded" className="w-16 h-8" />
        </div>
      ))}
    </div>
  );
}
