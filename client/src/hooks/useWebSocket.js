import { useState, useEffect, useCallback, useRef } from 'react';
import { WS_URL } from '../utils/constants';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to AI Engine');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'prediction') {
        setPrediction(data);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected, retrying in 3s...');
      setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket Error:', err);
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendFrame = useCallback((frameBase64) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(frameBase64);
    }
  }, [isConnected]);

  return {
    isConnected,
    prediction,
    sendFrame
  };
};
