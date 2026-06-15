interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
}

const variants: Record<string, string> = {
  success: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  info: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  default: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400',
};

export default function Badge({ variant = 'default', children }: BadgeProps) {
  return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${variants[variant] || variants.default}`}>{children}</span>;
}
