import { memo, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { cn } from '@/utils/cn'

const BENGALURU = [12.9716, 77.5946]

const INCIDENT_COLOR = {
  waterlogging: '#60a5fa',
  potholes: '#fbbf24',
  sewage_overflow: '#a78bfa',
  traffic_disruption: '#f43f5e',
  drain_issue: '#22d3ee',
}

const PRIORITY_COLOR = {
  high: '#f43f5e',
  medium: '#fbbf24',
  low: '#2dd4bf',
}

const incidentKind = (incident) => incident.category ?? incident.type ?? 'drain_issue'

const incidentIcon = (incident) => {
  const color = INCIDENT_COLOR[incidentKind(incident)] ?? '#6e809f'
  return L.divIcon({
    className: '',
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid #060a12;box-shadow:0 0 0 3px ${color}40;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -6],
  })
}

const clusterIcon = (count, priority) => {
  const color = PRIORITY_COLOR[priority] ?? '#60a5fa'
  return L.divIcon({
    className: '',
    html: `<div style="min-width:28px;height:28px;padding:0 6px;border-radius:14px;background:${color};border:2px solid #060a12;color:#060a12;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;box-shadow:0 0 0 4px ${color}33;">${count}</div>`,
    iconSize: [40, 28],
    iconAnchor: [20, 14],
    popupAnchor: [0, -14],
  })
}

const sensorIcon = () =>
  L.divIcon({
    className: '',
    html: '<div style="width:8px;height:8px;border-radius:50%;background:#2dd4bf;border:2px solid #060a12;"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
  })

/** Keeps the viewport pointed at the cluster under investigation. */
function MapController({ center, zoom, selectedCluster }) {
  const map = useMap()
  useEffect(() => {
    if (selectedCluster && typeof selectedCluster.lat === 'number') {
      map.flyTo([selectedCluster.lat, selectedCluster.lng], 14, { duration: 0.6 })
    } else {
      map.setView(center, zoom)
    }
  }, [map, center, zoom, selectedCluster])
  return null
}

const clusterCount = (cluster) => cluster.incidentCount ?? cluster.incidentsCount ?? cluster.incidents ?? 0

function incidentTime(incident) {
  return incident.timeLabel ?? incident.time ?? incident.timestamp ?? ''
}

/**
 * CivicMap.
 *
 * Shared Leaflet surface for the Overview and Root Cause experiences. Markers
 * are drawn as Leaflet divIcons so cluster counts and incident colours stay
 * inside the design system instead of Leaflet's default imagery.
 */
function CivicMap({
  incidents = [],
  clusters = [],
  sensors = [],
  selectedCluster = null,
  onIncidentSelect,
  onClusterSelect,
  center = BENGALURU,
  zoom = 12,
  className = 'h-64 w-full',
  legend = true,
  mapLabel = 'City incident map',
}) {
  return (
    <div className={cn('relative', className)} role="region" aria-label={mapLabel}>
      <p className="sr-only">
        Interactive map of {incidents.length} incident{incidents.length === 1 ? '' : 's'} and{' '}
        {clusters.length} cluster{clusters.length === 1 ? '' : 's'}. The same locations are listed in the
        panels next to and below the map.
      </p>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} zoom={zoom} selectedCluster={selectedCluster} />

        {clusters.map((cluster) => (
          <div key={cluster.id}>
            <Circle
              center={[cluster.lat, cluster.lng]}
              radius={cluster.radius || 800}
              pathOptions={{
                color: PRIORITY_COLOR[cluster.priority] ?? '#60a5fa',
                weight: 1,
                fillOpacity: 0.15,
              }}
              eventHandlers={{ click: () => onClusterSelect?.(cluster) }}
            />
            <Marker
              position={[cluster.lat, cluster.lng]}
              icon={clusterIcon(clusterCount(cluster), cluster.priority)}
              eventHandlers={{ click: () => onClusterSelect?.(cluster) }}
            >
              <Popup>
                <div className="space-y-1 text-xs">
                  <div className="font-semibold">
                    Cluster #{cluster.number ?? cluster.id} &middot; {cluster.area}
                  </div>
                  <div>
                    {clusterCount(cluster)} incidents &middot; {cluster.confidence}% confidence
                  </div>
                  <div className="capitalize">Priority: {cluster.priority}</div>
                  <div>Possible root cause: {cluster.possibleRootCause || 'Stormwater drainage blockage / overflow'}</div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}

        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.lat, incident.lng]}
            icon={incidentIcon(incident)}
            eventHandlers={{ click: () => onIncidentSelect?.(incident) }}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <div className="font-semibold capitalize">
                  {String(incidentKind(incident)).replace('_', ' ')}
                </div>
                <div>{incident.title ?? incident.location}</div>
                <div>Location: {incident.location}</div>
                <div>Severity: {incident.severity ?? incident.priority}</div>
                <div>Time: {incidentTime(incident)}</div>
                <div>Source: {incident.source ?? 'Citizen complaint'}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {sensors.map((sensor) => (
          <Marker key={sensor.id} position={[sensor.lat, sensor.lng]} icon={sensorIcon()}>
            <Popup>
              <div className="text-xs">{sensor.name ?? `Drain sensor ${sensor.id}`}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {legend && (
        <div className="absolute bottom-2 left-2 z-[1000] rounded-md border border-line bg-ink-950/90 px-2 py-1 text-[0.6875rem] text-mist-300">
          Waterlogging &middot; Potholes &middot; Sewage Overflow &middot; Traffic &middot; Drain sensor &middot; Cluster
        </div>
      )}
    </div>
  )
}

export default memo(CivicMap)
