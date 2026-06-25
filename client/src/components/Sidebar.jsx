import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import appLogo from '../assets/logo.jpg';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  MapPin, 
  Rss, 
  Trophy, 
  Gift, 
  User, 
  Settings, 
  LogOut,
  FolderLock,
  ListTodo,
  TrendingUp,
  Map,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role || 'citizen';

  // Config mapping for role branding color schemes
  const branding = {
    citizen: {
      accent: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      activeText: 'text-emerald-600 dark:text-[#10b981]',
      activeBg: 'bg-emerald-50 dark:bg-[#0c231a] border-r-4 border-emerald-500 dark:border-r-0',
      logo: 'text-emerald-500',
      logoBg: 'bg-emerald-100 dark:bg-[#0c231a] text-emerald-600 dark:text-[#10b981]'
    },
    volunteer: {
      accent: 'bg-blue-600 hover:bg-blue-700 text-white',
      activeText: 'text-blue-600 dark:text-[#3b82f6]',
      activeBg: 'bg-blue-50 dark:bg-[#0c1a2f] border-r-4 border-blue-600 dark:border-r-0',
      logo: 'text-blue-600',
      logoBg: 'bg-blue-100 dark:bg-[#0c1a2f] text-blue-600 dark:text-[#3b82f6]'
    },
    admin: {
      accent: 'bg-violet-600 hover:bg-violet-700 text-white',
      activeText: 'text-violet-600 dark:text-[#a855f7]',
      activeBg: 'bg-violet-50 dark:bg-[#1f0f2e] border-r-4 border-violet-600 dark:border-r-0',
      logo: 'text-violet-600',
      logoBg: 'bg-violet-100 dark:bg-[#1f0f2e] text-violet-600 dark:text-[#a855f7]'
    }
  }[role];

  // Define sidebar links based on roles
  const getLinks = () => {
    switch (role) {
      case 'citizen':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Report Issue', path: '/report', icon: AlertTriangle },
          { name: 'My Issues', path: '/my-issues', icon: CheckSquare },
          { name: 'Nearby Issues', path: '/nearby-issues', icon: MapPin },
          { name: 'Community Feed', path: '/feed', icon: Rss },
          { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
          { name: 'Rewards', path: '/rewards', icon: Gift },
          { name: 'Profile', path: '/profile', icon: User },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
      case 'volunteer':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Nearby Issues', path: '/nearby-issues', icon: MapPin },
          { name: 'Verify Issues', path: '/verify-issues', icon: ShieldCheck },
          { name: 'Community Feed', path: '/feed', icon: Rss },
          { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
          { name: 'Profile', path: '/profile', icon: User },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'All Issues', path: '/all-issues', icon: FolderLock },
          { name: 'Issue Management', path: '/issue-management', icon: ListTodo },
          { name: 'Map View', path: '/map-view', icon: Map },
          { name: 'Analytics', path: '/analytics', icon: TrendingUp },
          { name: 'Profile', path: '/profile', icon: User },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-screen shrink-0 transition-colors duration-200">
      {/* Sidebar Header / Logo */}
      <div className="p-5 border-b border-gray-100 dark:border-slate-850 flex items-center gap-3.5">
        <img src={appLogo} alt="CommunityHero Logo" className="h-9 w-auto rounded-lg shadow-sm border border-gray-105 dark:border-slate-800/85 shrink-0" />
        <div>
          <span className="font-black text-sm tracking-tight text-gray-905 dark:text-white block font-sans leading-none">
            Community<span className="text-emerald-500">Hero</span>
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1 block">
            {role} PORTAL
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        {getLinks().map((link) => {
          const IconComponent = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? `${branding.activeBg} ${branding.activeText}` 
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <IconComponent size={18} className="shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer / Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
