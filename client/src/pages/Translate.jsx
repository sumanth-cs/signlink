import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { useWebSocket } from '../hooks/useWebSocket';
import { Trash2, Copy, Volume2, Zap, Circle } from 'lucide-react';

const EMOTION_CONFIG = {
  happy:     { emoji: '😊', color: 'text-green-400',  bar: 'bg-green-500' },
  neutral:   { emoji: '😐', color: 'text-gray-400',   bar: 'bg-gray-500' },
  focused:   { emoji: '🎯', color: 'text-blue-400',   bar: 'bg-blue-500' },
  uncertain: { emoji: '🤔', color: 'text-yellow-400', bar: 'bg-yellow-500' },
};

const Translate = () => {
  const webcamRef = useRef(null);
  const transcriptRef = useRef(null);
  const { isConnected, prediction, sendFrame } = useWebSocket();
  const [history, setHistory] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Send webcam frames to AI engine
  useEffect(() => {
    if (!isCapturing || !isConnected) return;
    const interval = setInterval(() => {
      if (webcamRef.current) {
        const frame = webcamRef.current.getScreenshot();
        if (frame) sendFrame(frame);
      }
    }, 100); // 10 fps — sufficient for ViT inference
    return () => clearInterval(interval);
  }, [isCapturing, isConnected, sendFrame]);

  // Maintain transcript history (deduplicated)
  useEffect(() => {
    if (!prediction?.text || !prediction.word_added) return;
    setHistory(prev => {
      const newEntry = {
        id: Date.now(),
        letter: prediction.text,
        sentence: prediction.sentence,
        confidence: prediction.confidence,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      return [...prev, newEntry].slice(-30);
    });
  }, [prediction]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [history]);

  const handleCopy = () => {
    const text = prediction?.sentence || '';
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    const text = prediction?.sentence || '';
    if (text && 'speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utt);
    }
  };

  const emotion = prediction?.sentiment
    ? EMOTION_CONFIG[prediction.sentiment.emotion] || EMOTION_CONFIG.neutral
    : EMOTION_CONFIG.neutral;

  const confidence = prediction?.confidence || 0;
  const currentLetter = prediction?.text || '—';
  const sentence = prediction?.sentence || '';

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Real-Time Translation</h1>
          <p className="text-sm text-gray-400 mt-1">
            Place your hand in the green box and hold each letter for ~2 seconds to spell.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-700 bg-gray-800">
          <Circle
            className={`w-2.5 h-2.5 ${isConnected ? 'text-green-400 fill-green-400' : 'text-red-400 fill-red-400'}`}
          />
          <span className="text-sm text-gray-300">
            {isConnected ? 'AI Engine Connected' : 'Disconnected — start server'}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* ── Camera Column ────────────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Camera feed */}
          <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: 'user' }}
              onUserMedia={() => setIsCapturing(true)}
              onUserMediaError={() => setIsCapturing(false)}
            />

            {/* LIVE indicator */}
            <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
              isCapturing ? 'bg-red-600/90 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              {isCapturing && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              {isCapturing ? 'LIVE' : 'OFFLINE'}
            </div>

            {/* Current detection overlay — top-right */}
            {prediction && (
              <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur border border-gray-600 px-4 py-3 rounded-xl flex flex-col items-center min-w-[90px]">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Detected</p>
                <p className="text-4xl font-black text-white leading-none">{currentLetter}</p>
                <p className={`text-xs mt-1 font-medium ${
                  confidence >= 70 ? 'text-green-400' : confidence >= 45 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {confidence.toFixed(1)}%
                </p>
              </div>
            )}

            {/* Confidence bar at bottom */}
            {prediction && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    confidence >= 70 ? 'bg-green-500' : confidence >= 45 ? 'bg-yellow-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
            )}
          </div>

          {/* Sentence builder panel */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-gray-300">Live Sentence</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  title="Copy sentence"
                  className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSpeak}
                  title="Read aloud"
                  className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="min-h-[56px] px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl font-mono text-lg text-white tracking-wider">
              {sentence || <span className="text-gray-500 font-sans text-base not-italic">Waiting for signs…</span>}
              {sentence && <span className="animate-pulse text-indigo-400">|</span>}
            </div>
            {copied && (
              <p className="text-xs text-green-400 mt-1 text-right">Copied to clipboard!</p>
            )}
          </div>

          {/* Emotion indicator */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
            <span className="text-3xl">{emotion.emoji}</span>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Confidence Sentiment — {prediction?.sentiment?.emotion || 'neutral'}
              </p>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${emotion.bar}`}
                  style={{ width: `${(prediction?.sentiment?.intensity || 0.5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Transcript Column ─────────────────────────────────────── */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
            <h3 className="text-base font-semibold text-white">Transcript</h3>
            <button
              title="Clear transcript"
              onClick={() => setHistory([])}
              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={transcriptRef}
            className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-8 italic">
                No signs detected yet…
              </p>
            ) : (
              history.map(entry => (
                <div
                  key={entry.id}
                  className="bg-gray-900/70 border border-gray-700 p-3 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-indigo-300 font-bold text-lg">{entry.letter}</span>
                    <span className="text-xs text-gray-500">{entry.time}</span>
                  </div>
                  <p className="text-white text-sm font-mono break-all">
                    {entry.sentence}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* How-to hint bar */}
      <div className="mt-6 bg-indigo-900/30 border border-indigo-700/40 rounded-xl px-5 py-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-indigo-300">
        <span>💡 <strong>Hold each sign still for ~2 seconds</strong> — the AI confirms it and adds it to your sentence.</span>
        <span>🗑️ <strong>Del sign</strong> removes the last character &nbsp;|&nbsp; <strong>Space sign</strong> adds a space.</span>
      </div>
    </div>
  );
};

export default Translate;
