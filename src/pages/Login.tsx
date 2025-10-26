import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Activity } from 'lucide-react';
import EmailConfirmation from './EmailConfirmation';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (resetMode) {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setResetSuccess(true);
        }
      } else if (isSignUp) {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          // Signup successful - show confirmation page immediately
          setShowConfirmation(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setResetMode(false);
    setResetSuccess(false);
  };

  const toggleResetMode = () => {
    setResetMode(!resetMode);
    setError('');
    setResetSuccess(false);
  };

  // Show confirmation page if signup was successful
  if (showConfirmation) {
    return <EmailConfirmation />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Tracker</h1>
          <p className="text-gray-600">Track your health journey with ease</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {resetMode ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {resetSuccess ? (
            <div className="text-center py-4">
              <div className="text-green-600 mb-4">
                Password reset email sent! Check your inbox.
              </div>
              <button
                onClick={() => {
                  setResetMode(false);
                  setResetSuccess(false);
                }}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && !resetMode && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              {!resetMode && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    required
                    minLength={6}
                  />
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : resetMode ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>

              {!resetMode && (
                <button
                  type="button"
                  onClick={toggleResetMode}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  Forgot password?
                </button>
              )}
            </form>
          )}

          {!resetSuccess && (
            <div className="mt-6 text-center">
              <button
                onClick={resetMode ? toggleResetMode : toggleMode}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {resetMode
                  ? 'Back to login'
                  : isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}