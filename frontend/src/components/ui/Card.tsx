import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = { sm: 'p-4', md: 'p-5', lg: 'p-6' };

export default function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  const hoverClass = hover ? 'hover:shadow-md transition-shadow' : '';
  return (
    <div className={`rounded-xl border ${hoverClass} ${paddingClasses[padding]} ${className}`}
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      {children}
    </div>
  );
}
