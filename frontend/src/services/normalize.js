import { INCIDENT_TYPE } from '@/utils/statusTokens'

/**
 * Contract normalisation.
 *
 * The backend (FastAPI) and the mock transport both emit the required keys in
 * `contract.js`. The required set is intentionally minimal: it covers what the
 * civic model needs and nothing presentational. This module derives the
 * presentational view fields the UI reads (`title`, `timeLabel`, `lat`/`lng`,
 * `clusterId`, `priority`, `confidence`) from those required fields.
 *
 * Every normaliser spreads the original payload first, so any field a backend
 * chooses to send (or the rich mock fixtures already carry) is preserved. It
 * only fills in what is missing. That makes the live and mock transports emit
 * identical shapes, which is what lets the UI stay transport-agnostic.
 */

const IST = 'Asia/Kolkata'
const CATEGORY_FALLBACK = 'Civic incident'

function unwrapEnvelope(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data
  }
  return payload
}

function asList(payload, keys = []) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  if (Array.isArray(payload.data)) return payload.data
  for (const key of [...keys, 'items', 'results']) {
    if (Array.isArray(payload[key])) return payload[key]
  }
  return []
}

function firstSentence(text, max = 96) {
  if (typeof text !== 'string') return null
  const trimmed = text.trim()
  if (!trimmed) return null
  const sentence = trimmed.split(/(?<=[.!?])\s/)[0]
  return sentence.length > max ? `${sentence.slice(0, max - 1).trimEnd()}\u2026` : sentence
}

