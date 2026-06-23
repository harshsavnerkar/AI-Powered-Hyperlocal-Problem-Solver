import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
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
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
