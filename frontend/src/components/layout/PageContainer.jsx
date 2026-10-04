import { cn } from '@/utils/cn'

/**
 * Page header block for content pages.
 * Business-agnostic. Accepts optional action slot.
 */
export function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {title && (
          <h1 className="text-xl leading-tight font-semibold tracking-tight text-mist-50 sm:text-2xl">
            {title}
          </h1>
        )}
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-mist-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

/**
 * Content container with consistent padding + max width behaviour.
 * Centres content and keeps predictable vertical rhythm.
 */
export function PageContainer({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cn('mx-auto w-full max-w-[112rem] px-4 py-6 lg:px-8 lg:py-8', className)} {...rest}>
      {children}
    </Tag>
  )
}