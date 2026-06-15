import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [idCounter, setIdCounter] = useState(0);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + idCounter;
    setIdCounter(c => c + 1);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, [idCounter]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${colors[t.type]} ${t.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/60' : t.type === 'error' ? 'bg-red-50 dark:bg-red-950/60' : t.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/60' : 'bg-blue-50 dark:bg-blue-950/60'}`}
                style={{ minWidth: 280, maxWidth: 420 }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold flex-1">{t.message}</span>
                <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-50 hover:opacity-100 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
