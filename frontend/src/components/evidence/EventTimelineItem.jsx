import { Badge } from '@/components/common'
import { toneOf } from '@/utils/statusTokens'
import { cn } from '@/utils/cn'

import { PriorityIndicator } from './PriorityIndicator'

const TYPE_TONE = {
  signal: 'cyan',
  observed: 'cyan',
  report: 'info',
  system: 'analysis',
}

function typeLabelOf(event) {
  if (event.typeLabel) return event.typeLabel
  if (!event.type) return null
  return event.type.charAt(0).toUpperCase() + event.type.slice(1)
}

/**
 * EventTimelineItem.
 *
 * One event on the observed sequence. Supports timestamp, event type,
 * location, description, source and severity; every one is optional so the
 * same item works for rich and sparse feeds.
 */
export function EventTimelineItem({ event, isLast = false }) {
  const toneName = event.tone ?? TYPE_TONE[event.type] ?? 'muted'
  const tone = toneOf(toneName)
  const typeLabel = typeLabelOf(event)
  const meta = [event.location, event.source].filter(Boolean).join(' \u00b7 ')

  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          aria-hidden="true"
          className={cn('mt-1 size-2.5 shrink-0 rounded-full ring-4 ring-ink-800', tone.dot)}
        />
        {!isLast && <span aria-hidden="true" className="my-1 w-px flex-1 bg-line-strong" />}
      </div>

      <div className={cn('min-w-0 flex-1', isLast ? 'pb-0' : 'pb-3.5')}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {(event.timestamp || event.time) && (
            <span className="tabular font-mono text-xs text-mist-300">{event.timestamp ?? event.time}</span>
          )}
          {event.title && <span className="text-sm font-medium text-mist-100">{event.title}</span>}
          {typeLabel && (
            <Badge tone={toneName} size="sm">
              {typeLabel}
            </Badge>
          )}
          {event.severity && <PriorityIndicator level={event.severity} />}
        </div>

        {meta && <p className="mt-1 text-[0.6875rem] text-mist-400">{meta}</p>}
        {event.description && <p className="mt-1 text-xs leading-relaxed text-mist-200">{event.description}</p>}
      </div>
    </li>
  )
}

export default EventTimelineItem
