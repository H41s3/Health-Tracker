import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import EmailConfirmation from './pages/EmailConfirmation';
import Dashboard from './pages/Dashboard';
import CycleTracker from './pages/CycleTracker';
import CustomMetrics from './pages/CustomMetrics';
import HealthJournal from './pages/HealthJournal';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import DashboardLayout from './components/Layout/DashboardLayout';
import { useToastStore } from './stores/useToastStore';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { toasts, remove } = useToastStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 25%, #4a1e5c 50%, #6b2d7a 75%, #8b3a8f 100%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}></div>
          <p className="text-purple-100 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user needs email confirmation
  if (user && !user.email_confirmed_at && localStorage.getItem('pendingEmail')) {
    return <EmailConfirmation />;
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'cycle':
        return <CycleTracker />;
      case 'metrics':
        return <CustomMetrics />;
      case 'notes':
        return <HealthJournal />;
      case 'reminders':
        return <Reminders />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {/* Toasts */}
      <div className="fixed z-[999] top-4 right-4 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg border-2 font-medium text-sm bg-white backdrop-blur-sm ${
              t.type === 'success' ? 'border-purple-500 text-purple-800' : t.type === 'error' ? 'border-red-500 text-red-800' : 'border-indigo-500 text-indigo-800'
            }`}
            onClick={() => remove(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
      {renderPage()}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
