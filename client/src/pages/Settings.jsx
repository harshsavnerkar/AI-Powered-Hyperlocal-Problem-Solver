import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Moon, 
  Sun,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { user, token, updateUser } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [activeSection, setActiveSection] = useState(null);

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Security Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState(null);

  // Local Notification states
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserAlerts, setBrowserAlerts] = useState(false);
  const [notifMessage, setNotifMessage] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
    setProfileMessage(null);
    setSecurityMessage(null);
    setNotifMessage(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setProfileMessage({ type: 'error', text: 'Name and phone fields are required.' });
      return;
    }
    
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      updateUser({ name: data.name, phone: data.phone });
      setProfileMessage({ type: 'success', text: 'Profile settings updated successfully!' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setSecurityLoading(true);
    setSecurityMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      setSecurityMessage({ type: 'success', text: 'Password updated successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSecurityMessage({ type: 'error', text: err.message });
    } finally {
      setSecurityLoading(false);
    }
  };

  const saveNotifications = () => {
    setNotifMessage({ type: 'success', text: 'Notification preferences saved!' });
    setTimeout(() => setNotifMessage(null), 3000);
  };

  const isGoogleUser = user && user.hasPassword === false;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass rounded-2xl p-6 shadow-sm flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-lg">
          <SettingsIcon size={20} className="animate-spin-slow" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Account Settings</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">
            Configure profile info, dashboard visibility options, and preferences.
          </p>
        </div>
      </div>

      {/* Main Settings List */}
      <div className="glass rounded-3xl p-6 shadow-sm divide-y divide-gray-150 dark:divide-slate-800/60 space-y-6">
        
        {/* Profile Settings Section */}
        <div className="pt-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
              <User size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-950 dark:text-white">Profile Settings</h4>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                Update your display name, verified mobile contact, and handle.
              </p>
            </div>
            <button 
              onClick={() => toggleSection('profile')}
              className="px-3 py-1.5 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold cursor-pointer transition-all duration-200 flex items-center gap-1.5 text-gray-700 dark:text-gray-300"
            >
              {activeSection === 'profile' ? 'Hide Info' : 'Edit Profile'}
              {activeSection === 'profile' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          <AnimatePresence>
            {activeSection === 'profile' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mt-4 pl-14"
              >
                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Display Name
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Your Phone Number"
                    />
                  </div>

                  {profileMessage && (
                    <div className={`p-2.5 rounded-xl flex items-center gap-2 text-[10px] font-medium ${
                      profileMessage.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                        : 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                    }`}>
                      {profileMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {profileMessage.text}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={profileLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    {profileLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                    Save Profile
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification Preferences Section */}
        <div className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-950 dark:text-white">Notification Preferences</h4>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                Manage alerts for status transitions, volunteer requests, and duplicate reports.
              </p>
            </div>
            <button 
              onClick={() => toggleSection('notifications')}
              className="px-3 py-1.5 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold cursor-pointer transition-all duration-200 flex items-center gap-1.5 text-gray-700 dark:text-gray-300"
            >
              {activeSection === 'notifications' ? 'Close' : 'Configure'}
              {activeSection === 'notifications' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          <AnimatePresence>
            {activeSection === 'notifications' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mt-4 pl-14"
              >
                <div className="space-y-4 max-w-md">
                  {/* SMS Toggles */}
                  <div className="flex items-center justify-between p-1.5">
                    <div>
                      <span className="block text-xs font-bold text-gray-900 dark:text-white">SMS Updates</span>
                      <span className="block text-[9px] text-gray-400">Receive SMS notifications on emergency cases</span>
                    </div>
                    <button
                      onClick={() => setSmsAlerts(!smsAlerts)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                        smsAlerts ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                          smsAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Email digests */}
                  <div className="flex items-center justify-between p-1.5">
                    <div>
                      <span className="block text-xs font-bold text-gray-900 dark:text-white">Email Digest</span>
                      <span className="block text-[9px] text-gray-400">Weekly activity digests and leaderboards</span>
                    </div>
                    <button
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                        emailAlerts ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                          emailAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Browser Popups */}
                  <div className="flex items-center justify-between p-1.5">
                    <div>
                      <span className="block text-xs font-bold text-gray-900 dark:text-white">Realtime Broadcasts</span>
                      <span className="block text-[9px] text-gray-400">Receive instant push notification badges</span>
                    </div>
                    <button
                      onClick={() => setBrowserAlerts(!browserAlerts)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                        browserAlerts ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                          browserAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {notifMessage && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-medium flex items-center gap-2">
                      <CheckCircle size={14} />
                      {notifMessage.text}
                    </div>
                  )}

                  <button 
                    onClick={saveNotifications}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security & Privacy Section */}
        <div className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
              <Shield size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-950 dark:text-white">Security & Privacy</h4>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                Change password security keys, set location privacy, and protect credentials.
              </p>
            </div>
            <button 
              onClick={() => toggleSection('security')}
              className="px-3 py-1.5 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold cursor-pointer transition-all duration-200 flex items-center gap-1.5 text-gray-700 dark:text-gray-300"
            >
              {activeSection === 'security' ? 'Hide Info' : 'Update Keys'}
              {activeSection === 'security' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          <AnimatePresence>
            {activeSection === 'security' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mt-4 pl-14"
              >
                {isGoogleUser ? (
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 max-w-md">
                    <span className="block font-bold text-xs text-emerald-800 dark:text-emerald-400">Social Sign-in Enabled</span>
                    <span className="block text-[10px] text-gray-550 dark:text-slate-400 mt-1 leading-relaxed">
                      You signed in through your Google Account. Your credentials are secure, and your authentication keys are managed externally via Google Identity.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSecuritySubmit} className="space-y-4 max-w-md">
                    {/* Old password */}
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Current Password
                      </label>
                      <input 
                        type={showOldPass ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-3 top-7 text-gray-400 hover:text-gray-650 focus:outline-none"
                      >
                        {showOldPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* New password */}
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        New Password
                      </label>
                      <input 
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-7 text-gray-400 hover:text-gray-650 focus:outline-none"
                      >
                        {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* Confirm password */}
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Confirm New Password
                      </label>
                      <input 
                        type={showConfirmPass ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-7 text-gray-400 hover:text-gray-650 focus:outline-none"
                      >
                        {showConfirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {securityMessage && (
                      <div className={`p-2.5 rounded-xl flex items-center gap-2 text-[10px] font-medium ${
                        securityMessage.type === 'success' 
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                          : 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                      }`}>
                        {securityMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {securityMessage.text}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={securityLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      {securityLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                      Update Password
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Preferences (Appearance) */}
        <div className="pt-6">
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-950 dark:text-white">Dark Theme Mode</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                  Switch the overall screen interface layout between dark slate and light modes.
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                darkMode ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
