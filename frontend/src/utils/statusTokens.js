/**
 * Semantic civic status tokens — single source of truth.
 *
 * Every status in the product resolves to a TONE here. Components never
 * write a colour class themselves; they call a resolver and render the
 * token. Adding a status means adding an entry here, not editing components.
 *
 * Every token carries a `glyph` and a word, so severity survives greyscale,
 * colour-vision differences and printed reports. Colour is never the only
 * channel.
 */

/**
 * Tones are presentation only. Names describe the visual role, not the
 * severity, so status vocabularies stay free to change without a refactor.
 */
export const TONE = {
  danger: {
    text: 'text-alert-red',
    bg: 'bg-alert-red/12',
    border: 'border-alert-red/45',
    dot: 'bg-alert-red',
    solid: 'bg-alert-red/20 text-alert-red border-alert-red/50',
  },
  warn: {
    text: 'text-alert-orange',
    bg: 'bg-alert-orange/12',
    border: 'border-alert-orange/45',
    dot: 'bg-alert-orange',
    solid: 'bg-alert-orange/20 text-alert-orange border-alert-orange/50',
  },
  caution: {
    text: 'text-alert-amber',
    bg: 'bg-alert-amber/10',
    border: 'border-alert-amber/40',
    dot: 'bg-alert-amber',
    solid: 'bg-alert-amber/20 text-alert-amber border-alert-amber/50',
  },
  info: {
    text: 'text-blue-light',
    bg: 'bg-blue-signal/12',
    border: 'border-blue-signal/40',
    dot: 'bg-blue-signal',
    solid: 'bg-blue-signal/20 text-blue-light border-blue-signal/50',
  },
  cyan: {
    text: 'text-cyan-signal',
    bg: 'bg-cyan-signal/12',
    border: 'border-cyan-signal/40',
    dot: 'bg-cyan-signal',
    solid: 'bg-cyan-signal/20 text-cyan-signal border-cyan-signal/50',
  },
  analysis: {
    text: 'text-violet-analysis',
    bg: 'bg-violet-analysis/10',
    border: 'border-violet-analysis/40',
    dot: 'bg-violet-analysis',
    solid: 'bg-violet-analysis/20 text-violet-analysis border-violet-analysis/50',
  },
  healthy: {
    text: 'text-healthy-teal',
    bg: 'bg-healthy-teal/12',
    border: 'border-healthy-teal/40',
    dot: 'bg-healthy-teal',
    solid: 'bg-healthy-teal/20 text-healthy-teal border-healthy-teal/50',
  },
  muted: {
    text: 'text-mist-300',
    bg: 'bg-mist-400/10',
    border: 'border-line-strong',
    dot: 'bg-mist-400',
    solid: 'bg-mist-400/15 text-mist-200 border-line-strong',
  },
}

export const TONE_NAMES = Object.keys(TONE)

/* ------------------------------------------------------------------ */
/* Priority — how soon a human crew should act                          */
/* ------------------------------------------------------------------ */

export const PRIORITY = {
  high: {
    label: 'High',
    glyph: '!',
    rank: 3,
    tone: 'warn',
    meaning: 'Escalating condition likely to worsen within the hour. Respond now.',
  },
  medium: {
    label: 'Medium',
    glyph: '~',
    rank: 2,
    tone: 'caution',
    meaning: 'Monitorable. Assign for scheduled inspection.',
  },
  low: {
    label: 'Low',
    glyph: '-',
    rank: 1,
    tone: 'muted',
    meaning: 'Logged for trend review. No immediate field action.',
  },
}

/** Highest rank first. Used for sorting and for distribution bars. */
export const PRIORITY_ORDER = ['high', 'medium', 'low']

/* ------------------------------------------------------------------ */
/* Incident type — what the civic problem actually is                   */
/* ------------------------------------------------------------------ */

export const INCIDENT_TYPE = {
  waterlogging: {
    label: 'Waterlogging',
    glyph: '~',
    tone: 'info',
    meaning: 'Surface water standing on a road or public area.',
  },
  potholes: {
    label: 'Potholes',
    glyph: 'o',
    tone: 'caution',
    meaning: 'Surface defect with a vehicle or pedestrian safety impact.',
  },
  sewage_overflow: {
    label: 'Sewage overflow',
    glyph: '!',
    tone: 'analysis',
    meaning: 'Sanitation network discharging untreated into the street or drain.',
  },
  traffic_disruption: {
    label: 'Traffic disruption',
    glyph: '^',
    tone: 'warn',
    meaning: 'Mobility degraded. Often a symptom of another civic problem.',
  },
  drain_issue: {
    label: 'Drain issue',
    glyph: 'v',
    tone: 'cyan',
    meaning: 'Stormwater asset blocked, damaged or unable to pass inflow.',
  },
}

