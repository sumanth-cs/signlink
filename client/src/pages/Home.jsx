import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, BookOpen, Zap, ShieldAlert, Heart, Sparkles, Mic, MessageSquare, GraduationCap } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative isolate">
      {/* Background Decorative Elements */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#6366f1] to-[#a855f7] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card bg-indigo-500/10 border-indigo-500/20 text-indigo-400 text-sm font-bold mb-10 animate-float">
            <Sparkles size={16} className="animate-pulse" />
            <span className="uppercase tracking-widest">Next-Gen Accessibility Hub</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-10 leading-[1.1] text-white">
            Bridging Worlds with <br />
            <span className="accent-gradient">Intelligent Signs</span>
          </h1>
          
          <p className="mt-8 text-xl text-slate-400 max-w-3xl mx-auto mb-14 font-medium leading-relaxed">
            The ultimate communication bridge for the Deaf and Hard of Hearing. 
            Real-time sign translation, two-way speech captions, and gamified learning.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              to="/translate"
              className="group relative flex items-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Camera size={24} />
              Open Translation Hub
            </Link>
            <Link 
              to="/learn"
              className="flex items-center gap-3 px-10 py-5 glass-card bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-2xl font-bold text-xl transition-all hover:scale-105"
            >
              <GraduationCap size={24} />
              Start Learning
            </Link>
          </div>

          {/* Stat Badges */}
          <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">98%</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Accuracy Rate</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">2k+</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Signs Mastered</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">&lt;50ms</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Latency</span>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Showcases */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Solving Real-World Problems</h2>
            <div className="h-1.5 w-24 bg-indigo-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="glass-card p-8 border-white/5 hover:border-indigo-500/30 group transition-all duration-500">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 transition-transform">
                <Mic size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Bi-Directional Hub</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Hear with your eyes. Real-time Speech-to-Text allows hearing people to speak and deaf users to read instantly.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-card p-8 border-white/5 hover:border-purple-500/30 group transition-all duration-500">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-8 group-hover:scale-110 transition-transform">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI Context Refiner</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Signs to Sentences. Our LLM layer converts raw sign detections into natural, grammatically correct language.</p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 border-white/5 hover:border-red-500/30 group transition-all duration-500">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 mb-8 group-hover:scale-110 transition-transform">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Emergency Mode</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Instant SOS detection. High-priority gesture recognition for critical situations (Help, Pain, Fire).</p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-8 border-white/5 hover:border-pink-500/30 group transition-all duration-500">
              <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400 mb-8 group-hover:scale-110 transition-transform">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Smart Learning</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Master signing with AI. Get real-time feedback on your pose accuracy and track your progress with XP.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-16 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-600 mb-10">Built with Industrial Grade Tech</p>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
             <span className="text-xl font-bold text-white">MediaPipe</span>
             <span className="text-xl font-bold text-white">TensorFlow</span>
             <span className="text-xl font-bold text-white">React.js</span>
             <span className="text-xl font-bold text-white">Node.js</span>
             <span className="text-xl font-bold text-white">FastAPI</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
