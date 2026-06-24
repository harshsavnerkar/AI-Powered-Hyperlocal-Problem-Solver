import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { Bell, Sun, Moon, Sparkles, LogOut, CheckCheck, Search } from 'lucide-react';

const Header = ({ title }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

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
  const isDashboard = location.pathname === '/dashboard';

  const roleColorClass = {
    citizen: 'bg-emerald-50 text-emerald-800 dark:bg-[#0c231a] dark:text-[#10b981] border border-emerald-100 dark:border-emerald-900/30',
    volunteer: 'bg-blue-50 text-blue-850 dark:bg-[#0c1a2f] dark:text-[#3b82f6] border border-blue-105 dark:border-blue-900/30',
    admin: 'bg-violet-50 text-violet-850 dark:bg-[#1f0f2e] dark:text-[#a855f7] border border-violet-105 dark:border-purple-900/30'
  }[role];

  return (
    <header className="h-24 border-b border-gray-150 dark:border-transparent bg-white/70 dark:bg-transparent px-8 flex items-center justify-between z-40 relative transition-all duration-200">
      {/* Welcome Greeting or Page Title */}
      <div className="z-10">
        {isDashboard ? (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-1.5">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.name?.split(' ')[0]}! <span className="animate-bounce">👋</span>
            </h2>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-dark-text-muted mt-1">
              Together we can build a better and smarter community.
            </p>
          </div>
        ) : (
          <h1 className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white capitalize font-sans">
            {title}
          </h1>
        )}
      </div>

      {/* Search Bar - Center */}
      <div className="flex-1 max-w-md mx-8 hidden lg:block z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400 dark:text-dark-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search issues, people, places..."
            className="w-full pl-10 pr-12 py-2.5 bg-gray-50/50 border border-gray-200/80 dark:bg-dark-card dark:border-dark-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-900 dark:text-white dark:placeholder-dark-text-muted/65 transition-all duration-200"
          />
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-sans font-bold text-gray-400 dark:text-dark-text-muted/80 bg-gray-100 dark:bg-dark-bg border border-gray-200/40 dark:border-dark-border rounded">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-4 z-10">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100/60 dark:hover:bg-dark-card border border-transparent dark:hover:border-dark-border transition-all duration-200 cursor-pointer"
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100/60 dark:hover:bg-dark-card border border-transparent dark:hover:border-dark-border transition-all duration-200 relative cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-emerald-500 text-white rounded-full text-[9px] flex items-center justify-center font-extrabold font-sans">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown list */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 max-h-[480px] overflow-y-auto bg-white/95 dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200/50 dark:border-dark-border p-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 border-b border-gray-100 dark:border-dark-border/60 flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline"
                  >
                    <CheckCheck size={12} />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-100 dark:divide-dark-border/60 overflow-y-auto max-h-[350px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[10px] text-gray-400 dark:text-dark-text-muted font-bold uppercase tracking-wider">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      className={`p-3 text-[11px] transition-colors duration-150 hover:bg-gray-50/50 dark:hover:bg-dark-bg/40 ${!n.read ? 'bg-gray-50/70 dark:bg-dark-bg/20 font-semibold' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-dark-text-muted'}`}>
                          {n.title}
                        </span>
                        {!n.read && <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />}
                      </div>
                      <p className="text-gray-500 dark:text-dark-text-muted mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-gray-405 mt-1.5 block">
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
        <div className="relative flex items-center gap-3 border-l border-gray-250/60 dark:border-dark-border pl-4" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-md border-2 border-white dark:border-dark-border shrink-0">
              {user.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CH'}
            </div>
            <div className="hidden md:block">
              <span className="block text-xs font-black text-gray-800 dark:text-slate-100 font-sans">
                {user.name}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mt-0.5 ${roleColorClass}`}>
                {role}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white/95 dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200/50 dark:border-dark-border p-1 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 top-12">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-dark-border/60 text-[10px]">
                <span className="block font-bold text-gray-400 uppercase tracking-widest">Logged in as</span>
                <span className="block font-extrabold text-gray-800 dark:text-white truncate mt-0.5">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-left cursor-pointer transition-all"
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
