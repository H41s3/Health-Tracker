import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Settings as SettingsIcon, Bell, Shield, Palette, HelpCircle } from 'lucide-react';
import { Profile, Gender } from '../types/database';

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
    } catch (error: any) {
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
    } catch (error: any) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card p-12 text-center"
        >
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-4"></div>
            <div className="h-4 w-32 bg-slate-200 rounded mx-auto"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container space-section">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-header"
      >
        <h1 className="page-title">Settings & Profile</h1>
        <p className="page-subtitle">Manage your profile and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="card p-8">
            <div className="flex items-center gap-6 mb-8">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <User className="w-10 h-10 text-emerald-600" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-1">
                  {formData.full_name || 'User'}
                </h2>
                <p className="text-slate-500">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    className="input-field"
                    placeholder="170"
                  />
                </div>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium ${
                    message.includes('Error')
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {message}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={saving}
                className="w-full btn-primary"
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
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Notifications</span>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Privacy</span>
                </div>
                <div className="w-12 h-6 bg-slate-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                </div>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">About</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Health Tracker</span> helps you monitor your daily health metrics,
                track menstrual cycles, create custom trackers, journal your health journey, and set reminders.
              </p>
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500">Version 1.0.0</p>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Help & Support</h3>
            <div className="space-y-3">
              <motion.button 
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 rounded-xl transition-colors"
                whileHover={{ x: 4 }}
              >
                <HelpCircle className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Help Center</span>
              </motion.button>
              
              <motion.button 
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 rounded-xl transition-colors"
                whileHover={{ x: 4 }}
              >
                <SettingsIcon className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Advanced Settings</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
