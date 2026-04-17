import { memo } from 'react'

type LoadingSurfaceVariant = 'shell' | 'page' | 'section'

interface LoadingSurfaceProps {
  variant?: LoadingSurfaceVariant
  label?: string
  lines?: number
  className?: string
}

function LoadingSurface({
  variant = 'section',
  label = 'Loading…',
  lines = 3,
  className = '',
}: LoadingSurfaceProps) {
  const skeletonLines = Array.from({ length: lines }, (_, index) => index)

  if (variant === 'shell') {
    return (
      <div role="status" aria-live="polite" className={`flex h-full bg-ink-black ${className}`}>
        <div className="hidden w-56 flex-col gap-3 border-r border-ink-border bg-ink-dark p-4 md:flex">
          <div className="h-5 w-24 rounded ink-shimmer" />
          <div className="h-4 w-32 rounded ink-shimmer" />
          <div className="mt-4 space-y-2">
            {[1, 2, 3].map(item => (
              <div key={item} className="h-8 rounded-lg ink-shimmer" />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">{label}</p>
          <div className="h-6 w-48 rounded ink-shimmer" />
          <div className="h-4 w-64 rounded ink-shimmer" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="h-28 rounded-xl border border-ink-border bg-ink-dark ink-shimmer" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'page') {
    return (
      <div role="status" aria-live="polite" className={`flex min-h-screen items-center justify-center bg-ink-black px-4 ${className}`}>
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-ink-border bg-ink-dark p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">{label}</p>
          {skeletonLines.map(line => (
            <div
              key={line}
              className={`rounded ink-shimmer ${line === 0 ? 'h-5 w-2/3' : 'h-4 w-full'}`}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div role="status" aria-live="polite" className={`space-y-3 ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">{label}</p>
      {skeletonLines.map(line => (
        <div
          key={line}
          className={`rounded-lg border border-ink-border bg-ink-dark p-4 ${line === 0 ? 'h-16' : 'h-12'} ink-shimmer`}
        />
      ))}
    </div>
  )
}

export default memo(LoadingSurface)
