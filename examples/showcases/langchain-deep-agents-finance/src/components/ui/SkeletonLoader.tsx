"use client";

export function SkeletonLoader({
  className = "",
  rows = 3,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton-pulse h-4 rounded bg-cream-dark"
          style={{ width: `${85 - i * 12}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-border-light bg-cream-warm p-4 space-y-3 ${className}`}
    >
      <div className="skeleton-pulse h-4 w-1/3 rounded bg-cream-dark" />
      <div className="skeleton-pulse h-8 w-1/2 rounded bg-cream-dark" />
      <div className="skeleton-pulse h-3 w-2/3 rounded bg-cream-dark" />
    </div>
  );
}
