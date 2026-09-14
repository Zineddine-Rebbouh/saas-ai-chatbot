export default function Loading() {
  return (
    <div className="flex flex-col h-full w-full gap-6 p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 bg-muted rounded-lg" />
        <div className="h-8 w-24 bg-muted rounded-lg" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="h-4 w-20 bg-muted rounded mb-2" />
            <div className="h-7 w-14 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
