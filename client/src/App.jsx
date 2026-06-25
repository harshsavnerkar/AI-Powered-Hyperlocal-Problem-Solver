import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import DashboardContainer from './pages/DashboardContainer.jsx';
import ReportIssue from './pages/ReportIssue.jsx';
import MyIssues from './pages/MyIssues.jsx';
import NearbyIssues from './pages/NearbyIssues.jsx';
import CommunityFeed from './pages/CommunityFeed.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Rewards from './pages/Rewards.jsx';
import VerifyIssues from './pages/VerifyIssues.jsx';
import IssueManagement from './pages/IssueManagement.jsx';
import MapView from './pages/MapView.jsx';
import Analytics from './pages/Analytics.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import appLogo from './assets/logo.jpg';

function AppContent() {
  const { loading } = useAuth();
  const [minLoading, setMinLoading] = useState(true);

  useEffect(() => {
    // Artificial minimum duration to display the gorgeous branded splash screen
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const showSplash = loading || minLoading;

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
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
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full"
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Private shell dashboard views */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardContainer />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/my-issues" element={<MyIssues />} />
              <Route path="/nearby-issues" element={<NearbyIssues />} />
              <Route path="/feed" element={<CommunityFeed />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/verify-issues" element={<VerifyIssues />} />
              <Route path="/all-issues" element={<MyIssues />} />
              <Route path="/issue-management" element={<IssueManagement />} />
              <Route path="/map-view" element={<MapView />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Catch-all redirector */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
