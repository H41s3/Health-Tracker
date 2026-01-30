import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings as SettingsIcon, Bell, Shield, HelpCircle, Cog, Target, Footprints, Droplet, Moon, Smartphone, ShieldCheck, ShieldOff, AlertTriangle } from 'lucide-react';
import { Gender, DEFAULT_GOALS } from '../types/database';
import { useGoalsStore } from '../stores/useGoalsStore';
import { useProfileStore } from '../stores/useProfileStore';
import { useTwoFactorStore } from '../stores/useTwoFactorStore';
import PageWrapper from '../components/Layout/PageWrapper';
import PageHeader from '../components/Layout/PageHeader';
import TwoFactorSetup from '../components/auth/TwoFactorSetup';

export default function Settings() {
  const { user } = useAuth();
  const { goals, fetchGoals, updateGoals, saving: savingGoals } = useGoalsStore();
  const { profile, fetchProfile, updateProfile, saving: savingProfile, loading: loadingProfile } = useProfileStore();
  const { isEnabled: is2FAEnabled, checkTwoFactorStatus, disableTwoFactor, loading: twoFactorLoading } = useTwoFactorStore();
  const [message, setMessage] = useState('');
  const [goalsMessage, setGoalsMessage] = useState('');
  const [twoFactorMessage, setTwoFactorMessage] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '' as Gender | '',
    height_cm: '',
  });
  const [goalsData, setGoalsData] = useState({
    steps: DEFAULT_GOALS.steps.toString(),
    water_ml: DEFAULT_GOALS.water_ml.toString(),
    sleep_hours: DEFAULT_GOALS.sleep_hours.toString(),
  });

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
      fetchGoals(user.id);
      checkTwoFactorStatus(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Sync form data when profile is fetched
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        date_of_birth: profile.date_of_birth || '',
        gender: (profile.gender as Gender) || '',
        height_cm: profile.height_cm?.toString() || '',
      });
    }
  }, [profile]);

  // Sync goals data when goals are fetched
  useEffect(() => {
    setGoalsData({
      steps: goals.steps.toString(),
      water_ml: goals.water_ml.toString(),
      sleep_hours: goals.sleep_hours.toString(),
    });
  }, [goals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage('Error: Not logged in. Please refresh and try again.');
      return;
    }

    setMessage('');

    const profileData = {
      full_name: formData.full_name || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
    };

    console.log('Saving profile for user:', user.id);
    console.log('Profile data:', profileData);

    const success = await updateProfile(user.id, profileData);

    if (success) {
      console.log('Profile saved successfully!');
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      console.error('Profile save failed - check useProfileStore error');
      setMessage('Error updating profile. Check console for details.');
    }
  };

  const loading = loadingProfile;

  const handleDisable2FA = async () => {
    if (!user || !disableCode) return;
    
    const success = await disableTwoFactor(user.id, disableCode, user.email || '');
    if (success) {
      setTwoFactorMessage('Two-factor authentication has been disabled.');
      setShowDisable2FA(false);
      setDisableCode('');
      setTimeout(() => setTwoFactorMessage(''), 3000);
    } else {
      setTwoFactorMessage('Invalid verification code. Please try again.');
    }
  };

  const inputStyle = {
    background: 'rgba(11, 41, 66, 0.8)',
    border: '1px solid rgba(127, 219, 202, 0.2)',
    color: '#d6deeb',
  };

  if (loading) {
    return (
      <div className="page-container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="p-12 text-center rounded-xl"
          style={{
            background: 'rgba(29, 59, 83, 0.6)',
            border: '1px solid rgba(127, 219, 202, 0.1)'
          }}
        >
          <div className="animate-pulse">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4" style={{ background: 'rgba(95, 126, 151, 0.3)' }} />
            <div className="h-4 w-32 rounded mx-auto" style={{ background: 'rgba(95, 126, 151, 0.3)' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <PageWrapper theme="settings">
      <div className="page-container space-section">
        <PageHeader
          title="Settings & Profile"
          subtitle="Manage your profile and preferences"
          theme="settings"
          icon={<Cog className="w-12 h-12" style={{ color: '#5f7e97' }} />}
        />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div 
            className="p-8 rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <div className="flex items-center gap-6 mb-8">
              <motion.div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(127, 219, 202, 0.15)' }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <User className="w-10 h-10" style={{ color: '#7fdbca' }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-semibold mb-1" style={{ color: '#d6deeb' }}>
                  {formData.full_name || 'User'}
                </h2>
                <p style={{ color: '#5f7e97' }}>{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    placeholder="Enter your full name"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    placeholder="170"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={message.includes('Error') ? {
                    background: 'rgba(255, 88, 116, 0.1)',
                    border: '1px solid rgba(255, 88, 116, 0.3)',
                    color: '#ff5874'
                  } : {
                    background: 'rgba(173, 219, 103, 0.1)',
                    border: '1px solid rgba(173, 219, 103, 0.3)',
                    color: '#addb67'
                  }}
                >
                  {message}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                style={{ 
                  background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                  color: '#011627'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </form>
          </div>

          {/* Health Goals Section */}
          <div 
            className="p-8 rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(173, 219, 103, 0.15)' }}
              >
                <Target className="w-6 h-6" style={{ color: '#addb67' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: '#d6deeb' }}>
                  Daily Health Goals
                </h2>
                <p className="text-sm" style={{ color: '#5f7e97' }}>
                  Customize your personal health targets
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Steps Goal */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
                  <Footprints className="w-4 h-4" style={{ color: '#7fdbca' }} />
                  Daily Steps Goal
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={goalsData.steps}
                    onChange={(e) => setGoalsData({ ...goalsData, steps: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    placeholder="10000"
                    min="1000"
                    max="50000"
                    step="500"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7fdbca';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: '#5f7e97' }}>steps</span>
                </div>
              </div>

              {/* Water Goal */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
                  <Droplet className="w-4 h-4" style={{ color: '#82aaff' }} />
                  Daily Water Goal
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={goalsData.water_ml}
                    onChange={(e) => setGoalsData({ ...goalsData, water_ml: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    placeholder="2000"
                    min="500"
                    max="5000"
                    step="100"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#82aaff';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(130, 170, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: '#5f7e97' }}>ml</span>
                </div>
              </div>

              {/* Sleep Goal */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>
                  <Moon className="w-4 h-4" style={{ color: '#c792ea' }} />
                  Daily Sleep Goal
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={goalsData.sleep_hours}
                    onChange={(e) => setGoalsData({ ...goalsData, sleep_hours: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    placeholder="8"
                    min="4"
                    max="12"
                    step="0.5"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#c792ea';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(199, 146, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: '#5f7e97' }}>hours</span>
                </div>
              </div>

              {goalsMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={goalsMessage.includes('Error') ? {
                    background: 'rgba(255, 88, 116, 0.1)',
                    border: '1px solid rgba(255, 88, 116, 0.3)',
                    color: '#ff5874'
                  } : {
                    background: 'rgba(173, 219, 103, 0.1)',
                    border: '1px solid rgba(173, 219, 103, 0.3)',
                    color: '#addb67'
                  }}
                >
                  {goalsMessage}
                </motion.div>
              )}

              <motion.button
                type="button"
                disabled={savingGoals}
                onClick={async () => {
                  if (!user) return;
                  try {
                    await updateGoals(user.id, {
                      steps: parseInt(goalsData.steps) || DEFAULT_GOALS.steps,
                      water_ml: parseInt(goalsData.water_ml) || DEFAULT_GOALS.water_ml,
                      sleep_hours: parseFloat(goalsData.sleep_hours) || DEFAULT_GOALS.sleep_hours,
                    });
                    setGoalsMessage('Goals updated successfully!');
                    setTimeout(() => setGoalsMessage(''), 3000);
                  } catch {
                    setGoalsMessage('Error updating goals');
                  }
                }}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                style={{ 
                  background: 'linear-gradient(135deg, #addb67 0%, #7fdbca 100%)',
                  color: '#011627'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {savingGoals ? 'Saving...' : 'Save Goals'}
              </motion.button>
            </div>
          </div>

          {/* Security Section - Two-Factor Authentication */}
          <div 
            className="p-8 rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(130, 170, 255, 0.15)' }}
              >
                <Shield className="w-6 h-6" style={{ color: '#82aaff' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: '#d6deeb' }}>
                  Account Security
                </h2>
                <p className="text-sm" style={{ color: '#5f7e97' }}>
                  Protect your account with two-factor authentication
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* 2FA Status */}
              <div 
                className="p-4 rounded-xl flex items-center justify-between"
                style={{ background: 'rgba(11, 41, 66, 0.5)' }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ 
                      background: is2FAEnabled 
                        ? 'rgba(173, 219, 103, 0.15)' 
                        : 'rgba(95, 126, 151, 0.15)' 
                    }}
                  >
                    {is2FAEnabled ? (
                      <ShieldCheck className="w-5 h-5" style={{ color: '#addb67' }} />
                    ) : (
                      <Smartphone className="w-5 h-5" style={{ color: '#5f7e97' }} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: '#d6deeb' }}>
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm" style={{ color: '#5f7e97' }}>
                      {is2FAEnabled 
                        ? 'Your account is protected with 2FA' 
                        : 'Add an extra layer of security to your account'
                      }
                    </p>
                  </div>
                </div>
                <div 
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    is2FAEnabled ? '' : ''
                  }`}
                  style={{
                    background: is2FAEnabled 
                      ? 'rgba(173, 219, 103, 0.15)' 
                      : 'rgba(95, 126, 151, 0.15)',
                    color: is2FAEnabled ? '#addb67' : '#5f7e97'
                  }}
                >
                  {is2FAEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>

              {/* Disable 2FA Form */}
              {showDisable2FA && is2FAEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl"
                  style={{ 
                    background: 'rgba(255, 88, 116, 0.05)',
                    border: '1px solid rgba(255, 88, 116, 0.2)'
                  }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ff5874' }} />
                    <div>
                      <p className="font-medium" style={{ color: '#ff5874' }}>
                        Disable Two-Factor Authentication?
                      </p>
                      <p className="text-sm mt-1" style={{ color: '#5f7e97' }}>
                        This will make your account less secure. Enter your verification code to confirm.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={disableCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setDisableCode(value);
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="flex-1 px-4 py-2 rounded-xl text-center font-mono tracking-wider outline-none"
                      style={inputStyle}
                    />
                    <button
                      onClick={handleDisable2FA}
                      disabled={disableCode.length !== 6 || twoFactorLoading}
                      className="px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
                      style={{ 
                        background: 'rgba(255, 88, 116, 0.2)',
                        color: '#ff5874'
                      }}
                    >
                      Disable
                    </button>
                    <button
                      onClick={() => {
                        setShowDisable2FA(false);
                        setDisableCode('');
                      }}
                      className="px-4 py-2 rounded-xl font-medium transition-colors"
                      style={{ 
                        background: 'rgba(95, 126, 151, 0.2)',
                        color: '#d6deeb'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {twoFactorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={twoFactorMessage.includes('disabled') ? {
                    background: 'rgba(173, 219, 103, 0.1)',
                    border: '1px solid rgba(173, 219, 103, 0.3)',
                    color: '#addb67'
                  } : {
                    background: 'rgba(255, 88, 116, 0.1)',
                    border: '1px solid rgba(255, 88, 116, 0.3)',
                    color: '#ff5874'
                  }}
                >
                  {twoFactorMessage}
                </motion.div>
              )}

              {is2FAEnabled ? (
                <motion.button
                  type="button"
                  onClick={() => setShowDisable2FA(!showDisable2FA)}
                  className="w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  style={{ 
                    background: 'rgba(95, 126, 151, 0.2)',
                    color: '#d6deeb'
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <ShieldOff className="w-4 h-4" />
                  Disable Two-Factor Authentication
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={() => setShowTwoFactorSetup(true)}
                  className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ 
                    background: 'linear-gradient(135deg, #82aaff 0%, #c792ea 100%)',
                    color: '#011627'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Shield className="w-4 h-4" />
                  Enable Two-Factor Authentication
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Settings Menu */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Quick Settings */}
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#d6deeb' }}>Quick Settings</h3>
            <div className="space-y-4">
              <div 
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(11, 41, 66, 0.5)' }}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" style={{ color: '#5f7e97' }} />
                  <span className="text-sm font-medium" style={{ color: '#d6deeb' }}>Notifications</span>
                </div>
                <div 
                  className="w-12 h-6 rounded-full relative"
                  style={{ background: '#7fdbca' }}
                >
                  <div 
                    className="w-5 h-5 rounded-full absolute right-0.5 top-0.5"
                    style={{ background: '#011627' }}
                  />
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(11, 41, 66, 0.5)' }}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" style={{ color: '#5f7e97' }} />
                  <span className="text-sm font-medium" style={{ color: '#d6deeb' }}>Privacy</span>
                </div>
                <div 
                  className="w-12 h-6 rounded-full relative"
                  style={{ background: 'rgba(95, 126, 151, 0.3)' }}
                >
                  <div 
                    className="w-5 h-5 rounded-full absolute left-0.5 top-0.5"
                    style={{ background: '#5f7e97' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#d6deeb' }}>About</h3>
            <div className="space-y-3 text-sm" style={{ color: '#5f7e97' }}>
              <p>
                <span className="font-medium" style={{ color: '#d6deeb' }}>Health Tracker</span> helps you monitor your daily health metrics,
                track menstrual cycles, create custom trackers, journal your health journey, and set reminders.
              </p>
              <div 
                className="pt-3"
                style={{ borderTop: '1px solid rgba(127, 219, 202, 0.1)' }}
              >
                <p className="text-xs" style={{ color: '#5f7e97' }}>Version 1.0.0</p>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#d6deeb' }}>Help & Support</h3>
            <div className="space-y-3">
              <motion.button 
                className="w-full flex items-center gap-3 p-3 text-left rounded-xl transition-colors"
                style={{ color: '#5f7e97' }}
                whileHover={{ x: 4, backgroundColor: 'rgba(127, 219, 202, 0.1)' }}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium" style={{ color: '#d6deeb' }}>Help Center</span>
              </motion.button>
              
              <motion.button 
                className="w-full flex items-center gap-3 p-3 text-left rounded-xl transition-colors"
                style={{ color: '#5f7e97' }}
                whileHover={{ x: 4, backgroundColor: 'rgba(127, 219, 202, 0.1)' }}
              >
                <SettingsIcon className="w-5 h-5" />
                <span className="text-sm font-medium" style={{ color: '#d6deeb' }}>Advanced Settings</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
      </div>

      {/* 2FA Setup Modal */}
      {showTwoFactorSetup && user && (
        <TwoFactorSetup
          userId={user.id}
          userEmail={user.email || ''}
          onClose={() => setShowTwoFactorSetup(false)}
          onSuccess={() => {
            checkTwoFactorStatus(user.id);
            setTwoFactorMessage('Two-factor authentication is now enabled!');
            setTimeout(() => setTwoFactorMessage(''), 3000);
          }}
        />
      )}
    </PageWrapper>
  );
}
