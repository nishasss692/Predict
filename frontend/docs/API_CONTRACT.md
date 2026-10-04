# Civic Data API Contract

Version: **1.0.0** (`src/services/contract.js` → `CONTRACT_VERSION`)

This is the single written definition of the data the frontend consumes. Both
transports emit exactly these shapes:

- `src/services/mockApi.js` — local mock transport (default)
- `src/services/api.js` — live HTTP transport, REST paths below

Components import `api` from `@/services` and nothing else. They never call
`fetch`, never import `httpClient`, and never read the fixtures directly, so the
transport is an implementation detail.

## Transport selection

| `VITE_API_MODE` | Behaviour |
| --- | --- |
| `mock` (default) | Answer every call from the mock transport. No backend required. |
| `live` | Call the REST API at `VITE_API_BASE_URL`. |

In `live` mode a request that fails because the backend is unreachable
(`status === 0`, a timeout, or a `5xx`) falls back to the mock transport for that
call and is reported through the `degraded` list on `getOverview`. A real `4xx`
answer is surfaced to the caller, not hidden.

Environment variables:

```
VITE_API_MODE=mock
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT_MS=12000
```

Mode-specific env files and scripts:

- `npm run dev:mock` → loads `.env.mock` (mock transport)
- `npm run dev:live` → loads `.env.live` (live transport at the URL above)

## Response normalisation

`src/services/normalize.js` is the seam that keeps the two transports
byte-for-byte compatible. The backend only has to send the required keys;
`normalizeIncident` / `normalizeSensor` / `normalizeCluster` /
`normalizeRootCause` derive the presentation view fields the UI reads (`title`,
`timeLabel`, `lat`/`lng`, `clusterId`, `priority`, `confidence`,
`possibleRootCause`, `recommendedAction`, ...) and tolerate `{data}` / `{items}`
/ `{results}` response envelopes. Every normaliser spreads the original payload
first, so richer payloads (and the mock fixtures) pass through unchanged. Add a
field on the backend and it flows straight to the UI; omit a presentational
field and it is derived. Both the live transport (`api.js`) and the mock
transport (`mockApi.js`) run responses through the same normalisers.

## Interface

All methods are async, accept `{ signal }`, and reject with `ApiError`.

| Method | REST path (live) | Returns |
| --- | --- | --- |
| `getIncidents({ query })` | `GET /incidents` | `Incident[]` |
| `getIncident(id)` | `GET /incidents/:id` | `Incident` |
| `getClusters()` | `GET /clusters` | `Cluster[]` |
| `getCluster(id)` | `GET /clusters/:id` | `Cluster` + embedded `incidents[]` |
| `getRootCause(clusterId)` | `GET /clusters/:id/root-cause` | `RootCause` |
| `getRecommendations(clusterId)` | `GET /clusters/:id/recommendations` | `RecommendedAction[]` |
| `getSensors()` | `GET /sensors` | `Sensor[]` |
| `getWeather()` | `GET /weather` | `Weather` |
| `getTraffic()` | `GET /traffic` | `Traffic` |
| `getOverview()` | (composed client-side) | `{ clusters, incidents, sensors, weather, degraded }` |

`getOverview` composes the four core resources with `Promise.allSettled`. If one
feed fails it returns the rest plus a `degraded: [{ resource, message }]` list;
it only throws when every feed failed.

## Entities

Required keys are listed per entity. Extra presentation fields (for example
`title`, `location`, `timeLabel`, `priority`, `severity`, `ward`, `lat`, `lng`)
ride along on the same object; a payload is contract-valid as long as every
required key is present. In development, `assertContract()` logs a single warning
per entity if a required field is missing.

### Incident

Required: `incident_id, timestamp, latitude, longitude, category, description,
severity, source, status`

```json
{
  "incident_id": "INC-4471",
  "timestamp": "2026-10-03T14:09:00+05:30",
  "latitude": 12.9358,
  "longitude": 77.6271,
  "category": "waterlogging",
  "description": "Resident reports standing water across the full service road width.",
  "severity": "high",
  "source": "Citizen complaint",
  "status": "active",
  "title": "Water up to knee level at service road",
  "location": "Koramangala 5th Block",
  "timeLabel": "02:09 PM",
  "priority": "high",
  "clusterId": "CLS-003"
}
```

