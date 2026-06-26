interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-shimmer rounded-xl ${className}`} style={{
      backgroundImage: 'linear-gradient(90deg, var(--card) 0%, var(--muted) 50%, var(--card) 100%)',
      backgroundSize: '400% 100%',
    }} />
  );
}
