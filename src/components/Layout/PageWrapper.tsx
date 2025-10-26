import { ReactNode } from 'react';
import AmbientArt from './AmbientArt';

interface PageWrapperProps {
  children: ReactNode;
  theme?: 'dashboard' | 'cycle' | 'goals' | 'insights' | 'settings';
}

export default function PageWrapper({ children, theme = 'dashboard' }: PageWrapperProps) {
  return (
    <div className="relative min-h-screen">
      {/* Content layer - AmbientArt disabled for performance */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

