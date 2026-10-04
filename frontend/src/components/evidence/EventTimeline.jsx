import { cn } from '@/utils/cn'

import { EventTimelineItem } from './EventTimelineItem'

/**
 * EventTimeline.
 *
 * A single vertical rail that reads the same on desktop and mobile. A caption
 * is required to frame the sequence as an observed order, not causation.
 */
export function EventTimeline({ events = [], caption, className }) {
  if (!events.length) return null

  return (
    <div className={className}>
      {caption && <p className="mb-3 text-xs leading-relaxed text-mist-400">{caption}</p>}
      <ol className={cn('list-none')}>
        {events.map((event, index) => (
          <EventTimelineItem
            key={event.id ?? `${event.timestamp ?? event.time}-${index}`}
            event={event}
            isLast={index === events.length - 1}
          />
        ))}
      </ol>
    </div>
  )
}

export default EventTimeline
