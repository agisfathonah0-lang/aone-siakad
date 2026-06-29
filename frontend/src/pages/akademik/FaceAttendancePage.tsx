import { useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { post, get } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Loader2, Camera, CheckCircle, AlertCircle, Sparkles, RefreshCw,
  User, Clock, MapPin, ChevronRight,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
const CONFIDENCE_THRESHOLD = 0.6;

export default function FaceAttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const base = `/kampus/${slug}`;

  const [step, setStep] = useState<'check' | 'camera' | 'result'>('check');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState<boolean | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{ matched: boolean; distance: number; nama: string; nim: string } | null>(null);
  const [error, setError] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mounted, setMounted] = useState(true);
  const animRef = useRef<number>(0);
  const [waktu, setWaktu] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setWaktu(new Date()), 1000);
    return () => { setMounted(false); clearInterval(timer); };
  }, []);

  useEffect(() => {
    get<{ registered: boolean }>('/akademik/absensi-face/status')
      .then(d => { if (mounted) setFaceRegistered(d.registered); })
      .catch(() => { if (mounted) setFaceRegistered(false); });
  }, []);

  const loadModels = useCallback(async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.load(MODEL_URL),
        faceapi.nets.faceLandmark68Net.load(MODEL_URL),
        faceapi.nets.faceRecognitionNet.load(MODEL_URL),
      ]);
      if (mounted) setModelsLoaded(true);
    } catch {
      if (mounted) setError('Gagal memuat model wajah');
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      if (!mounted) { s.getTracks().forEach(t => t.stop()); return; }
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
        setCameraReady(true);
        setStep('camera');
      }
    } catch {
      if (mounted) setError('Kamera tidak tersedia. Izinkan akses kamera.');
    }
  }, []);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
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
      const color = det.detection.score > 0.8 ? '#22c55e' : '#f59e0b';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      ctx.fillStyle = color;
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText(`Kualitas: ${(det.detection.score * 100).toFixed(0)}%`, box.x, box.y - 8);

      setFaceDetected(true);
      setDescriptor(det.descriptor);
    } else {
      setFaceDetected(false);
      setDescriptor(null);
    }

    animRef.current = requestAnimationFrame(detectFace);
  }, []);

  useEffect(() => {
    if (cameraReady) animRef.current = requestAnimationFrame(detectFace);
    return () => cancelAnimationFrame(animRef.current);
  }, [cameraReady]);

  const handleVerify = async () => {
    if (!descriptor) return;
    setVerifying(true);
    cancelAnimationFrame(animRef.current);
    try {
      const arr = Array.from(descriptor);
      const res = await post<any>('/akademik/absensi-face/verify', { descriptor: arr });
      setResult({
        matched: res.matched,
        distance: res.distance,
        nama: res.mahasiswa?.nama || user?.nama || '',
        nim: res.mahasiswa?.nim || '-',
      });
      setStep('result');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal verifikasi wajah');
      setVerifying(false);
    }
  };

  const handleRetry = () => {
    setStep('camera');
    setResult(null);
    setError('');
    setDescriptor(null);
    setFaceDetected(false);
    setVerifying(false);
    animRef.current = requestAnimationFrame(detectFace);
  };

  const cleanup = () => {
    cancelAnimationFrame(animRef.current);
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraReady(false);
  };

  if (faceRegistered === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!faceRegistered) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'var(--muted)' }}>
          <AlertCircle size={28} style={{ color: 'var(--muted-foreground)' }} />
        </div>
        <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Wajah Belum Diregistrasi</h2>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Anda perlu meregistrasi wajah terlebih dahulu sebelum menggunakan absensi wajah.
        </p>
        <button onClick={() => navigate(base + '/face-register')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'var(--primary)' }}>
          <Camera size={15} /> Registrasi Wajah
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <Camera size={20} className="text-emerald-500" />
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Absensi Wajah</h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
          <Clock size={12} /> {waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-zinc-400 -mt-2">
        Verifikasi wajah untuk mencatat kehadiran
      </p>

      {error && (
        <div className="p-3 rounded-lg text-xs font-medium flex items-start gap-2.5 bg-red-50 text-red-600">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />{error}
        </div>
      )}

      {step === 'check' && (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle size={36} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Wajah terdaftar</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Silakan lanjutkan untuk absensi</p>
          </div>
          <button onClick={() => { loadModels(); startCamera(); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'var(--primary)' }}>
            <Camera size={16} /> Mulai Absensi
          </button>
        </div>
      )}

      {step === 'camera' && (
        <>
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

            {!faceDetected && cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-56 rounded-2xl border-2 border-dashed border-white/30" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleRetry} className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
              <RefreshCw size={14} />
            </button>
            <button onClick={handleVerify} disabled={!faceDetected || verifying}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--primary)' }}>
              {verifying ? (<><Loader2 size={15} className="animate-spin" /> Memverifikasi...</>) : (<><Camera size={15} /> {faceDetected ? 'Verifikasi Wajah' : 'Arahkan wajah ke kamera'}</>)}</button>
            <button onClick={() => { cleanup(); navigate(base + '/dashboard'); }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
              <User size={14} />
            </button>
          </div>
        </>
      )}

      {step === 'result' && result && (
        <div className="text-center py-8 space-y-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${result.matched ? 'bg-emerald-50' : 'bg-red-50'}`}>
            {result.matched ? <CheckCircle size={36} className="text-emerald-500" /> : <AlertCircle size={36} className="text-red-500" />}
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              {result.matched ? 'Absensi Berhasil!' : 'Wajah Tidak Cocok'}
            </h2>
            <div className="mt-2 space-y-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{result.nama}</p>
              <p className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{result.nim}</p>
              <Badge variant={result.matched ? 'success' : result.distance < CONFIDENCE_THRESHOLD ? 'warning' : 'danger'}>
                Skor kecocokan: {((1 - result.distance) * 100).toFixed(0)}%
              </Badge>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={handleRetry}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <RefreshCw size={14} /> Ulang
            </button>
            <button onClick={() => { cleanup(); navigate(base + '/dashboard'); }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2"
              style={{ background: 'var(--primary)' }}>
              <User size={14} /> Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
