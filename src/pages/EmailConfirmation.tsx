import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Activity, Mail, CheckCircle, Clock, ArrowLeft, AlertCircle } from 'lucide-react';

export default function EmailConfirmation() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

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
    setResendError('');
    setResendSuccess(false);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        setResendError(error.message || 'Failed to resend email');
      } else {
        setResendSuccess(true);
        setCountdown(60);
      }
    } catch {
      setResendError('Failed to resend email. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    // Clear any pending email data
    localStorage.removeItem('pendingEmail');
    // Redirect to login page
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600">We've sent you a confirmation link</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-purple-600" />
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
              <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Check your inbox</p>
                <p className="text-sm text-gray-600">
                  Look for an email from Health Tracker
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Click the confirmation link</p>
                <p className="text-sm text-gray-600">
                  This will activate your account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Start tracking your health</p>
                <p className="text-sm text-gray-600">
                  Access your personalized dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-purple-900">Didn't receive the email?</p>
                <p className="text-sm text-purple-700">
                  Check your spam folder or wait a few minutes. Sometimes emails can be delayed.
                </p>
              </div>
            </div>
          </div>

          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">
                Confirmation email sent successfully! Please check your inbox.
              </p>
            </div>
          )}

          {resendError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{resendError}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={countdown > 0}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 hover:from-purple-600 hover:via-pink-600 hover:to-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
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
              <a href="mailto:support@healthtracker.com" className="text-purple-600 hover:text-purple-700">
                support@healthtracker.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
