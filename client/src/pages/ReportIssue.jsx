import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { 
  Camera, 
  MapPin, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck 
} from 'lucide-react';

// Fix Leaflet marker icon asset path issues in bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Leaflet map click listener component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const ReportIssue = () => {
  const { token, user, updateUserPoints } = useAuth();
  const { darkMode } = useTheme();
  const { refreshNotifications } = useNotifications();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(28.6139); // default Delhi
  const [longitude, setLongitude] = useState(77.2090);
  const [address, setAddress] = useState('Sector 15, New Delhi');
  
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI Pipeline Stepper State
  const [aiStep, setAiStep] = useState(0);
  const aiStepsList = [
    'Uploading reported media...',
    'Invoking Gemini Vision Engine...',
    'Performing multi-modal issue classification...',
    'Scanning coordinates for duplicate complaints...',
    'Evaluating threat priorities...',
    'Generating AI complaint summary...',
    'Wrapping up and awarding contribution points...'
  ];

  // Geolocation detection
  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        setAddress(`Sector ${Math.floor(Math.random() * 20) + 1}, City Center (Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)})`);
        setDetectingLocation(false);
      },
      (err) => {
        console.error(err);
        setError('Location permission denied. Mock coordinates have been set.');
        // Fallback to random coordinates
        const mockLat = 28.6139 + (Math.random() - 0.5) * 0.02;
        const mockLon = 77.2090 + (Math.random() - 0.5) * 0.02;
        setLatitude(mockLat);
        setLongitude(mockLon);
        setAddress(`Sector ${Math.floor(Math.random() * 20) + 1}, Ward ${Math.floor(Math.random() * 10) + 1}`);
        setDetectingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  const handleMapSelection = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(`Pinned Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  // Process image file uploads and convert to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('File size too large. Please select an image smaller than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) {
      setError('Please provide a description of the issue');
      return;
    }

    setError('');
    setSubmitting(true);
    setAiStep(0);

    // AI Steps Simulation timing
    const stepInterval = setInterval(() => {
      setAiStep(prev => {
        if (prev < aiStepsList.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 450);

    try {
      const response = await fetch(`${API_BASE_URL}/issues/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description,
          latitude,
          longitude,
          address,
          imageBase64
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      // Finish remaining steps in UI loader smoothly
      setTimeout(() => {
        clearInterval(stepInterval);
        setAiStep(aiStepsList.length);
        
        // Award points in Auth state
        updateUserPoints(user.points + 10, user.badges);
        
        setTimeout(() => {
          setSubmitting(false);
          refreshNotifications();
          
          if (data.possibleDuplicate) {
            alert('📢 AI Alert: A possible duplicate issue was identified in this immediate vicinity. Your report has been flagged for merging.');
          }
          
          navigate('/dashboard');
        }, 1000);
      }, 3000);

    } catch (err) {
      clearInterval(stepInterval);
      setSubmitting(false);
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto space-y-6">
      {/* AI Processing overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 transition-all duration-300">
          <div className="max-w-md w-full glass rounded-3xl p-8 border border-emerald-500/20 dark:border-emerald-500/30 shadow-2xl space-y-6 text-center">
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Loader2 size={36} className="animate-spin" />
                <Sparkles size={18} className="absolute top-2 right-2 animate-bounce text-amber-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-extrabold text-xl text-gray-900 dark:text-white font-sans">
                AI Pipeline Processing
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                Gemini AI is analyzing your report. Please hold on...
              </p>
            </div>

            {/* Steps list */}
            <div className="space-y-2.5 text-left border-y border-gray-100 dark:border-slate-800/80 py-4 max-h-56 overflow-y-auto">
              {aiStepsList.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  {aiStep > idx ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : aiStep === idx ? (
                    <Loader2 size={16} className="text-emerald-600 dark:text-emerald-400 animate-spin shrink-0" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-gray-200 dark:border-slate-800 shrink-0" />
                  )}
                  <span className={
                    aiStep > idx ? 'text-gray-400 dark:text-slate-500 line-through font-medium' :
                    aiStep === idx ? 'text-gray-900 dark:text-white font-bold' :
                    'text-gray-400 dark:text-slate-500 font-medium'
                  }>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Dynamic Progress indicator */}
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider animate-pulse">
              Running step {Math.min(aiStep + 1, aiStepsList.length)} of {aiStepsList.length}
            </div>
          </div>
        </div>
      )}

      {/* Title block */}
      <div className="glass rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Report Neighborhood Grievance</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Provide photos, description, and pin coordinates. Our AI engine will automatically classify issues and identify duplicates.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        {/* Left Side: Photo Upload & Description */}
        <div className="glass rounded-2xl p-6 shadow-sm space-y-5">
          {/* Photo upload container */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
              Upload Image (Required)
            </label>
            <div className="h-44 border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center gap-2 transition-colors duration-150">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageBase64(null); }}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <Camera size={32} className="text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Click to select photo</span>
                  <span className="text-[10px] text-gray-400">JPG, PNG up to 8MB</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="desc" className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
              Description (Describe the issue)
            </label>
            <textarea
              id="desc"
              rows={4}
              required
              placeholder="Provide context, e.g. 'Large pothole in middle of lane causing cars to swerve. Leaking water nearby...'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-450 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs shadow-sm resize-none"
            />
          </div>
        </div>

        {/* Right Side: Geolocation & Map Pin */}
        <div className="glass rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                Pin Location coordinates
              </label>
              <button
                type="button"
                onClick={handleAutoLocation}
                disabled={detectingLocation}
                className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-950/40 px-2 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <MapPin size={12} />
                {detectingLocation ? 'Locating...' : 'Auto Detect'}
              </button>
            </div>

            {/* Leaflet map selector */}
            <div className="h-48 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden relative shadow-sm">
              <MapContainer center={[latitude, longitude]} zoom={15} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url={darkMode 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  }
                />
                <Marker position={[latitude, longitude]} />
                <MapClickHandler onMapClick={handleMapSelection} />
              </MapContainer>
            </div>

            {/* Address fields */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Address / Area Name</span>
              <input
                type="text"
                required
                placeholder="Sector / Ward / Address name"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs shadow-sm"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all"
          >
            <Sparkles size={16} />
            Submit & Run AI Verification →
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;
