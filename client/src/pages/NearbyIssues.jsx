import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { MapPin, Navigation } from 'lucide-react';

const NearbyIssues = () => {
  const { token } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState({ latitude: 28.6139, longitude: 77.2090 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation fallback to default:', error.message);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    const loadNearby = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/issues/nearby?latitude=${userCoords.latitude}&longitude=${userCoords.longitude}&radius=3000`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setIssues(data);
        }
      } catch (err) {
        console.error('Failed to load nearby issues:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadNearby();
  }, [token, userCoords]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
            <Navigation size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nearby Community Issues</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">Showing reported issues within a 3km radius of your current location coordinates.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-xs text-gray-400 animate-pulse py-8">Loading neighborhood logs...</div>
      ) : issues.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-xs text-gray-400 font-medium">
          No complaints reported in your immediate vicinity.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {issues.map(issue => (
            <div key={issue._id} className="glass rounded-3xl p-5 shadow-sm border border-gray-150/40 dark:border-slate-800/40 flex flex-col justify-between h-48">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-[8px] font-extrabold uppercase tracking-wide">
                    {issue.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5"><MapPin size={10} /> {issue.distance ? `${Math.round(issue.distance)}m` : '200m'}</span>
                </div>
                <h4 className="font-extrabold text-xs text-gray-900 dark:text-white mt-3 truncate">{issue.title}</h4>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{issue.description}</p>
              </div>
              <div className="border-t border-gray-100 dark:border-slate-800/60 pt-3 flex items-center justify-between text-[9px] text-gray-400 font-bold uppercase">
                <span>Status: {issue.status}</span>
                <span>Trust: {issue.trustScore}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyIssues;
