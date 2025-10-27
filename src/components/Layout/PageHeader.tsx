import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  theme?: 'dashboard' | 'cycle' | 'goals' | 'insights' | 'settings';
  icon?: ReactNode;
}

const gradientConfig = {
  dashboard: 'from-purple-500/20 via-violet-500/20 to-fuchsia-500/20',
  cycle: 'from-fuchsia-500/20 via-pink-500/20 to-rose-500/20',
  goals: 'from-orange-500/20 via-amber-500/20 to-yellow-500/20',
  insights: 'from-violet-500/20 via-purple-500/20 to-indigo-500/20',
  settings: 'from-slate-500/20 via-gray-500/20 to-zinc-500/20',
};

export default function PageHeader({ title, subtitle, theme = 'dashboard', icon }: PageHeaderProps) {
  return (
    <div 
      className="relative h-[240px] overflow-hidden rounded-3xl mb-8"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(139, 58, 143, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Gradient background with organic shapes */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientConfig[theme]}`}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-[100px]" />
        
        {/* Art pattern overlay */}
        <div className="absolute inset-0 opacity-5 mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-${theme}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="currentColor" className="text-white" />
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
            <div className="inline-flex mb-4">
              {icon}
            </div>
          )}
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3" style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)' }}>
            {title}
          </h1>
          <p className="text-lg text-purple-100 font-medium" style={{ textShadow: '0 1px 10px rgba(0, 0, 0, 0.2)' }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

