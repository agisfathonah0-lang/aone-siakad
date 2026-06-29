import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

type MessageHandler = (event: string, data: any) => void;

const MAX_RETRIES = 5;

export function useWebSocket(handler?: MessageHandler) {
  const ws = useRef<WebSocket | null>(null);
  const retries = useRef(0);
  const { user } = useAuth();

  const connect = useCallback(() => {
    if (!user || ws.current?.readyState === WebSocket.OPEN || retries.current >= MAX_RETRIES) return;

    const token = localStorage.getItem('aone_access_token');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws?token=${token}`;

    ws.current = new WebSocket(url);
    ws.current.onopen = () => { retries.current = 0; };
    ws.current.onmessage = (e) => {
      try {
        const { event, data } = JSON.parse(e.data);
        handler?.(event, data);
      } catch { /* ignore */ }
    };
    ws.current.onclose = () => {
      retries.current += 1;
      if (retries.current < MAX_RETRIES) setTimeout(connect, 5000);
    };
  }, [user, handler]);

  useEffect(() => {
    retries.current = 0;
    connect();
    return () => { ws.current?.close(); retries.current = MAX_RETRIES; };
  }, [connect]);

  return ws;
}
