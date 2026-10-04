// Root Cause Analysis dataset for the demo.
//
// Everything here is synthetic. It exists so the Root Cause Analysis screen can
// show how a hypothesis is assembled from named evidence, an observed sequence
// and a relationship model - without ever presenting a guess as a confirmed
// cause.
//
// Shape notes (consumed by `src/components/evidence`):
// - evidence items: title, source, timestamp, location, strength, description,
//   optional metric { value, unit, label } and icon
// - timeline events: timestamp, title, type + typeLabel, location, source
// - graph: caption, evidence nodes, a hypothesis { label, description }, note
// - recommendation: action, why, priority, affectedArea, evidenceCount, cta

export const rootCauseAnalysis = {
  clusterId: 'CLS-003',
  number: 3,
  area: 'Koramangala',
  ward: 'Koramangala',
  status: 'High Priority',
  priority: 'high',
  possibleRootCause: 'Stormwater drainage blockage / overflow',
  confidence: 82,
  affectedIncidentCount: 3,
  affectedIncidentIds: ['INC-4471', 'INC-4472', 'INC-4475'],
  summary:
    'Three waterlogging and sewage signals sit within 300 m of one drain chamber, all inside a 47-minute window.',
  center: { lat: 12.9358, lng: 77.6271, radius: 900 },

  evidence: [
    {
      id: 'ev-rainfall',
      title: 'Heavy rainfall',
      strength: 'strong',
      icon: 'rainfall',
      source: 'Rainfall gauge C-BLR-07',
      timestamp: '08:00',
      location: 'Across the Koramangala catchment',
      description:
        'Rainfall crossed the intensity the local storm drains are sized for, loading the network from the top of the catchment.',
      metric: { value: '42', unit: 'mm/hr', label: 'peak intensity' },
    },
    {
      id: 'ev-drain-level',
      title: 'Abnormal drain water level',
      strength: 'strong',
      icon: 'drain_sensor',
      source: 'Drain sensor SIG-DRAIN-DL114',
      timestamp: '08:18',
      location: '40 m from the affected stretch',
      description:
        'The chamber level rose faster than rainfall inflow alone explains, which is consistent with a downstream restriction.',
      metric: { value: '1.8', unit: 'm', label: 'chamber level' },
    },
    {
      id: 'ev-waterlogging',
      title: '3 waterlogging reports',
      strength: 'strong',
      icon: 'waterlogging',
      source: 'Citizen complaints (3)',
      timestamp: '08:27 - 08:31',
      location: 'Within 300 m of one another',
      description:
        'Independent reports cluster tightly in space and time instead of scattering across the ward, which points at one shared cause.',
    },
    {
      id: 'ev-sewage',
      title: 'Nearby sewage overflow',
      strength: 'moderate',
      icon: 'sewage_overflow',
      source: 'Citizen complaint',
      timestamp: '08:36',
      location: '250 m east of the drain chamber',
      description:
        'Sewage surfacing near the same chamber suggests the storm and sewage lines may be backing up together.',
    },
    {
      id: 'ev-traffic',
      title: 'Traffic slowdown',
      strength: 'moderate',
      icon: 'traffic_disruption',
      source: 'Traffic feed',
      timestamp: '08:42',
      location: 'On the approach road to the stretch',
      description:
        'Slowed traffic is a downstream effect of water on the carriageway, not an independent cause of it.',
    },
  ],

  // A readable relationship model. Observed signals are laid out in the order
  // they were seen; the hypothesis is the node they all point at.
  graph: {
    caption: 'Observed signals, in the order they were seen',
    hypothesis: {
      label: 'Possible Drainage Blockage / Overflow',
      description: 'A restriction at or downstream of the drain chamber would explain all five signals.',
    },
    evidence: [
      { id: 'rainfall', label: 'Heavy Rainfall', kind: 'rainfall' },
      { id: 'drain-level', label: 'Abnormal Drain Level', kind: 'drain_sensor' },
      { id: 'waterlogging', label: 'Waterlogging', kind: 'waterlogging' },
      { id: 'sewage', label: 'Sewage Overflow', kind: 'sewage_overflow', branch: true },
      { id: 'traffic', label: 'Traffic Slowdown', kind: 'traffic_disruption' },
    ],
    note:
      'All five signals are consistent with the hypothesis. The order is when the signals were observed, not a proven chain of cause and effect.',
  },

  timelineCaption:
    'Times show the order in which signals were observed. Several signals can share a cause without one causing the next.',
  timeline: [
    {
      id: 'tl-1',
      timestamp: '08:00',
      title: 'Heavy rainfall begins',
      type: 'signal',
      typeLabel: 'Signal',
      location: 'Koramangala catchment',
      source: 'Rainfall gauge C-BLR-07',
    },
    {
      id: 'tl-2',
      timestamp: '08:18',
      title: 'Drain sensor level increases',
      type: 'signal',
      typeLabel: 'Signal',
      location: 'Drain chamber DL114',
      source: 'Drain sensor SIG-DRAIN-DL114',
    },
    {
      id: 'tl-3',
      timestamp: '08:27',
      title: 'First waterlogging complaint',
      type: 'report',
      typeLabel: 'Report',
      source: 'Citizen complaint',
    },
    {
      id: 'tl-4',
      timestamp: '08:31',
      title: 'Second waterlogging complaint',
      type: 'report',
      typeLabel: 'Report',
      source: 'Citizen complaint',
    },
    {
      id: 'tl-5',
      timestamp: '08:36',
      title: 'Sewage overflow reported',
      type: 'report',
      typeLabel: 'Report',
      source: 'Citizen complaint',
    },
    {
      id: 'tl-6',
      timestamp: '08:42',
      title: 'Traffic slowdown detected',
      type: 'signal',
      typeLabel: 'Signal',
      source: 'Traffic feed',
    },
    {
      id: 'tl-7',
      timestamp: '08:45',
      title: 'Cluster formed',
      type: 'system',
      typeLabel: 'System',
      source: 'Civic Brain',
    },
    {
      id: 'tl-8',
      timestamp: '08:47',
      title: 'Root-cause hypothesis generated',
      type: 'system',
      typeLabel: 'System',
      source: 'Civic Brain',
    },
  ],

  recommendation: {
    action: 'Inspect and clear the nearby drainage infrastructure first.',
    why: 'Multiple related signals indicate drainage capacity or blockage as a plausible common factor.',
    priority: 'high',
    affectedArea: 'Koramangala, around the drain chamber on 80 ft Road',
    evidenceCount: 5,
    cta: { label: 'View affected area on map', href: '#affected-area' },
  },
}

export default rootCauseAnalysis
