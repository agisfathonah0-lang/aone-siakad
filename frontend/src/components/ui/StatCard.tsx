import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  color?: 'primary' | 'accent' | 'amber' | 'rose';
}

const iconColors: Record<string, string> = {
  primary: 'var(--primary)',
  accent: 'var(--primary)',
  amber: '#F59E0B',
  rose: '#EF4444',
};

export default function StatCard({ title, value, icon, trend, color = 'primary' }: StatCardProps) {
  return (
    <div className="rounded-2xl border p-5 transition-all duration-300" style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04))' }}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{title}</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: iconColors[color] }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
