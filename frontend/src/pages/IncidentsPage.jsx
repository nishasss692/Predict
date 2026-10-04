import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  ResourceState,
  SectionHeader,
} from '@/components/common'
import {
  ClusterCard,
  FilterBar,
  IncidentDetailPanel,
  IncidentTable,
} from '@/components/incidents'
import { useClusters, useIncidents, useSensors } from '@/hooks/useApi'
import { INCIDENT_TYPE, PRIORITY } from '@/utils/statusTokens'

const CATEGORY_LABEL = Object.fromEntries(
  Object.entries(INCIDENT_TYPE).map(([key, token]) => [key, token.label]),
)

const PRIORITY_RANK = Object.fromEntries(
  Object.entries(PRIORITY).map(([key, token]) => [key, token.rank]),
)

const TIME_RANGE_HOURS = { '1h': 1, '6h': 6, '24h': 24 }

const EMPTY_LIST = []

function anchorTime(incidents) {
  return incidents.reduce((latest, incident) => {
    const time = new Date(incident.timestamp).getTime()
    return time > latest ? time : latest
  }, 0)
}

function Stat({ label, value, context, tone = 'default' }) {
  const valueTone = {
    default: 'text-mist-50',
    warn: 'text-alert-orange',
    danger: 'text-alert-red',
  }[tone]

  return (
    <Card padded={false} className="px-3 py-3">
      <p className="metric-label">{label}</p>
      <p className={`tabular mt-1.5 text-2xl leading-none font-semibold ${valueTone}`}>
        <span key={`${value}`} className="animate-kpi">
          {value}
        </span>
      </p>
      {context && <p className="mt-1.5 text-[0.6875rem] text-mist-400">{context}</p>}
    </Card>
  )
}

