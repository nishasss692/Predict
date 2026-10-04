import { mockClusters, mockIncidents, mockOverview, mockSensors } from '@/data/mockData'
import { rootCauseAnalysis } from '@/data/rootCauseData'

import {
  assertContract,
  CLUSTER_FIELDS,
  INCIDENT_FIELDS,
  ROOT_CAUSE_FIELDS,
  SENSOR_FIELDS,
} from './contract'
import { ApiError } from './httpClient'
import {
  normalizeCluster,
  normalizeIncident,
  normalizeRootCause,
  normalizeSensor,
} from './normalize'

/**
 * Mock transport.
 *
 * Serves exactly the shared contract (see `contract.js`) from the local
 * fixtures in `src/data`, so the whole application runs with no backend and
 * can be demoed offline. Latency is simulated on purpose: loading and error
 * states are part of the product, not an afterthought.
 *
 * Fixtures are normalised at this boundary. The fixtures keep their readable
 * field names; this transport is what guarantees every response carries
 * `incident_id`, `latitude`, `sensor_id`, `cluster_id` and so on. Swapping to
 * the live transport does not change any of these shapes.
 */

const BASE_LATENCY_MS = 160
const JITTER_MS = 240

/** One instant used for the synthetic context feeds, so the demo is coherent. */
const SNAPSHOT_AT = '2026-10-03T14:30:00+05:30'

const SENSOR_VALUES = {
  critical: { value: 1.82, unit: 'm' },
  warning: { value: 0.94, unit: 'm' },
  healthy: { value: 0.36, unit: 'm' },
}

function abortError() {
  return new DOMException('The request was cancelled.', 'AbortError')
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError())
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    function onAbort() {
      clearTimeout(timer)
      reject(abortError())
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/** Structured clone so a consumer can never mutate a fixture in place. */
function clone(value) {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value))
}

function notFound(entity, id) {
  return new ApiError(`${entity} "${id}" was not found.`, { status: 404, code: 'NOT_FOUND' })
}

/* ------------------------------------------------------------------ */
/* Fixture normalisation - contract fields guaranteed here              */
/* ------------------------------------------------------------------ */

function toIncident(raw) {
  return normalizeIncident(raw)
}

function toSensor(raw) {
  return normalizeSensor({
    ...raw,
    timestamp: raw.timestamp ?? SNAPSHOT_AT,
    value: raw.value ?? SENSOR_VALUES[raw.state]?.value ?? null,
    unit: raw.unit ?? SENSOR_VALUES[raw.state]?.unit ?? 'm',
  })
}

function incidentWindow(clusterId) {
  const times = mockIncidents
    .filter((incident) => incident.clusterId === clusterId)
    .map((incident) => new Date(incident.timestamp).getTime())
    .filter((time) => !Number.isNaN(time))
  if (!times.length) return { start_time: null, end_time: null }
  return {
    start_time: new Date(Math.min(...times)).toISOString(),
    end_time: new Date(Math.max(...times)).toISOString(),
  }
}

function toCluster(raw, index) {
  const incidentIds = mockIncidents.filter((incident) => incident.clusterId === raw.id).map((i) => i.id)
  const window = incidentWindow(raw.id)
  return normalizeCluster(
    {
      ...raw,
      incident_ids: raw.incident_ids ?? incidentIds,
      centroid_lat: raw.centroid_lat ?? raw.lat,
      centroid_lon: raw.centroid_lon ?? raw.lng,
      start_time: raw.start_time ?? window.start_time,
      end_time: raw.end_time ?? window.end_time,
      cluster_score: raw.cluster_score ?? (raw.confidence ?? 0) / 100,
    },
    index,
  )
}

const INCIDENTS = mockIncidents.map(toIncident)
const SENSORS = mockSensors.map(toSensor)
const CLUSTERS = mockClusters.map(toCluster)

