import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { useCamera } from '../../hooks/useCamera';
import CameraError from './CameraError';

const WebcamComponent = ({ onFrameCapture }) => {
  const { error, hasPermission, requestPermission, webcamRef, captureFrame } = useCamera();
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    let interval;
    if (hasPermission && isCapturing) {
      interval = setInterval(() => {
        const frame = captureFrame();
        if (frame && onFrameCapture) {
          onFrameCapture(frame);
        }
      }, 1000 / 30); // 30 FPS
    }
    return () => clearInterval(interval);
  }, [hasPermission, isCapturing, captureFrame, onFrameCapture]);

  if (error) {
    return <CameraError message={error} onRetry={requestPermission} />;
  }

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover"
        videoConstraints={{ facingMode: "user" }}
        onUserMedia={() => setIsCapturing(true)}
      />
      <div className="absolute top-4 left-4 flex gap-2">
        <div className={`px-2 py-1 rounded text-xs font-bold ${isCapturing ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}>
          {isCapturing ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>
    </div>
  );
};

export default WebcamComponent;
