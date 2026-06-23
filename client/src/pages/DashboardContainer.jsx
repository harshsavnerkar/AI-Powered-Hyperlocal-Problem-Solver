import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import CitizenDashboard from './CitizenDashboard.jsx';
import VolunteerDashboard from './VolunteerDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';

const DashboardContainer = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'volunteer':
      return <VolunteerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <CitizenDashboard />;
  }
};

export default DashboardContainer;
