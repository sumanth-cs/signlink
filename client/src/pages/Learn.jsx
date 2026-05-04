import React, { useState, useEffect } from 'react';
import { Play, Trophy, Zap, CheckCircle2, TrendingUp, BookOpen, ExternalLink, Lock, Check, ChevronRight } from 'lucide-react';

const COURSE_CURRICULUM = [
  { id: 'm1', type: 'video', title: 'Phase 1: Alphabet A-Z', desc: 'Master the 26 letters of American Sign Language.', xp: 100, youtubeId: 'tkMg8g8vVUo', channel: 'ASL Basics' },
  { id: 'm2', type: 'video', title: 'Phase 2: Numbers 1-20', desc: 'Learn to count and sign numbers fluently.', xp: 80, youtubeId: 'S374c43pYmE', channel: 'ASL Basics' },
  { id: 'm3', type: 'article', title: 'Theory: Deaf Culture 101', desc: 'Essential reading on Deaf culture, history, and community guidelines.', xp: 50, link: 'https://www.nad.org/resources/american-sign-language/community-and-culture-frequently-asked-questions/' },
  { id: 'm4', type: 'video', title: 'Phase 3: Basic Greetings', desc: 'Learn how to say Hello, How are you, and Good morning.', xp: 150, youtubeId: '0FcwzMq4iWg', channel: 'Sign Language 101' },
  { id: 'm5', type: 'video', title: 'Phase 4: Manners & Etiquette', desc: 'Essential polite phrases: Please, Thank You, and Sorry.', xp: 100, youtubeId: 'kYJ4M6u2j34', channel: 'ASL Basics' },
  { id: 'm6', type: 'article', title: 'Theory: ASL Grammar', desc: 'Understanding the importance of facial expressions and syntax.', xp: 75, link: 'https://www.handspeak.com/learn/334/' },
  { id: 'm7', type: 'video', title: 'Phase 5: Emergency Signs', desc: 'Critical survival signs: Help, Doctor, Hospital, and Police.', xp: 200, youtubeId: '63QYyU5T56Q', channel: 'Emergency ASL' }
];

