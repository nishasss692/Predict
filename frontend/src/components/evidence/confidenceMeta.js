import { confidenceBandOf } from '@/utils/statusTokens'

/**
 * Plain-language quality for a confidence band.
 *
 * The UI says "High evidence confidence", never "82% certainty": confidence
 * describes how much evidence exists, not the chance of being right.
 */
export const CONFIDENCE_QUALITY = {
  'Strong support': 'High',
  'Moderate support': 'Moderate',
  Tentative: 'Low',
  'Weak support': 'Very low',
}

export function confidenceQualityOf(score) {
  return CONFIDENCE_QUALITY[confidenceBandOf(score).label] ?? 'Unknown'
}
