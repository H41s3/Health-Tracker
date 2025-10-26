import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  theme?: 'dashboard' | 'cycle' | 'goals' | 'insights' | 'settings';
  icon?: ReactNode;
}

const gradientConfig = {
  dashboard: 'from-pink-100/40 via-blue-100/40 via-purple-100/40 to-rose-100/40',
  cycle: 'from-lavender-100/40 via-coral-100/40 via-rose-100/40 to-pink-100/40',
  goals: 'from-emerald-100/40 via-teal-100/40 via-cyan-100/40 to-sky-100/40',
  insights: 'from-violet-100/40 via-indigo-100/40 via-blue-100/40 to-purple-100/40',
  settings: 'from-slate-100/40 via-gray-100/40 via-neutral-100/40 to-stone-100/40',
};

export default function PageHeader({ title, subtitle, theme = 'dashboard', icon }: PageHeaderProps) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0.3]);
  const scale = useTransform(scrollY, [0, 200], [1, 0.95]);
  const y = useTransform(scrollY, [0, 200], [0, -50]);

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="relative h-[240px] overflow-hidden rounded-3xl mb-8"
    >
      {/* Gradient background with organic shapes */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientConfig[theme]} backdrop-blur-xl`}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/20 rounded-full blur-[80px]" />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-white/25 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-white/15 rounded-full blur-[90px]" />
        
        {/* Art pattern overlay */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-${theme}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="currentColor" className="text-slate-400" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#pattern-${theme})`} />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-8">
        <div className="text-center max-w-2xl">
          {icon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex mb-4"
            >
              {icon}
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl lg:text-5xl font-bold text-slate-900 mb-3"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-slate-600 font-medium"
          >
            {subtitle}
          </motion.p>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: [1, 0.5, 1], y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-slate-300/40 flex items-start justify-center p-1">
          <div className="w-1 h-3 rounded-full bg-slate-400/60" />
        </div>
      </motion.div>
    </motion.div>
  );
}

