import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Gift, Award, CheckCircle2, ShieldAlert } from 'lucide-react';

const Rewards = () => {
  const { user } = useAuth();

  if (!user) return null;

  const points = user.points || 0;

  const pointRules = [
    { title: 'Report New Issue', points: 10, desc: 'File a community grievance with image proof.' },
    { title: 'Verify Reported Issue', points: 5, desc: 'Confirm validity of other reported issues.' },
    { title: 'Issue Resolved', points: 20, desc: 'Earn points when authorities resolve your report.' }
  ];

  const badgesList = [
    { name: 'Community Reporter', desc: 'Granted upon reporting your first local issue.', active: points >= 10, color: 'text-amber-500' },
    { name: 'Problem Solver', desc: 'Granted once your reported issues cross 50 total points.', active: points >= 50, color: 'text-emerald-500' },
    { name: 'Active Citizen', desc: 'Granted for active verification crossing 100 points.', active: points >= 100, color: 'text-blue-500' },
    { name: 'City Guardian', desc: 'Granted for community hero contributions above 200 points.', active: points >= 200, color: 'text-purple-500' },
    { name: 'Top Contributor', desc: 'Unlocked when you achieve 300+ contribution points.', active: points >= 300, color: 'text-cyan-500' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Overview block */}
      <div className="glass rounded-3xl p-6 sm:p-8 flex items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Gift size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rewards & Badges</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Earn points for civic reports and unlock badges to rank up on the board.</p>
          </div>
        </div>
        <div className="text-center bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/10">
          <span className="block text-[10px] font-bold uppercase tracking-wider">Total Balance</span>
          <span className="block text-2xl font-black font-sans mt-0.5">{points} pts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Points Rules */}
        <div className="glass rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="font-extrabold text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800/60 pb-3">
            How to Earn Points
          </h3>
          <div className="space-y-4">
            {pointRules.map((rule, idx) => (
              <div key={idx} className="flex justify-between items-center gap-4 text-xs p-1">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{rule.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{rule.desc}</p>
                </div>
                <span className="shrink-0 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] px-2.5 py-1 rounded-xl">
                  +{rule.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Badges Detail */}
        <div className="glass rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="font-extrabold text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800/60 pb-3">
            Badges Showcase
          </h3>
          <div className="space-y-4">
            {badgesList.map((badge, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-3 text-xs p-1 transition-all ${
                  badge.active ? 'opacity-100' : 'opacity-40 grayscale select-none'
                }`}
              >
                <Award size={18} className={`mt-0.5 shrink-0 ${badge.color}`} />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{badge.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{badge.desc}</p>
                </div>
                {badge.active && (
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
