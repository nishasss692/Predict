import { memo } from 'react'

import { PriorityBadge, StatusBadge } from '@/components/common'
import { IncidentCard } from '@/components/incidents/IncidentCard'
import { SeverityBadge, StatusPill } from '@/components/incidents/SeverityBadge'
import { cn } from '@/utils/cn'

function clusterLabel(clusterId, clusters) {
  const cluster = clusters?.find((c) => c.id === clusterId)
  return cluster ? `#${cluster.number} ${cluster.area}` : clusterId || '-'
}

/**
 * IncidentTable.
 *
 * One data source, two presentations: a real table from `md` up and cards
 * below it. Selection is lifted to the caller; the table holds no state of
 * its own beyond presentation.
 */
function IncidentTable({ incidents, clusters = [], selectedId, onSelect, className }) {
  if (!incidents?.length) {
    return (
      <p className={cn('px-1 py-6 text-center text-sm text-mist-400', className)}>
        No incidents match the current filters.
      </p>
    )
  }

  return (
    <div className={className}>
      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-sm">
          <caption className="sr-only">Incidents matching the current filters</caption>
          <thead>
            <tr className="border-b border-line text-left text-[0.6875rem] tracking-wide text-mist-400 uppercase">
              <th scope="col" className="py-2 pr-3 font-semibold">Incident</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Location</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Timestamp</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Severity</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Source</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Status</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Cluster</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => {
              const selected = incident.id === selectedId
              return (
                <tr
                  key={incident.id}
                  onClick={() => onSelect?.(incident)}
                  className={cn(
                    'cursor-pointer border-b border-line/70 transition-colors',
                    selected ? 'bg-ink-850' : 'hover:bg-ink-850/50',
                  )}
                >
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      onClick={() => onSelect?.(incident)}
                      className="rounded text-left font-semibold text-mist-50 hover:text-cyan-signal focus-visible:ring-2 focus-visible:ring-cyan-signal focus-visible:outline-none"
                    >
                      <span className="block max-w-[16rem] truncate">{incident.title}</span>
                      <span className="mt-0.5 block font-mono text-[0.625rem] text-mist-400">{incident.id}</span>
                    </button>
                  </td>
                  <td className="py-2 pr-3">
                    <StatusBadge category={incident.category} size="sm" />
                  </td>
                  <td className="py-2 pr-3 text-mist-200">{incident.location}</td>
                  <td className="py-2 pr-3">
                    <span className="tabular text-mist-200">{incident.timeLabel}</span>
                    <PriorityBadge level={incident.priority} size="sm" className="ml-2 align-middle" />
                  </td>
                  <td className="py-2 pr-3">
                    <SeverityBadge severity={incident.severity} size="sm" />
                  </td>
                  <td className="py-2 pr-3 text-mist-300">{incident.source}</td>
                  <td className="py-2 pr-3">
                    <StatusPill status={incident.status} size="sm" />
                  </td>
                  <td className="py-2 pr-3 text-mist-300">{clusterLabel(incident.clusterId, clusters)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-2 md:hidden">
        {incidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            selected={incident.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

const MemoIncidentTable = memo(IncidentTable)

export { MemoIncidentTable as IncidentTable }
export default MemoIncidentTable
