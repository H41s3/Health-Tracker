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
  return (
    <div className="relative h-[240px] overflow-hidden rounded-3xl mb-8">
      {/* Gradient background with organic shapes */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientConfig[theme]} backdrop-blur-xl`}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/20 rounded-full blur-[80px]" />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-white/25 rounded-full blur-[100px]" />
        
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
            <div className="inline-flex mb-4">
              {icon}
            </div>
          )}
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
            {title}
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

