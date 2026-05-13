import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  theme?: 'dashboard' | 'cycle' | 'goals' | 'insights' | 'settings';
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="relative min-h-screen">
      {/* Content layer - AmbientArt disabled for performance */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
