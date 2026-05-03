import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, BookOpen, Camera, Menu, User, LayoutDashboard } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Translation Hub', path: '/translate', icon: Camera },
    { name: 'Learning Center', path: '/learn', icon: BookOpen },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black p-2.5 rounded-xl border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                <Sparkles size={24} className="text-indigo-400" />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-black tracking-tight text-white leading-tight">
                Sign<span className="accent-gradient">Link</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2 px-1.5 py-1.5 glass-card bg-white/5 border-white/5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => document.body.classList.toggle('light-theme')}
              className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all"
              title="Toggle Theme"
            >
              <Sparkles size={18} />
            </button>
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-white">{localStorage.getItem('userName') || 'Guest'}</span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Explorer Level 1</span>
            </div>
            <Link to="/login" className="relative w-10 h-10 rounded-xl glass-card border-white/10 flex items-center justify-center hover:border-indigo-500/50 transition-all">
              <User size={20} className="text-slate-400" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></div>
            </Link>
            <button className="md:hidden text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
