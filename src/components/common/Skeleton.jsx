function Bar({ className = '' }) {
  return <div className={['animate-pulse rounded bg-surface-2', className].join(' ')} />
}

export function TableSkeleton({ rows = 8 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="space-y-px bg-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 bg-surface px-4 py-3.5">
            <Bar className="h-4 w-1/3" />
            <Bar className="h-4 w-16" />
            <Bar className="h-4 w-20" />
            <Bar className="h-4 w-24" />
            <Bar className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-5">
          <Bar className="h-4 w-2/3" />
          <Bar className="mt-3 h-3 w-1/2" />
          <Bar className="mt-6 h-8 w-1/3" />
        </div>
      ))}
    </div>
  )
}

export function StatGridSkeleton({ count = 6 }) {
  return <CardGridSkeleton count={count} />
}
