import React from 'react';
import { Play } from 'lucide-react';

const SignPractice = ({ activeSign }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{activeSign?.name || "Select a sign"}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300`}>
            {activeSign?.difficulty || "Difficulty"}
          </span>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-400">Match Target</p>
          <p className="text-green-400 font-mono font-bold text-xl">80%</p>
        </div>
      </div>

      <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center border border-gray-700 mb-6 group relative overflow-hidden">
        {/* Placeholder for demonstration video */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-all cursor-pointer z-20">
          <Play fill="white" className="ml-1" />
        </div>
        <p className="absolute bottom-4 text-gray-400 text-sm z-20">Demonstration Video</p>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors">
          Start Practice
        </button>
      </div>
    </div>
  );
};

export default SignPractice;
