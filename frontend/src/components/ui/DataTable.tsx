import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns, data, loading, error, page, totalPages, onPageChange, onRefresh, emptyMessage = 'Tidak ada data',
}: DataTableProps<T>) {
  if (loading) return <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /><span className="text-sm font-medium">Memuat data...</span></div>;
  if (error) return <div className="flex flex-col items-center justify-center py-16 text-red-400"><AlertCircle className="w-8 h-8 mb-2" /><p className="text-sm font-medium">Gagal memuat data</p><p className="text-xs mt-1">{error}</p>{onRefresh && <button onClick={onRefresh} className="mt-3 text-xs text-indigo-500 hover:underline">Coba Lagi</button>}</div>;
  if (data.length === 0) return <div className="flex items-center justify-center py-16 text-slate-400"><p className="text-sm font-medium">{emptyMessage}</p></div>;

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100/50 dark:border-zinc-800/30">
            {columns.map((col) => (
              <th key={col.key} className={`text-left px-5 py-3.5 font-semibold text-slate-400 dark:text-zinc-500 text-[11px] uppercase tracking-wider ${col.className || ''}`}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/30 dark:divide-zinc-800/20">
          {data.map((row, i) => (
            <tr key={(row.id as string) || i} className="transition-all duration-200 hover:bg-white/40 dark:hover:bg-white/[0.02]">
              {columns.map((col) => (
                <td key={col.key} className={`px-5 py-3.5 text-sm ${col.className || ''}`}>{col.render ? col.render(row) : String(row[col.key] ?? '-')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages && totalPages > 1 && page && onPageChange && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100/50 dark:border-zinc-800/30">
          <span className="text-xs text-slate-400 dark:text-zinc-500">Halaman {page} dari {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all">
              <ChevronLeft size={16} />
            </button>
            <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
