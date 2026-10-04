import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Single class-name joiner used by every component so that local overrides
 * reliably beat design-system defaults.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}