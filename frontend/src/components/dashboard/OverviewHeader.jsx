/**
 * The Overview greeting block. Content is fixed demo copy; only the weather
 * line is data-driven.
 */
export function OverviewHeader({ weather }) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Good Morning, Likith</h1>
      <p className="text-sm text-mist-400">
        Here&rsquo;s what&rsquo;s happening across Bengaluru&rsquo;s civic infrastructure.
      </p>
      <div className="flex flex-wrap gap-3 pt-1 text-xs text-mist-400">
        {weather ? (
          <span>{weather.summary}</span>
        ) : (
          <span aria-live="polite">Weather feed unavailable</span>
        )}
      </div>
    </header>
  )
}

export default OverviewHeader
