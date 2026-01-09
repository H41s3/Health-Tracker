import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function DashboardLayout({ children, currentPage, onNavigate }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
          style={{ 
            background: 'rgba(1, 22, 39, 0.8)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={(page) => {
          onNavigate(page);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main content */}
      <main className="lg:ml-64">
        {/* Mobile header */}
        <div 
          className="lg:hidden px-4 py-3 flex items-center justify-between sticky top-0 z-30"
          style={{
            background: 'rgba(11, 41, 66, 0.9)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(127, 219, 202, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: '#5f7e97' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(127, 219, 202, 0.1)';
              e.currentTarget.style.color = '#7fdbca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#5f7e97';
            }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold" style={{ color: '#d6deeb' }}>Health Tracker</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
        
        {/* Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
