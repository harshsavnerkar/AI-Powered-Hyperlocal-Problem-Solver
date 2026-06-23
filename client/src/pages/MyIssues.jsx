import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { MapPin, Calendar, CheckSquare } from 'lucide-react';

const MyIssues = () => {
  const { token, user } = useAuth();
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
          const mine = data.filter(i => {
            const reporterId = typeof i.reportedBy === 'object' ? i.reportedBy?._id : i.reportedBy;
            return reporterId === user?._id;
          });
          setIssues(mine);
        }
      } catch (err) {
        console.error('Failed to load my issues:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadIssues();
  }, [token, user]);

  const statusColors = {
    Reported: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    Verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
    Assigned: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
    Resolved: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass rounded-2xl p-6 shadow-sm flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
          <CheckSquare size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Reported Issues</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Track status progressions from verification to final division resolution.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-xs text-gray-400 animate-pulse py-8">Loading reported issues...</div>
      ) : issues.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-xs text-gray-400 font-medium shadow-sm">
          You haven't reported any neighborhood issues yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issues.map(issue => (
            <div key={issue._id} className="glass rounded-3xl p-5 shadow-sm border border-gray-150/40 dark:border-slate-800/40 flex gap-4">
              <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                {issue.media?.imageUrl ? (
                  <img src={`${API_BASE_URL.replace('/api', '')}${issue.media.imageUrl}`} alt="" className="h-full w-full object-cover" />
                ) : (
                  issue.category === 'Pothole' ? '🕳️' :
                  issue.category === 'Garbage' ? '🗑️' :
                  issue.category === 'Water Leakage' ? '💧' :
                  issue.category === 'Streetlight' ? '💡' : '⚠️'
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-gray-900 dark:text-white truncate">{issue.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shrink-0 ${statusColors[issue.status]}`}>
                      {issue.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 truncate">{issue.description}</p>
                </div>
                <div className="flex items-center justify-between text-[9px] text-gray-400 mt-2">
                  <span className="flex items-center gap-0.5 truncate max-w-[120px]"><MapPin size={10} /> {issue.location?.address}</span>
                  <span className="flex items-center gap-0.5"><Calendar size={10} /> {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIssues;
