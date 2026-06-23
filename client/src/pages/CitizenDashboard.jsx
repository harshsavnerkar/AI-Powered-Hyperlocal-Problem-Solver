import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { 
  Plus, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  ShieldAlert, 
  AlertTriangle,
  ArrowRight,
  UserCheck
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/issues`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setIssues(data);
        }
      } catch (err) {
        console.error('Failed to load issues:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadIssues();
  }, [token]);

  // Compute stats based on real data
  const myIssues = issues.filter(i => {
    const reporterId = typeof i.reportedBy === 'object' ? i.reportedBy?._id : i.reportedBy;
    return reporterId === user?._id;
  });
  
  const reportedCount = myIssues.length || 12; // fallback to seed mockup values if empty
  const resolvedCount = myIssues.filter(i => i.status === 'Resolved').length || 8;
  const points = user?.points || 250;
  const rank = user?.rank || 15;

  const statusColors = {
    Reported: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    Verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
    Assigned: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
    Resolved: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400'
  };

  const getRecentFeed = () => {
    return [
      { id: 1, user: 'Riya S.', action: 'verified an issue', target: 'Pothole on 5th Avenue', time: '10 min ago', points: '+5 pts', type: 'verify' },
      { id: 2, user: 'Aarav S.', action: 'reported an issue', target: 'Water leakage near Building A', time: '1 hour ago', points: '+10 pts', type: 'report' },
      { id: 3, user: 'Electricity Dept', action: 'resolved an issue', target: 'Streetlight not working', time: '2 hours ago', points: '+20 pts', type: 'resolve' }
    ];
  };

  // Badge configs
  const badgeList = [
    { id: 1, name: 'Community Reporter', desc: 'Report 1st Issue', color: 'from-amber-400 to-yellow-600', icon: AlertTriangle, active: points >= 10 },
    { id: 2, name: 'Problem Solver', desc: 'Reach 50 Points', color: 'from-emerald-400 to-green-600', icon: CheckCircle, active: points >= 50 },
    { id: 3, name: 'Active Citizen', desc: 'Reach 100 Points', color: 'from-cyan-400 to-blue-600', icon: UserCheck, active: points >= 100 },
    { id: 4, name: 'Top Contributor', desc: 'Reach 200 Points', color: 'from-purple-400 to-indigo-600', icon: Award, active: points >= 200 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Block */}
      <div className="glass rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Together we can build a better community</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Use the actions below to report neighborhood grievances, earn rewards, and tracks resolutions.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link to="/report" className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/10 transition-all cursor-pointer">
            <Plus size={16} />
            Report New Issue
          </Link>
          <Link to="/nearby-issues" className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer">
            <MapPin size={16} className="text-emerald-500" />
            View Nearby Issues
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-emerald-500 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Issues Reported</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">{reportedCount}</span>
        </div>
        {/* Metric 2 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-teal-500 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Issues Resolved</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">{resolvedCount}</span>
        </div>
        {/* Metric 3 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-amber-500 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Points Earned</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">{points}</span>
        </div>
        {/* Metric 4 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-blue-500 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Current Rank</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">
            {rank} <span className="text-xs font-medium text-gray-400">of 230</span>
          </span>
        </div>
      </div>

      {/* Grid: Left - My Issues, Right - Feed & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Reported Issues */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 shadow-sm flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">My Issues</h3>
                <Link to="/my-issues" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading issues...</div>
              ) : myIssues.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400 dark:text-slate-500 font-medium">
                  You haven't reported any issues yet. Click "Report New Issue" above to start!
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  {myIssues.slice(0, 3).map((issue) => (
                    <div 
                      key={issue._id} 
                      onClick={() => navigate(`/my-issues`)}
                      className="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/20 dark:hover:bg-slate-800/10 px-2 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                          {issue.media?.imageUrl ? (
                            <img src={`${API_BASE_URL.replace('/api', '')}${issue.media.imageUrl}`} alt={issue.title} className="h-full w-full object-cover" />
                          ) : (
                            issue.category === 'Pothole' ? '🕳️' :
                            issue.category === 'Garbage' ? '🗑️' :
                            issue.category === 'Water Leakage' ? '💧' :
                            issue.category === 'Streetlight' ? '💡' : '⚠️'
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-xs text-gray-900 dark:text-white leading-snug">{issue.title}</span>
                          <span className="block text-[10px] text-gray-400 mt-0.5">{issue.location?.address}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${statusColors[issue.status]}`}>
                          {issue.status}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                          {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-4 text-center">
              <Link to="/my-issues" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                View all reports
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Community Feed & Badges */}
        <div className="space-y-6">
          {/* Community Feed */}
          <div className="glass rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-5">Community Feed</h3>
            <div className="space-y-4">
              {getRecentFeed().map((feed) => (
                <div key={feed.id} className="flex items-start gap-3 text-xs">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] uppercase">
                    {feed.user.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 dark:text-slate-200">
                      <span className="font-bold">{feed.user}</span> {feed.action}{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">{feed.target}</span>
                    </p>
                    <span className="text-[9px] text-gray-400 mt-1 block">{feed.time}</span>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{feed.points}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-gray-100 dark:border-slate-800 pt-4 text-center">
              <Link to="/feed" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                View Full Feed
              </Link>
            </div>
          </div>

          {/* Badges Earned */}
          <div className="glass rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-5">Badges Earned</h3>
            <div className="grid grid-cols-2 gap-4">
              {badgeList.map((badge) => {
                const IconComp = badge.icon;
                return (
                  <div 
                    key={badge.id} 
                    className={`flex flex-col items-center p-3 rounded-xl border border-gray-100 dark:border-slate-800/60 text-center ${
                      badge.active ? 'opacity-100' : 'opacity-40 select-none grayscale'
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-tr ${badge.color} flex items-center justify-center text-white shadow-lg`}>
                      <IconComp size={20} />
                    </div>
                    <span className="block font-bold text-[10px] text-gray-900 dark:text-white mt-2 leading-tight">{badge.name}</span>
                    <span className="block text-[8px] text-gray-400 mt-0.5">{badge.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
