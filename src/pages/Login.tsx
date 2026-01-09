import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BaymaxLogo from '../components/BaymaxLogo';
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

  if (showConfirmation) {
    return <EmailConfirmation />;
  }

  const inputBaseStyle = {
    background: 'rgba(11, 41, 66, 0.8)',
    border: '1px solid rgba(127, 219, 202, 0.2)',
    color: '#d6deeb',
  };

  const inputErrorStyle = {
    ...inputBaseStyle,
    border: '1px solid #ff5874',
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ 
        background: '#011627',
        backgroundImage: `
          radial-gradient(ellipse at 20% 0%, rgba(130, 170, 255, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 100%, rgba(199, 146, 234, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(127, 219, 202, 0.05) 0%, transparent 70%)
        `
      }}
    >
      <div className="max-w-md w-full animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 50%, #c792ea 100%)',
              boxShadow: '0 8px 32px rgba(127, 219, 202, 0.3)'
            }}
          >
            <BaymaxLogo className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#d6deeb' }}>Health Tracker</h1>
          <p style={{ color: '#5f7e97' }}>Your personal healthcare companion</p>
        </div>

        {/* Card */}
        <div 
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(29, 59, 83, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(127, 219, 202, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}
        >
          <h2 className="text-2xl font-semibold mb-6" style={{ color: '#d6deeb' }}>
            {resetMode ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {resetSuccess ? (
            <div className="text-center py-4">
              <div className="mb-4" style={{ color: '#7fdbca' }}>
                Password reset email sent! Check your inbox.
              </div>
              <button
                onClick={() => {
                  setResetMode(false);
                  setResetSuccess(false);
                }}
                className="font-medium transition-colors duration-200"
                style={{ color: '#7fdbca' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#addb67'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#7fdbca'}
              >
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && !resetMode && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
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
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={fieldErrors.fullName ? inputErrorStyle : inputBaseStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = fieldErrors.fullName ? '#ff5874' : 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    aria-invalid={!!fieldErrors.fullName}
                    aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
                  />
                  {fieldErrors.fullName && (
                    <p id="fullName-error" className="mt-2 text-sm" style={{ color: '#ff5874' }} role="alert">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
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
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                  style={fieldErrors.email ? inputErrorStyle : inputBaseStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7fdbca';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = fieldErrors.email ? '#ff5874' : 'rgba(127, 219, 202, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                {fieldErrors.email && (
                  <p id="email-error" className="mt-2 text-sm" style={{ color: '#ff5874' }} role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {!resetMode && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
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
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={fieldErrors.password ? inputErrorStyle : inputBaseStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = fieldErrors.password ? '#ff5874' : 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  />
                  {fieldErrors.password && (
                    <p id="password-error" className="mt-2 text-sm" style={{ color: '#ff5874' }} role="alert">
                      {fieldErrors.password}
                    </p>
                  )}
                  {isSignUp && !fieldErrors.password && (
                    <p className="mt-2 text-xs" style={{ color: '#5f7e97' }}>
                      Must be at least 6 characters
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div 
                  className="text-sm px-4 py-3 rounded-xl"
                  style={{ 
                    background: 'rgba(255, 88, 116, 0.1)',
                    border: '1px solid rgba(255, 88, 116, 0.3)',
                    color: '#ff5874'
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                  color: '#011627',
                  boxShadow: '0 4px 20px rgba(127, 219, 202, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(127, 219, 202, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(127, 219, 202, 0.3)';
                }}
              >
                {loading ? 'Processing...' : resetMode ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>

              {!resetMode && (
                <button
                  type="button"
                  onClick={toggleResetMode}
                  className="w-full text-sm transition-colors duration-200"
                  style={{ color: '#5f7e97' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#7fdbca'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#5f7e97'}
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
                className="text-sm transition-colors duration-200"
                style={{ color: '#5f7e97' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#7fdbca'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#5f7e97'}
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
