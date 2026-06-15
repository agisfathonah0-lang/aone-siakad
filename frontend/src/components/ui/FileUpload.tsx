import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import api from '../../api/client';

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  hint?: string;
  folder?: string;
  maxSize?: number;
}

export default function FileUpload({ value, onChange, accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar', label, hint, maxSize = 20 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(async (file: File) => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(`File terlalu besar. Maksimal ${maxSize}MB`);
      return;
    }
    setError('');
    setUploading(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/api/v1/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      if (data.success) {
        onChange(data.data.url);
      } else {
        setError(data.message || 'Upload gagal');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload gagal');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onChange, maxSize]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) doUpload(file);
  }

  const isImage = value && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value);
  const fileName = value?.split('/').pop()?.split('?')[0] || '';

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</label>}

      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
          {isImage ? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
              <img src={value} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              {value.match(/\.(pdf)$/i) ? <FileText className="w-6 h-6 text-emerald-600" /> : <FileText className="w-6 h-6 text-zinc-400" />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{fileName || 'File terupload'}</p>
            <p className="text-[10px] text-zinc-400 truncate">{value}</p>
          </div>
          <button type="button" onClick={() => onChange('')} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : uploading ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-emerald-200 dark:border-emerald-800">
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          <div className="flex-1">
            <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress || 50}%` }} />
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Mengupload... {progress}%</p>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragOver ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-zinc-300 dark:border-zinc-600 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Upload className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Klik atau drag & drop file di sini</p>
            {hint && <p className="text-[10px] text-zinc-400 mt-0.5">{hint}</p>}
          </div>
          <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
        </div>
      )}

      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
