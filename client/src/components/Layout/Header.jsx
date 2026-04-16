import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code, BookOpen, Camera, Menu } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Translate', path: '/translate', icon: Camera },
    { name: 'Learn', path: '/learn', icon: BookOpen }
  ];

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
              <Code size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              SignLink<span className="text-indigo-500">.ai</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-gray-800/50 p-1 rounded-lg border border-gray-700/50">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-gray-700 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-indigo-400' : ''} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-400 hover:text-white">
              <Menu />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-gray-800 shadow-sm"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
