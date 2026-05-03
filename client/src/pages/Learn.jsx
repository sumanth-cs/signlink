import React, { useState, useEffect } from 'react';
import { Play, Star, Clock, Users, Trophy, Zap, Target, Award, CheckCircle2, TrendingUp } from 'lucide-react';

// Tutorial Video Data
const TUTORIAL_CATEGORIES = [
  {
    id: 'basics',
    label: 'Basics & Alphabet',
    icon: '🔤',
    videos: [
      { id: 'v1', title: 'ASL Alphabet A–Z Complete Guide', channel: 'Bill Vicars', duration: '10:24', level: 'Beginner', views: '4.2M', youtubeId: 'tkMg8g8vVUo', emoji: '🔤', xp: 100 },
      { id: 'v2', title: 'Learn ASL Numbers 1–20', channel: 'ASL Meredith', duration: '8:15', level: 'Beginner', views: '1.8M', youtubeId: 'pYoFrFEVVs4', emoji: '🔢', xp: 80 },
      { id: 'v3', title: 'Fingerspelling Practice', channel: 'Start ASL', duration: '6:42', level: 'Beginner', views: '920K', youtubeId: 'SI4KMpZiEa8', emoji: '✋', xp: 60 },
    ]
  },
  {
    id: 'greetings',
    label: 'Greetings & Phrases',
    icon: '👋',
    videos: [
      { id: 'v4', title: '50 Basic ASL Signs', channel: 'Bill Vicars', duration: '14:03', level: 'Beginner', views: '3.1M', youtubeId: '0FcwzMq4iWg', emoji: '👐', xp: 150 },
      { id: 'v5', title: 'Common Greetings in ASL', channel: 'ASL That', duration: '5:30', level: 'Beginner', views: '680K', youtubeId: 'v1desDduz5M', emoji: '👋', xp: 50 },
      { id: 'v6', title: 'Please, Thank You & Sorry', channel: 'ASL Meredith', duration: '4:18', level: 'Beginner', views: '430K', youtubeId: '3b8qYC3sEGM', emoji: '🤝', xp: 40 },
    ]
  }
];

const LEVEL_COLORS = {
  Beginner:     'bg-green-500/10 text-green-400 border-green-500/20',
  Intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Advanced:     'bg-red-500/10 text-red-400 border-red-500/20',
};

const ProgressDashboard = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
      <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Trophy size={60} />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 mb-1">Total XP</p>
        <p className="text-3xl font-black text-white">{stats.xp}</p>
        <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 w-[65%] transition-all duration-1000" />
        </div>
      </div>

      <div className="glass-card p-6 border-purple-500/20 bg-purple-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <TrendingUp size={60} />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-purple-400 mb-1">Level</p>
        <p className="text-3xl font-black text-white">4</p>
        <p className="text-xs text-slate-500 mt-2">Next level in 240 XP</p>
      </div>

      <div className="glass-card p-6 border-pink-500/20 bg-pink-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <CheckCircle2 size={60} />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-pink-400 mb-1">Completed</p>
        <p className="text-3xl font-black text-white">12</p>
        <p className="text-xs text-slate-500 mt-2">Signs Mastered</p>
      </div>

      <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Zap size={60} />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 mb-1">Streak</p>
        <p className="text-3xl font-black text-white">7</p>
        <p className="text-xs text-slate-500 mt-2">Days active</p>
      </div>
    </div>
  );
};

const VideoCard = ({ video, onClick }) => {
  return (
    <div
      className="group glass-card border-white/5 hover:border-indigo-500/30 overflow-hidden cursor-pointer transition-all duration-500"
      onClick={() => onClick(video)}
    >
      <div className="relative aspect-video bg-slate-900">
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
            <Play size={24} className="text-white ml-1" fill="white" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
          {video.duration}
        </div>
        <div className="absolute top-3 left-3 bg-indigo-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
          +{video.xp} XP
        </div>
      </div>

      <div className="p-5">
        <h4 className="text-white font-bold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {video.title}
        </h4>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md border ${LEVEL_COLORS[video.level]}`}>
            {video.level}
          </span>
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
            <Users size={12} />
            {video.views}
          </div>
        </div>
      </div>
    </div>
  );
};

const Learn = () => {
  const [activeCategory, setActiveCategory] = useState('basics');
  const [activeVideo, setActiveVideo] = useState(null);
  const [userStats, setUserStats] = useState({ xp: 1240, level: 4, completed: 12 });

  const category = TUTORIAL_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-3">
            Learning <span className="accent-gradient">Center</span>
          </h1>
          <p className="text-slate-400 max-w-xl">
            Master the art of sign language with our structured, gamified curriculum. Earn XP, level up, and unlock new categories.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card px-4 py-2 border-indigo-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Daily Rank</p>
              <p className="text-sm font-black text-white">#12 (Top 5%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Dashboard */}
      <ProgressDashboard stats={userStats} />

      {/* Category Tabs */}
      <div className="flex gap-3 flex-wrap mb-10">
        {TUTORIAL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border ${
              activeCategory === cat.id
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-lg">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {category?.videos.map(video => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={setActiveVideo}
          />
        ))}
      </div>

      {/* Smart Learning Section */}
      <div className="mt-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500">
            <Target size={24} />
          </div>
          <h2 className="text-2xl font-black text-white">Smart Learning Path</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Interactive Quizzes', desc: 'Test your memory with real-time recognition tests.', icon: '🎯', color: 'border-blue-500/20' },
            { title: 'Pose Accuracy', desc: 'Get AI feedback on your hand shapes and movements.', icon: '🖐️', color: 'border-purple-500/20' },
            { title: 'Daily Challenges', desc: 'Unlock bonus XP by completing 5 signs daily.', icon: '⚡', color: 'border-pink-500/20' },
          ].map((item, i) => (
            <div key={i} className={`glass-card p-6 border ${item.color} group hover:bg-white/5 transition-all cursor-pointer`}>
              <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">{item.icon}</span>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setActiveVideo(null)}>
          <div className="glass-card w-full max-w-4xl border-white/10 overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">{activeVideo.title}</h3>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{activeVideo.channel}</p>
              </div>
              <button 
                onClick={() => setActiveVideo(null)}
                className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
              >
                Done Watching
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;
