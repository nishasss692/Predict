import { Badge } from '@/components/common'
import { priorityOf } from '@/utils/statusTokens'
import { cn } from '@/utils/cn'

/**
 * PriorityIndicator.
 *
 * One priority vocabulary (High / Medium / Low) with a label, a glyph, an
 * accessible colour and an optional explanation. The accessible name always
 * carries the word, so meaning survives without colour.
 */
export function PriorityIndicator({ level, showMeaning = false, size = 'md', className, ...rest }) {
  if (!level) return null
  const priority = priorityOf(level)

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Badge
        tone={priority.tone}
        glyph={priority.glyph}
        size={size}
        title={`${priority.label} priority - ${priority.meaning}`}
        {...rest}
      >
        {priority.label}
      </Badge>
      {showMeaning && <span className="text-[0.6875rem] leading-snug text-mist-400">{priority.meaning}</span>}
    </span>
  )
}

export default PriorityIndicator
