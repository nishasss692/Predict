const IST = 'Asia/Kolkata'

const timeFmt = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: IST,
})

const dateTimeFmt = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: IST,
})

export function formatClock(iso) {
  if (!iso) return '--:--'
  return timeFmt.format(new Date(iso))
}

export function formatDateTime(iso) {
  if (!iso) return '--'
  return dateTimeFmt.format(new Date(iso))
}

/** "+12 min" / "-4 min" relative to an anchor instant. */
export function formatOffsetMinutes(minutes) {
  if (minutes === null || minutes === undefined) return '--'
  const abs = Math.abs(Math.round(minutes))
  const unit = abs >= 60 ? `${Math.floor(abs / 60)}h ${abs % 60}m` : `${abs} min`
  return minutes >= 0 ? `+${unit}` : `-${unit}`
}

/** Distance in metres -> "180 m" / "1.4 km". */
export function formatDistance(metres) {
  if (metres === null || metres === undefined) return '--'
  if (metres < 1000) return `${Math.round(metres)} m`
  return `${(metres / 1000).toFixed(1)} km`
}

/** 0.82 -> "82%". Confidence is always shown as a percentage, never "certain". */
export function formatPercent(value, digits = 0) {
  if (value === null || value === undefined) return '--'
  return `${(value * 100).toFixed(digits)}%`
}

/** Signed deviation from a sensor baseline, e.g. "+118% vs 30-day median". */
export function formatDeviation(value, unit = '%') {
  if (value === null || value === undefined) return '--'
  const rounded = Math.abs(value) >= 10 ? Math.round(value) : Number(value.toFixed(1))
  return `${value >= 0 ? '+' : ''}${rounded}${unit}`
}

export function formatNumber(value, digits = 0) {
  if (value === null || value === undefined) return '--'
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

export function formatCount(value, singular, plural = `${singular}s`) {
  if (value === null || value === undefined) return '--'
  return `${formatNumber(value)} ${value === 1 ? singular : plural}`
}