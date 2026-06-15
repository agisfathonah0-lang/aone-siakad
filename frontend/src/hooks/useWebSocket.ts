import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

type MessageHandler = (event: string, data: any) => void;

export function useWebSocket(handler?: MessageHandler) {
  const ws = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  const connect = useCallback(() => {
    if (!user || ws.current?.readyState === WebSocket.OPEN) return;

    const token = localStorage.getItem('aone_access_token');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws?token=${token}`;

    ws.current = new WebSocket(url);
    ws.current.onmessage = (e) => {
      try {
        const { event, data } = JSON.parse(e.data);
        handler?.(event, data);
      } catch { /* ignore */ }
    };
    ws.current.onclose = () => {
      setTimeout(connect, 5000);
    };
  }, [user, handler]);

  useEffect(() => {
    connect();
    return () => { ws.current?.close(); };
  }, [connect]);

  return ws;
}
