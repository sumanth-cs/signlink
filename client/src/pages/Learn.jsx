import React from 'react';
import WebcamComponent from '../components/Camera/WebcamComponent';
import ProgressSidebar from '../components/Learning/ProgressSidebar';
import SignPractice from '../components/Learning/SignPractice';
import { useWebSocket } from '../hooks/useWebSocket';

const Learn = () => {
  const { isConnected, prediction, sendFrame } = useWebSocket();
  const activeSign = { id: 'hello', name: 'Hello', difficulty: 'Easy' }; // mock

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-64px)]">
      <div className="grid lg:grid-cols-4 gap-6 h-full py-6">
        
        <div className="lg:col-span-3 h-full flex flex-col overflow-hidden bg-gray-800/50 rounded-2xl border border-gray-700">
          <SignPractice activeSign={activeSign} />
          
          <div className="flex-1 p-6 border-t border-gray-700">
            <div className="h-full relative overflow-hidden rounded-xl bg-gray-900 border border-gray-700 shadow-inner">
               <WebcamComponent onFrameCapture={sendFrame} />
               
               {/* Practice Overlay */}
               {prediction && (
                 <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur px-4 py-2 rounded-lg border border-gray-700">
                   <p className="text-xs text-gray-400">AI DETECTS</p>
                   <p className="text-lg font-bold uppercase text-white">{prediction.text || "..."}</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="h-full bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
          <ProgressSidebar />
        </div>

      </div>
    </div>
  );
};

export default Learn;
