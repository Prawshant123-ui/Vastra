export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-section rounded-xl ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card-base p-3">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
