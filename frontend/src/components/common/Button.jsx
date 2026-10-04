import { cn } from '@/utils/cn'

const VARIANTS = {
  primary:
    'border border-cyan-signal/50 bg-cyan-signal/15 text-cyan-signal hover:border-cyan-signal hover:bg-cyan-signal/22',
  secondary:
    'border border-line-strong bg-ink-800 text-mist-100 hover:border-cyan-signal/50 hover:text-cyan-signal',
  ghost: 'border border-transparent bg-transparent text-mist-300 hover:bg-ink-800 hover:text-mist-50',
  danger: 'border border-alert-red/50 bg-alert-red/12 text-alert-red hover:border-alert-red hover:bg-alert-red/20',
}

const SIZES = {
  sm: 'h-7 gap-1.5 px-2 text-[0.6875rem]',
  md: 'h-8 gap-2 px-2.5 text-xs',
  lg: 'h-9 gap-2 px-3.5 text-sm',
}

const ICON_SIZES = { sm: 'size-3', md: 'size-3.5', lg: 'size-4' }

/**
 * Button.
 *
 * Renders a real <button> by default. Pass `asChild`-style behaviour via
 * `as` when it needs to be a router link - and always keep an accessible
 * name, because an icon-only button must supply `aria-label`.
 */
export function Button({
  as: Tag = 'button',
  variant = 'secondary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  className,
  children,
  type,
  ...rest
}) {
  return (
    <Tag
      type={Tag === 'button' ? (type ?? 'button') : undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-semibold whitespace-nowrap transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant] ?? VARIANTS.secondary,
        SIZES[size] ?? SIZES.md,
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {iconLeft && (
        <span aria-hidden="true" className={cn('shrink-0', ICON_SIZES[size] ?? ICON_SIZES.md)}>
          {iconLeft}
        </span>
      )}
      {children}
      {iconRight && (
        <span aria-hidden="true" className={cn('shrink-0', ICON_SIZES[size] ?? ICON_SIZES.md)}>
          {iconRight}
        </span>
      )}
    </Tag>
  )
}

/** Icon-only control. `label` becomes the accessible name. */
export function IconButton({ label, icon, size = 'md', variant = 'ghost', className, ...rest }) {
  const box = { sm: 'size-7', md: 'size-8', lg: 'size-9' }[size] ?? 'size-8'

  return (
    <Button
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      className={cn('px-0', box, className)}
      {...rest}
    >
      <span aria-hidden="true" className={ICON_SIZES[size] ?? ICON_SIZES.md}>
        {icon}
      </span>
    </Button>
  )
}