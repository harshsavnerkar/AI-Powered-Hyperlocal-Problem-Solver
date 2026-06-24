import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { TrendingUp, RefreshCw, Layers, Clock, AlertOctagon } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';

const Analytics = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState({ totalIssues: 0, pendingIssues: 0, inProgressIssues: 0, resolvedIssues: 0, avgResolutionTime: '0 hrs' });
  const [charts, setCharts] = useState({ issuesByCategory: [], statusOverview: [], monthlyTrends: [], heatmapData: [], verificationStats: [] });
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Analytics geolocation failed:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (charts.heatmapData && charts.heatmapData.length > 0 && mapCenter[0] === 28.6139 && mapCenter[1] === 77.2090) {
      const firstItem = charts.heatmapData[0];
      if (firstItem && firstItem.latitude && firstItem.longitude) {
        setMapCenter([firstItem.latitude, firstItem.longitude]);
      }
    }
  }, [charts.heatmapData, mapCenter]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setCharts(data.charts);
      }
    } catch (err) {
      console.error('Failed to load analytics page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAnalytics();
  }, [token]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b'];

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Computing charts & analytics data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Title / Refresh */}
      <div className="flex justify-between items-center glass rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Authority Analytics</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Detailed graphs indicating category spreads, resolution rate trends, and hot spots.</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer text-gray-700 dark:text-slate-200"
        >
          <RefreshCw size={14} />
          Refresh Stats
        </button>
      </div>

      {/* Grid: 6 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Issues by Category */}
        <div className="glass rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-extrabold text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">1. Issues by Category (Pie Chart)</h3>
          <div className="h-64 flex items-center">
            <div className="h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.issuesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
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
            <div className="w-1/3 text-xs space-y-1.5 font-medium shrink-0 max-h-56 overflow-y-auto">
              {charts.issuesByCategory.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-1.5 truncate">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-gray-500 dark:text-slate-400 truncate">{entry.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Monthly Issue Trends */}
        <div className="glass rounded-2xl p-6 shadow-sm">
          <h3 className="font-extrabold text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">2. Monthly Issue Trends (Line Chart)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Resolution Rate */}
        <div className="glass rounded-2xl p-6 shadow-sm">
          <h3 className="font-extrabold text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">3. Resolution Rate (Bar Chart)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.statusOverview}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Verification Statistics */}
        <div className="glass rounded-2xl p-6 shadow-sm">
          <h3 className="font-extrabold text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">4. Verification Statistics (Area Chart)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.verificationStats}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Area-wise Distribution Map */}
        <div className="glass rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-extrabold text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">5. Area-wise Distribution Map</h3>
          <div className="h-64 rounded-xl border border-gray-150 dark:border-slate-800/80 overflow-hidden relative shadow-sm">
            <MapContainer center={mapCenter} zoom={13} key={`${mapCenter[0]}-${mapCenter[1]}`} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {charts.heatmapData?.map((item, idx) => (
                <CircleMarker
                  key={idx}
                  center={[item.latitude, item.longitude]}
                  radius={12}
                  fillColor="#ef4444"
                  color="#ef4444"
                  weight={1.5}
                  fillOpacity={0.4}
                />
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Chart 6: Average Resolution Time Line */}
        <div className="glass rounded-2xl p-6 shadow-sm">
          <h3 className="font-extrabold text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">6. Average Resolution Time (Trend Line)</h3>
          <div className="h-64 flex flex-col justify-between">
            <div className="flex items-center gap-6 border-b border-gray-100 dark:border-slate-800/60 pb-3">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Avg Resolution Time</span>
                <span className="block text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{metrics.avgResolutionTime}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Trend Accuracy</span>
                <span className="block text-2xl font-extrabold text-emerald-500 mt-0.5">+4.5%</span>
              </div>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.monthlyTrends}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2.5} dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
