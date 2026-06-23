import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  FolderLock, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  MapPin,
  TrendingDown
} from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState({ totalIssues: 342, pendingIssues: 128, inProgressIssues: 76, resolvedIssues: 138, avgResolutionTime: '24 hrs' });
  const [charts, setCharts] = useState({ issuesByCategory: [], statusOverview: [], monthlyTrends: [], heatmapData: [] });
  const [aiInsights, setAiInsights] = useState({ hotspots: [], predictiveAlerts: [], risingCategories: [] });
  
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const issuesResponse = await fetch(`${API_BASE_URL}/issues`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok && issuesResponse.ok) {
          const data = await response.json();
          const issuesData = await issuesResponse.json();
          
          setMetrics(data.metrics);
          setCharts(data.charts);
          setAiInsights(data.aiInsights);
          setRecentIssues(issuesData.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAnalytics();
  }, [token]);

  // Color mappings
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b'];

  const priorityColors = {
    Low: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400',
    High: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400',
    Critical: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/30'
  };

  const statusColors = {
    Reported: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    Verified: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400',
    Assigned: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400',
    Resolved: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400'
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome, Admin ⚙️</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage and resolve community issues efficiently. Track metrics and predictive AI alerts below.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-gray-400 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Total Issues</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">{metrics.totalIssues}</span>
        </div>
        {/* Metric 2 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-red-500 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">{metrics.pendingIssues}</span>
        </div>
        {/* Metric 3 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-blue-500 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">In Progress</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">{metrics.inProgressIssues}</span>
        </div>
        {/* Metric 4 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-teal-500 shadow-sm">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Resolved</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">{metrics.resolvedIssues}</span>
        </div>
        {/* Metric 5 */}
        <div className="glass rounded-2xl p-5 border-l-4 border-violet-500 shadow-sm col-span-2 md:col-span-1">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Resolution</span>
          <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-sans">{metrics.avgResolutionTime}</span>
        </div>
      </div>

      {/* Main Grid: Heatmap Map & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap visual mock card */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-4">Issue Heatmap</h3>
            {/* Visual Canvas Heatmap */}
            <div className="h-64 bg-slate-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center p-4">
              {/* Mock map outline sketch */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ccc_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]" />
              <div className="absolute top-20 left-1/4 h-24 w-40 border border-gray-300 dark:border-slate-800 rounded-lg transform -rotate-12 border-dashed flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase">Sector 10</div>
              <div className="absolute bottom-12 right-1/4 h-24 w-40 border border-gray-300 dark:border-slate-800 rounded-lg transform rotate-6 border-dashed flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase">Sector 15</div>
              
              {/* Heat spots (matching visual mock circles!) */}
              <div className="absolute top-24 left-1/3 h-16 w-16 bg-red-500/30 dark:bg-red-500/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute top-28 left-[35%] h-6 w-6 bg-red-600 rounded-full border-2 border-white dark:border-slate-800 shadow" />
              
              <div className="absolute bottom-16 right-1/3 h-20 w-20 bg-red-500/30 dark:bg-red-500/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute bottom-20 right-[38%] h-6 w-6 bg-red-600 rounded-full border-2 border-white dark:border-slate-800 shadow" />

              <div className="absolute top-1/2 right-1/4 h-16 w-16 bg-yellow-500/30 dark:bg-yellow-500/20 rounded-full blur-xl" />
              <div className="absolute top-1/2 right-[27%] h-6 w-6 bg-yellow-500 rounded-full border-2 border-white dark:border-slate-800 shadow" />

              <div className="absolute bottom-1/3 left-1/4 h-16 w-16 bg-emerald-500/30 dark:bg-emerald-500/20 rounded-full blur-xl" />
              <div className="absolute bottom-1/3 left-[28%] h-6 w-6 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow" />

              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-800 text-[10px] font-bold flex items-center gap-4 shadow-md z-10">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-600 inline-block" /> High</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> Low</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link to="/map-view" className="text-xs text-violet-600 dark:text-violet-400 font-bold hover:underline">
              Open Interactive Map View
            </Link>
          </div>
        </div>

        {/* AI Insights panel */}
        <div className="glass rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-4">AI Insights</h3>
            
            {/* Surge Alerts lists */}
            <div className="space-y-4">
              {aiInsights.hotspots?.map((hotspot, idx) => (
                <div key={idx} className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/30 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-red-700 dark:text-red-400">🔥 Emerging Hotspot</span>
                    <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded font-bold uppercase">Critical</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {hotspot.message}
                  </p>
                </div>
              ))}

              {aiInsights.predictiveAlerts?.slice(0, 1).map((alert, idx) => (
                <div key={idx} className="p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/30 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-blue-700 dark:text-blue-400">🔮 Predictive Insight</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">Alert</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mini trend line chart inside AI insights */}
          <div className="mt-4 h-16 w-full opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyTrends || []}>
                <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issues by Category (Pie Chart) */}
        <div className="glass rounded-2xl p-6 shadow-sm">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-6">Issues by Category</h3>
          <div className="h-64 flex items-center">
            {charts.issuesByCategory?.length > 0 ? (
              <>
                <div className="h-full flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.issuesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {charts.issuesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Labels grid */}
                <div className="w-1/3 text-xs space-y-1.5 font-medium shrink-0 max-h-56 overflow-y-auto">
                  {charts.issuesByCategory.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 truncate">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-gray-500 dark:text-slate-400 truncate">{entry.name}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-gray-400 w-full">No category data.</div>
            )}
          </div>
        </div>

        {/* Status Overview (Bar Chart) */}
        <div className="glass rounded-2xl p-6 shadow-sm">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-6">Status Overview</h3>
          <div className="h-64">
            {charts.statusOverview?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={charts.statusOverview}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} barSize={40} />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-gray-400 w-full">No status data.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Issues Table list */}
      <div className="glass rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Recent Issues</h3>
          <Link to="/issue-management" className="text-xs text-violet-600 dark:text-violet-400 font-bold hover:underline">
            Manage All Issues
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading issues...</div>
        ) : recentIssues.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">No issues reported yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-3 pr-4">Issue</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
                {recentIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 pr-4 font-bold text-gray-900 dark:text-white">
                      {issue.title}
                      <span className="block text-[10px] text-gray-400 mt-0.5 font-normal">{issue.category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-slate-400 font-medium max-w-xs truncate">
                      {issue.location?.address}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${priorityColors[issue.priority]}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${statusColors[issue.status]}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <button 
                        onClick={() => navigate('/issue-management')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
