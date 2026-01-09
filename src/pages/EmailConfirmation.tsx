import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, CheckCircle, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import BaymaxLogo from '../components/BaymaxLogo';

export default function EmailConfirmation() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const userEmail = user?.email || localStorage.getItem('pendingEmail') || '';
    setEmail(userEmail);

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
    localStorage.removeItem('pendingEmail');
    window.location.reload();
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
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#d6deeb' }}>Check Your Email</h1>
          <p style={{ color: '#5f7e97' }}>We've sent you a confirmation link</p>
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
          <div className="text-center mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(127, 219, 202, 0.15)' }}
            >
              <Mail className="w-8 h-8" style={{ color: '#7fdbca' }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#d6deeb' }}>
              Almost there!
            </h2>
            <p className="mb-4" style={{ color: '#5f7e97' }}>
              We've sent a confirmation link to:
            </p>
            <p 
              className="font-medium px-4 py-2 rounded-lg"
              style={{ 
                background: 'rgba(11, 41, 66, 0.8)',
                color: '#7fdbca'
              }}
            >
              {email}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {[
              { title: 'Check your inbox', desc: 'Look for an email from Health Tracker' },
              { title: 'Click the confirmation link', desc: 'This will activate your account' },
              { title: 'Start tracking your health', desc: 'Access your personalized dashboard' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#7fdbca' }} />
                <div>
                  <p className="font-medium" style={{ color: '#d6deeb' }}>{step.title}</p>
                  <p className="text-sm" style={{ color: '#5f7e97' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div 
            className="rounded-xl p-4 mb-6"
            style={{ 
              background: 'rgba(130, 170, 255, 0.1)',
              border: '1px solid rgba(130, 170, 255, 0.2)'
            }}
          >
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#82aaff' }} />
              <div>
                <p className="font-medium" style={{ color: '#82aaff' }}>Didn't receive the email?</p>
                <p className="text-sm" style={{ color: '#5f7e97' }}>
                  Check your spam folder or wait a few minutes. Sometimes emails can be delayed.
                </p>
              </div>
            </div>
          </div>

          {resendSuccess && (
            <div 
              className="rounded-xl p-3 mb-4 flex items-start gap-2"
              style={{ 
                background: 'rgba(173, 219, 103, 0.1)',
                border: '1px solid rgba(173, 219, 103, 0.3)'
              }}
            >
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#addb67' }} />
              <p className="text-sm" style={{ color: '#addb67' }}>
                Confirmation email sent successfully! Please check your inbox.
              </p>
            </div>
          )}

          {resendError && (
            <div 
              className="rounded-xl p-3 mb-4 flex items-start gap-2"
              style={{ 
                background: 'rgba(255, 88, 116, 0.1)',
                border: '1px solid rgba(255, 88, 116, 0.3)'
              }}
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#ff5874' }} />
              <p className="text-sm" style={{ color: '#ff5874' }}>{resendError}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={countdown > 0}
              className="w-full font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: countdown > 0 ? 'rgba(95, 126, 151, 0.3)' : 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                color: countdown > 0 ? '#5f7e97' : '#011627',
                boxShadow: countdown > 0 ? 'none' : '0 4px 20px rgba(127, 219, 202, 0.3)'
              }}
            >
              {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend confirmation email'}
            </button>

            <button
              onClick={handleBackToLogin}
              className="w-full flex items-center justify-center gap-2 py-2 transition-colors duration-200"
              style={{ color: '#5f7e97' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#7fdbca'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#5f7e97'}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#5f7e97' }}>
              Having trouble? Contact support at{' '}
              <a 
                href="mailto:support@healthtracker.com" 
                className="transition-colors duration-200"
                style={{ color: '#7fdbca' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#addb67'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#7fdbca'}
              >
                support@healthtracker.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
