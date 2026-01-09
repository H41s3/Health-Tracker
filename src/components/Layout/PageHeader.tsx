import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  theme?: 'dashboard' | 'cycle' | 'goals' | 'insights' | 'settings';
  icon?: ReactNode;
}

// Night Owl theme gradients
const themeConfig = {
  dashboard: {
    gradient: 'linear-gradient(135deg, rgba(127, 219, 202, 0.15) 0%, rgba(130, 170, 255, 0.1) 50%, rgba(199, 146, 234, 0.08) 100%)',
    glow1: 'rgba(127, 219, 202, 0.2)',
    glow2: 'rgba(130, 170, 255, 0.15)',
  },
  cycle: {
    gradient: 'linear-gradient(135deg, rgba(255, 106, 193, 0.15) 0%, rgba(199, 146, 234, 0.1) 50%, rgba(130, 170, 255, 0.08) 100%)',
    glow1: 'rgba(255, 106, 193, 0.2)',
    glow2: 'rgba(199, 146, 234, 0.15)',
  },
  goals: {
    gradient: 'linear-gradient(135deg, rgba(247, 140, 108, 0.15) 0%, rgba(255, 203, 107, 0.1) 50%, rgba(173, 219, 103, 0.08) 100%)',
    glow1: 'rgba(247, 140, 108, 0.2)',
    glow2: 'rgba(255, 203, 107, 0.15)',
  },
  insights: {
    gradient: 'linear-gradient(135deg, rgba(199, 146, 234, 0.15) 0%, rgba(130, 170, 255, 0.1) 50%, rgba(127, 219, 202, 0.08) 100%)',
    glow1: 'rgba(199, 146, 234, 0.2)',
    glow2: 'rgba(130, 170, 255, 0.15)',
  },
  settings: {
    gradient: 'linear-gradient(135deg, rgba(95, 126, 151, 0.15) 0%, rgba(29, 59, 83, 0.1) 50%, rgba(11, 41, 66, 0.08) 100%)',
    glow1: 'rgba(95, 126, 151, 0.2)',
    glow2: 'rgba(127, 219, 202, 0.1)',
  },
};

export default function PageHeader({ title, subtitle, theme = 'dashboard', icon }: PageHeaderProps) {
  const config = themeConfig[theme];

  return (
    <div 
      className="relative h-[200px] lg:h-[240px] overflow-hidden rounded-3xl mb-8"
      style={{
        background: 'rgba(29, 59, 83, 0.6)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(127, 219, 202, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Gradient background */}
      <div 
        className="absolute inset-0"
        style={{ background: config.gradient }}
      >
        {/* Decorative glowing orbs */}
        <div 
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-[80px]"
          style={{ background: config.glow1 }}
        />
        <div 
          className="absolute top-20 -right-20 w-80 h-80 rounded-full blur-[100px]"
          style={{ background: config.glow2 }}
        />
        
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-${theme}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="#7fdbca" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#pattern-${theme})`} />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6 lg:px-8">
        <div className="text-center max-w-2xl">
          {icon && (
            <div className="inline-flex mb-4">
              {icon}
            </div>
          )}
          <h1 
            className="text-3xl lg:text-5xl font-bold mb-3"
            style={{ 
              color: '#d6deeb',
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.4)' 
            }}
          >
            {title}
          </h1>
          <p 
            className="text-base lg:text-lg font-medium"
            style={{ 
              color: '#7fdbca',
              textShadow: '0 1px 10px rgba(0, 0, 0, 0.3)' 
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
