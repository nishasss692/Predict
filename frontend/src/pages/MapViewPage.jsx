import { useCallback, useMemo, useState } from 'react'

import {
  Card,
  ConfidenceBadge,
  EmptyState,
  ErrorState,
  LoadingState,
  PriorityBadge,
  SectionHeader,
} from '@/components/common'
import { ClusterInsightPanel } from '@/components/dashboard/ClusterInsightPanel'
import { useClusters, useIncidents, useSensors } from '@/hooks/useApi'
import { PageHeader } from '@/components/layout/PageContainer'
import { CivicMap } from '@/maps'

const EMPTY_LIST = []

function bySupport(a, b) {
  return (b.confidence ?? (b.cluster_score ?? 0) * 100) - (a.confidence ?? (a.cluster_score ?? 0) * 100)
}

function clusterIdOf(cluster) {
  return cluster.id ?? cluster.cluster_id
}

/**
 * Map View.
 *
 * The full-width counterpart to the Overview map. Same Leaflet surface, but
 * with room to scan every active cluster and incident at once, and a side rail
 * that reuses the Overview's analysis panel. The cluster list repeats the map's
 * information in text, so the screen is usable without the canvas.
 */
export function MapViewPage() {
  const clustersRes = useClusters()
  const incidentsRes = useIncidents()
  const sensorsRes = useSensors()

  const clusters = clustersRes.data ?? EMPTY_LIST
  const incidents = incidentsRes.data ?? EMPTY_LIST
  const sensors = sensorsRes.data ?? EMPTY_LIST

  const [selectedClusterId, setSelectedClusterId] = useState(null)

  const rankedClusters = useMemo(() => [...clusters].sort(bySupport), [clusters])

  const selectedCluster =
    clusters.find((cluster) => clusterIdOf(cluster) === selectedClusterId) ?? rankedClusters[0] ?? null

  const handleSelect = useCallback((cluster) => {
    setSelectedClusterId(clusterIdOf(cluster))
  }, [])

  const header = (
    <PageHeader
      title="Map View"
      subtitle="Every active cluster and incident plotted across Bengaluru. Select a cluster to inspect the hypothesis behind it and jump to the affected area."
    />
  )

  if (clustersRes.isInitialLoading || incidentsRes.isInitialLoading) {
    return (
      <div className="space-y-6">
        {header}
        <LoadingState label="Loading the city map" rows={6} />
      </div>
    )
  }

  if ((clustersRes.isError || incidentsRes.isError) && clusters.length === 0 && incidents.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          title="Map data unavailable"
          message={(clustersRes.error ?? incidentsRes.error)?.message}
          onRetry={() => {
            clustersRes.refresh()
            incidentsRes.refresh()
            sensorsRes.refresh()
          }}
        />
      </div>
    )
  }

  if (clusters.length === 0 && incidents.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon="0"
          title="Nothing to plot yet"
          message="Once incidents are reported or grouped into clusters, they appear here as pins and numbered areas."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {header}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card padded={false} className="animate-rise overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <SectionHeader
              title="City map"
              description="Numbered circles are clusters (shaded by priority); dots are individual reports; teal pins are sensors."
            />
          </div>
          <CivicMap
            incidents={incidents}
            clusters={clusters}
            sensors={sensors}
            selectedCluster={selectedCluster}
            onClusterSelect={handleSelect}
            mapLabel="Full map of clusters, incidents and sensors"
            className="h-[26rem] w-full sm:h-[32rem]"
          />
        </Card>

        <div className="space-y-4">
          <Card className="animate-rise">
            <SectionHeader title="Clusters" description="Ordered by evidential support." />
            <div className="mt-3 space-y-2">
              {rankedClusters.length === 0 ? (
                <EmptyState
                  icon="0"
                  title="No active clusters"
                  message="Clusters appear when incidents share a signal and a time window."
                />
              ) : (
                rankedClusters.map((cluster) => {
                  const id = clusterIdOf(cluster)
                  const active = id === clusterIdOf(selectedCluster)
                  const score =
                    cluster.confidence != null ? cluster.confidence / 100 : (cluster.cluster_score ?? 0)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedClusterId(id)}
                      aria-pressed={active}
                      className={`w-full rounded-lg border px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-cyan-signal focus-visible:outline-none ${
                        active
                          ? 'border-cyan-signal/60 bg-ink-850'
                          : 'border-line bg-ink-900/40 hover:bg-ink-850/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-mist-100">
                          #{cluster.number ?? '?'} &middot; {cluster.area}
                        </span>
                        <PriorityBadge level={cluster.priority} />
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <ConfidenceBadge score={score} />
                        <span className="text-xs text-mist-400">{cluster.incidentCount} incidents</span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </Card>

          <ClusterInsightPanel cluster={selectedCluster} className="animate-rise" />
        </div>
      </div>
    </div>
  )
}

export default MapViewPage
