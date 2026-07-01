import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { post, get } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Camera, CheckCircle, AlertCircle, Sparkles, RefreshCw, User } from 'lucide-react';

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

export default function FaceRegistrationPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();
  const base = `/kampus/${slug}`;

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
  const [status, setStatus] = useState<'idle' | 'captured' | 'registering' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mounted, setMounted] = useState(true);
  const animRef = useRef<number>(0);

  useEffect(() => {
    return () => { setMounted(false); };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.load(MODEL_URL),
          faceapi.nets.faceLandmark68Net.load(MODEL_URL),
          faceapi.nets.faceRecognitionNet.load(MODEL_URL),
        ]);
        if (mounted) setModelsLoaded(true);
      } catch {
        if (mounted) setMessage('Gagal memuat model wajah. Coba refresh halaman.');
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!modelsLoaded) return;
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
        if (!mounted) { s.getTracks().forEach(t => t.stop()); return; }
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        if (mounted) setMessage('Kamera tidak tersedia. Izinkan akses kamera.');
      }
    };
    start();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, [modelsLoaded]);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || status === 'captured' || status === 'registering' || status === 'success') return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.readyState < 2) { animRef.current = requestAnimationFrame(detectFace); return; }

    const det = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (det) {
      const resized = faceapi.resizeResults(det, displaySize);
      const box = resized.detection.box;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      ctx.fillStyle = '#22c55e';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText(`Confidence: ${(det.detection.score * 100).toFixed(1)}%`, box.x, box.y - 8);

      setFaceDetected(true);
      setDescriptor(det.descriptor);
    } else {
      setFaceDetected(false);
      setDescriptor(null);
    }

    animRef.current = requestAnimationFrame(detectFace);
  }, [status]);

  useEffect(() => {
    if (cameraReady && status !== 'success') animRef.current = requestAnimationFrame(detectFace);
    return () => cancelAnimationFrame(animRef.current);
  }, [cameraReady, status]);

  const handleCapture = async () => {
    if (!descriptor) return;
    setStatus('captured');
    cancelAnimationFrame(animRef.current);
    setStatus('registering');
    try {
      const arr = Array.from(descriptor);
      await post('/akademik/absensi-face/register', { descriptor: arr });
      setStatus('success');
      setMessage('Wajah berhasil diregistrasi!');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.response?.data?.message || 'Gagal registrasi wajah');
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setMessage('');
    setDescriptor(null);
    setFaceDetected(false);
    animRef.current = requestAnimationFrame(detectFace);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2.5 mb-1">
        <Camera size={20} className="text-emerald-500" />
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Registrasi Wajah</h1>
      </div>
      <p className="text-xs text-slate-500 dark:text-zinc-400 -mt-2">
        Posisikan wajah di tengah kamera, pastikan pencahayaan cukup
      </p>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2.5 ${
          status === 'success' ? 'bg-emerald-50 text-emerald-700' :
          status === 'error' ? 'bg-red-50 text-red-600' :
          'bg-amber-50 text-amber-600'
        }`}>
          {status === 'success' ? <CheckCircle size={14} className="shrink-0 mt-0.5" /> :
           status === 'error' ? <AlertCircle size={14} className="shrink-0 mt-0.5" /> :
           <AlertCircle size={14} className="shrink-0 mt-0.5" />}
          {message}
        </div>
      )}

      <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/3]">
        {!modelsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <div className="text-center">
              <Loader2 size={24} className="animate-spin text-emerald-500 mx-auto" />
              <p className="text-xs text-zinc-400 mt-3">Memuat model wajah...</p>
            </div>
          </div>
        )}
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {!faceDetected && cameraReady && status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-56 rounded-2xl border-2 border-dashed border-white/30" />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {(status === 'idle' || status === 'captured') && (
          <button onClick={handleCapture} disabled={!faceDetected}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--primary)' }}>
            <Camera size={15} /> {faceDetected ? 'Registrasi Wajah' : 'Arahkan wajah ke kamera'}
          </button>
        )}
        {status === 'registering' && (
          <button disabled className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 opacity-50"
            style={{ background: 'var(--primary)' }}>
            <Loader2 size={15} className="animate-spin" /> Mendaftarkan...
          </button>
        )}
        {(status === 'success' || status === 'error') && (
          <>
            <button onClick={handleRetry} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <RefreshCw size={15} /> Ulang
            </button>
            <button onClick={() => navigate(base + '/dashboard')} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)' }}>
              <User size={15} /> Ke Dashboard
            </button>
          </>
        )}
      </div>

      <div className="p-3 rounded-lg text-xs" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>
        <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Panduan:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Pastikan wajah terlihat jelas dan tidak terhalang</li>
          <li>Cahaya cukup, hindari bayangan di wajah</li>
          <li>Lepaskan kacamata jika perlu untuk hasil terbaik</li>
          <li>Data wajah disimpan terenkripsi dan hanya digunakan untuk absensi</li>
        </ul>
      </div>
    </div>
  );
}
