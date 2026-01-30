import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BaymaxLogo from '../components/BaymaxLogo';
import EmailConfirmation from './EmailConfirmation';
import TwoFactorVerify from '../components/auth/TwoFactorVerify';
import { signUpSchema, signInSchema, resetPasswordSchema, validateForm, getPasswordStrength } from '../utils/validation';
import { getErrorMessage } from '../utils/errorHandler';
import { Eye, EyeOff, Shield, CheckCircle, AlertCircle, Mail } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const { signIn, signUp, resetPassword, twoFactorPending, complete2FASignIn, cancel2FASignIn } = useAuth();

  // Calculate password strength for sign-up
  const passwordStrength = useMemo(() => {
    if (!isSignUp) return null;
    return getPasswordStrength(password);
  }, [password, isSignUp]);

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
        const validation = validateForm(signUpSchema, { email, password, confirmPassword, fullName });
        
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

        const result = await signIn(email, password);
        if (result.error) {
          setError(getErrorMessage(result.error));
        }
        // If requires2FA is true, the twoFactorPending state will be set by AuthContext
        // and we'll show the 2FA verification screen
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
    setPassword('');
    setConfirmPassword('');
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

  // Show 2FA verification screen if needed
  if (twoFactorPending) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4 py-8"
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

          {/* 2FA Card */}
          <div 
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(127, 219, 202, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          >
            <TwoFactorVerify
              userId={twoFactorPending.id}
              userEmail={twoFactorPending.email}
              onSuccess={complete2FASignIn}
              onCancel={() => {
                cancel2FASignIn();
                setPassword('');
              }}
            />
          </div>

          {/* Security footer */}
          <div className="mt-6 text-center text-xs" style={{ color: '#5f7e97' }}>
            <div className="flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Your data is encrypted and secure
            </div>
          </div>
        </div>
      </div>
    );
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
      className="min-h-screen flex items-center justify-center px-4 py-8"
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
          {/* Header with security badge */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold" style={{ color: '#d6deeb' }}>
              {resetMode ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            {isSignUp && (
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                style={{ background: 'rgba(127, 219, 202, 0.1)', color: '#7fdbca' }}
              >
                <Shield className="w-3 h-3" />
                Secure
              </div>
            )}
          </div>

          {resetSuccess ? (
            <div className="text-center py-6">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(127, 219, 202, 0.15)' }}
              >
                <Mail className="w-8 h-8" style={{ color: '#7fdbca' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#d6deeb' }}>Check Your Email</h3>
              <p className="mb-4" style={{ color: '#5f7e97' }}>
                We've sent a password reset link to <strong style={{ color: '#7fdbca' }}>{email}</strong>
              </p>
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
              {/* Info banner for sign-up */}
              {isSignUp && !resetMode && (
                <div 
                  className="flex items-start gap-3 p-4 rounded-xl text-sm"
                  style={{ 
                    background: 'rgba(130, 170, 255, 0.1)',
                    border: '1px solid rgba(130, 170, 255, 0.2)'
                  }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#82aaff' }} />
                  <div style={{ color: '#82aaff' }}>
                    <strong>Email verification required</strong>
                    <p className="mt-1 opacity-80">
                      You'll receive a confirmation email to verify your account before signing in.
                    </p>
                  </div>
                </div>
              )}

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
                    placeholder="Enter your full name"
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
                  Email Address
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
                  placeholder="you@example.com"
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
                <>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                        }}
                        className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all duration-200"
                        style={fieldErrors.password ? inputErrorStyle : inputBaseStyle}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#7fdbca';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = fieldErrors.password ? '#ff5874' : 'rgba(127, 219, 202, 0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                        aria-invalid={!!fieldErrors.password}
                        aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                        style={{ color: '#5f7e97' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#7fdbca'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#5f7e97'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p id="password-error" className="mt-2 text-sm" style={{ color: '#ff5874' }} role="alert">
                        {fieldErrors.password}
                      </p>
                    )}

                    {/* Password strength indicator for sign-up */}
                    {isSignUp && password && passwordStrength && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 flex gap-1">
                            {[0, 1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                style={{
                                  background: i < passwordStrength.score 
                                    ? passwordStrength.color 
                                    : 'rgba(95, 126, 151, 0.3)'
                                }}
                              />
                            ))}
                          </div>
                          <span 
                            className="text-xs font-medium capitalize"
                            style={{ color: passwordStrength.color }}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <ul className="text-xs space-y-1" style={{ color: '#5f7e97' }}>
                            {passwordStrength.feedback.map((tip, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <span style={{ color: '#ffcb6b' }}>•</span> {tip}
                              </li>
                            ))}
                          </ul>
                        )}
                        {passwordStrength.score >= 3 && (
                          <div className="flex items-center gap-1 text-xs" style={{ color: '#addb67' }}>
                            <CheckCircle className="w-3 h-3" />
                            Password meets requirements
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password for sign-up */}
                  {isSignUp && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPass ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                          }}
                          className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all duration-200"
                          style={fieldErrors.confirmPassword ? inputErrorStyle : inputBaseStyle}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#7fdbca';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = fieldErrors.confirmPassword ? '#ff5874' : 'rgba(127, 219, 202, 0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          placeholder="Re-enter your password"
                          aria-invalid={!!fieldErrors.confirmPassword}
                          aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                          style={{ color: '#5f7e97' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#7fdbca'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#5f7e97'}
                          aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p id="confirmPassword-error" className="mt-2 text-sm" style={{ color: '#ff5874' }} role="alert">
                          {fieldErrors.confirmPassword}
                        </p>
                      )}
                      {confirmPassword && password === confirmPassword && !fieldErrors.confirmPassword && (
                        <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: '#addb67' }}>
                          <CheckCircle className="w-3 h-3" />
                          Passwords match
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {error && (
                <div 
                  className="flex items-start gap-3 text-sm px-4 py-3 rounded-xl"
                  style={{ 
                    background: 'rgba(255, 88, 116, 0.1)',
                    border: '1px solid rgba(255, 88, 116, 0.3)',
                    color: '#ff5874'
                  }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (isSignUp && !!passwordStrength && passwordStrength.score < 2)}
                className="w-full font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                {loading ? (
                  <>
                    <div 
                      className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: '#011627', borderTopColor: 'transparent' }}
                    />
                    Processing...
                  </>
                ) : (
                  resetMode ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>

              {!resetMode && !isSignUp && (
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

        {/* Security footer */}
        <div className="mt-6 text-center text-xs" style={{ color: '#5f7e97' }}>
          <div className="flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Your data is encrypted and secure
          </div>
        </div>
      </div>
    </div>
  );
}
