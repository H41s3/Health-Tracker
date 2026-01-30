import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Copy, Check, AlertTriangle, X, Smartphone, Key, Download } from 'lucide-react';
import { useTwoFactorStore } from '../../stores/useTwoFactorStore';
import { formatSecretForDisplay } from '../../utils/totp';

interface TwoFactorSetupProps {
  userId: string;
  userEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

type SetupStep = 'intro' | 'qr' | 'verify' | 'backup' | 'complete';

export default function TwoFactorSetup({ userId, userEmail, onClose, onSuccess }: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>('intro');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [backupCopied, setBackupCopied] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  
  const { setupData, loading, error, initializeSetup, completeSetup, clearSetup } = useTwoFactorStore();

  useEffect(() => {
    return () => clearSetup();
  }, [clearSetup]);

  const handleStartSetup = async () => {
    const data = await initializeSetup(userEmail);
    if (data) {
      setStep('qr');
    }
  };

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyBackupCodes = () => {
    if (setupData?.backupCodes) {
      const codesText = setupData.backupCodes.join('\n');
      navigator.clipboard.writeText(codesText);
      setBackupCopied(true);
      setTimeout(() => setBackupCopied(false), 2000);
    }
  };

  const handleDownloadBackupCodes = () => {
    if (setupData?.backupCodes) {
      const content = `Health Tracker - Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleDateString()}
Account: ${userEmail}

IMPORTANT: Keep these codes safe! Each code can only be used once.

${setupData.backupCodes.join('\n')}

If you lose access to your authenticator app, use one of these codes to sign in.
`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'health-tracker-backup-codes.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleVerify = async () => {
    setVerifyError('');
    const success = await completeSetup(userId, verificationCode, userEmail);
    if (success) {
      setStep('backup');
    } else {
      setVerifyError('Invalid code. Please try again.');
    }
  };

  const handleComplete = () => {
    setStep('complete');
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1500);
  };

  const inputStyle = {
    background: 'rgba(11, 41, 66, 0.8)',
    border: '1px solid rgba(127, 219, 202, 0.2)',
    color: '#d6deeb',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(1, 22, 39, 0.9)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(29, 59, 83, 0.95)',
            border: '1px solid rgba(127, 219, 202, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="p-6 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(127, 219, 202, 0.1)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(127, 219, 202, 0.15)' }}
              >
                <Shield className="w-5 h-5" style={{ color: '#7fdbca' }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: '#d6deeb' }}>
                  Two-Factor Authentication
                </h2>
                <p className="text-sm" style={{ color: '#5f7e97' }}>
                  {step === 'intro' && 'Set up extra security'}
                  {step === 'qr' && 'Scan QR code'}
                  {step === 'verify' && 'Verify setup'}
                  {step === 'backup' && 'Save backup codes'}
                  {step === 'complete' && 'Setup complete'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: '#5f7e97' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(127, 219, 202, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step: Intro */}
            {step === 'intro' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div 
                  className="p-4 rounded-xl text-center"
                  style={{ background: 'rgba(127, 219, 202, 0.1)' }}
                >
                  <Smartphone className="w-12 h-12 mx-auto mb-3" style={{ color: '#7fdbca' }} />
                  <h3 className="font-semibold mb-2" style={{ color: '#d6deeb' }}>
                    Protect Your Account
                  </h3>
                  <p className="text-sm" style={{ color: '#5f7e97' }}>
                    Two-factor authentication adds an extra layer of security. You'll need your phone to sign in.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(130, 170, 255, 0.15)' }}
                    >
                      <span className="text-sm font-bold" style={{ color: '#82aaff' }}>1</span>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#d6deeb' }}>Install an authenticator app</p>
                      <p className="text-sm" style={{ color: '#5f7e97' }}>
                        Google Authenticator, Authy, or 1Password
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(130, 170, 255, 0.15)' }}
                    >
                      <span className="text-sm font-bold" style={{ color: '#82aaff' }}>2</span>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#d6deeb' }}>Scan the QR code</p>
                      <p className="text-sm" style={{ color: '#5f7e97' }}>
                        Link your app with Health Tracker
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(130, 170, 255, 0.15)' }}
                    >
                      <span className="text-sm font-bold" style={{ color: '#82aaff' }}>3</span>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#d6deeb' }}>Save your backup codes</p>
                      <p className="text-sm" style={{ color: '#5f7e97' }}>
                        For account recovery if you lose your phone
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={handleStartSetup}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                    color: '#011627',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Setting up...' : 'Get Started'}
                </motion.button>
              </motion.div>
            )}

            {/* Step: QR Code */}
            {step === 'qr' && setupData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div 
                    className="inline-block p-4 rounded-xl mb-4"
                    style={{ background: 'white' }}
                  >
                    <img src={setupData.qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm" style={{ color: '#5f7e97' }}>
                    Scan this QR code with your authenticator app
                  </p>
                </div>

                <div 
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(11, 41, 66, 0.5)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium" style={{ color: '#5f7e97' }}>
                      Or enter this code manually:
                    </span>
                    <button
                      onClick={handleCopySecret}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
                      style={{ color: '#7fdbca' }}
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <code 
                    className="block text-center font-mono text-sm tracking-wider"
                    style={{ color: '#d6deeb' }}
                  >
                    {formatSecretForDisplay(setupData.secret)}
                  </code>
                </div>

                <motion.button
                  onClick={() => setStep('verify')}
                  className="w-full py-3 rounded-xl font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                    color: '#011627',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                </motion.button>
              </motion.div>
            )}

            {/* Step: Verify */}
            {step === 'verify' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Key className="w-12 h-12 mx-auto mb-3" style={{ color: '#82aaff' }} />
                  <h3 className="font-semibold mb-2" style={{ color: '#d6deeb' }}>
                    Enter Verification Code
                  </h3>
                  <p className="text-sm" style={{ color: '#5f7e97' }}>
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerificationCode(value);
                      setVerifyError('');
                    }}
                    className="w-full px-4 py-4 rounded-xl text-center text-2xl font-mono tracking-[0.5em] outline-none transition-all"
                    style={inputStyle}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  {(verifyError || error) && (
                    <p className="mt-2 text-sm text-center" style={{ color: '#ff5874' }}>
                      {verifyError || error}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('qr')}
                    className="flex-1 py-3 rounded-xl font-medium transition-colors"
                    style={{
                      background: 'rgba(95, 126, 151, 0.2)',
                      color: '#d6deeb',
                    }}
                  >
                    Back
                  </button>
                  <motion.button
                    onClick={handleVerify}
                    disabled={verificationCode.length !== 6 || loading}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                      color: '#011627',
                    }}
                    whileHover={{ scale: verificationCode.length === 6 ? 1.02 : 1 }}
                    whileTap={{ scale: verificationCode.length === 6 ? 0.98 : 1 }}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step: Backup Codes */}
            {step === 'backup' && setupData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div 
                  className="p-4 rounded-xl flex items-start gap-3"
                  style={{ 
                    background: 'rgba(255, 203, 107, 0.1)',
                    border: '1px solid rgba(255, 203, 107, 0.3)'
                  }}
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ffcb6b' }} />
                  <div className="text-sm" style={{ color: '#ffcb6b' }}>
                    <strong>Save these codes!</strong>
                    <p className="mt-1 opacity-80">
                      If you lose your phone, you'll need these codes to access your account.
                    </p>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(11, 41, 66, 0.5)' }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {setupData.backupCodes.map((code, index) => (
                      <code 
                        key={index}
                        className="block text-center py-2 px-3 rounded-lg font-mono text-sm"
                        style={{ 
                          background: 'rgba(127, 219, 202, 0.1)',
                          color: '#d6deeb'
                        }}
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopyBackupCodes}
                    className="flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(95, 126, 151, 0.2)',
                      color: '#d6deeb',
                    }}
                  >
                    {backupCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {backupCopied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownloadBackupCodes}
                    className="flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(95, 126, 151, 0.2)',
                      color: '#d6deeb',
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>

                <motion.button
                  onClick={handleComplete}
                  className="w-full py-3 rounded-xl font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                    color: '#011627',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  I've Saved My Codes
                </motion.button>
              </motion.div>
            )}

            {/* Step: Complete */}
            {step === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(173, 219, 103, 0.15)' }}
                >
                  <Check className="w-10 h-10" style={{ color: '#addb67' }} />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#d6deeb' }}>
                  All Set!
                </h3>
                <p style={{ color: '#5f7e97' }}>
                  Two-factor authentication is now enabled.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