/** Built to the RootCause contract, reusing the curated CLS-003 analysis. */
function buildRootCause(clusterId) {
  const cluster = CLUSTERS.find((item) => item.cluster_id === clusterId || item.id === clusterId)

  if (clusterId === rootCauseAnalysis.clusterId) {
    return normalizeRootCause({
      ...clone(rootCauseAnalysis),
      cluster_id: rootCauseAnalysis.clusterId,
      root_cause: rootCauseAnalysis.possibleRootCause,
      confidence: rootCauseAnalysis.confidence / 100,
      priority: rootCauseAnalysis.priority,
      affected_incidents: rootCauseAnalysis.affectedIncidentIds,
      recommended_action: clone(rootCauseAnalysis.recommendation),
    })
  }

  if (!cluster) throw notFound('Cluster', clusterId)

  return normalizeRootCause({
    cluster_id: cluster.cluster_id,
    root_cause: cluster.possibleRootCause,
    confidence: cluster.confidence / 100,
    priority: cluster.priority,
    affected_incidents: cluster.incident_ids,
    recommended_action: {
      action: cluster.recommendedAction,
      why: 'Grouped signals in the same window and radius indicate a plausible shared factor.',
      priority: cluster.priority,
      affectedArea: cluster.area,
      evidenceCount: cluster.evidence.length,
      cta: { label: 'View affected area on map', href: '#affected-area' },
    },
    evidence: cluster.evidence.map((title, index) => ({
      id: `ev-${cluster.cluster_id}-${index}`,
      title,
      strength: 'moderate',
      source: 'Cluster signals',
    })),
    // Frontend extensions so the Root Cause screen can render uniformly.
    number: cluster.number,
    area: cluster.area,
    ward: cluster.ward,
    status: cluster.priority === 'high' ? 'High Priority' : 'Monitoring',
    summary: `${cluster.incidentCount} incidents grouped around ${cluster.area}.`,
    center: { lat: cluster.lat, lng: cluster.lng, radius: cluster.radius },
    graph: null,
    timeline: [],
    timelineCaption: '',
    possibleRootCause: cluster.possibleRootCause,
  })
}

function buildWeather() {
  return {
    timestamp: SNAPSHOT_AT,
    condition: 'Light rain',
    temperature_c: 24,
    rainfall_mm_hr: 12,
    humidity_pct: 78,
    summary: mockOverview.weather,
  }
}

function buildTraffic() {
  const disruptions = INCIDENTS.filter((incident) => incident.category === 'traffic_disruption').map(
    (incident) => ({
      incident_id: incident.incident_id,
      location: incident.location,
      severity: incident.severity,
      source: incident.source,
    }),
  )
  return {
    timestamp: SNAPSHOT_AT,
    overall: disruptions.length > 2 ? 'congested' : 'moderate',
    disruptions,
    summary: `${disruptions.length} traffic disruptions reported across the city`,
  }
}

/** Runs once in development to catch fixture drift from the contract. */
function checkContractShape() {
  INCIDENTS.forEach((incident) => assertContract(incident, INCIDENT_FIELDS, 'Incident'))
  SENSORS.forEach((sensor) => assertContract(sensor, SENSOR_FIELDS, 'Sensor'))
  CLUSTERS.forEach((cluster) => assertContract(cluster, CLUSTER_FIELDS, 'Cluster'))
  const rootCause = buildRootCause(rootCauseAnalysis.clusterId)
  assertContract(rootCause, ROOT_CAUSE_FIELDS, 'RootCause')
}

export function createMockApi({ latencyMs = BASE_LATENCY_MS, jitterMs = JITTER_MS } = {}) {
  let checked = false
  async function settle(signal) {
    if (!checked) {
      checked = true
      checkContractShape()
    }
    await delay(latencyMs + Math.random() * jitterMs, signal)
  }

  return {
    mode: 'mock',

    async getIncidents({ signal, query } = {}) {
      await settle(signal)
      let all = clone(INCIDENTS)
      if (query?.clusterId) all = all.filter((incident) => incident.clusterId === query.clusterId)
      if (query?.category) all = all.filter((incident) => incident.category === query.category)
      if (query?.status) all = all.filter((incident) => incident.status === query.status)
      return all
    },

    async getIncident(id, { signal } = {}) {
      await settle(signal)
      const found = INCIDENTS.find((incident) => incident.incident_id === id || incident.id === id)
      if (!found) throw notFound('Incident', id)
      return clone(found)
    },

    async getClusters({ signal } = {}) {
      await settle(signal)
      return clone(CLUSTERS)
    },

    async getCluster(id, { signal } = {}) {
      await settle(signal)
      const found = CLUSTERS.find((cluster) => cluster.cluster_id === id || cluster.id === id)
      if (!found) throw notFound('Cluster', id)
      return {
        ...clone(found),
        incidents: clone(INCIDENTS.filter((incident) => incident.clusterId === found.id)),
      }
    },

    async getRootCause(clusterId, { signal } = {}) {
      await settle(signal)
      return buildRootCause(clusterId)
    },

    async getRecommendations(clusterId, { signal } = {}) {
      await settle(signal)
      return [buildRootCause(clusterId).recommended_action]
    },

    async getSensors({ signal } = {}) {
      await settle(signal)
      return clone(SENSORS)
    },

    async getWeather({ signal } = {}) {
      await settle(signal)
      return buildWeather()
    },

    async getTraffic({ signal } = {}) {
      await settle(signal)
      return buildTraffic()
    },
  }
}

export default createMockApi

export const MOCK_LATENCY_MS = BASE_LATENCY_MS
