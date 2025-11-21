import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Activity } from 'lucide-react';
import EmailConfirmation from './EmailConfirmation';
import { signUpSchema, signInSchema, resetPasswordSchema, validateForm } from '../utils/validation';
import { getErrorMessage } from '../utils/errorHandler';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      if (resetMode) {
        const validation = validateForm(resetPasswordSchema, { email });
        if (!validation.success) {
          setFieldErrors(validation.errors || {});
          setLoading(false);
          return;
        }

        const { error } = await resetPassword(email);
        if (error) {
          setError(getErrorMessage(error));
        } else {
          setResetSuccess(true);
        }
      } else if (isSignUp) {
        const validation = validateForm(signUpSchema, { email, password, fullName });
        if (!validation.success) {
          setFieldErrors(validation.errors || {});
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(getErrorMessage(error));
        } else {
          // Signup successful - show confirmation page immediately
          setShowConfirmation(true);
        }
      } else {
        const validation = validateForm(signInSchema, { email, password });
        if (!validation.success) {
          setFieldErrors(validation.errors || {});
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          setError(getErrorMessage(error));
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFieldErrors({});
    setResetMode(false);
    setResetSuccess(false);
  };

  const toggleResetMode = () => {
    setResetMode(!resetMode);
    setError('');
    setFieldErrors({});
    setResetSuccess(false);
  };

  // Show confirmation page if signup was successful
  if (showConfirmation) {
    return <EmailConfirmation />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 rounded-2xl mb-4">
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
              <div className="text-purple-600 mb-4">
                Password reset email sent! Check your inbox.
              </div>
              <button
                onClick={() => {
                  setResetMode(false);
                  setResetSuccess(false);
                }}
                className="text-purple-600 hover:text-purple-700 font-medium"
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
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition ${
                      fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!fieldErrors.fullName}
                    aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
                  />
                  {fieldErrors.fullName && (
                    <p id="fullName-error" className="mt-1 text-sm text-red-600" role="alert">
                      {fieldErrors.fullName}
                    </p>
                  )}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition ${
                    fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                {fieldErrors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition ${
                      fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  />
                  {fieldErrors.password && (
                    <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                      {fieldErrors.password}
                    </p>
                  )}
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
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 hover:from-purple-600 hover:via-pink-600 hover:to-yellow-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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