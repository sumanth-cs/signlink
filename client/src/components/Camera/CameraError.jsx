import React from 'react';
import { Activity } from 'lucide-react';

const CameraError = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
      <div className="text-red-500 mb-4">
        <Activity size={48} />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">Camera Access Error</h3>
      <p className="text-gray-400 mb-6">{message}</p>
      <button 
        onClick={onRetry}
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
      >
        Retry
      </button>
    </div>
  );
};

export default CameraError;
