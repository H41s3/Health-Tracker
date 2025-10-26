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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
            className={`px-4 py-3 rounded-lg shadow border text-sm bg-white ${
              t.type === 'success' ? 'border-emerald-200 text-emerald-700' : t.type === 'error' ? 'border-red-200 text-red-700' : 'border-gray-200 text-gray-700'
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
