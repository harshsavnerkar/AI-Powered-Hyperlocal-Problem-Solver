import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { AlertCircle, Calendar, ShieldCheck, MapPin } from 'lucide-react';

const MapView = () => {
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
        console.error('Failed to load issues for map:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadIssues();
  }, [token]);

  // Priority color map helper
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#ef4444'; // red
      case 'High': return '#f97316'; // orange
      case 'Medium': return '#eab308'; // yellow
      case 'Low': return '#22c55e'; // green
      default: return '#64748b';
    }
  };

  // Create DivIcon matching priority colors
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

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading Map coordinates...</div>;
  }

  return (
    <div className="h-[calc(100vh-130px)] rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden relative shadow-md">
      {/* Map legend overlay */}
      <div className="absolute bottom-5 left-5 bg-white/95 dark:bg-slate-900/95 px-4 py-3 rounded-2xl border border-gray-250/50 dark:border-slate-800/80 text-xs font-bold flex flex-col gap-2 shadow-xl z-20 transition-all select-none">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800/60 pb-1 mb-1">Priority Legend</span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500 inline-block" /> Critical</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-orange-500 inline-block" /> High</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-yellow-500 inline-block" /> Medium</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500 inline-block" /> Low</span>
        </div>
      </div>

      <MapContainer center={[28.6139, 77.2090]} zoom={14} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {issues.map((issue) => {
          if (!issue.location?.latitude || !issue.location?.longitude) return null;
          return (
            <Marker 
              key={issue._id} 
              position={[issue.location.latitude, issue.location.longitude]} 
              icon={createCustomMarker(issue.priority)}
            >
              <Popup className="leaflet-popup-custom">
                <div className="p-1 font-sans space-y-2 w-48 text-xs">
                  {issue.media?.imageUrl && (
                    <div className="h-20 w-full rounded-lg bg-gray-50 overflow-hidden mb-1 border border-gray-100">
                      <img 
                        src={`${API_BASE_URL.replace('/api', '')}${issue.media.imageUrl}`} 
                        alt={issue.title} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  )}
                  <div>
                    <span className="block font-bold text-gray-900 leading-snug">{issue.title}</span>
                    <span className="block text-[9px] text-gray-400 flex items-center gap-0.5 mt-0.5"><MapPin size={9} /> {issue.location?.address}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <span 
                      style={{ backgroundColor: getPriorityColor(issue.priority) + '15', color: getPriorityColor(issue.priority) }} 
                      className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border"
                    >
                      {issue.priority}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[8px] font-bold uppercase tracking-wider">
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
  );
};

export default MapView;
