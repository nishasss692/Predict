import { Card } from '@/components/common'
import { cn } from '@/utils/cn'

import { EvidenceIcon } from './EvidenceIcon'
import { EvidenceStrength } from './EvidenceStrength'

/**
 * EvidenceCard.
 *
 * One piece of evidence. Every value is a prop; the component carries no
 * content of its own. Optional fields are simply omitted when absent.
 */
export function EvidenceCard({
  title,
  source,
  timestamp,
  location,
  strength,
  description,
  metric,
  icon,
  className,
}) {
  return (
    <Card as="article" className={cn('h-full', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-ink-850 text-cyan-signal">
            <EvidenceIcon kind={icon} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {source && (
                <p className="text-[0.6875rem] font-medium tracking-wide text-mist-400 uppercase">{source}</p>
              )}
              {title && <h3 className="mt-0.5 text-sm leading-snug font-semibold text-mist-50">{title}</h3>}
            </div>
            <EvidenceStrength level={strength} />
          </div>

          {(timestamp || location) && (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.6875rem] text-mist-400">
              {timestamp && <span className="tabular">{timestamp}</span>}
              {timestamp && location && <span aria-hidden="true">&middot;</span>}
              {location && <span>{location}</span>}
            </p>
          )}

          {description && <p className="mt-2 text-xs leading-relaxed text-mist-200">{description}</p>}

          {metric && (
            <p className="mt-2.5 inline-flex items-baseline gap-1.5 rounded border border-line bg-ink-850/70 px-2 py-1">
              <span className="tabular text-sm leading-none font-semibold text-mist-50">{metric.value}</span>
              {metric.unit && <span className="text-[0.6875rem] text-mist-300">{metric.unit}</span>}
              {metric.label && <span className="text-[0.625rem] tracking-wide text-mist-400 uppercase">{metric.label}</span>}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

export default EvidenceCard
