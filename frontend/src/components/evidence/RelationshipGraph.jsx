import { cn } from '@/utils/cn'

import { EvidenceIcon } from './EvidenceIcon'

const ARROW_DOWN = '\u2193'
const ARROW_BRANCH = '\u2198'

/**
 * RelationshipGraph.
 *
 * A lightweight, dependency-free flow. Evidence nodes are listed in observed
 * order and the chain terminates in the root-cause hypothesis, so the layout
 * itself shows the hypothesis as the destination of the evidence.
 */
export function RelationshipGraph({ graph, className }) {
  const nodes = graph?.evidence ?? graph?.observed ?? []
  if (!nodes.length) return null

  const hypothesis = graph?.hypothesis?.label ?? graph?.hypothesisLabel
  const hypothesisDetail = graph?.hypothesis?.description ?? graph?.hypothesisDetail
  const description = [
    graph?.caption,
    `${nodes.map((node) => node.label).join(', ')}.`,
    `Destination: ${hypothesis}.`,
    graph?.note,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cn('', className)}>
      {graph.caption && <p className="mb-2 metric-label">{graph.caption}</p>}

      <ol className={cn('list-none')}>
        {nodes.map((node, index) => {
          const next = nodes[index + 1]
          return (
            <li key={node.id ?? node.label}>
              <div className="flex items-center gap-3 rounded-lg border border-line bg-ink-850/70 px-3 py-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-md border border-line bg-ink-900 text-mist-300">
                  <EvidenceIcon kind={node.kind} className="size-3.5" />
                </span>
                <span className="text-sm font-medium text-mist-100">{node.label}</span>
              </div>

              {next && (
                <div className="flex items-center gap-2 py-1 pl-3 text-mist-500">
                  <span aria-hidden="true" className="text-base leading-none">
                    {next.branch ? ARROW_BRANCH : ARROW_DOWN}
                  </span>
                  <span className="text-[0.625rem] tracking-wide uppercase">
                    {next.branch ? 'in parallel' : 'then'}
                  </span>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <div className="flex items-center gap-2 py-1 pl-3 text-violet-analysis">
        <span aria-hidden="true" className="text-base leading-none">{ARROW_DOWN}</span>
        <span className="text-[0.625rem] tracking-wide uppercase">evidence flow</span>
      </div>

      <div className="rounded-panel border border-violet-analysis/50 bg-violet-analysis/10 px-4 py-4 shadow-panel">
        <p className="metric-label text-violet-analysis">Destination &mdash; possible root cause</p>
        <p className="mt-1.5 text-base leading-snug font-semibold text-mist-50">{hypothesis}</p>
        {hypothesisDetail && (
          <p className="mt-1.5 text-xs leading-relaxed text-mist-300">{hypothesisDetail}</p>
        )}
      </div>

      {graph.note && <p className="mt-3 text-[0.6875rem] leading-relaxed text-mist-400">{graph.note}</p>}
      <p className="sr-only">{description}</p>
    </div>
  )
}

export default RelationshipGraph
