import { cn } from '@/utils/cn'

import { Button } from './Button'

/**
 * Failure state.
 *
 * `role="alert"` so it is announced immediately. The message states the
 * consequence for the reader's decision, not just the technical cause, and
 * never shows a raw exception name as the primary text.
 */
export function ErrorState({
  title = 'Could not load this view',
  message,
  onRetry,
  retryLabel = 'Retry',
  className,
  children,
}) {
  return (
    <div role="alert" className={cn('rounded-lg border border-alert-red/35 bg-alert-red/8 px-4 py-3.5', className)}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 grid size-5 shrink-0 place-items-center rounded bg-alert-red/15 font-mono text-[0.625rem] font-bold text-alert-red"
        >
          !
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-mist-50">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-mist-300">
            {message ?? 'The civic data service did not respond. Figures on screen may be out of date.'}
          </p>
          {children}
          {onRetry && (
            <Button variant="secondary" size="sm" className="mt-2.5" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}