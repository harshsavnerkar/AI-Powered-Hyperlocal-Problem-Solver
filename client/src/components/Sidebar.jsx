import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
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
  CheckSquare,
  Activity,
  Bell,
  HelpCircle
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role || 'citizen';

  // Config mapping for role branding color schemes
  const branding = {
    citizen: {
      accent: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      activeText: 'text-emerald-600 dark:text-[#10b981]',
      activeBg: 'bg-emerald-50 dark:bg-dark-active-bg',
      logo: 'text-emerald-500',
      logoBg: 'bg-emerald-100 dark:bg-[#0c231a] text-emerald-600 dark:text-[#10b981]'
    },
    volunteer: {
      accent: 'bg-blue-600 hover:bg-blue-700 text-white',
      activeText: 'text-blue-600 dark:text-[#3b82f6]',
      activeBg: 'bg-blue-50 dark:bg-blue-950/30',
      logo: 'text-blue-600',
      logoBg: 'bg-blue-100 dark:bg-[#0c1a2f] text-blue-600 dark:text-[#3b82f6]'
    },
    admin: {
      accent: 'bg-violet-600 hover:bg-violet-700 text-white',
      activeText: 'text-violet-600 dark:text-[#a855f7]',
      activeBg: 'bg-violet-50 dark:bg-violet-950/30',
      logo: 'text-violet-600',
      logoBg: 'bg-violet-105 dark:bg-[#1f0f2e] text-violet-600 dark:text-[#a855f7]'
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
          { name: 'Rewards & Badges', path: '/rewards', icon: Gift },
          { name: 'Impact & Stats', path: '/dashboard', icon: Activity },
          { name: 'Notifications', path: '/dashboard', icon: Bell, badge: unreadCount },
          { name: 'Profile', path: '/profile', icon: User },
          { name: 'Settings', path: '/settings', icon: Settings },
          { name: 'Help & Support', path: '/settings', icon: HelpCircle },
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
    <aside className="w-64 border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-sidebar flex flex-col h-screen shrink-0 transition-colors duration-250 z-20">
      {/* Sidebar Header / Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-dark-border/60 flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${branding.logoBg} flex items-center justify-center shrink-0`}>
          <ShieldCheck size={20} />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white block font-sans">
            Civic<span className={branding.logo}>AI</span>
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-dark-text-muted block -mt-0.5">
            {role} PORTAL
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        {getLinks().map((link) => {
          const IconComponent = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => 
                `flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? `${branding.activeBg} ${branding.activeText}` 
                    : 'text-gray-600 dark:text-dark-text-muted hover:bg-gray-50 dark:hover:bg-slate-800/30 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <IconComponent size={17} className="shrink-0" />
                <span className="truncate">{link.name}</span>
              </div>
              {link.badge > 0 && (
                <span className="h-5 min-w-5 px-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center font-sans">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Promo Card (only for citizens to build communities) */}
      {role === 'citizen' && (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-950/20 to-slate-900 border border-emerald-900/20 text-white relative overflow-hidden hidden md:block shrink-0">
          <div className="z-10 relative">
            <span className="block text-[11px] font-extrabold leading-snug">
              Together we can <br />build <span className="text-emerald-400 font-black">better communities</span>
            </span>
            {/* Vector SVG Illustration */}
            <div className="my-2.5 flex justify-center">
              <svg viewBox="0 0 100 80" className="h-14 w-auto text-emerald-500 opacity-90" fill="currentColor">
                <circle cx="35" cy="30" r="9" />
                <path d="M35 44c-7 0-14 3.5-14 9v4h28v-4c0-5.5-7-9-14-9z" />
                <circle cx="65" cy="30" r="9" />
                <path d="M65 44c-7 0-14 3.5-14 9v4h28v-4c0-5.5-7-9-14-9z" />
                <path d="M50 34c-1.5-1.5-4-1.5-5.5 0-1.5 1.5-1.5 4 0 5.5l5.5 5.5 5.5-5.5c1.5-1.5 1.5-4 0-5.5-1.5-1.5-4-1.5-5.5 0z" fill="#10b981" />
              </svg>
            </div>
            <button 
              onClick={() => navigate('/report')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-950/30 cursor-pointer text-center block border border-transparent"
            >
              Make a Difference &gt;
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Footer / Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-dark-border/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-655 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 cursor-pointer"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
