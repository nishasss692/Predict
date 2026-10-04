import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { Button, Card, EmptyState, SectionHeader } from '@/components/common'
import { ConfidenceIndicator, EvidenceList, PriorityIndicator } from '@/components/evidence'

/**
 * ClusterInsightPanel.
 *
 * The Overview's AI analysis card. It leads with the hypothesis, shows how much
 * evidence supports it, and hands off to the full Root Cause screen. Reads the
 * cluster generically so it works with either the rich fixture shape or a bare
 * contract cluster.
 */
export function ClusterInsightPanel({ cluster, className }) {
  const evidenceItems = useMemo(
    () => (cluster?.evidence ?? []).map((item, index) => ({ id: index, title: item })),
    [cluster],
  )

  const score =
    cluster == null ? null : (cluster.confidence ?? (cluster.cluster_score ?? 0) * 100) / 100

  return (
    <Card className={className}>
      <SectionHeader
        title="AI root cause analysis"
        description="Evidence-linked hypotheses, never confirmed causes."
      />
      {cluster ? (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium text-mist-50">
              Cluster #{cluster.number} &middot; {cluster.area}
            </div>
            <PriorityIndicator level={cluster.priority} />
          </div>

          <div>
            <p className="metric-label">Possible root cause</p>
            <p className="mt-1 text-sm text-mist-100">{cluster.possibleRootCause}</p>
          </div>

          <ConfidenceIndicator score={score} variant="compact" showNote={false} />

          <div>
            <p className="metric-label mb-1.5">Supporting evidence</p>
            <EvidenceList variant="list" items={evidenceItems} />
          </div>

          <div>
            <p className="metric-label mb-1.5">Recommended action</p>
            <p className="text-sm text-mist-200">{cluster.recommendedAction}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              as={Link}
              to={`/root-cause?cluster=${encodeURIComponent(cluster.id ?? cluster.cluster_id)}`}
              variant="primary"
            >
              View full analysis
            </Button>
            <Button
              as={Link}
              to={`/incidents?cluster=${encodeURIComponent(cluster.id ?? cluster.cluster_id)}`}
              variant="secondary"
            >
              View incidents
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon="0"
            title="No active cluster to analyse"
            message="A hypothesis appears here once incidents are grouped into a cluster."
          />
        </div>
      )}
    </Card>
  )
}

export default ClusterInsightPanel
