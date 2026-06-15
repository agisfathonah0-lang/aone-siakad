import React, { useEffect, useRef, useState } from 'react';
import { Camera, Wifi, WifiOff } from 'lucide-react';
import { api } from '../api';

export default function CctvBroadcast() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'menyiapkan' | 'aktif' | 'gagal'>('menyiapkan');
  const [framesSent, setFramesSent] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const camId = 'CAM-PHONE';
    const deviceName = /Android/i.test(navigator.userAgent) ? 'Android' : /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'iOS' : 'Mobile';

    const start = async () => {
      try {
        // Register camera
        await api.put(`/cctv/${camId}`, {
          name: `Kamera CCTV (${deviceName})`,
          location: 'Perangkat Mobile',
          status: 'Aktif'
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus('aktif');

        // Start broadcasting frames
        setTimeout(() => {
          intervalRef.current = window.setInterval(() => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas) return;
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = canvas.toDataURL('image/jpeg', 0.5);
            api.post(`/cctv/${camId}/frame`, { image }).then(() => {
              setFramesSent(prev => prev + 1);
            }).catch(() => {});
          }, 500);
        }, 500);

      } catch (err: any) {
        setStatus('gagal');
        setErrorMsg(err.message || 'Gagal akses kamera');
      }
    };

    start();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      api.post('/cctv/CAM-PHONE/stop-broadcast').catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
      {/* Camera feed */}
      {status === 'aktif' && (
        <video ref={videoRef} autoPlay playsInline muted className="w-full flex-1 object-cover" />
      )}

      {status === 'menyiapkan' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/60">
            <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-semibold">Mengaktifkan kamera...</p>
            <p className="text-sm mt-2 text-white/40">Pastikan izin kamera diberikan</p>
          </div>
        </div>
      )}

      {status === 'gagal' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-white/60 max-w-md">
            <Camera className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <p className="text-lg font-semibold text-red-400">Kamera tidak dapat diakses</p>
            <p className="text-sm mt-2 text-white/40">{errorMsg}</p>
            <p className="text-xs mt-4 text-white/30">
              Pastikan browser memiliki izin kamera.<br />
              Di Chrome: Setelan Situs → Izin Kamera → Izinkan<br />
              Akses halaman via <b>HTTPS</b> (bukan HTTP).
            </p>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === 'aktif' ? (
              <>
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-white font-semibold text-sm">CCTV Aktif — Broadcast</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-white/50 text-sm">Tidak Aktif</span>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs font-mono">
              {framesSent > 0 ? `${framesSent} frame terkirim` : '...'}
            </p>
          </div>
        </div>
        <p className="text-white/30 text-xs mt-2">
          Halaman ini khusus broadcast — buka CCTV Monitoring di perangkat lain untuk melihat.
        </p>
      </div>
    </div>
  );
}
