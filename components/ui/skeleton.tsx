interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-bg-elevated ${className}`}
      aria-hidden="true"
    />
  );
}
