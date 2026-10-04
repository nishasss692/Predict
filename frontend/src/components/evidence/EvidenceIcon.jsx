/**
 * Icon set for evidence items and relationship nodes.
 *
 * Inline SVG keeps every icon on the same stroke weight and avoids adding an
 * icon dependency for a handful of glyphs.
 */
const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function EvidenceIcon({ kind, className = 'size-5' }) {
  const common = { viewBox: '0 0 24 24', className, 'aria-hidden': true, ...STROKE }

  switch (kind) {
    case 'rainfall':
      return (
        <svg {...common}>
          <path d="M7 15a4 4 0 0 1 .9-7.9A5 5 0 0 1 17.6 8 3.5 3.5 0 0 1 17 15H7Z" />
          <path d="M8 18.5 7 21" />
          <path d="M12 18.5 11 21" />
          <path d="M16 18.5 15 21" />
        </svg>
      )
    case 'drain_sensor':
      return (
        <svg {...common}>
          <path d="M4 18a8 8 0 1 1 16 0" />
          <path d="M12 18l4-4" />
          <circle cx="12" cy="18" r="1.4" />
        </svg>
      )
    case 'waterlogging':
      return (
        <svg {...common}>
          <path d="M12 3s6 6.2 6 10.4A6 6 0 0 1 6 13.4C6 9.2 12 3 12 3Z" />
          <path d="M9 14.2a3 3 0 0 0 3 3" />
        </svg>
      )
    case 'sewage_overflow':
      return (
        <svg {...common}>
          <path d="M12 4 21 20H3L12 4Z" />
          <path d="M12 10v4" />
          <path d="M12 17h.01" />
        </svg>
      )
    case 'traffic_disruption':
      return (
        <svg {...common}>
          <path d="M3 14h18v-3l-2-4H5L3 11v3Z" />
          <path d="M3 14h18" />
          <circle cx="7" cy="17" r="1.5" />
          <circle cx="17" cy="17" r="1.5" />
        </svg>
      )
    case 'potholes':
      return (
        <svg {...common}>
          <path d="M3 16h18" />
          <path d="M7 16c0-2 1-3 3-3s3 1 3 3" />
          <path d="M15 16c0-1.4.8-2.2 2-2.2s2 .8 2 2.2" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 8v4l2.5 2" />
        </svg>
      )
  }
}

export default EvidenceIcon
