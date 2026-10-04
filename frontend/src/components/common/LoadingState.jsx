import { cn } from '@/utils/cn'

/**
 * Loading placeholder.
 *
 * Announced politely so a screen reader hears that content is arriving
 * without being interrupted. Rows are staggered only slightly - a loading
 * state should not perform.
 */
export function LoadingState({ label = 'Loading', rows = 3, className, ...rest }) {
  return (
    <div className={cn('space-y-2.5', className)} aria-busy="true" aria-live="polite" {...rest}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-9 animate-pulse rounded border border-line bg-ink-850/70"
          style={{ animationDelay: `${index * 90}ms` }}
        />
      ))}
    </div>
  )
}