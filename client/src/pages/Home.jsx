import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, BookOpen, Zap, Shield, Smile, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-indigo-400 text-sm font-medium mb-8">
            <Sparkles size={16} />
            <span>Powered by MediaPipe & LSTM</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Real-time Sign Language <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Translation & Learning
            </span>
          </h1>
          
          <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto mb-12">
            Break down communication barriers with instant, accurate sign language translation. Practice and learn with real-time AI feedback.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/translate"
              className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
            >
              <Camera size={20} />
              Start Translating
            </Link>
            <Link 
              to="/learn"
              className="flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 rounded-xl font-semibold text-lg transition-all"
            >
              <BookOpen size={20} />
              Learn to Sign
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-2xl hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">&lt; 100ms Latency</h3>
              <p className="text-gray-400">Experience truly real-time translation with optimized WebSocket communication and lightweight models.</p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-2xl hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">&gt; 90% Accuracy</h3>
              <p className="text-gray-400">Advanced LSTM network specifically trained on comprehensive datasets to ensure precise gesture recognition.</p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-2xl hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6">
                <Smile size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Sentiment Analysis</h3>
              <p className="text-gray-400">Captures facial expressions and micro-movements to convey the full emotional context of signs.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