export function IncidentsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [priority, setPriority] = useState('all')
  const [status, setStatus] = useState('all')
  const [source, setSource] = useState('all')
  const [timeRange, setTimeRange] = useState('all')
  const [sort, setSort] = useState('newest')

  const [selectedIncidentId, setSelectedIncidentId] = useState(null)
  const [selectedClusterId, setSelectedClusterId] = useState(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const clusterFilter = searchParams.get('cluster')

  const incidentsRes = useIncidents()
  const clustersRes = useClusters()
  const sensorsRes = useSensors()

  const incidents = incidentsRes.data ?? EMPTY_LIST
  const clusters = clustersRes.data ?? EMPTY_LIST
  const sensors = sensorsRes.data ?? EMPTY_LIST

  const selectedIncident = incidents.find((incident) => incident.id === selectedIncidentId) || null

  const clusterFilterLabel = useMemo(() => {
    if (!clusterFilter) return null
    const match = clusters.find((cluster) => (cluster.id ?? cluster.cluster_id) === clusterFilter)
    return match ? `#${match.number ?? '?'} ${match.area}` : clusterFilter
  }, [clusterFilter, clusters])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const anchor = anchorTime(incidents)
    const hours = TIME_RANGE_HOURS[timeRange]
    const since = typeof hours === 'number' ? anchor - hours * 3600 * 1000 : null

    const matches = incidents.filter((incident) => {
      if (clusterFilter && incident.clusterId !== clusterFilter) return false
      if (category !== 'all' && incident.category !== category) return false
      if (priority !== 'all' && incident.priority !== priority) return false
      if (status !== 'all' && incident.status !== status) return false
      if (source !== 'all' && incident.source !== source) return false
      if (since && new Date(incident.timestamp).getTime() < since) return false

      if (query) {
        const haystack = [
          incident.incident_id ?? incident.id,
          incident.title,
          incident.location,
          incident.ward,
          incident.source,
          CATEGORY_LABEL[incident.category] || '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })

    const sorted = matches.slice()
    sorted.sort((a, b) => {
      if (sort === 'priority') return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]
      if (sort === 'severity') return PRIORITY_RANK[b.severity] - PRIORITY_RANK[a.severity]
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
    return sorted
  }, [incidents, clusterFilter, search, category, priority, status, source, timeRange, sort])

  const summary = useMemo(
    () => ({
      total: incidents.length,
      active: incidents.filter((incident) => incident.status === 'active').length,
      highPriority: incidents.filter((incident) => incident.priority === 'high').length,
      clusters: clusters.length,
    }),
    [incidents, clusters],
  )

  const resetFilters = useCallback(() => {
    setSearch('')
    setCategory('all')
    setPriority('all')
    setStatus('all')
    setSource('all')
    setTimeRange('all')
    setSort('newest')
  }, [])

  const selectIncident = useCallback((incident) => {
    setSelectedIncidentId(incident.id)
    if (incident.clusterId) setSelectedClusterId(incident.clusterId)
  }, [])

  const selectCluster = useCallback((cluster) => {
    setSelectedClusterId((current) =>
      current === (cluster.id ?? cluster.cluster_id) ? null : (cluster.id ?? cluster.cluster_id),
    )
  }, [])

  const closeIncident = useCallback(() => setSelectedIncidentId(null), [])

  const selectClusterFromPanel = useCallback((cluster) => {
    setSelectedClusterId(cluster.id ?? cluster.cluster_id)
    setSelectedIncidentId(null)
  }, [])

  const header = (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Incidents</h1>
      <p className="text-sm text-mist-400">Monitor and investigate civic signals across Bengaluru.</p>
    </header>
  )

  if (incidentsRes.isInitialLoading) {
    return (
      <div className="space-y-6">
        {header}
        <LoadingState label="Loading incidents" rows={6} />
      </div>
    )
  }

  if (incidentsRes.isError) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          title="Incidents unavailable"
          message={incidentsRes.error?.message}
          onRetry={incidentsRes.refresh}
        />
      </div>
    )
  }

  if (incidents.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon="0"
          title="No incidents reported"
          message="Nothing has crossed the reporting threshold in this window. A quiet board means a quiet city, not a failed feed."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {header}

      {clusterFilter && (
        <div className="animate-rise flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-signal/40 bg-cyan-signal/8 px-3.5 py-2.5">
          <p className="text-xs text-mist-200">
            Filtered to cluster <span className="font-medium text-mist-50">{clusterFilterLabel}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              as={Link}
              to={`/root-cause?cluster=${encodeURIComponent(clusterFilter)}`}
              variant="secondary"
              size="sm"
            >
              Root cause analysis
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSearchParams({})}>
              Clear filter
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total incidents" value={summary.total} context="Recorded in the last 24h" />
        <Stat label="Active" value={summary.active} context="Still open for action" tone="warn" />
        <Stat label="High priority" value={summary.highPriority} context="Needs response now" tone="danger" />
        <Stat label="Clusters" value={summary.clusters} context="Grouped by shared signal" />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        priority={priority}
        onPriorityChange={setPriority}
        status={status}
        onStatusChange={setStatus}
        source={source}
        onSourceChange={setSource}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        sort={sort}
        onSortChange={setSort}
        onReset={resetFilters}
        resultCount={filtered.length}
      />

      <Card>
        <SectionHeader
          title="Incident list"
          actions={<span className="text-[0.6875rem] text-mist-400">Select a row for full analysis</span>}
        />
        <IncidentTable
          incidents={filtered}
          clusters={clusters}
          selectedId={selectedIncidentId}
          onSelect={selectIncident}
        />
      </Card>

      <section className="space-y-3" aria-label="Incident clusters">
        <SectionHeader
          title="Clusters"
          description="Groups of incidents that may share a cause. Select one to inspect the hypothesis."
        />
        <ResourceState
          isInitialLoading={clustersRes.isInitialLoading}
          isError={clustersRes.isError}
          error={clustersRes.error}
          isEmpty={clusters.length === 0}
          onRetry={clustersRes.refresh}
          loadingLabel="Loading clusters"
          errorTitle="Clusters unavailable"
          emptyTitle="No clusters yet"
          emptyMessage="Clusters form when incidents share a signal and a time window."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {clusters.map((cluster) => (
              <ClusterCard
                key={cluster.id ?? cluster.cluster_id}
                cluster={cluster}
                selected={selectedClusterId === (cluster.id ?? cluster.cluster_id)}
                onSelect={selectCluster}
              />
            ))}
          </div>
        </ResourceState>
      </section>

      <IncidentDetailPanel
        incident={selectedIncident}
        clusters={clusters}
        incidents={incidents}
        sensors={sensors}
        onClose={closeIncident}
        onSelectIncident={selectIncident}
        onSelectCluster={selectClusterFromPanel}
      />
    </div>
  )
}

export default IncidentsPage
