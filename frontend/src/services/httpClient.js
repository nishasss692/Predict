/**
 * Minimal HTTP transport.
 *
 * Nothing in `src/components` imports this file. The UI only talks to the
 * facade in `src/services/api.js`, which decides whether a call is served by
 * the mock transport or by this client. Swapping the frontend onto a live
 * FastAPI backend is therefore a single env change, not a UI refactor.
 */

const DEFAULT_TIMEOUT_MS = 12000

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details = null, cause } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    if (cause) this.cause = cause
  }
}

function buildUrl(path, query) {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api'
  const url = `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
  if (!query) return url

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    params.append(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${url}?${qs}` : url
}

export function createHttpClient({ baseUrl, timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('createHttpClient requires a fetch implementation')
  }

  async function request(path, { method = 'GET', query, body, signal } = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), timeoutMs)

    const onAbort = () => controller.abort(signal?.reason)
    signal?.addEventListener('abort', onAbort, { once: true })

    try {
      const response = await fetchImpl(buildUrl(path, query), {
        method,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })

      if (!response.ok) {
        let details = null
        try {
          details = await response.json()
        } catch {
          /* response had no JSON body */
        }
        throw new ApiError(details?.message ?? `Request failed with status ${response.status}`, {
          status: response.status,
          code: details?.code ?? 'HTTP_ERROR',
          details,
        })
      }

      if (response.status === 204) return null
      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
        throw new ApiError('The request was cancelled or timed out.', { code: 'ABORTED', cause: error })
      }
      throw new ApiError('Could not reach the civic data service.', { code: 'NETWORK_ERROR', cause: error })
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }
  }

  return { request, buildUrl: (path, query) => buildUrl(path, query), timeoutMs, baseUrl }
}