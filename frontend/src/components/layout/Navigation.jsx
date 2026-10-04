import { NavLink, useLocation } from 'react-router-dom'
import { useCallback, useState } from 'react'

import { cn } from '@/utils/cn'
import { IconButton } from '@/components/common'
import { useDialog } from '@/hooks'

const BREADCRUMB_MAP = {
  '/': 'Overview',
  '/incidents': 'Incidents',
  '/root-cause': 'Root Cause Analysis',
  '/map': 'Map View',
  '/reports': 'Reports',
}

const SIDEBAR_NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/incidents', label: 'Incidents', end: false },
  { to: '/root-cause', label: 'Root Cause Analysis', end: false },
  { to: '/map', label: 'Map View', end: false },
  { to: '/reports', label: 'Reports', end: false },
]

function NavIcon({ label }) {
  const base = 'size-5 rounded-sm'
  if (label === 'Overview') return <div aria-hidden className={cn(base, 'bg-cyan-signal')} />
  if (label === 'Incidents') return <div aria-hidden className={cn(base, 'bg-amber-priority')} />
  if (label === 'Root Cause Analysis') return <div aria-hidden className={cn(base, 'bg-blue-light')} />
  if (label === 'Map View') return <div aria-hidden className={cn(base, 'bg-healthy-teal')} />
  if (label === 'Reports') return <div aria-hidden className={cn(base, 'bg-mist-400')} />
  return <div aria-hidden className={cn(base, 'bg-mist-500')} />
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  )
}

function BrandTile() {
  return (
    <div aria-hidden className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-signal to-blue-light shadow-soft">
      <span className="absolute inset-x-1 top-2 h-1 rounded bg-white/80" />
      <span className="absolute inset-x-1 top-4 h-1.5 rounded bg-white/90" />
      <span className="absolute right-2 bottom-1.5 left-1.5 h-1 rounded bg-white/70" />
    </div>
  )
}

export function Sidebar() {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col border-r border-line bg-ink-950/95 lg:flex"
      aria-label="Primary navigation"
    >
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-4">
        <BrandTile />
        <div>
          <div className="text-sm font-semibold tracking-tight">Bengaluru Civic Brain</div>
          <div className="text-[0.6875rem] text-mist-400">Smarter Insights</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main menu">
        <ul className="space-y-1">
          {SIDEBAR_NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-cyan-signal focus-visible:outline-none',
                    isActive
                      ? 'bg-ink-850 text-mist-50 shadow-elev-1'
                      : 'text-mist-300 hover:bg-ink-900 hover:text-mist-100',
                  )
                }
              >
                <NavIcon label={item.label} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-line px-4 py-3 text-xs text-mist-400">
        <div>Synthetic demo data</div>
      </div>
    </aside>
  )
}

export function Topbar({ actions }) {
  const location = useLocation()
  const breadcrumb = BREADCRUMB_MAP[location.pathname] ?? null
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const drawerRef = useDialog({ open: isOpen, onClose: close })

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-ink-950/90 backdrop-blur lg:pl-[252px]">
        <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
          <div className="lg:hidden">
            <IconButton
              label="Open navigation"
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              onClick={open}
              icon={<MenuIcon />}
            />
          </div>

          <div className="flex flex-1 items-center gap-4">
            <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-xs text-mist-400 sm:flex">
              <span>Bengaluru Civic Brain</span>
              {breadcrumb && (
                <>
                  <span aria-hidden>/</span>
                  <span className="text-mist-200">{breadcrumb}</span>
                </>
              )}
            </nav>
            <div className="text-xs text-mist-300 sm:hidden">{breadcrumb ?? 'Overview'}</div>
          </div>

          <div className="flex items-center gap-2">{actions}</div>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-nav-title">
          <div className="animate-fade-in absolute inset-0 bg-black/60" onClick={close} aria-hidden="true" />

          <div
            id="mobile-nav"
            ref={drawerRef}
            tabIndex={-1}
            className="animate-slide-in-left absolute inset-y-0 left-0 flex w-[80%] max-w-[280px] flex-col border-r border-line bg-ink-950 focus:outline-none"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2">
                <BrandTile />
                <h2 id="mobile-nav-title" className="text-sm font-semibold">
                  Bengaluru Civic Brain
                </h2>
              </div>
              <IconButton label="Close navigation" onClick={close} icon={<CloseIcon />} />
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Main menu">
              <ul className="space-y-1">
                {SIDEBAR_NAV.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={close}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm focus-visible:ring-2 focus-visible:ring-cyan-signal focus-visible:outline-none',
                          isActive
                            ? 'bg-ink-850 text-mist-50'
                            : 'text-mist-300 hover:bg-ink-900 hover:text-mist-100',
                        )
                      }
                    >
                      <NavIcon label={item.label} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-line px-4 py-2 text-xs text-mist-400">Synthetic demo data</div>
          </div>
        </div>
      )}
    </>
  )
}
