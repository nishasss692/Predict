import { Button, Input, Select } from '@/components/common'
import { INCIDENT_TYPE, PRIORITY } from '@/utils/statusTokens'

const TIME_RANGES = [
  { value: 'all', label: 'Any time' },
  { value: '1h', label: 'Last hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '24h', label: 'Last 24 hours' },
]

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'priority', label: 'Highest priority' },
  { value: 'severity', label: 'Highest severity' },
]

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'closed', label: 'Closed' },
]

const SOURCES = [
  'Citizen complaint',
  'Drain sensor',
  'Traffic feed',
  'Sanitation crew',
  'Ward inspector',
]

export function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  source,
  onSourceChange,
  timeRange,
  onTimeRangeChange,
  sort,
  onSortChange,
  onReset,
  resultCount,
}) {
  return (
    <section
      aria-label="Incident filters"
      className="rounded-panel border border-line bg-ink-900/70 px-3 py-3 shadow-panel"
    >
      <div className="flex flex-wrap items-end gap-3">
        <Input
          label="Search"
          type="search"
          size="md"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search incidents, areas, IDs"
          containerClassName="min-w-[12rem] flex-1"
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          containerClassName="w-[9.5rem]"
        >
          <option value="all">All categories</option>
          {Object.entries(INCIDENT_TYPE).map(([value, token]) => (
            <option key={value} value={value}>
              {token.label}
            </option>
          ))}
        </Select>

        <Select
          label="Priority"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          containerClassName="w-[8rem]"
        >
          <option value="all">All priorities</option>
          {Object.entries(PRIORITY).map(([value, token]) => (
            <option key={value} value={value}>
              {token.label}
            </option>
          ))}
        </Select>

        <Select
          label="Status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          containerClassName="w-[8rem]"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>

        <Select
          label="Source"
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          containerClassName="w-[10rem]"
        >
          <option value="all">All sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select
          label="Time range"
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          containerClassName="w-[9rem]"
        >
          {TIME_RANGES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>

        <Select
          label="Sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          containerClassName="w-[10rem]"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>

        <Button variant="ghost" onClick={onReset} className="mb-px">
          Reset
        </Button>
      </div>

      {typeof resultCount === 'number' && (
        <p className="mt-2 text-[0.6875rem] text-mist-400">
          {resultCount} {resultCount === 1 ? 'incident' : 'incidents'} match the current filters
        </p>
      )}
    </section>
  )
}

export default FilterBar
