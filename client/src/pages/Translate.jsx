import React, { useState } from 'react';
import WebcamComponent from '../components/Camera/WebcamComponent';
import TranslationOverlay from '../components/Dashboard/TranslationOverlay';
import SentimentIndicator from '../components/Dashboard/SentimentIndicator';
import { useWebSocket } from '../hooks/useWebSocket';

const Translate = () => {
  const { isConnected, prediction, sendFrame } = useWebSocket();
  const [history, setHistory] = useState([]);

  // Mock sentiment if not provided by backend properly yet
  const sentiment = prediction?.sentiment || { emotion: 'neutral', intensity: 0.5 };

  // Keep a running text
  React.useEffect(() => {
    if (prediction && prediction.text) {
      setHistory(prev => {
        // Prevent immediate duplicates
        if (prev.length > 0 && prev[prev.length-1] === prediction.text) {
          return prev;
        }
        return [...prev, prediction.text].slice(-10); // keep last 10
      });
    }
  }, [prediction]);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8 h-[calc(100vh-64px)] overflow-hidden">
      <div className="py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Real-time Translation</h1>
          <p className="text-sm text-gray-400">Ensure your hands and face are clearly visible.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-400">{isConnected ? 'AI Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 h-[calc(100%-80px)]">
        <div className="lg:col-span-3 h-full relative flex flex-col items-center justify-center">
          <WebcamComponent onFrameCapture={sendFrame} />
          {prediction && <SentimentIndicator sentiment={sentiment} />}
          <TranslationOverlay prediction={prediction} />
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Transcript</h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-end">
            <div className="flex flex-col gap-2">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4 italic">No signs detected yet...</p>
              ) : (
                history.map((text, i) => (
                  <div key={i} className="bg-gray-700/50 p-3 rounded-lg text-white">
                    {text}
                  </div>
                ))
              )}
            </div>
          </div>
          <button 
            className="w-full mt-4 py-2 border border-gray-600 hover:bg-gray-700 rounded-lg text-sm transition-colors text-gray-300"
            onClick={() => setHistory([])}
          >
            Clear Transcript
          </button>
        </div>
      </div>
    </div>
  );
};

export default Translate;
