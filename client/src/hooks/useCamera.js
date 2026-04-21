import { useState, useCallback, useRef } from 'react';

export const useCamera = () => {
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const webcamRef = useRef(null);

  // Just checks if camera API exists; actual permission is granted
  // when react-webcam mounts and calls getUserMedia internally.
  const requestPermission = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera not supported in this browser');
    }
    // Let react-webcam handle the actual camera stream.
    // We surface errors via onUserMediaError below.
  }, []);

  const onUserMedia = useCallback(() => {
    setHasPermission(true);
    setError(null);
  }, []);

  const onUserMediaError = useCallback((err) => {
    setHasPermission(false);
    setError(err.name === 'NotAllowedError' ? 'Camera permission denied. Please allow camera access.' : 'Camera not found or in use by another app.');
  }, []);

  const captureFrame = useCallback(() => {
    if (webcamRef.current) {
      return webcamRef.current.getScreenshot();
    }
    return null;
  }, []);

  return {
    error,
    hasPermission,
    requestPermission,
    onUserMedia,
    onUserMediaError,
    webcamRef,
    captureFrame
  };
};
