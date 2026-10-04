import { Badge } from '@/components/common'
import { priorityOf } from '@/utils/statusTokens'

const SEVERITY_TONE = {
  high: 'danger',
  medium: 'caution',
  low: 'muted',
}

const SEVERITY_LABEL = {
  high: 'High severity',
  medium: 'Medium severity',
  low: 'Low severity',
}

const SEVERITY_GLYPH = {
  high: '!',
  medium: '~',
  low: '-',
}

/**
 * SeverityBadge.
 *
 * Severity is the assessed impact on people, distinct from operational
 * priority. It is intentionally word-led so it survives greyscale.
 */
export function SeverityBadge({ severity, size = 'md', className, ...rest }) {
  const level = SEVERITY_TONE[severity] ? severity : 'low'
  const token = priorityOf(severity)
  return (
    <Badge
      tone={SEVERITY_TONE[level]}
      glyph={SEVERITY_GLYPH[level]}
      size={size}
      title={`${SEVERITY_LABEL[level]}${token.meaning ? ` - ${token.meaning}` : ''}`}
      className={className}
      {...rest}
    >
      {level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Low'}
    </Badge>
  )
}

const STATUS_TONE = {
  active: 'warn',
  monitoring: 'info',
  closed: 'healthy',
}

const STATUS_GLYPH = {
  active: '!',
  monitoring: '~',
  closed: 'o',
}

const STATUS_LABEL = {
  active: 'Active',
  monitoring: 'Monitoring',
  closed: 'Closed',
}

/** Lifecycle status of an incident. */
export function StatusPill({ status, size = 'md', className, ...rest }) {
  const key = STATUS_TONE[status] ? status : 'monitoring'
  return (
    <Badge tone={STATUS_TONE[key]} glyph={STATUS_GLYPH[key]} size={size} className={className} {...rest}>
      {STATUS_LABEL[key]}
    </Badge>
  )
}

export default SeverityBadge
