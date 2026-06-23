import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Layout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If loading user profile, show a sleek full page loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center gap-4 transition-colors duration-200">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
        </div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Loading Portal...</span>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Determine Title based on URL path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return `Welcome, ${user.name?.split(' ')[0]} 👋`;
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
    return 'Community Hero';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header title={getPageTitle()} />

        {/* Scrollable Page Outlet Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
