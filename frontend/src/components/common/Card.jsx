import { cn } from '@/utils/cn'

/**
 * Card surfaces.
 *
 * Radius and shadow come from tokens (`rounded-panel`, `shadow-panel`) so
 * surfaces stay consistent. `glass` is reserved for content floating over
 * the map; the default is a flat bordered panel.
 */

const SURFACE_VARIANTS = {
  solid: 'border border-line bg-ink-900/70 shadow-panel',
  raised: 'border border-line-strong bg-ink-850/80 shadow-panel',
  glass: 'glass-panel',
  flush: 'border border-line bg-ink-900/40',
}

export function Card({
  as: Tag = 'section',
  variant = 'solid',
  tone,
  padded = true,
  className,
  children,
  ...rest
}) {
  return (
    <Tag
      className={cn(
        'relative flex min-w-0 flex-col rounded-panel',
        SURFACE_VARIANTS[variant] ?? SURFACE_VARIANTS.solid,
        padded && 'px-4 py-3.5',
        tone === 'danger' && 'border-alert-red/35',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/**
 * A figure with mandatory context.
 *
 * `context` is required by design: a number without a baseline or a basis is
 * not decision-grade information, so the component refuses to render one.
 */
export function MetricCard({
  label,
  value,
  unit,
  context,
  delta,
  deltaTone = 'muted',
  tone = 'default',
  size = 'md',
  className,
}) {
  const valueTone = {
    default: 'text-mist-50',
    danger: 'text-alert-red',
    warn: 'text-alert-orange',
    healthy: 'text-healthy-teal',
    analysis: 'text-violet-analysis',
  }[tone]

  const deltaToneClass = {
    bad: 'text-alert-red',
    warn: 'text-alert-orange',
    good: 'text-healthy-teal',
    muted: 'text-mist-300',
  }[deltaTone]

  return (
    <div className={cn('min-w-0', className)}>
      <p className="metric-label">{label}</p>
      <p
        className={cn(
          'tabular mt-1.5 font-semibold',
          size === 'lg' ? 'text-2xl leading-none' : 'text-lg leading-none',
          valueTone,
        )}
      >
        <span key={`${value}`} className="animate-kpi">
          {value}
        </span>
        {unit && (
          <span className="ml-1 text-[0.625rem] font-medium tracking-wide text-mist-400 uppercase">{unit}</span>
        )}
        {delta && <span className={cn('ml-1.5 text-[0.6875rem] font-semibold', deltaToneClass)}>{delta}</span>}
      </p>
      {context && <p className="mt-1.5 text-[0.6875rem] leading-snug text-mist-400">{context}</p>}
    </div>
  )
}

/** Grid of MetricCards with a consistent gap. */
export function MetricGrid({ columns = 2, className, children }) {
  return (
    <div
      className={cn(
        'grid gap-x-6 gap-y-4',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-3',
        columns === 4 && 'grid-cols-2 md:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Label-over-value pair for dense definition rows. */
export function DataPair({ label, value, valueClassName, className, ...rest }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3 py-1', className)} {...rest}>
      <dt className="text-xs text-mist-400">{label}</dt>
      <dd className={cn('tabular text-right text-xs font-medium text-mist-100', valueClassName)}>{value}</dd>
    </div>
  )
}