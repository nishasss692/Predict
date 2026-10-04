/**
 * Shared civic data contract, version 1.
 *
 * This file is the single written definition of the wire shapes exchanged
 * between the frontend, the backend service and the AI workstream. The mock
 * transport (`mockApi.js`) and the live HTTP transport (`api.js`) both emit
 * exactly these shapes, so the UI cannot tell which one is answering.
 *
 * Field lists below are the required keys of each entity. Extra presentation
 * fields may ride along on the same object (the frontend keeps a few, such as
 * `title` and `timeLabel`), but a response is only contract-valid when every
 * required key is present.
 *
 * @typedef {'waterlogging'|'potholes'|'sewage_overflow'|'traffic_disruption'|'drain_issue'} IncidentCategory
 * @typedef {'high'|'medium'|'low'} Priority
 * @typedef {'active'|'monitoring'|'closed'} IncidentStatus
 *
 * @typedef {object} Incident
 * @property {string} incident_id
 * @property {string} timestamp         ISO-8601 instant
 * @property {number} latitude
 * @property {number} longitude
 * @property {IncidentCategory} category
 * @property {string} description
 * @property {Priority} severity
 * @property {string} source
 * @property {IncidentStatus} status
 *
 * @typedef {object} Sensor
 * @property {string} sensor_id
 * @property {string} timestamp         ISO-8601 instant
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} sensor_type       e.g. 'drain_level', 'rainfall'
 * @property {number} value
 * @property {string} unit              e.g. 'm', 'mm/hr'
 *
 * @typedef {object} Cluster
 * @property {string} cluster_id
 * @property {string[]} incident_ids
 * @property {number} centroid_lat
 * @property {number} centroid_lon
 * @property {string} start_time        ISO-8601 instant
 * @property {string} end_time          ISO-8601 instant
 * @property {string[]} categories
 * @property {number} cluster_score     0..1
 *
 * @typedef {object} RootCauseEvidence
 * @property {string} id
 * @property {string} title
 * @property {string} [source]
 * @property {string} [timestamp]
 * @property {string} [strength]
 * @property {string} [description]
 *
 * @typedef {object} RootCause
 * @property {string} cluster_id
 * @property {string} root_cause
 * @property {number} confidence        0..1, evidential support - never certainty
 * @property {RootCauseEvidence[]} evidence
 * @property {Priority} priority
 * @property {string[]} affected_incidents
 * @property {object} recommended_action
 */

export const CONTRACT_VERSION = '1.0.0'

export const INCIDENT_FIELDS = [
  'incident_id',
  'timestamp',
  'latitude',
  'longitude',
  'category',
  'description',
  'severity',
  'source',
  'status',
]

export const SENSOR_FIELDS = [
  'sensor_id',
  'timestamp',
  'latitude',
  'longitude',
  'sensor_type',
  'value',
  'unit',
]

export const CLUSTER_FIELDS = [
  'cluster_id',
  'incident_ids',
  'centroid_lat',
  'centroid_lon',
  'start_time',
  'end_time',
  'categories',
  'cluster_score',
]

export const ROOT_CAUSE_FIELDS = [
  'cluster_id',
  'root_cause',
  'confidence',
  'evidence',
  'priority',
  'affected_incidents',
  'recommended_action',
]

export const CONTRACT = {
  version: CONTRACT_VERSION,
  entities: {
    Incident: INCIDENT_FIELDS,
    Sensor: SENSOR_FIELDS,
    Cluster: CLUSTER_FIELDS,
    RootCause: ROOT_CAUSE_FIELDS,
  },
}

/** Keys required by the contract that are absent from `entity`. */
export function missingContractFields(entity, fields) {
  if (!entity || typeof entity !== 'object') return fields.slice()
  return fields.filter((field) => entity[field] === undefined || entity[field] === null)
}

const warned = new Set()

/**
 * Development guard. Logs a single warning per labelled entity shape when a
 * payload drifts from the contract, then stays quiet so the console is not
 * spammed per request. It never throws and never runs in production.
 */
export function assertContract(entity, fields, label) {
  if (!import.meta.env?.DEV) return entity
  const missing = missingContractFields(entity, fields)
  if (missing.length && !warned.has(label)) {
    warned.add(label)
    console.warn(`[contract v${CONTRACT_VERSION}] ${label} is missing: ${missing.join(', ')}`)
  }
  return entity
}
