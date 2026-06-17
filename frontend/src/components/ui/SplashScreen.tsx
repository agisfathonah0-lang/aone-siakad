import { useEffect, useState } from 'react';

interface SplashProps {
  logo?: string;
  nama?: string;
  duration?: number;
  onDone: () => void;
}

export default function SplashScreen({ logo, nama, duration = 2000, onDone }: SplashProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit' | 'done'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 150);
    const t2 = setTimeout(() => setPhase('exit'), duration);
    const t3 = setTimeout(() => { setPhase('done'); onDone(); }, duration + 500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [duration, onDone]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-emerald-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      <div className="relative flex flex-col items-center gap-4">
        <div
          className={`transition-all duration-500 ease-out ${
            phase === 'enter' ? 'scale-0 opacity-0' :
            phase === 'exit' ? 'scale-110 opacity-0' :
            'scale-100 opacity-100'
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-3xl scale-150 animate-pulse" />
            <img
              src={logo || '/logo.png'}
              alt={nama || 'AONE SIAKAD'}
              className="w-24 h-24 md:w-28 md:h-28 rounded-3xl object-cover shadow-2xl shadow-emerald-500/30 ring-2 ring-white/20 relative"
            />
          </div>
        </div>
        <div
          className={`transition-all duration-500 delay-150 ${
            phase === 'enter' ? 'translate-y-4 opacity-0' :
            phase === 'exit' ? 'translate-y-2 opacity-0' :
            'translate-y-0 opacity-100'
          }`}
        >
          <h1 className="text-xl md:text-2xl font-bold font-display text-white text-center tracking-tight">
            {nama || 'AONE SIAKAD'}
          </h1>
          <p className="text-xs text-emerald-200/70 text-center mt-1">Sistem Informasi Akademik</p>
        </div>
      </div>
    </div>
  );
}
