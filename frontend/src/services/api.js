import { ApiError, createHttpClient } from './httpClient'
import { createMockApi } from './mockApi'
import {
  normalizeCluster,
  normalizeClusters,
  normalizeIncident,
  normalizeIncidents,
  normalizeRecommendations,
  normalizeRootCause,
  normalizeSensors,
  unwrapEnvelope,
} from './normalize'

/**
 * The single data-access surface the UI is allowed to touch.
 *
 * Components never call `fetch`/`axios`, never import `httpClient` and never
 * reach into the fixtures. They call `api.getIncidents()` and this module
 * decides whether that is answered by the live backend or by the mock
 * transport.
 *
 * Transport selection:
 *   VITE_API_MODE=mock  (default)  local mock transport only
 *   VITE_API_MODE=live             HTTP backend at VITE_API_BASE_URL
 *
 * In `live` mode an unavailable backend (network error, timeout or 5xx) falls
 * back to the mock transport, so the application keeps working in a demo even
 * if the service is down. A real 4xx answer is surfaced, not hidden.
 */

const INTERFACE = [
  'getIncidents',
  'getIncident',
  'getClusters',
  'getCluster',
  'getRootCause',
  'getRecommendations',
  'getSensors',
  'getWeather',
  'getTraffic',
]

function resolveMode() {
  return import.meta.env.VITE_API_MODE === 'live' ? 'live' : 'mock'
}

/**
 * Maps the contract interface onto REST paths for the live backend, then runs
 * every response through the shared normalisers. The backend only has to emit
 * the required contract fields; this is where the presentation view fields the
 * UI reads are derived, so live and mock responses are byte-for-byte the same
 * shape. Envelope variance (`{data}` / `{items}` / `{results}`) is tolerated.
 */
function createLiveApi(client) {
  return {
    mode: 'live',
    getIncidents: async ({ signal, query } = {}) =>
      normalizeIncidents(await client.request('/incidents', { query, signal })),
    getIncident: async (id, { signal } = {}) =>
      normalizeIncident(unwrapEnvelope(await client.request(`/incidents/${encodeURIComponent(id)}`, { signal }))),
    getClusters: async ({ signal } = {}) =>
      normalizeClusters(await client.request('/clusters', { signal })),
    getCluster: async (id, { signal } = {}) =>
      normalizeCluster(
        unwrapEnvelope(await client.request(`/clusters/${encodeURIComponent(id)}`, { signal })),
      ),
    getRootCause: async (clusterId, { signal } = {}) =>
      normalizeRootCause(await client.request(`/clusters/${encodeURIComponent(clusterId)}/root-cause`, { signal })),
    getRecommendations: async (clusterId, { signal } = {}) =>
      normalizeRecommendations(
        await client.request(`/clusters/${encodeURIComponent(clusterId)}/recommendations`, { signal }),
      ),
    getSensors: async ({ signal } = {}) =>
      normalizeSensors(await client.request('/sensors', { signal })),
    getWeather: async ({ signal } = {}) =>
      unwrapEnvelope(await client.request('/weather', { signal })),
    getTraffic: async ({ signal } = {}) =>
      unwrapEnvelope(await client.request('/traffic', { signal })),
  }
}

/** True when a failure means "the backend is unreachable", not "no". */
function shouldFallback(error) {
  if (!(error instanceof ApiError)) return true
  if (error.code === 'ABORTED') return error.cause?.name !== 'AbortError'
  if (error.status === 0) return true
  if (error.status >= 500) return true
  return false
}

/** Calls the live transport, transparently degrading to mock when it is down. */
function withFallback(primary, secondary, methodName) {
  return async (...args) => {
    try {
      return await primary[methodName](...args)
    } catch (error) {
      if (!shouldFallback(error)) throw error
      if (import.meta.env.DEV) {
        console.info(`[api] ${methodName} fell back to mock (${error.code}).`)
      }
      return secondary[methodName](...args)
    }
  }
}

/**
 * Dashboard bundle.
 *
 * Composes the individual resources with `Promise.allSettled`, so one failing
 * feed returns partial data plus a `degraded` list instead of failing the
 * whole screen. Only throws when every resource failed.
 */
async function getOverview(api, { signal } = {}) {
  const names = ['clusters', 'incidents', 'sensors', 'weather']
  const settled = await Promise.allSettled([
    api.getClusters({ signal }),
    api.getIncidents({ signal }),
    api.getSensors({ signal }),
    api.getWeather({ signal }),
  ])

  if (signal?.aborted) throw new DOMException('The request was cancelled.', 'AbortError')

  const data = { clusters: [], incidents: [], sensors: [], weather: null }
  const degraded = []

  settled.forEach((result, index) => {
    const name = names[index]
    if (result.status === 'fulfilled') {
      data[name] = result.value
    } else {
      degraded.push({ resource: name, message: result.reason?.message ?? 'Unavailable' })
    }
  })

  if (degraded.length === names.length) throw settled[0].reason
  return { ...data, degraded }
}

function createApi({ live, mock }) {
  const facade = {}
  for (const name of INTERFACE) {
    facade[name] = live ? withFallback(live, mock, name) : mock[name].bind(mock)
  }
  facade.getOverview = (options) => getOverview(facade, options)
  facade.mode = live ? 'live' : 'mock'
  return facade
}

function buildApi() {
  const mock = createMockApi()
  if (resolveMode() !== 'live') return createApi({ live: null, mock })

  const live = createLiveApi(
    createHttpClient({
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      timeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 12000),
    }),
  )
  return createApi({ live, mock })
}

export const api = buildApi()

/** Which transport is active. Surfaced in the UI so it is never a guess. */
export const apiMode = api.mode

export { ApiError }
export { CONTRACT_VERSION } from './contract'