`category`: `waterlogging | potholes | sewage_overflow | traffic_disruption | drain_issue`
`severity` / `priority`: `high | medium | low`
`status`: `active | monitoring | closed`

### Sensor

Required: `sensor_id, timestamp, latitude, longitude, sensor_type, value, unit`

```json
{
  "sensor_id": "SIG-DRAIN-DL114",
  "timestamp": "2026-10-03T14:30:00+05:30",
  "latitude": 12.9358,
  "longitude": 77.6271,
  "sensor_type": "drain_level",
  "value": 1.82,
  "unit": "m",
  "name": "Drain level - Koramangala 5th Block",
  "state": "critical"
}
```

`sensor_type`: e.g. `drain_level`, `rainfall`
`state`: `healthy | warning | critical`

### Cluster

Required: `cluster_id, incident_ids, centroid_lat, centroid_lon, start_time,
end_time, categories, cluster_score`

```json
{
  "cluster_id": "CLS-003",
  "incident_ids": ["INC-4471", "INC-4472", "INC-4475", "INC-4479"],
  "centroid_lat": 12.9358,
  "centroid_lon": 77.6271,
  "start_time": "2026-10-03T14:09:00+05:30",
  "end_time": "2026-10-03T14:28:00+05:30",
  "categories": ["Waterlogging", "Sewage Overflow", "Traffic"],
  "cluster_score": 0.82,
  "number": 3,
  "area": "Koramangala",
  "priority": "high",
  "confidence": 82,
  "possibleRootCause": "Stormwater drainage blockage / overflow",
  "recommendedAction": "Inspect / clear the nearby drainage infrastructure first."
}
```

`cluster_score` is a `0..1` ratio. `confidence` (when present) is the same value
as a percentage, kept for display surfaces already built on it.

### RootCause

Required: `cluster_id, root_cause, confidence, evidence, priority,
affected_incidents, recommended_action`

```json
{
  "cluster_id": "CLS-003",
  "root_cause": "Stormwater drainage blockage / overflow",
  "confidence": 0.82,
  "priority": "high",
  "affected_incidents": ["INC-4471", "INC-4472", "INC-4475", "INC-4479"],
  "evidence": [
    {
      "id": "ev-1",
      "title": "Five waterlogging reports in 25 minutes",
      "source": "Citizen complaints",
      "timestamp": "2026-10-03T14:20:00+05:30",
      "strength": "strong"
    }
  ],
  "recommended_action": {
    "action": "Clear the storm drain at the Koramangala 5th Block junction",
    "why": "Drain level and waterlogging reports coincide in one window.",
    "priority": "high",
    "affectedArea": "Koramangala 5th Block",
    "evidenceCount": 5,
    "cta": { "label": "View affected area on map", "href": "#affected-area" }
  },
  "number": 3,
  "area": "Koramangala",
  "status": "High Priority",
  "summary": "Four incidents grouped around Koramangala.",
  "center": { "lat": 12.9358, "lng": 77.6271, "radius": 900 },
  "graph": { "hypothesis": { "label": "...", "description": "..." }, "signals": [] },
  "timeline": [],
  "timelineCaption": ""
}
```

`confidence` is a `0..1` ratio describing **evidential support, never
certainty**. `recommended_action` is an object; `getRecommendations` returns it
as a one-item array.

## Errors

Failures reject with `ApiError`:

```js
{ name: 'ApiError', message: string, status: number, code: string, details?, cause? }
```

`status === 0` means the backend was unreachable. `code === 'ABORTED'` means the
caller cancelled (never masked by the fallback) or the request timed out.

## UI states

Every screen built on this contract handles four states: **loading** (initial,
keeps prior data while refreshing), **error** (with retry), **empty** (explained,
never silent), and **partial** (the `degraded` list on `getOverview`). The
`useResource` hook and the `ResourceState` component provide these uniformly, and
the data hooks in `src/hooks/useApi.js` wrap each interface method.

## Versioning

`CONTRACT_VERSION` is exported from `@/services`. Bump it in `contract.js` for
any breaking field change and note the change here.
