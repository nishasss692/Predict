/**
 * Service barrel.
 *
 * UI imports from `@/services` only. It never imports `httpClient`,
 * `mockApi` or the fixtures directly, which keeps the transport an
 * implementation detail. Swapping mock for live is an environment change.
 */
export { api, apiMode, ApiError, CONTRACT_VERSION } from './api'
export {
  CONTRACT,
  CLUSTER_FIELDS,
  INCIDENT_FIELDS,
  ROOT_CAUSE_FIELDS,
  SENSOR_FIELDS,
  missingContractFields,
} from './contract'
