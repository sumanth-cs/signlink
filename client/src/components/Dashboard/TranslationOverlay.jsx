import React from 'react';

const TranslationOverlay = ({ prediction }) => {
  if (!prediction) return null;

  const { text, confidence } = prediction;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-2xl p-6 min-w-[300px] shadow-2xl">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider mb-2">
          {text || "..."}
        </h2>
        
        <div className="flex items-center gap-3 justify-center mt-4">
          <div className="w-full bg-gray-800 rounded-full h-2 max-w-[150px]">
            <div 
              className={`h-2 rounded-full ${confidence > 0.8 ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${confidencePercent}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-400 font-mono">{confidencePercent}%</span>
        </div>
        
        {confidence < 0.7 && confidence > 0 && (
          <p className="text-xs text-yellow-500 mt-2">Low confidence, please try again</p>
        )}
      </div>
    </div>
  );
};

export default TranslationOverlay;
