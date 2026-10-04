import { useId } from 'react'

import { cn } from '@/utils/cn'

const SIZES = {
  sm: 'h-7 px-2 text-[0.6875rem]',
  md: 'h-8 px-2.5 text-xs',
  lg: 'h-9 px-3 text-sm',
}

/**
 * Text input with label, optional hint and error.
 *
 * The label is always rendered as a real <label> bound to the input, so the
 * field has an accessible name without relying on placeholder text. When
 * `hint` or `error` is present the message is wired through
 * aria-describedby and the field is marked invalid.
 */
export function Input({
  label,
  hint,
  error,
  size = 'md',
  iconLeft,
  className,
  containerClassName,
  id: providedId,
  ...rest
}) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('min-w-0', containerClassName)}>
      {label && (
        <label htmlFor={id} className="metric-label mb-1.5 block">
          {label}
        </label>
      )}

      <div className="relative">
        {iconLeft && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-mist-400"
          >
            {iconLeft}
          </span>
        )}
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'w-full rounded-md border bg-ink-850 font-medium text-mist-50 transition-colors',
            'placeholder:text-mist-500 placeholder:font-normal',
            'focus:border-cyan-signal focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-alert-red/60' : 'border-line-strong hover:border-line-strong',
            SIZES[size] ?? SIZES.md,
            iconLeft && 'pl-8',
            className,
          )}
          {...rest}
        />
      </div>

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[0.6875rem] leading-snug text-mist-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-[0.6875rem] leading-snug text-alert-red">
          {error}
        </p>
      )}
    </div>
  )
}

/** Native select styled to match Input, for filter controls. */
export function Select({ label, hint, error, size = 'md', children, id: providedId, className, containerClassName, ...rest }) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('min-w-0', containerClassName)}>
      {label && (
        <label htmlFor={id} className="metric-label mb-1.5 block">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'w-full appearance-none rounded-md border border-line-strong bg-ink-850 font-medium text-mist-50 transition-colors',
          'focus:border-cyan-signal focus:outline-none',
          error && 'border-alert-red/60',
          SIZES[size] ?? SIZES.md,
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[0.6875rem] leading-snug text-mist-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-[0.6875rem] leading-snug text-alert-red">
          {error}
        </p>
      )}
    </div>
  )
}