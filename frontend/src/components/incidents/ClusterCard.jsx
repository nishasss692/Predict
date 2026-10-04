import { Card, ConfidenceBadge, PriorityBadge, StatusBadge } from '@/components/common'

const CATEGORY_LOOKUP = {
  Waterlogging: 'waterlogging',
  Potholes: 'potholes',
  'Sewage Overflow': 'sewage_overflow',
  Traffic: 'traffic_disruption',
  'Drain Issue': 'drain_issue',
}

/**
 * ClusterCard.
 *
 * A cluster is a group of incidents that may share a cause. The card leads
 * with the evidence and the hypothesis, and always words the cause as
 * "possible" so an operator never reads it as a verified fact.
 */
export function ClusterCard({ cluster, selected = false, onSelect }) {
  if (!cluster) return null

  return (
    <Card
      as="article"
      variant={selected ? 'raised' : 'solid'}
      className={selected ? 'border-cyan-signal/50' : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.625rem] tracking-wide text-mist-400">{cluster.id}</p>
          <h3 className="mt-0.5 text-sm font-semibold text-mist-50">
            Cluster #{cluster.number} &middot; {cluster.area}
          </h3>
        </div>
        <PriorityBadge level={cluster.priority} />
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {(cluster.categories || []).map((category) => (
          <StatusBadge key={category} category={CATEGORY_LOOKUP[category] || category} size="sm" />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mist-300">
        <span>
          <span className="tabular font-semibold text-mist-100">{cluster.incidentCount}</span> related incidents
        </span>
        <ConfidenceBadge score={cluster.confidence / 100} />
      </div>

      <div className="mt-3 rounded-md border border-violet-analysis/30 bg-violet-analysis/5 px-3 py-2.5">
        <p className="text-[0.6875rem] font-semibold tracking-wide text-violet-analysis uppercase">
          Possible root cause
        </p>
        <p className="mt-1 text-sm text-mist-100">{cluster.possibleRootCause}</p>
        <p className="mt-1.5 text-[0.6875rem] font-semibold tracking-wide text-mist-400 uppercase">
          Recommended action
        </p>
        <p className="mt-0.5 text-xs text-mist-200">{cluster.recommendedAction}</p>
      </div>

      {(cluster.evidence || []).length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {cluster.evidence.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-1 rounded border border-line bg-ink-800/70 px-1.5 py-0.5 text-[0.625rem] text-mist-300"
            >
              <span aria-hidden="true" className="text-cyan-signal">&#10003;</span>
              {item}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[0.625rem] leading-snug text-mist-400">
        This is a hypothesis assembled from correlated signals. It is not a confirmed cause and does not replace
        a field inspection.
      </p>

      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect(cluster)}
          className="mt-3 self-start text-xs font-semibold text-cyan-signal hover:underline"
        >
          View analysis &rarr;
        </button>
      )}
    </Card>
  )
}

export default ClusterCard
