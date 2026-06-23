import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.jsx';
import { Trophy, Medal, Star } from 'lucide-react';

const Leaderboard = () => {
  const { token, user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/leaderboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setBoard(data);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadLeaderboard();
  }, [token]);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="glass rounded-2xl p-6 shadow-sm flex items-center gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
          <Trophy size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Community Leaderboard</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">Top contributors in reporting and validating community issues.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-xs text-gray-400 animate-pulse py-8">Computing points rankings...</div>
      ) : (
        <div className="glass rounded-2xl p-4 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-slate-800/60">
          {board.map((item, index) => {
            const isMe = item._id === user?._id;
            return (
              <div 
                key={item._id} 
                className={`py-3.5 px-4 flex items-center justify-between transition-colors duration-150 ${
                  isMe ? 'bg-emerald-500/10 rounded-xl font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400' :
                    index === 1 ? 'bg-slate-100 text-slate-700 dark:bg-slate-800/40' :
                    index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400' :
                    'text-gray-400'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <span className="block text-xs font-bold text-gray-800 dark:text-slate-100">{item.name} {isMe && '(You)'}</span>
                    <span className="block text-[8px] text-gray-400 uppercase tracking-wider mt-0.5">{item.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Render award medals on top ranks */}
                  {index < 3 && <Medal size={16} className={
                    index === 0 ? 'text-amber-500' :
                    index === 1 ? 'text-slate-400' : 'text-orange-500'
                  } />}
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white font-sans">{item.points} pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
