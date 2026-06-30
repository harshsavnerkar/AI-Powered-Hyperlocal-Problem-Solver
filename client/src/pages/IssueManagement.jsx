import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { Check, Edit, UserPlus, AlertCircle, RefreshCw } from 'lucide-react';

const IssueManagement = () => {
  const { token } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Assignment State
  const [assigningIssueId, setAssigningIssueId] = useState(null);
  const [assignedTeam, setAssignedTeam] = useState('');
  
  const teamsList = [
    'Public Works Division (PWD)',
    'Municipal Corporation (MCD)',
    'Electricity Supply Dept',
    'Water and Sewage Board',
    'Traffic Police Division'
  ];

  const fetchIssues = async () => {
    setLoading(true);
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
      console.error('Failed to load issues for management:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchIssues();
  }, [token]);

  const handleAssign = async (issueId) => {
    if (!assignedTeam) {
      alert('Please select a team to assign.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'Assigned',
          assignedTeam
        })
      });

      if (response.ok) {
        alert('Issue successfully assigned to: ' + assignedTeam);
        setAssigningIssueId(null);
        setAssignedTeam('');
        fetchIssues();
        refreshNotifications();
      }
    } catch (err) {
      console.error('Failed to assign team:', err);
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        alert(`Issue status successfully updated to: ${newStatus}`);
        fetchIssues();
        refreshNotifications();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Filters
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location?.address?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const priorityColors = {
    Low: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400',
    High: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400',
    Critical: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/30'
  };

  const statusColors = {
    Reported: 'bg-gray-100 text-gray-800 dark:bg-gray-855 dark:text-gray-300',
    Verified: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400',
    Assigned: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
    Resolved: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400'
  };

  return (
    <div className="space-y-6">
      {/* Title / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass rounded-2xl p-6 shadow-sm">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search issue or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full max-w-sm px-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none shadow-sm font-bold"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Verified">Verified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button 
            onClick={fetchIssues} 
            className="p-2 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm cursor-pointer text-gray-500 dark:text-slate-400"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table grid */}
      <div className="glass rounded-2xl p-6 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading board data...</div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 font-medium">No complaints match your search query.</div>
        ) : (
          <>
            {/* Desktop view: table */}
            <table className="hidden md:table w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-3 pr-4">Issue</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Trust Score</th>
                  <th className="py-3 px-4">Assigned Team</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
                {filteredIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50/20 dark:hover:bg-slate-800/10">
                    {/* Issue column */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                          {issue.media?.imageUrl ? (
                            <img 
                              src={issue.media.imageUrl.startsWith('http') ? issue.media.imageUrl : `${API_BASE_URL.replace('/api', '')}${issue.media.imageUrl}`} 
                              alt="" 
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
                        <div>
                          <span className="block font-bold text-gray-900 dark:text-white leading-tight">{issue.title}</span>
                          <span className="block text-[10px] text-gray-400 mt-0.5">{issue.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Location address */}
                    <td className="py-4 px-4 text-gray-500 dark:text-slate-400 max-w-[150px] truncate">
                      {issue.location?.address}
                    </td>

                    {/* Priority color badge */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${priorityColors[issue.priority]}`}>
                        {issue.priority}
                      </span>
                    </td>

                    {/* Status tag */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${statusColors[issue.status]}`}>
                        {issue.status}
                      </span>
                    </td>

                    {/* Trust Score */}
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${
                        issue.trustScore >= 80 ? 'text-emerald-500' :
                        issue.trustScore >= 50 ? 'text-yellow-500' : 'text-gray-400'
                      }`}>{issue.trustScore}%</span>
                    </td>

                    {/* Assigned Team */}
                    <td className="py-4 px-4 text-gray-600 dark:text-slate-355 font-medium">
                      {assigningIssueId === issue._id ? (
                        <div className="flex items-center gap-1.5 min-w-[200px]">
                          <select
                            value={assignedTeam}
                            onChange={(e) => setAssignedTeam(e.target.value)}
                            className="px-2 py-1 text-[10px] rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none"
                          >
                            <option value="">Select Team</option>
                            {teamsList.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <button
                            onClick={() => handleAssign(issue._id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <span>{issue.assignedTeam || 'Unassigned'}</span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Assign team trigger */}
                        {issue.status !== 'Resolved' && (
                          <button
                            onClick={() => {
                              setAssigningIssueId(issue._id);
                              setAssignedTeam(issue.assignedTeam || '');
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Assign team"
                          >
                            <UserPlus size={14} />
                          </button>
                        )}

                        {/* In Progress state trigger */}
                        {issue.status === 'Assigned' && (
                          <button
                            onClick={() => handleStatusChange(issue._id, 'In Progress')}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-650 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Mark In Progress"
                          >
                            <Edit size={14} />
                          </button>
                        )}

                        {/* Resolve trigger */}
                        {issue.status !== 'Resolved' && (
                          <button
                            onClick={() => handleStatusChange(issue._id, 'Resolved')}
                            className="p-1.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Mark Resolved"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile view: list of cards */}
            <div className="block md:hidden space-y-4">
              {filteredIssues.map((issue) => (
                <div key={issue._id} className="p-4 border border-gray-100 dark:border-slate-800/80 rounded-2xl space-y-3 bg-white/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                      {issue.media?.imageUrl ? (
                        <img 
                          src={issue.media.imageUrl.startsWith('http') ? issue.media.imageUrl : `${API_BASE_URL.replace('/api', '')}${issue.media.imageUrl}`} 
                          alt="" 
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
                    <div className="min-w-0 flex-1">
                      <span className="block font-bold text-xs text-gray-900 dark:text-white leading-tight truncate">{issue.title}</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">{issue.category}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 space-y-1">
                    <div><span className="font-semibold text-gray-400 uppercase text-[9px] tracking-wide">Location:</span> {issue.location?.address}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${priorityColors[issue.priority]}`}>{issue.priority}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${statusColors[issue.status]}`}>{issue.status}</span>
                      <span className="text-[10px] font-bold text-emerald-500 ml-auto">Trust: {issue.trustScore}%</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                    <div className="text-[11px] font-medium text-gray-600 dark:text-slate-355">
                      {assigningIssueId === issue._id ? (
                        <div className="flex items-center gap-1.5 min-w-[150px]">
                          <select
                            value={assignedTeam}
                            onChange={(e) => setAssignedTeam(e.target.value)}
                            className="px-2 py-1 text-[10px] rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none"
                          >
                            <option value="">Select Team</option>
                            {teamsList.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <button
                            onClick={() => handleAssign(issue._id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <span>Team: {issue.assignedTeam || 'Unassigned'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {issue.status !== 'Resolved' && (
                        <button
                          onClick={() => {
                            setAssigningIssueId(issue._id);
                            setAssignedTeam(issue.assignedTeam || '');
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Assign team"
                        >
                          <UserPlus size={14} />
                        </button>
                      )}
                      {issue.status === 'Assigned' && (
                        <button
                          onClick={() => handleStatusChange(issue._id, 'In Progress')}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-650 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Mark In Progress"
                        >
                          <Edit size={14} />
                        </button>
                      )}
                      {issue.status !== 'Resolved' && (
                        <button
                          onClick={() => handleStatusChange(issue._id, 'Resolved')}
                          className="p-1.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Mark Resolved"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IssueManagement;
