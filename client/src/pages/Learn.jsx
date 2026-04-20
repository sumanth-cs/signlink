import React, { useState } from 'react';
import { Play, BookOpen, ChevronRight, Star, Clock, Users } from 'lucide-react';

// ── Tutorial Video Data ────────────────────────────────────────────────
// Real YouTube embed IDs for ASL tutorial content
const TUTORIAL_CATEGORIES = [
  {
    id: 'basics',
    label: 'Basics & Alphabet',
    icon: '🔤',
    videos: [
      {
        id: 'v1',
        title: 'ASL Alphabet A–Z (Complete Guide)',
        channel: 'Bill Vicars – Lifeprint',
        duration: '10:24',
        level: 'Beginner',
        views: '4.2M',
        youtubeId: 'tkMg8g8vVUo',
        thumbnail: `https://img.youtube.com/vi/tkMg8g8vVUo/hqdefault.jpg`,
      },
      {
        id: 'v2',
        title: 'Learn ASL Numbers 1–100',
        channel: 'ASL Meredith',
        duration: '8:15',
        level: 'Beginner',
        views: '1.8M',
        youtubeId: 'Oj7Z0RqsBFY',
        thumbnail: `https://img.youtube.com/vi/Oj7Z0RqsBFY/hqdefault.jpg`,
      },
      {
        id: 'v3',
        title: 'Fingerspelling Practice – Slow & Clear',
        channel: 'Start ASL',
        duration: '6:42',
        level: 'Beginner',
        views: '920K',
        youtubeId: 'yVfpGMdyMTY',
        thumbnail: `https://img.youtube.com/vi/yVfpGMdyMTY/hqdefault.jpg`,
      },
    ]
  },
  {
    id: 'greetings',
    label: 'Greetings & Phrases',
    icon: '👋',
    videos: [
      {
        id: 'v4',
        title: '50 Basic ASL Signs Every Beginner Should Know',
        channel: 'Bill Vicars',
        duration: '14:03',
        level: 'Beginner',
        views: '3.1M',
        youtubeId: '0FcwzMq4iWg',
        thumbnail: `https://img.youtube.com/vi/0FcwzMq4iWg/hqdefault.jpg`,
      },
      {
        id: 'v5',
        title: 'Everyday Greetings in ASL',
        channel: 'ASL That',
        duration: '5:30',
        level: 'Beginner',
        views: '680K',
        youtubeId: 'ianCExd_ono',
        thumbnail: `https://img.youtube.com/vi/ianCExd_ono/hqdefault.jpg`,
      },
      {
        id: 'v6',
        title: 'Polite Expressions: Please, Thank You, Sorry',
        channel: 'Start ASL',
        duration: '4:18',
        level: 'Beginner',
        views: '430K',
        youtubeId: 'z1bEkfsvRys',
        thumbnail: `https://img.youtube.com/vi/z1bEkfsvRys/hqdefault.jpg`,
      },
    ]
  },
  {
    id: 'conversations',
    label: 'Full Conversations',
    icon: '💬',
    videos: [
      {
        id: 'v7',
        title: 'ASL Lesson – Introductions & Small Talk',
        channel: 'Bill Vicars – Lifeprint',
        duration: '20:11',
        level: 'Intermediate',
        views: '1.4M',
        youtubeId: 'gBtKfCFMjxQ',
        thumbnail: `https://img.youtube.com/vi/gBtKfCFMjxQ/hqdefault.jpg`,
      },
      {
        id: 'v8',
        title: 'ASL Conversations – At the Store',
        channel: 'Sign It ASL',
        duration: '11:45',
        level: 'Intermediate',
        views: '560K',
        youtubeId: 'BqJIgjFqMNw',
        thumbnail: `https://img.youtube.com/vi/BqJIgjFqMNw/hqdefault.jpg`,
      },
    ]
  },
  {
    id: 'emotions',
    label: 'Emotions & Expressions',
    icon: '😊',
    videos: [
      {
        id: 'v9',
        title: 'How to Sign Emotions & Feelings in ASL',
        channel: 'ASL Meredith',
        duration: '7:55',
        level: 'Beginner',
        views: '800K',
        youtubeId: 'xNkQi-Mn3-g',
        thumbnail: `https://img.youtube.com/vi/xNkQi-Mn3-g/hqdefault.jpg`,
      },
      {
        id: 'v10',
        title: 'Facial Expressions in ASL – Why They Matter',
        channel: 'Bill Vicars',
        duration: '9:22',
        level: 'Intermediate',
        views: '1.1M',
        youtubeId: 'cXd9fKqlPbQ',
        thumbnail: `https://img.youtube.com/vi/cXd9fKqlPbQ/hqdefault.jpg`,
      },
    ]
  },
];

