import { Button, Card } from '@/components/common'
import { cn } from '@/utils/cn'

import { PriorityIndicator } from './PriorityIndicator'

/**
 * RecommendationPanel.
 *
 * The recommended action plus the reasoning behind it. Receives the whole
 * recommendation object so field names, the CTA label and href all live in
 * data, keeping the component free of content.
 */
export function RecommendationPanel({ recommendation, onViewMap, className }) {
  if (!recommendation) return null

  const { action, why, affectedArea, priority, evidenceCount, cta } = recommendation
  const summary = []
  if (affectedArea) summary.push({ label: 'Affected area', value: affectedArea })
  if (evidenceCount != null) summary.push({ label: 'Evidence count', value: evidenceCount })

  return (
    <Card as="section" aria-label="Recommended action" className={cn('p-5 sm:p-6', className)}>
      <p className="metric-label text-cyan-signal">Recommended action</p>
      <h2 className="mt-1.5 text-lg leading-snug font-semibold text-mist-50">{action}</h2>

      {why && (
        <div className="mt-3 rounded-lg border border-line bg-ink-850/60 px-3.5 py-3">
          <p className="metric-label">Why this action</p>
          <p className="mt-1 text-xs leading-relaxed text-mist-200">{why}</p>
        </div>
      )}

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <dt className="metric-label">Priority</dt>
          <dd className="mt-1.5">
            <PriorityIndicator level={priority} />
          </dd>
        </div>
        {summary.map((item) => (
          <div key={item.label}>
            <dt className="metric-label">{item.label}</dt>
            <dd className="tabular mt-1.5 text-sm font-medium text-mist-100">{item.value}</dd>
          </div>
        ))}
      </dl>

      {cta && (
        <div className="mt-5">
          <Button as="a" href={cta.href} onClick={onViewMap} variant="primary">
            {cta.label}
          </Button>
        </div>
      )}
    </Card>
  )
}

export default RecommendationPanel
