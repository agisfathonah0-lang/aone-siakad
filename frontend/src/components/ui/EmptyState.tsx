import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'Tidak ada data', children }: { message?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--muted-foreground)' }}>
      <Inbox className="w-10 h-10 mb-3" style={{ opacity: 0.4 }} />
      <p className="text-sm font-medium">{message}</p>
      {children}
    </div>
  );
}
