import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative w-full ${widths[size]} max-h-[85vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl shadow-black/10">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/50 dark:border-zinc-700/30">
            <h2 className="font-semibold text-sm text-slate-800 dark:text-zinc-100">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"><X size={16} /></button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}