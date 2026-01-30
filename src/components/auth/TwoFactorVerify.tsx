import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, ArrowLeft } from 'lucide-react';
import { useTwoFactorStore } from '../../stores/useTwoFactorStore';

interface TwoFactorVerifyProps {
  userId: string;
  userEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TwoFactorVerify({ userId, userEmail, onSuccess, onCancel }: TwoFactorVerifyProps) {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { verifyToken, verifyWithBackupCode, isVerifying, error } = useTwoFactorStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    let success: boolean;
    
    if (useBackupCode) {
      success = await verifyWithBackupCode(userId, code);
    } else {
      success = await verifyToken(userId, code, userEmail);
    }

    if (success) {
      onSuccess();
    } else {
      setLocalError(useBackupCode ? 'Invalid backup code' : 'Invalid verification code');
    }
  };

  const inputStyle = {
    background: 'rgba(11, 41, 66, 0.8)',
    border: '1px solid rgba(127, 219, 202, 0.2)',
    color: '#d6deeb',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(127, 219, 202, 0.15)' }}
        >
          {useBackupCode ? (
            <Key className="w-8 h-8" style={{ color: '#82aaff' }} />
          ) : (
            <Shield className="w-8 h-8" style={{ color: '#7fdbca' }} />
          )}
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#d6deeb' }}>
          {useBackupCode ? 'Enter Backup Code' : 'Two-Factor Authentication'}
        </h2>
        <p className="text-sm" style={{ color: '#5f7e97' }}>
          {useBackupCode 
            ? 'Enter one of your backup codes to sign in'
            : 'Enter the 6-digit code from your authenticator app'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          {useBackupCode ? (
            <input
              type="text"
              value={code}
              onChange={(e) => {
                // Format: XXXX-XXXX
                let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (value.length > 4) {
                  value = value.slice(0, 4) + '-' + value.slice(4, 8);
                }
                setCode(value);
                setLocalError('');
              }}
              className="w-full px-4 py-4 rounded-xl text-center text-xl font-mono tracking-wider outline-none transition-all"
              style={inputStyle}
              placeholder="XXXX-XXXX"
              maxLength={9}
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
          ) : (
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setLocalError('');
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
          )}
          {(localError || error) && (
            <p className="mt-2 text-sm text-center" style={{ color: '#ff5874' }}>
              {localError || error}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isVerifying || (useBackupCode ? code.length < 9 : code.length < 6)}
          className="w-full font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ 
            background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
            color: '#011627',
            boxShadow: '0 4px 20px rgba(127, 219, 202, 0.3)'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isVerifying ? (
            <>
              <div 
                className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#011627', borderTopColor: 'transparent' }}
              />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </motion.button>
      </form>

      {/* Toggle between code types */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setUseBackupCode(!useBackupCode);
            setCode('');
            setLocalError('');
          }}
          className="text-sm transition-colors"
          style={{ color: '#5f7e97' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#7fdbca'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#5f7e97'}
        >
          {useBackupCode ? 'Use authenticator app instead' : 'Use a backup code'}
        </button>
      </div>

      {/* Back to login */}
      <button
        type="button"
        onClick={onCancel}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm transition-colors"
        style={{ color: '#5f7e97' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#7fdbca'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#5f7e97'}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </button>
    </motion.div>
  );
}
