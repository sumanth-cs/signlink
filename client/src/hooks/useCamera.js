import { useState, useCallback, useRef } from 'react';

export const useCamera = () => {
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const webcamRef = useRef(null);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      setError(null);
      // clean up stream right after permission check
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setHasPermission(false);
      setError(err.name === 'NotAllowedError' ? 'Permission Denied' : 'Camera Not Found');
    }
  }, []);

  const captureFrame = useCallback(() => {
    if (webcamRef.current) {
      return webcamRef.current.getScreenshot();
    }
    return null;
  }, [webcamRef]);

  return {
    error,
    hasPermission,
    requestPermission,
    webcamRef,
    captureFrame
  };
};
