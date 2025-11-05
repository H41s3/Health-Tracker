import { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import { useToastStore } from './stores/useToastStore';
import { usePillReminder } from './hooks/usePillReminder';

// Lazy-load pages to reduce initial bundle size and improve TTI
const Login = lazy(() => import('./pages/Login'));
const EmailConfirmation = lazy(() => import('./pages/EmailConfirmation'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CycleTracker = lazy(() => import('./pages/CycleTracker'));
const CustomMetrics = lazy(() => import('./pages/CustomMetrics'));
const HealthJournal = lazy(() => import('./pages/HealthJournal'));
const Reminders = lazy(() => import('./pages/Reminders'));
const Settings = lazy(() => import('./pages/Settings'));

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { toasts, remove } = useToastStore();
  usePillReminder();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 25%, #4a1e5c 50%, #6b2d7a 75%, #8b3a8f 100%)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
        <Login />
      </Suspense>
    );
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
            className={`px-4 py-3 rounded-lg shadow-md border font-medium text-sm bg-white ${
              t.type === 'success' ? 'border-purple-500 text-purple-800' : t.type === 'error' ? 'border-red-500 text-red-800' : 'border-indigo-500 text-indigo-800'
            }`}
            onClick={() => remove(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
      <Suspense fallback={<div className="p-6">Loading…</div>}>
        {renderPage()}
      </Suspense>
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
