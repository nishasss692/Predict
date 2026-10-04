import { useMemo } from 'react'

import { Card, EmptyState, SectionHeader } from '@/components/common'

function hourlyTrend(incidents, buckets = 7) {
  const times = incidents
    .map((incident) => new Date(incident.timestamp).getTime())
    .filter((time) => !Number.isNaN(time))
  if (!times.length) return []

  const hour = 3600 * 1000
  const anchor = Math.max(...times)
  const counts = Array.from({ length: buckets }, () => 0)
  for (const time of times) {
    const index = buckets - 1 - Math.floor((anchor - time) / hour)
    if (index >= 0 && index < buckets) counts[index] += 1
  }
  return counts
}

function TrendBars({ values }) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex h-40 items-end gap-2" role="img" aria-label={`Incidents per hour: ${values.join(', ')}`}>
      {values.map((value, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="tabular text-[0.625rem] text-mist-400">{value}</span>
          <div
            className="w-full rounded-t bg-gradient-to-t from-blue-signal/40 to-cyan-signal/80"
            style={{ height: `${(value / max) * 100}%` }}
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  )
}

export function TrendCard({ incidents, className }) {
  const trend = useMemo(() => hourlyTrend(incidents), [incidents])

  return (
    <Card className={className}>
      <SectionHeader title="Incidents trend" description="Last 7 intervals" />
      <div className="mt-3">
        {trend.length === 0 ? (
          <EmptyState icon="0" title="Not enough data" message="A trend needs at least one incident." />
        ) : (
          <TrendBars values={trend} />
        )}
      </div>
    </Card>
  )
}

export default TrendCard
