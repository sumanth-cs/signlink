import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';

// MediaPipe hand connection pairs (standard 21-point hand graph)
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],        // Thumb
  [0,5],[5,6],[6,7],[7,8],        // Index
  [0,9],[9,10],[10,11],[11,12],   // Middle
  [0,13],[13,14],[14,15],[15,16], // Ring
  [0,17],[17,18],[18,19],[19,20], // Pinky
  [5,9],[9,13],[13,17],           // Palm
];

const WebcamComponent = ({ onFrameCapture }) => {
  const webcamRef  = useRef(null);
  const canvasRef  = useRef(null);
  const handsRef   = useRef(null);
  const rafRef     = useRef(null);

  const [status,   setStatus]   = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [errorType,setErrorType]= useState('');
  const [isLive,   setIsLive]   = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // ── Frame capture → parent ────────────────────────────────────────────
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      if (webcamRef.current && onFrameCapture) {
        const frame = webcamRef.current.getScreenshot();
        if (frame) onFrameCapture(frame);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isLive, onFrameCapture]);

  // ── MediaPipe Hand Skeleton (Clean & Professional) ───────────────────────
  const drawSkeleton = useCallback((results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks?.length) return;

    const landmarks = results.multiHandLandmarks[0];
    const w = canvas.width;
    const h = canvas.height;

    // Futuristic Cybernetic Skeleton
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Draw Connections (Bones)
    for (const [a, b] of HAND_CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
      ctx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
      
      // Cybernetic Neon Glow Effect
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)'; // Neon Cyan Base
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Core white laser line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }

    // Draw Joints & Fingertips
    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i].x * w;
      const y = landmarks[i].y * h;
      const z = landmarks[i].z || 0; // Use Z-axis for dynamic sizing
      
      // Adjust size based on depth (Z-axis) for 3D effect
      const depthScale = Math.max(0.5, 1 - (z * -2)); 
      
      const isTip = [4,8,12,16,20].includes(i);
      const isBase = i === 0;

      ctx.beginPath();
      if (isTip) {
        // Holographic Fingertips (Purple/Pink energy nodes)
        ctx.arc(x, y, 6 * depthScale, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.9)'; // Purple-500
        ctx.fill();
        ctx.strokeStyle = 'rgba(232, 121, 249, 1)'; // Fuchsia glow
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
        ctx.shadowBlur = 12;
        ctx.stroke();
      } else if (isBase) {
        // Core Palm Tracker
        ctx.arc(x, y, 8 * depthScale, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fill();
        ctx.strokeStyle = '#00f0ff'; // Cyan
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.stroke();
        
        // Inner core
        ctx.beginPath();
        ctx.arc(x, y, 3 * depthScale, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else {
        // Standard Joint Nodes (Hollow mechanical look)
        ctx.arc(x, y, 4 * depthScale, 0, 2 * Math.PI);
        ctx.fillStyle = '#0a0a0c'; // Dark center
        ctx.fill();
        ctx.strokeStyle = '#00f0ff'; // Cyan rim
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
        ctx.stroke();
      }
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
  }, []);

  const initMediaPipe = useCallback(() => {
    if (!window.Hands) return;

    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands:            1,
      modelComplexity:        0,
      minDetectionConfidence: 0.7,
      minTrackingConfidence:  0.5,
    });
    hands.onResults(drawSkeleton);
    handsRef.current = hands;

    const detect = async () => {
      const video = webcamRef.current?.video;
      if (video && video.readyState >= 2) {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width  = video.videoWidth  || 640;
          canvas.height = video.videoHeight || 480;
        }
        await hands.send({ image: video });
      }
      rafRef.current = requestAnimationFrame(detect);
    };
    detect();
  }, [drawSkeleton]);

  useEffect(() => {
    if (!isLive) return;

    const tryInit = () => {
      if (window.Hands) {
        initMediaPipe();
      } else {
        setTimeout(tryInit, 300);
      }
    };
    tryInit();

    return () => {
      cancelAnimationFrame(rafRef.current);
      handsRef.current?.close();
    };
  }, [isLive, initMediaPipe]);

  const requestAccess = useCallback(async () => {
    setErrorMsg('');
    setErrorType('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      setStatus('granted');
      setRetryKey(k => k + 1);
    } catch (err) {
      setStatus('error');
      setErrorType(err.name);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('browser-denied');
      } else if (err.name === 'NotReadableError') {
        setErrorMsg('in-use');
      } else {
        setErrorMsg('not-found');
      }
    }
  }, []);

  if (status === 'idle') {
    return (
      <div className="w-full aspect-video glass-card border-white/5 flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400 animate-float">
          <div className="text-4xl">📸</div>
        </div>
        <div className="text-center">
          <h3 className="text-white font-black text-xl mb-2 italic">Camera Activation Required</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Enable your camera to start the real-time AI recognition engine.
          </p>
        </div>
        <button onClick={requestAccess}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
          Enable Access →
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="relative w-full aspect-video glass-card border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center gap-4 p-8 pb-24 text-center overflow-y-auto">
        <p className="text-red-400 font-black text-lg uppercase tracking-wider">Camera Access Blocked</p>
        <div className="bg-black/40 border border-red-500/10 rounded-2xl p-6 text-xs text-slate-400 text-left w-full max-w-sm space-y-3">
          <p className="font-bold text-red-300 uppercase tracking-widest text-[10px]">Troubleshooting:</p>
          <p>• Click the lock icon in the address bar and set Camera to <b>Allow</b>.</p>
          <p>• Ensure no other apps (FaceTime/Zoom) are using the camera.</p>
          <p>• Restart your browser if the issue persists.</p>
        </div>
        <button onClick={requestAccess}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors">
          Retry Activation
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video glass-card overflow-hidden border-white/10 group">
      <Webcam
        key={retryKey}
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.4}
        mirrored={true}
        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
        videoConstraints={{ facingMode: 'user' }}
        onUserMedia={() => setIsLive(true)}
        onUserMediaError={(err) => {
          setIsLive(false);
          setStatus('error');
          setErrorType(err.name);
          setErrorMsg('in-use');
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        style={{ transform: 'scaleX(-1)' }}
      />

      <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest z-30 transition-all ${
        isLive ? 'bg-red-500 text-white shadow-lg shadow-red-900/50' : 'bg-slate-800 text-slate-400'
      }`}>
        {isLive ? <><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE ENGINE</> : 'INITIALIZING...'}
      </div>

      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl z-30">
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-75" />
          <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-150" />
        </div>
        <span className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">Neural Track Active</span>
      </div>
    </div>
  );
};

export default WebcamComponent;
