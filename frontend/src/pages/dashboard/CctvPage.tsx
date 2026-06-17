import { useState, useEffect, useRef, useCallback } from 'react';
import { get, post } from '../../api/client';
import { toast } from '../../context/ToastContext';
import { Loader2, Camera, Play, ExternalLink, RefreshCw, Wifi, WifiOff, StopCircle, Video } from 'lucide-react';
import Hls from 'hls.js';

interface Camera {
  id: string; name: string; location: string;
  rtsp_url: string; snapshot_url: string; status: string;
  stream_supported?: boolean;
}

export default function CctvPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Camera | null>(null);

  useEffect(() => {
    get<Camera[]>('/campus/cctv').then(c => { setCameras(Array.isArray(c) ? c : []); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">CCTV</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Live monitoring ({cameras.length} kamera)</p>
        </div>
      </div>

      {cameras.length === 0 ? (
        <div className="text-center py-20 text-sm text-slate-400 dark:text-zinc-500">Belum ada kamera terpasang</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cameras.map(c => (
            <CameraCard key={c.id} camera={c} onView={() => setViewing(c)} />
          ))}
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setViewing(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
              <div>
                <h2 className="font-bold text-sm dark:text-white">{viewing.name}</h2>
                <p className="text-[10px] text-zinc-400">{viewing.location}</p>
              </div>
              <button onClick={() => setViewing(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-bold">&times;</button>
            </div>
            <LiveView camera={viewing} />
          </div>
        </div>
      )}
    </div>
  );
}

function CameraCard({ camera, onView }: { camera: Camera; onView: () => void }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 hover:shadow-md transition-all group cursor-pointer" onClick={onView}>
      <div className="relative h-40 bg-zinc-900 overflow-hidden">
        {camera.snapshot_url && !imgError ? (
          <img src={camera.snapshot_url} alt={camera.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><Camera size={32} className="text-zinc-700" /></div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] text-white/80">
          {camera.status === 'Aktif' ? <Wifi size={10} className="text-emerald-400" /> : <WifiOff size={10} className="text-red-400" />}
          {camera.status || 'Aktif'}
        </div>
        {camera.stream_supported && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-emerald-600/80 text-[9px] text-white flex items-center gap-1">
            <Video size={9} /> HLS
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all group/play">
          <div className="w-10 h-10 rounded-full bg-emerald-500/90 flex items-center justify-center opacity-0 group-hover/play:opacity-100 transition-all scale-90 group-hover/play:scale-100">
            <Play size={16} className="text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="font-bold text-sm dark:text-white truncate">{camera.name}</p>
        <p className="text-[10px] text-slate-400 dark:text-zinc-500">{camera.location || '-'}</p>
        {camera.rtsp_url && (
          <a href={camera.rtsp_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-[9px] text-indigo-500 hover:text-indigo-400 font-mono truncate mt-1">
            <ExternalLink size={9} /> Buka RTSP
          </a>
        )}
      </div>
    </div>
  );
}

function LiveView({ camera }: { camera: Camera }) {
  const [mode, setMode] = useState<'snapshot' | 'hls'>('snapshot');
  const [streamActive, setStreamActive] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const startHls = useCallback(async () => {
    setStreamLoading(true);
    try {
      const res = await post<{ stream_url: string }>(`/campus/cctv/${camera.id}/stream/start`, {});
      setStreamActive(true);
      setMode('hls');

      if (videoRef.current) {
        if (Hls.isSupported()) {
          hlsRef.current = new Hls({ liveDurationInfinity: true, maxLoadingDelay: 4, lowLatencyMode: true });
          hlsRef.current.loadSource(res.stream_url);
          hlsRef.current.attachMedia(videoRef.current);
          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => videoRef.current?.play());
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = res.stream_url;
        }
      }
    } catch (err: any) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally { setStreamLoading(false); }
  }, [camera.id]);

  const stopHls = useCallback(async () => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
    setMode('snapshot');
    setStreamActive(false);
    await post(`/campus/cctv/${camera.id}/stream/stop`, {}).catch(() => {});
  }, [camera.id]);

  useEffect(() => {
    return () => { hlsRef.current?.destroy(); stopHls(); };
  }, []);

  useEffect(() => {
    if (mode === 'snapshot') {
      setRefresh(r => r + 1);
      const timer = setInterval(() => setRefresh(r => r + 1), 3000);
      return () => clearInterval(timer);
    }
  }, [mode]);

  return (
    <div className="relative bg-zinc-900" style={{ minHeight: 350 }}>
      {mode === 'hls' ? (
        <>
          <video ref={videoRef} className="w-full h-auto" style={{ maxHeight: '70vh' }} autoPlay muted playsInline />
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600/80 text-[9px] text-white">
            <Video size={9} /> HLS Live
          </div>
          <div className="absolute bottom-3 left-3">
            <button onClick={stopHls} className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors">
              <StopCircle size={10} /> Stop
            </button>
          </div>
        </>
      ) : (
        <>
          {camera.snapshot_url ? (
            <img key={refresh} src={`/api/v1/campus/cctv/${camera.id}/snapshot?_t=${Date.now()}`}
              alt={camera.name} className="w-full h-auto object-contain" style={{ maxHeight: '70vh' }}
              onLoad={() => setStreamLoading(false)} onError={() => setStreamLoading(false)}
            />
          ) : (
            <div className="flex items-center justify-center" style={{ minHeight: 350 }}>
              <Camera size={48} className="text-zinc-700" />
            </div>
          )}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-[9px] text-emerald-400">
            <RefreshCw size={9} /> Snapshot
          </div>
          <div className="absolute bottom-3 left-3 flex gap-2">
            {camera.stream_supported && !streamActive && (
              <button onClick={startHls} disabled={streamLoading} className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50">
                {streamLoading ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                {streamLoading ? 'Starting...' : 'Live HLS'}
              </button>
            )}
            {camera.rtsp_url && (
              <a href={camera.rtsp_url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-zinc-300 font-bold text-[10px] flex items-center gap-1 transition-colors">
                <ExternalLink size={10} /> Buka di VLC
              </a>
            )}
          </div>
        </>
      )}
      {streamLoading && mode === 'snapshot' && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/60">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      )}
    </div>
  );
}
