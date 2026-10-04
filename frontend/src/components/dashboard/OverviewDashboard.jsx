import { useCallback, useMemo, useState } from 'react'

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  MetricGrid,
  SectionHeader,
  StatusBadge,
} from '@/components/common'
import { ClusterInsightPanel } from '@/components/dashboard/ClusterInsightPanel'
import { OverviewHeader } from '@/components/dashboard/OverviewHeader'
import { PriorityCaseCard } from '@/components/dashboard/PriorityCaseCard'
import { TrendCard } from '@/components/dashboard/TrendCard'
import { PriorityIndicator } from '@/components/evidence'
import { useOverview } from '@/hooks/useApi'
import { CivicMap } from '@/maps'

const EMPTY_LIST = []

const RESOURCE_LABEL = {
  clusters: 'clusters',
  incidents: 'incidents',
  sensors: 'sensors',
  weather: 'weather',
}

export function OverviewDashboard() {
  const [selectedClusterId, setSelectedClusterId] = useState(null)
  const resource = useOverview()

  const data = resource.data
  const clusters = data?.clusters ?? EMPTY_LIST
  const incidents = data?.incidents ?? EMPTY_LIST
  const sensors = data?.sensors ?? EMPTY_LIST
  const weather = data?.weather ?? null
  const degraded = data?.degraded ?? EMPTY_LIST

  const rankedClusters = useMemo(
    () =>
      [...clusters].sort(
        (a, b) =>
          (b.confidence ?? (b.cluster_score ?? 0) * 100) - (a.confidence ?? (a.cluster_score ?? 0) * 100),
      ),
    [clusters],
  )

  const priorityCase = rankedClusters[0] ?? null

  const selectedCluster =
    clusters.find((cluster) => (cluster.id ?? cluster.cluster_id) === selectedClusterId) ??
    priorityCase ??
    null

  const recentIncidents = useMemo(
    () =>
      [...incidents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5),
    [incidents],
  )

  const metrics = useMemo(() => {
    const avgConfidence = clusters.length
      ? Math.round(
          clusters.reduce(
            (sum, cluster) => sum + (cluster.confidence ?? (cluster.cluster_score ?? 0) * 100),
            0,
          ) / clusters.length,
        )
      : 0
    return {
      total: incidents.length,
      clusters: clusters.length,
      avgConfidence,
      highPriority: incidents.filter((incident) => incident.priority === 'high').length,
    }
  }, [clusters, incidents])

  const handleClusterSelect = useCallback((cluster) => {
    setSelectedClusterId(cluster.id ?? cluster.cluster_id)
  }, [])

  if (resource.isInitialLoading) {
    return (
      <div className="space-y-6">
        <OverviewHeader weather={null} />
        <LoadingState label="Loading the civic overview" rows={7} />
      </div>
    )
  }

  if (resource.isError) {
    return (
      <div className="space-y-6">
        <OverviewHeader weather={null} />
        <ErrorState
          title="Unable to load civic data"
          message={resource.error?.message}
          onRetry={resource.refresh}
        />
      </div>
    )
  }

  const nothingToShow = clusters.length === 0 && incidents.length === 0 && degraded.length === 0

  if (nothingToShow) {
    return (
      <div className="space-y-6">
        <OverviewHeader weather={weather} />
        <EmptyState
          icon="0"
          title="No incidents found"
          message="The pipeline is running but nothing has crossed the reporting threshold yet. An empty board here means a quiet city, not a broken feed."
        />
      </div>
    )
  }

  const mapUnavailable = clusters.length === 0 && incidents.length === 0 && degraded.length > 0

  return (
    <div className="space-y-6">
      <OverviewHeader weather={weather} />

      {degraded.length > 0 && (
        <div
          role="status"
          className="animate-rise flex flex-wrap items-center justify-between gap-3 rounded-lg border border-alert-amber/40 bg-alert-amber/8 px-3.5 py-2.5"
        >
          <p className="text-xs text-alert-amber">
            Showing partial data &mdash;{' '}
            {degraded.map((item) => RESOURCE_LABEL[item.resource] ?? item.resource).join(', ')}{' '}
            {degraded.length === 1 ? 'is' : 'are'} unavailable right now.
          </p>
          <Button variant="secondary" size="sm" onClick={resource.refresh}>
            Retry
          </Button>
        </div>
      )}

      {priorityCase && <PriorityCaseCard cluster={priorityCase} />}

      <MetricGrid columns={4}>
        <MetricCard label="Total Incidents" value={metrics.total} context="Recorded in the last 24h" />
        <MetricCard label="Active Clusters" value={metrics.clusters} context="Grouped by shared signal" />
        <MetricCard
          label="Average Confidence"
          value={`${metrics.avgConfidence}%`}
          context="Across active clusters"
        />
        <MetricCard
          label="High Priority"
          value={metrics.highPriority}
          context="Needs response now"
          tone="danger"
        />
      </MetricGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="animate-rise">
          <SectionHeader
            title="City incident map"
            description="Clusters and live incidents across Bengaluru. Select a cluster to inspect it."
          />
          <div className="mt-3">
            {mapUnavailable ? (
              <ErrorState title="Unable to load civic data" message="Clusters and incidents could not be loaded.">
                <Button variant="secondary" size="sm" className="mt-2.5" onClick={resource.refresh}>
                  Retry
                </Button>
              </ErrorState>
            ) : (
              <CivicMap
                incidents={incidents}
                clusters={clusters}
                sensors={sensors}
                selectedCluster={selectedCluster}
                onClusterSelect={handleClusterSelect}
                mapLabel="Overview map of clusters and incidents"
                className="h-72 w-full overflow-hidden rounded-panel"
              />
            )}
          </div>
        </Card>

        <ClusterInsightPanel cluster={selectedCluster} className="animate-rise" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="animate-rise">
          <SectionHeader title="Incident clusters" description="Grouped by shared signal and proximity." />
          <div className="mt-3 space-y-2">
            {clusters.length === 0 ? (
              <EmptyState
                icon="0"
                title="No active clusters"
                message="Clusters appear when incidents share a signal and a window."
              />
            ) : (
              clusters.map((cluster) => {
                const id = cluster.id ?? cluster.cluster_id
                const active = id === (selectedCluster?.id ?? selectedCluster?.cluster_id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedClusterId(id)}
                    aria-pressed={active}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-cyan-signal focus-visible:outline-none ${
                      active
                        ? 'animate-pulse-ring border-cyan-signal/60 bg-ink-850'
                        : 'border-line bg-ink-900/40 hover:bg-ink-850/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-mist-100">
                        Cluster #{cluster.number} &middot; {cluster.area}
                      </span>
                      <PriorityIndicator level={cluster.priority} />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-mist-400">
                      <span>{cluster.incidentCount} incidents</span>
                      <span>Confidence {cluster.confidence}%</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="animate-rise">
            <SectionHeader title="Recent incidents" />
            <div className="mt-3 space-y-1.5">
              {recentIncidents.length === 0 ? (
                <EmptyState icon="0" title="No incidents found" message="New reports will appear here." />
              ) : (
                recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line bg-ink-900/40 px-2.5 py-1.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-mist-100">{incident.title}</p>
                      <p className="mt-0.5 text-xs text-mist-400">
                        {incident.location} &middot; {incident.timeLabel}
                      </p>
                    </div>
                    <StatusBadge category={incident.category} size="sm" />
                  </div>
                ))
              )}
            </div>
          </Card>

          <TrendCard incidents={incidents} className="animate-rise" />
        </div>
      </div>
    </div>
  )
}

export default OverviewDashboard
