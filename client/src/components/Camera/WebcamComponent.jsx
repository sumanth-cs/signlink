import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';

const WebcamComponent = ({ onFrameCapture }) => {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [errorType, setErrorType] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [devices, setDevices] = useState([]);

  // Send frames when camera is live
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

  // On idle screen – enumerate available devices for diagnostics
  useEffect(() => {
    if (status !== 'idle' && status !== 'error') return;
    navigator.mediaDevices?.enumerateDevices().then(devs => {
      setDevices(devs.filter(d => d.kind === 'videoinput'));
    }).catch(() => {});
  }, [status]);

  const requestAccess = useCallback(async () => {
    setErrorMsg('');
    setErrorType('');
    try {
      // Most permissive request possible – no size/facing constraints
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
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('not-found');
      } else {
        setErrorMsg('unknown');
      }
    }
  }, []);

  if (status === 'idle') {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-xl border border-gray-700 flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-5xl">📷</div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-1">Enable Camera</p>
          <p className="text-gray-400 text-sm mb-1">Click below and allow access when your browser asks.</p>
          {devices.length > 0 ? (
            <p className="text-green-400 text-xs">✅ Camera detected: {devices[0]?.label || 'Camera device found'}</p>
          ) : (
            <p className="text-yellow-400 text-xs">⚠️ No camera visible yet — may need macOS permission</p>
          )}
        </div>
        <button onClick={requestAccess}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg">
          Enable Camera →
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-xl border border-red-800/50 flex flex-col items-center justify-center gap-3 p-5 text-center overflow-y-auto">
        <p className="text-red-400 font-semibold text-base">Camera Error — {errorType}</p>

        {/* NOT FOUND — macOS system block (most common on Mac) */}
        {errorMsg === 'not-found' && (
          <div className="w-full text-left">
            <p className="text-gray-300 text-sm mb-3 text-center">
              macOS is blocking Chrome from seeing your camera.<br/>
              <span className="text-yellow-300">This is NOT a Chrome issue — it's a macOS privacy setting.</span>
            </p>
            <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl p-4 text-xs text-amber-200 space-y-1.5">
              <p className="font-bold text-amber-300 text-sm mb-2">🍎 Fix in 30 seconds:</p>
              <p>1. Press <kbd className="bg-gray-700 px-1.5 py-0.5 rounded font-mono">⌘ Space</kbd> → type <strong>System Settings</strong> → open it</p>
              <p>2. Go to <strong>Privacy & Security</strong> → <strong>Camera</strong></p>
              <p>3. Find <strong>Google Chrome</strong> in the list → toggle it <strong>ON</strong> 🟢</p>
              <p>4. Press <kbd className="bg-gray-700 px-1.5 py-0.5 rounded font-mono">⌘ Q</kbd> to <strong>completely quit Chrome</strong></p>
              <p>5. Reopen Chrome → come back to this page → click Retry</p>
            </div>
            <div className="mt-2 bg-gray-800 border border-gray-600 rounded-lg p-2 text-xs text-gray-400">
              Camera devices visible: <span className={devices.length > 0 ? 'text-green-400' : 'text-red-400'}>
                {devices.length > 0 ? `✅ ${devices[0]?.label || 'Camera found'}` : '❌ None (confirming macOS block)'}
              </span>
            </div>
          </div>
        )}

        {/* BROWSER DENIED */}
        {errorMsg === 'browser-denied' && (
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-xs text-gray-300 text-left space-y-1.5 w-full">
            <p className="font-semibold text-white">Chrome blocked camera access:</p>
            <p>1. Click the 🔒 <strong>lock icon</strong> in the address bar (left of localhost:3000)</p>
            <p>2. Set <strong>Camera</strong> to <strong>Allow</strong></p>
            <p>3. Refresh the page and click Retry</p>
          </div>
        )}

        {/* IN USE by another app */}
        {errorMsg === 'in-use' && (
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-xs text-gray-300 text-left space-y-1.5 w-full">
            <p className="font-semibold text-white">Camera is in use by another app:</p>
            <p>• Close <strong>FaceTime</strong>, <strong>Zoom</strong>, <strong>Photo Booth</strong></p>
            <p>• Stop any running <strong>asl_vision.py</strong> script in terminal</p>
            <p>• Then click Retry</p>
          </div>
        )}

        {/* Unknown */}
        {errorMsg === 'unknown' && (
          <p className="text-gray-400 text-sm">Try closing other camera apps and click Retry.</p>
        )}

        <button onClick={requestAccess}
          className="mt-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">
          Retry Camera
        </button>
      </div>
    );
  }

  // GRANTED — show live webcam
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
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
      <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
        isLive ? 'bg-red-600/90 text-white' : 'bg-gray-700/80 text-gray-300'
      }`}>
        {isLive ? <><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE</> : 'STARTING...'}
      </div>
    </div>
  );
};

export default WebcamComponent;
