import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  SectionHeader,
  StatusBadge,
} from '@/components/common'
import {
  ConfidenceIndicator,
  EventTimeline,
  EvidenceList,
  PriorityIndicator,
  RecommendationPanel,
  RelationshipGraph,
} from '@/components/evidence'
import { useIncidents, useRootCause } from '@/hooks/useApi'
import { CivicMap } from '@/maps'

const DEFAULT_CLUSTER_ID = 'CLS-003'

const EMPTY_LIST = []

function buildAffectedIncidents(ids, incidents) {
  return (ids ?? [])
    .map((id) => incidents.find((incident) => incident.id === id || incident.incident_id === id))
    .filter(Boolean)
}

export function RootCausePage() {
  const [searchParams] = useSearchParams()
  const clusterId = searchParams.get('cluster') || DEFAULT_CLUSTER_ID

  const rootCauseRes = useRootCause(clusterId)
  const incidentsRes = useIncidents()

  const analysis = rootCauseRes.data
  const incidents = incidentsRes.data ?? EMPTY_LIST

  const affectedIncidents = useMemo(
    () => buildAffectedIncidents(analysis?.affected_incidents, incidents),
    [analysis, incidents],
  )

  const mapIncidents = useMemo(
    () => affectedIncidents.map((incident) => ({ ...incident, type: incident.category })),
    [affectedIncidents],
  )

  const mapCluster = useMemo(() => {
    if (!analysis) return null
    return {
      id: analysis.cluster_id,
      number: analysis.number,
      area: analysis.area,
      lat: analysis.center?.lat,
      lng: analysis.center?.lng,
      radius: analysis.center?.radius,
      confidence: Math.round((analysis.confidence ?? 0) * 100),
      priority: analysis.priority,
      incidentCount: analysis.affectedIncidentCount ?? analysis.affected_incidents?.length ?? 0,
      possibleRootCause: analysis.root_cause ?? analysis.possibleRootCause,
    }
  }, [analysis])

  const header = (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Root Cause Analysis</h1>
      <p className="text-sm text-mist-400">
        {analysis
          ? `Cluster #${analysis.number} \u2014 ${analysis.area}`
          : 'Loading cluster analysis'}
      </p>
    </header>
  )

  if (rootCauseRes.isInitialLoading) {
    return (
      <div className="space-y-6">
        {header}
        <LoadingState label="Loading root cause analysis" rows={6} />
      </div>
    )
  }

  if (rootCauseRes.isError) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          title="Root cause analysis unavailable"
          message={rootCauseRes.error?.message}
          onRetry={rootCauseRes.refresh}
        />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon="0"
          title="No analysis available"
          message="A hypothesis appears here once incidents are grouped into a cluster."
        />
      </div>
    )
  }

  const rootCause = analysis.root_cause ?? analysis.possibleRootCause
  const recommendation = analysis.recommended_action ?? analysis.recommendation

  return (
    <div className="space-y-6">
      {header}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <SectionHeader
            title={`Cluster #${analysis.number} \u00b7 ${analysis.area}`}
            actions={<PriorityIndicator level={analysis.priority} />}
          />
          <dl className="mt-3 space-y-3">
            <div>
              <dt className="metric-label">Status</dt>
              <dd className="mt-1 text-sm font-medium text-alert-orange">{analysis.status}</dd>
            </div>
            <div>
              <dt className="metric-label">Possible root cause</dt>
              <dd className="mt-1 text-base font-semibold text-mist-50">{rootCause}</dd>
            </div>
            <div>
              <dt className="metric-label">Summary</dt>
              <dd className="mt-1 text-sm leading-relaxed text-mist-200">{analysis.summary}</dd>
            </div>
          </dl>
          <p className="mt-3 rounded-md border border-violet-analysis/30 bg-violet-analysis/5 px-3 py-2 text-[0.6875rem] leading-relaxed text-mist-300">
            This is a hypothesis assembled from correlated signals. It is a candidate common cause, not a
            confirmed one.
          </p>
        </Card>

        <ConfidenceIndicator score={analysis.confidence} />
      </div>

      <section className="space-y-3" aria-label="Evidence">
        <SectionHeader
          title="Evidence"
          description="Each item names its source, the time it was seen, how it relates to the cluster and how strong it is."
        />
        <EvidenceList items={analysis.evidence} columns={3} />
      </section>

      <Card>
        <SectionHeader
          title="How the signals relate"
          description="The observed sequence on the left and the candidate cause it points to on the right."
        />
        <RelationshipGraph graph={analysis.graph} className="mt-4" />
      </Card>

      <Card>
        <SectionHeader title="Observed sequence" description="What was seen, and when - in order." />
        <EventTimeline events={analysis.timeline} caption={analysis.timelineCaption} className="mt-4" />
      </Card>

      <RecommendationPanel recommendation={recommendation} />

      <section id="affected-area" className="scroll-mt-20 space-y-3" aria-label="Affected area on map">
        <SectionHeader
          title="Affected area"
          description={`Incidents connected to cluster #${analysis.number}, within the ${analysis.center?.radius} m radius.`}
          actions={
            <Button
              as={Link}
              to={`/incidents?cluster=${encodeURIComponent(analysis.cluster_id ?? clusterId)}`}
              variant="secondary"
              size="sm"
            >
              View incident list
            </Button>
          }
        />
        <Card padded={false} className="animate-rise overflow-hidden">
          <CivicMap
            incidents={mapIncidents}
            clusters={mapCluster ? [mapCluster] : []}
            selectedCluster={mapCluster}
            mapLabel={`Map of incidents around cluster #${analysis.number}`}
            className="h-80 w-full"
          />
        </Card>

        <Card className="animate-rise">
          <p className="metric-label">Incidents in this area</p>
          {affectedIncidents.length === 0 ? (
            <p className="mt-1.5 text-xs text-mist-400">
              No individual incidents are linked to this cluster in the current feed.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-line/70">
              {affectedIncidents.map((incident) => (
                <li key={incident.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-mist-100">{incident.title}</p>
                    <p className="mt-0.5 text-xs text-mist-400">
                      {incident.id} &middot; {incident.location} &middot; {incident.timeLabel}
                    </p>
                  </div>
                  <StatusBadge category={incident.category} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  )
}

export default RootCausePage
