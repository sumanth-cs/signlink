import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, History, TrendingUp, Settings, Camera, Zap } from 'lucide-react';

const Dashboard = () => {
  const userName = localStorage.getItem('userName') || 'Guest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Welcome, {userName}</h1>
          <p className="text-slate-400">Manage your translations and learning progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Core Feature 1: Translation Hub */}
        <Link to="/translate" className="glass-card p-6 border-white/10 hover:border-indigo-500/50 transition-all group block">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Camera size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Standard Translation</h2>
          <p className="text-sm text-slate-400 mb-4">Real-time ASL to English translation for everyday communication.</p>
          <div className="text-indigo-400 text-sm font-bold flex items-center gap-2">
            Launch Hub &rarr;
          </div>
        </Link>

        {/* Core Feature 2: Traveler Mode */}
        <Link to="/traveler" className="glass-card p-6 border-indigo-500/30 hover:border-indigo-400 transition-all premium-shadow group block relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">New</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Globe size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Traveler Mode</h2>
          <p className="text-sm text-slate-400 mb-4">Translate your sign language into 100+ global spoken languages instantly.</p>
          <div className="text-indigo-400 text-sm font-bold flex items-center gap-2">
            Select Language &rarr;
          </div>
        </Link>

        {/* Core Feature 3: Learning Center */}
        <Link to="/learn" className="glass-card p-6 border-white/10 hover:border-emerald-500/50 transition-all group block">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Learning Center</h2>
          <p className="text-sm text-slate-400 mb-4">Track your XP, streaks, and level up your sign language skills.</p>
          <div className="text-emerald-400 text-sm font-bold flex items-center gap-2">
            View Progress &rarr;
          </div>
        </Link>
      </div>

      <div className="glass-card p-8 border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <History className="text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        </div>
        <div className="text-center py-12 text-slate-500">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-slate-600" />
          </div>
          <p className="font-medium">No recent translations found.</p>
          <p className="text-sm mt-1">Start using the Translation Hub to see your history here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
