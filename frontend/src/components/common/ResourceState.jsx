import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'

/**
 * Renders the correct feedback state for a resource from `useResource`, and
 * only renders children when data is actually present.
 *
 * Keeps every screen honest about its four possibilities without each one
 * re-implementing the branching.
 */
export function ResourceState({
  isInitialLoading,
  isError,
  error,
  isEmpty,
  onRetry,
  loadingLabel = 'Loading',
  loadingRows = 3,
  errorTitle,
  emptyTitle,
  emptyMessage,
  emptyIcon = '0',
  emptyAction,
  children,
}) {
  if (isInitialLoading) return <LoadingState label={loadingLabel} rows={loadingRows} />
  if (isError) return <ErrorState title={errorTitle} message={error?.message} onRetry={onRetry} />
  if (isEmpty) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} action={emptyAction} />
  }
  return children
}