import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { ShieldCheck, Check, X, MapPin, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

const VerifyIssues = () => {
  const { token, user, updateUser } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const fetchVerifyIssues = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/issues`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Show issues in Reported state waiting verification
        const unverified = data.filter(i => i.status === 'Reported');
        setIssues(unverified);
      }
    } catch (err) {
      console.error('Failed to load verify list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchVerifyIssues();
  }, [token]);

  const handleVerify = async (issueId, status) => {
    setActioningId(issueId);
    try {
      const response = await fetch(`${API_BASE_URL}/issues/${issueId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          comments: 'Community verified via volunteer dashboard'
        })
      });

      if (response.ok) {
        alert(`Successfully ${status.toLowerCase()}ed! You earned +5 points.`);
        
        // Fetch latest profile from server to get updated points and badges
        fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(profile => {
          updateUser(profile);
        })
        .catch(err => console.error('Failed to sync profile after verify:', err));
        
        // Trigger verification confetti
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });

        setIssues(prev => prev.filter(i => i._id !== issueId));
        refreshNotifications();
        fetchVerifyIssues();
      }
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass rounded-2xl p-6 shadow-sm flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Verify Issues</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">Help validate reported infrastructure grievances to prevent fake or duplicate complaints.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-xs text-gray-400 animate-pulse py-8">Loading pending verifications...</div>
      ) : issues.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-xs text-gray-400 font-medium">
          No pending issues require verification at this moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issues.map(issue => (
            <div key={issue._id} className="glass rounded-3xl p-5 shadow-sm border border-gray-150/40 dark:border-slate-800/40 flex flex-col justify-between h-48">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-gray-900 dark:text-white truncate">{issue.title}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[8px] font-extrabold uppercase tracking-wide shrink-0">
                    {issue.category}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{issue.description}</p>
                <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-2">
                  <MapPin size={10} className="text-gray-400" />
                  <span className="truncate">{issue.location?.address}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 dark:border-slate-800/60 pt-3 flex items-center justify-between">
                <span className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-0.5">
                  <Calendar size={10} />
                  {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerify(issue._id, 'Verify')}
                    disabled={actioningId === issue._id}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Check size={12} />
                    Verify
                  </button>
                  <button
                    onClick={() => handleVerify(issue._id, 'Reject')}
                    disabled={actioningId === issue._id}
                    className="px-2.5 py-1.5 border border-red-200 dark:border-red-800 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <X size={12} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerifyIssues;
