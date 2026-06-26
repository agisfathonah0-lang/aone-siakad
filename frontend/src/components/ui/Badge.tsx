interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
}

const variants: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  danger: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  info: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  default: 'text-muted-foreground',
};

export default function Badge({ variant = 'default', children }: BadgeProps) {
  const bgStyle = variant === 'default' ? { background: 'var(--muted)' } : {};
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${variants[variant] || variants.default}`}
      style={bgStyle}>
      {children}
    </span>
  );
}
