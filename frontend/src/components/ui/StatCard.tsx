import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  color?: 'primary' | 'accent' | 'amber' | 'rose';
}

const gradients = {
  primary: 'from-primary-500 to-primary-700',
  accent: 'from-accent-500 to-accent-700',
  amber: 'from-amber-500 to-amber-700',
  rose: 'from-rose-500 to-rose-700',
};

const shadowColors = {
  primary: 'shadow-primary-500/20',
  accent: 'shadow-accent-500/20',
  amber: 'shadow-amber-500/20',
  rose: 'shadow-rose-500/20',
};

export default function StatCard({ title, value, icon, trend, color = 'primary' }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold font-display text-slate-900 dark:text-zinc-100">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center shadow-lg ${shadowColors[color]} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
