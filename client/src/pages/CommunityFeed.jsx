import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { Heart, MessageSquare, Share2, Rss, MapPin, AlertCircle } from 'lucide-react';

const CommunityFeed = () => {
  const { token } = useAuth();
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
        console.error('Failed to load feed:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadIssues();
  }, [token]);

  const mockInteractions = (id) => ({
    likes: (id.charCodeAt(0) || 5) % 15 + 2,
    comments: (id.charCodeAt(1) || 2) % 6 + 1
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div className="glass rounded-2xl p-6 shadow-sm flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
          <Rss size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Community Feed</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Stay updated on recent reports, validations, and resolution achievements in your city.</p>
        </div>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="text-center text-xs text-gray-400 animate-pulse py-8">Loading feed updates...</div>
      ) : issues.length === 0 ? (
        <div className="text-center text-xs text-gray-400 py-8">No community feed events.</div>
      ) : (
        <div className="space-y-6">
          {issues.map((issue) => {
            const stats = mockInteractions(issue._id);
            const reporterName = typeof issue.reportedBy === 'object' ? issue.reportedBy?.name : 'Aarav Sharma';
            const reporterRole = typeof issue.reportedBy === 'object' ? issue.reportedBy?.role : 'citizen';
            
            return (
              <div key={issue._id} className="glass rounded-3xl p-6 shadow-sm border border-gray-150/40 dark:border-slate-800/40 space-y-4">
                {/* Header card info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {reporterName.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-gray-900 dark:text-white leading-none">{reporterName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-extrabold uppercase tracking-wide">
                          {reporterRole}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 block">
                        {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                    issue.status === 'Resolved' ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400' :
                    issue.status === 'In Progress' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {issue.status}
                  </span>
                </div>

                {/* Body Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <AlertCircle size={10} />
                    {issue.category} Alert
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug">{issue.title}</h4>
                  <p className="text-xs text-gray-650 dark:text-slate-300 leading-relaxed">{issue.description}</p>
                  
                  {/* Location badge */}
                  <div className="flex items-center gap-1 text-[9px] text-gray-450 mt-1.5">
                    <MapPin size={10} className="text-gray-400" />
                    <span>{issue.location?.address}</span>
                  </div>
                  
                  {/* Image container */}
                  {issue.media?.imageUrl && (
                    <div className="mt-3 rounded-2xl border border-gray-100 dark:border-slate-800/80 max-h-72 overflow-hidden bg-gray-50 dark:bg-slate-900 shadow-inner flex items-center justify-center">
                      <img 
                        src={`${API_BASE_URL.replace('/api', '')}${issue.media.imageUrl}`} 
                        alt="Issue reported" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>

                {/* Footer Interaction elements */}
                <div className="flex items-center gap-6 border-t border-gray-100 dark:border-slate-800/60 pt-4 text-xs font-bold text-gray-400">
                  <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer">
                    <Heart size={16} />
                    <span>{stats.likes} Likes</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer">
                    <MessageSquare size={16} />
                    <span>{stats.comments} Comments</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer ml-auto">
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
