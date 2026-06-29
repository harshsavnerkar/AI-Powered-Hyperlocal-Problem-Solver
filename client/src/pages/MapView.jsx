import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { AlertCircle, Calendar, ShieldCheck, MapPin } from 'lucide-react';

const MapView = () => {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);

  // Geolocation & Routing States
  const [userLocation, setUserLocation] = useState(null);
  const [routePath, setRoutePath] = useState(null);
  const [routingTo, setRoutingTo] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setMapCenter([lat, lon]);
          setUserLocation([lat, lon]);
        },
        (error) => {
          console.warn('Geolocation failed:', error);
          // Set standard Delhi mock coordinates as default fallback location
          setUserLocation([28.6139, 77.2090]);
        }
      );
    } else {
      setUserLocation([28.6139, 77.2090]);
    }
  }, []);

  useEffect(() => {
    if (issues.length > 0 && mapCenter[0] === 28.6139 && mapCenter[1] === 77.2090) {
      const issueWithCoords = issues.find(i => i.location?.latitude && i.location?.longitude);
      if (issueWithCoords) {
        setMapCenter([issueWithCoords.location.latitude, issueWithCoords.location.longitude]);
      }
    }
  }, [issues, mapCenter]);

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

  // Create pulsing user marker DivIcon
  const createUserIcon = () => {
    return L.divIcon({
      className: 'user-marker-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute h-8 w-8 rounded-full bg-blue-500 opacity-20 animate-ping"></div>
          <div class="h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-md relative z-10"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  // Fetch walking path from Open Source Routing Machine (OSRM)
  const handleGetRoute = async (issue) => {
    if (!userLocation) {
      alert('Unable to determine your location. Please check browser permissions.');
      return;
    }
    
    setRoutingLoading(true);
    try {
      const userLat = userLocation[0];
      const userLon = userLocation[1];
      const issueLat = issue.location.latitude;
      const issueLon = issue.location.longitude;

      const url = `https://router.project-osrm.org/route/v1/walking/${userLon},${userLat};${issueLon},${issueLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch route');
      
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // [lat, lon]
        setRoutePath(coords);
        setRoutingTo(issue);
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(2), // km
          duration: Math.round(route.duration / 60) // minutes
        });
      } else {
        alert('No walking route path could be found to this issue.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to calculate walking directions. Please try again.');
    } finally {
      setRoutingLoading(false);
    }
  };

  const handleClearRoute = () => {
    setRoutePath(null);
    setRoutingTo(null);
    setRouteInfo(null);
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

      {/* Floating Directions Panel */}
      {routingTo && routeInfo && (
        <div className="absolute top-5 right-5 bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl border border-gray-250/50 dark:border-slate-800/80 shadow-2xl z-20 max-w-xs text-xs space-y-3 font-sans transition-all">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="block text-[8px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider">
                Walking Directions
              </span>
              <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[160px]">
                {routingTo.title}
              </h4>
            </div>
            <button
              onClick={handleClearRoute}
              className="text-gray-400 hover:text-gray-650 dark:hover:text-white text-xs font-bold cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-950 p-2.5 rounded-xl border border-gray-150/40 dark:border-slate-800/40">
            <div>
              <span className="block text-[8px] text-gray-400 uppercase tracking-widest">Distance</span>
              <span className="font-extrabold text-sm text-gray-900 dark:text-white font-sans">{routeInfo.distance} km</span>
            </div>
            <div className="h-6 border-r border-gray-200 dark:border-slate-800" />
            <div>
              <span className="block text-[8px] text-gray-400 uppercase tracking-widest">Est. Time</span>
              <span className="font-extrabold text-sm text-gray-900 dark:text-white font-sans">{routeInfo.duration} mins</span>
            </div>
          </div>
        </div>
      )}

      <MapContainer center={mapCenter} zoom={14} key={`${mapCenter[0]}-${mapCenter[1]}`} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={darkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />

        {/* User Current Location Pulse Dot */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup>
              <div className="text-center font-bold text-xs text-blue-600">You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline Path */}
        {routePath && (
          <Polyline 
            positions={routePath} 
            color="#10b981" 
            weight={4} 
            dashArray="6, 6" 
          />
        )}

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
                        src={issue.media.imageUrl.startsWith('http') ? issue.media.imageUrl : `${API_BASE_URL.replace('/api', '')}${issue.media.imageUrl}`} 
                        alt={issue.title} 
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          e.target.parentNode.style.display = 'none';
                        }}
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
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-650 text-[8px] font-bold uppercase tracking-wider">
                      {issue.status}
                    </span>
                  </div>
                  
                  {/* Get walking directions route button */}
                  {userLocation && (
                    <button
                      disabled={routingLoading}
                      onClick={() => handleGetRoute(issue)}
                      className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-450 text-white font-bold text-[9px] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <MapPin size={9} />
                      {routingLoading ? 'Calculating...' : 'Get Directions'}
                    </button>
                  )}
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
