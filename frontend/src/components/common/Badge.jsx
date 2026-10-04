import { cn } from '@/utils/cn'
import {
  confidenceBandOf,
  incidentTypeOf,
  priorityOf,
  sensorStateOf,
  toneOf,
} from '@/utils/statusTokens'

/**
 * Badge primitives.
 *
 * A badge always shows a glyph and a word. Colour reinforces, it never
 * carries the meaning alone.
 */

export function Badge({
  children,
  tone = 'muted',
  glyph,
  dot = false,
  size = 'md',
  title,
  className,
  ...rest
}) {
  const t = toneOf(tone)

  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center rounded border font-semibold tracking-wide whitespace-nowrap',
        t.border,
        t.bg,
        t.text,
        size === 'sm' ? 'gap-1 px-1.5 py-px text-[0.625rem]' : 'gap-1.5 px-1.5 py-0.5 text-[0.6875rem]',
        className,
      )}
      {...rest}
    >
      {dot && <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', t.dot)} />}
      {glyph && (
        <span aria-hidden="true" className="font-mono leading-none">
          {glyph}
        </span>
      )}
      {children}
    </span>
  )
}

/** Cluster or incident priority. Optionally shows the numeric score. */
export function PriorityBadge({ level, score, showScore = false, className, ...rest }) {
  const token = priorityOf(level)
  return (
    <Badge
      tone={token.tone}
      glyph={token.glyph}
      title={`${token.label} priority - ${token.meaning}`}
      className={className}
      {...rest}
    >
      {token.label}
      {showScore && typeof score === 'number' && (
        <span className="tabular font-mono">{score}</span>
      )}
    </Badge>
  )
}

/** Civic incident category: waterlogging, potholes, sewage overflow, ... */
export function StatusBadge({ category, size = 'md', className, ...rest }) {
  const token = incidentTypeOf(category)
  return (
    <Badge
      tone={token.tone}
      glyph={token.glyph}
      size={size}
      title={`${token.label} - ${token.meaning}`}
      className={className}
      {...rest}
    >
      {token.label}
    </Badge>
  )
}

/** Instrument health: healthy, warning, critical. */
export function SensorBadge({ state, size = 'md', className, ...rest }) {
  const token = sensorStateOf(state)
  return (
    <Badge
      tone={token.tone}
      glyph={token.glyph}
      dot
      size={size}
      title={`Sensor ${token.label.toLowerCase()} - ${token.meaning}`}
      className={className}
      {...rest}
    >
      {token.label}
    </Badge>
  )
}

/**
 * Evidential support for a candidate cause.
 * Deliberately never reads as certainty: the label is "support", not "accuracy".
 */
export function ConfidenceBadge({ score, showScore = true, className, ...rest }) {
  const band = confidenceBandOf(score)
  return (
    <Badge
      tone={band.tone}
      glyph={band.glyph}
      title={`${band.label} (${band.range}) - ${band.meaning}`}
      className={className}
      {...rest}
    >
      {band.label}
      {showScore && typeof score === 'number' && (
        <span className="tabular font-mono">{Math.round(score * 100)}%</span>
      )}
    </Badge>
  )
}

/** Neutral metadata chip: ward, source, signal family. */
export function MetaChip({ children, className, ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border border-line bg-ink-800/70 px-1.5 py-0.5 text-[0.6875rem] leading-none font-medium text-mist-300',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}