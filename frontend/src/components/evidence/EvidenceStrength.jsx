import { Badge } from '@/components/common'

import { strengthOf } from './strengthMeta'

/**
 * EvidenceStrength.
 *
 * Renders the strength of one piece of evidence as a glyph + word + tone.
 * Returns nothing when no strength is supplied, so a compact summary list can
 * reuse the same vocabulary only when it is actually known.
 */
export function EvidenceStrength({ level, size = 'sm', className, ...rest }) {
  if (!level) return null
  const strength = strengthOf(level)

  return (
    <Badge
      tone={strength.tone}
      glyph={strength.glyph}
      size={size}
      title={strength.label}
      className={className}
      {...rest}
    >
      {strength.label}
    </Badge>
  )
}

export default EvidenceStrength
