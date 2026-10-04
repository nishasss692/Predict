import { api } from '@/services'

import { useResource } from './useResource'

/**
 * Data hooks.
 *
 * Thin, named wrappers over `useResource` for each contract call. Screens use
 * these instead of talking to `api` in a dozen `useEffect`s, and each one
 * exposes the same loading / error / empty / refresh contract.
 */

export function useIncidents(query) {
  return useResource(
    ({ signal }) => api.getIncidents({ signal, query }),
    [query?.clusterId ?? '', query?.category ?? '', query?.status ?? ''],
  )
}

export function useIncident(id) {
  return useResource(({ signal }) => api.getIncident(id, { signal }), [id], { enabled: Boolean(id) })
}

export function useClusters() {
  return useResource(({ signal }) => api.getClusters({ signal }), [])
}

export function useCluster(id) {
  return useResource(({ signal }) => api.getCluster(id, { signal }), [id], { enabled: Boolean(id) })
}

export function useRootCause(clusterId) {
  return useResource(({ signal }) => api.getRootCause(clusterId, { signal }), [clusterId], {
    enabled: Boolean(clusterId),
  })
}

export function useRecommendations(clusterId) {
  return useResource(({ signal }) => api.getRecommendations(clusterId, { signal }), [clusterId], {
    enabled: Boolean(clusterId),
  })
}

export function useSensors() {
  return useResource(({ signal }) => api.getSensors({ signal }), [])
}

export function useWeather() {
  return useResource(({ signal }) => api.getWeather({ signal }), [])
}

export function useTraffic() {
  return useResource(({ signal }) => api.getTraffic({ signal }), [])
}

export function useOverview() {
  return useResource(({ signal }) => api.getOverview({ signal }), [])
}
