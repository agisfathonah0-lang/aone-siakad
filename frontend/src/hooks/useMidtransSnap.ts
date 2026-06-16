import { useState, useEffect, useCallback, useRef } from 'react';
import { get } from '../api/client';

export function useMidtransSnap() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    get<{ clientKey: string; isProduction: boolean }>('/keuangan/midtrans/config')
      .then((cfg) => {
        if (!cfg.clientKey) {
          setError('Midtrans client key belum dikonfigurasi');
          return;
        }
        const existing = document.querySelector('script[src*="snap.midtrans.com"]');
        if (existing) { setReady(true); return; }
        const script = document.createElement('script');
        script.src = cfg.isProduction
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', cfg.clientKey);
        script.async = true;
        script.onload = () => setReady(true);
        script.onerror = () => setError('Gagal memuat Midtrans Snap');
        document.body.appendChild(script);
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Gagal mengambil konfigurasi Midtrans'));
  }, []);

  const pay = useCallback((snapToken: string, callbacks?: { onSuccess?: (result: any) => void; onPending?: (result: any) => void; onError?: (result: any) => void; onClose?: () => void }) => {
    if (!(window as any).snap) { setError('Midtrans Snap belum siap'); return; }
    (window as any).snap.pay(snapToken, {
      onSuccess: (result: any) => callbacks?.onSuccess?.(result),
      onPending: (result: any) => callbacks?.onPending?.(result),
      onError: (result: any) => callbacks?.onError?.(result),
      onClose: () => callbacks?.onClose?.(),
    });
  }, []);

  return { ready, error, pay };
}
