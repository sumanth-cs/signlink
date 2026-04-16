export const SIGNS = [
  { id: 'hello', name: 'Hello', difficulty: 'Easy' },
  { id: 'thanks', name: 'Thank You', difficulty: 'Easy' },
  { id: 'iloveyou', name: 'I Love You', difficulty: 'Medium' },
  { id: 'yes', name: 'Yes', difficulty: 'Easy' },
  { id: 'no', name: 'No', difficulty: 'Easy' }
];

export const EMOTIONS = {
  happy: { color: 'text-green-400', icon: 'Smile' },
  sad: { color: 'text-blue-400', icon: 'Frown' },
  angry: { color: 'text-red-400', icon: 'Angry' },
  surprised: { color: 'text-yellow-400', icon: 'Surprise' },
  neutral: { color: 'text-gray-400', icon: 'Meh' }
};

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
