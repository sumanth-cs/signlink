import React from 'react';
import { SIGNS } from '../../utils/constants';

const ProgressSidebar = () => {
  return (
    <div className="bg-gray-800 border-l border-gray-700 p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold mb-6 text-white">Your Progress</h3>
      
      <div className="flex gap-4 mb-8">
        <div className="bg-gray-900 p-4 rounded-xl flex-1 border border-gray-700">
          <p className="text-gray-400 text-sm">Streak</p>
          <p className="text-2xl font-bold text-orange-400">3 Days</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl flex-1 border border-gray-700">
          <p className="text-gray-400 text-sm">Learned</p>
          <p className="text-2xl font-bold text-green-400">12 Signs</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Practice Signs</h4>
        <div className="flex flex-col gap-3">
          {SIGNS.map(sign => (
            <div key={sign.id} className="bg-gray-900 border border-gray-700 p-3 rounded-lg flex items-center justify-between hover:border-indigo-500 transition-colors cursor-pointer">
              <div>
                <p className="text-white font-medium">{sign.name}</p>
                <p className="text-xs text-gray-400">{sign.difficulty}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                0%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressSidebar;