export const INCIDENT_TYPE_ORDER = Object.keys(INCIDENT_TYPE)

/* ------------------------------------------------------------------ */
/* Sensor state — instrument health                                      */
/* ------------------------------------------------------------------ */

export const SENSOR_STATE = {
  healthy: {
    label: 'Healthy',
    glyph: 'o',
    tone: 'healthy',
    meaning: 'Reading is inside its expected band for this hour.',
  },
  warning: {
    label: 'Warning',
    glyph: '~',
    tone: 'caution',
    meaning: 'Reading has deviated from baseline. Watch it.',
  },
  critical: {
    label: 'Critical',
    glyph: '!',
    tone: 'danger',
    meaning: 'Reading has crossed a configured alerting threshold.',
  },
}

export const SENSOR_STATE_ORDER = ['critical', 'warning', 'healthy']

/* ------------------------------------------------------------------ */
/* Confidence — evidential support, never certainty                      */
/* ------------------------------------------------------------------ */

export const CONFIDENCE_BAND = {
  strong: {
    label: 'Strong support',
    glyph: '++',
    range: '0.75 - 1.00',
    tone: 'analysis',
    meaning: 'Independent signal types agree in both space and time.',
  },
  moderate: {
    label: 'Moderate support',
    glyph: '+',
    range: '0.50 - 0.74',
    tone: 'cyan',
    meaning: 'Signals agree, but one key confirmation is still missing.',
  },
  tentative: {
    label: 'Tentative',
    glyph: '?',
    range: '0.25 - 0.49',
    tone: 'caution',
    meaning: 'Correlation observed. Alternative causes are still plausible.',
  },
  weak: {
    label: 'Weak support',
    glyph: '?',
    range: '0.00 - 0.24',
    tone: 'muted',
    meaning: 'Coincidence in space or time only. Human judgement required.',
  },
}

export const CONFIDENCE_NOTE =
  'Confidence describes how much the available evidence supports the candidate cause. It is not a probability of being correct and it does not replace field verification.'

/* ------------------------------------------------------------------ */
/* Signal family — what kind of feed a signal came from                 */
/* ------------------------------------------------------------------ */

export const SIGNAL_KIND = {
  rainfall: { label: 'Rainfall', unit: 'mm/hr', tone: 'info' },
  drain_sensor: { label: 'Drain sensor', unit: 'cm', tone: 'cyan' },
  citizen_report: { label: 'Citizen report', unit: null, tone: 'caution' },
  sewage_overflow: { label: 'Sewage overflow', unit: null, tone: 'analysis' },
  traffic_speed: { label: 'Traffic speed', unit: 'km/h', tone: 'warn' },
}

/* ------------------------------------------------------------------ */
/* Resolvers — safe lookups with a defined fallback                     */
/* ------------------------------------------------------------------ */

const UNKNOWN_PRIORITY = { label: 'Unrated', glyph: '?', rank: 0, tone: 'muted', meaning: 'No priority assigned.' }
const UNKNOWN_INCIDENT = { label: 'Unclassified', glyph: '?', tone: 'muted', meaning: 'Category not recognised.' }
const UNKNOWN_SENSOR = { label: 'Unknown', glyph: '?', tone: 'muted', meaning: 'State not reported.' }

export function toneOf(name) {
  return TONE[name] ?? TONE.muted
}

export function priorityOf(level) {
  return PRIORITY[level] ?? UNKNOWN_PRIORITY
}

export function incidentTypeOf(category) {
  return INCIDENT_TYPE[category] ?? UNKNOWN_INCIDENT
}

export function sensorStateOf(state) {
  return SENSOR_STATE[state] ?? UNKNOWN_SENSOR
}

export function signalKindOf(kind) {
  return SIGNAL_KIND[kind] ?? { label: kind, unit: null, tone: 'muted' }
}

export function confidenceBandOf(score) {
  if (typeof score !== 'number') return CONFIDENCE_BAND.weak
  if (score >= 0.75) return CONFIDENCE_BAND.strong
  if (score >= 0.5) return CONFIDENCE_BAND.moderate
  if (score >= 0.25) return CONFIDENCE_BAND.tentative
  return CONFIDENCE_BAND.weak
}

/** True when `level` is at least as urgent as `threshold`. */
export function isAtLeast(level, threshold) {
  return priorityOf(level).rank >= priorityOf(threshold).rank
}