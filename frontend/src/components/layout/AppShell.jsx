import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { Sidebar, Topbar } from '@/components/layout/Navigation'
import { PageContainer } from '@/components/layout/PageContainer'

/**
 * The clock lives in its own component so the 30-second tick re-renders only
 * this text, not the page currently mounted in the Outlet.
 */
function LiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <span className="tabular hidden sm:inline">
      {dateStr} &bull; {timeStr} IST
    </span>
  )
}

export function AppShell() {
  const location = useLocation()

  return (
    <div className="min-h-dvh bg-ink-975 text-mist-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:border focus:border-cyan-signal focus:bg-ink-850 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-cyan-signal"
      >
        Skip to main content
      </a>

      <Sidebar />
      <Topbar
        actions={
          <div className="flex items-center gap-3 text-xs text-mist-400">
            <LiveClock />
            <span className="hidden md:inline">24&deg;C &bull; Light rain</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink-850 px-2 py-0.5">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-healthy-teal" />
              <span className="text-[0.6875rem] text-mist-300">Operator</span>
            </span>
          </div>
        }
      />

      <main id="main-content" tabIndex={-1} className="focus:outline-none lg:pl-[252px]">
        <PageContainer>
          <div key={location.pathname} className="animate-page">
            <Outlet />
          </div>
        </PageContainer>
      </main>
    </div>
  )
}
