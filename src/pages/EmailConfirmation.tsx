import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Mail, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

export default function EmailConfirmation() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from user or localStorage
    const userEmail = user?.email || localStorage.getItem('pendingEmail') || '';
    setEmail(userEmail);

    // Start countdown timer
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  const handleResendEmail = async () => {
    // This would trigger a resend email function
    // For now, we'll just reset the countdown
    setCountdown(60);
    // You could add a toast notification here
  };

  const handleBackToLogin = () => {
    // Clear any pending email data
    localStorage.removeItem('pendingEmail');
    // Redirect to login page
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600">We've sent you a confirmation link</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Almost there!
            </h2>
            <p className="text-gray-600 mb-4">
              We've sent a confirmation link to:
            </p>
            <p className="font-medium text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
              {email}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Check your inbox</p>
                <p className="text-sm text-gray-600">
                  Look for an email from Health Tracker
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Click the confirmation link</p>
                <p className="text-sm text-gray-600">
                  This will activate your account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Start tracking your health</p>
                <p className="text-sm text-gray-600">
                  Access your personalized dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Didn't receive the email?</p>
                <p className="text-sm text-blue-700">
                  Check your spam folder or wait a few minutes. Sometimes emails can be delayed.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={countdown > 0}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
            >
              {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend confirmation email'}
            </button>

            <button
              onClick={handleBackToLogin}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Having trouble? Contact support at{' '}
              <a href="mailto:support@healthtracker.com" className="text-emerald-600 hover:text-emerald-700">
                support@healthtracker.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
