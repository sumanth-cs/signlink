import React from 'react';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Guest Explorer';
  const userEmail = localStorage.getItem('userEmail') || 'guest@signlink.ai';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in">
      <div className="glass-card p-8 border-white/10 premium-shadow">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
            <User size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">{userName}</h1>
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mt-1">Explorer Level 1</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <Mail className="text-slate-400" size={20} />
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-bold">Email Address</p>
              <p className="text-white">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <Shield className="text-slate-400" size={20} />
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-bold">Account Status</p>
              <p className="text-green-400 font-bold">Active & Verified</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link to="/dashboard" className="flex-1 text-center py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10">
            Back to Dashboard
          </Link>
          <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold transition-all border border-red-500/20">
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
