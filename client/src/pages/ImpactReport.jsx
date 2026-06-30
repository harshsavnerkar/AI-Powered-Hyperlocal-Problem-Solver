import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { 
  Trophy, 
  Award, 
  Download, 
  Share2, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Heart 
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { motion } from 'framer-motion';

const ImpactReport = () => {
  const { token, user, updateUser } = useAuth();
  const cardRef = React.useRef(null);
  const [downloading, setDownloading] = useState(false);

  // Sync profile on page load to ensure stats are 100% fresh from DB
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const profile = await res.json();
          updateUser(profile);
        }
      } catch (err) {
        console.error('Failed to sync profile on impact load:', err);
      }
    };
    if (token) syncProfile();
  }, [token]);

  if (!user) return null;

  const role = user.role || 'citizen';
  const reportsCount = user.reportsCount || 0;
  const resolvedCount = user.resolvedCount || 0;
  const validationsCount = user.validationsCount || 0;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvasFn = html2canvas.default || html2canvas;
      if (typeof html2canvasFn !== 'function') {
        throw new Error('html2canvas is not a function. Check library loading.');
      }
      
      const canvas = await html2canvasFn(cardRef.current, {
        useCORS: true,
        scale: 2, // higher resolution
        backgroundColor: '#0b1317' // Slate 950 dark background
      });
      const link = document.createElement('a');
      link.download = `CommunityHero_Impact_Card_${user?.name?.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate card image:', err);
      alert(`Failed to download card: ${err.message || 'Unknown error'}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    let text = '';
    if (role === 'citizen') {
      text = `I'm helping improve my neighborhood on CommunityHero! 🦸‍♂️ I've reported ${reportsCount} local issues, resolved ${resolvedCount}, and earned ${user.points} points.`;
    } else if (role === 'volunteer') {
      text = `I'm validating neighborhood reports on CommunityHero! 🛠️ I've verified ${validationsCount} local issues and earned ${user.points} points.`;
    } else {
      text = `I'm managing civic resolutions on CommunityHero! ⚙️ We've resolved ${resolvedCount} issues across the community.`;
    }
    const tweetText = `${text} Check out your impact card here! #CommunityHero #CivicImpact`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 p-1 sm:p-2">
      {/* Description header */}
      <div className="glass rounded-3xl p-6 shadow-sm flex items-center gap-3.5">
        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <Trophy size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Civic Impact Report</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Generate a shareable, certified achievement card showcasing your neighborhood cleanup efforts.</p>
        </div>
      </div>

      {/* Certified Impact Card Container */}
      <div className="flex justify-center">
        <div 
          ref={cardRef} 
          className="relative w-full max-w-sm aspect-[4/5] bg-gradient-to-br from-slate-900 via-[#071912] to-slate-950 border border-emerald-500/20 rounded-3xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden text-white"
        >
          {/* Glowing auroras */}
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

          {/* Card Top Header */}
          <div className="flex justify-between items-start z-10">
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-sm tracking-tight text-white">
                Community<span className="text-emerald-500">Hero</span>
              </span>
            </div>
            <span className="px-2.5 py-0.5 border border-emerald-500/35 bg-emerald-950/30 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
              <Sparkles size={8} /> Certified Helper
            </span>
          </div>

          {/* Profile Name & Ranks */}
          <div className="space-y-4 z-10 my-auto text-center mt-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 flex items-center justify-center shadow-lg">
              <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-emerald-400 font-sans font-black text-xl">
                {user?.name?.charAt(0)}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-none text-white">{user?.name}</h3>
              <p className="text-[9px] font-bold text-emerald-400 dark:text-emerald-450 uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1">
                <MapPin size={9} /> {role === 'citizen' ? 'Citizen Contributor' : role === 'volunteer' ? 'Community Volunteer' : 'System Administrator'}
              </p>
            </div>
          </div>

          {/* Role-Specific Core Stats Row */}
          <div className="z-10 bg-slate-950/50 backdrop-blur-sm border border-emerald-500/10 p-3 rounded-2xl">
            {role === 'citizen' && (
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <span className="block text-[8px] text-gray-400 uppercase tracking-wider">Reports</span>
                  <span className="block text-sm font-black text-white font-sans mt-0.5">{reportsCount}</span>
                </div>
                <div className="text-center border-x border-slate-800">
                  <span className="block text-[8px] text-gray-400 uppercase tracking-wider">Resolved</span>
                  <span className="block text-sm font-black text-emerald-400 font-sans mt-0.5">{resolvedCount}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[8px] text-gray-400 uppercase tracking-wider">Points</span>
                  <span className="block text-sm font-black text-amber-450 font-sans mt-0.5">{user.points}</span>
                </div>
              </div>
            )}

            {role === 'volunteer' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center border-r border-slate-800">
                  <span className="block text-[8px] text-gray-400 uppercase tracking-wider">Validations</span>
                  <span className="block text-sm font-black text-white font-sans mt-0.5">{validationsCount}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[8px] text-gray-400 uppercase tracking-wider">Contribution Pts</span>
                  <span className="block text-sm font-black text-amber-450 font-sans mt-0.5">{user.points}</span>
                </div>
              </div>
            )}

            {role === 'admin' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center border-r border-slate-800">
                  <span className="block text-[8px] text-gray-400 uppercase tracking-wider">Resolutions Managed</span>
                  <span className="block text-sm font-black text-white font-sans mt-0.5">{resolvedCount}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[8px] text-gray-400 uppercase tracking-wider">System Points</span>
                  <span className="block text-sm font-black text-amber-450 font-sans mt-0.5">{user.points}</span>
                </div>
              </div>
            )}
          </div>

          {/* Badges showcase row */}
          <div className="z-10 mt-4 space-y-1.5">
            <span className="block text-center text-[7px] text-gray-400 uppercase tracking-widest font-black">Unlocked Badges Showcase</span>
            <div className="flex justify-center gap-2 flex-wrap min-h-[22px]">
              {user?.badges?.length > 0 ? (
                user.badges.map((badge, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-0.5 border border-slate-800 bg-slate-950/60 text-slate-300 text-[7px] font-bold rounded-lg flex items-center gap-0.5 shadow-sm animate-pulse"
                  >
                    <Award size={8} className="text-amber-400" /> {badge}
                  </span>
                ))
              ) : (
                <span className="text-[8px] text-gray-500 italic">No badges unlocked yet</span>
              )}
            </div>
          </div>

          {/* Card Bottom stamp */}
          <div className="flex justify-between items-center text-[7px] text-gray-400 border-t border-slate-800/80 pt-3 mt-4 z-10">
            <span className="flex items-center gap-1 font-bold">
              <Heart size={8} className="text-red-500 animate-pulse" /> Certified Civic Helper
            </span>
            <span className="flex items-center gap-1 font-bold">
              <Calendar size={8} /> {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          disabled={downloading}
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-450 cursor-pointer shadow-lg transition-all"
        >
          <Download size={14} />
          {downloading ? 'Downloading...' : 'Download Card'}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer shadow-sm transition-all"
        >
          <Share2 size={14} />
          Share to X
        </button>
      </div>
    </div>
  );
};

export default ImpactReport;
