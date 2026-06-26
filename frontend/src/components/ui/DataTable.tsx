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
  if (loading) return (
    <div className="flex items-center justify-center py-16" style={{ color: 'var(--muted-foreground)' }}>
      <Loader2 className="w-5 h-5 animate-spin mr-2" />
      <span className="text-sm font-medium">Memuat data...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--destructive)' }}>
      <AlertCircle className="w-8 h-8 mb-2" />
      <p className="text-sm font-medium">Gagal memuat data</p>
      <p className="text-xs mt-1">{error}</p>
      {onRefresh && <button onClick={onRefresh} className="mt-3 text-xs hover:underline" style={{ color: 'var(--primary)' }}>Coba Lagi</button>}
    </div>
  );

  if (data.length === 0) return (
    <div className="flex items-center justify-center py-16" style={{ color: 'var(--muted-foreground)' }}>
      <p className="text-sm font-medium">{emptyMessage}</p>
    </div>
  );

  return (
    <div className="bg-card rounded-xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {columns.map((col) => (
                <th key={col.key} className={`text-left px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider ${col.className || ''}`}
                  style={{ color: 'var(--muted-foreground)' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {data.map((row, i) => (
              <tr key={(row.id as string) || i} className="transition-colors"
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-3.5 text-sm ${col.className || ''}`}
                    style={{ color: 'var(--foreground)' }}>
                    {col.render ? col.render(row) : String(row[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages && totalPages > 1 && page && onPageChange && (
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Halaman {page} dari {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg transition-all disabled:opacity-30"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={e => { if (!(e.currentTarget as HTMLButtonElement).disabled) { e.currentTarget.style.background = 'var(--secondary)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              <ChevronLeft size={16} />
            </button>
            <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg transition-all disabled:opacity-30"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={e => { if (!(e.currentTarget as HTMLButtonElement).disabled) { e.currentTarget.style.background = 'var(--secondary)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
