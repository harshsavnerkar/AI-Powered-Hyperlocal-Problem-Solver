import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { Award, User, Phone, Mail, Clock, Trophy, MapPin, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyActivities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/issues`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Filter issues reported by me
          const mine = data.filter(i => {
            const id = typeof i.reportedBy === 'object' ? i.reportedBy?._id : i.reportedBy;
            return id === user?._id;
          });
          setActivities(mine);
        }
      } catch (err) {
        console.error('Failed to load user profile activities:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token && user) loadMyActivities();
  }, [token, user]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upper Card: Profile Summary */}
      <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl border-4 border-white dark:border-slate-800">
          {user.name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <span className="inline-block self-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wide">
              {user.role}
            </span>
          </div>
          
          {/* User coordinates info */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-gray-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
            <span className="flex items-center gap-1"><Phone size={14} /> {user.phone}</span>
          </div>
        </div>
        
        {/* Points box */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/40 rounded-2xl text-center shrink-0 min-w-[120px]">
          <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Points</span>
          <span className="block text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1 font-sans">{user.points || 0}</span>
        </div>
      </div>

      {/* Grid: Badges & Activities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Achievements & Badges */}
        <div className="glass rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800/60 pb-3">
            <Trophy size={18} className="text-emerald-500" />
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">My Badges</h3>
          </div>
          
          <div className="space-y-4">
            {user.badges?.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No badges unlocked yet. Start reporting to earn them!</p>
            ) : (
              user.badges?.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 border border-gray-100 dark:border-slate-800/50 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-slate-800/25">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md">
                    <Award size={18} />
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-gray-900 dark:text-white">{badge}</span>
                    <span className="block text-[8px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase mt-0.5">Unlocked Badge</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Activity log history */}
        <div className="md:col-span-2 glass rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800/60 pb-3">
            <Clock size={18} className="text-emerald-500" />
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Report History</h3>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-xs text-gray-400 animate-pulse py-8">Loading history...</div>
            ) : activities.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">You haven't reported any issues yet.</p>
            ) : (
              activities.map((item) => (
                <div key={item._id} className="p-4 border border-gray-100 dark:border-slate-800/60 rounded-2xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="block font-bold text-xs text-gray-900 dark:text-white truncate">{item.title}</span>
                    <span className="block text-[9px] text-gray-450 mt-1 flex items-center gap-0.5"><MapPin size={9} /> {item.location?.address}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide shrink-0 ${
                    item.status === 'Resolved' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