const LEVEL_COLORS = {
  Beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  Intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const VideoCard = ({ video, onClick }) => (
  <div
    className="group bg-gray-800/60 border border-gray-700 hover:border-indigo-500/70 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/30 hover:-translate-y-0.5"
    onClick={() => onClick(video)}
  >
    {/* Thumbnail */}
    <div className="relative aspect-video bg-gray-900 overflow-hidden">
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={e => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback if thumbnail fails */}
      <div className="hidden absolute inset-0 bg-gray-800 items-center justify-center">
        <BookOpen className="w-12 h-12 text-gray-600" />
      </div>
      {/* Play overlay */}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-indigo-600/90 flex items-center justify-center shadow-xl">
          <Play className="w-6 h-6 text-white ml-1" fill="white" />
        </div>
      </div>
      {/* Duration badge */}
      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-mono">
        {video.duration}
      </div>
    </div>

    {/* Info */}
    <div className="p-4">
      <h4 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
        {video.title}
      </h4>
      <p className="text-gray-400 text-xs mb-3">{video.channel}</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${LEVEL_COLORS[video.level]}`}>
          {video.level}
        </span>
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <Users className="w-3 h-3" />
          {video.views}
        </div>
      </div>
    </div>
  </div>
);

const VideoModal = ({ video, onClose }) => {
  if (!video) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* YouTube embed */}
        <div className="aspect-video bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-5">
          <h3 className="text-white font-bold text-lg mb-1">{video.title}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{video.channel}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{video.duration}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${LEVEL_COLORS[video.level]}`}>
              {video.level}
            </span>
          </div>
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2 border border-gray-600 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Learn = () => {
  const [activeCategory, setActiveCategory] = useState('basics');
  const [activeVideo, setActiveVideo] = useState(null);

  const category = TUTORIAL_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Learn Sign Language</h1>
        <p className="text-gray-400">Master ASL with curated video tutorials — from alphabets to full conversations.</p>
      </div>

      {/* Category Tab Bar */}
      <div className="flex gap-2 flex-wrap mb-8">
        {TUTORIAL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
              activeCategory === cat.id
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {category?.videos.map(video => (
          <VideoCard key={video.id} video={video} onClick={setActiveVideo} />
        ))}
      </div>

      {/* Quick Tips Section */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
          Tips for Learning Sign Language Faster
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { tip: 'Practice in front of a mirror or use the Translate page camera to see your hand shapes clearly.', icon: '🪞' },
            { tip: 'Learn the alphabet first — fingerspelling lets you sign any word you haven\'t memorized yet.', icon: '🔤' },
            { tip: 'Watch Deaf creators on YouTube and TikTok to pick up natural pacing and facial expressions.', icon: '📱' },
            { tip: 'Consistent short sessions (10 min/day) beat infrequent long sessions for muscle memory.', icon: '⏱️' },
            { tip: 'Facial expressions are grammar in ASL — raise eyebrows for yes/no questions, furrow for WH questions.', icon: '😊' },
            { tip: 'Focus on the most common 100 signs first — they cover ~50% of daily conversation.', icon: '🎯' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 bg-gray-900/50 border border-gray-700 p-4 rounded-xl">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-sm text-gray-300 leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
};

export default Learn;
