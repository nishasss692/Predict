Bengaluru Civic Brain — API Documentation
Base URL: http://127.0.0.1:8000
Swagger UI: http://127.0.0.1:8000/docs
Main frontend flow
GET /clusters/
    ↓
GET /clusters/{cluster_id}/evidence
    ↓
GET /root-cause/{cluster_id}
    ↓
GET /root-cause/{cluster_id}/recommendation
1. Clusters
GET /clusters/
Returns detected civic incident clusters.
Example response:
[
  {
    "cluster_id": "3_8",
    "incident_ids": ["INC071", "INC072"],
    "centroid_lat": 12.9352,
    "centroid_lon": 77.6245,
    "start_time": "2026-09-20T18:00:00",
    "end_time": "2026-09-20T19:56:00",
    "categories": ["waterlogging", "sewage", "traffic_disruption", "pothole"],
    "cluster_score": 30
  }
]
Fields: cluster_id, incident_ids, centroid_lat, centroid_lon, start_time, end_time, categories, cluster_score.
POST /clusters/save
Persists a cluster result. Request body uses the same structure as a cluster response.
2. Cluster Evidence
GET /clusters/{cluster_id}/evidence
Example:
GET /clusters/3_8/evidence
Response:
{
  "cluster_id": "3_8",
  "evidence": {
    "incidents": [],
    "weather": [],
    "sensors": [],
    "traffic": []
  }
}
Incident records contain:
{
  "incident_id": "INC071",
  "area": "Koramangala",
  "type": "waterlogging",
  "description": "Waterlogging reported in Koramangala",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "timestamp": "2026-09-20T18:00:00",
  "severity": "high"
}
Weather records contain:
{
  "timestamp": "2026-09-20T18:00:00",
  "rainfall_mm": 62.72,
  "temperature_c": 28.89
}
Sensor records contain:
{
  "sensor_id": "S-KORAMANGALA",
  "area": "Koramangala",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "timestamp": "2026-09-20T18:00:00",
  "water_level": 99.35,
  "status": "critical"
}
Traffic records contain:
{
  "area": "Koramangala",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "timestamp": "2026-09-20T18:00:00",
  "average_speed_kmh": 14.17,
  "congestion_level": "severe"
}
3. Root Cause
GET /root-cause/{cluster_id}
Example:
GET /root-cause/3_8
Response:
{
  "cluster_id": "3_8",
  "root_cause": "Possible drainage blockage or overflow",
  "confidence": 1,
  "evidence": [
    "15 waterlogging incidents",
    "7 sewage incidents",
    "7 traffic disruption incidents",
    "Heavy rainfall detected",
    "Critical drain water level detected",
    "Severe traffic disruption detected"
  ],
  "priority": "high",
  "affected_incidents": ["INC071", "INC072"],
  "recommended_action": "Inspect and clear drainage infrastructure"
}
Fields:
- cluster_id — cluster identifier
- root_cause — root-cause hypothesis
- confidence — confidence value
- evidence — supporting signals
- priority — assigned priority
- affected_incidents — affected incident IDs
- recommended_action — suggested intervention
POST /root-cause/analyze
Request:
{
  "cluster_id": "3_8"
}
Returns the root-cause response above.
POST /root-cause/save
Persists a root-cause result.
4. Recommendation
GET /root-cause/{cluster_id}/recommendation
Example:
GET /root-cause/3_8/recommendation
Response:
{
  "cluster_id": "3_8",
  "recommended_action": "Inspect and clear drainage infrastructure"
}
POST /root-cause/recommendation/save
Request:
{
  "cluster_id": "3_8",
  "recommended_action": "Inspect and clear drainage infrastructure"
}
5. Incidents
GET /incidents/
Returns incident records.
POST /incidents/
Creates an incident.
Current incident representation:
{
  "incident_id": "INC001",
  "area": "Koramangala",
  "type": "waterlogging",
  "description": "Waterlogging reported in Koramangala",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "timestamp": "2026-09-20T18:00:00",
  "severity": "high"
}
The backend creates the PostGIS point from longitude/latitude when creating an incident.
6. Context Data
GET /weather/
Returns weather records with:
timestamp, rainfall_mm, temperature_c.
GET /sensors/
Returns sensor records with:
sensor_id, area, latitude, longitude, timestamp, water_level, status.
GET /traffic/
Returns traffic records with:
area, latitude, longitude, timestamp, average_speed_kmh, congestion_level.
7. Infrastructure
GET /infrastructure/
Returns infrastructure records.
Current representation:
{
  "infrastructure_id": "INF008",
  "type": "stormwater_drain",
  "area": "Koramangala",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "status": "blocked"
}
8. Frontend integration
Recommended sequence:
1. Call GET /clusters/.
2. Display the returned clusters on the dashboard/map.
3. When a cluster is selected, call GET /clusters/{cluster_id}/evidence.
4. Display incident, weather, sensor and traffic evidence.
5. Call GET /root-cause/{cluster_id} and display root cause, confidence, priority and evidence.
6. Call GET /root-cause/{cluster_id}/recommendation and display the recommended action.
9. Error handling
For cluster/root-cause/recommendation lookups, a missing resource returns 404.
The frontend should handle:
- 200 — display the response
- 404 — requested resource is unavailable
- 500 — backend/server error
10. Live API documentation
Use Swagger at:
http://127.0.0.1:8000/docs