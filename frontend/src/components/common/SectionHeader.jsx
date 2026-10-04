import { cn } from '@/utils/cn'

/**
 * Section header.
 *
 * Standard heading block for every panel: eyebrow (context), title, optional
 * description, optional actions. Setting `id` wires `aria-labelledby` so the
 * section is announced with its own name.
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  actions,
  size = 'md',
  className,
  children,
}) {
  return (
    <header className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="metric-label">{eyebrow}</p>}
        {title && (
          <h2
            id={id}
            className={cn(
              'font-semibold text-mist-50',
              eyebrow ? 'mt-1' : '',
              size === 'lg' ? 'text-base leading-snug' : 'text-[0.9375rem] leading-tight',
            )}
          >
            {title}
          </h2>
        )}
        {description && <p className="mt-1.5 text-xs leading-relaxed text-mist-400">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}