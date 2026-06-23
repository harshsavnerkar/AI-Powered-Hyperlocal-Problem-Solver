import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, User } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass rounded-2xl p-6 shadow-sm flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-lg">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Account Settings</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">Configure profile info, dashboard visibility options, and alerts.</p>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 shadow-sm divide-y divide-gray-150 dark:divide-slate-800/60 space-y-6">
        {/* Settings 1 */}
        <div className="flex items-start gap-4 pt-4">
          <div className="p-2.5 bg-gray-55/50 dark:bg-slate-800/60 rounded-xl text-gray-550 shrink-0">
            <User size={18} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-gray-950 dark:text-white">Profile Settings</h4>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Update your screen name, verified mobile contact, and profile avatar badge configs.</p>
          </div>
          <button className="px-3 py-1.5 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold cursor-pointer">
            Edit Profile
          </button>
        </div>

        {/* Settings 2 */}
        <div className="flex items-start gap-4 pt-6">
          <div className="p-2.5 bg-gray-55/50 dark:bg-slate-800/60 rounded-xl text-gray-550 shrink-0">
            <Bell size={18} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-gray-950 dark:text-white">Notification Preferences</h4>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Manage SMS alerts for status transitions, volunteer requests, and duplicate merges.</p>
          </div>
          <button className="px-3 py-1.5 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold cursor-pointer">
            Configure
          </button>
        </div>

        {/* Settings 3 */}
        <div className="flex items-start gap-4 pt-6">
          <div className="p-2.5 bg-gray-55/50 dark:bg-slate-800/60 rounded-xl text-gray-550 shrink-0">
            <Shield size={18} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-gray-950 dark:text-white">Security & Privacy</h4>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Change password keys, toggle location sharing, and adjust visibility settings.</p>
          </div>
          <button className="px-3 py-1.5 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold cursor-pointer">
            Update Keys
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
