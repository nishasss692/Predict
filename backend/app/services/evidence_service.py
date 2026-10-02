from datetime import timedelta

from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.models.weather import Weather
from app.models.sensor import Sensor
from app.models.traffic import Traffic


def get_cluster_evidence(
    db: Session,
    incident_ids: list[str]
):
    incidents = (
        db.query(Incident)
        .filter(Incident.incident_id.in_(incident_ids))
        .all()
    )

    if not incidents:
        return {
            "incidents": [],
            "weather": [],
            "sensors": [],
            "traffic": []
        }

    timestamps = [incident.timestamp for incident in incidents]

    start_time = min(timestamps)
    end_time = max(timestamps)

    window_start = start_time - timedelta(hours=1)
    window_end = end_time + timedelta(hours=1)

    areas = list({
        incident.area
        for incident in incidents
    })

    weather = (
        db.query(Weather)
        .filter(
            Weather.timestamp >= window_start,
            Weather.timestamp <= window_end
        )
        .all()
    )

    sensors = (
        db.query(Sensor)
        .filter(
            Sensor.area.in_(areas),
            Sensor.timestamp >= window_start,
            Sensor.timestamp <= window_end
        )
        .all()
    )

    traffic = (
        db.query(Traffic)
        .filter(
            Traffic.area.in_(areas),
            Traffic.timestamp >= window_start,
            Traffic.timestamp <= window_end
        )
        .all()
    )

    return {
        "incidents": [
            {
                "incident_id": i.incident_id,
                "area": i.area,
                "type": i.type,
                "description": i.description,
                "latitude": i.latitude,
                "longitude": i.longitude,
                "timestamp": i.timestamp,
                "severity": i.severity,
            }
            for i in incidents
        ],

        "weather": [
            {
                "timestamp": w.timestamp,
                "rainfall_mm": w.rainfall_mm,
                "temperature_c": w.temperature_c,
            }
            for w in weather
        ],

        "sensors": [
            {
                "sensor_id": s.sensor_id,
                "area": s.area,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "timestamp": s.timestamp,
                "water_level": s.water_level,
                "status": s.status,
            }
            for s in sensors
        ],

        "traffic": [
            {
                "area": t.area,
                "latitude": t.latitude,
                "longitude": t.longitude,
                "timestamp": t.timestamp,
                "average_speed_kmh": t.average_speed_kmh,
                "congestion_level": t.congestion_level,
            }
            for t in traffic
        ]
    }