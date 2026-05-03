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

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = process.env.REACT_APP_API_URL || (isLocal ? 'http://localhost:5000/api' : 'https://signlink-eb6o.onrender.com/api');

// Note: Replace 'YOUR_PYTHON_APP.onrender.com' with the actual Render URL of your Python AI Engine
export const WS_URL = process.env.REACT_APP_WS_URL || (isLocal ? 'ws://localhost:8000/ws' : 'wss://signlinkai-pezj.onrender.com');
