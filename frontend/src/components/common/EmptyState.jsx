import { cn } from '@/utils/cn'

/**
 * Empty state.
 *
 * An empty result is not the same as "nothing is wrong". `message` should
 * explain what would have appeared here and what it means that it did not.
 */
export function EmptyState({
  title = 'Nothing to show',
  message,
  icon = '-',
  action,
  className,
  children,
}) {
  return (
    <div className={cn('rounded-lg border border-dashed border-line-strong bg-ink-900/40 px-4 py-6 text-center', className)}>
      <span
        aria-hidden="true"
        className="mx-auto grid size-7 place-items-center rounded border border-line bg-ink-850 font-mono text-xs text-mist-400"
      >
        {icon}
      </span>
      <p className="mt-2.5 text-sm font-semibold text-mist-100">{title}</p>
      {message && <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-mist-400">{message}</p>}
      {children}
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  )
}