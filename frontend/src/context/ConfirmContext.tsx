import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmState {
  message: string;
  title?: string;
  resolve: (value: boolean) => void;
}

const ConfirmContext = createContext<{
  confirm: (message: string, title?: string) => Promise<boolean>;
}>({ confirm: async () => false });

let globalConfirmFn: ((message: string, title?: string) => Promise<boolean>) | null = null;

export async function confirm(message: string, title?: string): Promise<boolean> {
  if (globalConfirmFn) return globalConfirmFn(message, title);
  return window.confirm(message);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirmFn = useCallback((message: string, title?: string) => {
    return new Promise<boolean>((resolve) => {
      setState({ message, title, resolve });
    });
  }, []);

  useEffect(() => {
    globalConfirmFn = confirmFn;
    return () => { globalConfirmFn = null; };
  }, [confirmFn]);

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm: confirmFn }}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={handleCancel}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl shadow-2xl border p-6"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  {state.title || 'Konfirmasi'}
                </h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {state.message}
                </p>
                <div className="flex items-center justify-end gap-2 mt-5">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
