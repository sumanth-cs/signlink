import React, { useState, useEffect, useRef } from 'react';
import WebcamComponent from '../components/Camera/WebcamComponent';
import { useWebSocket } from '../hooks/useWebSocket';
import { Trash2, Copy, Volume2, Zap, Circle, Play, Square, Delete } from 'lucide-react';

const EMOTION_CONFIG = {
  happy:     { emoji: '😄', color: 'text-green-400',  bar: 'bg-green-500' },
  neutral:   { emoji: '😐', color: 'text-gray-400',   bar: 'bg-gray-500' },
  focused:   { emoji: '🎯', color: 'text-blue-400',   bar: 'bg-blue-500' },
  uncertain: { emoji: '🤔', color: 'text-yellow-400', bar: 'bg-yellow-500' },
};

const Translate = () => {
  const transcriptRef = useRef(null);
  const { isConnected, prediction, sendFrame } = useWebSocket();
  const [history, setHistory]           = useState([]);
  const [copied, setCopied]             = useState(false);
  const [isTranslating, setTranslating] = useState(false);
  const [sentence, setSentence]         = useState('');  // ← LOCAL sentence state

  // Only forward frames when actively translating
  const handleFrame = (frame) => {
    if (isTranslating) sendFrame(frame);
  };

  // Append confirmed signs to local sentence
  useEffect(() => {
    if (!prediction?.word_added || !isTranslating) return;
    const label = prediction.text;
    if (!label || label === '—') return;

    setSentence(prev => {
      if (prediction.is_word) return prev + label + '  ';
      return prev + label.toUpperCase();
    });

    // Add to transcript history
    setHistory(prev => {
      const entry = {
        id:         Date.now(),
        label,
        isWord:     prediction.is_word,
        confidence: prediction.confidence,
        time:       new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
      };
      return [...prev, entry].slice(-30);
    });
  }, [prediction, isTranslating]);

  // ⌫ Backspace — removes last character from local sentence instantly
  const handleBackspace = () => setSentence(prev => prev.slice(0, -1));

  // 🗑 Clear all
  const handleClearSentence = () => setSentence('');

  // Auto-scroll
  useEffect(() => {
    if (transcriptRef.current)
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [history]);

  const confidence    = prediction?.confidence  || 0;
  const currentLabel  = prediction?.text        || '—';
  const isWord        = prediction?.is_word     || false;
  const emotionKey    = prediction?.sentiment?.emotion || 'neutral';
  const emotion       = EMOTION_CONFIG[emotionKey] || EMOTION_CONFIG.neutral;
  const intensity     = prediction?.sentiment?.intensity || 0.5;

  const handleCopy = () => {
    if (sentence) { navigator.clipboard.writeText(sentence); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };
  const handleSpeak = () => {
    if (sentence && 'speechSynthesis' in window)
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(sentence));
  };
  const toggleTranslating = () => setTranslating(t => !t);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Real-Time Translation</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Enable your camera, press <strong>Start</strong>, then sign — letters and words are detected live.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* AI connection indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-700 bg-gray-800 text-sm">
            <Circle className={`w-2.5 h-2.5 ${isConnected ? 'text-green-400 fill-green-400' : 'text-red-400 fill-red-400'}`} />
            <span className="text-gray-300">{isConnected ? 'AI Connected' : 'AI Offline'}</span>
          </div>
          {/* Start / Stop */}
          <button
            onClick={toggleTranslating}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg ${
              isTranslating
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/40'
            }`}
          >
            {isTranslating
              ? <><Square className="w-3.5 h-3.5" fill="white" />Stop Translating</>
              : <><Play  className="w-3.5 h-3.5" fill="white" />Start Translating</>
            }
          </button>
        </div>
      </div>

      {/* Translation status banner */}
      {isTranslating && (
        <div className="mb-4 flex items-center gap-2 bg-green-900/30 border border-green-700/40 rounded-xl px-4 py-2 text-sm text-green-300">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Translation active — perform a sign and hold still for ~2 seconds to confirm it
        </div>
      )}
      {!isTranslating && (
        <div className="mb-4 bg-gray-800/40 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-400">
          ⏸ Translation paused — press <strong>Start Translating</strong> to begin
        </div>
      )}

      {/* Main layout */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* LEFT: Camera (3/5) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="relative">
            <WebcamComponent onFrameCapture={handleFrame} />

            {/* Detection badge */}
            {isTranslating && prediction && (
              <div className={`absolute top-3 right-3 backdrop-blur border px-3 py-2 rounded-xl flex flex-col items-center min-w-[90px] z-10 transition-all ${
                isWord
                  ? 'bg-indigo-900/90 border-indigo-400'
                  : 'bg-gray-900/90 border-gray-600'
              }`}>
                <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${isWord ? 'text-indigo-300' : 'text-gray-400'}`}>
                  {isWord ? 'Word ✨' : 'Letter'}
                </p>
                <p className={`font-black leading-none text-center ${isWord ? 'text-lg text-white' : 'text-3xl text-white'}`}>
                  {currentLabel}
                </p>
                <p className={`text-xs mt-1 font-semibold ${
                  confidence >= 70 ? 'text-green-400' : confidence >= 45 ? 'text-yellow-400' : 'text-red-400'
                }`}>{confidence.toFixed(1)}%</p>
              </div>
            )}

            {/* Confidence bar */}
            {isTranslating && prediction && (
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

          {/* Word shortcuts reference */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Detectable Signs</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'I Love You', emoji: '🤟' },
                { label: 'Hello', emoji: '👋' },
                { label: 'Yes / Good', emoji: '👍' },
                { label: 'Peace', emoji: '✌️' },
                { label: 'OK', emoji: '👌' },
                { label: 'Pointing', emoji: '👉' },
                { label: 'Stop / No', emoji: '✊' },
                { label: 'A–Z Alphabets', emoji: '🔤' },
              ].map(s => (
                <span key={s.label} className="flex items-center gap-1.5 bg-gray-900 border border-gray-700 px-2.5 py-1 rounded-full text-xs text-gray-300">
                  <span>{s.emoji}</span>{s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Hint */}
          <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl px-4 py-2 text-xs text-indigo-300 flex flex-wrap gap-x-4 gap-y-1">
            <span>💡 Hold sign for ~2 sec to confirm &nbsp;|&nbsp; 🗑️ <strong>Del</strong> removes last char</span>
          </div>
        </div>

        {/* RIGHT: Info panels (2/5) */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Live Sentence */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-white">Live Sentence</span>
              </div>
              <div className="flex gap-1.5">
                {/* ⌫ Backspace */}
                <button
                  onClick={handleBackspace}
                  title="Delete last character"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-900/40 text-gray-400 hover:text-red-300 transition-colors text-xs font-medium"
                >
                  <Delete className="w-3.5 h-3.5" />⌫
                </button>
                {/* Copy */}
                <button onClick={() => {
                    if (sentence) { navigator.clipboard.writeText(sentence); setCopied(true); setTimeout(() => setCopied(false), 2000); }
                  }} title="Copy"
                  className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {/* Speak */}
                <button onClick={() => {
                    if (sentence && 'speechSynthesis' in window)
                      window.speechSynthesis.speak(new SpeechSynthesisUtterance(sentence));
                  }} title="Read aloud"
                  className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                {/* Clear all */}
                <button onClick={handleClearSentence} title="Clear sentence"
                  className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="min-h-[52px] px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg font-mono text-base text-white tracking-wider break-all">
              {sentence
                ? <>{sentence}<span className="animate-pulse text-indigo-400">|</span></>
                : <span className="text-gray-500 font-sans text-sm not-italic">Waiting for signs…</span>
              }
            </div>
            {copied && <p className="text-xs text-green-400 mt-1 text-right">Copied!</p>}
          </div>


          {/* Current Detection */}
          <div className={`border rounded-xl p-4 transition-colors ${
            isWord ? 'bg-indigo-900/30 border-indigo-600/50' : 'bg-gray-800 border-gray-700'
          }`}>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              {isWord ? '✨ Word Detected' : 'Current Letter'}
            </p>
            <div className="flex items-end gap-4">
              <div className={`font-black w-auto min-w-[3rem] leading-none text-center ${
                isWord ? 'text-2xl text-indigo-200' : 'text-5xl text-white'
              }`}>
                {isTranslating ? currentLabel : '—'}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Confidence</span>
                  <span className={confidence >= 65 ? 'text-green-400' : confidence >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                    {isTranslating ? `${confidence.toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      confidence >= 65 ? 'bg-green-500' : confidence >= 40 ? 'bg-yellow-400' : 'bg-red-500'
                    }`}
                    style={{ width: isTranslating ? `${confidence}%` : '0%' }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Min 65% needed to confirm</p>
              </div>
            </div>
          </div>

          {/* Emotion */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Sentiment</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{emotion.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-semibold capitalize mb-1 ${emotion.color}`}>{emotionKey}</p>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${emotion.bar}`}
                    style={{ width: `${intensity * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col min-h-[180px]">
            <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
              <h3 className="text-sm font-semibold text-white">Transcript</h3>
              <button onClick={() => setHistory([])} title="Clear"
                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div ref={transcriptRef} className="flex-1 overflow-y-auto flex flex-col gap-2"
              style={{ scrollbarWidth: 'thin', maxHeight: '180px' }}>
              {history.length === 0
                ? <p className="text-gray-500 text-xs text-center mt-4 italic">No signs confirmed yet…</p>
                : history.map(entry => (
                  <div key={entry.id} className={`border px-3 py-2 rounded-lg ${
                    entry.isWord ? 'bg-indigo-900/30 border-indigo-700' : 'bg-gray-900 border-gray-700'
                  }`}>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={`font-bold text-sm ${entry.isWord ? 'text-indigo-300' : 'text-indigo-300'}`}>
                        {entry.label}
                      </span>
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
