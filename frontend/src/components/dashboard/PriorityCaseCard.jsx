import { Link } from 'react-router-dom'

import { Button, Card, ConfidenceBadge, MetaChip, PriorityBadge } from '@/components/common'
import { cn } from '@/utils/cn'

/**
 * PriorityCaseCard.
 *
 * Leads the Overview with the single cluster that most deserves attention, so
 * the demo (and a real operator) starts from the case, not from a wall of
 * numbers. Wording stays "possible root cause" - never a confirmed cause.
 */
export function PriorityCaseCard({ cluster, className }) {
  if (!cluster) return null

  const id = cluster.id ?? cluster.cluster_id
  const score = cluster.confidence != null ? cluster.confidence / 100 : (cluster.cluster_score ?? 0)

  return (
    <Card
      variant="raised"
      className={cn('animate-rise border-alert-orange/40', className)}
      aria-label="Priority case"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="metric-label text-alert-orange">Priority case</p>
          <h2 className="text-lg font-semibold tracking-tight text-mist-50">
            Cluster #{cluster.number ?? '?'} &middot; {cluster.area}
          </h2>
          <p className="text-sm text-mist-200">
            <span className="text-mist-400">Possible root cause: </span>
            {cluster.possibleRootCause}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge level={cluster.priority} />
            <ConfidenceBadge score={score} />
            <MetaChip>{cluster.incidentCount ?? 0} incidents</MetaChip>
          </div>
          {cluster.recommendedAction && (
            <p className="text-sm leading-relaxed text-mist-300">{cluster.recommendedAction}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            as={Link}
            to={`/incidents?cluster=${encodeURIComponent(id)}`}
            variant="primary"
            size="sm"
          >
            View incidents
          </Button>
          <Button
            as={Link}
            to={`/root-cause?cluster=${encodeURIComponent(id)}`}
            variant="secondary"
            size="sm"
          >
            Open analysis
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default PriorityCaseCard
