import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera, Plus, Trash2, Edit3, X, Maximize2, Minimize2, Monitor, Smartphone,
  Grid2x2, Grid3x3, LayoutGrid, Search, Wifi, WifiOff, Circle, RefreshCw,
  MapPin, MonitorSmartphone, Radio, RadioTower
} from 'lucide-react';
import { useToast } from './Toast';
import { api } from '../api';

interface Camera {
  id: string;
  name: string;
  location: string;
  rtsp_url: string;
  status: string;
  snapshot: string;
  snapshot_at: string;
  is_broadcasting: number;
  created_at: string;
}

interface CctvModuleProps {
  isDark: boolean;
}

type GridSize = 2 | 3 | 4;

export default function CctvModule({ isDark }: CctvModuleProps) {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [search, setSearch] = useState('');
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Camera | null>(null);
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formRtsp, setFormRtsp] = useState('');
  const [phoneStream, setPhoneStream] = useState<MediaStream | null>(null);
  const [phoneCamActive, setPhoneCamActive] = useState(false);
  const [fullscreenCam, setFullscreenCam] = useState<string | null>(null);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
  const [broadcastStream, setBroadcastStream] = useState<MediaStream | null>(null);
  const [streamErrors, setStreamErrors] = useState<Record<string, boolean>>({});
  const [snapshotTimestamps, setSnapshotTimestamps] = useState<Record<string, number>>({});
  const [showTestModal, setShowTestModal] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState('');
  const phoneVideoRef = useRef<HTMLVideoElement>(null);
  const broadcastVideoRef = useRef<HTMLVideoElement>(null);
  const broadcastCanvasRef = useRef<HTMLCanvasElement>(null);
  const broadcastIntervalRef = useRef<number | null>(null);
  const phoneBroadcastVideoRef = useRef<HTMLVideoElement>(null);
  const phoneBroadcastCanvasRef = useRef<HTMLCanvasElement>(null);
  const phoneBroadcastIntervalRef = useRef<number | null>(null);
  const phoneCameraIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetchCameras();
    return () => {
      if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
      if (phoneBroadcastIntervalRef.current) clearInterval(phoneBroadcastIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (phoneVideoRef.current && phoneStream) {
      phoneVideoRef.current.srcObject = phoneStream;
    }
  }, [phoneStream]);

  useEffect(() => {
    if (broadcastVideoRef.current && broadcastStream) {
      broadcastVideoRef.current.srcObject = broadcastStream;
    }
  }, [broadcastStream]);

  // Poll for snapshot updates from phone/laptop broadcast
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCameras();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Refresh IP Webcam snapshot images periodically (poll shot.jpg)
  useEffect(() => {
    const interval = setInterval(() => {
      setSnapshotTimestamps(prev => ({ ...prev, _t: Date.now() }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const fetchCameras = async () => {
    try {
      const data = await api.get<any[]>('/cctv');
      setCameras(data);
    } catch {
      toast('Gagal memuat daftar kamera.', 'error');
    }
  };

  const startPhoneCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setPhoneStream(stream);
      setPhoneCamActive(true);

      // Use fixed ID so laptop can find it
      const camId = 'CAM-PHONE';
      phoneCameraIdRef.current = camId;
      const deviceName = /Android/i.test(navigator.userAgent) ? 'Android' : /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'iOS' : 'Mobile';
      await api.put(`/cctv/${camId}`, { name: `Kamera HP (${deviceName})`, location: 'Perangkat Mobile', status: 'Aktif' });

      setTimeout(() => {
        const video = phoneBroadcastVideoRef.current;
        const canvas = phoneBroadcastCanvasRef.current;
        if (!video || !canvas) return;
        video.srcObject = stream;

        phoneBroadcastIntervalRef.current = window.setInterval(() => {
          if (!video || !canvas) return;
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const image = canvas.toDataURL('image/jpeg', 0.5);
          api.post(`/cctv/${camId}/frame`, { image }).catch(() => {});
        }, 600);
      }, 500);

      toast(`Kamera HP aktif — broadcast ke perangkat lain dimulai.`, 'success');
      fetchCameras();
    } catch {
      toast('Gagal mengakses kamera. Pastikan izin kamera diberikan.', 'error');
    }
  };

  const stopPhoneCamera = () => {
    if (phoneBroadcastIntervalRef.current) {
      clearInterval(phoneBroadcastIntervalRef.current);
      phoneBroadcastIntervalRef.current = null;
    }
    if (phoneStream) {
      phoneStream.getTracks().forEach(t => t.stop());
      setPhoneStream(null);
    }
    setPhoneCamActive(false);
    if (phoneCameraIdRef.current) {
      api.post(`/cctv/${phoneCameraIdRef.current}/stop-broadcast`).catch(() => {});
      phoneCameraIdRef.current = null;
    }
    fetchCameras();
  };

  const startBroadcast = async (cam: Camera) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setBroadcastStream(stream);
      setBroadcastingId(cam.id);

      setTimeout(() => {
        if (!broadcastVideoRef.current || !broadcastCanvasRef.current) return;
        broadcastVideoRef.current.srcObject = stream;

        broadcastIntervalRef.current = window.setInterval(() => {
          const video = broadcastVideoRef.current;
          const canvas = broadcastCanvasRef.current;
          if (!video || !canvas) return;
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const image = canvas.toDataURL('image/jpeg', 0.6);
          api.post(`/cctv/${cam.id}/frame`, { image }).catch(() => {});
        }, 500);
      }, 500);

      toast(`Broadcast "${cam.name}" dimulai — buka dari HP sekarang!`, 'success');
    } catch {
      toast('Gagal mengakses kamera laptop.', 'error');
    }
  };

  const stopBroadcast = async (cam: Camera) => {
    if (broadcastIntervalRef.current) {
      clearInterval(broadcastIntervalRef.current);
      broadcastIntervalRef.current = null;
    }
    if (broadcastStream) {
      broadcastStream.getTracks().forEach(t => t.stop());
      setBroadcastStream(null);
    }
    setBroadcastingId(null);
    try {
      await api.post(`/cctv/${cam.id}/stop-broadcast`);
    } catch {}
    fetchCameras();
    toast('Broadcast dihentikan.', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formLocation) {
      toast('Nama dan lokasi kamera wajib diisi.', 'warning');
      return;
    }
    try {
      if (editing) {
        await api.put(`/cctv/${editing.id}`, { name: formName, location: formLocation, rtsp_url: formRtsp });
        toast('Kamera diperbarui.', 'success');
      } else {
        await api.post('/cctv', { name: formName, location: formLocation, rtsp_url: formRtsp });
        toast('Kamera baru ditambahkan.', 'success');
      }
      setShowForm(false);
      setEditing(null);
      setFormName('');
      setFormLocation('');
      setFormRtsp('');
      fetchCameras();
    } catch {
      toast('Gagal menyimpan kamera.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (broadcastingId === id) {
      toast('Hentikan broadcast dulu sebelum menghapus.', 'warning');
      return;
    }
    try {
      await api.delete(`/cctv/${id}`);
      toast('Kamera dihapus.', 'success');
      fetchCameras();
    } catch {
      toast('Gagal menghapus kamera.', 'error');
    }
  };

  const handleEdit = (cam: Camera) => {
    if (broadcastingId === cam.id) {
      toast('Hentikan broadcast dulu sebelum mengedit.', 'warning');
      return;
    }
    setEditing(cam);
    setFormName(cam.name);
    setFormLocation(cam.location);
    setFormRtsp(cam.rtsp_url);
    setShowForm(true);
  };

  const filtered = cameras.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const gridClass = gridSize === 2 ? 'grid-cols-1 sm:grid-cols-2' : gridSize === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  const getStreamBaseUrl = (url: string) => {
    const match = url.match(/^(https?:\/\/[^\/]+:\d+)/);
    return match ? match[1] : url;
  };

  const isMjpegStream = (url: string) => /\/video|mjpeg|\.mjpg|\.mjp/i.test(url);

  const handleStreamError = (camId: string) => {
    setStreamErrors(prev => ({ ...prev, [camId]: true }));
  };

  const clearStreamError = (camId: string) => {
    setStreamErrors(prev => ({ ...prev, [camId]: false }));
  };

  const getSnapshotSrc = (url: string) => {
    const base = getStreamBaseUrl(url);
    return `${base}/shot.jpg?_t=${Date.now()}`;
  };

  const testStream = async (url: string) => {
    setTestUrl(url);
    setTestResult('Mengetes...');
    setShowTestModal(true);
    try {
      const base = getStreamBaseUrl(url);
      const res = await fetch(`${base}/shot.jpg`);
      if (res.ok) {
        setTestResult(`OK (${res.status}) — stream ${url} bisa dijangkau`);
      } else {
        setTestResult(`Gagal (${res.status}) — periksa firewall atau IP`);
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message || 'Tidak dapat terhubung'}. Pastikan HP dan laptop satu WiFi, dan firewall tidak blokir port.`);
    }
  };

  const feedColors = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

  const getSnapshotUrl = (cam: Camera) => {
    return cam.snapshot || '';
  };

  return (
    <div className="space-y-6">
      {/* Canvas & Video hidden for broadcast capture */}
      <canvas ref={broadcastCanvasRef} className="hidden" />
      <video ref={broadcastVideoRef} className="hidden" playsInline muted />
      <canvas ref={phoneBroadcastCanvasRef} className="hidden" />
      <video ref={phoneBroadcastVideoRef} className="hidden" playsInline muted />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <Camera className="w-6 h-6 inline mr-2 text-emerald-500" />
            CCTV Monitoring
          </h1>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            Live feed kamera keamanan kampus — broadcast laptop, kamera HP, atau RTSP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex rounded-lg border ${isDark ? 'border-zinc-700' : 'border-slate-200'} overflow-hidden`}>
            {([2, 3, 4] as GridSize[]).map(g => (
              <button key={g} onClick={() => setGridSize(g)}
                className={`p-2 transition ${gridSize === g ? (isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white') : isDark ? 'text-white/50 hover:bg-zinc-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                {g === 2 ? <Grid2x2 className="w-4 h-4" /> : g === 3 ? <Grid3x3 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              </button>
            ))}
          </div>
          <button onClick={phoneCamActive ? stopPhoneCamera : startPhoneCamera}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              phoneCamActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}>
            <Smartphone className="w-4 h-4" />
            {phoneCamActive ? 'Matikan Kamera HP' : 'Kamera HP'}
          </button>
          <a href="/?broadcast" target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:shadow-blue-500/40 transition-all hover:scale-105">
            <Camera className="w-4 h-4" /> Jadikan CCTV
          </a>
          {broadcastingId && (
            <button onClick={() => stopBroadcast(cameras.find(c => c.id === broadcastingId)!)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition animate-pulse">
              <RadioTower className="w-4 h-4" /> Hentikan Broadcast
            </button>
          )}
          <button onClick={() => { setEditing(null); setFormName(''); setFormLocation(''); setFormRtsp(''); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-emerald-500/40 transition-all hover:scale-105">
            <Plus className="w-4 h-4" /> Tambah Kamera
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input type="text" placeholder="Cari kamera..." value={search} onChange={e => setSearch(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            isDark ? 'bg-zinc-900 border-zinc-700 text-white placeholder-white/30' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
          }`} />
      </div>

      {/* CCTV FEED GRID */}
      <div className={`grid ${gridClass} gap-4`}>
        {/* Phone camera feed */}
        {phoneCamActive && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`relative aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 ${isDark ? 'bg-zinc-900' : 'bg-slate-100'}`}>
            <video ref={phoneVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-semibold text-sm">Kamera HP (Live)</span>
              </div>
              <p className="text-white/60 text-xs flex items-center gap-1 mt-0.5"><Smartphone className="w-3 h-3" /> Perangkat Mobile</p>
            </div>
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-emerald-500/80 text-[10px] font-bold text-white uppercase tracking-wider">Live</div>
          </motion.div>
        )}

        {/* Camera feeds */}
        <AnimatePresence>
          {filtered.map((cam, i) => {
            const isBroadcasting = cam.is_broadcasting === 1 || broadcastingId === cam.id;
            const hasSnapshot = cam.snapshot && cam.snapshot.length > 0;
            return (
              <motion.div key={cam.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className={`relative aspect-video rounded-2xl overflow-hidden border cursor-pointer group transition ${
                  fullscreenCam === cam.id ? 'fixed inset-4 z-50 aspect-auto' : ''
                } ${isBroadcasting
                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : cam.status === 'Aktif'
                    ? (isDark ? 'border-zinc-700 hover:border-emerald-500/50' : 'border-slate-200 hover:border-emerald-500/50')
                    : 'border-zinc-700/50 opacity-60'
                } ${isDark ? 'bg-zinc-900' : 'bg-slate-100'}`}
                onClick={() => setFullscreenCam(fullscreenCam === cam.id ? null : cam.id)}>

                {/* Broadcast snapshot or simulated feed */}
                {hasSnapshot ? (
                  <img src={getSnapshotUrl(cam)} className="w-full h-full object-cover" alt={cam.name} />
                ) : cam.rtsp_url && streamErrors[cam.id] ? (
                  <div className="w-full h-full flex items-center justify-center bg-red-900/20">
                    <div className="text-center p-4">
                      <WifiOff className="w-10 h-10 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 text-xs font-semibold">Stream Gagal</p>
                      <p className="text-red-400/60 text-[10px] mt-1 font-mono break-all">{cam.rtsp_url}</p>
                      <button onClick={(e) => { e.stopPropagation(); clearStreamError(cam.id); }}
                        className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-[10px] rounded-lg transition font-semibold">
                        Coba Lagi
                      </button>
                    </div>
                  </div>
                ) : cam.rtsp_url ? (
                  <img src={getSnapshotSrc(cam.rtsp_url)} className="w-full h-full object-cover" alt={cam.name}
                    key={snapshotTimestamps._t || 0}
                    onError={() => handleStreamError(cam.id)} onLoad={() => clearStreamError(cam.id)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: `radial-gradient(circle at 30% 40%, ${feedColors[i % feedColors.length]}44, ${feedColors[i % feedColors.length]}22)` }}>
                    <div className="text-center">
                      <Camera className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
                      <span className="text-xs font-mono text-white/30">{cam.id}</span>
                    </div>
                  </div>
                )}

                {/* Controls overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(cam); }}
                    className="p-1.5 rounded-lg bg-black/60 text-white/80 hover:bg-emerald-600/80 transition">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(cam.id); }}
                    className="p-1.5 rounded-lg bg-black/60 text-white/80 hover:bg-red-600/80 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {!isBroadcasting && (
                    <button onClick={(e) => { e.stopPropagation(); startBroadcast(cam); }}
                      className="p-1.5 rounded-lg bg-black/60 text-white/80 hover:bg-blue-600/80 transition">
                      <Radio className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Fullscreen toggle */}
                <button onClick={(e) => { e.stopPropagation(); setFullscreenCam(fullscreenCam === cam.id ? null : cam.id); }}
                  className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 text-white/80 hover:bg-emerald-600/80 transition opacity-0 group-hover:opacity-100">
                  {fullscreenCam === cam.id ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Status indicator */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase tracking-wider"
                  style={{ background: isBroadcasting ? 'rgba(59,130,246,0.8)' : cam.status === 'Aktif' ? 'rgba(5,150,105,0.8)' : 'rgba(100,100,100,0.8)' }}>
                  <Circle className={`w-2 h-2 ${isBroadcasting ? 'text-white animate-ping' : cam.status === 'Aktif' ? 'text-white animate-pulse' : 'text-white/50'}`} />
                  {isBroadcasting ? 'BROADCAST' : cam.status}
                </div>

                {/* Info bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pb-2.5">
                  <div className="flex items-center gap-2">
                    {isBroadcasting ? <RadioTower className="w-3 h-3 text-blue-400" /> : cam.status === 'Aktif' ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
                    <span className="text-white font-semibold text-sm truncate">{cam.name}</span>
                    {isBroadcasting && <span className="text-[9px] bg-blue-500/80 text-white px-1.5 py-0.5 rounded font-bold ml-auto">LIVE</span>}
                  </div>
                  <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5 truncate"><MapPin className="w-3 h-3 shrink-0" /> {cam.location}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && !phoneCamActive && !broadcastingId && (
        <div className={`text-center py-20 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
          <MonitorSmartphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold">Belum ada kamera</p>
          <p className="text-sm mt-1">Tambahkan kamera, broadcast laptop, atau gunakan kamera HP.</p>
        </div>
      )}

      {/* ADD/EDIT FORM MODAL */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-700' : 'bg-white border border-slate-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {editing ? 'Edit Kamera' : 'Tambah Kamera'}
                </h2>
                <button onClick={() => { setShowForm(false); setEditing(null); }}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-zinc-800 text-white/50' : 'hover:bg-slate-100 text-slate-500'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-white/60' : 'text-slate-600'}`}>Nama Kamera</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Misal: Gerbang Utama"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder-white/30' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`} />
                </div>
                <div>
                  <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-white/60' : 'text-slate-600'}`}>Lokasi</label>
                  <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="Misal: Lantai 1 Gedung A"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder-white/30' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`} />
                </div>
                <div>
                  <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                    URL Stream <span className="text-white/30 font-normal">— IP Webcam: <code className="text-emerald-400">http://IP:8080/video</code> — akses web via <b>HTTP</b> (bukan HTTPS) biar stream jalan</span>
                  </label>
                  <input value={formRtsp} onChange={e => setFormRtsp(e.target.value)} placeholder="http://192.168.1.5:8080/video"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder-white/30 font-mono text-xs' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 font-mono text-xs'
                    }`} />
                </div>
                <div className="flex items-center gap-2">
                  {formRtsp && (
                    <button type="button" onClick={() => testStream(formRtsp)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        isDark ? 'border-zinc-700 text-white/60 hover:bg-zinc-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}>
                      Test Koneksi
                    </button>
                  )}
                  <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>IP Webcam: isi URL dari aplikasi, lalu klik Test dulu</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isDark ? 'bg-zinc-800 text-white/70 hover:bg-zinc-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>Batal</button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                    {editing ? 'Simpan' : 'Tambah'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreenCam && cameras.find(c => c.id === fullscreenCam) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setFullscreenCam(null)}>
            {(() => {
              const cam = cameras.find(c => c.id === fullscreenCam)!;
              const isBroadcasting = cam.is_broadcasting === 1;
              const hasSnapshot = cam.snapshot && cam.snapshot.length > 0;
              const hasError = streamErrors[cam.id];
              return (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden"
                  onClick={e => e.stopPropagation()}>
                  {hasSnapshot ? (
                    <img src={getSnapshotUrl(cam)} className="w-full h-full object-cover" alt={cam.name} />
                  ) : hasError ? (
                    <div className="w-full h-full flex items-center justify-center bg-red-900/20">
                      <div className="text-center">
                        <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-3" />
                        <p className="text-red-400 font-semibold">Stream Gagal Dimuat</p>
                        <p className="text-red-400/60 text-xs mt-1 font-mono break-all max-w-md mx-auto">{cam.rtsp_url}</p>
                      </div>
                    </div>
                  ) : cam.rtsp_url ? (
                    isMjpegStream(cam.rtsp_url) ? (
                      <img src={cam.rtsp_url} className="w-full h-full object-cover" alt={cam.name}
                        onError={() => handleStreamError(cam.id)} />
                    ) : (
                      <video autoPlay playsInline muted loop className="w-full h-full object-cover"
                        onError={() => handleStreamError(cam.id)}>
                        <source src={cam.rtsp_url} />
                      </video>
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `radial-gradient(circle at 30% 40%, #05966944, #05966922)` }}>
                      <div className="text-center">
                        <Camera className="w-20 h-20 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-sm font-mono">Demo Feed — {cam.id}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                    <div className="flex items-center gap-3">
                      {isBroadcasting ? (
                        <div className="w-3 h-3 rounded-full bg-blue-400 animate-ping" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <span className="text-white font-bold text-lg">{cam.name}</span>
                      {isBroadcasting && <span className="text-[10px] bg-blue-500 px-2 py-0.5 rounded font-bold uppercase">Broadcast</span>}
                    </div>
                    <p className="text-white/50 text-sm mt-0.5 flex items-center gap-1"><MapPin className="w-4 h-4" /> {cam.location}</p>
                  </div>
                  <button onClick={() => setFullscreenCam(null)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white hover:bg-red-600/80 transition">
                    <X className="w-6 h-6" />
                  </button>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test result modal */}
      <AnimatePresence>
        {showTestModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowTestModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-700' : 'bg-white border border-slate-200'}`}
              onClick={e => e.stopPropagation()}>
              <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Test Koneksi Stream</h2>
              <p className={`text-xs font-mono break-all mb-3 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{testUrl}</p>
              <div className={`p-4 rounded-xl text-sm whitespace-pre-wrap ${
                testResult.startsWith('OK')
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : testResult.includes('Mengetes')
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {testResult}
              </div>
              <div className="mt-4 text-xs text-white/40 leading-relaxed">
                <p>Troubleshooting:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-white/30">
                  <li>Pastikan HP dan laptop terhubung ke <b>WiFi yang sama</b></li>
                  <li>Di HP, IP Webcam harus menunjukkan status <b>Running</b></li>
                  <li>Coba matikan <b>Windows Firewall</b> atau izinkan port 8080</li>
                  <li>Beberapa router WiFi punya fitur <b>AP/client isolation</b> — matikan di pengaturan router</li>
                </ul>
              </div>
              <button onClick={() => setShowTestModal(false)}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 transition">
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
