import { cn } from '@/utils/cn'

import { EvidenceCard } from './EvidenceCard'
import { EvidenceStrength } from './EvidenceStrength'

const GRID_COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
}

/**
 * EvidenceList.
 *
 * Renders any evidence collection, either as cards or as a compact list for
 * summary surfaces such as the Overview. It reads items generically, so a
 * caller can pass full evidence objects or lightweight `{ title }` rows.
 */
export function EvidenceList({ items = [], variant = 'cards', columns = 3, emptyLabel, className }) {
  if (!items.length) {
    return emptyLabel ? <p className={cn('text-sm text-mist-400', className)}>{emptyLabel}</p> : null
  }

  if (variant === 'list') {
    return (
      <ul className={cn('space-y-1.5', className)}>
        {items.map((item, index) => {
          const key = item.id ?? item.title ?? index
          const meta = [item.source, item.timestamp].filter(Boolean).join(' \u00b7 ')
          return (
            <li
              key={key}
              className="flex items-center justify-between gap-2 rounded-md border border-line bg-ink-900/50 px-2.5 py-1.5"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-mist-100">{item.title}</span>
                {meta && <span className="mt-0.5 block text-[0.6875rem] text-mist-400">{meta}</span>}
              </span>
              <EvidenceStrength level={item.strength} />
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className={cn('grid gap-4', GRID_COLUMNS[columns] ?? GRID_COLUMNS[3], className)}>
      {items.map((item, index) => (
        <EvidenceCard key={item.id ?? item.title ?? index} {...item} />
      ))}
    </div>
  )
}

export default EvidenceList
