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

  // ── MediaPipe Hand Skeleton (browser-side, CDN) ───────────────────────
  const drawSkeleton = useCallback((results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks?.length) return;

    const landmarks = results.multiHandLandmarks[0];
    const w = canvas.width;
    const h = canvas.height;

    // Draw connections
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.85)'; // indigo-500
    ctx.lineWidth = 2.5;
    for (const [a, b] of HAND_CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
      ctx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
      ctx.stroke();
    }

    // Draw landmark dots
    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i].x * w;
      const y = landmarks[i].y * h;
      const isTip = [4,8,12,16,20].includes(i); // fingertip = bigger dot

      ctx.beginPath();
      ctx.arc(x, y, isTip ? 6 : 3.5, 0, 2 * Math.PI);
      ctx.fillStyle   = isTip ? '#a5b4fc' : 'rgba(165,180,252,0.7)'; // indigo-300
      ctx.fill();
      ctx.strokeStyle = '#4f46e5'; // indigo-600
      ctx.lineWidth   = 1.5;
      ctx.stroke();
    }
  }, []);

  const initMediaPipe = useCallback(() => {
    if (!window.Hands) return;

    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands:            1,
      modelComplexity:        0,   // 0 = lite (fast), 1 = full (accurate)
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

    // MediaPipe scripts may take a moment to load from CDN
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

  // ── Camera permission request ─────────────────────────────────────────
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

  // ── IDLE ──────────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-xl border border-gray-700 flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-5xl">📷</div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-1">Enable Camera</p>
          <p className="text-gray-400 text-sm">Click below — your camera is used locally only.</p>
        </div>
        <button onClick={requestAccess}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg">
          Enable Camera →
        </button>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-xl border border-red-800/50 flex flex-col items-center justify-center gap-3 p-5 text-center overflow-y-auto">
        <p className="text-red-400 font-semibold">Camera Error — {errorType}</p>

        {errorMsg === 'not-found' && (
          <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl p-4 text-xs text-amber-200 text-left w-full space-y-1.5">
            <p className="font-bold text-amber-300">🍎 macOS fix (30 sec):</p>
            <p>1. ⌘ Space → <strong>System Settings</strong></p>
            <p>2. <strong>Privacy & Security → Camera</strong></p>
            <p>3. Toggle <strong>Google Chrome ON</strong> 🟢</p>
            <p>4. ⌘ Q to <strong>quit Chrome completely</strong></p>
            <p>5. Reopen Chrome → Retry</p>
          </div>
        )}
        {errorMsg === 'browser-denied' && (
          <p className="text-gray-300 text-sm">Click the 🔒 lock icon in the address bar → set Camera to Allow → refresh.</p>
        )}
        {errorMsg === 'in-use' && (
          <p className="text-gray-300 text-sm">Camera is being used by another app. Close FaceTime / Zoom and retry.</p>
        )}

        <button onClick={requestAccess}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">
          Retry Camera
        </button>
      </div>
    );
  }

  // ── LIVE ──────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
      {/* Video feed */}
      <Webcam
        key={retryKey}
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.7}
        mirrored={true}
        className="w-full h-full object-cover"
        videoConstraints={{ facingMode: 'user' }}
        onUserMedia={() => setIsLive(true)}
        onUserMediaError={(err) => {
          setIsLive(false);
          setStatus('error');
          setErrorType(err.name);
          setErrorMsg('in-use');
        }}
      />

      {/* Hand skeleton canvas — perfectly overlaid */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: 'scaleX(-1)' }} /* mirror to match webcam */
      />

      {/* LIVE badge */}
      <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold z-10 ${
        isLive ? 'bg-red-600/90 text-white' : 'bg-gray-700/80 text-gray-300'
      }`}>
        {isLive
          ? <><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE</>
          : 'STARTING...'}
      </div>

      {/* Skeleton legend */}
      {isLive && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2.5 py-1 rounded-full z-10">
          <span className="w-3 h-0.5 bg-indigo-400 inline-block rounded" />
          <span className="text-[10px] text-indigo-300 font-medium">Hand Skeleton</span>
        </div>
      )}
    </div>
  );
};

export default WebcamComponent;
