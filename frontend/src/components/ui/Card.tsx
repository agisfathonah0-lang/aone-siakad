import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export default function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  const base = 'bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-all duration-300';
  const hoverClass = hover ? 'hover:-translate-y-0.5 hover:shadow-lg' : '';

  return (
    <div className={`${base} ${hoverClass} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
