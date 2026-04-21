import React, { useState, useEffect, useRef } from 'react';
import WebcamComponent from '../components/Camera/WebcamComponent';
import { useWebSocket } from '../hooks/useWebSocket';
import { Trash2, Copy, Volume2, Zap, Circle } from 'lucide-react';

const EMOTION_CONFIG = {
  happy:     { emoji: '😄', color: 'text-green-400',  bar: 'bg-green-500' },
  neutral:   { emoji: '😐', color: 'text-gray-400',   bar: 'bg-gray-500' },
  focused:   { emoji: '🎯', color: 'text-blue-400',   bar: 'bg-blue-500' },
  uncertain: { emoji: '🤔', color: 'text-yellow-400', bar: 'bg-yellow-500' },
};

const Translate = () => {
  const transcriptRef = useRef(null);
  const { isConnected, prediction, sendFrame } = useWebSocket();
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Maintain transcript history
  useEffect(() => {
    if (!prediction?.text || !prediction.word_added) return;
    setHistory(prev => {
      const entry = {
        id: Date.now(),
        letter: prediction.text,
        sentence: prediction.sentence,
        confidence: prediction.confidence,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      return [...prev, entry].slice(-30);
    });
  }, [prediction]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [history]);

  const sentence   = prediction?.sentence    || '';
  const confidence = prediction?.confidence  || 0;
  const currentLetter = prediction?.text     || '—';
  const emotionKey = prediction?.sentiment?.emotion || 'neutral';
  const emotion    = EMOTION_CONFIG[emotionKey] || EMOTION_CONFIG.neutral;
  const intensity  = prediction?.sentiment?.intensity || 0.5;

  const handleCopy = () => {
    if (sentence) {
      navigator.clipboard.writeText(sentence);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    if (sentence && 'speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(sentence));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Real-Time Translation</h1>
          <p className="text-sm text-gray-400 mt-0.5">Enable your camera and sign — letters are detected and spelled out live.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-700 bg-gray-800 text-sm">
          <Circle className={`w-2.5 h-2.5 ${isConnected ? 'text-green-400 fill-green-400' : 'text-red-400 fill-red-400'}`} />
          <span className="text-gray-300">{isConnected ? 'AI Engine Connected' : 'AI Engine Offline'}</span>
        </div>
      </div>

      {/* ── Main 2-column layout ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* LEFT: Camera (3/5) */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Camera + detection overlay */}
          <div className="relative">
            <WebcamComponent onFrameCapture={sendFrame} />

            {/* Detection badge — top right corner of camera */}
            {prediction && (
              <div className="absolute top-3 right-3 bg-gray-900/90 backdrop-blur border border-gray-600 px-3 py-2 rounded-xl flex flex-col items-center min-w-[80px] z-10">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Detected</p>
                <p className="text-3xl font-black text-white leading-none">{currentLetter}</p>
                <p className={`text-xs mt-1 font-semibold ${
                  confidence >= 70 ? 'text-green-400' : confidence >= 45 ? 'text-yellow-400' : 'text-red-400'
                }`}>{confidence.toFixed(1)}%</p>
              </div>
            )}

            {/* Confidence bar */}
            {prediction && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-10 rounded-b-xl overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    confidence >= 70 ? 'bg-green-500' : confidence >= 45 ? 'bg-yellow-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
            )}
          </div>

          {/* Hint bar */}
          <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl px-4 py-3 text-xs text-indigo-300 flex flex-wrap gap-x-4 gap-y-1">
            <span>💡 <strong>Hold a sign still for ~2 sec</strong> to confirm it</span>
            <span>🗑️ <strong>Del</strong> removes last char &nbsp;|&nbsp; <strong>Space</strong> adds space</span>
          </div>
        </div>

        {/* RIGHT: Info panels (2/5) — always visible */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* 1. Live Sentence */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-white">Live Sentence</span>
              </div>
              <div className="flex gap-1.5">
                <button onClick={handleCopy} title="Copy"
                  className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleSpeak} title="Read aloud"
                  className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="min-h-[52px] px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg font-mono text-base text-white tracking-wider">
              {sentence
                ? <>{sentence}<span className="animate-pulse text-indigo-400">|</span></>
                : <span className="text-gray-500 font-sans text-sm not-italic">Waiting for signs…</span>
              }
            </div>
            {copied && <p className="text-xs text-green-400 mt-1 text-right">Copied!</p>}
          </div>

          {/* 2. Detected Letter + Confidence */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Current Detection</p>
            <div className="flex items-end gap-4">
              <div className="text-5xl font-black text-white w-14 text-center leading-none">{currentLetter}</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Confidence</span>
                  <span className={confidence >= 70 ? 'text-green-400' : confidence >= 45 ? 'text-yellow-400' : 'text-red-400'}>
                    {confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      confidence >= 70 ? 'bg-green-500' : confidence >= 45 ? 'bg-yellow-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Emotion */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Sentiment</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{emotion.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-semibold capitalize mb-1 ${emotion.color}`}>{emotionKey}</p>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${emotion.bar}`}
                    style={{ width: `${intensity * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Transcript */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col flex-1 min-h-[200px]">
            <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
              <h3 className="text-sm font-semibold text-white">Transcript</h3>
              <button onClick={() => setHistory([])} title="Clear"
                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div
              ref={transcriptRef}
              className="flex-1 overflow-y-auto flex flex-col gap-2"
              style={{ scrollbarWidth: 'thin', maxHeight: '200px' }}
            >
              {history.length === 0
                ? <p className="text-gray-500 text-xs text-center mt-4 italic">No signs detected yet…</p>
                : history.map(entry => (
                  <div key={entry.id} className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-indigo-300 font-bold">{entry.letter}</span>
                      <span className="text-[10px] text-gray-500">{entry.time}</span>
                    </div>
                    <p className="text-white text-xs font-mono break-all">{entry.sentence}</p>
                  </div>
                ))
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Translate;
