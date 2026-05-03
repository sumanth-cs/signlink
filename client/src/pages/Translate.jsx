import React, { useState, useEffect, useRef } from 'react';
import WebcamComponent from '../components/Camera/WebcamComponent';
import { useWebSocket } from '../hooks/useWebSocket';
import { Trash2, Copy, Volume2, Zap, Circle, Play, Square, Delete, Mic, MicOff, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';
import { API_URL } from '../utils/constants';

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
  const [sentence, setSentence]         = useState('');
  
  // Advanced Features State
  const [isListening, setIsListening] = useState(false);
  const [captions, setCaptions] = useState('');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');

  // Speech Recognition Setup
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setCaptions(finalTranscript || interimTranscript);
      };

      recognition.onend = () => {
        if (isListening) recognition.start();
      };

      recognitionRef.current = recognition;
    }
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const handleFrame = (frame) => {
    if (isTranslating) sendFrame(frame);
  };

  useEffect(() => {
    if (!prediction?.word_added || !isTranslating) return;
    const label = prediction.text;
    if (!label || label === '—') return;

    setSentence(prev => {
      if (prediction.is_word) return prev + label + ' ';
      return prev + label.toUpperCase();
    });

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

  const handleBackspace = () => setSentence(prev => prev.trimEnd().slice(0, -1));
  const handleClearSentence = () => setSentence('');

  const handleRefineSentence = async () => {
    if (!sentence) return;
    setIsRefining(true);
    
    try {
      const response = await fetch(`${API_URL}/ai/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rawSentence: sentence,
          targetLanguage: targetLanguage
        })
      });

      const data = await response.json();
      
      if (response.ok && data.refinedSentence) {
        setSentence(data.refinedSentence);
      } else {
        console.error('Refinement failed:', data.error);
        alert(data.error || 'Failed to refine sentence. Please check API Key.');
      }
    } catch (error) {
      console.error('Network error during refinement:', error);
    } finally {
      setIsRefining(false);
    }
  };

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

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500 ${isEmergencyMode ? 'bg-red-950/20' : ''}`}>

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Sign<span className="accent-gradient">Link</span>
          </h1>
          <p className="text-slate-400 max-w-lg">
            Advanced real-time communication bridge for the Deaf and Hard of Hearing community.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsEmergencyMode(!isEmergencyMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isEmergencyMode 
                ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-900/50' 
                : 'bg-white/5 text-red-400 border border-red-400/20 hover:bg-red-400/10'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            {isEmergencyMode ? 'EMERGENCY MODE ACTIVE' : 'Emergency Mode'}
          </button>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Translate To:</span>
            <select 
              value={targetLanguage} 
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
            >
              <option className="bg-[#0a0a0c]" value="en">English (US)</option>
              <option className="bg-[#0a0a0c]" value="es">Spanish</option>
              <option className="bg-[#0a0a0c]" value="hi">Hindi</option>
              <option className="bg-[#0a0a0c]" value="ja">Japanese</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-slate-300 font-medium">{isConnected ? 'AI Engine Live' : 'AI Offline'}</span>
          </div>
        </div>
      </div>

      {/* Main Interface Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT: Translation Hub (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Camera Viewport */}
          <div className="relative glass-card overflow-hidden premium-shadow group">
            <WebcamComponent onFrameCapture={handleFrame} />
            
            {/* Live Overlay UI */}
            {isTranslating && prediction && (
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                <div className="glass-card px-4 py-3 border-indigo-500/30">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-bold mb-1">Live Sentiment</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emotion.emoji}</span>
                    <span className="text-sm font-bold text-white capitalize">{emotionKey}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="glass-card px-6 py-4 border-indigo-500/50 min-w-[120px] text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-bold mb-1">
                      {isWord ? 'Word Detected' : 'Letter Detected'}
                    </p>
                    <p className="text-4xl font-black text-white">{currentLabel}</p>
                    <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                    <p className="text-[10px] mt-1 text-slate-400">{confidence.toFixed(1)}% Confidence</p>
                  </div>
                </div>
              </div>
            )}

            {/* Captions Overlay (The "Two-Way Bridge") */}
            {isListening && captions && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl text-center shadow-2xl">
                  <p className="text-indigo-400 text-[10px] uppercase tracking-widest font-bold mb-2">Hearing Person Speaking</p>
                  <p className="text-xl text-white font-medium leading-relaxed italic">"{captions}"</p>
                </div>
              </div>
            )}

            {/* Camera Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTranslating(!isTranslating)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    isTranslating 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-900/40' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/40'
                  }`}
                >
                  {isTranslating ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  {isTranslating ? 'Stop Recognition' : 'Start Recognition'}
                </button>

                <button
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    isListening 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/40' 
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isListening ? 'Stop Mic' : 'Listen to Hearing Person'}
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-4 text-white/40 text-xs">
                <div className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Low Latency</div>
                <div className="flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> Encrypted</div>
              </div>
            </div>
          </div>

          {/* Quick Help / Instructions */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass-card p-4 border-white/5">
              <p className="text-indigo-400 font-bold text-[10px] uppercase mb-1">Tip 1</p>
              <p className="text-xs text-slate-400">Hold your hand steady for 2 seconds to confirm a sign.</p>
            </div>
            <div className="glass-card p-4 border-white/5">
              <p className="text-purple-400 font-bold text-[10px] uppercase mb-1">Tip 2</p>
              <p className="text-xs text-slate-400">Hearing mode works best in quiet environments.</p>
            </div>
            <div className="glass-card p-4 border-white/5">
              <p className="text-pink-400 font-bold text-[10px] uppercase mb-1">Tip 3</p>
              <p className="text-xs text-slate-400">Use "Emergency Mode" for high-priority situation signs.</p>
            </div>
          </div>
        </div>

        {/* RIGHT: Sentence & Control (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Live Sentence Card */}
          <div className="glass-card p-6 border-indigo-500/20 premium-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Output Sentence</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={handleSpeak} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 min-h-[120px] mb-4">
              <p className="text-lg text-white font-medium leading-relaxed tracking-wide">
                {sentence || <span className="text-slate-600 italic">Waiting for your signs...</span>}
                {sentence && <span className="inline-block w-1.5 h-5 ml-1 bg-indigo-500 animate-pulse align-middle" />}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRefineSentence}
                disabled={isRefining || !sentence}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isRefining ? 'animate-spin' : ''}`} />
                {isRefining ? 'AI Refining...' : 'Refine Sentence'}
              </button>
              <button
                onClick={handleClearSentence}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 text-xs font-bold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>

          {/* Transcript History */}
          <div className="glass-card flex flex-col h-[400px]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Confirmed Signs</h3>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full font-bold">
                {history.length} Total
              </span>
            </div>
            
            <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <MessageSquare className="w-12 h-12 mb-2" />
                  <p className="text-xs italic">No history yet</p>
                </div>
              ) : (
                history.map(entry => (
                  <div key={entry.id} className="group glass-card bg-white/[0.02] p-3 border-white/[0.05] hover:border-indigo-500/30 transition-all">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-bold ${entry.isWord ? 'text-indigo-300' : 'text-slate-300'}`}>
                        {entry.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{entry.time}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[9px] text-slate-600 uppercase tracking-tighter">
                        {entry.isWord ? 'Word' : 'Character'}
                      </span>
                      <span className={`text-[9px] font-bold ${entry.confidence > 80 ? 'text-green-500/50' : 'text-yellow-500/50'}`}>
                        {entry.confidence.toFixed(0)}% Match
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Translate;
