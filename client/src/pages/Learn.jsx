import React, { useState } from 'react';
import { Play, Trophy, Zap, Target, Award, CheckCircle2, TrendingUp, BookOpen, ExternalLink, Map } from 'lucide-react';

const COURSE_CATEGORIES = [
  {
    id: 'roadmap',
    label: 'Course Roadmap',
    icon: '🗺️',
    type: 'roadmap'
  },
  {
    id: 'basics',
    label: 'Module 1: Basics',
    icon: '🔤',
    type: 'video',
    videos: [
      { id: 'v1', title: 'ASL Alphabet A–Z Complete Guide', channel: 'Bill Vicars', duration: '10:24', level: 'Beginner', views: '4.2M', youtubeId: 'tkMg8g8vVUo', xp: 100 },
      { id: 'v2', title: 'Learn ASL Numbers 1–20', channel: 'ASL Meredith', duration: '8:15', level: 'Beginner', views: '1.8M', youtubeId: 'pYoFrFEVVs4', xp: 80 },
      { id: 'v3', title: 'Fingerspelling Practice', channel: 'Start ASL', duration: '6:42', level: 'Beginner', views: '920K', youtubeId: 'SI4KMpZiEa8', xp: 60 },
    ]
  },
  {
    id: 'greetings',
    label: 'Module 2: Phrases',
    icon: '👋',
    type: 'video',
    videos: [
      { id: 'v4', title: '50 Basic ASL Signs', channel: 'Bill Vicars', duration: '14:03', level: 'Beginner', views: '3.1M', youtubeId: '0FcwzMq4iWg', xp: 150 },
      { id: 'v5', title: 'Common Greetings in ASL', channel: 'ASL That', duration: '5:30', level: 'Beginner', views: '680K', youtubeId: 'v1desDduz5M', xp: 50 },
      { id: 'v6', title: 'Please, Thank You & Sorry', channel: 'ASL Meredith', duration: '4:18', level: 'Beginner', views: '430K', youtubeId: '3b8qYC3sEGM', xp: 40 },
    ]
  },
  {
    id: 'articles',
    label: 'Articles & Theory',
    icon: '📚',
    type: 'article',
    articles: [
      { id: 'a1', title: 'Deaf Culture & History 101', readTime: '5 min read', xp: 30, image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&q=80' },
      { id: 'a2', title: 'Facial Expressions in ASL Grammar', readTime: '8 min read', xp: 50, image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80' },
      { id: 'a3', title: 'How to structure an ASL Sentence', readTime: '6 min read', xp: 40, image: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=600&q=80' },
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Trophy size={60} />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 mb-1">Total XP</p>
        <p className="text-3xl font-black text-white">{stats.xp}</p>
        <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(stats.xp % 500) / 5}%` }} />
        </div>
      </div>

      <div className="glass-card p-6 border-purple-500/20 bg-purple-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <TrendingUp size={60} />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-purple-400 mb-1">Level</p>
        <p className="text-3xl font-black text-white">{stats.level}</p>
        <p className="text-xs text-slate-500 mt-2">Next level in {500 - (stats.xp % 500)} XP</p>
      </div>

      <div className="glass-card p-6 border-pink-500/20 bg-pink-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <CheckCircle2 size={60} />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-pink-400 mb-1">Completed</p>
        <p className="text-3xl font-black text-white">{stats.completed}</p>
        <p className="text-xs text-slate-500 mt-2">Modules Mastered</p>
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

const RoadmapView = () => {
  return (
    <div className="glass-card p-8 border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-5">
        <Map size={300} />
      </div>
      <h2 className="text-2xl font-black text-white mb-8">Your ASL Journey</h2>
      
      <div className="relative pl-8 border-l-2 border-indigo-500/30 space-y-10">
        
        <div className="relative">
          <div className="absolute -left-[41px] top-0 w-5 h-5 bg-indigo-500 rounded-full border-4 border-[#0a0a0c] shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
          <h3 className="text-xl font-bold text-indigo-400 mb-2">Phase 1: Foundations <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded ml-2">Completed</span></h3>
          <p className="text-slate-400 text-sm mb-3">Master the 26 letters of the alphabet and basic numbers.</p>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-slate-300">Alphabets</span>
            <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-slate-300">Numbers 1-20</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-[41px] top-0 w-5 h-5 bg-purple-500 rounded-full border-4 border-[#0a0a0c] animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.6)]"></div>
          <h3 className="text-xl font-bold text-white mb-2">Phase 2: Survival Phrases <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded ml-2">Current</span></h3>
          <p className="text-slate-400 text-sm mb-3">Learn daily greetings, emergency phrases, and basic navigation.</p>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-slate-300">Greetings</span>
            <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-slate-300">Food</span>
            <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-slate-300">Emergency</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-[41px] top-0 w-5 h-5 bg-slate-700 rounded-full border-4 border-[#0a0a0c]"></div>
          <h3 className="text-xl font-bold text-slate-500 mb-2">Phase 3: Grammar & Flow <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded ml-2">Locked</span></h3>
          <p className="text-slate-600 text-sm mb-3">Understand facial expressions, sentence structure, and dynamic signing.</p>
        </div>

      </div>
    </div>
  );
};

const Learn = () => {
  const [activeCategory, setActiveCategory] = useState('roadmap');
  const [activeVideo, setActiveVideo] = useState(null);
  const [userStats, setUserStats] = useState({ xp: 1240, level: 4, completed: 12 });

  const category = COURSE_CATEGORIES.find(c => c.id === activeCategory);

  const handleCompleteContent = (xpAmount) => {
    setUserStats(prev => ({
      ...prev,
      xp: prev.xp + xpAmount,
      completed: prev.completed + 1,
      level: Math.floor((prev.xp + xpAmount) / 500) + 1
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
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
        {COURSE_CATEGORIES.map(cat => (
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

      {/* Dynamic Content Area */}
      {category?.type === 'roadmap' && <RoadmapView />}

      {category?.type === 'video' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {category.videos.map(video => (
            <div
              key={video.id}
              className="group glass-card border-white/5 hover:border-indigo-500/30 overflow-hidden cursor-pointer transition-all duration-500"
              onClick={() => setActiveVideo(video)}
            >
              <div className="relative aspect-video bg-slate-900">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&q=80'; }}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {category?.type === 'article' && (
        <div className="grid sm:grid-cols-2 gap-6">
          {category.articles.map(article => (
            <div key={article.id} className="glass-card flex overflow-hidden border-white/5 hover:border-purple-500/30 group transition-all">
              <div className="w-1/3 relative overflow-hidden">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
              </div>
              <div className="w-2/3 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{article.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                    <BookOpen size={14} /> {article.readTime}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-2 py-1 rounded">+{article.xp} XP</span>
                  <button onClick={() => handleCompleteContent(article.xp)} className="flex items-center gap-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                    Read Article <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in" onClick={() => setActiveVideo(null)}>
          <div className="glass-card w-full max-w-4xl border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="aspect-video bg-black">
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
                onClick={() => {
                  handleCompleteContent(activeVideo.xp);
                  setActiveVideo(null);
                }}
                className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={20} />
                Mark Completed (+{activeVideo.xp} XP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;
