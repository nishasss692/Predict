import { useCallback, useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Dialog behaviour for drawers, slide-overs and modals.
 *
 * Owns the four things a keyboard user needs and a component author forgets:
 *   1. move focus into the dialog when it opens
 *   2. trap Tab / Shift+Tab inside it
 *   3. close on Escape
 *   4. restore focus to where it was when the dialog closes
 *
 * Also locks background scroll. Returns the ref to attach to the dialog
 * container, which should also carry `tabIndex={-1}` so it can hold focus
 * when it has no focusable children.
 */
export function useDialog({ open, onClose, initialFocusRef }) {
  const containerRef = useRef(null)
  const restoreRef = useRef(null)

  const getFocusable = useCallback(() => {
    const node = containerRef.current
    if (!node) return []
    return Array.from(node.querySelectorAll(FOCUSABLE)).filter(
      (element) => element.offsetParent !== null || element === document.activeElement,
    )
  }, [])

  useEffect(() => {
    if (!open) return undefined

    restoreRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusFrame = requestAnimationFrame(() => {
      const target = initialFocusRef?.current ?? getFocusable()[0] ?? containerRef.current
      target?.focus?.()
    })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose?.()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = getFocusable()
      if (!focusable.length) {
        event.preventDefault()
        containerRef.current?.focus?.()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const inside = containerRef.current?.contains(active)

      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      const restore = restoreRef.current
      if (restore && typeof restore.focus === 'function') {
        // The dialog node is removed in the same commit; the browser moves
        // focus to <body> as that happens, so restore on the next frame.
        requestAnimationFrame(() => {
          if (restore.isConnected) restore.focus()
        })
      }
    }
  }, [open, onClose, initialFocusRef, getFocusable])

  return containerRef
}

export default useDialog
