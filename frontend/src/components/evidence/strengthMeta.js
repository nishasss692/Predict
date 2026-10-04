/**
 * Evidence strength vocabulary.
 *
 * A single home for how strong an evidence item is, so every card, list row
 * and indicator reads the same way and colour is never the only signal.
 */
export const EVIDENCE_STRENGTH = {
  strong: { label: 'Strong evidence', tone: 'healthy', glyph: '++' },
  moderate: { label: 'Moderate evidence', tone: 'caution', glyph: '+' },
  weak: { label: 'Weak evidence', tone: 'muted', glyph: '?' },
}

export function strengthOf(level) {
  return EVIDENCE_STRENGTH[level] ?? EVIDENCE_STRENGTH.weak
}
