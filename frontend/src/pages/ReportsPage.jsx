import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  Card,
  ConfidenceBadge,
  EmptyState,
  ErrorState,
  LoadingState,
  MetaChip,
  MetricCard,
  MetricGrid,
  PriorityBadge,
  SectionHeader,
  StatusBadge,
} from '@/components/common'
import { PageHeader } from '@/components/layout/PageContainer'
import { useOverview, useRootCause } from '@/hooks/useApi'
import { apiMode } from '@/services'
import { INCIDENT_TYPE_ORDER, PRIORITY_ORDER } from '@/utils/statusTokens'

const EMPTY_LIST = []

function bySupport(a, b) {
  return (b.confidence ?? (b.cluster_score ?? 0) * 100) - (a.confidence ?? (a.cluster_score ?? 0) * 100)
}

function clusterIdOf(cluster) {
  return cluster.id ?? cluster.cluster_id
}

function BreakdownRow({ label, count, max, children }) {
  const width = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        {children ?? <span className="text-xs text-mist-200">{label}</span>}
        <span className="tabular text-xs font-semibold text-mist-100">{count}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full bg-cyan-signal/70"
          style={{ width: `${width}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

/**
 * Reports.
 *
 * A one-page operational brief assembled from the same feeds the rest of the
 * app uses: totals, category and priority breakdowns, the cluster register and
 * the current priority case. It can be downloaded as JSON so the brief leaves
 * the screen with its numbers intact.
 */
export function ReportsPage() {
  const overviewRes = useOverview()

  const clusters = overviewRes.data?.clusters ?? EMPTY_LIST
  const incidents = overviewRes.data?.incidents ?? EMPTY_LIST
  const sensors = overviewRes.data?.sensors ?? EMPTY_LIST

  const rankedClusters = useMemo(() => [...clusters].sort(bySupport), [clusters])
  const priorityCase = rankedClusters[0] ?? null
  const priorityCaseId = priorityCase ? clusterIdOf(priorityCase) : null

  const rootCauseRes = useRootCause(priorityCaseId)
  const analysis = rootCauseRes.data

  const totals = useMemo(() => {
    const highPriority = incidents.filter((incident) => incident.priority === 'high').length
    const criticalSensors = sensors.filter((sensor) => sensor.state === 'critical').length
    const avgConfidence = clusters.length
      ? Math.round(
          clusters.reduce(
            (sum, cluster) => sum + (cluster.confidence ?? (cluster.cluster_score ?? 0) * 100),
            0,
          ) / clusters.length,
        )
      : 0
    return { incidents: incidents.length, clusters: clusters.length, highPriority, criticalSensors, avgConfidence }
  }, [incidents, clusters, sensors])

  const categoryRows = useMemo(() => {
    const counts = INCIDENT_TYPE_ORDER.map((key) => ({
      key,
      count: incidents.filter((incident) => incident.category === key).length,
    }))
    const max = counts.reduce((peak, row) => Math.max(peak, row.count), 0)
    return { counts, max }
  }, [incidents])

  const priorityRows = useMemo(() => {
    const counts = PRIORITY_ORDER.map((key) => ({
      key,
      count: incidents.filter((incident) => incident.priority === key).length,
    }))
    const max = counts.reduce((peak, row) => Math.max(peak, row.count), 0)
    return { counts, max }
  }, [incidents])

  const handleExport = useCallback(() => {
    const report = {
      generatedAt: new Date().toISOString(),
      transport: apiMode,
      totals,
      priorityBreakdown: Object.fromEntries(priorityRows.counts.map((row) => [row.key, row.count])),
      categoryBreakdown: Object.fromEntries(categoryRows.counts.map((row) => [row.key, row.count])),
      clusters: rankedClusters.map((cluster) => ({
        id: clusterIdOf(cluster),
        number: cluster.number,
        area: cluster.area,
        incidents: cluster.incidentCount,
        confidence: cluster.confidence,
        priority: cluster.priority,
        possibleRootCause: cluster.possibleRootCause,
        recommendedAction: cluster.recommendedAction,
      })),
      priorityCase: analysis
        ? {
            clusterId: analysis.cluster_id ?? analysis.clusterId,
            possibleRootCause: analysis.possibleRootCause ?? analysis.root_cause,
            confidence: analysis.confidence,
            priority: analysis.priority,
            affectedIncidents: analysis.affectedIncidentCount,
            evidence: (analysis.evidence ?? []).map((item) => item.title),
            recommendedAction: analysis.recommended_action?.action ?? analysis.recommendation?.action,
          }
        : null,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `civic-brain-report-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [totals, priorityRows, categoryRows, rankedClusters, analysis])

  const header = (
    <PageHeader
      title="Reports"
      subtitle="A single operational brief for the current window: what is happening, where, and what the evidence points to."
      actions={
        <>
          <MetaChip>{apiMode === 'live' ? 'Live API' : 'Mock data'}</MetaChip>
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={overviewRes.isInitialLoading}>
            Download report
          </Button>
        </>
      }
    />
  )

  if (overviewRes.isInitialLoading) {
    return (
      <div className="space-y-6">
        {header}
        <LoadingState label="Assembling the report" rows={7} />
      </div>
    )
  }

  if (overviewRes.isError) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          title="Report unavailable"
          message={overviewRes.error?.message}
          onRetry={overviewRes.refresh}
        />
      </div>
    )
  }

  if (incidents.length === 0 && clusters.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon="0"
          title="Nothing to report yet"
          message="The report fills in once incidents have been reported in this window."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {header}

      <MetricGrid columns={4}>
        <MetricCard label="Incidents" value={totals.incidents} context="Reported in this window" />
        <MetricCard label="Clusters" value={totals.clusters} context="Grouped by shared signal" />
        <MetricCard
          label="Average Confidence"
          value={`${totals.avgConfidence}%`}
          context="Across active clusters"
          tone="analysis"
        />
        <MetricCard
          label="High Priority"
          value={totals.highPriority}
          context="Needs response now"
          tone="danger"
        />
      </MetricGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="animate-rise">
          <SectionHeader title="By category" description="Incident mix in this window." />
          <div className="mt-4 space-y-3">
            {categoryRows.counts.map((row) => (
              <BreakdownRow key={row.key} count={row.count} max={categoryRows.max}>
                <StatusBadge category={row.key} size="sm" />
              </BreakdownRow>
            ))}
          </div>
        </Card>

        <Card className="animate-rise">
          <SectionHeader title="By priority" description="How soon each incident needs a crew." />
          <div className="mt-4 space-y-3">
            {priorityRows.counts.map((row) => (
              <BreakdownRow key={row.key} count={row.count} max={priorityRows.max}>
                <PriorityBadge level={row.key} />
              </BreakdownRow>
            ))}
          </div>
          <p className="mt-4 border-t border-line pt-3 text-[0.6875rem] leading-relaxed text-mist-400">
            Priority reflects how soon a crew should act. It is separate from evidential confidence, which
            describes how much the signals support a candidate cause.
          </p>
        </Card>
      </div>

      <section className="space-y-3" aria-label="Cluster register">
        <SectionHeader
          title="Cluster register"
          description="Each cluster with its size, evidential support and candidate cause."
        />
        <Card padded={false} className="animate-rise overflow-hidden">
          {rankedClusters.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon="0"
                title="No clusters in this window"
                message="Clusters appear when incidents share a signal and a time window."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-sm">
                <caption className="sr-only">Cluster register for the current reporting window</caption>
                <thead>
                  <tr className="border-b border-line text-left text-[0.6875rem] tracking-wide text-mist-400 uppercase">
                    <th scope="col" className="px-4 py-2.5 font-semibold">Cluster</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Incidents</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Support</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Priority</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Possible root cause</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedClusters.map((cluster) => {
                    const score =
                      cluster.confidence != null ? cluster.confidence / 100 : (cluster.cluster_score ?? 0)
                    return (
                      <tr key={clusterIdOf(cluster)} className="border-b border-line/60 last:border-0">
                        <th scope="row" className="px-4 py-2.5 text-left font-medium text-mist-100">
                          #{cluster.number ?? '?'} &middot; {cluster.area}
                        </th>
                        <td className="tabular px-4 py-2.5 text-mist-200">{cluster.incidentCount ?? 0}</td>
                        <td className="px-4 py-2.5">
                          <ConfidenceBadge score={score} />
                        </td>
                        <td className="px-4 py-2.5">
                          <PriorityBadge level={cluster.priority} />
                        </td>
                        <td className="px-4 py-2.5 text-mist-300">{cluster.possibleRootCause}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      <section className="space-y-3" aria-label="Priority case">
        <SectionHeader
          title="Priority case"
          description="The cluster the evidence currently points to most strongly."
        />
        {rootCauseRes.isInitialLoading ? (
          <LoadingState label="Loading the priority case" rows={3} />
        ) : analysis ? (
          <Card variant="raised" className="animate-rise border-alert-orange/40">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-mist-50">
                    Cluster #{analysis.number ?? '?'} &middot; {analysis.area}
                  </span>
                  <PriorityBadge level={analysis.priority} />
                  <ConfidenceBadge score={analysis.confidence} />
                </div>
                <div>
                  <p className="metric-label">Possible root cause</p>
                  <p className="mt-1 text-sm text-mist-200">
                    {analysis.possibleRootCause ?? analysis.root_cause}
                  </p>
                </div>
                <p className="rounded-md border border-violet-analysis/30 bg-violet-analysis/5 px-3 py-2 text-[0.6875rem] leading-relaxed text-mist-300">
                  A hypothesis assembled from correlated signals. A candidate common cause, not a confirmed
                  one.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="metric-label">Recommended action</p>
                  <p className="mt-1 text-sm text-mist-200">
                    {analysis.recommended_action?.action ?? analysis.recommendation?.action}
                  </p>
                </div>
                <div>
                  <p className="metric-label">
                    Supporting evidence &middot; {analysis.evidence?.length ?? 0} items
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {(analysis.evidence ?? []).map((item) => (
                      <li key={item.id} className="flex items-start gap-2 text-xs text-mist-300">
                        <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-violet-analysis" />
                        <span>{item.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  as={Link}
                  to={`/incidents?cluster=${encodeURIComponent(analysis.cluster_id ?? analysis.clusterId)}`}
                  variant="secondary"
                  size="sm"
                >
                  View incidents in this cluster
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="animate-rise">
            <EmptyState
              icon="0"
              title="No priority case"
              message="A candidate cause appears here once a cluster has enough supporting evidence."
            />
          </Card>
        )}
      </section>
    </div>
  )
}

export default ReportsPage
