import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, API_BASE_URL } from './AuthContext.jsx';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setNotifications(prev => {
          // Premium feature: check if we have a new notification to trigger a visual toast
          if (prev.length > 0 && data.length > prev.length) {
            const newNotifs = data.filter(n => !prev.some(existing => existing._id === n._id));
            if (newNotifs.length > 0) {
              // Trigger toast for the most recent new notification
              showToast(newNotifs[0]);
            }
          }
          return data;
        });
        
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Poll notifications every 8 seconds for a lively real-time feeling
      const interval = setInterval(fetchNotifications, 8000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token, fetchNotifications]);

  const showToast = (notif) => {
    setActiveToast(notif);
    setTimeout(() => {
      setActiveToast(null);
    }, 4000);
  };

  const markAllAsRead = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, refreshNotifications: fetchNotifications, activeToast, setActiveToast }}>
      {children}
      
      {/* Premium Toast Alert Banner */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce max-w-sm glass rounded-xl shadow-xl border border-emerald-500/20 dark:border-emerald-500/30 p-4 transition-all duration-300">
          <div className="flex items-start gap-3">
            <span className="flex h-2 w-2 mt-2 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{activeToast.title}</h4>
              <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">{activeToast.message}</p>
            </div>
            <button 
              onClick={() => setActiveToast(null)} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs ml-auto font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
