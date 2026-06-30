import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { Bell, Sun, Moon, Sparkles, LogOut, CheckCheck, Menu } from 'lucide-react';

const Header = ({ title, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!user) return null;

  const role = user.role || 'citizen';
  const roleColorClass = {
    citizen: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40',
    volunteer: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40',
    admin: 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40'
  }[role];

  return (
    <header className="h-20 border-b border-gray-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-4 md:px-8 flex items-center justify-between z-40 relative transition-colors duration-200">
      {/* Title & Hamburger */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-white rounded-lg block md:hidden cursor-pointer shrink-0"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-extrabold text-base md:text-2xl tracking-tight text-gray-900 dark:text-white capitalize font-sans truncate">
          {title}
        </h1>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-1.5 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 md:p-2.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all duration-200"
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? <Sun size={18} className="text-amber-400 animate-spin-slow" /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 md:p-2.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all duration-200 relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center font-bold font-sans">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown list */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 max-h-[480px] overflow-y-auto glass rounded-xl shadow-2xl border border-gray-200/50 dark:border-slate-800/60 p-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-100 dark:divide-slate-800/60 overflow-y-auto max-h-[350px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400 dark:text-slate-500 font-medium">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      className={`p-3 text-xs transition-colors duration-150 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 ${!n.read ? 'bg-gray-50/70 dark:bg-slate-800/20 font-medium' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-400'}`}>
                          {n.title}
                        </span>
                        {!n.read && <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />}
                      </div>
                      <p className="text-gray-500 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-gray-400 mt-1.5 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative flex items-center gap-1.5 md:gap-3 border-l border-gray-200 dark:border-slate-800 pl-2.5 md:pl-4" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 md:gap-3 text-left focus:outline-none"
          >
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-md border-2 border-white dark:border-slate-800">
              {user.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CH'}
            </div>
            <div className="hidden md:block">
              <span className="block text-sm font-bold text-gray-800 dark:text-slate-100 font-sans -mb-0.5">
                {user.name}
              </span>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${roleColorClass}`}>
                {role}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 glass rounded-xl shadow-2xl border border-gray-200/50 dark:border-slate-800/60 p-1 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-150 top-12">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800/60 text-xs">
                <span className="block font-semibold text-gray-500">Logged in as</span>
                <span className="block font-bold text-gray-800 dark:text-white truncate">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-left"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
