import { useCallback } from 'react'

import { DataPair, PriorityBadge, StatusBadge } from '@/components/common'
import { SeverityBadge, StatusPill } from '@/components/incidents/SeverityBadge'
import { useDialog } from '@/hooks'
import { incidentTypeOf, sensorStateOf } from '@/utils/statusTokens'
import { cn } from '@/utils/cn'

/**
 * IncidentDetailPanel.
 *
 * A slide-over that answers the operator's questions about one incident:
 * what, where, when, how serious, and what it is connected to. The
 * connection is always framed as a hypothesis with named evidence, never a
 * confirmed cause.
 */
export function IncidentDetailPanel({
  incident,
  clusters = [],
  incidents = [],
  sensors = [],
  onClose,
  onSelectIncident,
  onSelectCluster,
}) {
  const close = useCallback(() => onClose?.(), [onClose])
  const panelRef = useDialog({ open: Boolean(incident), onClose: close })

  if (!incident) return null

  const cluster = clusters.find((c) => c.id === incident.clusterId)
  const category = incidentTypeOf(incident.category)
  const nearbyIncidents = (incident.relatedIncidentIds || [])
    .map((id) => incidents.find((i) => i.id === id))
    .filter(Boolean)
  const nearbySensors = (incident.nearbySensors || [])
    .map((id) => sensors.find((s) => s.id === id))
    .filter(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incident-detail-title"
    >
      <div className="animate-fade-in absolute inset-0 bg-black/60" onClick={close} aria-hidden="true" />

      <aside
        ref={panelRef}
        tabIndex={-1}
        className="animate-slide-in-right relative flex h-full w-full max-w-md flex-col border-l border-line bg-ink-950 shadow-panel focus:outline-none"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <p className="font-mono text-[0.625rem] tracking-wide text-mist-400">{incident.id}</p>
            <h2 id="incident-detail-title" className="mt-0.5 text-base font-semibold text-mist-50">
              {incident.title}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <StatusBadge category={incident.category} size="sm" />
              <SeverityBadge severity={incident.severity} size="sm" />
              <StatusPill status={incident.status} size="sm" />
              <PriorityBadge level={incident.priority} size="sm" />
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close details"
            className="rounded-md border border-line-strong bg-ink-800 px-2.5 py-1 text-xs font-semibold text-mist-100 transition-colors hover:border-cyan-signal/50 hover:text-cyan-signal focus-visible:ring-2 focus-visible:ring-cyan-signal focus-visible:outline-none"
          >
            Close
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <p className="text-sm leading-relaxed text-mist-200">{incident.description}</p>

          <section aria-label="Incident facts">
            <h3 className="metric-label">Details</h3>
            <dl className="mt-1.5 divide-y divide-line/70">
              <DataPair label="Location" value={incident.location} />
              <DataPair label="Ward" value={incident.ward || '-'} />
              <DataPair label="Timestamp" value={incident.timeLabel} />
              <DataPair label="Severity" value={<SeverityBadge severity={incident.severity} size="sm" />} />
              <DataPair label="Source" value={incident.source} />
              <DataPair label="Status" value={<StatusPill status={incident.status} size="sm" />} />
              <DataPair label="People affected (est.)" value={incident.peopleAffectedEstimate ?? '-'} />
            </dl>
          </section>

          {cluster && (
            <section aria-label="Cluster relationship">
              <h3 className="metric-label">Cluster relationship</h3>
              <button
                type="button"
                onClick={() => onSelectCluster?.(cluster)}
                className="mt-1.5 w-full rounded-panel border border-line bg-ink-900/70 px-3 py-2.5 text-left transition-colors hover:border-cyan-signal/50 hover:bg-ink-850 focus-visible:ring-2 focus-visible:ring-cyan-signal focus-visible:outline-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-mist-50">
                    Cluster #{cluster.number} &middot; {cluster.area}
                  </span>
                  <PriorityBadge level={cluster.priority} />
                </div>
                <p className="mt-1 text-[0.6875rem] text-mist-400">
                  {cluster.incidentCount} incidents &middot; {cluster.confidence}% confidence
                </p>
              </button>
            </section>
          )}

          <section aria-label="Related incidents">
            <h3 className="metric-label">Nearby incidents</h3>
            {nearbyIncidents.length ? (
              <ul className="mt-1.5 space-y-1.5">
                {nearbyIncidents.map((other) => (
                  <li key={other.id}>
                    <button
                      type="button"
                      onClick={() => onSelectIncident?.(other)}
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-line bg-ink-900/60 px-2.5 py-2 text-left transition-colors hover:border-cyan-signal/40 hover:bg-ink-850 focus-visible:ring-2 focus-visible:ring-cyan-signal focus-visible:outline-none"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-mist-100">{other.title}</span>
                        <span className="mt-0.5 block text-[0.625rem] text-mist-400">
                          {other.id} &middot; {other.location}
                        </span>
                      </span>
                      <SeverityBadge severity={other.severity} size="sm" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-mist-400">No directly related incidents recorded yet.</p>
            )}
          </section>

          <section aria-label="Nearby sensors">
            <h3 className="metric-label">Nearby sensors</h3>
            {nearbySensors.length ? (
              <ul className="mt-1.5 space-y-1.5">
                {nearbySensors.map((sensor) => (
                  <li
                    key={sensor.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-line bg-ink-900/60 px-2.5 py-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-mist-100">{sensor.name}</span>
                      <span className="mt-0.5 block font-mono text-[0.625rem] text-mist-400">{sensor.id}</span>
                    </span>
                    <span className="text-[0.6875rem] text-mist-300 capitalize">
                      {sensorStateOf(sensor.state).label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-mist-400">No drain sensor is deployed near this incident.</p>
            )}
          </section>

          <section
            aria-label="Connection evidence"
            className="rounded-panel border border-violet-analysis/30 bg-violet-analysis/5 px-3 py-3"
          >
            <h3 className="text-xs font-semibold text-violet-analysis">Why is this incident connected?</h3>
            <p className="mt-1 text-[0.6875rem] leading-relaxed text-mist-300">
              The signals below co-occur in the same area and window. This is a hypothesis for investigation,
              not a confirmed cause.
            </p>
            <ul className="mt-2 space-y-1">
              {(incident.evidence || []).map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-mist-200">
                  <span aria-hidden="true" className="mt-0.5 text-cyan-signal">
                    &#10003;
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className={cn('mt-2 text-[0.625rem] text-mist-400')}>
              Category: {category.label}. {category.meaning}
            </p>
          </section>
        </div>
      </aside>
    </div>
  )
}

export default IncidentDetailPanel
