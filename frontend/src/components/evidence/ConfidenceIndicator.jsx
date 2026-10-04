import { CONFIDENCE_BAND, CONFIDENCE_NOTE, confidenceBandOf, toneOf } from '@/utils/statusTokens'
import { cn } from '@/utils/cn'

import { confidenceQualityOf } from './confidenceMeta'

const BANDS = [
  CONFIDENCE_BAND.weak,
  CONFIDENCE_BAND.tentative,
  CONFIDENCE_BAND.moderate,
  CONFIDENCE_BAND.strong,
]

function ConfidenceBar({ percent }) {
  return (
    <div
      className="relative h-2.5 w-full overflow-hidden rounded-full bg-ink-800"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={`${percent} percent confidence`}
    >
      <div className="absolute inset-0 flex">
        {BANDS.map((band) => (
          <span
            key={band.label}
            className={cn('h-full flex-1', toneOf(band.tone).dot)}
            style={{ opacity: 0.3 }}
          />
        ))}
      </div>
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-healthy-teal via-cyan-signal to-violet-analysis"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

/**
 * ConfidenceIndicator.
 *
 * Shows how much evidence supports a hypothesis. `score` is a 0..1 ratio. It
 * phrases the result as e.g. "High evidence confidence" and never as
 * certainty, and the full variant carries the required disclaimer.
 */
export function ConfidenceIndicator({
  score,
  label = 'evidence',
  variant = 'meter',
  showNote = true,
  className,
}) {
  if (typeof score !== 'number' || Number.isNaN(score)) return null

  const clamped = Math.max(0, Math.min(1, score))
  const percent = Math.round(clamped * 100)
  const band = confidenceBandOf(clamped)
  const quality = confidenceQualityOf(clamped)
  const tone = toneOf(band.tone)
  const phrase = `${quality} ${label} confidence`

  if (variant === 'compact') {
    return (
      <div className={cn('min-w-0', className)}>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="tabular text-lg leading-none font-semibold text-mist-50">{percent}%</span>
          <span className={cn('text-xs font-semibold', tone.text)}>{phrase}</span>
        </div>
        <div className="mt-1.5">
          <ConfidenceBar percent={percent} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-panel border border-line bg-ink-900/70 px-4 py-3.5', className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="metric-label">Confidence</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="tabular text-3xl leading-none font-semibold text-mist-50">{percent}%</span>
            <span className={cn('text-xs font-semibold', tone.text)}>{phrase}</span>
          </p>
        </div>
        <p className="text-[0.6875rem] text-mist-400">{band.range} on a 0.00&ndash;1.00 scale</p>
      </div>

      <div className="mt-3">
        <ConfidenceBar percent={percent} />
      </div>

      <div className="mt-2 flex justify-between text-[0.625rem] tracking-wide uppercase">
        {BANDS.map((b) => (
          <span
            key={b.label}
            className={cn(b.label === band.label ? toneOf(b.tone).text : 'text-mist-500', 'font-semibold')}
          >
            {b.label.replace(' support', '')}
          </span>
        ))}
      </div>

      {showNote && (
        <>
          <p className="mt-3 text-xs font-medium text-mist-200">
            Confidence reflects the strength of available evidence, not certainty.
          </p>
          <p className="mt-1 text-[0.6875rem] leading-relaxed text-mist-400">{CONFIDENCE_NOTE}</p>
        </>
      )}
    </div>
  )
}

export default ConfidenceIndicator
