import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Settings as SettingsIcon, Bell, Shield, HelpCircle, Cog } from 'lucide-react';
import { Profile, Gender } from '../types/database';
import PageWrapper from '../components/Layout/PageWrapper';
import PageHeader from '../components/Layout/PageHeader';

export default function Settings() {
  const { user } = useAuth();
  const [, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '' as Gender | '',
    height_cm: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          date_of_birth: data.date_of_birth || '',
          gender: (data.gender as Gender) || '',
          height_cm: data.height_cm?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name || null,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        });

      if (error) throw error;

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile: ' + (error instanceof Error ? error.message : 'An error occurred'));
    } finally {
      setSaving(false);
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
                disabled={saving}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                style={{ 
                  background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                  color: '#011627'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </form>
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
    </PageWrapper>
  );
}
