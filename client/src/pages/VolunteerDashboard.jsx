import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { 
  Check, 
  X, 
  MapPin, 
  Award, 
  ShieldCheck, 
  TrendingUp, 
  Info,
  ArrowUpRight
} from 'lucide-react';

const VolunteerDashboard = () => {
  const { user, token, updateUserPoints } = useAuth();
  const { refreshNotifications } = useNotifications();
  const navigate = useNavigate();
  
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [userCoords, setUserCoords] = useState({ latitude: 28.6139, longitude: 77.2090 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Volunteer Geolocation fallback:', error.message);
        }
      );
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get nearby issues (radius 2km, default coordinate New Delhi)
      const nearbyRes = await fetch(`${API_BASE_URL}/issues/nearby?latitude=${userCoords.latitude}&longitude=${userCoords.longitude}&radius=2000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const leaderRes = await fetch(`${API_BASE_URL}/auth/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (nearbyRes.ok && leaderRes.ok) {
        const nearbyData = await nearbyRes.json();
        const leaderData = await leaderRes.json();
        
        // Filter out issues that the volunteer already verified
        const unresolvedReported = nearbyData.filter(i => i.status === 'Reported');
        setNearbyIssues(unresolvedReported);
        setLeaderboard(leaderData);
      }
    } catch (err) {
      console.error('Failed to load volunteer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, userCoords]);

  const handleVerifyAction = async (issueId, status) => {
    setActioningId(issueId);
    try {
      const response = await fetch(`${API_BASE_URL}/issues/${issueId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status, // 'Verify' or 'Reject'
          comments: `Validated by Volunteer (${user.name})`
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Issue successfully ${status.toLowerCase()}ed! You earned +5 points.`);
        
        // Update user state dynamically (add +5 points)
        updateUserPoints(user.points + 5, user.badges);
        
        // Refresh local issues
        setNearbyIssues(prev => prev.filter(i => i._id !== issueId));
        refreshNotifications();
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit validation');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setActioningId(null);
    }
  };

  const verifiedCount = user?.points ? Math.floor(user.points / 5) : 0;
  const accuracy = user?.points ? 92 : 100;
  const points = user?.points !== undefined ? user.points : 0;
  const rank = user?.rank !== undefined ? user.rank : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Block */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome, Volunteer! 🤝</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Your verification helps build a stronger community. Review and validate nearby issues below.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-blue-500 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Issues Verified</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">{verifiedCount}</span>
        </div>
        {/* Metric 2 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-emerald-500 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Accuracy Score</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">{accuracy}%</span>
        </div>
        {/* Metric 3 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-amber-500 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Points Earned</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">{points}</span>
        </div>
        {/* Metric 4 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-violet-500 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Current Rank</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">
            {rank > 0 ? (
              <>
                {rank} <span className="text-xs font-medium text-gray-400">of 150</span>
              </>
            ) : (
              'Unranked'
            )}
          </span>
        </div>
      </div>

      {/* Grid Layout: Left - Nearby, Right - How it works & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Nearby Issues List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Nearby Issues</h3>
              <Link to="/map-view" className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
                View on Map
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading nearby issues...</div>
            ) : nearbyIssues.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400 dark:text-slate-500 font-medium">
                No new issues nearby that require verification. Check back later!
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyIssues.map((issue) => (
                  <div 
                    key={issue._id} 
                    className="p-4 border border-gray-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 transition-all hover:bg-gray-50/20 dark:hover:bg-slate-800/10"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                        {issue.media?.imageUrl ? (
                          <img src={`${API_BASE_URL.replace('/api', '')}${issue.media.imageUrl}`} alt={issue.title} className="h-full w-full object-cover" />
                        ) : (
                          issue.category === 'Pothole' ? '🕳️' :
                          issue.category === 'Garbage' ? '🗑️' :
                          issue.category === 'Water Leakage' ? '💧' :
                          issue.category === 'Streetlight' ? '💡' : '⚠️'
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block font-bold text-sm text-gray-900 dark:text-white truncate">{issue.title}</span>
                        <p className="text-xs text-gray-400 dark:text-slate-400 truncate mt-0.5">{issue.location?.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center text-[10px] font-bold text-gray-400 gap-0.5">
                            <MapPin size={10} className="text-blue-500" />
                            {issue.distance ? `${Math.round(issue.distance)} m` : '150 m'}
                          </span>
                          <span className="h-1 w-1 bg-gray-300 dark:bg-slate-700 rounded-full" />
                          <span className="text-[10px] text-gray-400">{new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ago</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Inline action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleVerifyAction(issue._id, 'Verify')}
                        disabled={actioningId === issue._id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <Check size={14} />
                        Verify
                      </button>
                      <button
                        onClick={() => handleVerifyAction(issue._id, 'Reject')}
                        disabled={actioningId === issue._id}
                        className="px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Steps & Leaderboard */}
        <div className="space-y-6">
          {/* How Verification Works */}
          <div className="glass rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-5">How Verification Works</h3>
            <div className="space-y-5">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Review Issue</h4>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Check coordinates, category, and reported image details.</p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Verify/Reject</h4>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Confirm the issue exists or reject if duplicate/fake.</p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Earn Points</h4>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Accumulate points, unlock badges, and rank up on leaderboard.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mini-Leaderboard */}
          <div className="glass rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-5">Leaderboard</h3>
            <div className="space-y-3.5">
              {leaderboard.slice(0, 3).map((item, idx) => (
                <div key={item._id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`font-extrabold text-xs h-5 w-5 rounded-full flex items-center justify-center ${
                      idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30' :
                      idx === 1 ? 'bg-slate-100 text-slate-700 dark:bg-slate-800/30' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-950/30'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-800 dark:text-slate-200">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{item.points} pts</span>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-gray-100 dark:border-slate-800 pt-4 text-center">
              <Link to="/leaderboard" className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center justify-center gap-0.5">
                View Full Leaderboard <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