const ProgressDashboard = ({ xp, level, completedCount }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Trophy size={60} />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 mb-1">Total XP</p>
        <p className="text-3xl font-black text-white">{xp}</p>
        <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(xp % 500) / 5}%` }} />
        </div>
      </div>

      <div className="glass-card p-6 border-purple-500/20 bg-purple-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <TrendingUp size={60} />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-purple-400 mb-1">Level</p>
        <p className="text-3xl font-black text-white">{level}</p>
        <p className="text-xs text-slate-500 mt-2">Next level in {500 - (xp % 500)} XP</p>
      </div>

      <div className="glass-card p-6 border-pink-500/20 bg-pink-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <CheckCircle2 size={60} />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-pink-400 mb-1">Completed</p>
        <p className="text-3xl font-black text-white">{completedCount}</p>
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

const Learn = () => {
  const [completedModules, setCompletedModules] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  
  const xp = completedModules.reduce((total, id) => {
    const mod = COURSE_CURRICULUM.find(c => c.id === id);
    return total + (mod ? mod.xp : 0);
  }, 0);
  
  const level = Math.floor(xp / 500) + 1;

  const handleComplete = () => {
    if (activeItem && !completedModules.includes(activeItem.id)) {
      setCompletedModules(prev => [...prev, activeItem.id]);
    }
    setActiveItem(null);
  };

  const openItem = (item) => {
    setActiveItem(item);
    if (item.type === 'article') {
      window.open(item.link, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          ASL Masterclass <span className="accent-gradient">Roadmap</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          A highly structured, linear progression course designed to take you from a complete beginner to a confident signer. Complete modules consecutively to unlock the next phase.
        </p>
      </div>

      <ProgressDashboard xp={xp} level={level} completedCount={completedModules.length} />

      {/* Strict Linear Roadmap */}
      <div className="relative pl-6 md:pl-12 border-l-4 border-white/5 space-y-12 my-16">
        
        {COURSE_CURRICULUM.map((module, index) => {
          const isCompleted = completedModules.includes(module.id);
          const isCurrent = !isCompleted && (index === 0 || completedModules.includes(COURSE_CURRICULUM[index - 1].id));
          const isLocked = !isCompleted && !isCurrent;

          let statusColor = 'bg-slate-800 border-slate-700';
          let statusIcon = <Lock size={14} className="text-slate-500" />;
          if (isCompleted) {
            statusColor = 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]';
            statusIcon = <Check size={14} className="text-white" />;
          } else if (isCurrent) {
            statusColor = 'bg-indigo-500 border-indigo-400 animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.6)]';
            statusIcon = <ChevronRight size={14} className="text-white" />;
          }

          return (
            <div key={module.id} className={`relative glass-card p-6 border transition-all ${isCurrent ? 'border-indigo-500/50 bg-indigo-500/5 scale-[1.02]' : isLocked ? 'border-white/5 opacity-50 grayscale' : 'border-green-500/20 bg-green-500/5'}`}>
              
              {/* Timeline Dot */}
              <div className={`absolute -left-[36px] md:-left-[60px] top-6 w-8 h-8 rounded-full border-4 border-[#0a0a0c] flex items-center justify-center ${statusColor}`}>
                {statusIcon}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${module.type === 'video' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {module.type === 'video' ? <Play size={20} fill="currentColor" /> : <BookOpen size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-xl font-black ${isLocked ? 'text-slate-500' : 'text-white'}`}>{module.title}</h3>
                      {isCompleted && <span className="text-[10px] uppercase font-bold text-green-400 bg-green-500/20 px-2 py-0.5 rounded">Completed</span>}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{module.desc}</p>
                    <div className="flex gap-2">
                      <span className="text-xs font-bold px-2 py-1 bg-white/5 rounded-md text-slate-300">+{module.xp} XP</span>
                      {module.type === 'video' ? (
                        <span className="text-xs font-bold px-2 py-1 bg-white/5 rounded-md text-slate-300">{module.channel}</span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-1 bg-white/5 rounded-md text-slate-300">External Reading</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <button 
                    disabled={isLocked || isCompleted}
                    onClick={() => openItem(module)}
                    className={`px-6 py-3 rounded-xl font-bold w-full md:w-auto transition-all flex items-center justify-center gap-2 ${
                      isCompleted ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 
                      isLocked ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 
                      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25'
                    }`}
                  >
                    {isCompleted ? 'Reviewed' : isLocked ? 'Locked' : module.type === 'video' ? 'Watch Lesson' : 'Read Article'}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Video / Article Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setActiveItem(null)}>
          <div className="glass-card w-full max-w-4xl border-white/10 overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            
            {activeItem.type === 'video' ? (
              <div className="aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeItem.youtubeId}?autoplay=1&rel=0`}
                  title={activeItem.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-12 text-center bg-indigo-500/5">
                <BookOpen size={64} className="mx-auto text-indigo-400 mb-6" />
                <h2 className="text-3xl font-black text-white mb-4">Reading Assignment Opened!</h2>
                <p className="text-slate-400 max-w-lg mx-auto mb-6">
                  The article "{activeItem.title}" has been opened in a new tab. Please read it thoroughly to understand the core concepts.
                </p>
                <a href={activeItem.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold mb-8">
                  Open again <ExternalLink size={16} />
                </a>
              </div>
            )}

            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0a0a0c]">
              <div>
                <h3 className="text-2xl font-black text-white mb-1">{activeItem.title}</h3>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                  {activeItem.type === 'video' ? 'Video Lesson' : 'Required Reading'}
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setActiveItem(null)}
                  className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={handleComplete}
                  className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
                >
                  <CheckCircle2 size={20} />
                  Mark as Completed (+{activeItem.xp} XP)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Learn;
