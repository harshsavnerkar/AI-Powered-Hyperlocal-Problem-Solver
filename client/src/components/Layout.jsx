import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import appLogo from '../assets/logo.jpg';
import confetti from 'canvas-confetti';
import { Award, X, Sparkles } from 'lucide-react';

const Layout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [newBadge, setNewBadge] = useState(null);
  const prevBadgesCountRef = useRef(user?.badges?.length || 0);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // Listen for badge unlock milestones
  useEffect(() => {
    if (user && user.badges) {
      const prevCount = prevBadgesCountRef.current;
      if (user.badges.length > prevCount) {
        const unlocked = user.badges[user.badges.length - 1];
        setNewBadge(unlocked);
        triggerConfetti();
      }
      prevBadgesCountRef.current = user.badges.length;
    }
  }, [user?.badges]);

  // Determine Title based on URL path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return `Welcome, ${user?.name?.split(' ')[0]} 👋`;
    if (path === '/report') return 'Report New Issue';
    if (path === '/my-issues') return 'My Reported Issues';
    if (path === '/nearby-issues') return 'Nearby Community Issues';
    if (path === '/feed') return 'Community Feed';
    if (path === '/leaderboard') return 'Community Leaderboard';
    if (path === '/rewards') return 'My Rewards & Badges';
    if (path === '/verify-issues') return 'Validate Nearby Issues';
    if (path === '/all-issues') return 'All Reported Issues';
    if (path === '/issue-management') return 'Issue Resolution Board';
    if (path === '/map-view') return 'Interactive Hotspot Map';
    if (path === '/analytics') return 'Civic Analytics';
    if (path === '/profile') return 'Citizen Profile';
    if (path === '/settings') return 'Account Settings';
    return 'CommunityHero';
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen bg-slate-50 dark:bg-[#0b1317] flex flex-col justify-center items-center gap-6 transition-colors duration-200 relative overflow-hidden"
        >
          {/* Subtle background patterns */}
          <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[80px] pointer-events-none z-0" />
          
          <div className="z-10 flex flex-col items-center gap-6">
            {/* Glowing Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.95, 1.02, 1],
                opacity: 1,
                boxShadow: [
                  "0 0 0 0px rgba(16, 185, 129, 0.25)",
                  "0 0 0 20px rgba(16, 185, 129, 0)",
                  "0 0 0 0px rgba(16, 185, 129, 0.25)"
                ]
              }}
              transition={{ 
                scale: { duration: 0.8, ease: "easeOut" },
                boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
              }}
              className="relative h-24 w-24 rounded-2xl overflow-hidden border border-emerald-500/20 flex items-center justify-center bg-white dark:bg-slate-900 shadow-xl"
            >
              <img src={appLogo} alt="CommunityHero Logo" className="h-20 w-20 object-contain rounded-xl" />
            </motion.div>

            {/* Branded text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-3xl font-black tracking-tight flex items-center justify-center gap-1.5">
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 bg-clip-text text-transparent">
                  Community
                </span>
                <span className="text-slate-800 dark:text-slate-100">Hero</span>
              </h1>
              <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
                <span>Empowering Citizens</span>
                <span className="text-emerald-500">•</span>
                <span>Resolving Civic Issues</span>
              </p>
            </motion.div>

            {/* Progress line */}
            <div className="w-48 h-1 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden relative mt-2">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
              />
            </div>

            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1"
            >
              Connecting to Civic Portal...
            </motion.span>
          </div>
        </motion.div>
      ) : !user ? (
        <Navigate to="/login" replace />
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex h-screen overflow-hidden bg-gradient-to-tr from-slate-50 via-[#f0faf5] to-[#f5f9fc] dark:from-[#0b1317] dark:via-[#071610] dark:to-[#0b1216] text-gray-900 dark:text-slate-100 transition-colors duration-200 w-full"
        >
          {/* Sidebar navigation */}
          <Sidebar />

          {/* Main panel */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Background Decorative Patterns */}
            <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-80" />
            <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-emerald-400/12 dark:bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[65%] h-[65%] rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-[150px] pointer-events-none z-0" />

            <Header title={getPageTitle()} />

            {/* Scrollable Page Outlet Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 z-10 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 12, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.995 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full min-h-full flex flex-col animate-container"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </motion.div>
      )}

      {/* Badge Achievement Modal */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: -30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 text-center space-y-6 overflow-hidden"
            >
              {/* Outer glow aura */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 blur-[60px] pointer-events-none rounded-full" />

              {/* Close Button */}
              <button
                onClick={() => setNewBadge(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Icon Container */}
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 p-0.5 shadow-xl relative animate-pulse">
                <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400">
                  <Award size={40} />
                </div>
                <div className="absolute -top-1 -right-1 text-yellow-300 animate-spin-slow">
                  <Sparkles size={16} />
                </div>
              </div>

              {/* Texts */}
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Achievement Unlocked!
                </span>
                <h3 className="text-lg font-black text-white font-sans tracking-tight">
                  {newBadge}
                </h3>
                <p className="text-[10px] text-slate-450 px-4 leading-relaxed">
                  Congratulations! Your civic action and community service unlocked this official badge rank.
                </p>
              </div>

              {/* Button */}
              <button
                onClick={() => setNewBadge(null)}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg transition-all"
              >
                Awesome, thanks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default Layout;
