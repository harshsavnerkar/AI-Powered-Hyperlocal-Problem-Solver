import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { Heart, MessageSquare, Share2, Rss, MapPin, AlertCircle, Send } from 'lucide-react';

const CommunityFeed = () => {
  const { token, user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comments interaction states
  const [expandedComments, setExpandedComments] = useState({}); // issueId -> boolean
  const [newCommentText, setNewCommentText] = useState({}); // issueId -> string
  const [submittingComment, setSubmittingComment] = useState({}); // issueId -> boolean

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

  useEffect(() => {
    if (token) {
      loadIssues();
      // Setup periodic polling to keep feed realtime
      const interval = setInterval(loadIssues, 8000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleLike = async (issueId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/issues/${issueId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json(); // { likes }
        setIssues(prev => prev.map(issue => {
          if (issue._id === issueId) {
            return { ...issue, likes: result.likes };
          }
          return issue;
        }));
      }
    } catch (err) {
      console.error('Failed to like issue:', err);
    }
  };

  const handleCommentSubmit = async (e, issueId) => {
    e.preventDefault();
    const text = newCommentText[issueId];
    if (!text || !text.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [issueId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/issues/${issueId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      if (response.ok) {
        const result = await response.json(); // { comments }
        setIssues(prev => prev.map(issue => {
          if (issue._id === issueId) {
            return { ...issue, comments: result.comments };
          }
          return issue;
        }));
        setNewCommentText(prev => ({ ...prev, [issueId]: '' }));
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [issueId]: false }));
    }
  };

  const toggleComments = (issueId) => {
    setExpandedComments(prev => ({ ...prev, [issueId]: !prev[issueId] }));
  };

  const handleShare = (issue) => {
    if (navigator.share) {
      navigator.share({
        title: issue.title,
        text: issue.description,
        url: window.location.href
      }).catch(err => console.error(err));
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/dashboard`);
      alert('📢 Dashboard link copied to clipboard!');
    }
  };

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
            const likesCount = issue.likes ? issue.likes.length : 0;
            const commentsCount = issue.comments ? issue.comments.length : 0;
            const hasLiked = issue.likes && user ? issue.likes.includes(user._id) : false;
            
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
                        src={issue.media.imageUrl.startsWith('http') ? issue.media.imageUrl : `${API_BASE_URL.replace('/api', '')}${issue.media.imageUrl}`} 
                        alt="Issue reported" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.parentNode.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Interaction elements */}
                <div className="flex items-center gap-6 border-t border-gray-100 dark:border-slate-800/60 pt-4 text-xs font-bold text-gray-400">
                  <button 
                    onClick={() => handleLike(issue._id)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      hasLiked ? 'text-rose-500 hover:text-rose-600' : 'hover:text-emerald-500'
                    }`}
                  >
                    <Heart size={16} fill={hasLiked ? 'currentColor' : 'none'} />
                    <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                  </button>
                  <button 
                    onClick={() => toggleComments(issue._id)}
                    className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    <MessageSquare size={16} />
                    <span>{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</span>
                  </button>
                  <button 
                    onClick={() => handleShare(issue)}
                    className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer ml-auto"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>

                {/* Expanded Comments Drawer */}
                {expandedComments[issue._id] && (
                  <div className="mt-4 border-t border-gray-50 dark:border-slate-800/40 pt-4 space-y-4 animate-in fade-in duration-200">
                    {/* List of comments */}
                    {issue.comments && issue.comments.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {issue.comments.map((comment, index) => (
                          <div key={comment._id || index} className="flex gap-2.5 items-start text-xs bg-slate-50 dark:bg-slate-850/50 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800/30">
                            <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                              {comment.userName ? comment.userName.substring(0, 2) : 'US'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-800 dark:text-slate-200">{comment.userName || 'User'}</span>
                                <span className="text-[8px] text-gray-400">
                                  {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                                </span>
                              </div>
                              <p className="text-gray-655 dark:text-slate-350 mt-0.5 leading-relaxed">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-[10px] text-gray-400 py-2">No comments yet. Start the conversation!</p>
                    )}

                    {/* New Comment Input Form */}
                    <form onSubmit={(e) => handleCommentSubmit(e, issue._id)} className="flex items-center gap-2">
                      <input 
                        type="text"
                        placeholder="Write a comment..."
                        value={newCommentText[issue._id] || ''}
                        onChange={(e) => setNewCommentText(prev => ({ ...prev, [issue._id]: e.target.value }))}
                        className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner"
                      />
                      <button 
                        type="submit"
                        disabled={submittingComment[issue._id] || !newCommentText[issue._id]?.trim()}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl shadow-md cursor-pointer transition-colors"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
