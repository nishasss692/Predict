import { PriorityBadge, StatusBadge } from '@/components/common'
import { SeverityBadge, StatusPill } from '@/components/incidents/SeverityBadge'
import { cn } from '@/utils/cn'

/**
 * IncidentCard - the mobile presentation of an incident row.
 *
 * It carries exactly the same fields as the table row so nothing is lost when
 * the table collapses on a narrow screen.
 */
export function IncidentCard({ incident, selected = false, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(incident)}
      aria-pressed={selected}
      className={cn(
        'w-full rounded-panel border px-3 py-3 text-left transition-colors',
        selected
          ? 'border-cyan-signal/60 bg-ink-850'
          : 'border-line bg-ink-900/70 hover:border-line-strong hover:bg-ink-850/60',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-mist-50">{incident.title}</p>
          <p className="mt-0.5 text-[0.6875rem] text-mist-400">
            {incident.id} &middot; {incident.location}
          </p>
        </div>
        <PriorityBadge level={incident.priority} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <StatusBadge category={incident.category} size="sm" />
        <SeverityBadge severity={incident.severity} size="sm" />
        <StatusPill status={incident.status} size="sm" />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[0.6875rem] text-mist-400">
        <span>{incident.source}</span>
        <span className="tabular">{incident.timeLabel}</span>
      </div>
    </button>
  )
}

export default IncidentCard
