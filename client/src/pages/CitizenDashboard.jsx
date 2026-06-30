import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
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
  UserCheck,
  Search,
  Bell,
  Heart,
  MessageSquare,
  FileText,
  Activity,
  Users,
  Trophy,
  Leaf
} from 'lucide-react';
import bannerBg from '../assets/citizen_banner_bg.png';

const CitizenDashboard = () => {
  const { user, token } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Geolocation failed:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (issues.length > 0 && mapCenter[0] === 28.6139 && mapCenter[1] === 77.2090) {
      const issueWithCoords = issues.find(i => i.location?.latitude && i.location?.longitude);
      if (issueWithCoords) {
        setMapCenter([issueWithCoords.location.latitude, issueWithCoords.location.longitude]);
      }
    }
  }, [issues, mapCenter]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/issues`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const leaderResponse = await fetch(`${API_BASE_URL}/auth/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok && leaderResponse.ok) {
        const issuesData = await response.json();
        const leaderData = await leaderResponse.json();
        setIssues(issuesData);
        setLeaderboard(leaderData);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      // Setup periodic polling to make the dashboard realtime
      const interval = setInterval(fetchDashboardData, 6000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Compute user metrics based on real data
  const myIssues = issues.filter(i => {
    const reporterId = typeof i.reportedBy === 'object' ? i.reportedBy?._id : i.reportedBy;
    return reporterId === user?._id;
  });

  const reportedCount = myIssues.length;
  const resolvedCount = myIssues.filter(i => i.status === 'Resolved').length;
  const points = user?.points || 0;
  
  // Calculate dynamic rank position
  const rankIndex = leaderboard.findIndex(u => u._id === user?._id);
  const rank = rankIndex !== -1 ? rankIndex + 1 : 0;
  const totalUsers = leaderboard.length || 1;
  const rankPercentile = Math.round((rank / totalUsers) * 100) || 100;

  // Impact Score = reports * 5 + resolved * 10
  const impactScore = (reportedCount * 5) + (resolvedCount * 10);
  const impactLevel = impactScore >= 50 ? 'High Impact' : impactScore >= 20 ? 'Medium Impact' : 'Growth Phase';

  // Weekly calculations (last 7 days)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const reportsThisWeek = myIssues.filter(i => new Date(i.createdAt).getTime() > oneWeekAgo).length;
  const resolvedThisWeek = myIssues.filter(i => i.status === 'Resolved' && i.resolvedAt && new Date(i.resolvedAt).getTime() > oneWeekAgo).length;
  const pointsThisWeek = reportsThisWeek * 10 + resolvedThisWeek * 20;

  // Custom marker generator for the map
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#22c55e';
      default: return '#10b981';
    }
  };

  const createCustomMarker = (priority) => {
    const color = getPriorityColor(priority);
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div style="background-color: ${color}" class="absolute h-6 w-6 rounded-full opacity-20 animate-ping"></div>
          <div style="background-color: ${color}; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25)" class="h-4.5 w-4.5 rounded-full relative z-10"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Top 3 contributors + current user logic
  const topContributors = leaderboard.slice(0, 3);
  const userLeaderboardInfo = leaderboard.find(u => u._id === user?._id);

  // Status colors helper
  const statusColors = {
    Reported: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    Verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
    Assigned: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
    Resolved: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400'
  };

  // Badges lists
  const badgeList = [
    { id: 1, name: 'Community Reporter', desc: 'Report 1st Issue', color: 'from-amber-400 to-yellow-600', icon: AlertTriangle, active: points >= 10 },
    { id: 2, name: 'Problem Solver', desc: 'Reach 50 Points', color: 'from-emerald-400 to-green-600', icon: CheckCircle, active: points >= 50 },
    { id: 3, name: 'Active Citizen', desc: 'Reach 100 Points', color: 'from-cyan-400 to-blue-600', icon: UserCheck, active: points >= 100 },
    { id: 4, name: 'Top Contributor', desc: 'Reach 200 Points', color: 'from-purple-400 to-indigo-600', icon: Award, active: points >= 200 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner greeting */}
      <div 
        className={`rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 relative overflow-hidden shadow-sm border ${
          darkMode 
            ? 'bg-slate-905 border-slate-800/80 text-white' 
            : 'bg-cover bg-center text-slate-800 border-gray-150/40'
        }`}
        style={
          darkMode 
            ? {} 
            : { backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.95) 55%, rgba(255, 255, 255, 0.35)), url(${bannerBg})` }
        }
      >
        <div className="z-10">
          <h2 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className={`text-sm font-medium mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {darkMode ? 'Together we can build a better and smarter community.' : "Let's make our community a better place today."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 z-10 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
          <Link to="/report" className="flex items-center justify-center gap-1.5 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer w-full sm:w-auto">
            <Plus size={16} />
            Report New Issue
          </Link>
          <Link to="/nearby-issues" className="flex items-center justify-center gap-1.5 px-5 py-3.5 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-250/60 dark:border-slate-800 font-extrabold text-xs rounded-2xl shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer w-full sm:w-auto">
            <MapPin size={16} className="text-emerald-500" />
            View Nearby Issues
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Reported */}
        <div className="glass rounded-2xl p-5 border-l-4 border-emerald-500 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issues Reported</span>
              <span className="block text-3xl font-black text-gray-900 dark:text-white mt-1.5 font-sans">{reportedCount}</span>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
              <FileText size={18} />
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 mt-2 block">+{reportsThisWeek} this week</span>
        </div>

        {/* Metric 2: Resolved */}
        <div className="glass rounded-2xl p-5 border-l-4 border-blue-500 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issues Resolved</span>
              <span className="block text-3xl font-black text-gray-900 dark:text-white mt-1.5 font-sans">{resolvedCount}</span>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl">
              <CheckCircle size={18} />
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-650 mt-2 block">+{resolvedThisWeek} this week</span>
        </div>

        {/* Metric 3: Points */}
        <div className="glass rounded-2xl p-5 border-l-4 border-amber-500 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Points Earned</span>
              <span className="block text-3xl font-black text-gray-900 dark:text-white mt-1.5 font-sans">{points}</span>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-550 rounded-xl">
              <Award size={18} />
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-600 mt-2 block">+{pointsThisWeek} this week</span>
        </div>

        {/* Metric 4: Rank */}
        <div className="glass rounded-2xl p-5 border-l-4 border-purple-500 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Rank</span>
              <span className="block text-3xl font-black text-gray-900 dark:text-white mt-1.5 font-sans">
                {rank > 0 ? `#${rank}` : 'N/A'}
              </span>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/20 text-purple-605 rounded-xl">
              <Trophy size={18} />
            </div>
          </div>
          <span className="text-[10px] font-bold text-purple-600 mt-2 block">
            {rank > 0 ? `Top ${rankPercentile}%` : 'Unranked'}
          </span>
        </div>

        {/* Metric 5: Impact Score */}
        <div className="glass rounded-2xl p-5 border-l-4 border-rose-500 shadow-sm relative overflow-hidden col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Impact Score</span>
              <span className="block text-3xl font-black text-gray-900 dark:text-white mt-1.5 font-sans">{impactScore}</span>
            </div>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl">
              <Activity size={18} />
            </div>
          </div>
          <span className="text-[10px] font-bold text-rose-600 mt-2 block">{impactLevel}</span>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/report" className="glass hover:bg-gray-50/50 dark:hover:bg-slate-800/20 p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer transition-all border border-gray-150/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
              <Plus size={16} />
            </div>
            <div>
              <span className="block font-bold text-xs text-gray-900 dark:text-white">Report New Issue</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">Click to report</span>
            </div>
          </div>
          <ArrowRight size={14} className="text-gray-400" />
        </Link>

        <Link to="/nearby-issues" className="glass hover:bg-gray-50/50 dark:hover:bg-slate-800/20 p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer transition-all border border-gray-150/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl">
              <MapPin size={16} />
            </div>
            <div>
              <span className="block font-bold text-xs text-gray-900 dark:text-white">Nearby Issues</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">See issues near you</span>
            </div>
          </div>
          <ArrowRight size={14} className="text-gray-400" />
        </Link>

        <Link to="/my-issues" className="glass hover:bg-gray-50/50 dark:hover:bg-slate-800/20 p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer transition-all border border-gray-150/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl">
              <FileText size={16} />
            </div>
            <div>
              <span className="block font-bold text-xs text-gray-900 dark:text-white">Track My Issues</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">Check issue status</span>
            </div>
          </div>
          <ArrowRight size={14} className="text-gray-400" />
        </Link>

        <Link to="/feed" className="glass hover:bg-gray-50/50 dark:hover:bg-slate-800/20 p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer transition-all border border-gray-150/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/20 text-purple-600 rounded-xl">
              <Users size={16} />
            </div>
            <div>
              <span className="block font-bold text-xs text-gray-900 dark:text-white">Community Feed</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">Latest updates</span>
            </div>
          </div>
          <ArrowRight size={14} className="text-gray-400" />
        </Link>
      </div>

      {/* Main Grid: Left - My Issues & Map, Right - Feed & Badges & Top Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Recent Issues & Map */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: My Recent Issues */}
          <div className="glass rounded-3xl p-6 shadow-sm border border-gray-150/40 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">My Recent Issues</h3>
                <Link to="/my-issues" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading recent issues...</div>
              ) : myIssues.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400 dark:text-slate-500 font-medium">
                  You haven't reported any issues yet. Click "Report New Issue" above to start!
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  {myIssues.slice(0, 4).map((issue) => (
                    <div 
                      key={issue._id} 
                      onClick={() => navigate(`/my-issues`)}
                      className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/20 dark:hover:bg-slate-800/10 px-2 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-inner">
                          {issue.media?.imageUrl ? (
                            <img 
                              src={issue.media.imageUrl.startsWith('http') ? issue.media.imageUrl : `${API_BASE_URL.replace('/api', '')}${issue.media.imageUrl}`} 
                              alt={issue.title} 
                              className="h-full w-full object-cover" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const emoji = 
                                  issue.category === 'Pothole' ? '🕳️' :
                                  issue.category === 'Garbage' ? '🗑️' :
                                  issue.category === 'Water Leakage' ? '💧' :
                                  issue.category === 'Streetlight' ? '💡' : '⚠️';
                                const textNode = document.createTextNode(emoji);
                                e.target.parentNode.appendChild(textNode);
                              }}
                            />
                          ) : (
                            issue.category === 'Pothole' ? '🕳️' :
                            issue.category === 'Garbage' ? '🗑️' :
                            issue.category === 'Water Leakage' ? '💧' :
                            issue.category === 'Streetlight' ? '💡' : '⚠️'
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="block font-bold text-xs text-gray-900 dark:text-white truncate">{issue.title}</span>
                          <span className="block text-[10px] text-gray-450 mt-0.5 truncate">{issue.location?.address}</span>
                          <span className="inline-block text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">{issue.priority} Priority</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${statusColors[issue.status]}`}>
                          {issue.status}
                        </span>
                        <span className="text-[9px] text-gray-400 font-medium hidden sm:inline">
                          {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Nearby Issues Map */}
          <div className="glass rounded-3xl p-6 shadow-sm border border-gray-150/40 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Nearby Issues Map</h3>
              <Link to="/nearby-issues" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
                View on Map
              </Link>
            </div>
            
            <div className="h-72 rounded-2xl overflow-hidden border border-gray-150 dark:border-slate-800 shadow-inner z-0 relative">
              <MapContainer center={mapCenter} zoom={14} key={`${mapCenter[0]}-${mapCenter[1]}`} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url={darkMode 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  }
                />
                {issues.map((issue) => {
                  if (!issue.location?.latitude || !issue.location?.longitude) return null;
                  return (
                    <Marker 
                      key={issue._id} 
                      position={[issue.location.latitude, issue.location.longitude]} 
                      icon={createCustomMarker(issue.priority)}
                    >
                      <Popup>
                        <div className="p-1 font-sans space-y-1 w-44 text-xs">
                          <span className="block font-bold text-gray-900 leading-snug">{issue.title}</span>
                          <span className="block text-[9px] text-gray-405 flex items-center gap-0.5 mt-0.5"><MapPin size={9} /> {issue.location?.address}</span>
                          <div className="flex gap-1.5 flex-wrap mt-1">
                            <span 
                              style={{ backgroundColor: getPriorityColor(issue.priority) + '15', color: getPriorityColor(issue.priority) }} 
                              className="px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider"
                            >
                              {issue.priority}
                            </span>
                            <span className="px-1 py-0.5 rounded bg-gray-105 text-gray-650 text-[8px] font-bold uppercase tracking-wider">
                              {issue.status}
                            </span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Map Legend */}
            <div className="flex items-center justify-center flex-wrap gap-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest pt-2">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block shadow-sm shadow-red-500/20" /> Critical</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500 inline-block shadow-sm shadow-orange-500/20" /> High</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500 inline-block shadow-sm shadow-yellow-500/20" /> Medium</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block shadow-sm shadow-green-500/20" /> Low</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Community Feed & Badges & Top Contributors */}
        <div className="space-y-6">
          
          {/* Section 1: Live Community Feed (Actual active updates) */}
          <div className="glass rounded-3xl p-6 shadow-sm border border-gray-150/40">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Community Feed</h3>
              <Link to="/feed" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                View Full Feed
              </Link>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="p-4 text-center text-xs text-gray-400 animate-pulse">Loading feed...</div>
              ) : issues.length === 0 ? (
                <p className="text-center text-[10px] text-gray-400 py-4">No recent community updates.</p>
              ) : (
                issues.slice(0, 3).map((issue) => {
                  const reporter = typeof issue.reportedBy === 'object' ? issue.reportedBy?.name : 'Aarav Sharma';
                  const actionText = issue.status === 'Resolved' ? 'resolved the issue' : issue.status === 'In Progress' ? 'started working on' : 'reported the issue';
                  const feedDate = new Date(issue.createdAt);
                  const timeStr = feedDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + feedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={issue._id} className="flex items-start gap-3 text-xs">
                      <div className="h-8 w-8 rounded-full bg-slate-50 border border-gray-100 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                        {reporter.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 dark:text-slate-200 leading-snug">
                          <span className="font-bold">{reporter}</span> {actionText}{' '}
                          <span className="font-semibold text-gray-900 dark:text-white">"{issue.title}"</span>
                        </p>
                        <span className="text-[9px] text-gray-400 mt-1 block">{timeStr}</span>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {issue.status === 'Resolved' ? '+20 pts' : '+10 pts'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 2: Badges Earned */}
          <div className="glass rounded-3xl p-6 shadow-sm border border-gray-150/40">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Badges Earned</h3>
              <Link to="/rewards" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {badgeList.map((badge) => {
                const IconComp = badge.icon;
                return (
                  <div 
                    key={badge.id} 
                    className={`flex flex-col items-center p-3 rounded-xl border border-gray-100 dark:border-slate-800 text-center transition-all ${
                      badge.active ? 'opacity-100 bg-white dark:bg-slate-900 shadow-sm' : 'opacity-40 select-none grayscale bg-slate-50/50 dark:bg-slate-850/20'
                    }`}
                  >
                    <div className={`h-11 w-11 rounded-full bg-gradient-to-tr ${badge.color} flex items-center justify-center text-white shadow-md`}>
                      <IconComp size={18} />
                    </div>
                    <span className="block font-bold text-[10px] text-gray-900 dark:text-white mt-2 leading-tight">{badge.name}</span>
                    <span className="block text-[8px] text-gray-450 mt-0.5">{badge.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Top Contributors (Leaderboard) */}
          <div className="glass rounded-3xl p-6 shadow-sm border border-gray-150/40 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Top Contributors</h3>
              <Link to="/leaderboard" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                View Leaderboard
              </Link>
            </div>

            <div className="space-y-2.5">
              {topContributors.map((contrib, idx) => (
                <div key={contrib._id} className="flex items-center justify-between p-2 rounded-xl border border-gray-50 dark:border-slate-850 bg-slate-50/30 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-bold text-[10px] text-gray-405 w-4">{idx + 1}</span>
                    <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                      {contrib.name.substring(0, 2)}
                    </div>
                    <span className="font-bold text-gray-800 dark:text-slate-200 truncate">{contrib.name}</span>
                  </div>
                  <span className="font-extrabold text-gray-900 dark:text-white text-[10px]">{contrib.points} pts</span>
                </div>
              ))}

              {/* Current user rank indicator at the bottom */}
              {userLeaderboardInfo && rank > 3 && (
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-[#0c231a] text-xs mt-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-black text-[10px] text-emerald-650 dark:text-emerald-400 w-4">{rank}</span>
                    <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                      {userLeaderboardInfo.name.substring(0, 2)}
                    </div>
                    <span className="font-black text-emerald-850 dark:text-emerald-400 truncate">{userLeaderboardInfo.name} (You)</span>
                  </div>
                  <span className="font-black text-emerald-700 dark:text-emerald-400 text-[10px]">{userLeaderboardInfo.points} pts</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Section: Community Impact Metrics Footer */}
      <div className="glass rounded-3xl p-6 border border-gray-150/40 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl shadow-inner">
            <Leaf size={24} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Community Impact</h4>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Keep going! Your efforts are making a real difference.</p>
          </div>
        </div>

        <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50/50 dark:bg-slate-850/20 p-3 rounded-2xl text-center border border-gray-100/60 dark:border-slate-800/40">
            <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest">CO2 Reduced</span>
            <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 font-sans">
              {(resolvedCount * 3.5).toFixed(1)} kg
            </span>
          </div>
          <div className="bg-slate-50/50 dark:bg-slate-850/20 p-3 rounded-2xl text-center border border-gray-100/60 dark:border-slate-800/40">
            <span className="block text-[8px] font-bold text-gray-405 uppercase tracking-widest">Issues Resolved</span>
            <span className="block text-lg font-black text-blue-650 dark:text-blue-400 mt-1 font-sans">
              {resolvedCount}
            </span>
          </div>
          <div className="bg-slate-50/50 dark:bg-slate-850/20 p-3 rounded-2xl text-center border border-gray-100/60 dark:border-slate-800/40">
            <span className="block text-[8px] font-bold text-gray-405 uppercase tracking-widest">People Helped</span>
            <span className="block text-lg font-black text-amber-550 dark:text-amber-400 mt-1 font-sans">
              {resolvedCount * 18}
            </span>
          </div>
          <div className="bg-slate-50/50 dark:bg-slate-850/20 p-3 rounded-2xl text-center border border-gray-100/60 dark:border-slate-800/40">
            <span className="block text-[8px] font-bold text-gray-405 uppercase tracking-widest">Communities</span>
            <span className="block text-lg font-black text-purple-650 dark:text-purple-405 mt-1 font-sans">
              {new Set(myIssues.map(i => i.location?.address?.split(',').slice(-2, -1)[0]?.trim())).size || 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