function titleCase(value) {
  if (typeof value !== 'string' || !value) return value
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function timeLabelOf(timestamp, fallback) {
  if (fallback) return fallback
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '-'
  return date
    .toLocaleTimeString('en-IN', { timeZone: IST, hour: '2-digit', minute: '2-digit', hour12: true })
    .toUpperCase()
}

function priorityFromScore(score) {
  if (score >= 0.78) return 'high'
  if (score >= 0.6) return 'medium'
  return 'low'
}

function sensorStateFromValue(raw) {
  const value = typeof raw.value === 'number' ? raw.value : null
  if (value == null) return 'healthy'
  const type = raw.sensor_type ?? raw.type ?? 'drain_level'
  if (type === 'rainfall') {
    if (value >= 40) return 'critical'
    if (value >= 20) return 'warning'
    return 'healthy'
  }
  if (value >= 1.5) return 'critical'
  if (value >= 0.8) return 'warning'
  return 'healthy'
}

export function normalizeIncident(raw) {
  if (!raw || typeof raw !== 'object') return raw
  const id = raw.incident_id ?? raw.id
  const category = raw.category ?? null
  const label = INCIDENT_TYPE[category]?.label ?? CATEGORY_FALLBACK
  const lat = raw.latitude ?? raw.lat ?? null
  const lng = raw.longitude ?? raw.lng ?? null

  return {
    ...raw,
    id,
    incident_id: id,
    title: raw.title ?? firstSentence(raw.description) ?? label,
    description: raw.description ?? '',
    location: raw.location ?? raw.ward ?? 'Location not recorded',
    ward: raw.ward ?? null,
    lat,
    lng,
    latitude: lat,
    longitude: lng,
    timeLabel: timeLabelOf(raw.timestamp, raw.timeLabel),
    severity: raw.severity ?? raw.priority ?? 'medium',
    priority: raw.priority ?? raw.severity ?? 'medium',
    source: raw.source ?? 'Unknown source',
    status: raw.status ?? 'active',
    clusterId: raw.clusterId ?? raw.cluster_id ?? null,
    confidence: raw.confidence ?? null,
    nearbySensors: raw.nearbySensors ?? [],
    relatedIncidentIds: raw.relatedIncidentIds ?? [],
    evidence: raw.evidence ?? [],
  }
}

export function normalizeIncidents(payload) {
  return asList(payload, ['incidents']).map(normalizeIncident)
}

export function normalizeSensor(raw) {
  if (!raw || typeof raw !== 'object') return raw
  const id = raw.sensor_id ?? raw.id
  const lat = raw.latitude ?? raw.lat ?? null
  const lng = raw.longitude ?? raw.lng ?? null
  const state = raw.state ?? sensorStateFromValue(raw)

  return {
    ...raw,
    id,
    sensor_id: id,
    name: raw.name ?? `${titleCase(raw.sensor_type ?? 'sensor')} ${id}`,
    lat,
    lng,
    latitude: lat,
    longitude: lng,
    type: raw.sensor_type ?? raw.type ?? 'drain_level',
    sensor_type: raw.sensor_type ?? raw.type ?? 'drain_level',
    value: raw.value ?? null,
    unit: raw.unit ?? null,
    state,
  }
}

export function normalizeSensors(payload) {
  return asList(payload, ['sensors']).map(normalizeSensor)
}

export function normalizeCluster(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return raw
  const id = raw.cluster_id ?? raw.id
  const incidentIds = raw.incident_ids ?? raw.incidentIds ?? []
  const score =
    typeof raw.cluster_score === 'number'
      ? raw.cluster_score
      : typeof raw.confidence === 'number'
        ? raw.confidence / 100
        : 0
  const lat = raw.centroid_lat ?? raw.lat ?? null
  const lng = raw.centroid_lon ?? raw.lng ?? null
  const categories = raw.categories ?? []
  const area = raw.area ?? raw.ward ?? titleCase(categories[0] ?? 'Unassigned area')

  return {
    ...raw,
    id,
    cluster_id: id,
    number: raw.number ?? index + 1,
    area,
    ward: raw.ward ?? area,
    categories,
    incidentCount: raw.incidentCount ?? raw.incident_count ?? incidentIds.length,
    confidence: raw.confidence ?? Math.round(score * 100),
    cluster_score: score,
    priority: raw.priority ?? priorityFromScore(score),
    possibleRootCause:
      raw.possibleRootCause ?? raw.root_cause ?? 'Possible localised drainage or surface issue',
    recommendedAction:
      raw.recommendedAction ??
      raw.recommended_action ??
      'Inspect the area and confirm the cause on site before acting.',
    lat,
    lng,
    centroid_lat: lat,
    centroid_lon: lng,
    radius: raw.radius ?? 800,
    evidence: raw.evidence ?? [],
    incident_ids: incidentIds,
    start_time: raw.start_time ?? null,
    end_time: raw.end_time ?? null,
  }
}

export function normalizeClusters(payload) {
  return asList(payload, ['clusters']).map((cluster, index) => normalizeCluster(cluster, index))
}

function normalizeEvidenceItem(item, index) {
  if (!item || typeof item !== 'object') {
    return { id: `ev-${index}`, title: String(item ?? 'Evidence') }
  }
  return {
    ...item,
    id: item.id ?? `ev-${index}`,
    title: item.title ?? firstSentence(item.description) ?? 'Evidence',
  }
}

export function normalizeRootCause(raw) {
  if (!raw || typeof raw !== 'object') return raw
  const payload = unwrapEnvelope(raw)
  const confidenceRaw = typeof payload.confidence === 'number' ? payload.confidence : 0
  const confidence = confidenceRaw > 1 ? confidenceRaw / 100 : confidenceRaw
  const affected = payload.affected_incidents ?? payload.affectedIncidentIds ?? []
  const recommendation = payload.recommended_action ?? payload.recommendation ?? null
  const priority = payload.priority ?? 'medium'

  return {
    ...payload,
    clusterId: payload.clusterId ?? payload.cluster_id ?? null,
    cluster_id: payload.cluster_id ?? payload.clusterId ?? null,
    root_cause: payload.root_cause ?? payload.possibleRootCause ?? 'Possible localised issue',
    possibleRootCause: payload.possibleRootCause ?? payload.root_cause ?? 'Possible localised issue',
    confidence,
    priority,
    affected_incidents: affected,
    affectedIncidentIds: payload.affectedIncidentIds ?? affected,
    affectedIncidentCount: payload.affectedIncidentCount ?? affected.length,
    evidence: (payload.evidence ?? []).map(normalizeEvidenceItem),
    recommended_action: recommendation,
    recommendation,
    number: payload.number ?? null,
    area: payload.area ?? payload.ward ?? null,
    ward: payload.ward ?? payload.area ?? null,
    status: payload.status ?? (priority === 'high' ? 'High Priority' : 'Monitoring'),
    summary: payload.summary ?? '',
    center:
      payload.center ?? {
        lat: payload.centroid_lat ?? null,
        lng: payload.centroid_lon ?? null,
        radius: payload.radius ?? 800,
      },
    graph: payload.graph ?? null,
    timeline: payload.timeline ?? [],
    timelineCaption: payload.timelineCaption ?? '',
  }
}

/** Normalise a `getRecommendations` payload to the contract's array shape. */
export function normalizeRecommendations(payload) {
  const list = asList(payload, ['recommendations'])
  return list.map((item) => unwrapEnvelope(item))
}

export { unwrapEnvelope }
