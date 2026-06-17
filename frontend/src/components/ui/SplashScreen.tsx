import { useEffect, useState } from 'react';

interface SplashProps {
  logo?: string;
  nama?: string;
  duration?: number;
  onDone: () => void;
}

export default function SplashScreen({ logo, nama, duration = 2200, onDone }: SplashProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit' | 'done'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 200);
    const t2 = setTimeout(() => setPhase('exit'), duration);
    const t3 = setTimeout(() => { setPhase('done'); onDone(); }, duration + 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [duration, onDone]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-float-up"
            style={{
              left: `${15 + i * 15}%`,
              bottom: '-5%',
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2.5 + i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-5">
        <div
          className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            phase === 'enter' ? 'scale-0 opacity-0 -rotate-12' :
            phase === 'exit' ? 'scale-90 opacity-0 rotate-6' :
            'scale-100 opacity-100 rotate-0'
          }`}
        >
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-[48px] blur-xl animate-spin-slow" style={{ animationDuration: '3s' }} />
            <div className="absolute -inset-4 bg-gradient-to-r from-teal-400/50 via-emerald-300/50 to-teal-400/50 rounded-[44px] blur-2xl animate-spin-slow" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
            <div className="absolute inset-0 bg-emerald-400/20 rounded-[40px] blur-3xl scale-150" />
            <div className="relative flex items-center justify-center">
              <img
                src={logo || '/logo.jpg'}
                alt={nama || 'AONE SIAKAD'}
                className="w-28 h-28 md:w-32 md:h-32 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
        <div
          className={`transition-all duration-600 delay-300 ease-out ${
            phase === 'enter' ? 'translate-y-6 opacity-0' :
            phase === 'exit' ? 'translate-y-3 opacity-0' :
            'translate-y-0 opacity-100'
          }`}
        >
          <h1 className="text-xl md:text-2xl font-bold font-display text-white text-center tracking-tight">
            {nama || 'AONE SIAKAD'}
          </h1>
          <p className="text-xs text-emerald-200/60 text-center mt-1.5 tracking-wide">Sistem Informasi Akademik</p>
        </div>
        <div
          className={`transition-all duration-600 delay-500 ${
            phase === 'enter' ? 'opacity-0' :
            phase === 'exit' ? 'opacity-0' :
            'opacity-100'
          }`}
        >
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
