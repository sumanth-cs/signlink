import React from 'react';
import { Smile, Frown, Angry, Meh } from 'lucide-react';
import { EMOTIONS } from '../../utils/constants';

const SentimentIndicator = ({ sentiment }) => {
  if (!sentiment) return null;

  const { emotion, intensity } = sentiment;
  const config = EMOTIONS[emotion] || EMOTIONS.neutral;
  
  const Icon = {
    'happy': Smile,
    'sad': Frown,
    'angry': Angry,
    'neutral': Meh,
    'surprised': Smile // Map surprise
  }[emotion] || Meh;

  return (
    <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur rounded-full p-2 flex items-center gap-2 border border-gray-700">
      <Icon className={`${config.color}`} style={{ opacity: 0.5 + (intensity * 0.5) }} size={24} />
      <span className="text-xs font-medium text-gray-300 pr-2 capitalize">{emotion}</span>
    </div>
  );
};

export default SentimentIndicator;
