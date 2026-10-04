import { useCallback, useEffect, useRef, useState } from 'react'

const IDLE = { status: 'idle', data: null, error: null }

/**
 * Small async-data hook. Deliberately not a state library.
 *
 * Keeps the previous payload visible during a refresh so the interface does
 * not flash empty while polling, and cancels in-flight work on unmount.
 *
 * `deps` must be a stable-length array of primitives.
 */
export function useResource(loader, deps = [], { enabled = true } = {}) {
  const loaderRef = useRef(loader)
  const [state, setState] = useState(IDLE)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    loaderRef.current = loader
  })

  useEffect(() => {
    if (!enabled) {
      setState(IDLE)
      return undefined
    }

    const controller = new AbortController()
    let active = true

    setState((previous) => ({ status: 'loading', data: previous.data, error: null }))

    loaderRef
      .current({ signal: controller.signal })
      .then((data) => {
        if (active) setState({ status: 'ready', data, error: null })
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') return
        setState({ status: 'error', data: null, error })
      })

    return () => {
      active = false
      controller.abort()
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken, enabled])

  const refresh = useCallback(() => setReloadToken((token) => token + 1), [])

  return {
    data: state.data,
    error: state.error,
    status: state.status,
    isLoading: state.status === 'loading',
    isInitialLoading: state.status === 'loading' && state.data === null,
    isRefreshing: state.status === 'loading' && state.data !== null,
    isError: state.status === 'error',
    isEmpty: state.status === 'ready' && state.data === null,
    refresh,
  }
}